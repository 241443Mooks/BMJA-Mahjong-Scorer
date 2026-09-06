import type {
  GameContext,
  MahjongHand,
  ScoreBreakdown,
  Wind,
} from '../scoring';

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
  scoreRecords?: PlayerScoreRecords;
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
  scoreRecords: PlayerScoreRecords;
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
  detailedHand?: DetailedHandRecord;
  requiresRecalculation?: boolean;
};

export type HandScorerResult = {
  playerId: string;
  score: number;
  isWinner: boolean;
  detailedHand: DetailedHandRecord;
};

export type RoundScoreDraft = Partial<PlayerAmounts>;

export type ManualScoreRecord = {
  source: 'manual';
  finalScore: number;
  requiresRecalculation?: false;
};

export type DetailedHandRecord = {
  source: 'detailed-scorer';
  hand: MahjongHand;
  context: GameContext;
  breakdown: ScoreBreakdown;
  finalScore: number;
  requiresRecalculation?: boolean;
};

export type PlayerScoreRecord = ManualScoreRecord | DetailedHandRecord;
export type PlayerScoreRecords = Partial<Record<PlayerId, PlayerScoreRecord>>;

export type RoundScoringDraft = {
  scores: RoundScoreDraft;
  scoreRecords: PlayerScoreRecords;
};

export type HandScorerLocalContext = {
  playerWind: Wind;
  prevailingWind: Wind;
  limit: number;
  isWinner: boolean;
};