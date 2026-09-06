import { describe, expect, it } from 'vitest';
import { bonus, dragon, scoreHand, set, suited, wind } from '.';
import type { GameContext, MahjongHand, ScoreBreakdown } from '.';

const context = (
  playerWind: GameContext['playerWind'] = 'east',
  prevailingWind: GameContext['prevailingWind'] = 'east',
): GameContext => ({ playerWind, prevailingWind, limit: 1000 });

const itemised = (score: ScoreBreakdown) => ({
  valid: score.valid,
  pointRules: score.pointRules.map(({ id, amount }) => ({ id, amount })),
  doubleRules: score.doubleRules.map(({ id, amount }) => ({ id, amount })),
  components: score.calculationComponents,
  basePoints: score.basePoints,
  doubles: score.doubles,
  uncappedScore: score.uncappedScore,
  finalScore: score.finalScore,
  limitApplied: score.limitApplied,
  scoringMode: score.scoringMode,
});

describe('BMJA complete-hand golden fixtures', () => {
  it('scores a standard mixed-one-suit winner item by item', () => {
    const hand: MahjongHand = {
      sets: [
        set('dragon', 'pung', dragon('red'), 'exposed'),
        set('chow-1', 'chow', suited('bamboo', 2), 'exposed'),
        set('chow-2', 'chow', suited('bamboo', 5)),
        set('terminal', 'pung', suited('bamboo', 9)),
        set('pair', 'pair', wind('south')),
      ],
      bonusTiles: [bonus('flower', 2)],
      isWinner: true,
      winningMethod: 'wall',
    };
    expect(itemised(scoreHand(hand, context('south', 'east')))).toEqual({
      valid: true,
      pointRules: [
        { id: 'pung-dragon', amount: 4 },
        { id: 'pung-terminal', amount: 8 },
        { id: 'own-wind-pair', amount: 2 },
        { id: 'bonus-flower-2', amount: 4 },
        { id: 'mahjong', amount: 20 },
        { id: 'live-wall-win', amount: 2 },
      ],
      doubleRules: [
        { id: 'dragon-set-dragon', amount: 1 },
        { id: 'own-flower', amount: 1 },
        { id: 'mixed-one-suit', amount: 1 },
      ],
      components: [
        {
          id: 'standard-hand',
          label: 'Standard hand',
          base: 40,
          doubles: 3,
          subtotal: 320,
        },
      ],
      basePoints: 40,
      doubles: 3,
      uncappedScore: 320,
      finalScore: 320,
      limitApplied: false,
      scoringMode: 'standard',
    });
  });

  it('scores Purity and bonus tiles as separate components', () => {
    const hand: MahjongHand = {
      sets: [
        set('p1', 'pung', suited('characters', 2), 'exposed'),
        set('p2', 'pung', suited('characters', 3)),
        set('p3', 'pung', suited('characters', 6)),
        set('k1', 'kong', suited('characters', 9)),
        set('pair', 'pair', suited('characters', 5)),
      ],
      bonusTiles: [bonus('flower', 1), bonus('season', 2)],
      isWinner: true,
      winningMethod: 'discard',
    };
    expect(itemised(scoreHand(hand))).toEqual({
      valid: true,
      pointRules: [
        { id: 'pung-p1', amount: 2 },
        { id: 'pung-p2', amount: 4 },
        { id: 'pung-p3', amount: 4 },
        { id: 'kong-k1', amount: 32 },
        { id: 'bonus-flower-1', amount: 4 },
        { id: 'bonus-season-2', amount: 4 },
        { id: 'mahjong', amount: 20 },
      ],
      doubleRules: [
        { id: 'own-flower', amount: 1 },
        { id: 'purity', amount: 3 },
      ],
      components: [
        {
          id: 'purity-playing-tiles',
          label: 'Purity playing tiles',
          base: 62,
          doubles: 3,
          subtotal: 496,
        },
        {
          id: 'purity-bonus-tiles',
          label: 'Bonus tiles',
          base: 8,
          doubles: 1,
          subtotal: 16,
        },
      ],
      basePoints: 70,
      doubles: 4,
      uncappedScore: 512,
      finalScore: 512,
      limitApplied: false,
      scoringMode: 'special',
    });
  });

  it('scores All pair honours plus separately doubled bonus tiles', () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'pair', wind('east')),
        set('2', 'pair', wind('south')),
        set('3', 'pair', suited('bamboo', 1)),
        set('4', 'pair', suited('characters', 9)),
        set('5', 'pair', dragon('red')),
        set('6', 'pair', dragon('green')),
        set('7', 'pair', dragon('white')),
      ],
      bonusTiles: [bonus('flower', 4), bonus('season', 2)],
      isWinner: true,
    };
    expect(itemised(scoreHand(hand, context('north')))).toEqual({
      valid: true,
      pointRules: [
        { id: 'bonus-flower-4', amount: 4 },
        { id: 'bonus-season-2', amount: 4 },
      ],
      doubleRules: [{ id: 'own-flower', amount: 1 }],
      components: [
        {
          id: 'special-all-pair-honours',
          label: 'All pair honours',
          base: 500,
          doubles: 0,
          subtotal: 500,
        },
        {
          id: 'special-bonus-tiles',
          label: 'Bonus tiles',
          base: 8,
          doubles: 1,
          subtotal: 16,
        },
      ],
      basePoints: 8,
      doubles: 1,
      uncappedScore: 516,
      finalScore: 516,
      limitApplied: false,
      scoringMode: 'special',
    });
  });

  it('applies final-discard doubling only to special-hand bonus tiles', () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'pair', wind('east')),
        set('2', 'pair', wind('south')),
        set('3', 'pair', suited('bamboo', 1)),
        set('4', 'pair', suited('characters', 9)),
        set('5', 'pair', dragon('red')),
        set('6', 'pair', dragon('green')),
        set('7', 'pair', dragon('white')),
      ],
      bonusTiles: [bonus('flower', 4), bonus('season', 2)],
      isWinner: true,
      winningMethod: 'final-discard',
    };
    const score = scoreHand(hand, context('north'));
    expect(score.doubleRules.map(({ id, amount }) => ({ id, amount }))).toEqual([
      { id: 'own-flower', amount: 1 },
      { id: 'special-final-discard', amount: 1 },
    ]);
    expect(score.calculationComponents).toEqual([
      {
        id: 'special-all-pair-honours',
        label: 'All pair honours',
        base: 500,
        doubles: 0,
        subtotal: 500,
      },
      {
        id: 'special-bonus-tiles',
        label: 'Bonus tiles',
        base: 8,
        doubles: 2,
        subtotal: 32,
      },
    ]);
    expect(score.finalScore).toBe(532);
  });

  it('caps a limit special hand after separately calculating bonuses', () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'pung', wind('east')),
        set('2', 'pung', wind('south')),
        set('3', 'pung', dragon('red')),
        set('4', 'pung', dragon('green')),
        set('5', 'pair', dragon('white')),
      ],
      bonusTiles: [bonus('flower', 1)],
      isWinner: true,
    };
    const score = scoreHand(hand);
    expect(score.calculationComponents).toEqual([
      {
        id: 'special-all-winds-and-dragons',
        label: 'All Winds and Dragons',
        base: 1000,
        doubles: 0,
        subtotal: 1000,
      },
      {
        id: 'special-bonus-tiles',
        label: 'Bonus tiles',
        base: 4,
        doubles: 1,
        subtotal: 8,
      },
    ]);
    expect(score.uncappedScore).toBe(1008);
    expect(score.finalScore).toBe(1000);
    expect(score.limitApplied).toBe(true);
  });
});