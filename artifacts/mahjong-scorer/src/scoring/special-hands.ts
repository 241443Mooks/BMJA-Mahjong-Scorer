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

/** A complete ordinary grouped hand, keeping structure and physical tiles separate. */
const groupedShape = (hand: MahjongHand, meldCount: number, pairCount = 1) => {
  const all = tiles(hand);
  const melds = hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong');
  const pairs = hand.sets.filter((set) => set.kind === 'pair');
  return hand.isWinner &&
    hand.sets.length === meldCount + pairCount &&
    (hand.looseTiles?.length ?? 0) === 0 &&
    (hand.remainingTiles?.length ?? 0) === 0 &&
    melds.length === meldCount && pairs.length === pairCount &&
    all.length === 14 + hand.sets.filter((set) => set.kind === 'kong').length &&
    hasAtMostFourCopies(all)
    ? { melds, pairs, all }
    : undefined;
};

const isSuitRank = (tile: PlayingTile, suit: Extract<PlayingTile, { family: 'suit' }>['suit'], ranks: readonly number[]) =>
  tile.family === 'suit' && tile.suit === suit && ranks.includes(tile.rank);

const isPung = (kind: SetKind) => kind === 'pung';

const isExactRunWithPair = (
  values: PlayingTile[],
  ranks: readonly number[],
  allowedSuits: readonly Extract<PlayingTile, { family: 'suit' }>['suit'][],
) => {
  if (values.length !== ranks.length + 1 || values.some((tile) => tile.family !== 'suit')) return undefined;
  const suited = values as Extract<PlayingTile, { family: 'suit' }>[];
  const suit = suited[0]?.suit;
  if (!suit || !allowedSuits.includes(suit) || suited.some((tile) => tile.suit !== suit)) return undefined;
  const tally = counts(suited);
  return ranks.every((rank) => (tally.get(`${suit}-${rank}`) ?? 0) >= 1) &&
    [...tally.entries()].every(([key, count]) => ranks.includes(Number(key.split('-')[1])) && (count === 1 || count === 2)) &&
    [...tally.values()].filter((count) => count === 2).length === 1
    ? suit
    : undefined;
};

const isCompleteHybrid = (hand: MahjongHand, setCount: number, looseCount: number) =>
  hand.isWinner && hand.sets.length === setCount &&
  (hand.looseTiles?.length ?? 0) === looseCount &&
  (hand.remainingTiles?.length ?? 0) === 0 &&
  tiles(hand).length === 14 + hand.sets.filter((set) => set.kind === 'kong').length &&
  hasAtMostFourCopies(tiles(hand));

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

const hasWindPairAndSingles = (values: PlayingTile[]) => {
  const tally = counts(values);
  return values.length === 5 &&
    ['east', 'south', 'west', 'north'].every((value) => (tally.get(`wind-${value}`) ?? 0) >= 1) &&
    [...tally.values()].filter((count) => count === 2).length === 1 &&
    [...tally.values()].every((count) => count === 1 || count === 2);
};

const windPairWithThreeSuitMelds = (hand: MahjongHand, requiredRank?: number) => {
  const all = tiles(hand);
  const melds = hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong');
  const pairs = hand.sets.filter((set) => set.kind === 'pair');
  const looseWinds = hand.looseTiles ?? [];
  if (
    !hand.isWinner ||
    hand.sets.length !== 4 ||
    melds.length !== 3 ||
    pairs.length !== 1 ||
    looseWinds.length !== 3 ||
    (hand.remainingTiles?.length ?? 0) !== 0 ||
    all.length !== 14 + hand.sets.filter((set) => set.kind === 'kong').length ||
    !hasAtMostFourCopies(all)
  ) return false;
  const pair = pairs[0];
  if (pair?.tile.family !== 'wind' || looseWinds.some((tile) => tile.family !== 'wind')) return false;
  const windCounts = counts([pair.tile, pair.tile, ...looseWinds]);
  if (!hasWindPairAndSingles([pair.tile, pair.tile, ...looseWinds])) return false;
  if (windCounts.get(`wind-${pair.tile.wind}`) !== 2) return false;
  return ['bamboo', 'characters', 'circles'].every((suit) =>
    melds.filter((set) =>
      set.tile.family === 'suit' &&
      set.tile.suit === suit &&
      (requiredRank === undefined || set.tile.rank === requiredRank),
    ).length === 1,
  );
};

const hasChowInEachSuit = (
  values: PlayingTile[],
  rank?: Extract<PlayingTile, { family: 'suit' }>['rank'],
) => {
  if (values.length !== 9 || values.some((tile) => tile.family !== 'suit')) return false;
  const suited = values as Extract<PlayingTile, { family: 'suit' }>[];
  return ['bamboo', 'characters', 'circles'].every((suit) => {
    const suitTiles = suited.filter((tile) => tile.suit === suit);
    return suitTiles.length === 3 &&
      (rank === undefined
        ? [...new Set(suitTiles.map((tile) => tile.rank))].length === 3 &&
          Math.max(...suitTiles.map((tile) => tile.rank)) - Math.min(...suitTiles.map((tile) => tile.rank)) === 2
        : [rank, rank + 1, rank + 2].every((value) => counts(suitTiles).get(`${suit}-${value}`) === 1));
  });
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
    id: 'full-suit-run-with-honour-pung-and-opposite-honour-pair',
    detect: (hand) => {
      const shape = groupedRunShape(hand);
      return shape !== undefined &&
        ((shape.pungOrKong.tile.family === 'wind' && shape.pair.tile.family === 'dragon') ||
          (shape.pungOrKong.tile.family === 'dragon' && shape.pair.tile.family === 'wind'));
    },
  },
  {
    id: 'all-pair-green-dragon-and-bamboo',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const all = tiles(hand);
      const tally = counts(all);
      return all.every((tile) => tile.family === 'dragon' ? tile.dragon === 'green' : isSuitRank(tile, 'bamboo', [2, 3, 4, 6, 8])) &&
        [...tally.values()].every((count) => count === 2 || count === 4) &&
        (tally.get('dragon-green') === 2 || tally.get('dragon-green') === 4) &&
        [...tally.values()].reduce((sum, count) => sum + count / 2, 0) === 7;
    },
  },
  {
    id: 'four-wind-pairs-with-two-dragon-melds',
    detect: (hand) => {
      const shape = groupedShape(hand, 2, 4);
      const winds = shape?.pairs.filter((set) => set.tile.family === 'wind') ?? [];
      return shape !== undefined && winds.length === 4 &&
        new Set(winds.map((set) => set.tile.family === 'wind' ? set.tile.wind : undefined)).size === 4 &&
        shape.melds.every((set) => set.tile.family === 'dragon');
    },
  },
  {
    id: 'red-dragon-pung-with-character-melds',
    detect: (hand) => {
      const shape = groupedShape(hand, 4);
      return shape !== undefined && shape.melds.filter((set) => set.tile.family === 'dragon' && set.tile.dragon === 'red' && isPung(set.kind)).length === 1 &&
        shape.melds.filter((set) => isSuitRank(set.tile, 'characters', [1,2,3,4,5,6,7,8,9])).length === 3 &&
        isSuitRank(shape.pairs[0].tile, 'characters', [1,2,3,4,5,6,7,8,9]);
    },
  },
  {
    id: 'white-dragon-pung-with-circle-melds',
    detect: (hand) => {
      const shape = groupedShape(hand, 4);
      return shape !== undefined && shape.melds.filter((set) => set.tile.family === 'dragon' && set.tile.dragon === 'white' && isPung(set.kind)).length === 1 &&
        shape.melds.filter((set) => isSuitRank(set.tile, 'circles', [1,2,3,4,5,6,7,8,9])).length === 3 && isSuitRank(shape.pairs[0].tile, 'circles', [1,2,3,4,5,6,7,8,9]);
    },
  },
  {
    id: 'one-suit-odd-melds',
    detect: (hand) => {
      const shape = groupedShape(hand, 4);
      const suit = shape?.all[0]?.family === 'suit' ? shape.all[0].suit : undefined;
      return shape !== undefined && suit !== undefined && shape.all.every((tile) => isSuitRank(tile, suit, [1,3,5,7,9]));
    },
  },
  {
    id: 'two-odd-suits-and-one-even-suit',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const tally = counts(tiles(hand));
      const suits = ['bamboo', 'characters', 'circles'] as const;
      return suits.some((evenSuit) => suits.filter((suit) => suit !== evenSuit).every((suit) => [1,3,5,7,9].every((rank) => tally.get(`${suit}-${rank}`) === 1)) && [2,4,6,8].every((rank) => tally.get(`${evenSuit}-${rank}`) === 1) && tally.size === 14);
    },
  },
  {
    id: 'four-chows-three-suits-one-two-one',
    detect: (hand) => {
      if (!hand.isWinner || hand.sets.length !== 5 || (hand.looseTiles?.length ?? 0) !== 0 || (hand.remainingTiles?.length ?? 0) !== 0 || !hasAtMostFourCopies(tiles(hand))) return false;
      const chows = hand.sets.filter((set) => set.kind === 'chow' && set.tile.family === 'suit'); const pair = hand.sets.find((set) => set.kind === 'pair');
      if (chows.length !== 4 || !pair || pair.tile.family !== 'suit' || chows.some((set) => set.tile.family !== 'suit')) return false;
      const bySuit = new Map<string, number>(); for (const chow of chows) if (chow.tile.family === 'suit') bySuit.set(chow.tile.suit, (bySuit.get(chow.tile.suit) ?? 0) + 1);
      return bySuit.size === 3 && [...bySuit.values()].sort().join(',') === '1,1,2' && (bySuit.get(pair.tile.suit) ?? 0) === 1;
    },
  },
  {
    id: 'parallel-suit-rank-melds-with-honours',
    detect: (hand) => {
      const shape = groupedShape(hand, 4);
      if (!shape) return false;
      const suited = shape.melds.filter((set) => set.tile.family === 'suit'); const honours = shape.melds.filter((set) => set.tile.family !== 'suit');
      const suitTiles = suited.map((set) => set.tile).filter((tile): tile is Extract<PlayingTile, { family: 'suit' }> => tile.family === 'suit');
      return suited.length === 3 && honours.length === 1 && shape.pairs[0].tile.family !== 'suit' && new Set(suitTiles.map((tile) => tile.suit)).size === 3 && new Set(suitTiles.map((tile) => tile.rank)).size === 1 && suitTiles[0].rank >= 2 && suitTiles[0].rank <= 8;
    },
  },
  {
    id: 'green-dragon-pung-with-blue-circle-melds',
    detect: (hand) => {
      const shape = groupedShape(hand, 4); const blue = [2,3,4,5,8,9];
      return shape !== undefined && shape.melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === 'green' && isPung(set.kind)) && shape.melds.filter((set) => isSuitRank(set.tile, 'circles', blue)).length === 3 && isSuitRank(shape.pairs[0].tile, 'circles', blue);
    },
  },
  {
    id: 'white-dragon-meld-with-even-circle-melds',
    detect: (hand) => {
      const shape = groupedShape(hand, 4); const even = [2,4,6,8];
      return shape !== undefined && shape.melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === 'white') && shape.melds.filter((set) => isSuitRank(set.tile, 'circles', even)).length === 3 && isSuitRank(shape.pairs[0].tile, 'circles', even);
    },
  },
  {
    id: 'white-dragon-pung-with-odd-character-melds',
    detect: (hand) => { const shape = groupedShape(hand, 4); return shape !== undefined && shape.melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === 'white' && isPung(set.kind)) && shape.melds.filter((set) => isSuitRank(set.tile, 'characters', [1,3,5,7,9])).length === 3 && isSuitRank(shape.pairs[0].tile, 'characters', [1,3,5,7,9]); },
  },
  {
    id: 'red-dragon-pung-with-even-character-melds',
    detect: (hand) => { const shape = groupedShape(hand, 4); return shape !== undefined && shape.melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === 'red' && isPung(set.kind)) && shape.melds.filter((set) => isSuitRank(set.tile, 'characters', [2,4,6,8])).length === 3 && isSuitRank(shape.pairs[0].tile, 'characters', [2,4,6,8]); },
  },
  {
    id: 'green-dragon-pung-with-bamboo-melds',
    detect: (hand) => { const shape = groupedShape(hand, 4); return shape !== undefined && shape.melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === 'green' && isPung(set.kind)) && shape.melds.filter((set) => isSuitRank(set.tile, 'bamboo', [1,2,3,4,5,6,7,8,9])).length === 3 && isSuitRank(shape.pairs[0].tile, 'bamboo', [1,2,3,4,5,6,7,8,9]); },
  },
  {
    id: 'green-and-white-dragon-melds-with-green-bamboo',
    detect: (hand) => { const shape = groupedShape(hand, 4); const green = [2,3,4,6,8]; return shape !== undefined && ['green','white'].every((value) => shape.melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === value)) && shape.melds.filter((set) => isSuitRank(set.tile, 'bamboo', green)).length === 2 && isSuitRank(shape.pairs[0].tile, 'bamboo', green); },
  },
  {
    id: 'red-and-green-dragon-pungs-with-three-suits',
    detect: (hand) => { const shape = groupedShape(hand, 4); const suits = ['bamboo','circles','characters'] as const; return shape !== undefined && shape.melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === 'red' && isPung(set.kind)) && shape.pairs[0].tile.family === 'dragon' && shape.pairs[0].tile.dragon === 'green' && suits.every((suit) => shape.melds.some((set) => isSuitRank(set.tile, suit, suit === 'bamboo' ? [1,5,7,9] : [1,2,3,4,5,6,7,8,9]) && isPung(set.kind))); },
  },
  {
    id: 'red-dragon-meld-with-red-bamboo-melds',
    detect: (hand) => { const shape = groupedShape(hand, 4); const red = [1,5,7,9]; return shape !== undefined && shape.melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === 'red') && shape.melds.filter((set) => isSuitRank(set.tile, 'bamboo', red)).length === 3 && isSuitRank(shape.pairs[0].tile, 'bamboo', red); },
  },
  {
    id: 'red-and-white-dragon-melds-with-red-bamboo',
    detect: (hand) => { const shape = groupedShape(hand, 4); const red = [1,5,7,9]; return shape !== undefined && ['red','white'].every((value) => shape.melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === value)) && shape.melds.filter((set) => isSuitRank(set.tile, 'bamboo', red)).length === 2 && isSuitRank(shape.pairs[0].tile, 'bamboo', red); },
  },
  {
    id: 'red-and-green-dragon-melds-with-bamboo',
    detect: (hand) => { const shape = groupedShape(hand, 4); return shape !== undefined && ['red','green'].every((value) => shape.melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === value)) && shape.melds.filter((set) => isSuitRank(set.tile, 'bamboo', [1,2,3,4,5,6,7,8,9])).length === 2 && isSuitRank(shape.pairs[0].tile, 'bamboo', [1,2,3,4,5,6,7,8,9]); },
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
    id: 'east-wind-meld-white-dragon-pair-three-suit-nonterminal-melds',
    detect: (hand) => {
      const shape = groupedShape(hand, 4);
      if (!shape || shape.pairs[0].tile.family !== 'dragon' || shape.pairs[0].tile.dragon !== 'white') return false;
      const suited = shape.melds.filter((set) => set.tile.family === 'suit');
      return shape.melds.some((set) => set.tile.family === 'wind' && set.tile.wind === 'east') &&
        suited.length === 3 &&
        new Set(suited.map((set) => set.tile.family === 'suit' ? set.tile.suit : undefined)).size === 3 &&
        suited.every((set) => set.tile.family === 'suit' && set.tile.rank >= 2 && set.tile.rank <= 8);
    },
  },
  {
    id: 'white-dragon-meld-red-dragon-pair-three-suit-nonterminal-melds',
    detect: (hand) => {
      const shape = groupedShape(hand, 4);
      if (!shape || shape.pairs[0].tile.family !== 'dragon' || shape.pairs[0].tile.dragon !== 'red') return false;
      const suited = shape.melds.filter((set) => set.tile.family === 'suit');
      return shape.melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === 'white') &&
        suited.length === 3 &&
        new Set(suited.map((set) => set.tile.family === 'suit' ? set.tile.suit : undefined)).size === 3 &&
        suited.every((set) => set.tile.family === 'suit' && set.tile.rank >= 2 && set.tile.rank <= 8);
    },
  },
  {
    id: 'honours-and-one-suit-terminals-pung-kong-hand',
    detect: (hand) => {
      const shape = groupedShape(hand, 4);
      if (!shape) return false;
      const suited = shape.all.filter((tile): tile is Extract<PlayingTile, { family: 'suit' }> => tile.family === 'suit');
      return shape.all.every((tile) => tile.family !== 'suit' || tile.rank === 1 || tile.rank === 9) &&
        new Set(suited.map((tile) => tile.suit)).size <= 1;
    },
  },
  {
    id: 'one-suit-with-honours-mostly-pung-kong-hand',
    detect: (hand) => {
      if (!hand.isWinner || hand.sets.length !== 5 || (hand.looseTiles?.length ?? 0) !== 0 || (hand.remainingTiles?.length ?? 0) !== 0) return false;
      const melds = hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong' || set.kind === 'chow');
      const pairs = hand.sets.filter((set) => set.kind === 'pair');
      const chows = hand.sets.filter((set) => set.kind === 'chow');
      const all = tiles(hand);
      const suited = all.filter((tile): tile is Extract<PlayingTile, { family: 'suit' }> => tile.family === 'suit');
      return melds.length === 4 && pairs.length === 1 && chows.length <= 1 &&
        chows.every((set) => set.tile.family === 'suit' && set.tile.rank >= 1 && set.tile.rank <= 7) &&
        all.length === 14 + hand.sets.filter((set) => set.kind === 'kong').length &&
        hasAtMostFourCopies(all) && new Set(suited.map((tile) => tile.suit)).size <= 1;
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
  { id: 'suit-run-one-to-seven-with-winds-and-dragon-pung', detect: (hand) => { if (!isCompleteLooseLayout(hand)) return false; const all = tiles(hand), suited = all.filter((tile) => tile.family === 'suit'), winds = all.filter((tile) => tile.family === 'wind'), dragons = all.filter((tile) => tile.family === 'dragon'); return isSingleSuitRun(suited, [1, 2, 3, 4, 5, 6, 7]) && winds.length === 4 && hasExactlyOneOfEachWind(winds) && dragons.length === 3 && counts(dragons).size === 1; } },
  { id: 'full-suit-run-with-dragon-singles-and-wind-pair', detect: (hand) => { if (!isCompleteLooseLayout(hand)) return false; const all = tiles(hand), dragons = all.filter((tile) => tile.family === 'dragon'), winds = all.filter((tile) => tile.family === 'wind'); return isSingleSuitRun(all.filter((tile) => tile.family === 'suit'), [1, 2, 3, 4, 5, 6, 7, 8, 9]) && dragons.length === 3 && ['green', 'red', 'white'].every((value) => counts(dragons).get(`dragon-${value}`) === 1) && winds.length === 2 && counts(winds).size === 1; } },
  { id: 'two-suit-pairs-and-chows-one-two-five-six-nine', detect: (hand) => { if (!isCompleteLooseLayout(hand)) return false; const all = tiles(hand); if (all.some((tile) => tile.family !== 'suit')) return false; const suits = ['bamboo', 'characters', 'circles'] as const; return suits.some((first) => suits.some((second) => first !== second && [1, 5].every((rank) => counts(all).get(`${first}-${rank}`) === 2) && [2, 3, 4].every((rank) => counts(all).get(`${first}-${rank}`) === 1) && [5, 9].every((rank) => counts(all).get(`${second}-${rank}`) === 2) && [6, 7, 8].every((rank) => counts(all).get(`${second}-${rank}`) === 1) && all.length === 14)); } },
  { id: 'wind-pair-with-three-suit-chows', detect: (hand) => { if (!isCompleteLooseLayout(hand)) return false; const all = tiles(hand); return hasWindPairAndSingles(all.filter((tile) => tile.family === 'wind')) && hasChowInEachSuit(all.filter((tile) => tile.family === 'suit')); } },
  { id: 'wind-pair-with-three-suit-one-two-three-chows', detect: (hand) => { if (!isCompleteLooseLayout(hand)) return false; const all = tiles(hand); return hasWindPairAndSingles(all.filter((tile) => tile.family === 'wind')) && hasChowInEachSuit(all.filter((tile) => tile.family === 'suit'), 1); } },
  { id: 'wind-pair-with-three-suit-seven-eight-nine-chows', detect: (hand) => { if (!isCompleteLooseLayout(hand)) return false; const all = tiles(hand); return hasWindPairAndSingles(all.filter((tile) => tile.family === 'wind')) && hasChowInEachSuit(all.filter((tile) => tile.family === 'suit'), 7); } },
  { id: 'wind-pair-with-three-suit-rank-one-melds', detect: (hand) => windPairWithThreeSuitMelds(hand, 1) },
  { id: 'wind-pair-with-three-suit-rank-nine-melds', detect: (hand) => windPairWithThreeSuitMelds(hand, 9) },
  { id: 'wind-pair-with-one-meld-in-each-suit', detect: (hand) => windPairWithThreeSuitMelds(hand) },
  { id: 'wind-pair-with-three-suit-rank-three-melds', detect: (hand) => windPairWithThreeSuitMelds(hand, 3) },
  { id: 'wind-pair-with-three-suit-rank-seven-melds', detect: (hand) => windPairWithThreeSuitMelds(hand, 7) },
  {
    id: 'three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair',
    detect: (hand) => {
      if (!isCompleteHybrid(hand, 4, 3)) return false;
      const melds = hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong');
      const pair = hand.sets.find((set) => set.kind === 'pair');
      const dragons = hand.looseTiles ?? [];
      return melds.length === 3 && pair?.tile.family === 'suit' &&
        melds.every((set) => set.tile.family === 'suit') &&
        new Set(melds.map((set) => set.tile.family === 'suit' ? set.tile.suit : undefined)).size === 3 &&
        dragons.every((tile) => tile.family === 'dragon') &&
        ['green', 'red', 'white'].every((dragon) => counts(dragons).get(`dragon-${dragon}`) === 1);
    },
  },
  {
    id: 'western-gates-of-heaven',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const all = tiles(hand);
      if (all.some((tile) => tile.family !== 'suit')) return false;
      const suited = all as Extract<PlayingTile, { family: 'suit' }>[];
      const suit = suited[0]?.suit;
      const tally = counts(suited);
      return suit !== undefined && suited.every((tile) => tile.suit === suit) &&
        tally.get(`${suit}-1`) === 3 && tally.get(`${suit}-9`) === 3 &&
        [2, 3, 4, 5, 6, 7, 8].every((rank) => [1, 2].includes(tally.get(`${suit}-${rank}`) ?? 0)) &&
        [2, 3, 4, 5, 6, 7, 8].filter((rank) => tally.get(`${suit}-${rank}`) === 2).length === 1;
    },
  },
  {
    id: 'two-suit-runs-one-to-seven',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const all = tiles(hand);
      if (all.some((tile) => tile.family !== 'suit')) return false;
      const tally = counts(all);
      const suits = ['bamboo', 'characters', 'circles'] as const;
      return suits.filter((suit) => [1, 2, 3, 4, 5, 6, 7].every((rank) => tally.get(`${suit}-${rank}`) === 1)).length === 2 && tally.size === 14;
    },
  },
  {
    id: 'green-dragon-pung-white-dragon-pair-three-circle-melds',
    detect: (hand) => {
      const shape = groupedShape(hand, 4);
      return shape !== undefined && shape.pairs[0].tile.family === 'dragon' && shape.pairs[0].tile.dragon === 'white' &&
        shape.melds.filter((set) => set.tile.family === 'dragon' && set.tile.dragon === 'green' && set.kind === 'pung').length === 1 &&
        shape.melds.filter((set) => isSuitRank(set.tile, 'circles', [1,2,3,4,5,6,7,8,9])).length === 3;
    },
  },
  {
    id: 'two-ranks-doubled-across-two-suits-with-honour-pair',
    detect: (hand) => {
      const shape = groupedShape(hand, 4);
      if (!shape || shape.pairs[0].tile.family === 'suit') return false;
      const suited = shape.melds.filter((set) => set.tile.family === 'suit');
      if (suited.length !== 4) return false;
      const tiles = suited.map((set) => set.tile as Extract<PlayingTile, { family: 'suit' }>);
      const suits = new Set(tiles.map((tile) => tile.suit));
      const ranks = new Set(tiles.map((tile) => tile.rank));
      return suits.size === 2 && ranks.size === 2 && [...ranks].every((rank) => rank >= 2 && rank <= 8) &&
        [...suits].every((suit) => [...ranks].every((rank) => tiles.some((tile) => tile.suit === suit && tile.rank === rank)));
    },
  },
  {
    id: 'north-south-wind-melds-with-1861-and-1865-two-suit-layout',
    detect: (hand) => {
      if (!isCompleteHybrid(hand, 2, 8)) return false;
      const melds = hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong');
      const loose = hand.looseTiles ?? [];
      if (melds.length !== 2 || !['north', 'south'].every((wind) => melds.some((set) => set.tile.family === 'wind' && set.tile.wind === wind)) || loose.some((tile) => tile.family !== 'suit')) return false;
      const suited = loose as Extract<PlayingTile, { family: 'suit' }>[];
      const suits = [...new Set(suited.map((tile) => tile.suit))];
      return suits.length === 2 && suits.some((suit) => {
        const tally = counts(suited.filter((tile) => tile.suit === suit));
        return tally.get(`${suit}-1`) === 2 && tally.get(`${suit}-6`) === 1 && tally.get(`${suit}-8`) === 1 && tally.size === 3;
      }) && suits.some((suit) => {
        const tally = counts(suited.filter((tile) => tile.suit === suit));
        return [1, 5, 6, 8].every((rank) => tally.get(`${suit}-${rank}`) === 1) && tally.size === 4;
      });
    },
  },
  {
    id: 'two-to-eight-run-pair-with-terminal-meld-and-corresponding-dragon-meld',
    detect: (hand) => {
      if (!isCompleteHybrid(hand, 2, 8)) return false;
      const loose = hand.looseTiles ?? [];
      const suit = isExactRunWithPair(loose, [2,3,4,5,6,7,8], ['bamboo', 'characters', 'circles']);
      if (!suit) return false;
      const requiredDragon = { bamboo: 'green', characters: 'red', circles: 'white' } as const;
      const melds = hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong');
      return melds.length === 2 && melds.some((set) => set.tile.family === 'suit' && set.tile.suit === suit && (set.tile.rank === 1 || set.tile.rank === 9)) &&
        melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === requiredDragon[suit]);
    },
  },
  {
    id: 'one-to-seven-run-pair-with-red-dragon-and-own-wind-melds',
    detect: (hand, context) => {
      if (!context || !isCompleteHybrid(hand, 2, 8)) return false;
      if (!isExactRunWithPair(hand.looseTiles ?? [], [1,2,3,4,5,6,7], ['bamboo', 'characters', 'circles'])) return false;
      const melds = hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong');
      return melds.length === 2 && melds.some((set) => set.tile.family === 'dragon' && set.tile.dragon === 'red') &&
        melds.some((set) => set.tile.family === 'wind' && set.tile.wind === context.playerWind);
    },
  },
  {
    id: 'red-white-dragon-pungs-with-seven-tile-character-or-circle-run-pair',
    detect: (hand) => {
      if (!isCompleteHybrid(hand, 2, 8)) return false;
      const dragonPungs = hand.sets.filter((set) => set.kind === 'pung' && set.tile.family === 'dragon');
      if (dragonPungs.length !== 2 || !['red', 'white'].every((dragon) => dragonPungs.some((set) => set.tile.family === 'dragon' && set.tile.dragon === dragon))) return false;
      const loose = hand.looseTiles ?? [];
      return isExactRunWithPair(loose, [1, 2, 3, 4, 5, 6, 7], ['characters', 'circles']) !== undefined ||
        isExactRunWithPair(loose, [2, 3, 4, 5, 6, 7, 8], ['characters', 'circles']) !== undefined;
    },
  },
  {
    id: 'four-chows-three-suits-with-own-wind-pair',
    detect: (hand, context) => {
      if (!context || !hand.isWinner || hand.sets.length !== 5 || (hand.looseTiles?.length ?? 0) !== 0 || (hand.remainingTiles?.length ?? 0) !== 0 || !hasAtMostFourCopies(tiles(hand))) return false;
      const chows = hand.sets.filter((set) => set.kind === 'chow');
      const pair = hand.sets.find((set) => set.kind === 'pair');
      return chows.length === 4 && pair?.tile.family === 'wind' && pair.tile.wind === context.playerWind &&
        chows.every((set) => set.tile.family === 'suit' && set.tile.rank <= 7) &&
        new Set(chows.map((set) => set.tile.family === 'suit' ? set.tile.suit : undefined)).size === 3;
    },
  },
  {
    id: 'own-wind-meld-with-dragon-pair-and-three-suit-chows',
    detect: (hand, context) => {
      if (!context || !hand.isWinner || hand.sets.length !== 5 || (hand.looseTiles?.length ?? 0) !== 0 || (hand.remainingTiles?.length ?? 0) !== 0 || !hasAtMostFourCopies(tiles(hand))) return false;
      const chows = hand.sets.filter((set) => set.kind === 'chow');
      const ownWind = hand.sets.find((set) => (set.kind === 'pung' || set.kind === 'kong') && set.tile.family === 'wind');
      const pair = hand.sets.find((set) => set.kind === 'pair');
      return chows.length === 3 && ownWind?.tile.family === 'wind' && ownWind.tile.wind === context.playerWind &&
        pair?.tile.family === 'dragon' && chows.every((set) => set.tile.family === 'suit' && set.tile.rank <= 7) &&
        new Set(chows.map((set) => set.tile.family === 'suit' ? set.tile.suit : undefined)).size === 3;
    },
  },
  { id: 'three-suit-chows-with-suited-meld-and-pair', detect: (hand) => { if (!hand.isWinner || hand.sets.length !== 5 || (hand.looseTiles?.length ?? 0) !== 0 || (hand.remainingTiles?.length ?? 0) !== 0 || !hasAtMostFourCopies(tiles(hand))) return false; const chows = hand.sets.filter((set) => set.kind === 'chow'), melds = hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong'), pairs = hand.sets.filter((set) => set.kind === 'pair'); return chows.length === 3 && melds.length === 1 && pairs.length === 1 && chows.every((set) => set.tile.family === 'suit' && set.tile.rank <= 7) && new Set(chows.map((set) => set.tile.family === 'suit' ? set.tile.suit : undefined)).size === 3 && melds[0]?.tile.family === 'suit' && pairs[0]?.tile.family === 'suit'; } },
  { id: 'circle-chows-with-one-two-three-four-five-six-seven-eight-nine', detect: (hand) => { if (!hand.isWinner || hand.sets.length !== 5 || (hand.looseTiles?.length ?? 0) !== 0 || (hand.remainingTiles?.length ?? 0) !== 0 || !hasAtMostFourCopies(tiles(hand))) return false; const chows = hand.sets.filter((set) => set.kind === 'chow'); const pair = hand.sets.find((set) => set.kind === 'pair'); return chows.length === 4 && pair?.tile.family === 'suit' && pair.tile.suit === 'circles' && chows.every((set) => set.tile.family === 'suit' && set.tile.suit === 'circles' && set.tile.rank <= 7) && [1, 4, 7].every((rank) => chows.some((set) => set.tile.family === 'suit' && set.tile.rank === rank)); } },
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
    id: 'two-suit-knitting',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const tally = suitedRankCounts(tiles(hand));
      if (tally === null) return false;
      const suits = new Set(tiles(hand).map((tile) => tile.family === 'suit' ? tile.suit : undefined));
      if (suits.size !== 2 || suits.has(undefined)) return false;
      return [...tally.values()].every((rankCounts) => {
        const values = [...rankCounts.values()];
        return rankCounts.size === 2 && values[0] === values[1];
      }) && [...tally.values()].reduce((sum, rankCounts) => sum + [...rankCounts.values()].reduce((rankSum, count) => rankSum + count, 0) / 2, 0) === 7;
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
    id: 'three-suit-knitting-with-pair',
    detect: (hand) => {
      if (!isCompleteLooseLayout(hand)) return false;
      const tally = suitedRankCounts(tiles(hand));
      if (tally === null) return false;
      const suits = ['bamboo', 'characters', 'circles'] as const;
      return [...tally.entries()].some(([pairRank, rankCounts]) =>
        suits.some((firstSuit, firstIndex) =>
          suits.slice(firstIndex + 1).some((secondSuit) => {
            if ((rankCounts.get(firstSuit) ?? 0) < 1 || (rankCounts.get(secondSuit) ?? 0) < 1) return false;
            let triplets = 0;
            for (const [rank, values] of tally) {
              const adjusted = suits.map((suit) =>
                (values.get(suit) ?? 0) - (rank === pairRank && (suit === firstSuit || suit === secondSuit) ? 1 : 0),
              );
              if (adjusted.some((value) => value < 0) || adjusted[0] !== adjusted[1] || adjusted[1] !== adjusted[2]) return false;
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
    id: 'green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow',
    detect: (hand) => {
      const all = tiles(hand);
      if (
        !hand.isWinner ||
        hand.sets.length !== 5 ||
        (hand.looseTiles?.length ?? 0) !== 0 ||
        (hand.remainingTiles?.length ?? 0) !== 0 ||
        all.length !== 14 + hand.sets.filter((set) => set.kind === 'kong').length ||
        !hasAtMostFourCopies(all)
      ) return false;
      const dragonMelds = hand.sets.filter((set) =>
        (set.kind === 'pung' || set.kind === 'kong') && set.tile.family === 'dragon' && set.tile.dragon === 'green',
      );
      const bambooMelds = hand.sets.filter((set) => set.kind !== 'pair' && set.tile.family === 'suit' && set.tile.suit === 'bamboo');
      const pairs = hand.sets.filter((set) => set.kind === 'pair');
      return dragonMelds.length === 1 && bambooMelds.length === 3 && pairs.length === 1 &&
        bambooMelds.filter((set) => set.kind === 'chow').length <= 1 &&
        bambooMelds.every((set) =>
          set.kind === 'chow'
            ? isSuitRank(set.tile, 'bamboo', [2])
            : set.kind === 'pung' || set.kind === 'kong'
              ? isSuitRank(set.tile, 'bamboo', [2, 3, 4, 6, 8])
              : false,
        ) &&
        isSuitRank(pairs[0]!.tile, 'bamboo', [2, 3, 4, 6, 8]);
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
  context?: GameContext,
): boolean =>
  resolveSpecialHandBindings(
    bindings[0]?.profile ?? BMJA_SPECIAL_HAND_PROFILE,
    bindings,
  )
    .filter(({ pattern }) => pattern.eventBased !== true)
    .some(({ pattern }) => pattern.detect(hand, context));
