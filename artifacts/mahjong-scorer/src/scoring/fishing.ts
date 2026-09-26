import {
  applyDoubleRules,
  applyPointRules,
  isPurityHand,
  scoreBonusDoubles,
  scoreBonusTiles,
} from './rules';
import {
  bmjaSpecialHandBindings,
  detectSpecialHands,
  specialHandFishingValueFor,
  isFixedSpecialHandBinding,
  type SpecialHandPatternBinding,
} from './special-hands';
import {
  hasCompleteWinningShape,
  playingTiles as handPlayingTiles,
  structuralTileCount,
  tileKey,
} from './tiles';
import {
  DRAGONS,
  SUITS,
  WINDS,
  type LegacyFishingSpecialId,
  type GameContext,
  type HandSet,
  type MahjongHand,
  type PlayingTile,
  type SpecialFishingResult,
  type WinningMethod,
} from './types';
import { completionSetId, standardClassicalDecompositions } from './classical-decomposition';

const playingTiles: PlayingTile[] = [
  ...SUITS.flatMap((suit) =>
    Array.from({ length: 9 }, (_, index): PlayingTile => ({
      family: 'suit',
      suit,
      rank: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
    })),
  ),
  ...WINDS.map((wind): PlayingTile => ({ family: 'wind', wind })),
  ...DRAGONS.map((dragon): PlayingTile => ({ family: 'dragon', dragon })),
];

const purityFishing = { id: 'purity' as const, name: 'Purity', fishingValue: 'three-doubles' as const };
const bmjaFishingOrder: LegacyFishingSpecialId[] = [
  'all-pair-honours', 'knitting', 'triple-knitting', 'buried-treasure', 'imperial-jade',
  'heads-and-tails', 'three-great-scholars', 'all-winds-and-dragons', 'four-blessings',
  'fourfold-plenty', 'gates-of-heaven', 'wriggling-snake', 'thirteen-unique-wonders',
];
const bmjaFishingSpecials = bmjaFishingOrder.flatMap((id) => {
  const binding = bmjaSpecialHandBindings.find((item) => item.patternId === id);
  return binding && isFixedSpecialHandBinding(binding) && binding.fishingValue !== undefined
    ? [{ id, name: binding.name, fishingValue: binding.fishingValue, intrinsicIfGreater: binding.fishingUsesIntrinsicFloor === true }]
    : [];
});
export const FISHING_SPECIALS = [purityFishing, ...bmjaFishingSpecials];

const currentTiles = (hand: MahjongHand) => [...handPlayingTiles(hand)];

const completedHands = (
  hand: MahjongHand,
  completingTile: PlayingTile,
  winningMethod?: WinningMethod,
): MahjongHand[] => {
  const completed: MahjongHand[] = [];
  const finish = (
    sets: HandSet[],
    looseTiles?: PlayingTile[],
  ): MahjongHand => ({
    ...hand,
    sets,
    looseTiles,
    remainingTiles: undefined,
    isWinner: true,
    winningMethod,
    winningTileProvenance: undefined,
    winningEventEvidence: undefined,
    originalCall: false,
  });

  if (hand.looseTiles?.length) {
    const irregular = finish([], [...hand.looseTiles, completingTile]);
    if (hand.sets.length === 0) return hasCompleteWinningShape(irregular) ? [irregular] : [];
    if ((hand.remainingTiles?.length ?? 0) === 0) {
      return [finish(hand.sets, [...hand.looseTiles, completingTile])];
    }
    return [];
  }

  const remaining = hand.remainingTiles ?? [];
  if (hand.sets.length === 0) {
    const irregular = finish([], [...remaining, completingTile]);
    if (hasCompleteWinningShape(irregular)) completed.push(irregular);
  }

  for (const sets of standardClassicalDecompositions(hand.sets, [
    ...remaining,
    completingTile,
  ])) {
    const candidate = finish(sets);
    if (hasCompleteWinningShape(candidate)) completed.push(candidate);
  }

  for (let index = 0; index < hand.sets.length; index += 1) {
    const handSet = hand.sets[index];
    if (
      handSet.kind !== 'pair' ||
      tileKey(handSet.tile) !== tileKey(completingTile)
    ) {
      continue;
    }
    const upgraded = hand.sets.map((candidate, candidateIndex) =>
      candidateIndex === index
        ? { ...candidate, kind: 'pung' as const }
        : candidate,
    );
    for (const sets of standardClassicalDecompositions(upgraded, remaining)) {
      const candidate = finish(sets);
      if (hasCompleteWinningShape(candidate)) completed.push(candidate);
    }
  }

  // Profile-local grouped specials may use a non-standard set count. Pair the
  // final concealed tile so their canonical detector can decide membership.
  if (remaining.length === 1 && tileKey(remaining[0]) === tileKey(completingTile)) {
    completed.push(
      finish([
        ...hand.sets,
        {
          id: completionSetId(hand.sets, hand.sets.length),
          kind: 'pair',
          tile: completingTile,
          visibility: 'concealed',
        },
      ]),
    );
  }

  return completed;
};

const completesTarget = (
  hand: MahjongHand,
  target: string,
  tile: PlayingTile,
  bindings: SpecialHandPatternBinding[],
  context?: GameContext,
) =>
  {
    const targetBindings = bindings.filter((binding) => binding.patternId === target);
    return completedHands(
      hand,
      tile,
      targetBindings[0]?.winningMethods?.[0],
    ).some((completed) =>
    target === 'purity'
      ? isPurityHand(completed)
      : detectSpecialHands(completed, context, targetBindings).some(
          (special) => special.id === target && special.matched,
        ),
    );
  };

export const detectSpecialFishing = (
  hand: MahjongHand,
  bindings?: SpecialHandPatternBinding[],
  context?: GameContext,
): SpecialFishingResult[] => {
  const usesExplicitBindings = bindings !== undefined;
  const effectiveBindings = bindings ?? bmjaSpecialHandBindings;
  if (
    hand.isWinner ||
    structuralTileCount(hand) !== 13 ||
    ((hand.looseTiles?.length ?? 0) > 0 &&
      ((hand.remainingTiles?.length ?? 0) > 0 ||
        (!usesExplicitBindings && hand.sets.length > 0)))
  ) {
    return [];
  }
  const tally = new Map<string, number>();
  for (const tile of currentTiles(hand)) {
    const key = tileKey(tile);
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }
  const candidates: Array<{ id: string; name: string; fishingValue?: number | 'three-doubles'; binding?: import('./special-hands').FixedSpecialHandPatternBinding }> = usesExplicitBindings
    ? effectiveBindings.flatMap((binding) => isFixedSpecialHandBinding(binding) && binding.fishingValue !== undefined ? [{ id: binding.patternId, name: binding.name, binding }] : [])
    : [
        purityFishing,
        ...FISHING_SPECIALS.filter(({ id }) => id !== 'purity').flatMap(({ id }) => {
          const binding = effectiveBindings.find((item) => item.patternId === id);
          return binding && isFixedSpecialHandBinding(binding) && binding.fishingValue !== undefined
            ? [{ id, name: binding.name, fishingValue: binding.fishingValue, binding }]
            : [];
        }),
      ];
  return candidates.flatMap(({ id, name, binding }) => {
    const fishingValue = binding ? specialHandFishingValueFor(hand, binding) : FISHING_SPECIALS.find((special) => special.id === id)?.fishingValue;
    if (fishingValue === undefined) return [];
    const completingTiles = playingTiles.filter(
      (tile) =>
        (tally.get(tileKey(tile)) ?? 0) < 4 &&
        completesTarget(hand, id, tile, effectiveBindings, context),
    );
    return completingTiles.length
      ? [
          {
            id,
            name,
            fishingValue,
            completingTiles,
            intrinsicApplied: false,
          },
        ]
      : [];
  });
};

export const fishingIntrinsicHand = (hand: MahjongHand): MahjongHand => {
  return {
    ...hand,
    looseTiles: undefined,
    remainingTiles: undefined,
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
  const intrinsicEligible = bmjaSpecialHandBindings.find((binding) => binding.patternId === fishing.id)?.fishingUsesIntrinsicFloor === true;
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
