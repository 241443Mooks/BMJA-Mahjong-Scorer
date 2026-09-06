import { describe, expect, it } from 'vitest';
import { bonus, dragon, scoreHand, set, suited, wind } from '.';
import type { MahjongHand } from '.';

describe('scoreHand breakdown', () => {
  it('returns a detailed standard score calculation', () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'pung', dragon('red'), 'exposed'),
        set('2', 'chow', suited('bamboo', 2), 'exposed'),
        set('3', 'chow', suited('bamboo', 5)),
        set('4', 'pung', suited('bamboo', 9)),
        set('5', 'pair', wind('south')),
      ],
      bonusTiles: [bonus('flower', 2)],
      isWinner: true,
      winningMethod: 'wall',
    };
    const score = scoreHand(hand, {
      playerWind: 'south',
      prevailingWind: 'east',
      limit: 1000,
    });
    expect(score.valid).toBe(true);
    expect(score.basePoints).toBe(40);
    expect(score.doubles).toBe(3);
    expect(score.uncappedScore).toBe(320);
    expect(score.finalScore).toBe(320);
    expect(score.pointRules.length).toBeGreaterThan(4);
    expect(score.doubleRules.map((rule) => rule.id)).toEqual([
      'dragon-set-1',
      'own-flower',
      'mixed-one-suit',
    ]);
  });

  it('caps a standard score at the table limit', () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'kong', dragon('red')),
        set('2', 'kong', wind('east')),
        set('3', 'pung', suited('bamboo', 1)),
        set('4', 'pung', suited('bamboo', 9), 'exposed'),
        set('5', 'pair', suited('bamboo', 5)),
      ],
      bonusTiles: [
        bonus('flower', 1),
        bonus('flower', 2),
        bonus('flower', 3),
        bonus('flower', 4),
      ],
      isWinner: true,
    };
    const score = scoreHand(hand);
    expect(score.uncappedScore).toBeGreaterThan(1000);
    expect(score.finalScore).toBe(1000);
    expect(score.limitApplied).toBe(true);
  });

  it('uses a special hand fixed value instead of ordinary set scoring', () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'pung', wind('east')),
        set('2', 'pung', wind('south')),
        set('3', 'pung', dragon('red')),
        set('4', 'pung', dragon('green')),
        set('5', 'pair', dragon('white')),
      ],
      bonusTiles: [],
      isWinner: true,
    };
    const score = scoreHand(hand);
    expect(score.scoringMode).toBe('special');
    expect(score.finalScore).toBe(1000);
  });

  it('adds separately doubled bonus points to a half-limit special hand', () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'pair', wind('east')),
        set('2', 'pair', wind('south')),
        set('3', 'pair', wind('west')),
        set('4', 'pair', wind('north')),
        set('5', 'pair', dragon('red')),
        set('6', 'pair', dragon('green')),
        set('7', 'pair', dragon('white')),
      ],
      bonusTiles: [bonus('flower', 4), bonus('season', 2)],
      isWinner: true,
    };
    const score = scoreHand(hand, {
      playerWind: 'north',
      prevailingWind: 'east',
      limit: 1000,
    });
    expect(score.scoringMode).toBe('special');
    expect(score.basePoints).toBe(8);
    expect(score.doubles).toBe(1);
    expect(score.uncappedScore).toBe(516);
    expect(score.finalScore).toBe(516);
  });

  it('returns validation errors without hiding the provisional breakdown', () => {
    const score = scoreHand({
      sets: [set('bad', 'chow', suited('circles', 9))],
      bonusTiles: [],
      isWinner: true,
    });
    expect(score.valid).toBe(false);
    expect(score.validationErrors).toHaveLength(2);
    expect(score.basePoints).toBe(20);
  });
});
