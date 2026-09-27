import { describe, expect, it } from 'vitest';
import { dragon, set, suited, wind, type PlayingTile } from './index';
import { partialClassicalDecompositions } from './classical-decomposition';
import { tileKey } from './tiles';

const repeated = (tile: PlayingTile, count: number) => Array.from({ length: count }, () => tile);
const inferred = (sets: ReturnType<typeof partialClassicalDecompositions>[number]['sets']) => sets.slice(0).filter(({ id }) => id.startsWith('fishing-completion-') || id.startsWith('__fishing-completion-'));

describe('partial Classical decompositions', () => {
  it('combines three Pungs and a pair while preserving two unmatched source indexes', () => {
    const tiles = [
      ...repeated(wind('east'), 3), ...repeated(wind('south'), 3), ...repeated(wind('west'), 3),
      ...repeated(dragon('red'), 2), wind('north'), suited('bamboo', 9),
    ];
    const candidate = partialClassicalDecompositions([], tiles).find(({ sets, unresolvedTileIndexes }) =>
      inferred(sets).filter(({ kind }) => kind === 'pung').length === 3
      && inferred(sets).some(({ kind }) => kind === 'pair')
      && unresolvedTileIndexes.length === 2,
    );
    expect(candidate).toBeDefined();
    expect(inferred(candidate!.sets).filter(({ kind }) => kind === 'pung')).toHaveLength(3);
    expect(inferred(candidate!.sets).filter(({ kind }) => kind === 'pair')).toHaveLength(1);
    expect(candidate!.usedTileIndexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(candidate!.unresolvedTileIndexes).toEqual([11, 12]);
  });

  it('keeps explicit groups by identity and adds multiple inferred groups only from unresolved evidence', () => {
    const explicit = set('entered', 'pung', wind('east'), 'exposed');
    const result = partialClassicalDecompositions([explicit], [
      ...repeated(wind('south'), 3), ...repeated(suited('bamboo', 1), 3), wind('north'),
    ]);
    const candidate = result.find(({ sets }) => inferred(sets).length === 2 && inferred(sets).every(({ kind }) => kind === 'pung'));
    expect(candidate).toBeDefined();
    expect(candidate!.sets[0]).toBe(explicit);
    expect(inferred(candidate!.sets).map(({ kind }) => kind)).toEqual(['pung', 'pung']);
    expect(candidate!.usedTileIndexes).toEqual([0, 1, 2, 3, 4, 5]);
    expect(candidate!.unresolvedTileIndexes).toEqual([6]);
  });

  it('enumerates overlapping Chow alternatives as distinct disjoint structures', () => {
    const tiles = [1, 2, 3, 2, 3, 4, 3, 4, 5, 4, 5, 6].map((rank) => suited('bamboo', rank as 1 | 2 | 3 | 4 | 5 | 6));
    const candidates = partialClassicalDecompositions([], tiles).filter(({ sets }) =>
      inferred(sets).length === 2 && inferred(sets).every(({ kind }) => kind === 'chow'),
    );
    expect(new Set(candidates.map(({ sets }) => inferred(sets).map(({ tile }) => tileKey(tile)).join(','))).size).toBeGreaterThan(1);
    expect(candidates.every(({ usedTileIndexes }) => new Set(usedTileIndexes).size === usedTileIndexes.length)).toBe(true);
  });

  it('retains unusable tiles as unmatched and does not exceed ordinary capacity', () => {
    const tiles = [
      ...repeated(wind('east'), 3), ...repeated(wind('south'), 3), ...repeated(wind('west'), 3),
      ...repeated(dragon('red'), 3), ...repeated(dragon('white'), 2),
    ];
    const candidates = partialClassicalDecompositions([], tiles);
    expect(candidates.every(({ sets }) => {
      const groups = inferred(sets);
      return groups.filter(({ kind }) => kind === 'pair').length <= 1
        && groups.filter(({ kind }) => kind !== 'pair').length <= 4;
    })).toBe(true);
    expect(candidates.some(({ unresolvedTileIndexes }) => unresolvedTileIndexes.length > 0)).toBe(true);
  });

  it('does not infer an ordinary pair when an explicit pair already exists', () => {
    const explicit = set('entered-pair', 'pair', suited('circles', 9));
    const candidates = partialClassicalDecompositions([explicit], [...repeated(wind('east'), 3), ...repeated(dragon('red'), 2)]);
    expect(candidates.every(({ sets }) => inferred(sets).every(({ kind }) => kind !== 'pair'))).toBe(true);
  });

  it('keeps four-copy pung-plus-unmatched and Kong branches controlled by allowKongs', () => {
    const tiles = repeated(wind('east'), 4);
    const withoutKongs = partialClassicalDecompositions([], tiles);
    const withKongs = partialClassicalDecompositions([], tiles, { allowKongs: true });
    expect(withoutKongs.some(({ sets, unresolvedTileIndexes }) => inferred(sets).some(({ kind }) => kind === 'pung') && unresolvedTileIndexes.length === 1)).toBe(true);
    expect(withoutKongs.some(({ sets }) => inferred(sets).some(({ kind }) => kind === 'kong'))).toBe(false);
    expect(withKongs.some(({ sets, unresolvedTileIndexes }) => inferred(sets).some(({ kind }) => kind === 'kong') && unresolvedTileIndexes.length === 0)).toBe(true);
  });

  it('returns stable structures, ids, and physical index assignments across repeated calls', () => {
    const tiles = [...repeated(suited('bamboo', 2), 2), ...repeated(suited('bamboo', 3), 2), suited('bamboo', 4), wind('north')];
    const first = partialClassicalDecompositions([], tiles);
    const second = partialClassicalDecompositions([], tiles);
    expect(first).toEqual(second);
    expect(new Set(first.map(({ sets, usedTileIndexes }) => `${inferred(sets).map((group) => `${group.kind}:${tileKey(group.tile)}`).join('|')}[${usedTileIndexes.join(',')}]`)).size).toBe(first.length);
  });
});
