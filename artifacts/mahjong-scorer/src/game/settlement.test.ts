import { describe, expect, it } from 'vitest';
import { settleBmjaRound } from './settlement';
import type { GamePlayer, SeatAssignments } from './types';

const players: GamePlayer[] = [
  { id: 'bill', name: 'Bill' },
  { id: 'rod', name: 'Rod' },
  { id: 'ben', name: 'Ben' },
  { id: 'jack', name: 'Jack' },
];

const seats: SeatAssignments = {
  bill: 'south',
  rod: 'east',
  ben: 'west',
  jack: 'north',
};

describe('BMJA round settlement', () => {
  it('matches the published Bill, Rod, Ben and Jack worked example', () => {
    const result = settleBmjaRound(players, seats, {
      outcome: { type: 'win', winnerId: 'bill' },
      scores: { bill: 84, rod: 80, ben: 208, jack: 416 },
    });

    expect(result.changes).toEqual({
      bill: 336,
      rod: -1096,
      ben: -36,
      jack: 796,
    });
    expect(Object.values(result.changes).reduce((sum, value) => sum + value, 0))
      .toBe(0);
    expect(result.zeroSum).toBe(true);
  });

  it('doubles every winner payment when East wins', () => {
    const result = settleBmjaRound(players, seats, {
      outcome: { type: 'win', winnerId: 'rod' },
      scores: { bill: 100, rod: 200, ben: 300, jack: 400 },
    });
    expect(
      result.transactions
        .filter((transaction) => transaction.reason === 'winner-payment')
        .map((transaction) => transaction.amount),
    ).toEqual([400, 400, 400]);
    expect(result.changes.rod).toBe(1200);
    expect(Object.values(result.changes).reduce((sum, value) => sum + value, 0))
      .toBe(0);
  });

  it('settles differences between non-winning players in both directions', () => {
    const result = settleBmjaRound(players, seats, {
      outcome: { type: 'win', winnerId: 'jack' },
      scores: { bill: 300, rod: 100, ben: 200, jack: 50 },
    });
    const differencePayments = result.transactions.filter(
      (transaction) => transaction.reason === 'score-difference',
    );
    expect(differencePayments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fromPlayerId: 'rod',
          toPlayerId: 'bill',
          baseAmount: 200,
          amount: 400,
        }),
        expect.objectContaining({
          fromPlayerId: 'ben',
          toPlayerId: 'bill',
          baseAmount: 100,
          amount: 100,
        }),
        expect.objectContaining({
          fromPlayerId: 'rod',
          toPlayerId: 'ben',
          baseAmount: 100,
          amount: 200,
        }),
      ]),
    );
    expect(Object.values(result.changes).some((change) => change < 0)).toBe(true);
    expect(Object.values(result.changes).some((change) => change > 0)).toBe(true);
    expect(Object.values(result.changes).reduce((sum, value) => sum + value, 0))
      .toBe(0);
  });

  it('records a drawn hand as a zero-sum settlement with no payments', () => {
    const result = settleBmjaRound(players, seats, {
      outcome: { type: 'draw' },
      scores: { bill: 84, rod: 80, ben: 208, jack: 416 },
    });
    expect(result.transactions).toEqual([]);
    expect(result.changes).toEqual({ bill: 0, rod: 0, ben: 0, jack: 0 });
    expect(result.zeroSum).toBe(true);
  });
});