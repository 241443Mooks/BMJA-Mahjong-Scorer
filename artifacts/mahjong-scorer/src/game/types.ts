import type { MahjongHand, ScoreBreakdown, Wind } from '../scoring';

export const GAME_WINDS: Wind[] = ['east', 'south', 'west', 'north'];

export type PlayerId = string;

export type GamePlayer = {
  id: PlayerId;
  name: string;
};

export type SeatAssignments = Record<PlayerId, Wind>;
export type PlayerAmounts = Record<PlayerId, number>;

export type HandOutcome =
  | { type: 'win'; winnerId: PlayerId }
  | { type: 'draw' };

export type RoundInput = {
  outcome: HandOutcome;
  scores: PlayerAmounts;
};

export type SettlementTransaction = {
  fromPlayerId: PlayerId;
  toPlayerId: PlayerId;
  amount: number;
  baseAmount: number;
  eastMultiplier: 1 | 2;
  reason: 'winner-payment' | 'score-difference';
};

export type SettlementResult = {
  transactions: SettlementTransaction[];
  changes: PlayerAmounts;
  zeroSum: boolean;
};

export type ProgressionState = {
  seats: SeatAssignments;
  prevailingWind: Wind;
  eastCycleStartPlayerId: PlayerId;
};

export type ProgressionResult = ProgressionState & {
  seatsRotated: boolean;
  prevailingWindAdvanced: boolean;
};

export type ConfirmedHand = {
  handNumber: number;
  outcome: HandOutcome;
  scores: PlayerAmounts;
  eastPlayerId: PlayerId;
  prevailingWind: Wind;
  seats: SeatAssignments;
  settlement: SettlementResult;
  runningTotals: PlayerAmounts;
  progressionAfter: ProgressionState;
};

export type GameLength = 'one-round' | 'full-game';

export type GameSetup = {
  players: GamePlayer[];
  startingSeats: SeatAssignments;
  startingPrevailingWind: Wind;
  startingBalances: PlayerAmounts;
  gameLength: GameLength;
};

export type GameState = {
  rulesetId: 'bmja';
  setup: GameSetup;
  players: GamePlayer[];
  seats: SeatAssignments;
  prevailingWind: Wind;
  eastCycleStartPlayerId: PlayerId;
  balances: PlayerAmounts;
  handHistory: ConfirmedHand[];
  isComplete: boolean;
};

export type HandScoreInput = {
  hand: MahjongHand;
  playerWind: Wind;
  prevailingWind: Wind;
  limit?: number;
};

export type GameRuleset = {
  id: 'bmja';
  name: string;
  defaultLimit: number;
  scoreHand: (input: HandScoreInput) => ScoreBreakdown;
  settleRound: (
    players: GamePlayer[],
    seats: SeatAssignments,
    round: RoundInput,
  ) => SettlementResult;
  progressGame: (
    players: GamePlayer[],
    current: ProgressionState,
    outcome: HandOutcome,
  ) => ProgressionResult;
};

export type HandScorerContext = {
  playerId: string;
  playerName: string;
  playerWind: Wind;
  prevailingWind: Wind;
  isWinner: boolean;
  limit: number;
};

export type HandScorerResult = {
  playerId: string;
  score: number;
  isWinner: boolean;
};

export type RoundScoreDraft = Partial<PlayerAmounts>;