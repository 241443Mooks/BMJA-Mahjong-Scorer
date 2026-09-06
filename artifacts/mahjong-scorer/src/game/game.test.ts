import { describe, expect, it } from 'vitest';
import { confirmHand, createBmjaGame, undoLastHand } from './game';
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

describe('BMJA game-level golden fixtures', () => {
  it('records the published settlement, totals and next seats in the ledger', () => {
    const game = createBmjaGame(players, seats);
    const next = confirmHand(game, {
      outcome: { type: 'win', winnerId: 'bill' },
      scores: { bill: 84, rod: 80, ben: 208, jack: 416 },
    });

    expect(next.balances).toEqual({
      bill: 336,
      rod: -1096,
      ben: -36,
      jack: 796,
    });
    expect(next.seats).toEqual({
      bill: 'east',
      rod: 'north',
      ben: 'south',
      jack: 'west',
    });
    expect(next.handHistory).toHaveLength(1);
    expect(next.handHistory[0]).toMatchObject({
      handNumber: 1,
      outcome: { type: 'win', winnerId: 'bill' },
      eastPlayerId: 'rod',
      prevailingWind: 'east',
      runningTotals: {
        bill: 336,
        rod: -1096,
        ben: -36,
        jack: 796,
      },
    });
    expect(
      Object.values(next.handHistory[0].settlement.changes).reduce(
        (sum, value) => sum + value,
        0,
      ),
    ).toBe(0);
  });

  it('undoes by replaying retained ledger entries from the original setup', () => {
    const initial = createBmjaGame(players, seats);
    const afterFirst = confirmHand(initial, {
      outcome: { type: 'win', winnerId: 'rod' },
      scores: { bill: 100, rod: 200, ben: 300, jack: 400 },
    });
    const afterSecond = confirmHand(afterFirst, {
      outcome: { type: 'draw' },
      scores: { bill: 20, rod: 40, ben: 60, jack: 80 },
    });
    const undone = undoLastHand(afterSecond);

    expect(undone).toEqual(afterFirst);
    expect(undone.handHistory).toHaveLength(1);
  });
});