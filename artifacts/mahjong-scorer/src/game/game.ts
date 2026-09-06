import { CURRENT_RULESET } from './ruleset';
import type {
  ConfirmedHand,
  GameLength,
  GamePlayer,
  GameSetup,
  GameState,
  PlayerAmounts,
  RoundInput,
  SeatAssignments,
} from './types';

const cloneAmounts = (amounts: PlayerAmounts): PlayerAmounts => ({ ...amounts });
const cloneSeats = (seats: SeatAssignments): SeatAssignments => ({ ...seats });

const validateSetup = (setup: GameSetup) => {
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

export const createBmjaGame = (
  players: GamePlayer[],
  startingSeats: SeatAssignments,
  startingBalances?: PlayerAmounts,
  gameLength: GameLength = 'full-game',
): GameState => {
  const balances =
    startingBalances ??
    Object.fromEntries(players.map((player) => [player.id, 0]));
  const setup: GameSetup = {
    players: players.map((player) => ({ ...player })),
    startingSeats: cloneSeats(startingSeats),
    startingPrevailingWind: 'east',
    startingBalances: cloneAmounts(balances),
    gameLength,
  };
  validateSetup(setup);
  return {
    rulesetId: CURRENT_RULESET.id,
    setup,
    players: setup.players.map((player) => ({ ...player })),
    seats: cloneSeats(startingSeats),
    prevailingWind: setup.startingPrevailingWind,
    eastCycleStartPlayerId: eastPlayerId(startingSeats),
    balances: cloneAmounts(balances),
    handHistory: [],
    isComplete: false,
  };
};

const applyRound = (state: GameState, round: RoundInput): GameState => {
  if (state.isComplete) {
    throw new Error('Game is already complete.');
  }

  const settlement = CURRENT_RULESET.settleRound(
    state.players,
    state.seats,
    round,
  );
  const runningTotals = Object.fromEntries(
    state.players.map((player) => [
      player.id,
      state.balances[player.id] + settlement.changes[player.id],
    ]),
  );
  const progression = CURRENT_RULESET.progressGame(
    state.players,
    {
      seats: state.seats,
      prevailingWind: state.prevailingWind,
      eastCycleStartPlayerId: state.eastCycleStartPlayerId,
    },
    round.outcome,
  );

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
    outcome: round.outcome,
    scores: cloneAmounts(round.scores),
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
  );
  for (const round of rounds) state = applyRound(state, round);
  return state;
};

export const undoLastHand = (state: GameState): GameState =>
  replayGame(
    state.setup,
    state.handHistory.slice(0, -1).map(({ outcome, scores }) => ({
      outcome,
      scores,
    })),
  );