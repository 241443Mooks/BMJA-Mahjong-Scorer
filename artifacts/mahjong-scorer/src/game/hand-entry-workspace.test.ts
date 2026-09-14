import { describe, expect, it } from 'vitest';
import { normaliseStructuredChoiceForGroup, recoverWorkingDraft } from './hand-entry-workspace';

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
});
