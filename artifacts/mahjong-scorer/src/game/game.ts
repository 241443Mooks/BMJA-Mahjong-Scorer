import { BMJA_PROFILE_REF } from './ruleset';
import { assertDetailedWinnerMatchesOutcome } from './hand-scorer-handoff';
import { mapCurrentRuntimeProgression, mapCurrentRuntimeSettlement } from '../rules-platform/current-runtime-compat';
import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import type { McrRoundResolution } from '../rules-platform/mcr-strategies';
import type {
  ConfirmedHand,
  ClassicalConfirmedHand,
  ClassicalGameState,
  DetailedHandRecord,
  GameLength,
  GameRoundInput,
  GamePlayer,
  GameSetup,
  GameState,
  PlayerAmounts,
  PlayerScoreRecords,
  PlayerScoreRecord,
  McrAcceptedScoreRecord,
  McrRoundInput,
  McrSettlementResult,
  HandOutcome,
  ProgressionState,
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
const cloneBuzzardIncidents = (incidents: RoundInput['buzzardIncidents']) =>
  incidents?.map((incident) => ({ ...incident }));
const cloneProfileScoreResults = (results: RoundInput['profileScoreResults']) =>
  results ? Object.fromEntries(Object.entries(results).map(([id, result]) => [id, { ...result! }])) : undefined;

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
    : record.source === 'mcr-detailed-scorer'
      ? cloneMcrAcceptedScoreRecord(record)
      : { ...record };

const cloneMcrAcceptedScoreRecord = (record: McrAcceptedScoreRecord): McrAcceptedScoreRecord => ({
  ...record,
  rulesProfile: { ...record.rulesProfile },
  hand: structuredClone(record.hand),
  input: structuredClone(record.input),
  result: structuredClone(record.result),
});

const validateSetup = (setup: GameSetup) => {
  const compiled = getCurrentCompiledRulesRuntime(setup.rulesProfile);
  if (compiled.grammar === 'classical-points-doubles') {
    if (!Number.isFinite(setup.tableLimit) || setup.tableLimit! <= 0) throw new Error('A game requires a finite positive table limit.');
  } else {
    if (setup.tableLimit !== undefined) throw new Error('Pattern-accumulator games do not use a table limit.');
    if (setup.gameLength !== 'full-game') throw new Error('Pattern-accumulator games require the four-round game.');
    if (compiled.artifact.profile.identity.id !== 'mcr-wmo-2006' || compiled.artifact.profile.identity.version !== '0.1' || compiled.artifact.rulesFingerprint !== '8044ee6ee883192bae97e83a67380f6c0bff999179df93229fc9daa4308a7ace') throw new Error('The selected pattern-accumulator game runtime is not the sealed C2A profile.');
  }
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
        record.source === 'mcr-detailed-scorer' ||
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

export const createGame = (
  players: GamePlayer[],
  startingSeats: SeatAssignments,
  startingBalances?: PlayerAmounts,
  gameLength: GameLength = 'full-game',
  rulesProfile: RulesProfileRef = BMJA_PROFILE_REF,
  tableLimit?: number,
): GameState => {
  const balances =
    startingBalances ??
    Object.fromEntries(players.map((player) => [player.id, 0]));
  const compiled = getCurrentCompiledRulesRuntime(rulesProfile);
  const resolvedTableLimit = compiled.grammar === 'classical-points-doubles'
    ? tableLimit ?? compiled.runtime.defaultTableLimit
    : undefined;
  if (compiled.grammar === 'pattern-accumulator' && tableLimit !== undefined) throw new Error('Pattern-accumulator games do not use a table limit.');
  const setup: GameSetup = {
    rulesProfile: cloneRulesProfile(rulesProfile),
    players: players.map((player) => ({ ...player })),
    startingSeats: cloneSeats(startingSeats),
    startingPrevailingWind: 'east',
    startingBalances: cloneAmounts(balances),
    gameLength,
    ...(resolvedTableLimit !== undefined ? { tableLimit: resolvedTableLimit } : {}),
  };
  validateSetup(setup);
  return {
    rulesetId: rulesProfile.id,
    setup,
    runtimeFingerprint: compiled.artifact.rulesFingerprint,
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

/** Backwards-compatible Classical entry point. New profile-aware callers use createGame. */
export const createBmjaGame = (...args: Parameters<typeof createGame>): ClassicalGameState => {
  const state = createGame(...args);
  if (getCurrentCompiledRulesRuntime(state.setup.rulesProfile).grammar !== 'classical-points-doubles' || state.setup.tableLimit === undefined) {
    throw new Error('createBmjaGame only creates Classical games.');
  }
  return state as ClassicalGameState;
};

const applyRound = (state: GameState, round: GameRoundInput): GameState => {
  if (state.isComplete) {
    throw new Error('Game is already complete.');
  }

  const compiled = getCurrentCompiledRulesRuntime(state.setup.rulesProfile);
  if (compiled.grammar === 'pattern-accumulator') return applyMcrRound(state, round as McrRoundInput, compiled);
  if (!('outcome' in round)) throw new Error('Round input grammar does not match the active game.');
  const classicalRound = round as RoundInput;
  const submittedRound: RoundInput = classicalRound.outcome.type === 'draw'
    ? {
        outcome: classicalRound.outcome,
        scores: Object.fromEntries(state.players.map((player) => [player.id, 0])),
        scoreRecords: {},
        incidents: cloneIncidents(classicalRound.incidents),
        buzzardIncidents: cloneBuzzardIncidents(classicalRound.buzzardIncidents),
        profileScoreResults: cloneProfileScoreResults(classicalRound.profileScoreResults),
      }
    : { ...classicalRound, incidents: cloneIncidents(classicalRound.incidents), buzzardIncidents: cloneBuzzardIncidents(classicalRound.buzzardIncidents), profileScoreResults: cloneProfileScoreResults(classicalRound.profileScoreResults) };
  const runtime = compiled.runtime;
  if (state.setup.rulesProfile.id !== 'buzzard-2000' && ((submittedRound.buzzardIncidents?.length ?? 0) > 0 || Object.keys(submittedRound.profileScoreResults ?? {}).length > 0)) {
    throw new Error('This rules profile does not support Buzzard round evidence.');
  }
  if (!runtime.prepareRound && ((submittedRound.incidents?.length ?? 0) > 0 || (submittedRound.buzzardIncidents?.length ?? 0) > 0 || Object.keys(submittedRound.profileScoreResults ?? {}).length > 0)) {
    throw new Error('This rules profile does not support round incidents.');
  }
  const appliedRound = runtime.prepareRound
    ? runtime.prepareRound({ players: state.players, seats: state.seats, round: submittedRound, tableLimit: state.setup.tableLimit! } as Parameters<NonNullable<typeof runtime.prepareRound>>[0])
    : submittedRound;
  const settlement = mapCurrentRuntimeSettlement(
    state.players.map(({ id }) => id),
    runtime.settleRound({ players: state.players, seats: state.seats, round: appliedRound, tableLimit: state.setup.tableLimit! } as Parameters<typeof runtime.settleRound>[0]),
  );
  const scoreRecords = normaliseScoreRecords(state, appliedRound);
  const runningTotals = Object.fromEntries(
    state.players.map((player) => [
      player.id,
      state.balances[player.id] + settlement.changes[player.id],
    ]),
  );
  const progression = mapCurrentRuntimeProgression(runtime.progressGame({
    players: state.players,
    current: {
      seats: state.seats,
      prevailingWind: state.prevailingWind,
      eastCycleStartPlayerId: state.eastCycleStartPlayerId,
    },
    outcome: appliedRound.outcome,
  }));
  const nextHandMode = runtime.nextHandMode({
    current: state.currentHandMode,
    outcome: appliedRound.outcome,
  });
  const isComplete = runtime.evaluateGameEnd({
    gameLength: state.setup.gameLength,
    previousPrevailingWind: state.prevailingWind,
    progression,
  }).complete;

  const confirmed: ConfirmedHand = {
    handNumber: state.handHistory.length + 1,
    outcome: appliedRound.outcome,
    handMode: state.currentHandMode,
    nextHandMode,
    scores: cloneAmounts(appliedRound.scores),
    scoreRecords,
    incidents: cloneIncidents(appliedRound.incidents),
    buzzardIncidents: cloneBuzzardIncidents(appliedRound.buzzardIncidents),
    profileScoreResults: cloneProfileScoreResults(appliedRound.profileScoreResults),
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

const emptyAmounts = (players: GamePlayer[]): PlayerAmounts => Object.fromEntries(players.map(({ id }) => [id, 0]));

const applyMcrRound = (
  state: GameState,
  round: McrRoundInput,
  compiled: Extract<ReturnType<typeof getCurrentCompiledRulesRuntime>, { grammar: 'pattern-accumulator' }>,
): GameState => {
  if (state.runtimeFingerprint !== compiled.artifact.rulesFingerprint) throw new Error('Active MCR game runtime fingerprint changed.');
  const ids = state.players.map(({ id }) => id);
  const outcome = round.mcrOutcome;
  if (!outcome || (outcome.type !== 'mcr-win' && outcome.type !== 'mcr-draw')) throw new Error('MCR round outcome is invalid.');
  const zeroes = emptyAmounts(state.players);
  if (Object.keys(round.scores).length !== ids.length || Object.keys(round.scores).some((id) => !ids.includes(id))) throw new Error('MCR numeric summary must contain only the four game players.');
  const summary = Object.fromEntries(ids.map((id) => [id, round.scores[id]]));
  if (Object.keys(summary).length !== ids.length || ids.some((id) => !Number.isFinite(summary[id]))) throw new Error('MCR numeric summary must contain one finite score for every player.');
  let accepted: McrAcceptedScoreRecord | undefined;
  if (outcome.type === 'mcr-draw') {
    if (round.scoreRecords && Object.keys(round.scoreRecords).length > 0) throw new Error('MCR draws cannot carry accepted scores.');
    if (ids.some((id) => summary[id] !== 0)) throw new Error('MCR draw summaries must be zero.');
  } else {
    if (!ids.includes(outcome.winnerId)) throw new Error('MCR winner must belong to this game.');
    if (outcome.winSource === 'discard') {
      if (!outcome.discarderId || !ids.includes(outcome.discarderId) || outcome.discarderId === outcome.winnerId) throw new Error('MCR discard win requires a different in-game discarder.');
    } else if (outcome.discarderId !== undefined) throw new Error('MCR self-draw cannot include a discarder.');
    accepted = round.scoreRecords?.[outcome.winnerId] as McrAcceptedScoreRecord | undefined;
    if (!accepted || accepted.source !== 'mcr-detailed-scorer' || accepted.playerId !== outcome.winnerId || Object.keys(round.scoreRecords ?? {}).length !== 1) throw new Error('MCR wins require exactly one accepted detailed winner score.');
    if (accepted.rulesProfile.id !== state.setup.rulesProfile.id || accepted.rulesProfile.version !== state.setup.rulesProfile.version || accepted.rulesProfile.id !== compiled.artifact.profile.identity.id || accepted.rulesProfile.version !== compiled.artifact.profile.identity.version || accepted.rulesFingerprint !== compiled.artifact.rulesFingerprint || accepted.rulesFingerprint !== state.runtimeFingerprint) throw new Error('Accepted MCR score profile/version/fingerprint does not match the active game.');
    const result = accepted.result;
    if (accepted.input.context.winSource !== outcome.winSource || result.grammar !== 'pattern-accumulator' || result.profile.id !== accepted.rulesProfile.id || result.profile.version !== accepted.rulesProfile.version || result.rulesFingerprint !== accepted.rulesFingerprint || result.legal !== true || result.disposition.kind !== 'scored' || result.result.unit !== 'points' || !Number.isFinite(result.result.total) || !Number.isInteger(result.result.total) || accepted.finalScore !== result.result.total) throw new Error('Accepted MCR result is invalid or inconsistent.');
    if (summary[outcome.winnerId] !== result.result.total || ids.some((id) => id !== outcome.winnerId && summary[id] !== 0)) throw new Error('MCR numeric summary does not match the accepted result.');
  }
  const resolved: McrRoundResolution = {
    outcome: outcome.type === 'mcr-draw'
      ? { kind: 'mcr-draw', payload: {} }
      : { kind: 'mcr-win', payload: { winnerId: outcome.winnerId, winSource: outcome.winSource, ...(outcome.winSource === 'discard' ? { discarderId: outcome.discarderId } : {}) } },
    acceptedScores: accepted ? [{ playerId: accepted.playerId, score: accepted.result }] : [],
  };
  const neutral = compiled.runtime.settleRound({ participants: ids, round: resolved });
  const changes = emptyAmounts(state.players);
  const transactions: McrSettlementResult['transactions'] = neutral.map((transaction) => {
    const metadata = transaction.metadata;
    if (!metadata || typeof metadata.basicPoints !== 'number' || metadata.fixedComponent !== 8 || (metadata.winSource !== 'discard' && metadata.winSource !== 'self-draw') || !['discarder', 'other-player', 'non-winner'].includes(String(metadata.payerRole))) throw new Error('MCR settlement metadata is invalid.');
    if (!ids.includes(transaction.from) || !ids.includes(transaction.to) || !Number.isFinite(transaction.amount)) throw new Error('MCR settlement player or amount is invalid.');
    changes[transaction.from]! -= transaction.amount;
    changes[transaction.to]! += transaction.amount;
    return { fromPlayerId: transaction.from, toPlayerId: transaction.to, amount: transaction.amount, reasonId: transaction.reasonId, basicPoints: metadata.basicPoints, fixedComponent: 8, winSource: metadata.winSource, payerRole: metadata.payerRole as McrSettlementResult['transactions'][number]['payerRole'] };
  });
  const settlement: McrSettlementResult = { transactions, changes, zeroSum: Object.values(changes).reduce((sum, value) => sum + value, 0) === 0 };
  if (!settlement.zeroSum) throw new Error('MCR settlement must be zero-sum.');
  const current = { seats: state.seats, prevailingWind: state.prevailingWind, dealerCycleStartPlayerId: state.eastCycleStartPlayerId };
  const progression = compiled.runtime.progressGame({ participants: ids, current, round: resolved });
  const gameEnd = compiled.runtime.evaluateGameEnd({ participants: ids, previous: current, progression });
  const progressionAfter: ProgressionState = { seats: { ...progression.nextState.seats }, prevailingWind: progression.nextState.prevailingWind, eastCycleStartPlayerId: progression.nextState.dealerCycleStartPlayerId };
  const runningTotals = Object.fromEntries(ids.map((id) => [id, state.balances[id]! + changes[id]! ]));
  const recordMap: PlayerScoreRecords = accepted ? { [accepted.playerId]: cloneMcrAcceptedScoreRecord(accepted) } : {};
  const confirmed: ConfirmedHand = {
    handNumber: state.handHistory.length + 1, outcome, mcrReplay: { mcrOutcome: structuredClone(outcome), scores: { ...summary }, scoreRecords: recordMap },
    handMode: 'normal', nextHandMode: 'normal', scores: { ...summary }, scoreRecords: recordMap, incidents: [],
    eastPlayerId: eastPlayerId(state.seats), prevailingWind: state.prevailingWind, seats: cloneSeats(state.seats), settlement,
    runningTotals, progressionAfter,
  };
  return { ...state, seats: cloneSeats(progressionAfter.seats), prevailingWind: progressionAfter.prevailingWind, eastCycleStartPlayerId: progressionAfter.eastCycleStartPlayerId, balances: runningTotals, handHistory: [...state.handHistory, confirmed], currentHandMode: 'normal', isComplete: gameEnd.complete };
};

export function confirmHand(state: ClassicalGameState, round: RoundInput): ClassicalGameState;
export function confirmHand(state: GameState, round: GameRoundInput): GameState;
export function confirmHand(state: GameState, round: GameRoundInput): GameState {
  return applyRound(state, round);
}

export function replayGame(
  setup: GameSetup & { tableLimit: number },
  rounds: RoundInput[],
): ClassicalGameState;
export function replayGame(
  setup: GameSetup,
  rounds: GameRoundInput[],
): GameState;
export function replayGame(
  setup: GameSetup,
  rounds: GameRoundInput[],
): GameState {
  let state = createGame(
    setup.players,
    setup.startingSeats,
    setup.startingBalances,
    setup.gameLength,
    setup.rulesProfile,
    setup.tableLimit,
  );
  for (const round of rounds) state = applyRound(state, round);
  if (getCurrentCompiledRulesRuntime(state.setup.rulesProfile).grammar === 'classical-points-doubles') return state as ClassicalGameState;
  return state;
}

export function undoLastHand(state: ClassicalGameState): ClassicalGameState;
export function undoLastHand(state: GameState): GameState;
export function undoLastHand(state: GameState): GameState {
  const rounds: GameRoundInput[] = state.handHistory.slice(0, -1).map((hand): GameRoundInput => hand.mcrReplay
      ? structuredClone(hand.mcrReplay)
      : { outcome: hand.outcome as HandOutcome, scores: hand.scores, scoreRecords: hand.scoreRecords, incidents: hand.incidents, buzzardIncidents: hand.buzzardIncidents, profileScoreResults: hand.profileScoreResults });
  return replayGame(state.setup, rounds);
}
