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
  SpecialHandResult,
} from './types';

type Detector = {
  id: string;
  name: string;
  description: string;
  value: number;
  eventBased?: boolean;
  detect: (hand: MahjongHand, context?: GameContext) => boolean;
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
  hand.winningMethod === 'discard' ||
  hand.winningMethod === 'final-discard';

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
export const specialHandDetectors: Detector[] = [
  {
    id: 'knitting',
    name: 'Knitting',
    description:
      'Seven pairs, each pairing the same number across two different suits; pairs may repeat.',
    value: 500,
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
    name: 'Triple Knitting',
    description:
      'Four same-number groups across all three suits, plus a same-number pair across two suits.',
    value: 500,
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
    name: 'All pair honours',
    description:
      'Seven pairs of major tiles: 1s, 9s, winds and dragons; repeated pairs are allowed.',
    value: 500,
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
    name: 'Imperial Jade',
    description:
      'Four pungs/kongs and a pair using only Green Dragon or Bamboo 2, 3, 4, 6 and 8.',
    value: 1000,
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
    name: 'Thirteen unique wonders',
    description:
      'One of every terminal, wind and dragon, plus a pair of any one.',
    value: 1000,
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
    name: 'The Gates of Heaven',
    description:
      'A concealed one-suit layout with three 1s, three 9s, 2 through 8, and one of 2 through 8 paired.',
    value: 1000,
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
        [2, 3, 4, 5, 6, 7, 8].filter((rank) => ranks.get(rank) === 2)
          .length === 1 &&
        gatesCompletionIsAllowed(hand, suited[0].suit)
      );
    },
  },
  {
    id: 'wriggling-snake',
    name: 'The Wriggling Snake',
    description:
      'A pair of suited 1s, suited 2 through 9 in that suit, and one of each Wind.',
    value: 1000,
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
    name: 'All Winds and Dragons',
    description:
      'Four pungs/kongs and a pair, all made from winds and dragons.',
    value: 1000,
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
    name: 'Heads and Tails',
    description: 'Four pungs/kongs and a pair, all made from suited 1s and 9s.',
    value: 1000,
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
    name: 'Fourfold Plenty',
    description: 'Four kongs and a pair.',
    value: 1000,
    detect: (hand) =>
      hand.isWinner &&
      hand.sets.length === 5 &&
      hand.sets.filter((set) => set.kind === 'kong').length === 4 &&
      hand.sets.filter((set) => set.kind === 'pair').length === 1,
  },
  {
    id: 'three-great-scholars',
    name: 'Three great scholars',
    description: 'A pung or kong of each of the three dragons.',
    value: 1000,
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
    name: 'Four Blessings Hovering over the Door',
    description: 'A pung or kong of each wind, plus any pair.',
    value: 1000,
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
    name: 'Buried treasure',
    description:
      'Four concealed pungs and a concealed pair, using one suit with optional winds/dragons.',
    value: 1000,
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
    name: "Heaven's Blessing",
    description:
      'East makes Mah Jong immediately with the original fourteen dealt tiles.',
    value: 1000,
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
    name: "Earth's Blessing",
    description:
      "A non-East player makes Mah Jong with East's first discard.",
    value: 1000,
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
    name: 'Gathering the Plum Blossom from the Roof',
    description:
      'A replacement tile is 5 Circles and completes Mah Jong.',
    value: 1000,
    eventBased: true,
    detect: (hand) =>
      hand.isWinner &&
      hand.winningMethod === 'loose-tile' &&
      isWinningTile(hand, 'circles', 5),
  },
  {
    id: 'plucking-moon',
    name: 'Plucking the Moon from the Bottom of the Sea',
    description:
      'The last wall tile is 1 Circles and completes Mah Jong.',
    value: 1000,
    eventBased: true,
    detect: (hand) =>
      hand.isWinner &&
      hand.winningMethod === 'last-wall-tile' &&
      isWinningTile(hand, 'circles', 1),
  },
  {
    id: 'twofold-fortune',
    name: 'Twofold Fortune',
    description:
      'One kong replacement completes another kong, whose replacement completes Mah Jong.',
    value: 1000,
    eventBased: true,
    detect: (hand) =>
      hand.isWinner &&
      hand.winningMethod === 'loose-tile' &&
      hand.winningEventEvidence?.type === 'replacement-chain' &&
      hand.winningEventEvidence.kongDeclarations === 2 &&
      hand.sets.filter((set) => set.kind === 'kong').length >= 2,
  },
];

export const detectSpecialHands = (
  hand: MahjongHand,
  context?: GameContext,
): SpecialHandResult[] =>
  specialHandDetectors.map((detector) => ({
    id: detector.id,
    name: detector.name,
    description: detector.description,
    value: detector.value,
    matched: detector.detect(hand, context),
  }));

export const matchesSupportedIrregularLayout = (hand: MahjongHand): boolean =>
  specialHandDetectors
    .filter((detector) => detector.eventBased !== true)
    .some((detector) => detector.detect(hand));
