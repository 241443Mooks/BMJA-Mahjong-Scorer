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
      hand.sets.every((set) => set.visibility === 'concealed') &&
      hand.sets.filter((set) => set.kind === 'pung').length === 4 &&
      hand.sets.filter((set) => set.kind === 'pair').length === 1 &&
      new Set(
        hand.sets.flatMap((set) =>
          set.tile.family === 'suit' ? [set.tile.suit] : [],
        ),
      ).size <= 1,
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
