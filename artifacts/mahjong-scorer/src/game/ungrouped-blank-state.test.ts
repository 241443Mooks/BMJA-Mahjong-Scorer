import { describe, expect, it } from 'vitest';
import { applicableUngroupedBlanks, hasUngroupedBlankAt, reindexUngroupedBlanksAfterRemoval, toggleUngroupedBlankAt } from './ungrouped-blank-state';

describe('HandScorer ungrouped blank state', () => {
  it('records an irregular blank against its represented tile and preserves it through recalculation state', () => {
    const entered = toggleUngroupedBlankAt([], 'loose', 2, 'blank-loose-2');
    expect(entered).toEqual([{ id: 'blank-loose-2', location: 'loose', tileIndex: 2 }]);
    expect(hasUngroupedBlankAt(entered, 'loose', 2)).toBe(true);
    expect(applicableUngroupedBlanks(entered, 'special', true)).toEqual(entered);
    expect(applicableUngroupedBlanks(entered, 'sets', false)).toEqual([]);
  });

  it('reindexes blank metadata when a HandScorer ungrouped tile is removed', () => {
    const blanks = [
      { id: 'loose-one', location: 'loose' as const, tileIndex: 1 },
      { id: 'loose-three', location: 'loose' as const, tileIndex: 3 },
      { id: 'remaining-three', location: 'remaining' as const, tileIndex: 3 },
    ];
    expect(reindexUngroupedBlanksAfterRemoval(blanks, 'loose', 1)).toEqual([
      { id: 'loose-three', location: 'loose', tileIndex: 2 },
      { id: 'remaining-three', location: 'remaining', tileIndex: 3 },
    ]);
  });

  it('restores saved blank metadata independently of the persisted array', () => {
    const saved = [{ id: 'saved-blank', location: 'loose' as const, tileIndex: 4 }];
    const restored = applicableUngroupedBlanks(saved, 'special', true);
    restored[0].tileIndex = 1;
    expect(saved[0].tileIndex).toBe(4);
  });
});
