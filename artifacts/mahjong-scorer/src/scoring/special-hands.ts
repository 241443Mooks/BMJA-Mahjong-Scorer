import { expandedTiles, isTerminal, tileKey } from './tiles';
import type {
  MahjongHand,
  PlayingTile,
  SpecialHandResult,
} from './types';

type Detector = {
  id: string;
  name: string;
  description: string;
  value: number;
  detect: (hand: MahjongHand) => boolean;
};

const tiles = (hand: MahjongHand) => [
  ...hand.sets.flatMap(expandedTiles),
  ...(hand.looseTiles ?? []),
];
const counts = (values: PlayingTile[]) =>
  values.reduce<Map<string, number>>((map, tile) => {
    const key = tileKey(tile);
    map.set(key, (map.get(key) ?? 0) + 1);
    return map;
  }, new Map());

/**
 * Special-hand detectors are independent: each receives only the canonical
 * MahjongHand and returns a boolean. Adding one cannot alter another.
 */
export const specialHandDetectors: Detector[] = [
  {
    id: 'seven-pairs',
    name: 'Seven pairs',
    description: 'Seven distinct pairs, all concealed.',
    value: 500,
    detect: (hand) =>
      hand.isWinner &&
      hand.sets.length === 7 &&
      hand.sets.every(
        (set) => set.kind === 'pair' && set.visibility === 'concealed',
      ) &&
      new Set(hand.sets.map((set) => tileKey(set.tile))).size === 7,
  },
  {
    id: 'all-pair-honours',
    name: 'All pair honours',
    description: 'Seven pairs made entirely from winds and dragons.',
    value: 500,
    detect: (hand) =>
      hand.isWinner &&
      hand.sets.length === 7 &&
      hand.sets.every(
        (set) => set.kind === 'pair' && set.tile.family !== 'suit',
      ),
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
    id: 'all-honours',
    name: 'All honours',
    description: 'Every playing tile is a wind or dragon.',
    value: 1000,
    detect: (hand) => {
      const all = tiles(hand);
      return (
        hand.isWinner &&
        hand.sets.length === 5 &&
        hand.sets.filter((set) => set.kind === 'pair').length === 1 &&
        all.length >= 14 &&
        all.every((tile) => tile.family !== 'suit')
      );
    },
  },
  {
    id: 'all-terminals',
    name: 'All terminals',
    description: 'Every playing tile is a suited 1 or 9.',
    value: 1000,
    detect: (hand) => {
      const all = tiles(hand);
      return hand.isWinner && all.length >= 14 && all.every(isTerminal);
    },
  },
  {
    id: 'four-kongs',
    name: 'Four kongs',
    description: 'A winning hand containing four kongs.',
    value: 1000,
    detect: (hand) =>
      hand.isWinner && hand.sets.filter((set) => set.kind === 'kong').length === 4,
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
      return hand.isWinner && dragons.size === 3;
    },
  },
  {
    id: 'four-winds',
    name: 'Four winds',
    description: 'Pungs or kongs of three winds and a pair of the fourth.',
    value: 1000,
    detect: (hand) => {
      const windSets = hand.sets.filter(
        (set) =>
          (set.kind === 'pung' || set.kind === 'kong') &&
          set.tile.family === 'wind',
      );
      const windPairs = hand.sets.filter(
        (set) => set.kind === 'pair' && set.tile.family === 'wind',
      );
      return hand.isWinner && windSets.length === 3 && windPairs.length === 1;
    },
  },
  {
    id: 'buried-treasure',
    name: 'Buried treasure',
    description: 'Four concealed pungs or kongs and a concealed pair.',
    value: 1000,
    detect: (hand) =>
      hand.isWinner &&
      hand.sets.length === 5 &&
      hand.sets.every((set) => set.visibility === 'concealed') &&
      hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong')
        .length === 4 &&
      hand.sets.filter((set) => set.kind === 'pair').length === 1,
  },
];

export const detectSpecialHands = (
  hand: MahjongHand,
): SpecialHandResult[] =>
  specialHandDetectors.map((detector) => ({
    id: detector.id,
    name: detector.name,
    description: detector.description,
    value: detector.value,
    matched: detector.detect(hand),
  }));
