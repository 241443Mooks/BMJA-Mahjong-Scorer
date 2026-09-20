import type {
  GameContext,
  MahjongHand,
  ScoreBreakdown,
  Wind,
} from '../scoring';

export const GAME_WINDS: Wind[] = ['east', 'south', 'west', 'north'];

export type PlayerId = string;

export type RulesProfileRef = {
  readonly id: string;
  readonly version: string;
};

export type GamePlayer = {
  id: PlayerId;
  name: string;
};

export type SeatAssignments = Record<PlayerId, Wind>;
export type PlayerAmounts = Record<PlayerId, number>;

export type HandOutcome =
  | { type: 'win'; winnerId: PlayerId }
  | { type: 'draw' };

export type HandMode = 'normal' | 'goulash';

export type RoundIncident =
  | { type: 'incorrect-hand'; playerId: PlayerId; condition: 'too-few' | 'too-many' }
  | { type: 'false-discard-name'; discarderId: PlayerId; claimantId: PlayerId; result: 'claimed' | 'mah-jong' }
  | { type: 'false-mah-jong'; declarerId: PlayerId; anyHandExposed: boolean }
  | { type: 'wrong-tile-claim'; playerId: PlayerId; correctedBeforeNextDraw: boolean }
  | { type: 'cannon'; liablePlayerId: PlayerId; danger?: 'third-dragon' | 'fourth-wind' | 'honours' | 'majors' | 'one-suit'; noChoiceAccepted: boolean };
export type BuzzardIncident =
  | { type: 'buzzard-dangerous-discard'; liablePlayerId: PlayerId; reason: 'one-suit' | 'three-dragons' | 'all-winds' | 'ones-and-nines' }
  | { type: 'buzzard-false-mah-jong'; declarerId: PlayerId; exposure: 'fully-exposed' | 'not-fully-exposed' };
export type ProfileScoreResult = { resultId: 'buzzard.incomplete-four-wind-limit' | 'buzzard.incomplete-three-dragon-limit' };

export type RoundInput = {
  outcome: HandOutcome;
  scores: PlayerAmounts;
  scoreRecords?: PlayerScoreRecords;
  incidents?: RoundIncident[];
  buzzardIncidents?: BuzzardIncident[];
  profileScoreResults?: Partial<Record<PlayerId, ProfileScoreResult>>;
};

export type SettlementTransaction = {
  fromPlayerId: PlayerId;
  toPlayerId: PlayerId;
  amount: number;
  baseAmount: number;
  eastMultiplier: 1 | 2;
  reason: 'winner-payment' | 'score-difference' | 'false-discard-name-penalty' | 'false-mah-jong-penalty' | 'false-name-mah-jong-liability' | 'cannon-liability' | 'buzzard-dangerous-discard-liability' | 'buzzard-false-mah-jong-penalty';
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
  handMode: HandMode;
  nextHandMode: HandMode;
  scores: PlayerAmounts;
  scoreRecords: PlayerScoreRecords;
  incidents: RoundIncident[];
  buzzardIncidents?: BuzzardIncident[];
  profileScoreResults?: Partial<Record<PlayerId, ProfileScoreResult>>;
  eastPlayerId: PlayerId;
  prevailingWind: Wind;
  seats: SeatAssignments;
  settlement: SettlementResult;
  runningTotals: PlayerAmounts;
  progressionAfter: ProgressionState;
};

export type GameLength = 'one-round' | 'full-game';

export type GameSetup = {
  rulesProfile: RulesProfileRef;
  players: GamePlayer[];
  startingSeats: SeatAssignments;
  startingPrevailingWind: Wind;
  startingBalances: PlayerAmounts;
  gameLength: GameLength;
  tableLimit: number;
};

export type GameState = {
  /** @deprecated Use setup.rulesProfile.id; retained for compatibility. */
  rulesetId: string;
  setup: GameSetup;
  players: GamePlayer[];
  seats: SeatAssignments;
  prevailingWind: Wind;
  eastCycleStartPlayerId: PlayerId;
  balances: PlayerAmounts;
  handHistory: ConfirmedHand[];
  currentHandMode: HandMode;
  isComplete: boolean;
};

export type HandScoreInput = {
  hand: MahjongHand;
  playerWind: Wind;
  prevailingWind: Wind;
  limit?: number;
  handMode?: HandMode;
};

export type GameRuleset = {
  readonly id: string;
  readonly version: string;
  readonly name: string;
  readonly defaultLimit: number;
  scoreHand: (input: HandScoreInput) => ScoreBreakdown;
  settleRound: (
    players: GamePlayer[],
    seats: SeatAssignments,
    round: RoundInput,
  ) => SettlementResult;
  prepareRound?: (
    players: GamePlayer[],
    seats: SeatAssignments,
    round: RoundInput,
  ) => RoundInput;
  progressGame: (
    players: GamePlayer[],
    current: ProgressionState,
    outcome: HandOutcome,
  ) => ProgressionResult;
  nextHandMode: (current: HandMode, outcome: HandOutcome) => HandMode;
};

export type HandScorerContext = {
  rulesProfile: RulesProfileRef;
  playerId: string;
  playerName: string;
  playerWind: Wind;
  prevailingWind: Wind;
  isWinner: boolean;
  limit: number;
  handMode: HandMode;
  detailedHand?: DetailedHandRecord;
  requiresRecalculation?: boolean;
};

export type HandScorerExampleContext = Omit<
  HandScorerContext,
  'rulesProfile'
>;

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
  incidents?: RoundIncident[];
  buzzardIncidents?: BuzzardIncident[];
  profileScoreResults?: Partial<Record<PlayerId, ProfileScoreResult>>;
};

export type HandScorerLocalContext = {
  playerWind: Wind;
  prevailingWind: Wind;
  limit: number;
  isWinner: boolean;
  handMode: HandMode;
  eastThirteenthConsecutiveMahjong?: boolean;
};
