import { describe, expect, it } from 'vitest';
import { handScorerInitialBaseline, hasHandScorerUnsavedWork } from './hand-scorer-dirty-state';
import { dragon } from '../scoring';

const practiceContext = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000, isWinner: true, winningMethod: 'discard' as const, originalCall: false };

describe('hand scorer dirty baseline', () => {
  it('treats a fresh practice baseline, including canonical discard/winner context, as clean', () => {
    const baseline = handScorerInitialBaseline(undefined, practiceContext);
    expect(hasHandScorerUnsavedWork(baseline, baseline)).toBe(false);
  });

  it('becomes dirty when a learner enters a set or changes editable context', () => {
    const baseline = handScorerInitialBaseline(undefined, practiceContext);
    expect(hasHandScorerUnsavedWork({ ...baseline, sets: [{ ...baseline.sets[0], tile: { family: 'suit', suit: 'bamboo', rank: 2 } }] }, baseline)).toBe(true);
    expect(hasHandScorerUnsavedWork({ ...baseline, winningMethod: 'wall' }, baseline)).toBe(true);
  });

  it('keeps the ordinary blank standalone scorer clean', () => {
    const baseline = handScorerInitialBaseline(undefined, { playerWind: 'east', prevailingWind: 'east', limit: 1000, isWinner: false, winningMethod: 'wall', originalCall: false });
    expect(hasHandScorerUnsavedWork(baseline, baseline)).toBe(false);
  });

  it('treats restored ungrouped blank metadata as editable hand state without sharing it with the saved hand', () => {
    const hand = {
      sets: [], looseTiles: [dragon('red')],
      ungroupedBlankTiles: [{ id: 'blank-loose', location: 'loose' as const, tileIndex: 0 }],
      bonusTiles: [], isWinner: true,
    };
    const baseline = handScorerInitialBaseline(hand, practiceContext);
    baseline.ungroupedBlankTiles[0].id = 'changed';
    expect(hand.ungroupedBlankTiles[0].id).toBe('blank-loose');
    expect(hasHandScorerUnsavedWork({ ...baseline, ungroupedBlankTiles: [] }, baseline)).toBe(true);
  });
});
