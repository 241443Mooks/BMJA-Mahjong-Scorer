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

export type FishingSpecialId =
  | 'purity'
  | 'all-pair-honours'
  | 'knitting'
  | 'triple-knitting'
  | 'buried-treasure'
  | 'imperial-jade'
  | 'heads-and-tails'
  | 'three-great-scholars'
  | 'all-winds-and-dragons'
  | 'four-blessings'
  | 'fourfold-plenty'
  | 'gates-of-heaven'
  | 'wriggling-snake'
  | 'thirteen-unique-wonders'
  | 'wriggly-dragon'
  | 'hachi-ban'
  | 'dragonette'
  | 'windfall'
  | 'all-pair-ruby-jade';

export type WinningMethod =
  | 'initial-deal'
  | 'discard'
  | 'wall'
  | 'loose-tile'
  | 'last-wall-tile'
  | 'final-discard'
  | 'robbing-kong';

export type WinningTileTarget =
  | {
      type: 'grouped-set';
      /** Stable id of the completed set or pair. */
      setId: string;
      /** Required for a chow: zero-based position in its expanded tile order. */
      tileIndex?: 0 | 1 | 2;
    }
  | { type: 'loose-layout' };

export type WinningTileProvenance = {
  tile: PlayingTile;
  target: WinningTileTarget;
};

export type WinningEventEvidence =
  | {
      type: 'discard';
      discardedBy: Wind;
      /** One-based discard position within the hand. */
      handDiscardOrdinal: number;
    }
  | {
      type: 'replacement-chain';
      /** Consecutive kong declarations whose replacement draws led to the win. */
      kongDeclarations: number;
    };

/**
 * This is the single hand contract used by scoring and manual entry.
 * A future recogniser should produce this exact shape.
 */
export type MahjongHand = {
  sets: HandSet[];
  /** Ungrouped tiles support irregular special hands such as Thirteen Unique Wonders. */
  looseTiles?: PlayingTile[];
  /** Actual ungrouped tiles left over after completed sets in an ordinary non-winning hand. */
  remainingTiles?: PlayingTile[];
  bonusTiles: BonusTile[];
  isWinner: boolean;
  winningMethod?: WinningMethod;
  /** Exact winning tile and its destination; absence means unknown. */
  winningTileProvenance?: WinningTileProvenance;
  /** Minimal event facts not represented by winningMethod; absence means unknown. */
  winningEventEvidence?: WinningEventEvidence;
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

export type SpecialFishingResult = {
  id: FishingSpecialId;
  name: string;
  fishingValue: number | 'three-doubles';
  completingTiles: PlayingTile[];
  intrinsicApplied: boolean;
  /** Uncapped lawful fishing score for this interpretation. */
  score?: number;
  /** True when this interpretation supplies the hand's final score. */
  selected?: boolean;
};

export type ScoreBreakdown = {
  valid: boolean;
  /** Whether the entered tiles are enough for whole-hand analysis. */
  evidenceCompleteness: 'partial' | 'complete' | 'invalid';
  validationErrors: string[];
  pointRules: RuleResult[];
  doubleRules: RuleResult[];
  specialHands: SpecialHandResult[];
  specialFishing?: SpecialFishingResult;
  specialFishingMatches?: SpecialFishingResult[];
  basePoints: number;
  doubles: number;
  uncappedScore: number;
  finalScore: number;
  limitApplied: boolean;
  scoringMode: 'standard' | 'special';
  calculationComponents: {
    id: string;
    label: string;
    base: number;
    doubles: number;
    subtotal: number;
  }[];
};
