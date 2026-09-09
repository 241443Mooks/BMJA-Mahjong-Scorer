import { describe, expect, it } from 'vitest';
import { scoreHand } from '../scoring';
import { exampleHandScorerContext, specialHandExampleById, specialHandExamples, specialHandExampleHref } from './special-hand-examples';
import { specialHandReferenceHref } from './special-hand-references';

describe('catalogue scorer examples', () => {
  it('uses valid, complete scorer hands for every catalogue action', () => {
    for (const example of specialHandExamples) {
      const context = exampleHandScorerContext(example);
      expect(scoreHand(example.hand, context.detailedHand!.context).valid, example.id).toBe(true);
    }
  });

  it('resolves a compact stable URL and exact catalogue anchor', () => {
    const example = specialHandExampleById('thirteen-unique-wonders');
    expect(example?.hand.looseTiles).toHaveLength(14);
    expect(specialHandExampleHref('thirteen-unique-wonders')).toBe('/hand?example=thirteen-unique-wonders');
    expect(specialHandReferenceHref('thirteen-unique-wonders')).toBe('/special-hands#thirteen-unique-wonders');
    expect(specialHandExampleById('not-a-hand')).toBeUndefined();
  });

  it('does not touch an existing recovery snapshot while resolving examples', () => {
    // URL resolution is deliberately pure: example mode has no storage dependency.
    const storage = new Map([['bmja-mahjong-scorer/game-snapshot', '{"a":"saved-game"}']]);
    const before = storage.get('bmja-mahjong-scorer/game-snapshot');
    expect(specialHandExampleById('purity')?.name).toBe('Purity');
    expect(specialHandExampleById('unknown')).toBeUndefined();
    expect(storage.get('bmja-mahjong-scorer/game-snapshot')).toBe(before);
    expect(storage.size).toBe(1);
  });

  it('keeps event examples truthful about missing winning-tile evidence', () => {
    for (const id of ['gathering-the-plum-blossom-from-the-roof', 'plucking-the-moon-from-the-bottom-of-the-sea'] as const) {
      const example = specialHandExampleById(id)!;
      expect(example.hand.winningTileProvenance, id).toBeUndefined();
      expect(example.eventFollowUp, id).toBeTruthy();
    }
  });
});
