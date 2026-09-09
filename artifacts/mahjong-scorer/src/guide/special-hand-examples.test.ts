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

  it('keeps event examples truthful about missing winning-tile evidence', () => {
    for (const id of ['gathering-the-plum-blossom-from-the-roof', 'plucking-the-moon-from-the-bottom-of-the-sea'] as const) {
      const example = specialHandExampleById(id)!;
      expect(example.hand.winningTileProvenance, id).toBeUndefined();
      expect(example.eventFollowUp, id).toBeTruthy();
    }
  });
});
