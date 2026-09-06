export const SUITS = ['bamboo', 'characters', 'circles'] as const;
export const WINDS = ['east', 'south', 'west', 'north'] as const;
export const DRAGONS = ['red', 'green', 'white'] as const;
export const SET_KINDS = ['chow', 'pung', 'kong', 'pair'] as const;
export const VISIBILITIES = ['exposed', 'concealed'] as const;

export type Suit = (typeof SUITS)[number];
export type Wind = (typeof WINDS)[number];
export type Dragon = (typeof DRAGONS)[number];
export type SetKind = (typeof SET_KINDS)[number];
export type Visibility = (typeof VISIBILITIES)[number];

export type SuitTile = {
  family: 'suit';
  suit: Suit;
  rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
};

export type WindTile = { family: 'wind'; wind: Wind };
export type DragonTile = { family: 'dragon'; dragon: Dragon };
export type PlayingTile = SuitTile | WindTile | DragonTile;

export type BonusTile = {
  family: 'flower' | 'season';
  number: 1 | 2 | 3 | 4;
};

export type HandSet = {
  id: string;
  kind: SetKind;
  tile: PlayingTile;
  visibility: Visibility;
};

export type WinningMethod =
  | 'discard'
  | 'wall'
  | 'loose-tile'
  | 'last-wall-tile'
  | 'final-discard'
  | 'robbing-kong';

/**
 * This is the single hand contract used by scoring and manual entry.
 * A future recogniser should produce this exact shape.
 */
export type MahjongHand = {
  sets: HandSet[];
  /** Ungrouped tiles support irregular special hands such as Thirteen Unique Wonders. */
  looseTiles?: PlayingTile[];
  bonusTiles: BonusTile[];
  isWinner: boolean;
  winningMethod?: WinningMethod;
  originalCall?: boolean;
};

export type GameContext = {
  playerWind: Wind;
  prevailingWind: Wind;
  limit: number;
};

export type RuleResult = {
  id: string;
  label: string;
  description: string;
  amount: number;
  unit: 'points' | 'doubles';
  source?: string;
};

export type SpecialHandResult = {
  id: string;
  name: string;
  description: string;
  matched: boolean;
  value: number;
};

export type ScoreBreakdown = {
  valid: boolean;
  validationErrors: string[];
  pointRules: RuleResult[];
  doubleRules: RuleResult[];
  specialHands: SpecialHandResult[];
  basePoints: number;
  doubles: number;
  uncappedScore: number;
  finalScore: number;
  limitApplied: boolean;
  scoringMode: 'standard' | 'special';
};
