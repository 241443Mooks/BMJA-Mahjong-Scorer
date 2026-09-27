import type { HandSet, PlayingTile } from './types';
import { tileKey } from './tiles';

type TileTally = Map<string, { tile: PlayingTile; count: number }>;

const tallyTiles = (tiles: readonly PlayingTile[]): TileTally => {
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

const removeTiles = (tally: TileTally, tiles: readonly PlayingTile[]): TileTally | undefined => {
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

const sortedIndexes = (indexes: number[]) => indexes.sort((left, right) => left - right);

const nextTile = (tally: TileTally): PlayingTile | undefined =>
  [...tally.entries()].sort(([left], [right]) => left.localeCompare(right))[0]?.[1].tile;

export const completionSetId = (sets: readonly HandSet[], index: number): string => {
  const base = `fishing-completion-${index + 1}`;
  if (!sets.some((handSet) => handSet.id === base)) return base;
  return `__${base}`;
};

export type ClassicalDecompositionOptions = {
  /** Off by default to preserve the existing fishing search vocabulary. */
  allowKongs?: boolean;
};

/** Enumerates completed four-meld/one-pair and seven-pair shapes in stable DFS order. */
export const standardClassicalDecompositions = (
  existingSets: readonly HandSet[],
  concealedTiles: readonly PlayingTile[],
  { allowKongs = false }: ClassicalDecompositionOptions = {},
): HandSet[][] => {
  const results: HandSet[][] = [];
  const fixedSets = [...existingSets];
  const existingPairs = fixedSets.filter((handSet) => handSet.kind === 'pair').length;

  const search = (
    tally: TileTally,
    generated: HandSet[],
    pairsNeeded: number,
    meldsNeeded: number,
    chowsUsed: number,
  ) => {
    if (pairsNeeded < 0 || meldsNeeded < 0) return;
    const minimumPhysical = pairsNeeded * 2 + meldsNeeded * 3;
    const maximumPhysical = minimumPhysical + (allowKongs ? meldsNeeded : 0);
    const physicalRemaining = remainingPhysicalCount(tally);
    if (physicalRemaining < minimumPhysical || physicalRemaining > maximumPhysical) return;
    const tile = nextTile(tally);
    if (!tile) {
      if (pairsNeeded === 0 && meldsNeeded === 0) results.push([...fixedSets, ...generated]);
      return;
    }

    const addGroup = (
      kind: 'pair' | 'pung' | 'kong' | 'chow',
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
            id: completionSetId([...fixedSets, ...generated], generated.length),
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
      addGroup('pung', [tile, tile, tile], pairsNeeded, meldsNeeded - 1, chowsUsed);
      if (allowKongs) {
        addGroup('kong', [tile, tile, tile, tile], pairsNeeded, meldsNeeded - 1, chowsUsed);
      }
      if (chowsUsed < 4 && tile.family === 'suit' && tile.rank <= 7) {
        const second = { ...tile, rank: (tile.rank + 1) as typeof tile.rank };
        const third = { ...tile, rank: (tile.rank + 2) as typeof tile.rank };
        addGroup('chow', [tile, second, third], pairsNeeded, meldsNeeded - 1, chowsUsed + 1);
      }
    }
  };

  if (fixedSets.length <= 5 && existingPairs <= 1) {
    const pairsNeeded = 1 - existingPairs;
    const meldsNeeded = 4 - (fixedSets.length - existingPairs);
    search(
      tallyTiles(concealedTiles),
      [],
      pairsNeeded,
      meldsNeeded,
      fixedSets.filter((handSet) => handSet.kind === 'chow').length,
    );
  }

  if (fixedSets.length <= 7 && fixedSets.every((handSet) => handSet.kind === 'pair')) {
    search(tallyTiles(concealedTiles), [], 7 - fixedSets.length, 0, 0);
  }

  return results;
};

export type PartialClassicalDecomposition = {
  sets: HandSet[];
  usedTileIndexes: number[];
  unresolvedTileIndexes: number[];
};

const groupSignature = (group: Pick<HandSet, 'kind' | 'tile'>) => `${group.kind}:${tileKey(group.tile)}`;

/** Enumerates bounded, disjoint ordinary groupings for partial evidence. */
export const partialClassicalDecompositions = (
  existingSets: readonly HandSet[],
  unresolvedTiles: readonly PlayingTile[],
  { allowKongs = false }: ClassicalDecompositionOptions = {},
): PartialClassicalDecomposition[] => {
  const fixedSets = [...existingSets];
  const tally = tallyTiles(unresolvedTiles);
  const existingPairs = fixedSets.filter(({ kind }) => kind === 'pair').length;
  const existingMelds = fixedSets.length - existingPairs;
  if (existingPairs > 1 || existingMelds > 4) return [];

  const possibleGroups: Array<{ kind: HandSet['kind']; tile: PlayingTile; members: PlayingTile[] }> = [];
  for (const [, { tile, count }] of [...tally.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    if (count >= 2) possibleGroups.push({ kind: 'pair', tile, members: [tile, tile] });
    if (count >= 3) possibleGroups.push({ kind: 'pung', tile, members: [tile, tile, tile] });
    if (allowKongs && count >= 4) possibleGroups.push({ kind: 'kong', tile, members: [tile, tile, tile, tile] });
    if (tile.family === 'suit' && tile.rank <= 7) {
      const second = { ...tile, rank: (tile.rank + 1) as typeof tile.rank };
      const third = { ...tile, rank: (tile.rank + 2) as typeof tile.rank };
      if (removeTiles(tally, [tile, second, third])) possibleGroups.push({ kind: 'chow', tile, members: [tile, second, third] });
    }
  }
  possibleGroups.sort((left, right) => groupSignature(left).localeCompare(groupSignature(right)));

  const results = new Map<string, PartialClassicalDecomposition>();
  const search = (start: number, available: TileTally, groups: typeof possibleGroups) => {
    if (groups.length > 0) {
      const usedIndexes: number[] = [];
      const usedByKey = new Map<string, number>();
      const indexesByKey = new Map<string, number[]>();
      unresolvedTiles.forEach((tile, index) => {
        const key = tileKey(tile);
        indexesByKey.set(key, [...(indexesByKey.get(key) ?? []), index]);
      });
      for (const group of groups) {
        for (const member of group.members) {
          const key = tileKey(member);
          const occurrence = usedByKey.get(key) ?? 0;
          const index = indexesByKey.get(key)?.[occurrence];
          if (index !== undefined) usedIndexes.push(index);
          usedByKey.set(key, occurrence + 1);
        }
      }
      const sortedUsedIndexes = sortedIndexes(usedIndexes);
      const unresolvedTileIndexes = unresolvedTiles.map((_, index) => index).filter((index) => !sortedUsedIndexes.includes(index));
      const inferred: HandSet[] = [];
      for (const { kind, tile } of groups) {
        inferred.push({ id: completionSetId([...fixedSets, ...inferred], inferred.length), kind, tile, visibility: 'concealed' });
      }
      const key = `${groups.map(groupSignature).join('|')}[${sortedUsedIndexes.join(',')}]`;
      results.set(key, { sets: [...fixedSets, ...inferred], usedTileIndexes: sortedUsedIndexes, unresolvedTileIndexes });
    }
    if (groups.length >= 5) return;
    for (let index = start; index < possibleGroups.length; index += 1) {
      const candidate = possibleGroups[index]!;
      const isPair = candidate.kind === 'pair';
      if (isPair ? existingPairs + groups.filter(({ kind }) => kind === 'pair').length >= 1
        : existingMelds + groups.filter(({ kind }) => kind !== 'pair').length >= 4) continue;
      const next = removeTiles(available, candidate.members);
      if (next) search(index + 1, next, [...groups, candidate]);
    }
  };

  search(0, tally, []);
  return [...results.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, result]) => result);
};
