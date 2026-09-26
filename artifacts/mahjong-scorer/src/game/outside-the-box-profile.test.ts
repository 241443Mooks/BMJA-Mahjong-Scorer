import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { dragon, set, suited, wind, type MahjongHand } from '../scoring';
import { canonicalSpecialHandPatterns, detectSpecialHands } from '../scoring/special-hands';
import { createBmjaGame } from './game';
import { loadGameRecovery, saveGameRecovery } from './persistence';
import {
  BMJA_RULESET,
  OUTSIDE_THE_BOX_PROFILE_REF,
  OUTSIDE_THE_BOX_RULESET,
  resolveRulesProfile,
  WESTERN_TM_RULESET,
} from './ruleset';
import { outsideTheBoxSpecialHandBindings } from './outside-the-box-catalogue';

beforeAll(() => initialiseCurrentRulesRuntimes());

const players = ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id }));
const seats = { east: 'east', south: 'south', west: 'west', north: 'north' } as const;
const score = (ruleset: typeof OUTSIDE_THE_BOX_RULESET, hand: MahjongHand) => ruleset.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' });
const storage = () => { const values = new Map<string, string>(); return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) }; };

const grandSequence = (pair: ReturnType<typeof suited> | ReturnType<typeof wind>): MahjongHand => ({
  sets: [
    set('one', 'chow', suited('bamboo', 1)), set('four', 'chow', suited('bamboo', 4)), set('seven', 'chow', suited('bamboo', 7)),
    set('red', 'pung', dragon('red')), set('pair', 'pair', pair),
  ], bonusTiles: [], isWinner: true,
});
const rubyJade: MahjongHand = { sets: [], looseTiles: [dragon('green'), dragon('green'), dragon('red'), dragon('red'), ...[1, 3, 5, 7, 9].flatMap((rank) => [suited('bamboo', rank as 1 | 3 | 5 | 7 | 9), suited('bamboo', rank as 1 | 3 | 5 | 7 | 9)])], bonusTiles: [], isWinner: true };
const scholars: MahjongHand = { sets: [set('red', 'pung', dragon('red')), set('green', 'pung', dragon('green')), set('white', 'pung', dragon('white')), set('other', 'pung', suited('circles', 4)), set('pair', 'pair', suited('bamboo', 2))], bonusTiles: [], isWinner: true };
const purity: MahjongHand = { sets: [set('one', 'pung', suited('bamboo', 1), 'exposed'), set('two', 'pung', suited('bamboo', 2), 'exposed'), set('three', 'pung', suited('bamboo', 3), 'exposed'), set('four', 'pung', suited('bamboo', 4), 'exposed'), set('pair', 'pair', suited('bamboo', 5))], bonusTiles: [], isWinner: true };

describe('outside-the-box@0.1 special-hand profile', () => {
  it('resolves only its exact version and has an explicit, canonical inventory', () => {
    expect(resolveRulesProfile(OUTSIDE_THE_BOX_PROFILE_REF)).toBe(OUTSIDE_THE_BOX_RULESET);
    expect(() => resolveRulesProfile({ id: 'outside-the-box', version: '999' })).toThrow('Unknown rules profile "outside-the-box" version "999".');
    expect(outsideTheBoxSpecialHandBindings).toHaveLength(33);
    expect(new Set(outsideTheBoxSpecialHandBindings.map(({ patternId }) => patternId)).size).toBe(33);
    expect(outsideTheBoxSpecialHandBindings.every(({ patternId }) => canonicalSpecialHandPatterns.some(({ id }) => id === patternId))).toBe(true);
  });

  it('keeps cross-profile values and local overrides isolated', () => {
    expect(score(OUTSIDE_THE_BOX_RULESET, scholars).specialHands.find(({ id }) => id === 'club-three-great-scholars')).toMatchObject({ value: 1000, matched: false });
    expect(score(WESTERN_TM_RULESET, scholars).specialHands.find(({ id }) => id === 'three-great-scholars')).toMatchObject({ value: 1500, matched: true });
    expect(outsideTheBoxSpecialHandBindings.find(({ patternId }) => patternId === 'four-bamboo-one-and-five-green-bamboo-pairs')).toMatchObject({ value: 1000, fishingValue: 400, exposure: { allowed: false } });
    for (const patternId of ['green-dragon-pung-with-bamboo-melds', 'red-dragon-pung-with-character-melds', 'white-dragon-pung-with-circle-melds']) expect(outsideTheBoxSpecialHandBindings.find((binding) => binding.patternId === patternId)).toMatchObject({ exposure: { allowed: true, exposedValue: 500, exposedFishingValue: 200 } });
  });

  it('matches Club Three Great Scholars only when the remaining set and pair share a numbered suit', () => {
    const club = (sets: MahjongHand['sets']) => detectSpecialHands({ sets, bonusTiles: [], isWinner: true }, undefined, outsideTheBoxSpecialHandBindings)
      .find(({ id }) => id === 'club-three-great-scholars');
    const dragons = [set('red', 'pung', dragon('red')), set('green', 'pung', dragon('green')), set('white', 'pung', dragon('white'))];
    expect(club([...dragons, set('fourth', 'pung', suited('circles', 4)), set('pair', 'pair', suited('circles', 2))])).toMatchObject({ matched: true, value: 1000 });
    expect(club([...dragons, set('fourth', 'chow', suited('circles', 4)), set('pair', 'pair', suited('circles', 2))])).toMatchObject({ matched: true, value: 1000 });
    expect(club([...dragons.map((set) => ({ ...set, kind: 'kong' as const })), set('fourth', 'kong', suited('circles', 4)), set('pair', 'pair', suited('circles', 2))])).toMatchObject({ matched: true, value: 1000 });
    expect(club([...dragons, set('fourth', 'pung', suited('circles', 4)), set('pair', 'pair', suited('bamboo', 2))])).toMatchObject({ matched: false });
    expect(club([...dragons, set('fourth', 'chow', suited('circles', 4)), set('pair', 'pair', dragon('red'))])).toMatchObject({ matched: false });
    expect(club([dragons[0]!, dragons[1]!, set('fourth', 'pung', suited('circles', 4)), set('pair', 'pair', suited('circles', 2))])).toMatchObject({ matched: false });
    expect(club([...dragons, set('fourth', 'pung', suited('circles', 4)), set('pair', 'pair', suited('circles', 2)), set('extra', 'pung', wind('east'))])).toMatchObject({ matched: false });
  });

  it('uses the corrected canonical Knitting and Triple Knitting predicates with Club-local bindings', () => {
    const knitting: MahjongHand = {
      sets: [],
      looseTiles: [1, 2, 3, 4, 5, 6, 7].flatMap((rank) => [
        suited('bamboo', rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9),
        suited('characters', rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9),
      ]),
      bonusTiles: [],
      isWinner: true,
    };
    const threeSuitKnitting: MahjongHand = {
      ...knitting,
      looseTiles: [1, 2, 3, 4, 5, 6, 7].flatMap((rank) => [
        suited('bamboo', rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9),
        suited('characters', rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9),
      ]).map((tile, index) => index === 13 ? suited('circles', 7) : tile),
    };
    const tripleKnitting: MahjongHand = {
      ...knitting,
      looseTiles: [1, 3, 5, 7].flatMap((rank) => [
        suited('bamboo', rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9),
        suited('characters', rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9),
        suited('circles', rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9),
      ]).concat([suited('bamboo', 9), suited('characters', 9)]),
    };
    expect(score(OUTSIDE_THE_BOX_RULESET, knitting).specialHands).toContainEqual(expect.objectContaining({ id: 'knitting', matched: true, value: 500 }));
    expect(score(OUTSIDE_THE_BOX_RULESET, threeSuitKnitting).specialHands).toContainEqual(expect.objectContaining({ id: 'knitting', matched: false }));
    expect(score(OUTSIDE_THE_BOX_RULESET, tripleKnitting).specialHands).toContainEqual(expect.objectContaining({ id: 'triple-knitting', matched: true, value: 500 }));
    for (const patternId of ['knitting', 'triple-knitting']) {
      expect(outsideTheBoxSpecialHandBindings.find(({ patternId: id }) => id === patternId)).toMatchObject({
        value: 500,
        fishingValue: 200,
        exposure: { allowed: false },
      });
    }
  });

  it('uses any Bamboo ranks for Ruby Jade without changing the Western canonical pattern', () => {
    const pattern = canonicalSpecialHandPatterns.find(({ id }) => id === 'all-pair-ruby-jade')!;
    expect(pattern.detect(rubyJade)).toBe(true);
    expect(score(OUTSIDE_THE_BOX_RULESET, rubyJade).specialHands).toContainEqual(expect.objectContaining({ id: 'all-pair-ruby-jade', matched: true, value: 1000 }));
    expect(score(WESTERN_TM_RULESET, rubyJade).specialHands).toContainEqual(expect.objectContaining({ id: 'all-pair-ruby-jade', matched: true }));
  });

  it('restricts OTB Grand Sequence to a suited pair while preserving Western any-pair Grand Sequence', () => {
    const otb = canonicalSpecialHandPatterns.find(({ id }) => id === 'run-one-to-nine-with-honour-pung-and-suited-pair')!;
    const western = canonicalSpecialHandPatterns.find(({ id }) => id === 'run-one-to-nine-with-honour-pung-and-any-pair')!;
    expect(otb.detect(grandSequence(suited('characters', 5)))).toBe(true);
    expect(otb.detect(grandSequence(wind('east')))).toBe(false);
    expect(western.detect(grandSequence(wind('east')))).toBe(true);
  });

  it('reuses calculated British Purity without exposing Western one-Chow membership', () => {
    const otb = score(OUTSIDE_THE_BOX_RULESET, purity);
    expect(otb.finalScore).toBe(240);
    expect(otb.calculationComponents[0]).toMatchObject({ id: 'purity-playing-tiles', doubles: 3, subtotal: 240 });
    expect(score(WESTERN_TM_RULESET, purity).specialHands.find(({ id }) => id === 'purity-one-chow')).toMatchObject({ matched: true });
    expect(BMJA_RULESET.scoreHand({ hand: purity, playerWind: 'east', prevailingWind: 'east' }).finalScore).toBe(240);
  });

  it('persists and replays the exact OTB profile ref', () => {
    const game = createBmjaGame(players, seats, undefined, 'full-game', OUTSIDE_THE_BOX_PROFILE_REF);
    const memory = storage();
    saveGameRecovery(memory, game, 'win', 'east', { scores: {}, scoreRecords: {} });
    expect(loadGameRecovery(memory)?.game.setup.rulesProfile).toEqual(OUTSIDE_THE_BOX_PROFILE_REF);
  });
});
