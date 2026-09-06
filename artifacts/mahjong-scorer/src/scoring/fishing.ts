import {
  applyDoubleRules,
  applyPointRules,
  isPurityHand,
  scoreBonusDoubles,
  scoreBonusTiles,
} from './rules';
import { detectSpecialHands } from './special-hands';
import { expandedTiles, tileKey } from './tiles';
import {
  DRAGONS,
  SUITS,
  WINDS,
  type FishingSpecialId,
  type GameContext,
  type HandSet,
  type MahjongHand,
  type PlayingTile,
  type SpecialFishingResult,
} from './types';

const playingTiles: PlayingTile[] = [
  ...SUITS.flatMap((suit) =>
    Array.from(
      { length: 9 },
      (_, index): PlayingTile => ({
        family: 'suit',
        suit,
        rank: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
      }),
    ),
  ),
  ...WINDS.map((wind): PlayingTile => ({ family: 'wind', wind })),
  ...DRAGONS.map((dragon): PlayingTile => ({ family: 'dragon', dragon })),
];

const names: Record<FishingSpecialId, string> = {
  purity: 'Purity',
  'all-pair-honours': 'All pair honours',
  knitting: 'Knitting',
  'triple-knitting': 'Triple Knitting',
  'buried-treasure': 'Buried treasure',
  'imperial-jade': 'Imperial Jade',
  'heads-and-tails': 'Heads and Tails',
  'three-great-scholars': 'Three great scholars',
  'all-winds-and-dragons': 'All Winds and Dragons',
  'four-blessings': 'Four Blessings Hovering over the Door',
  'fourfold-plenty': 'Fourfold Plenty',
  'gates-of-heaven': 'The Gates of Heaven',
  'wriggling-snake': 'The Wriggling Snake',
  'thirteen-unique-wonders': 'Thirteen unique wonders',
};

const fishingValues: Record<
  FishingSpecialId,
  number | 'three-doubles'
> = {
  purity: 'three-doubles',
  'all-pair-honours': 200,
  knitting: 200,
  'triple-knitting': 200,
  'buried-treasure': 400,
  'imperial-jade': 400,
  'heads-and-tails': 400,
  'three-great-scholars': 400,
  'all-winds-and-dragons': 400,
  'four-blessings': 400,
  'fourfold-plenty': 400,
  'gates-of-heaven': 400,
  'wriggling-snake': 400,
  'thirteen-unique-wonders': 400,
};

export const FISHING_SPECIALS = (
  Object.keys(names) as FishingSpecialId[]
).map((id) => ({ id, name: names[id], fishingValue: fishingValues[id] }));

const currentTiles = (hand: MahjongHand) => [
  ...hand.sets.flatMap(expandedTiles),
  ...(hand.looseTiles ?? []),
  ...(hand.incompleteSet
    ? Array.from(
        {
          length:
            hand.incompleteSet.kind === 'single'
              ? 1
              : hand.incompleteSet.kind === 'pair'
                ? 2
                : 3,
        },
        () => hand.incompleteSet!.tile,
      )
    : []),
];

const completesTarget = (
  hand: MahjongHand,
  target: FishingSpecialId,
  tile: PlayingTile,
) => {
  let completed: MahjongHand;
  if (hand.incompleteSet) {
    if (tileKey(tile) !== tileKey(hand.incompleteSet.tile)) return false;
    const kind =
      hand.incompleteSet.kind === 'single'
        ? 'pair'
        : hand.incompleteSet.kind === 'pair'
          ? 'pung'
          : 'kong';
    const completedSet: HandSet = {
      id: 'fishing-completion',
      kind,
      tile,
      visibility: hand.incompleteSet.visibility,
    };
    completed = {
      ...hand,
      sets: [...hand.sets, completedSet],
      looseTiles: undefined,
      incompleteSet: undefined,
      fishingSpecial: undefined,
      isWinner: true,
      originalCall: false,
    };
  } else {
    completed = {
      ...hand,
      sets: [],
      looseTiles: [...(hand.looseTiles ?? []), tile],
      incompleteSet: undefined,
      fishingSpecial: undefined,
      isWinner: true,
      originalCall: false,
    };
  }

  if (target === 'purity') return isPurityHand(completed);
  return (
    detectSpecialHands(completed).find((special) => special.id === target)
      ?.matched ?? false
  );
};

export const detectSpecialFishing = (
  hand: MahjongHand,
): SpecialFishingResult | undefined => {
  const target = hand.fishingSpecial;
  if (!target || hand.isWinner) return undefined;
  const tally = new Map<string, number>();
  for (const tile of currentTiles(hand)) {
    const key = tileKey(tile);
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }
  const completingTiles = playingTiles.filter(
    (tile) =>
      (tally.get(tileKey(tile)) ?? 0) < 4 &&
      completesTarget(hand, target, tile),
  );
  if (completingTiles.length === 0) return undefined;
  return {
    id: target,
    name: names[target],
    fishingValue: fishingValues[target],
    completingTiles,
    intrinsicApplied: false,
  };
};

export const fishingIntrinsicHand = (hand: MahjongHand): MahjongHand => {
  const incomplete = hand.incompleteSet;
  const intrinsicSet: HandSet | undefined =
    incomplete && incomplete.kind !== 'single'
      ? {
          id: 'fishing-incomplete',
          kind: incomplete.kind,
          tile: incomplete.tile,
          visibility: incomplete.visibility,
        }
      : undefined;
  return {
    ...hand,
    sets: [...hand.sets, ...(intrinsicSet ? [intrinsicSet] : [])],
    looseTiles: undefined,
    incompleteSet: undefined,
    fishingSpecial: undefined,
    isWinner: false,
    originalCall: false,
    winningMethod: undefined,
  };
};

export const fishingScoreOptions = (
  hand: MahjongHand,
  context: GameContext,
  fishing: SpecialFishingResult,
) => {
  const intrinsicHand = fishingIntrinsicHand(hand);
  const bonusPointRules = scoreBonusTiles(hand);
  const bonusDoubleRules = scoreBonusDoubles(hand, context);
  const bonusBase = bonusPointRules.reduce((sum, rule) => sum + rule.amount, 0);
  const bonusDoubles = bonusDoubleRules.reduce(
    (sum, rule) => sum + rule.amount,
    0,
  );
  const bonusSubtotal = bonusBase * 2 ** bonusDoubles;
  const playingPointRules = applyPointRules(
    { ...intrinsicHand, bonusTiles: [] },
    context,
  );
  const playingBase = playingPointRules.reduce(
    (sum, rule) => sum + rule.amount,
    0,
  );
  const playingDoubleRules = applyDoubleRules(
    { ...intrinsicHand, bonusTiles: [] },
    context,
  );
  const playingDoubles = playingDoubleRules.reduce(
    (sum, rule) => sum + rule.amount,
    0,
  );
  const purityRule = {
    id: 'fishing-purity',
    label: 'Purity fishing',
    description: 'A calling Purity hand doubles its basic score three times.',
    amount: 3,
    unit: 'doubles' as const,
  };

  if (fishing.id === 'purity') {
    const specialSubtotal = playingBase * 2 ** 3 + bonusSubtotal;
    const intrinsicSubtotal =
      (playingBase + bonusBase) * 2 ** (3 + bonusDoubles);
    const intrinsicApplied = intrinsicSubtotal > specialSubtotal;
    return {
      intrinsicApplied,
      pointRules: [...playingPointRules, ...bonusPointRules],
      doubleRules: intrinsicApplied
        ? [purityRule, ...bonusDoubleRules]
        : [purityRule, ...bonusDoubleRules],
      components: intrinsicApplied
        ? [
            {
              id: 'fishing-purity-intrinsic',
              label: 'Purity intrinsic value',
              base: playingBase + bonusBase,
              doubles: 3 + bonusDoubles,
              subtotal: intrinsicSubtotal,
            },
          ]
        : [
            {
              id: 'fishing-purity-playing-tiles',
              label: 'Purity fishing',
              base: playingBase,
              doubles: 3,
              subtotal: playingBase * 2 ** 3,
            },
            ...(bonusBase
              ? [
                  {
                    id: 'fishing-special-bonus-tiles',
                    label: 'Bonus tiles',
                    base: bonusBase,
                    doubles: bonusDoubles,
                    subtotal: bonusSubtotal,
                  },
                ]
              : []),
          ],
    };
  }

  const fixedValue = fishing.fishingValue as number;
  const specialSubtotal = fixedValue + bonusSubtotal;
  const intrinsicEligible = new Set<FishingSpecialId>([
    'three-great-scholars',
    'all-winds-and-dragons',
    'four-blessings',
  ]).has(fishing.id);
  const intrinsicPlayingSubtotal = playingBase * 2 ** playingDoubles;
  const intrinsicSubtotal = intrinsicPlayingSubtotal + bonusSubtotal;
  const intrinsicApplied =
    intrinsicEligible && intrinsicSubtotal > specialSubtotal;

  return {
    intrinsicApplied,
    pointRules: intrinsicApplied
      ? [...playingPointRules, ...bonusPointRules]
      : bonusPointRules,
    doubleRules: intrinsicApplied
      ? [...playingDoubleRules, ...bonusDoubleRules]
      : bonusDoubleRules,
    components: intrinsicApplied
      ? [
          {
            id: `fishing-${fishing.id}-intrinsic`,
            label: `${fishing.name} intrinsic value`,
            base: playingBase,
            doubles: playingDoubles,
            subtotal: intrinsicPlayingSubtotal,
          },
          ...(bonusBase
            ? [
                {
                  id: 'fishing-special-bonus-tiles',
                  label: 'Bonus tiles',
                  base: bonusBase,
                  doubles: bonusDoubles,
                  subtotal: bonusSubtotal,
                },
              ]
            : []),
        ]
      : [
          {
            id: `fishing-${fishing.id}`,
            label: `${fishing.name} fishing`,
            base: fixedValue,
            doubles: 0,
            subtotal: fixedValue,
          },
          ...(bonusBase
            ? [
                {
                  id: 'fishing-special-bonus-tiles',
                  label: 'Bonus tiles',
                  base: bonusBase,
                  doubles: bonusDoubles,
                  subtotal: bonusSubtotal,
                },
              ]
            : []),
        ],
  };
};