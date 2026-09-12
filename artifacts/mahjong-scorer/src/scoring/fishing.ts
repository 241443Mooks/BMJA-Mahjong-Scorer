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
  type FishingSpecialId,
  type GameContext,
  type HandSet,
  type MahjongHand,
  type PlayingTile,
  type SpecialFishingResult,
} from './types';

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
  'wriggly-dragon': 'Wriggly Dragon',
  'wriggling-snake-any-pair': 'Wriggly Snake',
  'hachi-ban': 'Hachi Ban',
  dragonette: 'Dragonette',
  windfall: 'Windfall',
  'all-pair-ruby-jade': 'All Pair Ruby Jade',
  'golden-gates': 'Golden Gates',
};

const fishingValues: Record<FishingSpecialId, number | 'three-doubles'> = {
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
  'wriggly-dragon': 400,
  'wriggling-snake-any-pair': 400,
  'hachi-ban': 400,
  dragonette: 400,
  windfall: 400,
  'all-pair-ruby-jade': 400,
  'golden-gates': 400,
};

export const FISHING_SPECIALS = (Object.keys(names) as FishingSpecialId[]).map(
  (id) => ({ id, name: names[id], fishingValue: fishingValues[id] }),
);

const currentTiles = (hand: MahjongHand) => [...handPlayingTiles(hand)];

type TileTally = Map<string, { tile: PlayingTile; count: number }>;

const tallyTiles = (tiles: PlayingTile[]): TileTally => {
  const tally: TileTally = new Map();
  for (const tile of tiles) {
    const key = tileKey(tile);
    const current = tally.get(key);
    tally.set(key, { tile, count: (current?.count ?? 0) + 1 });
  }
  return tally;
};

const cloneTally = (tally: TileTally): TileTally =>
  new Map([...tally].map(([key, value]) => [key, { ...value }]));

const removeTiles = (
  tally: TileTally,
  tiles: PlayingTile[],
): TileTally | undefined => {
  const next = cloneTally(tally);
  for (const tile of tiles) {
    const key = tileKey(tile);
    const entry = next.get(key);
    if (!entry || entry.count === 0) return undefined;
    if (entry.count === 1) next.delete(key);
    else next.set(key, { ...entry, count: entry.count - 1 });
  }
  return next;
};

const remainingPhysicalCount = (tally: TileTally): number =>
  [...tally.values()].reduce((sum, entry) => sum + entry.count, 0);

const nextTile = (tally: TileTally): PlayingTile | undefined =>
  [...tally.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  )[0]?.[1].tile;

const completionSetId = (sets: HandSet[], index: number): string => {
  const base = `fishing-completion-${index + 1}`;
  if (!sets.some((handSet) => handSet.id === base)) return base;
  return `__${base}`;
};

const standardDecompositions = (
  existingSets: HandSet[],
  concealedTiles: PlayingTile[],
): HandSet[][] => {
  const results: HandSet[][] = [];
  const existingPairs = existingSets.filter(
    (handSet) => handSet.kind === 'pair',
  ).length;
  const existingChows = existingSets.filter(
    (handSet) => handSet.kind === 'chow',
  ).length;

  const search = (
    tally: TileTally,
    generated: HandSet[],
    pairsNeeded: number,
    meldsNeeded: number,
    chowsUsed: number,
  ) => {
    if (pairsNeeded < 0 || meldsNeeded < 0) return;
    if (remainingPhysicalCount(tally) !== pairsNeeded * 2 + meldsNeeded * 3) {
      return;
    }
    const tile = nextTile(tally);
    if (!tile) {
      if (pairsNeeded === 0 && meldsNeeded === 0) {
        results.push([...existingSets, ...generated]);
      }
      return;
    }

    const addGroup = (
      kind: 'pair' | 'pung' | 'chow',
      members: PlayingTile[],
      nextPairs: number,
      nextMelds: number,
      nextChows: number,
    ) => {
      const next = removeTiles(tally, members);
      if (!next) return;
      search(
        next,
        [
          ...generated,
          {
            id: completionSetId(
              [...existingSets, ...generated],
              generated.length,
            ),
            kind,
            tile,
            visibility: 'concealed',
          },
        ],
        nextPairs,
        nextMelds,
        nextChows,
      );
    };

    if (pairsNeeded > 0) {
      addGroup('pair', [tile, tile], pairsNeeded - 1, meldsNeeded, chowsUsed);
    }
    if (meldsNeeded > 0) {
      addGroup(
        'pung',
        [tile, tile, tile],
        pairsNeeded,
        meldsNeeded - 1,
        chowsUsed,
      );
      if (chowsUsed < 1 && tile.family === 'suit' && tile.rank <= 7) {
        const second = {
          ...tile,
          rank: (tile.rank + 1) as Extract<
            PlayingTile,
            { family: 'suit' }
          >['rank'],
        };
        const third = {
          ...tile,
          rank: (tile.rank + 2) as Extract<
            PlayingTile,
            { family: 'suit' }
          >['rank'],
        };
        addGroup(
          'chow',
          [tile, second, third],
          pairsNeeded,
          meldsNeeded - 1,
          chowsUsed + 1,
        );
      }
    }
  };

  if (existingSets.length <= 5 && existingPairs <= 1 && existingChows <= 1) {
    const pairsNeeded = 1 - existingPairs;
    const meldsNeeded = 4 - (existingSets.length - existingPairs);
    search(
      tallyTiles(concealedTiles),
      [],
      pairsNeeded,
      meldsNeeded,
      existingChows,
    );
  }

  if (
    existingSets.length <= 7 &&
    existingSets.every((handSet) => handSet.kind === 'pair')
  ) {
    search(tallyTiles(concealedTiles), [], 7 - existingSets.length, 0, 0);
  }

  return results;
};

const completedHands = (
  hand: MahjongHand,
  completingTile: PlayingTile,
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
    winningMethod: undefined,
    winningTileProvenance: undefined,
    winningEventEvidence: undefined,
    originalCall: false,
  });

  if (hand.looseTiles?.length) {
    const irregular = finish([], [...hand.looseTiles, completingTile]);
    return hasCompleteWinningShape(irregular) ? [irregular] : [];
  }

  const remaining = hand.remainingTiles ?? [];
  if (hand.sets.length === 0) {
    const irregular = finish([], [...remaining, completingTile]);
    if (hasCompleteWinningShape(irregular)) completed.push(irregular);
  }

  for (const sets of standardDecompositions(hand.sets, [
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
    for (const sets of standardDecompositions(upgraded, remaining)) {
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
  target: FishingSpecialId,
  tile: PlayingTile,
  bindings: SpecialHandPatternBinding[],
) =>
  completedHands(hand, tile).some((completed) =>
    target === 'purity'
      ? isPurityHand(completed)
      : detectSpecialHands(completed, undefined, bindings).some(
          (special) => special.id === target && special.matched,
        ),
  );

export const detectSpecialFishing = (
  hand: MahjongHand,
  bindings?: SpecialHandPatternBinding[],
): SpecialFishingResult[] => {
  const usesExplicitBindings = bindings !== undefined;
  const effectiveBindings = bindings ?? bmjaSpecialHandBindings;
  if (
    hand.isWinner ||
    structuralTileCount(hand) !== 13 ||
    ((hand.looseTiles?.length ?? 0) > 0 &&
      (hand.sets.length > 0 || (hand.remainingTiles?.length ?? 0) > 0))
  ) {
    return [];
  }
  const tally = new Map<string, number>();
  for (const tile of currentTiles(hand)) {
    const key = tileKey(tile);
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }
  const bindingFor = (id: FishingSpecialId) =>
    effectiveBindings.find((binding) => binding.patternId === id);
  return FISHING_SPECIALS.flatMap(({ id, name }) => {
    const binding = bindingFor(id);
    // An explicit profile owns both catalogue membership and fishing metadata.
    // The legacy BMJA table is retained only for the no-profile API.
    if (
      usesExplicitBindings &&
      (!binding ||
        !isFixedSpecialHandBinding(binding) ||
        binding.fishingValue === undefined)
    )
      return [];
    const fishingValue = binding && isFixedSpecialHandBinding(binding)
      ? (specialHandFishingValueFor(hand, binding) ??
        (usesExplicitBindings ? undefined : fishingValues[id]))
      : fishingValues[id];
    if (fishingValue === undefined) return [];
    const completingTiles = playingTiles.filter(
      (tile) =>
        (tally.get(tileKey(tile)) ?? 0) < 4 &&
        completesTarget(hand, id, tile, effectiveBindings),
    );
    return completingTiles.length
      ? [
          {
            id,
            name: binding?.name ?? name,
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
