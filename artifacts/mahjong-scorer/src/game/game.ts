import { BMJA_PROFILE_REF, resolveRulesProfile } from './ruleset';
import { assertDetailedWinnerMatchesOutcome } from './hand-scorer-handoff';
import type {
  ConfirmedHand,
  DetailedHandRecord,
  GameLength,
  GamePlayer,
  GameSetup,
  GameState,
  PlayerAmounts,
  PlayerScoreRecords,
  PlayerScoreRecord,
  RoundInput,
  RoundIncident,
  RulesProfileRef,
  SeatAssignments,
} from './types';

const cloneAmounts = (amounts: PlayerAmounts): PlayerAmounts => ({ ...amounts });
const cloneSeats = (seats: SeatAssignments): SeatAssignments => ({ ...seats });
const cloneRulesProfile = (profile: RulesProfileRef): RulesProfileRef => ({
  id: profile.id,
  version: profile.version,
});
const cloneIncidents = (incidents: RoundIncident[] | undefined): RoundIncident[] =>
  incidents ? incidents.map((incident) => ({ ...incident })) : [];

const cloneDetailedHandRecord = (
  record: DetailedHandRecord,
): DetailedHandRecord => ({
  ...record,
  hand: {
    ...record.hand,
    sets: record.hand.sets.map((handSet) => ({
      ...handSet,
      tile: { ...handSet.tile },
      blankTileIds: handSet.blankTileIds ? [...handSet.blankTileIds] : undefined,
    })),
    looseTiles: record.hand.looseTiles?.map((tile) => ({ ...tile })),
    remainingTiles: record.hand.remainingTiles?.map((tile) => ({ ...tile })),
    ungroupedBlankTiles: record.hand.ungroupedBlankTiles?.map((blank) => ({ ...blank })),
    bonusTiles: record.hand.bonusTiles.map((tile) => ({ ...tile })),
    winningTileProvenance: record.hand.winningTileProvenance
      ? {
          tile: { ...record.hand.winningTileProvenance.tile },
          target: { ...record.hand.winningTileProvenance.target },
        }
      : undefined,
    winningEventEvidence: record.hand.winningEventEvidence
      ? { ...record.hand.winningEventEvidence }
      : undefined,
  },
  context: { ...record.context },
  breakdown: {
    ...record.breakdown,
    // Previous saved detailed records predate explicit evidence completeness;
    // they could only contain fully entered non-winning hands.
    evidenceCompleteness: record.breakdown.evidenceCompleteness ?? 'complete',
    validationErrors: [...record.breakdown.validationErrors],
    pointRules: record.breakdown.pointRules.map((rule) => ({ ...rule })),
    doubleRules: record.breakdown.doubleRules.map((rule) => ({ ...rule })),
    specialHands: record.breakdown.specialHands.map((hand) => ({ ...hand })),
    calculationComponents: record.breakdown.calculationComponents.map(
      (component) => ({ ...component }),
    ),
  },
});

const cloneScoreRecord = (record: PlayerScoreRecord): PlayerScoreRecord =>
  record.source === 'detailed-scorer'
    ? cloneDetailedHandRecord(record)
    : { ...record };

const validateSetup = (setup: GameSetup) => {
  resolveRulesProfile(setup.rulesProfile);
  if (setup.players.length !== 4) {
    throw new Error('A game requires exactly four players.');
  }
  if (
    new Set(setup.players.map((player) => player.id)).size !== 4 ||
    new Set(setup.players.map((player) => player.name.trim())).size !== 4
  ) {
    throw new Error('Player names and ids must be unique.');
  }
  if (setup.players.some((player) => !player.name.trim())) {
    throw new Error('Every player needs a name.');
  }
  if (new Set(Object.values(setup.startingSeats)).size !== 4) {
    throw new Error('Each starting wind must be assigned exactly once.');
  }
};

const eastPlayerId = (seats: SeatAssignments) => {
  const east = Object.entries(seats).find(([, wind]) => wind === 'east');
  if (!east) throw new Error('A game must always have an East player.');
  return east[0];
};

const normaliseScoreRecords = (
  state: GameState,
  round: RoundInput,
): PlayerScoreRecords =>
  Object.fromEntries(
    state.players.map((player) => {
      const score = round.scores[player.id];
      const record = round.scoreRecords?.[player.id];
      if (!record) {
        return [
          player.id,
          { source: 'manual' as const, finalScore: score },
        ];
      }
      if (
        record.finalScore !== score ||
        (record.source === 'detailed-scorer' &&
          record.breakdown.finalScore !== score)
      ) {
        throw new Error(
          `Score metadata for ${player.name} does not match the round score.`,
        );
      }
      assertDetailedWinnerMatchesOutcome(round.outcome, player.id, record);
      return [player.id, cloneScoreRecord(record)];
    }),
  );

export const createBmjaGame = (
  players: GamePlayer[],
  startingSeats: SeatAssignments,
  startingBalances?: PlayerAmounts,
  gameLength: GameLength = 'full-game',
  rulesProfile: RulesProfileRef = BMJA_PROFILE_REF,
): GameState => {
  const ruleset = resolveRulesProfile(rulesProfile);
  const balances =
    startingBalances ??
    Object.fromEntries(players.map((player) => [player.id, 0]));
  const setup: GameSetup = {
    rulesProfile: cloneRulesProfile(rulesProfile),
    players: players.map((player) => ({ ...player })),
    startingSeats: cloneSeats(startingSeats),
    startingPrevailingWind: 'east',
    startingBalances: cloneAmounts(balances),
    gameLength,
  };
  validateSetup(setup);
  return {
    rulesetId: ruleset.id,
    setup,
    players: setup.players.map((player) => ({ ...player })),
    seats: cloneSeats(startingSeats),
    prevailingWind: setup.startingPrevailingWind,
    eastCycleStartPlayerId: eastPlayerId(startingSeats),
    balances: cloneAmounts(balances),
    handHistory: [],
    currentHandMode: 'normal',
    isComplete: false,
  };
};

const applyRound = (state: GameState, round: RoundInput): GameState => {
  if (state.isComplete) {
    throw new Error('Game is already complete.');
  }

  const submittedRound: RoundInput = round.outcome.type === 'draw'
    ? {
        outcome: round.outcome,
        scores: Object.fromEntries(state.players.map((player) => [player.id, 0])),
        scoreRecords: {},
        incidents: cloneIncidents(round.incidents),
      }
    : { ...round, incidents: cloneIncidents(round.incidents) };
  const ruleset = resolveRulesProfile(state.setup.rulesProfile);
  if (!ruleset.prepareRound && submittedRound.incidents && submittedRound.incidents.length > 0) {
    throw new Error(`${ruleset.name} does not support round incidents.`);
  }
  const appliedRound = ruleset.prepareRound
    ? ruleset.prepareRound(state.players, state.seats, submittedRound)
    : submittedRound;
  const settlement = ruleset.settleRound(
    state.players,
    state.seats,
    appliedRound,
  );
  const scoreRecords = normaliseScoreRecords(state, appliedRound);
  const runningTotals = Object.fromEntries(
    state.players.map((player) => [
      player.id,
      state.balances[player.id] + settlement.changes[player.id],
    ]),
  );
  const progression = ruleset.progressGame(
    state.players,
    {
      seats: state.seats,
      prevailingWind: state.prevailingWind,
      eastCycleStartPlayerId: state.eastCycleStartPlayerId,
    },
    appliedRound.outcome,
  );
  const nextHandMode = ruleset.nextHandMode(state.currentHandMode, appliedRound.outcome);

  let isComplete = false;
  if (progression.prevailingWindAdvanced) {
    if (state.setup.gameLength === 'one-round') {
      isComplete = true;
    } else if (state.setup.gameLength === 'full-game' && state.prevailingWind === 'north') {
      isComplete = true;
    }
  }

  const confirmed: ConfirmedHand = {
    handNumber: state.handHistory.length + 1,
    outcome: appliedRound.outcome,
    handMode: state.currentHandMode,
    nextHandMode,
    scores: cloneAmounts(appliedRound.scores),
    scoreRecords,
    incidents: cloneIncidents(appliedRound.incidents),
    eastPlayerId: eastPlayerId(state.seats),
    prevailingWind: state.prevailingWind,
    seats: cloneSeats(state.seats),
    settlement,
    runningTotals: cloneAmounts(runningTotals),
    progressionAfter: {
      seats: cloneSeats(progression.seats),
      prevailingWind: progression.prevailingWind,
      eastCycleStartPlayerId: progression.eastCycleStartPlayerId,
    },
  };

  return {
    ...state,
    seats: cloneSeats(progression.seats),
    prevailingWind: progression.prevailingWind,
    eastCycleStartPlayerId: progression.eastCycleStartPlayerId,
    balances: runningTotals,
    handHistory: [...state.handHistory, confirmed],
    currentHandMode: nextHandMode,
    isComplete,
  };
};

export const confirmHand = (state: GameState, round: RoundInput): GameState =>
  applyRound(state, round);

export const replayGame = (
  setup: GameSetup,
  rounds: RoundInput[],
): GameState => {
  let state = createBmjaGame(
    setup.players,
    setup.startingSeats,
    setup.startingBalances,
    setup.gameLength,
    setup.rulesProfile,
  );
  for (const round of rounds) state = applyRound(state, round);
  return state;
};

export const undoLastHand = (state: GameState): GameState =>
  replayGame(
    state.setup,
    state.handHistory.slice(0, -1).map(({ outcome, scores, scoreRecords, incidents }) => ({
      outcome,
      scores,
      scoreRecords,
      incidents,
    })),
  );
