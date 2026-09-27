import { describe, expect, it } from 'vitest';
import { normaliseStructuredChoiceForGroup, recoverWorkingDraft, seedHandEntryWorkspace, unresolvedWinnerBlankEvidence } from './hand-entry-workspace';
import { dragon } from '../scoring';

type Set = { id: string; tile: string | null };
const draft = (): Set => ({ id: 'draft', tile: null });

describe('hand entry workspace recovery', () => {
  it('returns the existing normal-group draft after remaining-tile entry', () => {
    expect(recoverWorkingDraft<Set>([{ id: 'one', tile: '1b' }, draft()], draft).draftId).toBe('draft');
  });

  it('keeps normal-group recovery independent of the remaining-tiles disclosure', () => {
    const recovered = recoverWorkingDraft<Set>([{ id: 'one', tile: '1b' }, { id: 'two', tile: '2b' }], draft);
    expect(recovered.draftId).toBe('draft');
    expect(recovered.sets.map((set) => set.id)).toEqual(['one', 'two', 'draft']);
  });

  it('creates a fresh draft when the currently edited group is removed', () => {
    const recovered = recoverWorkingDraft<Set>([{ id: 'later', tile: '2b' }], draft);
    expect(recovered.draftId).toBe('draft');
    expect(recovered.sets).toEqual([{ id: 'later', tile: '2b' }, draft()]);
  });

  it('keeps later completed groups while recovering a winner-ready draft', () => {
    const recovered = recoverWorkingDraft<Set>([{ id: 'one', tile: '1b' }, { id: 'later', tile: '3b' }], draft);
    expect(recovered.sets.map((set) => set.id)).toEqual(['one', 'later', 'draft']);
  });

  it('normalises only invalid structured choices when changing to Chow', () => {
    expect(normaliseStructuredChoiceForGroup('chow', 'wind', 'east')).toEqual({ family: 'characters', value: '1' });
    expect(normaliseStructuredChoiceForGroup('chow', 'bamboo', '9')).toEqual({ family: 'bamboo', value: '1' });
    expect(normaliseStructuredChoiceForGroup('chow', 'circles', '6')).toEqual({ family: 'circles', value: '6' });
  });

  it('seeds legacy Classical loose tiles into the unresolved buffer and remaps blank references', () => {
    const hand = {
      sets: [], looseTiles: [dragon('red'), dragon('green')], remainingTiles: [dragon('white')], bonusTiles: [], isWinner: true,
      ungroupedBlankTiles: [
        { id: 'loose-blank', location: 'loose' as const, tileIndex: 1 },
        { id: 'remaining-blank', location: 'remaining' as const, tileIndex: 0 },
      ],
    };
    const seed = seedHandEntryWorkspace(hand, true);
    expect(seed).toMatchObject({ layoutMode: 'sets', looseTiles: [], remainingTiles: [dragon('red'), dragon('green'), dragon('white')] });
    expect(seed.ungroupedBlankTiles).toEqual([
      { id: 'loose-blank', location: 'remaining', tileIndex: 1 },
      { id: 'remaining-blank', location: 'remaining', tileIndex: 2 },
    ]);
    expect(hand.looseTiles).toHaveLength(2);
  });

  it('keeps non-Classical loose-layout state and winner blank facts separate', () => {
    const blanks = [{ id: 'winner-blank', location: 'remaining' as const, tileIndex: 2 }];
    expect(seedHandEntryWorkspace({ sets: [], looseTiles: [dragon('red')], bonusTiles: [], isWinner: true }, false).layoutMode).toBe('special');
    expect(unresolvedWinnerBlankEvidence(blanks)).toEqual(blanks);
  });
});
