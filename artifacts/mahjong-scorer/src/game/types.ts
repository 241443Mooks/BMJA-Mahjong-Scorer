import type {
  GameContext,
  MahjongHand,
  ScoreBreakdown,
  Wind,
} from '../scoring';
import type { McrScoringInput } from '../rules-platform/mcr-scoring-input';
import type { HandScoreResult } from '../rules-platform/types';

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
export type McrHandOutcome =
  | { type: 'mcr-win'; winnerId: PlayerId; winSource: 'discard' | 'self-draw'; discarderId?: PlayerId }
  | { type: 'mcr-draw' };

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
export type McrAcceptedScoreRecord = {
  source: 'mcr-detailed-scorer';
  playerId: PlayerId;
  rulesProfile: RulesProfileRef;
  rulesFingerprint: string;
  hand: MahjongHand;
  input: McrScoringInput;
  result: Extract<HandScoreResult, { grammar: 'pattern-accumulator' }>;
  finalScore: number;
};
export type McrRoundInput = {
  mcrOutcome: McrHandOutcome;
  scores: PlayerAmounts;
  scoreRecords?: PlayerScoreRecords;
};
export type GameRoundInput = RoundInput | McrRoundInput;

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
export type McrSettlementTransaction = {
  fromPlayerId: PlayerId;
  toPlayerId: PlayerId;
  amount: number;
  reasonId: string;
  basicPoints: number;
  fixedComponent: 8;
  winSource: 'discard' | 'self-draw';
  payerRole: 'discarder' | 'other-player' | 'non-winner';
};
export type McrSettlementResult = { transactions: McrSettlementTransaction[]; changes: PlayerAmounts; zeroSum: boolean };

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
  outcome: HandOutcome | McrHandOutcome;
  /** Full replay input retained only in memory; persistence projection deliberately omits it. */
  mcrReplay?: McrRoundInput;
  handMode: HandMode;
  eastThirteenthConsecutiveMahjong?: boolean;
  nextHandMode: HandMode;
  scores: PlayerAmounts;
  scoreRecords: PlayerScoreRecords;
  incidents: RoundIncident[];
  buzzardIncidents?: BuzzardIncident[];
  profileScoreResults?: Partial<Record<PlayerId, ProfileScoreResult>>;
  eastPlayerId: PlayerId;
  prevailingWind: Wind;
  seats: SeatAssignments;
  settlement: SettlementResult | McrSettlementResult;
  runningTotals: PlayerAmounts;
  progressionAfter: ProgressionState;
};

export type ClassicalConfirmedHand = Omit<ConfirmedHand, 'outcome' | 'mcrReplay' | 'settlement'> & {
  outcome: HandOutcome;
  settlement: SettlementResult;
  mcrReplay?: never;
};
export type McrConfirmedHand = Omit<ConfirmedHand, 'outcome' | 'settlement'> & {
  outcome: McrHandOutcome;
  settlement: McrSettlementResult;
  mcrReplay: McrRoundInput;
};

export type GameLength = 'one-round' | 'full-game';

export type GameSetup = {
  rulesProfile: RulesProfileRef;
  players: GamePlayer[];
  startingSeats: SeatAssignments;
  startingPrevailingWind: Wind;
  startingBalances: PlayerAmounts;
  gameLength: GameLength;
  tableLimit?: number;
};

export type GameState = {
  /** @deprecated Use setup.rulesProfile.id; retained for compatibility. */
  rulesetId: string;
  setup: GameSetup;
  runtimeFingerprint: string;
  players: GamePlayer[];
  seats: SeatAssignments;
  prevailingWind: Wind;
  eastCycleStartPlayerId: PlayerId;
  balances: PlayerAmounts;
  handHistory: ConfirmedHand[];
  currentHandMode: HandMode;
  isComplete: boolean;
};
export type ClassicalGameState = Omit<GameState, 'setup' | 'handHistory'> & {
  setup: GameSetup & { tableLimit: number };
  handHistory: ClassicalConfirmedHand[];
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
  limit?: number;
  handMode: HandMode;
  mcr?: { winSource: 'discard' | 'self-draw'; lockedTableContext: true; acceptedScore?: McrAcceptedScoreRecord };
  eastThirteenthConsecutiveMahjong?: boolean;
  detailedHand?: DetailedHandRecord;
  requiresRecalculation?: boolean;
};

export type HandScorerExampleContext = Omit<
  HandScorerContext,
  'rulesProfile'
>;

export type ClassicalHandScorerResult = {
  grammar: 'classical-points-doubles';
  playerId: string;
  score: number;
  isWinner: boolean;
  detailedHand: DetailedHandRecord;
};
export type McrHandScorerResult = {
  grammar: 'pattern-accumulator';
  playerId: string;
  score: number;
  isWinner: true;
  acceptedScore: McrAcceptedScoreRecord;
};
export type HandScorerResult = ClassicalHandScorerResult | McrHandScorerResult;

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

export type PlayerScoreRecord = ManualScoreRecord | DetailedHandRecord | McrAcceptedScoreRecord;
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
  limit?: number;
  isWinner: boolean;
  handMode: HandMode;
  eastThirteenthConsecutiveMahjong?: boolean;
};
