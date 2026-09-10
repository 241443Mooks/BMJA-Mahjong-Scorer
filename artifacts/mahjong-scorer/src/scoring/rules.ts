import { expandedTiles, isMajor, windNumber } from './tiles';
import type {
  GameContext,
  MahjongHand,
  RuleReferenceId,
  RuleResult,
  Wind,
} from './types';

const point = (
  id: string,
  label: string,
  description: string,
  amount: number,
  referenceId?: RuleReferenceId,
): RuleResult => ({
  id,
  label,
  description,
  amount,
  unit: 'points',
  ...(referenceId ? { referenceId } : {}),
});

const double = (
  id: string,
  label: string,
  description: string,
  amount = 1,
  referenceId?: RuleReferenceId,
): RuleResult => ({
  id,
  label,
  description,
  amount,
  unit: 'doubles',
  ...(referenceId ? { referenceId } : {}),
});

/**
 * BMJA rule: chows score no basic points. They are deliberately omitted.
 * Pungs score 2/4 for exposed minor/major and twice that when concealed.
 */
export const scorePungs = (hand: MahjongHand): RuleResult[] =>
  hand.sets.flatMap((set) => {
    if (set.kind !== 'pung') return [];
    const major = isMajor(set.tile);
    const amount = (major ? 4 : 2) * (set.visibility === 'concealed' ? 2 : 1);
    return [
      point(
        `pung-${set.id}`,
        `${set.visibility === 'concealed' ? 'Concealed' : 'Exposed'} ${major ? 'major' : 'minor'} pung`,
        'Pung value from tile class and exposure.',
        amount,
        major ? 'pung-major' : 'pung-minor',
      ),
    ];
  });

/**
 * BMJA rule: a kong scores four times the equivalent pung:
 * exposed minor/major 8/16; concealed minor/major 16/32.
 */
export const scoreKongs = (hand: MahjongHand): RuleResult[] =>
  hand.sets.flatMap((set) => {
    if (set.kind !== 'kong') return [];
    const major = isMajor(set.tile);
    const amount = (major ? 16 : 8) * (set.visibility === 'concealed' ? 2 : 1);
    return [
      point(
        `kong-${set.id}`,
        `${set.visibility === 'concealed' ? 'Concealed' : 'Exposed'} ${major ? 'major' : 'minor'} kong`,
        'Kong value from tile class and exposure.',
        amount,
        major ? 'kong-major' : 'kong-minor',
      ),
    ];
  });

/**
 * BMJA rule: a dragon pair scores 2. A pair of the player's wind scores 2,
 * and a pair of the prevailing wind scores 2; both may apply to the same pair.
 */
export const scoreHonorPairs = (
  hand: MahjongHand,
  context: GameContext,
): RuleResult[] =>
  hand.sets.flatMap((set) => {
    if (set.kind !== 'pair') return [];
    if (set.tile.family === 'dragon') {
      return [
        point(
          'dragon-pair',
          'Pair of dragons',
          'Any dragon pair scores 2.',
          2,
          'dragon-pair',
        ),
      ];
    }
    if (set.tile.family !== 'wind') return [];
    const results: RuleResult[] = [];
    if (set.tile.wind === context.playerWind) {
      results.push(
        point(
          'own-wind-pair',
          'Pair of own wind',
          'Own wind pair scores 2.',
          2,
          'own-wind-pair',
        ),
      );
    }
    if (set.tile.wind === context.prevailingWind) {
      results.push(
        point(
          'prevailing-wind-pair',
          'Pair of prevailing wind',
          'Prevailing wind pair scores 2.',
          2,
          'prevailing-wind-pair',
        ),
      );
    }
    return results;
  });

/** BMJA rule: every flower and season scores 4 basic points. */
export const scoreBonusTiles = (hand: MahjongHand): RuleResult[] =>
  hand.bonusTiles.map((tile) =>
    point(
      `bonus-${tile.family}-${tile.number}`,
      `${tile.family === 'flower' ? 'Flower' : 'Season'} ${tile.number}`,
      'Every bonus tile scores 4.',
      4,
      'bonus-tile-points',
    ),
  );

/**
 * BMJA rule: going Mah-Jong scores 20. Drawing the winning tile from the
 * live wall (not the kong box) adds 2.
 */
export const scoreWinningPoints = (hand: MahjongHand): RuleResult[] => {
  if (!hand.isWinner) return [];
  const rules = [
    point(
      'mahjong',
      'Going Mah-Jong',
      'A completed winning hand scores 20.',
      20,
      'mahjong-points',
    ),
  ];
  if (hand.winningMethod === 'wall') {
    rules.push(
      point(
        'live-wall-win',
        'Winning from the live wall',
        'A winning tile drawn from the live wall scores 2.',
        2,
        'live-wall-win',
      ),
    );
  }
  return rules;
};

const matchingWindSets = (hand: MahjongHand, value: Wind) =>
  hand.sets.filter(
    (set) =>
      (set.kind === 'pung' || set.kind === 'kong') &&
      set.tile.family === 'wind' &&
      set.tile.wind === value,
  );

/**
 * BMJA rule: each pung or kong of dragons, own wind, or prevailing wind
 * gives one double. Own and prevailing wind may both apply to one set.
 */
export const scoreHonorDoubles = (
  hand: MahjongHand,
  context: GameContext,
): RuleResult[] => {
  const rules: RuleResult[] = [];
  for (const set of hand.sets) {
    if (
      (set.kind === 'pung' || set.kind === 'kong') &&
      set.tile.family === 'dragon'
    ) {
      rules.push(
        double(
          `dragon-set-${set.id}`,
          'Pung or kong of dragons',
          'Every dragon pung or kong gives one double.',
        ),
      );
    }
  }
  for (const set of matchingWindSets(hand, context.playerWind)) {
    rules.push(
      double(
        `own-wind-set-${set.id}`,
        'Pung or kong of own wind',
        'Own wind pung or kong gives one double.',
      ),
    );
  }
  for (const set of matchingWindSets(hand, context.prevailingWind)) {
    rules.push(
      double(
        `prevailing-wind-set-${set.id}`,
        'Pung or kong of prevailing wind',
        'Prevailing wind pung or kong gives one double.',
      ),
    );
  }
  return rules;
};

/**
 * BMJA rule: own flower and own season each give one double.
 * A full bouquet gives two doubles total, inclusive of the own-tile double.
 */
export const scoreBonusDoubles = (
  hand: MahjongHand,
  context: GameContext,
): RuleResult[] => {
  const rules: RuleResult[] = [];
  const ownNumber = windNumber(context.playerWind);
  for (const family of ['flower', 'season'] as const) {
    const familyTiles = hand.bonusTiles.filter((tile) => tile.family === family);
    const ownReference: RuleReferenceId =
      family === 'flower' ? 'own-flower-double' : 'own-season-double';
    const bouquetReference: RuleReferenceId =
      family === 'flower' ? 'flower-bouquet-double' : 'season-bouquet-double';
    if (familyTiles.length === 4) {
      rules.push(
        double(
          `${family}-bouquet`,
          `Bouquet of ${family}s`,
          `All four ${family}s give two doubles, including the own ${family}.`,
          2,
          bouquetReference,
        ),
      );
    } else if (familyTiles.some((tile) => tile.number === ownNumber)) {
      rules.push(
        double(
          `own-${family}`,
          `Own ${family}`,
          `The ${family} matching the player's wind gives one double.`,
          1,
          ownReference,
        ),
      );
    }
  }
  return rules;
};

const handTiles = (hand: MahjongHand) => [
  ...hand.sets.flatMap(expandedTiles),
  ...(hand.looseTiles ?? []),
  ...(hand.remainingTiles ?? []),
];

/** BMJA Purity: four pungs/kongs and a pair, all in one suit; no honours/chows. */
export const isPurityHand = (hand: MahjongHand): boolean => {
  const tiles = handTiles(hand);
  const suits = new Set(
    tiles.flatMap((tile) => (tile.family === 'suit' ? [tile.suit] : [])),
  );
  return (
    hand.isWinner &&
    hand.sets.length === 5 &&
    hand.sets.filter((set) => set.kind === 'pair').length === 1 &&
    hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong')
      .length === 4 &&
    tiles.every((tile) => tile.family === 'suit') &&
    suits.size === 1
  );
};

/**
 * BMJA winner doubles: no chows; mixed one suit with honours; all majors;
 * fully concealed; and the named exceptional winning methods.
 * A pure one-suit hand without honours receives three doubles ("Purity").
 */
export const scoreWinnerDoubles = (hand: MahjongHand): RuleResult[] => {
  if (!hand.isWinner) return [];
  const rules: RuleResult[] = [];
  const tiles = handTiles(hand);
  const suitSet = new Set(
    tiles.filter((tile) => tile.family === 'suit').map((tile) =>
      tile.family === 'suit' ? tile.suit : '',
    ),
  );
  const hasHonors = tiles.some((tile) => tile.family !== 'suit');
  const purity = isPurityHand(hand);

  if (!purity && !hand.sets.some((set) => set.kind === 'chow')) {
    rules.push(double('no-chows', 'No chows', 'A winning hand with no chows.'));
  }
  if (tiles.length > 0 && suitSet.size === 1 && hasHonors) {
    rules.push(
      double(
        'mixed-one-suit',
        'One suit with honours',
        'All suited tiles use one suit, with winds and/or dragons.',
      ),
    );
  }
  if (purity) {
    rules.push(
      double(
        'purity',
        'Purity',
        'Four pungs/kongs and a pair in one suit, with no honours or chows.',
        3,
      ),
    );
  }
  if (tiles.length > 0 && tiles.every(isMajor)) {
    rules.push(
      double('all-majors', 'All majors', 'Every tile is a terminal or honour.'),
    );
  }
  if (
    !purity &&
    hand.sets.length > 0 &&
    hand.sets.every((set) => set.visibility === 'concealed')
  ) {
    rules.push(
      double(
        'concealed-hand',
        'Concealed hand',
        'All sets, including the pair, are concealed.',
      ),
    );
  }

  const methods: Partial<Record<NonNullable<MahjongHand['winningMethod']>, string>> = {
    'loose-tile': 'Winning with a loose tile',
    'last-wall-tile': 'Winning with the last wall tile',
    'final-discard': 'Winning with the final discard',
    'robbing-kong': 'Robbing the kong',
  };
  const methodLabel = hand.winningMethod && methods[hand.winningMethod];
  if (methodLabel) {
    rules.push(
      double(
        `win-${hand.winningMethod}`,
        methodLabel,
        'This exceptional winning method gives one double.',
      ),
    );
  }
  if (hand.originalCall) {
    rules.push(
      double(
        'original-call',
        'Original call',
        'Fishing after the first discard without altering the hand.',
      ),
    );
  }
  return rules;
};

export const applyPointRules = (
  hand: MahjongHand,
  context: GameContext,
): RuleResult[] => [
  ...scorePungs(hand),
  ...scoreKongs(hand),
  ...scoreHonorPairs(hand, context),
  ...scoreBonusTiles(hand),
  ...scoreWinningPoints(hand),
];

export const applyDoubleRules = (
  hand: MahjongHand,
  context: GameContext,
): RuleResult[] => [
  ...scoreHonorDoubles(hand, context),
  ...scoreBonusDoubles(hand, context),
  ...scoreWinnerDoubles(hand),
];
