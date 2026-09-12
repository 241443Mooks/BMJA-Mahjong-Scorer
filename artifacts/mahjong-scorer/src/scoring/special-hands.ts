import {
  expandedTiles,
  isTerminal,
  resolveWinningTileProvenance,
  tileKey,
} from './tiles';
import type {
  GameContext,
  MahjongHand,
  PlayingTile,
  SetKind,
  SpecialHandResult,
} from './types';
import type { RulesProfileRef } from '../game/types';

export type CanonicalSpecialHandPattern = {
  id: string;
  eventBased?: boolean;
  detect: (hand: MahjongHand, context?: GameContext) => boolean;
};

type CommonSpecialHandPatternBinding = {
  patternId: string;
  profile: RulesProfileRef;
  name: string;
  description: string;
};

export type FixedSpecialHandPatternBinding =
  CommonSpecialHandPatternBinding & {
    scoreModel?: { kind: 'fixed' };
  value: number;
  /** Fixed value while one tile away, when this profile has published one. */
  fishingValue?: number;
  /** Profile-local treatment for represented exposed Pung/Kong groups. */
  exposure?:
    | { allowed: false }
    | {
        allowed: true;
        exposedValue?: number;
        exposedFishingValue?: number;
      };
};

export type CalculatedSpecialHandPatternBinding =
  CommonSpecialHandPatternBinding & {
    scoreModel: {
      kind: 'calculated';
      /** Profile-local treatment for explicitly represented exposed set kinds. */
      exposure?: {
        multiplier: number;
        triggerSetKinds: SetKind[];
        forbiddenSetKinds?: SetKind[];
      };
    };
  };

export type SpecialHandPatternBinding =
  | FixedSpecialHandPatternBinding
  | CalculatedSpecialHandPatternBinding;

export const isFixedSpecialHandBinding = (
  binding: SpecialHandPatternBinding,
): binding is FixedSpecialHandPatternBinding =>
  binding.scoreModel?.kind !== 'calculated';

export const isCalculatedSpecialHandBinding = (
  binding: SpecialHandPatternBinding,
): binding is CalculatedSpecialHandPatternBinding =>
  binding.scoreModel?.kind === 'calculated';

const hasUnsupportedCalculatedExposure = (
  hand: MahjongHand,
  binding: CalculatedSpecialHandPatternBinding,
) =>
  binding.scoreModel.exposure?.forbiddenSetKinds !== undefined &&
  hand.sets.some(
    (set) =>
      set.visibility === 'exposed' &&
      binding.scoreModel.exposure!.forbiddenSetKinds!.includes(set.kind),
  );

export const calculatedSpecialHandExposureMultiplierFor = (
  hand: MahjongHand,
  binding: CalculatedSpecialHandPatternBinding,
) =>
  binding.scoreModel.exposure !== undefined &&
  hand.sets.some(
    (set) =>
      set.visibility === 'exposed' &&
      binding.scoreModel.exposure!.triggerSetKinds.includes(set.kind),
  )
    ? binding.scoreModel.exposure.multiplier
    : 1;

const hasRepresentedExposedMeld = (hand: MahjongHand) =>
  hand.sets.some(
    (set) =>
      set.visibility === 'exposed' && (set.kind === 'pung' || set.kind === 'kong'),
  );

const fixedBindingAllowsHand = (
  hand: MahjongHand,
  binding: FixedSpecialHandPatternBinding,
) => binding.exposure?.allowed !== false || !hasRepresentedExposedMeld(hand);

export const specialHandValueFor = (
  hand: MahjongHand,
  binding: FixedSpecialHandPatternBinding,
) =>
  binding.exposure?.allowed && hasRepresentedExposedMeld(hand)
    ? (binding.exposure.exposedValue ?? binding.value)
    : binding.value;

export const specialHandFishingValueFor = (
  hand: MahjongHand,
  binding: FixedSpecialHandPatternBinding,
) => {
  const fishingValue = binding.fishingValue;
  if (fishingValue === undefined) return undefined;
  return binding.exposure?.allowed && hasRepresentedExposedMeld(hand)
    ? (binding.exposure.exposedFishingValue ?? fishingValue)
    : fishingValue;
};

const tiles = (hand: MahjongHand) => [
  ...hand.sets.flatMap(expandedTiles),
  ...(hand.looseTiles ?? []),
  ...(hand.remainingTiles ?? []),
];
const counts = (values: PlayingTile[]) =>
  values.reduce<Map<string, number>>((map, tile) => {
    const key = tileKey(tile);
    map.set(key, (map.get(key) ?? 0) + 1);
    return map;
  }, new Map());
const hasAtMostFourCopies = (values: PlayingTile[]) =>
  [...counts(values).values()].every((count) => count <= 4);

const isCompleteLooseLayout = (hand: MahjongHand) => {
  const all = tiles(hand);
  return (
    hand.isWinner &&
    hand.sets.length === 0 &&
    (hand.remainingTiles?.length ?? 0) === 0 &&
    (hand.looseTiles?.length ?? 0) === 14 &&
    all.length === 14 &&
    hasAtMostFourCopies(all)
  );
};

const groupedRunShape = (hand: MahjongHand) => {
  if (
    !hand.isWinner ||
    hand.sets.length !== 5 ||
    (hand.looseTiles?.length ?? 0) !== 0 ||
    (hand.remainingTiles?.length ?? 0) !== 0
  ) return undefined;
  const chows = hand.sets.filter((set) => set.kind === 'chow');
  const pungOrKong = hand.sets.filter(
    (set) => set.kind === 'pung' || set.kind === 'kong',
  );
  const pairs = hand.sets.filter((set) => set.kind === 'pair');
  if (chows.length !== 3 || pungOrKong.length !== 1 || pairs.length !== 1) return undefined;
  const chowSuit = chows[0]?.tile.family === 'suit' ? chows[0].tile.suit : undefined;
  if (
    !chowSuit ||
    chows.some((set) => set.tile.family !== 'suit' || set.tile.suit !== chowSuit) ||
    ![1, 4, 7].every((rank) => chows.some((set) => set.tile.family === 'suit' && set.tile.rank === rank)) ||
    !hasAtMostFourCopies(tiles(hand))
  ) return undefined;
  return { chowSuit, pungOrKong: pungOrKong[0], pair: pairs[0] };
};

const hasExactlyOneOfEachWind = (values: PlayingTile[]) =>
  ['east', 'south', 'west', 'north'].every(
    (value) => counts(values).get(`wind-${value}`) === 1,
  );

const hasDragonPairAndSingles = (values: PlayingTile[]) => {
  const tally = counts(values);
  const dragonCounts = ['green', 'red', 'white'].map(
    (value) => tally.get(`dragon-${value}`) ?? 0,
  );
  return values.length === 4 && dragonCounts.filter((count) => count === 2).length === 1 && dragonCounts.filter((count) => count === 1).length === 2;
};

const hasDragonSinglesAndPair = (values: PlayingTile[]) => {
  const tally = counts(values);
  const dragonCounts = ['green', 'red', 'white'].map(
    (value) => tally.get(`dragon-${value}`) ?? 0,
  );
  return values.length === 5 && dragonCounts.filter((count) => count === 3).length === 1 && dragonCounts.filter((count) => count === 1).length === 2;
};

const isSingleSuitRun = (values: PlayingTile[], ranks: readonly number[]) => {
  if (values.length !== ranks.length || values.some((tile) => tile.family !== 'suit')) return false;
  const suited = values as Extract<PlayingTile, { family: 'suit' }>[];
  const suit = suited[0]?.suit;
  const tally = counts(suited);
  return suit !== undefined && new Set(suited.map((tile) => tile.suit)).size === 1 && ranks.every((rank) => tally.get(`${suit}-${rank}`) === 1);
};

const arePairsInOneSuit = (values: PlayingTile[], pairCount: number, allowedRanks: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]) => {
  if (values.length !== pairCount * 2 || values.some((tile) => tile.family !== 'suit')) return false;
  const suited = values as Extract<PlayingTile, { family: 'suit' }>[], suit = suited[0]?.suit, tally = counts(suited);
  return suit !== undefined && new Set(suited.map((tile) => tile.suit)).size === 1 && suited.every((tile) => allowedRanks.includes(tile.rank)) && [...tally.values()].every((count) => count % 2 === 0);
};

const areThreePairsFromOneHonorFamily = (values: PlayingTile[]) =>
  values.length === 6 &&
  (values.every((tile) => tile.family === 'wind') ||
    values.every((tile) => tile.family === 'dragon')) &&
  counts(values).size === 3 &&
  [...counts(values).values()].every((count) => count === 2);

const suitedRankCounts = (values: PlayingTile[]) => {
  const tally = new Map<number, Map<string, number>>();
  for (const tile of values) {
    if (tile.family !== 'suit') return null;
    const rank = tally.get(tile.rank) ?? new Map<string, number>();
    rank.set(tile.suit, (rank.get(tile.suit) ?? 0) + 1);
    tally.set(tile.rank, rank);
  }
  return tally;
};

const canPairAcrossSuits = (rankCounts: Map<string, number>) => {
  const values = [...rankCounts.values()];
  const total = values.reduce((sum, value) => sum + value, 0);
  return total % 2 === 0 && Math.max(...values, 0) <= total / 2;
};

const isGreenTile = (tile: PlayingTile) =>
  tile.family === 'dragon'
    ? tile.dragon === 'green'
    : tile.family === 'suit' &&
      tile.suit === 'bamboo' &&
      [2, 3, 4, 6, 8].includes(tile.rank);

const isClaimedCompletion = (hand: MahjongHand) =>
  hand.winningMethod === 'discard' || hand.winningMethod === 'final-discard';

const isWinningTile = (
  hand: MahjongHand,
  suit: Extract<PlayingTile, { family: 'suit' }>['suit'],
  rank: Extract<PlayingTile, { family: 'suit' }>['rank'],
) => {
  const provenance = resolveWinningTileProvenance(hand);
  return (
    provenance?.tile.family === 'suit' &&
    provenance.tile.suit === suit &&
    provenance.tile.rank === rank
  );
};

const gatesCompletionIsAllowed = (
  hand: MahjongHand,
  suit: Extract<PlayingTile, { family: 'suit' }>['suit'],
) => {
  if (!isClaimedCompletion(hand)) {
    return hand.winningMethod !== 'robbing-kong';
  }
  const provenance = resolveWinningTileProvenance(hand);
  return (
    provenance?.target.type === 'loose-layout' &&
    provenance.tile.family === 'suit' &&
    provenance.tile.suit === suit &&
    (provenance.tile.rank === 1 || provenance.tile.rank === 9)
  );
};

const buriedVisibilityIsAllowed = (hand: MahjongHand) => {
  const exposed = hand.sets.filter((group) => group.visibility === 'exposed');
  if (exposed.length === 0) return true;
  if (exposed.length !== 1 || !isClaimedCompletion(hand)) return false;

  const provenance = resolveWinningTileProvenance(hand);
  return (
    provenance !== undefined &&
    'set' in provenance &&
    provenance.set.id === exposed[0].id &&
    (provenance.set.kind === 'pung' || provenance.set.kind === 'pair') &&
    tileKey(provenance.tile) === tileKey(provenance.set.tile)
  );
};

/**
 * Special-hand detectors are independent: each receives only the canonical
 * MahjongHand and returns a boolean. Adding one cannot alter another.
 */
export const canonicalSpecialHandPatterns: CanonicalSpecialHandPattern[] = [
  {
    id: 'run-one-to-nine-with-same-suit-pung-and-pair',
    detect: (hand) => {
      const shape = groupedRunShape(hand);
      return shape !== undefined &&
        shape.pungOrKong.tile.family === 'suit' && shape.pungOrKong.tile.suit === shape.chowSuit &&
        shape.pair.tile.family === 'suit' && shape.pair.tile.suit === shape.chowSuit;
    },
  },
  {
    id: 'run-one-to-nine-with-wind-pung-and-pair',
    detect: (hand) => {
      const shape = groupedRunShape(hand);
      return shape !== undefined && shape.pungOrKong.tile.family === 'wind' && shape.pair.tile.family === 'wind';
    },
  },
  {
    id: 'run-one-to-nine-with-dragon-pung-and-pair',
    detect: (hand) => {
      const shape = groupedRunShape(hand);
      return shape !== undefined && shape.pungOrKong.tile.family === 'dragon' && shape.pair.tile.family === 'dragon';
    },
  },
  {
    id: 'run-one-to-nine-with-honour-pung-and-any-pair',
    detect: (hand) => {
      const shape = groupedRunShape(hand);
      return shape !== undefined && shape.pungOrKong.tile.family !== 'suit';
    },
  },
  {
    id: 'purity-one-chow',
    detect: (hand) => {
      const tiles = hand.sets.flatMap(expandedTiles);
      const melds = hand.sets.filter(
        (set) => set.kind === 'pung' || set.kind === 'kong' || set.kind === 'chow',
      );
      return (
        hand.isWinner &&
        hand.sets.length === 5 &&
        (hand.looseTiles?.length ?? 0) === 0 &&
        (hand.remainingTiles?.length ?? 0) === 0 &&
        hand.sets.filter((set) => set.kind === 'pair').length === 1 &&
        melds.length === 4 &&
        hand.sets.filter((set) => set.kind === 'chow').length <= 1 &&
        tiles.length ===
          14 + hand.sets.filter((set) => set.kind === 'kong').length &&
        hasAtMostFourCopies(tiles) &&
        tiles.every((tile) => tile.family === 'suit') &&
        new Set(tiles.map((tile) => tile.suit)).size === 1
      );
    },
  },
  {
    id: 'golden-gates',
    detect: (hand) => {
      if (
        !hand.isWinner ||
        hand.sets.length !== 6 ||
        (hand.looseTiles?.length ?? 0) > 0 ||
        (hand.remainingTiles?.length ?? 0) > 0
      ) {
        return false;
      }
      const pairs = hand.sets.filter((set) => set.kind === 'pair');
      const melds = hand.sets.filter(
        (set) => set.kind === 'pung' || set.kind === 'kong',
      );
      if (pairs.length !== 4 || melds.length !== 2) {
        return false;
      }
      const pairSuit =
        pairs[0]?.tile.family === 'suit' ? pairs[0].tile.suit : undefined;
      if (
        !pairSuit ||
        pairs.some(
          (set) => set.tile.family !== 'suit' || set.tile.suit !== pairSuit,
        )
      ) {
        return false;
      }
      if (
        ![2, 4, 6, 8].every(
          (rank) =>
            pairs.filter(
              (set) => set.tile.family === 'suit' && set.tile.rank === rank,
            ).length === 1,
        )
      ) {
        return false;
      }
      const terminal = melds.find((set) => set.tile.family === 'suit');
      const dragonMeld = melds.find((set) => set.tile.family === 'dragon');
      const requiredDragon = {
        bamboo: 'green',
        characters: 'red',
        circles: 'white',
      } as const;
      return (
        terminal?.tile.family === 'suit' &&
        terminal.tile.suit === pairSuit &&
        (terminal.tile.rank === 1 || terminal.tile.rank === 9) &&
        dragonMeld?.tile.family === 'dragon' &&
        dragonMeld.tile.dragon === requiredDragon[pairSuit] &&
        hasAtMostFourCopies(tiles(hand))
      );
    },
  },
  { id: 'wriggly-dragon', detect: (hand) => { if (!isCompleteLooseLayout(hand)) return false; const all = tiles(hand); return hasDragonSinglesAndPair(all.filter((tile) => tile.family === 'dragon')) && isSingleSuitRun(all.filter((tile) => tile.family === 'suit'), [1, 2, 3, 4, 5, 6, 7, 8, 9]); } },
  {
    id: 'wriggling-snake-any-pair',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const all = tiles(hand);
      const suited = all.filter(
        (tile): tile is Extract<PlayingTile, { family: 'suit' }> =>
          tile.family === 'suit',
      );
      const winds = all.filter(
        (tile): tile is Extract<PlayingTile, { family: 'wind' }> =>
          tile.family === 'wind',
      );
      if (
        suited.length + winds.length !== 14 ||
        new Set(suited.map((tile) => tile.suit)).size !== 1
      ) {
        return false;
      }
      const suit = suited[0]?.suit;
      const tally = counts(all);
      if (!suit) return false;
      const baseCounts = [
        ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(
          (rank) => tally.get(`${suit}-${rank}`) ?? 0,
        ),
        ...['east', 'south', 'west', 'north'].map(
          (value) => tally.get(`wind-${value}`) ?? 0,
        ),
      ];
      return (
        baseCounts.filter((count) => count === 1).length === 12 &&
        baseCounts.filter((count) => count === 2).length === 1
      );
    },
  },
  { id: 'hachi-ban', detect: (hand) => { if (!isCompleteLooseLayout(hand)) return false; const all = tiles(hand), honours = all.filter((tile) => tile.family === 'wind' || tile.family === 'dragon'), suited = all.filter((tile) => tile.family === 'suit'); return areThreePairsFromOneHonorFamily(honours) && (isSingleSuitRun(suited, [1, 2, 3, 4, 5, 6, 7, 8]) || isSingleSuitRun(suited, [2, 3, 4, 5, 6, 7, 8, 9])); } },
  { id: 'dragonette', detect: (hand) => { if (!isCompleteLooseLayout(hand)) return false; const all = tiles(hand), winds = all.filter((tile) => tile.family === 'wind'), dragons = all.filter((tile) => tile.family === 'dragon'), suited = all.filter((tile) => tile.family === 'suit'); return winds.length === 4 && hasExactlyOneOfEachWind(winds) && hasDragonPairAndSingles(dragons) && arePairsInOneSuit(suited, 3, [2, 3, 4, 5, 6, 7, 8]); } },
  { id: 'windfall', detect: (hand) => { if (!isCompleteLooseLayout(hand)) return false; const all = tiles(hand), winds = all.filter((tile) => tile.family === 'wind'), suited = all.filter((tile) => tile.family === 'suit'); return winds.length === 4 && hasExactlyOneOfEachWind(winds) && arePairsInOneSuit(suited, 5); } },
  { id: 'all-pair-ruby-jade', detect: (hand) => { if (!isCompleteLooseLayout(hand)) return false; const all = tiles(hand), dragons = all.filter((tile) => tile.family === 'dragon'), bamboo = all.filter((tile): tile is Extract<PlayingTile, { family: 'suit' }> => tile.family === 'suit' && tile.suit === 'bamboo'); return dragons.length === 4 && counts(dragons).get('dragon-green') === 2 && counts(dragons).get('dragon-red') === 2 && bamboo.length === 10 && arePairsInOneSuit(bamboo, 5); } },
  {
    id: 'run-two-to-eight-with-one-and-nine-pungs',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const all = tiles(hand);
      if (all.some((tile) => tile.family !== 'suit')) return false;
      const suited = all as Extract<PlayingTile, { family: 'suit' }>[];
      const suits = ['bamboo', 'characters', 'circles'] as const;
      return suits.some((runSuit) => {
        const otherSuits = suits.filter((suit) => suit !== runSuit);
        const tally = counts(suited);
        return (
          [2, 3, 4, 5, 6, 7, 8].every(
            (rank) => (tally.get(`${runSuit}-${rank}`) ?? 0) >= 1,
          ) &&
          [2, 3, 4, 5, 6, 7, 8].filter(
            (rank) => tally.get(`${runSuit}-${rank}`) === 2,
          ).length === 1 &&
          (tally.get(`${runSuit}-1`) ?? 0) === 0 &&
          (tally.get(`${runSuit}-9`) ?? 0) === 0 &&
          (
            ((tally.get(`${otherSuits[0]}-1`) ?? 0) === 3 &&
              (tally.get(`${otherSuits[1]}-9`) ?? 0) === 3) ||
            ((tally.get(`${otherSuits[0]}-9`) ?? 0) === 3 &&
              (tally.get(`${otherSuits[1]}-1`) ?? 0) === 3)
          )
        );
      });
    },
  },
  {
    id: 'full-suit-run-with-five-distinct-honours',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const all = tiles(hand);
      const suited = all.filter((tile) => tile.family === 'suit');
      const honours = all.filter((tile) => tile.family === 'wind' || tile.family === 'dragon');
      return isSingleSuitRun(suited, [1, 2, 3, 4, 5, 6, 7, 8, 9]) && honours.length === 5 && counts(honours).size === 5;
    },
  },
  {
    id: 'suit-run-one-to-seven-with-all-honours',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const all = tiles(hand);
      const suited = all.filter((tile) => tile.family === 'suit');
      const winds = all.filter((tile) => tile.family === 'wind');
      const dragons = all.filter((tile) => tile.family === 'dragon');
      return isSingleSuitRun(suited, [1, 2, 3, 4, 5, 6, 7]) && winds.length === 4 && hasExactlyOneOfEachWind(winds) && dragons.length === 3 && ['green', 'red', 'white'].every((value) => counts(dragons).get(`dragon-${value}`) === 1);
    },
  },
  {
    id: 'four-bamboo-one-and-five-green-bamboo-pairs',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const all = tiles(hand);
      const tally = counts(all);
      return all.every((tile) => tile.family === 'suit' && tile.suit === 'bamboo') && tally.get('bamboo-1') === 4 && [2, 3, 4, 6, 8].every((rank) => tally.get(`bamboo-${rank}`) === 2) && tally.size === 6;
    },
  },
  {
    id: 'seven-pairs-one-suit',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const all = tiles(hand);
      return all.every((tile) => tile.family === 'suit') && new Set(all.map((tile) => tile.suit)).size === 1 && [...counts(all).values()].every((count) => count % 2 === 0);
    },
  },
  {
    id: 'seven-pairs-one-suit-with-honours',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const all = tiles(hand);
      const suited = all.filter((tile): tile is Extract<PlayingTile, { family: 'suit' }> => tile.family === 'suit');
      return new Set(suited.map((tile) => tile.suit)).size <= 1 && [...counts(all).values()].every((count) => count % 2 === 0);
    },
  },
  {
    id: 'dragon-pair-with-five-suited-pairs',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const all = tiles(hand);
      const dragons = all.filter((tile) => tile.family === 'dragon');
      const suited = all.filter((tile) => tile.family === 'suit');
      return hasDragonPairAndSingles(dragons) && arePairsInOneSuit(suited, 5);
    },
  },
  {
    id: 'knitting',
    detect: (hand) => {
      const all = tiles(hand);
      const tally = suitedRankCounts(all);
      return (
        hand.isWinner &&
        hand.sets.length === 0 &&
        all.length === 14 &&
        hasAtMostFourCopies(all) &&
        tally !== null &&
        [...tally.values()].every(canPairAcrossSuits)
      );
    },
  },
  {
    id: 'triple-knitting',
    detect: (hand) => {
      const all = tiles(hand);
      const tally = suitedRankCounts(all);
      if (
        !hand.isWinner ||
        hand.sets.length !== 0 ||
        all.length !== 14 ||
        !hasAtMostFourCopies(all) ||
        tally === null
      ) {
        return false;
      }
      const suits = ['bamboo', 'characters', 'circles'] as const;
      return [...tally.entries()].some(([pairRank, rankCounts]) =>
        suits.some((firstSuit, firstIndex) =>
          suits.slice(firstIndex + 1).some((secondSuit) => {
            if (
              (rankCounts.get(firstSuit) ?? 0) < 1 ||
              (rankCounts.get(secondSuit) ?? 0) < 1
            ) {
              return false;
            }
            let triplets = 0;
            for (const [rank, values] of tally) {
              const adjusted = suits.map(
                (suit) =>
                  (values.get(suit) ?? 0) -
                  (rank === pairRank &&
                  (suit === firstSuit || suit === secondSuit)
                    ? 1
                    : 0),
              );
              if (
                adjusted.some((value) => value < 0) ||
                adjusted[0] !== adjusted[1] ||
                adjusted[1] !== adjusted[2]
              ) {
                return false;
              }
              triplets += adjusted[0];
            }
            return triplets === 4;
          }),
        ),
      );
    },
  },
  {
    id: 'all-pair-honours',
    detect: (hand) =>
      hand.isWinner &&
      hand.sets.length === 7 &&
      hand.sets.every(
        (set) =>
          set.kind === 'pair' &&
          (set.tile.family !== 'suit' ||
            set.tile.rank === 1 ||
            set.tile.rank === 9),
      ),
  },
  {
    id: 'imperial-jade',
    detect: (hand) => {
      const all = tiles(hand);
      return (
        hand.isWinner &&
        hand.sets.length === 5 &&
        hand.sets.filter((set) => set.kind === 'pair').length === 1 &&
        hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong')
          .length === 4 &&
        hasAtMostFourCopies(all) &&
        all.every(isGreenTile)
      );
    },
  },
  {
    id: 'thirteen-unique-wonders',
    detect: (hand) => {
      if (!hand.isWinner) return false;
      const all = tiles(hand);
      const tally = counts(all);
      const required = [
        'bamboo-1',
        'bamboo-9',
        'characters-1',
        'characters-9',
        'circles-1',
        'circles-9',
        'wind-east',
        'wind-south',
        'wind-west',
        'wind-north',
        'dragon-red',
        'dragon-green',
        'dragon-white',
      ];
      return (
        all.length === 14 &&
        required.every((key) => tally.has(key)) &&
        [...tally.values()].filter((count) => count === 2).length === 1
      );
    },
  },
  {
    id: 'gates-of-heaven',
    detect: (hand) => {
      const all = tiles(hand);
      if (
        !hand.isWinner ||
        hand.sets.length !== 0 ||
        all.length !== 14 ||
        !hasAtMostFourCopies(all) ||
        all.some((tile) => tile.family !== 'suit')
      ) {
        return false;
      }
      const suited = all.filter(
        (tile): tile is Extract<PlayingTile, { family: 'suit' }> =>
          tile.family === 'suit',
      );
      if (new Set(suited.map((tile) => tile.suit)).size !== 1) return false;
      const ranks = new Map<number, number>();
      for (const tile of suited) {
        ranks.set(tile.rank, (ranks.get(tile.rank) ?? 0) + 1);
      }
      return (
        ranks.get(1) === 3 &&
        ranks.get(9) === 3 &&
        [2, 3, 4, 5, 6, 7, 8].every((rank) =>
          [1, 2].includes(ranks.get(rank) ?? 0),
        ) &&
        [2, 3, 4, 5, 6, 7, 8].filter((rank) => ranks.get(rank) === 2).length ===
          1 &&
        gatesCompletionIsAllowed(hand, suited[0].suit)
      );
    },
  },
  {
    id: 'wriggling-snake',
    detect: (hand) => {
      const all = tiles(hand);
      if (
        !hand.isWinner ||
        hand.sets.length !== 0 ||
        all.length !== 14 ||
        !hasAtMostFourCopies(all)
      ) {
        return false;
      }
      const suited = all.filter(
        (tile): tile is Extract<PlayingTile, { family: 'suit' }> =>
          tile.family === 'suit',
      );
      const winds = all.filter(
        (tile): tile is Extract<PlayingTile, { family: 'wind' }> =>
          tile.family === 'wind',
      );
      if (
        suited.length !== 10 ||
        winds.length !== 4 ||
        new Set(suited.map((tile) => tile.suit)).size !== 1
      ) {
        return false;
      }
      const rankTally = counts(suited);
      const windTally = counts(winds);
      const suit = suited[0]?.suit;
      return (
        !!suit &&
        rankTally.get(`${suit}-1`) === 2 &&
        [2, 3, 4, 5, 6, 7, 8, 9].every(
          (rank) => rankTally.get(`${suit}-${rank}`) === 1,
        ) &&
        ['east', 'south', 'west', 'north'].every(
          (value) => windTally.get(`wind-${value}`) === 1,
        )
      );
    },
  },
  {
    id: 'all-winds-and-dragons',
    detect: (hand) => {
      const all = tiles(hand);
      return (
        hand.isWinner &&
        hand.sets.length === 5 &&
        hand.sets.filter((set) => set.kind === 'pair').length === 1 &&
        hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong')
          .length === 4 &&
        all.length >= 14 &&
        all.every((tile) => tile.family !== 'suit')
      );
    },
  },
  {
    id: 'heads-and-tails',
    detect: (hand) => {
      const all = tiles(hand);
      return (
        hand.isWinner &&
        hand.sets.length === 5 &&
        hand.sets.filter((set) => set.kind === 'pair').length === 1 &&
        hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong')
          .length === 4 &&
        all.every(isTerminal)
      );
    },
  },
  {
    id: 'fourfold-plenty',
    detect: (hand) =>
      hand.isWinner &&
      hand.sets.length === 5 &&
      hand.sets.filter((set) => set.kind === 'kong').length === 4 &&
      hand.sets.filter((set) => set.kind === 'pair').length === 1,
  },
  {
    id: 'three-great-scholars',
    detect: (hand) => {
      const dragons = new Set(
        hand.sets
          .filter(
            (set) =>
              (set.kind === 'pung' || set.kind === 'kong') &&
              set.tile.family === 'dragon',
          )
          .map((set) => (set.tile.family === 'dragon' ? set.tile.dragon : '')),
      );
      return (
        hand.isWinner &&
        hand.sets.length === 5 &&
        hand.sets.filter((set) => set.kind === 'pair').length === 1 &&
        hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong')
          .length === 4 &&
        dragons.size === 3
      );
    },
  },
  {
    id: 'four-blessings',
    detect: (hand) => {
      const windSets = hand.sets.filter(
        (set) =>
          (set.kind === 'pung' || set.kind === 'kong') &&
          set.tile.family === 'wind',
      );
      return (
        hand.isWinner &&
        hand.sets.length === 5 &&
        windSets.length === 4 &&
        new Set(
          windSets.map((set) =>
            set.tile.family === 'wind' ? set.tile.wind : '',
          ),
        ).size === 4 &&
        hand.sets.filter((set) => set.kind === 'pair').length === 1
      );
    },
  },
  {
    id: 'buried-treasure',
    detect: (hand) =>
      hand.isWinner &&
      hand.sets.length === 5 &&
      buriedVisibilityIsAllowed(hand) &&
      hand.sets.filter((set) => set.kind === 'pung').length === 4 &&
      hand.sets.filter((set) => set.kind === 'pair').length === 1 &&
      new Set(
        hand.sets.flatMap((set) =>
          set.tile.family === 'suit' ? [set.tile.suit] : [],
        ),
      ).size <= 1,
  },
  {
    id: 'heavens-blessing',
    eventBased: true,
    detect: (hand, context) =>
      hand.isWinner &&
      hand.winningMethod === 'initial-deal' &&
      tiles(hand).length === 14 &&
      hand.bonusTiles.length === 0 &&
      context?.playerWind === 'east',
  },
  {
    id: 'earths-blessing',
    eventBased: true,
    detect: (hand, context) =>
      hand.isWinner &&
      hand.winningMethod === 'discard' &&
      context?.playerWind !== undefined &&
      context.playerWind !== 'east' &&
      hand.winningEventEvidence?.type === 'discard' &&
      hand.winningEventEvidence.discardedBy === 'east' &&
      hand.winningEventEvidence.handDiscardOrdinal === 1,
  },
  {
    id: 'gathering-plum-blossom',
    eventBased: true,
    detect: (hand) =>
      hand.isWinner &&
      hand.winningMethod === 'loose-tile' &&
      isWinningTile(hand, 'circles', 5),
  },
  {
    id: 'plucking-moon',
    eventBased: true,
    detect: (hand) =>
      hand.isWinner &&
      hand.winningMethod === 'last-wall-tile' &&
      isWinningTile(hand, 'circles', 1),
  },
  {
    id: 'twofold-fortune',
    eventBased: true,
    detect: (hand) =>
      hand.isWinner &&
      hand.winningMethod === 'loose-tile' &&
      hand.winningEventEvidence?.type === 'replacement-chain' &&
      hand.winningEventEvidence.kongDeclarations === 2 &&
      hand.sets.filter((set) => set.kind === 'kong').length >= 2,
  },
];

const BMJA_SPECIAL_HAND_PROFILE: RulesProfileRef = Object.freeze({
  id: 'bmja',
  version: '1.0',
});
const bindingFor = (
  profile: RulesProfileRef,
  patternId: string,
  name: string,
  description: string,
  value: number,
): SpecialHandPatternBinding => ({
  patternId,
  profile,
  name,
  description,
  value,
});
const bmjaBinding = (
  patternId: string,
  name: string,
  description: string,
  value: number,
) => bindingFor(BMJA_SPECIAL_HAND_PROFILE, patternId, name, description, value);
export const bmjaSpecialHandBindings = [
  bmjaBinding(
    'knitting',
    'Knitting',
    'Seven pairs, each pairing the same number across two different suits; pairs may repeat.',
    500,
  ),
  bmjaBinding(
    'triple-knitting',
    'Triple Knitting',
    'Four same-number groups across all three suits, plus a same-number pair across two suits.',
    500,
  ),
  bmjaBinding(
    'all-pair-honours',
    'All pair honours',
    'Seven pairs of major tiles: 1s, 9s, winds and dragons; repeated pairs are allowed.',
    500,
  ),
  bmjaBinding(
    'imperial-jade',
    'Imperial Jade',
    'Four pungs/kongs and a pair using only Green Dragon or Bamboo 2, 3, 4, 6 and 8.',
    1000,
  ),
  bmjaBinding(
    'thirteen-unique-wonders',
    'Thirteen unique wonders',
    'One of every terminal, wind and dragon, plus a pair of any one.',
    1000,
  ),
  bmjaBinding(
    'gates-of-heaven',
    'The Gates of Heaven',
    'A concealed one-suit layout with three 1s, three 9s, 2 through 8, and one of 2 through 8 paired.',
    1000,
  ),
  bmjaBinding(
    'wriggling-snake',
    'The Wriggling Snake',
    'A pair of suited 1s, suited 2 through 9 in that suit, and one of each Wind.',
    1000,
  ),
  bmjaBinding(
    'all-winds-and-dragons',
    'All Winds and Dragons',
    'Four pungs/kongs and a pair, all made from winds and dragons.',
    1000,
  ),
  bmjaBinding(
    'heads-and-tails',
    'Heads and Tails',
    'Four pungs/kongs and a pair, all made from suited 1s and 9s.',
    1000,
  ),
  bmjaBinding(
    'fourfold-plenty',
    'Fourfold Plenty',
    'Four kongs and a pair.',
    1000,
  ),
  bmjaBinding(
    'three-great-scholars',
    'Three great scholars',
    'A pung or kong of each of the three dragons.',
    1000,
  ),
  bmjaBinding(
    'four-blessings',
    'Four Blessings Hovering over the Door',
    'A pung or kong of each wind, plus any pair.',
    1000,
  ),
  bmjaBinding(
    'buried-treasure',
    'Buried treasure',
    'Four concealed pungs and a concealed pair, using one suit with optional winds/dragons.',
    1000,
  ),
  bmjaBinding(
    'heavens-blessing',
    "Heaven's Blessing",
    'East makes Mah Jong immediately with the original fourteen dealt tiles.',
    1000,
  ),
  bmjaBinding(
    'earths-blessing',
    "Earth's Blessing",
    "A non-East player makes Mah Jong with East's first discard.",
    1000,
  ),
  bmjaBinding(
    'gathering-plum-blossom',
    'Gathering the Plum Blossom from the Roof',
    'A replacement tile is 5 Circles and completes Mah Jong.',
    1000,
  ),
  bmjaBinding(
    'plucking-moon',
    'Plucking the Moon from the Bottom of the Sea',
    'The last wall tile is 1 Circles and completes Mah Jong.',
    1000,
  ),
  bmjaBinding(
    'twofold-fortune',
    'Twofold Fortune',
    'One kong replacement completes another kong, whose replacement completes Mah Jong.',
    1000,
  ),
];
export const resolveSpecialHandBindings = (
  profile: RulesProfileRef,
  bindings = bmjaSpecialHandBindings,
  patterns = canonicalSpecialHandPatterns,
) => {
  const patternsById = new Map(
    patterns.map((pattern) => [pattern.id, pattern]),
  );
  for (const binding of bindings)
    if (!patternsById.has(binding.patternId))
      throw new Error(
        `Unknown canonical special-hand pattern "${binding.patternId}".`,
      );
  return bindings
    .filter(
      (binding) =>
        binding.profile.id === profile.id &&
        binding.profile.version === profile.version,
    )
    .map((binding) => ({
      binding,
      pattern: patternsById.get(binding.patternId)!,
    }));
};
const bmjaSpecialHandPatterns = resolveSpecialHandBindings(
  BMJA_SPECIAL_HAND_PROFILE,
);
export const specialHandDetectors = bmjaSpecialHandPatterns.map(
  ({ binding, pattern }) => ({
    id: pattern.id,
    name: binding.name,
    description: binding.description,
    ...(isFixedSpecialHandBinding(binding) ? { value: binding.value } : {}),
    eventBased: pattern.eventBased,
    detect: pattern.detect,
  }),
);

export const detectSpecialHands = (
  hand: MahjongHand,
  context?: GameContext,
  bindings = bmjaSpecialHandBindings,
): SpecialHandResult[] =>
  resolveSpecialHandBindings(
    bindings[0]?.profile ?? BMJA_SPECIAL_HAND_PROFILE,
    bindings,
  ).map(({ binding, pattern }) =>
    isFixedSpecialHandBinding(binding)
      ? {
          id: pattern.id,
          name: binding.name,
          description: binding.description,
          scoreModel: 'fixed' as const,
          value: specialHandValueFor(hand, binding),
          matched: pattern.detect(hand, context) && fixedBindingAllowsHand(hand, binding),
        }
      : {
          id: pattern.id,
          name: binding.name,
          description: binding.description,
          scoreModel: 'calculated' as const,
          matched:
            pattern.detect(hand, context) &&
            !hasUnsupportedCalculatedExposure(hand, binding),
        },
  );

export const matchesSupportedIrregularLayout = (
  hand: MahjongHand,
  bindings = bmjaSpecialHandBindings,
): boolean =>
  resolveSpecialHandBindings(
    bindings[0]?.profile ?? BMJA_SPECIAL_HAND_PROFILE,
    bindings,
  )
    .filter(({ pattern }) => pattern.eventBased !== true)
    .some(({ pattern }) => pattern.detect(hand));
