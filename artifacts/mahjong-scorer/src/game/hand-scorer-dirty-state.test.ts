import { describe, expect, it } from 'vitest';
import { handScorerInitialBaseline, hasHandScorerUnsavedWork } from './hand-scorer-dirty-state';
import { dragon, suited, wind } from '../scoring';
import { seedHandEntryWorkspace } from './hand-entry-workspace';

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

  it('warns before discarding hybrid candidate, visibility and method evidence', () => {
    const baseline = handScorerInitialBaseline(undefined, { ...practiceContext, hybridInterpretation: { method: 'default', candidate: undefined, visibility: [] } });
    expect(hasHandScorerUnsavedWork({ ...baseline, hybridInterpretation: { method: 'unknown', candidate: 'candidate-a', visibility: [{ groupId: 'g1', value: 'concealed' }] } }, baseline)).toBe(true);
  });

  it('keeps the ordinary blank standalone scorer clean', () => {
    const baseline = handScorerInitialBaseline(undefined, { playerWind: 'east', prevailingWind: 'east', limit: 1000, isWinner: false, winningMethod: 'wall', originalCall: false });
    expect(hasHandScorerUnsavedWork(baseline, baseline)).toBe(false);
  });

  it('preserves the non-Classical loaded loose-layout baseline shape', () => {
    const provenance = { tile: dragon('red'), target: { type: 'loose-layout' as const } };
    const hand = { sets: [], looseTiles: [dragon('red')], bonusTiles: [], isWinner: true, winningTileProvenance: provenance };
    const baseline = handScorerInitialBaseline(hand, practiceContext, false);
    expect(baseline).toMatchObject({ sets: [], layoutMode: 'special', looseTiles: [dragon('red')], remainingTiles: [], winningTileProvenance: provenance });
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

  it('treats a legacy Classical loose layout as clean after workspace normalisation', () => {
    const looseTiles = [
      suited('bamboo', 1), suited('bamboo', 9), suited('characters', 1), suited('characters', 9),
      suited('circles', 1), suited('circles', 9), wind('east'), wind('south'), wind('west'), wind('north'),
      dragon('red'), dragon('green'), dragon('white'), wind('east'),
    ];
    const hand = {
      sets: [], looseTiles, bonusTiles: [], isWinner: true, winningMethod: 'discard' as const,
      winningTileProvenance: { tile: wind('east'), target: { type: 'loose-layout' as const } },
      ungroupedBlankTiles: [{ id: 'blank-loose', location: 'loose' as const, tileIndex: 0 }],
    };
    const context = {
      ...practiceContext,
      winningMethod: hand.winningMethod,
      hybridInterpretation: { hybridMethodStatus: 'inherited', hybridCandidateId: undefined, hybridVisibility: [], hybridRejectedCandidates: [] },
    };
    const baseline = handScorerInitialBaseline(hand, context, true);
    const workspace = seedHandEntryWorkspace(hand, true);
    const actualInitialState = {
      sets: [{ id: 'set-working', kind: 'pung', visibility: 'concealed' as const, tile: null }],
      ...workspace,
      flowers: [], seasons: [],
      playerWind: context.playerWind, prevailingWind: context.prevailingWind, limit: context.limit,
      isWinner: context.isWinner, winningMethod: context.winningMethod, originalCall: context.originalCall,
      winningTileProvenance: hand.winningTileProvenance,
      winningEventEvidence: undefined,
      hybridInterpretation: context.hybridInterpretation,
    };
    expect(actualInitialState.sets).toEqual(baseline.sets);
    expect(baseline).toMatchObject({ layoutMode: 'sets', looseTiles: [], remainingTiles: looseTiles, ungroupedBlankTiles: [{ id: 'blank-loose', location: 'remaining', tileIndex: 0 }] });
    expect(baseline.winningTileProvenance).toEqual(hand.winningTileProvenance);
    expect(hasHandScorerUnsavedWork(actualInitialState, baseline)).toBe(false);
    expect(hasHandScorerUnsavedWork({ ...actualInitialState, remainingTiles: [] }, baseline)).toBe(true);
  });
});
