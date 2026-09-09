import { describe, expect, it } from 'vitest';
import { scoreHand } from '../scoring';
import { createBmjaGame } from '../game/game';
import { GAME_SNAPSHOT_STORAGE_KEY, recoverableGameForReturn, saveGameRecovery } from '../game/persistence';
import { exampleHandScorerContext, specialHandExampleById, specialHandExamples, specialHandExampleHref } from './special-hand-examples';
import { specialHandReferenceHref } from './special-hand-references';

describe('catalogue scorer examples', () => {
  it('uses valid, complete scorer hands for every catalogue action', () => {
    for (const example of specialHandExamples) {
      const context = exampleHandScorerContext(example);
      expect(scoreHand(example.hand, context.detailedHand!.context).valid, example.id).toBe(true);
    }
  });

  it('reaches the intended real scorer result for deterministic examples', () => {
    const expectedSpecials = {
      'all-pair-honours': 'all-pair-honours', 'all-winds-and-dragons': 'all-winds-and-dragons',
      'heads-and-tails': 'heads-and-tails', 'fourfold-plenty': 'fourfold-plenty',
      'three-great-scholars': 'three-great-scholars', 'four-blessings': 'four-blessings',
      'buried-treasure': 'buried-treasure', 'imperial-jade': 'imperial-jade', knitting: 'knitting',
      'triple-knitting': 'triple-knitting', 'thirteen-unique-wonders': 'thirteen-unique-wonders',
      'gates-of-heaven': 'gates-of-heaven', 'wriggling-snake': 'wriggling-snake',
      'heavens-blessing': 'heavens-blessing', 'earths-blessing': 'earths-blessing', 'twofold-fortune': 'twofold-fortune',
    } as const;
    for (const [exampleId, specialId] of Object.entries(expectedSpecials)) {
      const example = specialHandExampleById(exampleId)!;
      const score = scoreHand(example.hand, exampleHandScorerContext(example).detailedHand!.context);
      expect(score.specialHands.find((result) => result.id === specialId)?.matched, exampleId).toBe(true);
    }
    const purity = specialHandExampleById('purity')!;
    expect(scoreHand(purity.hand, exampleHandScorerContext(purity).detailedHand!.context).calculationComponents)
      .toContainEqual(expect.objectContaining({ id: 'purity-playing-tiles', doubles: 3 }));
  });

  it('resolves a compact stable URL and exact catalogue anchor', () => {
    const example = specialHandExampleById('thirteen-unique-wonders');
    expect(example?.hand.looseTiles).toHaveLength(14);
    expect(specialHandExampleHref('thirteen-unique-wonders')).toBe('/hand?example=thirteen-unique-wonders');
    expect(specialHandReferenceHref('thirteen-unique-wonders')).toBe('/special-hands#thirteen-unique-wonders');
    expect(specialHandExampleById('not-a-hand')).toBeUndefined();
  });

  it('does not alter a genuine recoverable game while building examples', () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) };
    const game = createBmjaGame([{ id: 'east', name: 'East' }, { id: 'south', name: 'South' }, { id: 'west', name: 'West' }, { id: 'north', name: 'North' }], { east: 'east', south: 'south', west: 'west', north: 'north' }, undefined, 'full-game');
    saveGameRecovery(storage, game, 'win', 'east', { scores: {}, scoreRecords: {} });
    const before = storage.getItem(GAME_SNAPSHOT_STORAGE_KEY);
    for (const id of ['purity', 'thirteen-unique-wonders', 'twofold-fortune']) {
      const example = specialHandExampleById(id)!;
      expect(exampleHandScorerContext(example).detailedHand?.hand).toEqual(example.hand);
    }
    expect(recoverableGameForReturn(storage)).not.toBeNull();
    expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBe(before);
  });

  it('keeps event examples truthful about missing winning-tile evidence', () => {
    for (const id of ['gathering-the-plum-blossom-from-the-roof', 'plucking-the-moon-from-the-bottom-of-the-sea'] as const) {
      const example = specialHandExampleById(id)!;
      expect(example.hand.winningTileProvenance, id).toBeUndefined();
      expect(example.eventFollowUp, id).toBeTruthy();
    }
  });

  it('recognises Plum Blossom and Moon only after the learner selects the truthful winning tile', () => {
    const cases = [
      ['gathering-the-plum-blossom-from-the-roof', 'gathering-plum-blossom'],
      ['plucking-the-moon-from-the-bottom-of-the-sea', 'plucking-moon'],
    ] as const;
    for (const [id, specialId] of cases) {
      const example = specialHandExampleById(id)!;
      const context = exampleHandScorerContext(example).detailedHand!.context;
      expect(scoreHand(example.hand, context).specialHands.find((result) => result.id === specialId)?.matched, id).toBe(false);
      const pair = example.hand.sets.find((set) => set.kind === 'pair')!;
      const selected = { ...example.hand, winningTileProvenance: { tile: pair.tile, target: { type: 'grouped-set' as const, setId: pair.id } } };
      expect(scoreHand(selected, context).specialHands.find((result) => result.id === specialId)?.matched, id).toBe(true);
    }
  });
});
