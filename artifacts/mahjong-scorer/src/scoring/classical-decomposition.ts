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

/** Enumerates one-group hypotheses for partial evidence; all other tiles stay unresolved. */
export const partialClassicalDecompositions = (
  existingSets: readonly HandSet[],
  unresolvedTiles: readonly PlayingTile[],
  { allowKongs = false }: ClassicalDecompositionOptions = {},
): HandSet[][] => {
  const fixedSets = [...existingSets];
  const tally = tallyTiles(unresolvedTiles);
  const groups: HandSet[] = [];
  const seen = new Set<string>();
  const add = (kind: HandSet['kind'], tile: PlayingTile, members: PlayingTile[]) => {
    if (!removeTiles(tally, members)) return;
    const key = `${kind}:${tileKey(tile)}`;
    if (seen.has(key)) return;
    seen.add(key);
    groups.push({ id: completionSetId(fixedSets, groups.length), kind, tile, visibility: 'concealed' });
  };

  for (const [, { tile, count }] of [...tally.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    if (count >= 2) add('pair', tile, [tile, tile]);
    if (count >= 3) add('pung', tile, [tile, tile, tile]);
    if (allowKongs && count >= 4) add('kong', tile, [tile, tile, tile, tile]);
    if (tile.family === 'suit' && tile.rank <= 7) {
      const second = { ...tile, rank: (tile.rank + 1) as typeof tile.rank };
      const third = { ...tile, rank: (tile.rank + 2) as typeof tile.rank };
      add('chow', tile, [tile, second, third]);
    }
  }
  return groups.map((group) => [...fixedSets, group]);
};
