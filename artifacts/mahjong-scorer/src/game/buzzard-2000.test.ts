import { describe, expect, it } from 'vitest';
import { bonus, scoreHand, set, suited, type MahjongHand } from '../scoring';
import { detectSpecialHands } from '../scoring/special-hands';
import { BUZZARD_2000_SCORING_POLICY, buzzard2000SpecialHandBindings } from './buzzard-2000';

const nineGates = (extra: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9): MahjongHand => ({
  sets: [], looseTiles: [1,1,1,2,3,4,5,6,7,8,9,9,9,extra].map((rank) => suited('bamboo', rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)), bonusTiles: [], isWinner: true,
});
const matched = (hand: MahjongHand) => detectSpecialHands(hand, { playerWind: 'east', prevailingWind: 'east', limit: 600 }, buzzard2000SpecialHandBindings)
  .find((result) => result.id === 'one-suit-nine-gates-any-completion');

describe('Buzzard 2000 Calling Nine Tile Hand', () => {
  it.each([5, 1, 9] as const)('accepts lawful completion rank %s', (rank) => expect(matched(nineGates(rank))).toMatchObject({ matched: true, value: 600 }));
  it('rejects a mixed suit, honour, or altered base multiplicity', () => {
    expect(matched({ ...nineGates(5), looseTiles: [...nineGates(5).looseTiles!.slice(0, 13), { family: 'wind', wind: 'east' }] })).toMatchObject({ matched: false });
    expect(matched({ ...nineGates(5), looseTiles: [...nineGates(5).looseTiles!.slice(1), suited('bamboo', 2)] })).toMatchObject({ matched: false });
  });
});

describe('Buzzard 2000 ordinary profile policy', () => {
  const context = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 600 };
  const chows: MahjongHand = { sets: [set('a', 'chow', suited('bamboo', 1)), set('b', 'chow', suited('bamboo', 2)), set('c', 'chow', suited('bamboo', 3)), set('d', 'chow', suited('bamboo', 4)), set('pair', 'pair', suited('bamboo', 5))], bonusTiles: [], isWinner: true };
  it('adds the additive bonuses, Chow double, pure-suit treatment, and independent Flower/Season doubles', () => {
    const scored = scoreHand({ ...chows, bonusTiles: [bonus('flower', 1), bonus('flower', 2), bonus('flower', 3), bonus('flower', 4), bonus('season', 1), bonus('season', 2), bonus('season', 3), bonus('season', 4)], classicalEvidence: { standingHand: true, onlyPossibleWinningTile: true }, winningMethod: 'last-wall-tile' }, context, buzzard2000SpecialHandBindings, BUZZARD_2000_SCORING_POLICY);
    expect(scored.pointRules.map((rule) => rule.id)).toEqual(expect.arrayContaining(['buzzard-standing-hand', 'buzzard-only-possible', 'buzzard-last-wall']));
    expect(scored.doubleRules.map((rule) => [rule.id, rule.amount])).toEqual(expect.arrayContaining([['buzzard-all-chows', 1], ['buzzard-pure-suit', 3], ['buzzard-flower-complete', 3], ['buzzard-own-flower', 1], ['buzzard-season-complete', 3], ['buzzard-own-season', 1]]));
  });
  it('does not inherit BMJA concealed, Original Call, or final-discard doubles', () => {
    const scored = scoreHand({ ...chows, originalCall: true, winningMethod: 'final-discard' }, context, buzzard2000SpecialHandBindings, BUZZARD_2000_SCORING_POLICY);
    expect(scored.doubleRules.map((rule) => rule.id)).not.toEqual(expect.arrayContaining(['concealed-hand', 'original-call', 'win-final-discard']));
  });
  it('binds all ten named limits to the trusted table limit', () => {
    expect(buzzard2000SpecialHandBindings).toHaveLength(10);
    expect(matched(nineGates(5))).toMatchObject({ value: 600 });
    expect(detectSpecialHands(nineGates(5), { ...context, limit: 777 }, buzzard2000SpecialHandBindings).find((result) => result.id === 'one-suit-nine-gates-any-completion')).toMatchObject({ value: 777 });
  });
});
