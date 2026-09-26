import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { bonus, dragon, set, suited, validateHand, wind, type MahjongHand } from '../scoring';
import { canonicalSpecialHandPatterns } from '../scoring/special-hands';
import { confirmHand, createBmjaGame, replayGame, undoLastHand } from './game';
import { loadGameRecovery, saveGameRecovery } from './persistence';
import {
  BMJA_PROFILE_REF,
  BMJA_RULESET,
  OUTSIDE_THE_BOX_PROFILE_REF,
  OUTSIDE_THE_BOX_RULESET,
  resolveRulesProfile,
  WESTERN_TM_PROFILE_REF,
  WESTERN_TM_RULESET,
} from './ruleset';
import { outsideTheBoxSpecialHandBindings } from './outside-the-box-catalogue';

beforeAll(() => initialiseCurrentRulesRuntimes());

const players = ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id }));
const seats = { east: 'east', south: 'south', west: 'west', north: 'north' } as const;
const scores = { east: 100, south: 30, west: 20, north: 10 };
const context = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000 };
const storage = () => { const values = new Map<string, string>(); return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) }; };
const game = (profile = OUTSIDE_THE_BOX_PROFILE_REF) => createBmjaGame(players, seats, undefined, 'full-game', profile);
const score = (ruleset: typeof OUTSIDE_THE_BOX_RULESET | typeof BMJA_RULESET | typeof WESTERN_TM_RULESET, hand: MahjongHand) => ruleset.scoreHand({ hand, ...context });
const special = (ruleset: typeof OUTSIDE_THE_BOX_RULESET | typeof BMJA_RULESET | typeof WESTERN_TM_RULESET, hand: MahjongHand, id: string) => score(ruleset, hand).specialHands.find((candidate) => candidate.id === id);
const pairs = (ranks: number[]) => ranks.flatMap((rank) => [suited('bamboo', rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9), suited('bamboo', rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)]);

const scholars: MahjongHand = { sets: [set('red', 'pung', dragon('red')), set('green', 'pung', dragon('green')), set('white', 'pung', dragon('white')), set('other', 'pung', suited('circles', 4)), set('pair', 'pair', suited('bamboo', 2))], bonusTiles: [], isWinner: true };
const sparrows: MahjongHand = { sets: [], looseTiles: [suited('bamboo', 1), suited('bamboo', 1), suited('bamboo', 1), suited('bamboo', 1), ...pairs([2, 3, 4, 6, 8])], bonusTiles: [], isWinner: true };
const greenJade: MahjongHand = { sets: [set('green', 'pung', dragon('green')), set('a', 'pung', suited('bamboo', 2), 'exposed'), set('b', 'pung', suited('bamboo', 3)), set('c', 'pung', suited('bamboo', 4)), set('pair', 'pair', suited('bamboo', 6))], bonusTiles: [], isWinner: true };
const grandSequence = (pair: ReturnType<typeof suited> | ReturnType<typeof wind>): MahjongHand => ({ sets: [set('one', 'chow', suited('bamboo', 1)), set('four', 'chow', suited('bamboo', 4)), set('seven', 'chow', suited('bamboo', 7)), set('honour', 'pung', dragon('red')), set('pair', 'pair', pair)], bonusTiles: [], isWinner: true });
const buriedTreasure: MahjongHand = { sets: [set('a', 'pung', suited('bamboo', 2)), set('b', 'pung', suited('bamboo', 3)), set('c', 'pung', suited('bamboo', 4)), set('d', 'pung', wind('east')), set('pair', 'pair', suited('bamboo', 5))], bonusTiles: [bonus('flower', 1)], isWinner: true, winningMethod: 'wall' };
const goulashHand: MahjongHand = { sets: [set('a', 'pung', suited('bamboo', 2)), { ...set('b', 'kong', wind('east')), blankTileIds: ['blank-east-1', 'blank-east-2'] }, set('c', 'pung', suited('characters', 4)), set('d', 'pung', suited('circles', 6)), set('pair', 'pair', suited('bamboo', 8))], bonusTiles: [], isWinner: true };

describe('Outside the Box 0.1 readiness certification (#88F)', () => {
  it('certifies exact identity, catalogue membership, calculated Purity, and no fallback', () => {
    expect(resolveRulesProfile(OUTSIDE_THE_BOX_PROFILE_REF)).toBe(OUTSIDE_THE_BOX_RULESET);
    expect(() => resolveRulesProfile({ id: 'outside-the-box', version: '0.2' })).toThrow('Unknown rules profile');
    expect(outsideTheBoxSpecialHandBindings).toHaveLength(33);
    expect(new Set(outsideTheBoxSpecialHandBindings.map(({ name }) => name)).size).toBe(32); // Big Robert has two source-certified variants.
    expect(outsideTheBoxSpecialHandBindings.some(({ name }) => name === 'Purity')).toBe(false);
    expect(score(OUTSIDE_THE_BOX_RULESET, { sets: [set('a', 'pung', suited('characters', 2), 'exposed'), set('b', 'pung', suited('characters', 3)), set('c', 'pung', suited('characters', 4)), set('d', 'pung', suited('characters', 6)), set('pair', 'pair', suited('characters', 8))], bonusTiles: [], isWinner: true }).calculationComponents).toContainEqual(expect.objectContaining({ id: 'purity-playing-tiles' }));
  });

  it('locks same-pattern profile values, local exposure, and structural boundaries', () => {
    expect(special(BMJA_RULESET, scholars, 'three-great-scholars')).toMatchObject({ value: 1000 });
    expect(special(WESTERN_TM_RULESET, scholars, 'three-great-scholars')).toMatchObject({ value: 1500 });
    expect(special(OUTSIDE_THE_BOX_RULESET, scholars, 'club-three-great-scholars')).toMatchObject({ value: 1000, matched: false });
    expect(score(BMJA_RULESET, scholars).finalScore).toBe(1000);
    expect(score(WESTERN_TM_RULESET, scholars).finalScore).toBe(1500);
    expect(score(OUTSIDE_THE_BOX_RULESET, scholars).finalScore).toBe(1000);
    expect(special(WESTERN_TM_RULESET, sparrows, 'four-bamboo-one-and-five-green-bamboo-pairs')).toMatchObject({ value: 1500 });
    expect(special(OUTSIDE_THE_BOX_RULESET, sparrows, 'four-bamboo-one-and-five-green-bamboo-pairs')).toMatchObject({ value: 1000 });
    expect(special(OUTSIDE_THE_BOX_RULESET, greenJade, 'green-dragon-pung-with-bamboo-melds')).toMatchObject({ value: 500 });
    expect(special(WESTERN_TM_RULESET, greenJade, 'green-dragon-pung-with-bamboo-melds')).toMatchObject({ value: 1000 });
    expect(canonicalSpecialHandPatterns.find(({ id }) => id === 'run-one-to-nine-with-honour-pung-and-suited-pair')!.detect(grandSequence(wind('east')))).toBe(false);
    expect(canonicalSpecialHandPatterns.find(({ id }) => id === 'run-one-to-nine-with-honour-pung-and-any-pair')!.detect(grandSequence(wind('east')))).toBe(true);
  });

  it('keeps representative ordinary behaviour and fixed-special side scoring profile-local', () => {
    const ordinary: MahjongHand = { sets: [set('r', 'pung', dragon('red')), set('g', 'pung', dragon('green')), set('c', 'pung', suited('circles', 4)), set('d', 'chow', suited('characters', 2)), set('pair', 'pair', dragon('white'))], bonusTiles: [], isWinner: true };
    expect(score(OUTSIDE_THE_BOX_RULESET, ordinary).doubleRules).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'dragon-set-r' }), expect.objectContaining({ id: 'dragon-set-g' }), expect.objectContaining({ id: 'otb-little-three-dragons' })]));
    expect(OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: ordinary, ...context, limit: 100 }).finalScore).toBe(100);
    expect(score(OUTSIDE_THE_BOX_RULESET, buriedTreasure)).toMatchObject({ finalScore: 1008, limitApplied: false });
    expect(score(BMJA_RULESET, buriedTreasure).finalScore).toBe(1000);
    expect(score(WESTERN_TM_RULESET, buriedTreasure).finalScore).toBe(1000);
  });

  it('uses the common ordinary settlement engine, including East-sensitive transactions', () => {
    const cases = [
      { outcome: { type: 'win' as const, winnerId: 'east' }, values: { east: 200, south: 100, west: 300, north: 400 } },
      { outcome: { type: 'win' as const, winnerId: 'south' }, values: { east: 100, south: 200, west: 300, north: 400 } },
      { outcome: { type: 'win' as const, winnerId: 'north' }, values: { east: 100, south: 300, west: 200, north: 50 } },
    ];
    for (const fixture of cases) {
      const otb = OUTSIDE_THE_BOX_RULESET.settleRound(players, seats, { outcome: fixture.outcome, scores: fixture.values });
      const bmja = BMJA_RULESET.settleRound(players, seats, { outcome: fixture.outcome, scores: fixture.values });
      expect(otb).toEqual(bmja);
    }
  });

  it('composes draw/Goulash/win, blank validation, replay, undo, incidents, and persisted recovery', () => {
    const draw = { outcome: { type: 'draw' as const }, scores: { east: 0, south: 0, west: 0, north: 0 } };
    const afterOne = confirmHand(game(), draw);
    const afterTwo = confirmHand(afterOne, draw);
    expect(afterTwo).toMatchObject({ currentHandMode: 'goulash', prevailingWind: 'east' });
    expect(afterTwo.handHistory.map(({ settlement }) => settlement.transactions)).toEqual([[], []]);
    expect(validateHand(goulashHand, { ...context, handMode: 'goulash' })).toEqual([]);
    expect(validateHand({ ...goulashHand, sets: [set('chow', 'chow', suited('bamboo', 1))] }, { ...context, handMode: 'goulash' })).toContain('A Goulash hand cannot contain Chows.');
    const breakdown = OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: goulashHand, ...context, handMode: 'goulash' });
    const afterWinner = confirmHand(afterTwo, {
      outcome: { type: 'win', winnerId: 'east' },
      scores: { ...scores, east: breakdown.finalScore },
      scoreRecords: { east: { source: 'detailed-scorer', hand: goulashHand, context: { ...context, handMode: 'goulash' }, breakdown, finalScore: breakdown.finalScore } },
    });
    const incidentRound = confirmHand(afterWinner, { outcome: { type: 'win', winnerId: 'east' }, scores, incidents: [{ type: 'false-discard-name', discarderId: 'south', claimantId: 'east', result: 'mah-jong' }] });
    expect(incidentRound.currentHandMode).toBe('normal');
    expect(incidentRound.handHistory[3].settlement.transactions).toEqual([expect.objectContaining({ reason: 'false-name-mah-jong-liability', fromPlayerId: 'south', toPlayerId: 'east' })]);
    const replay = replayGame(incidentRound.setup, incidentRound.handHistory.map(({ outcome, scores: savedScores, scoreRecords, incidents }) => ({ outcome, scores: savedScores, scoreRecords, incidents })));
    expect(replay).toEqual(incidentRound);
    expect(undoLastHand(incidentRound).currentHandMode).toBe('normal');
    const memory = storage();
    saveGameRecovery(memory, incidentRound, 'win', 'east', { scores: {}, scoreRecords: {} });
    const recovered = loadGameRecovery(memory)?.game;
    expect(recovered).toMatchObject({ setup: { rulesProfile: OUTSIDE_THE_BOX_PROFILE_REF }, balances: incidentRound.balances, currentHandMode: 'normal' });
    expect((recovered?.handHistory[2].scoreRecords.east as { hand: MahjongHand }).hand.sets[1]?.blankTileIds).toEqual(['blank-east-1', 'blank-east-2']);
    expect(recovered?.handHistory[3].incidents).toEqual(incidentRound.handHistory[3].incidents);
  });

  it('keeps OTB-only modes and incidents out of BMJA and Western, without mutating input', () => {
    const original = structuredClone(goulashHand);
    expect(BMJA_RULESET.nextHandMode('normal', { type: 'draw' })).toBe('normal');
    expect(WESTERN_TM_RULESET.nextHandMode('normal', { type: 'draw' })).toBe('normal');
    expect(() => confirmHand(game(BMJA_PROFILE_REF), { outcome: { type: 'draw' }, scores: { east: 0, south: 0, west: 0, north: 0 }, incidents: [{ type: 'cannon', liablePlayerId: 'south', noChoiceAccepted: false }] })).toThrow(/does not support/);
    expect(() => confirmHand(game(WESTERN_TM_PROFILE_REF), { outcome: { type: 'draw' }, scores: { east: 0, south: 0, west: 0, north: 0 }, incidents: [{ type: 'cannon', liablePlayerId: 'south', noChoiceAccepted: false }] })).toThrow(/does not support/);
    score(OUTSIDE_THE_BOX_RULESET, goulashHand);
    expect(goulashHand).toEqual(original);
  });
});
