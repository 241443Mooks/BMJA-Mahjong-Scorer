import { describe, expect, it } from 'vitest';
import { scoreHand } from '../scoring';
import { createBmjaGame } from '../game/game';
import { GAME_SNAPSHOT_STORAGE_KEY, saveGameRecovery } from '../game/persistence';
import { completedExampleHref, initialHandForExampleMode, practiceExampleHref, resolveScorerExample, scoringExampleById, scoringExampleContext, scoringExamples } from './scoring-examples';

describe('worked scoring examples', () => {
  it('asserts every published educational result through the real scoring engine', () => {
    for (const example of scoringExamples) {
      const result = scoreHand(example.hand, example.context);
      expect(result, example.id).toMatchObject(example.expected);
    }
  });

  it('resolves completed and practice routes from one canonical id', () => {
    const example = scoringExampleById('concealed-pung')!;
    expect(completedExampleHref(example.id)).toBe('/hand?example=concealed-pung');
    expect(practiceExampleHref(example.id)).toBe('/hand?practice=concealed-pung');
    expect(resolveScorerExample(example.id)?.hand).toEqual(example.hand);
    expect(scoringExampleContext(example).detailedHand?.hand).toEqual(example.hand);
    expect(initialHandForExampleMode(resolveScorerExample(example.id), false)).toEqual(example.hand);
    expect(initialHandForExampleMode(resolveScorerExample(example.id), true)).toBeUndefined();
    expect(resolveScorerExample('missing-example')).toBeUndefined();
  });

  it('keeps a saved game byte-for-byte unchanged while resolving completed or practice examples', () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) };
    const game = createBmjaGame([{ id: 'east', name: 'East' }, { id: 'south', name: 'South' }, { id: 'west', name: 'West' }, { id: 'north', name: 'North' }], { east: 'east', south: 'south', west: 'west', north: 'north' }, undefined, 'full-game');
    saveGameRecovery(storage, game, 'win', 'east', { scores: {}, scoreRecords: {} });
    const before = storage.getItem(GAME_SNAPSHOT_STORAGE_KEY);
    for (const example of scoringExamples) resolveScorerExample(example.id);
    expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBe(before);
  });
});
