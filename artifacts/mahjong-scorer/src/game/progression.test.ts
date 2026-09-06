import { describe, expect, it } from 'vitest';
import { progressBmjaGame } from './progression';
import type { GamePlayer, ProgressionState } from './types';

const players: GamePlayer[] = [
  { id: 'a', name: 'A' },
  { id: 'b', name: 'B' },
  { id: 'c', name: 'C' },
  { id: 'd', name: 'D' },
];

const initial: ProgressionState = {
  seats: { a: 'east', b: 'south', c: 'west', d: 'north' },
  prevailingWind: 'east',
  eastCycleStartPlayerId: 'a',
};

describe('BMJA seat and prevailing-wind progression', () => {
  it('retains East when East wins', () => {
    const next = progressBmjaGame(players, initial, {
      type: 'win',
      winnerId: 'a',
    });
    expect(next.seats).toEqual(initial.seats);
    expect(next.prevailingWind).toBe('east');
    expect(next.seatsRotated).toBe(false);
  });

  it('rotates anti-clockwise when another player wins', () => {
    const next = progressBmjaGame(players, initial, {
      type: 'win',
      winnerId: 'c',
    });
    expect(next.seats).toEqual({
      a: 'north',
      b: 'east',
      c: 'south',
      d: 'west',
    });
    expect(next.prevailingWind).toBe('east');
    expect(next.seatsRotated).toBe(true);
  });

  it('retains East after a drawn hand', () => {
    const next = progressBmjaGame(players, initial, { type: 'draw' });
    expect(next.seats).toEqual(initial.seats);
    expect(next.prevailingWind).toBe('east');
    expect(next.seatsRotated).toBe(false);
  });

  it('advances the prevailing wind only after all four East tenures', () => {
    let current = initial;
    for (const winnerId of ['c', 'd', 'a']) {
      const next = progressBmjaGame(players, current, {
        type: 'win',
        winnerId,
      });
      expect(next.prevailingWind).toBe('east');
      current = next;
    }
    const completedCycle = progressBmjaGame(players, current, {
      type: 'win',
      winnerId: 'b',
    });
    expect(completedCycle.seats).toEqual(initial.seats);
    expect(completedCycle.prevailingWind).toBe('south');
    expect(completedCycle.prevailingWindAdvanced).toBe(true);
  });
});