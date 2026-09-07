import type {
  BonusTile,
  Dragon,
  DragonTile,
  HandSet,
  MahjongHand,
  PlayingTile,
  Suit,
  SuitTile,
  Visibility,
  Wind,
  WindTile,
  WinningTileProvenance,
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

export const representedKongCount = (hand: MahjongHand): number =>
  hand.sets.filter((handSet) => handSet.kind === 'kong').length;

export const playingTiles = (hand: MahjongHand): PlayingTile[] => [
  ...hand.sets.flatMap(expandedTiles),
  ...(hand.looseTiles ?? []),
  ...(hand.remainingTiles ?? []),
];

/** A kong has four physical tiles but occupies three structural hand slots. */
export const structuralTileCount = (hand: MahjongHand): number =>
  playingTiles(hand).length - representedKongCount(hand);

export const hasCompleteWinningShape = (hand: MahjongHand): boolean => {
  if (!hand.isWinner || (hand.remainingTiles?.length ?? 0) > 0) return false;
  if (hand.sets.length === 0) {
    return (hand.looseTiles?.length ?? 0) === 14;
  }
  if ((hand.looseTiles?.length ?? 0) > 0) return false;
  const pairs = hand.sets.filter((group) => group.kind === 'pair').length;
  const melds = hand.sets.length - pairs;
  return (
    (hand.sets.length === 7 && pairs === 7) ||
    (hand.sets.length === 5 && pairs === 1 && melds === 4)
  );
};

export type ValidWinningTileProvenance =
  | {
      tile: PlayingTile;
      target: { type: 'grouped-set'; setId: string; tileIndex?: 0 | 1 | 2 };
      set: HandSet;
    }
  | {
      tile: PlayingTile;
      target: { type: 'loose-layout' };
    };

/**
 * Resolves provenance only when it describes an actual tile destination in
 * the completed winning hand. Invalid and stale metadata is treated as unknown.
 */
export const resolveWinningTileProvenance = (
  hand: MahjongHand,
): ValidWinningTileProvenance | undefined => {
  const provenance: WinningTileProvenance | undefined =
    hand.winningTileProvenance;
  if (!provenance || !hasCompleteWinningShape(hand)) return undefined;

  if (provenance.target.type === 'loose-layout') {
    return hand.sets.length === 0 &&
      (hand.looseTiles ?? []).some(
        (tile) => tileKey(tile) === tileKey(provenance.tile),
      )
      ? { tile: provenance.tile, target: provenance.target }
      : undefined;
  }

  const target = provenance.target;
  const matchingGroups = hand.sets.filter(
    (handSet) => handSet.id === target.setId,
  );
  if (matchingGroups.length !== 1) return undefined;
  const group = matchingGroups[0];
  const expanded = expandedTiles(group);

  if (group.kind === 'chow') {
    const index = target.tileIndex;
    if (
      index === undefined ||
      !expanded[index] ||
      tileKey(expanded[index]) !== tileKey(provenance.tile)
    ) {
      return undefined;
    }
  } else if (
    target.tileIndex !== undefined ||
    !expanded.some((tile) => tileKey(tile) === tileKey(provenance.tile))
  ) {
    return undefined;
  }

  return { tile: provenance.tile, target, set: group };
};

export const windNumber = (value: Wind): BonusTile['number'] =>
  ({ east: 1, south: 2, west: 3, north: 4 })[value] as BonusTile['number'];
