import type {
  BonusTile,
  Dragon,
  DragonTile,
  HandSet,
  PlayingTile,
  Suit,
  SuitTile,
  Visibility,
  Wind,
  WindTile,
} from './types';

export const suited = (suit: Suit, rank: SuitTile['rank']): SuitTile => ({
  family: 'suit',
  suit,
  rank,
});

export const wind = (value: Wind): WindTile => ({
  family: 'wind',
  wind: value,
});

export const dragon = (value: Dragon): DragonTile => ({
  family: 'dragon',
  dragon: value,
});

export const bonus = (
  family: BonusTile['family'],
  number: BonusTile['number'],
): BonusTile => ({ family, number });

export const set = (
  id: string,
  kind: HandSet['kind'],
  tile: PlayingTile,
  visibility: Visibility = 'concealed',
): HandSet => ({ id, kind, tile, visibility });

export const isHonor = (tile: PlayingTile) => tile.family !== 'suit';
export const isTerminal = (tile: PlayingTile) =>
  tile.family === 'suit' && (tile.rank === 1 || tile.rank === 9);
export const isMajor = (tile: PlayingTile) =>
  isHonor(tile) || isTerminal(tile);

export const tileKey = (tile: PlayingTile): string => {
  if (tile.family === 'suit') return `${tile.suit}-${tile.rank}`;
  if (tile.family === 'wind') return `wind-${tile.wind}`;
  return `dragon-${tile.dragon}`;
};

export const expandedTiles = (handSet: HandSet): PlayingTile[] => {
  if (handSet.kind === 'chow') {
    if (handSet.tile.family !== 'suit') return [];
    const { suit, rank } = handSet.tile;
    if (rank > 7) return [];
    return [
      suited(suit, rank),
      suited(suit, (rank + 1) as SuitTile['rank']),
      suited(suit, (rank + 2) as SuitTile['rank']),
    ];
  }
  const count = handSet.kind === 'kong' ? 4 : handSet.kind === 'pair' ? 2 : 3;
  return Array.from({ length: count }, () => handSet.tile);
};

export const windNumber = (value: Wind): BonusTile['number'] =>
  ({ east: 1, south: 2, west: 3, north: 4 })[value] as BonusTile['number'];
