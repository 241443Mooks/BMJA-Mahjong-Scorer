import { describe, expect, it } from 'vitest';
import { createBmjaGame } from './game';
import {
  applyHandScorerResult,
  createHandScorerContext,
} from './hand-scorer-handoff';

const game = createBmjaGame(
  [
    { id: 'jenn', name: 'Jenn' },
    { id: 'bill', name: 'Bill' },
    { id: 'ben', name: 'Ben' },
    { id: 'jack', name: 'Jack' },
  ],
  { jenn: 'east', bill: 'south', ben: 'west', jack: 'north' },
);

describe('game hand-scorer handoff', () => {
  it('passes the selected player and live game context into the hand scorer', () => {
    expect(
      createHandScorerContext(game, 'bill', {
        type: 'win',
        winnerId: 'bill',
      }),
    ).toEqual({
      playerId: 'bill',
      playerName: 'Bill',
      playerWind: 'south',
      prevailingWind: 'east',
      isWinner: true,
      limit: 1000,
    });
  });

  it('returns the final score to only that player without changing game state', () => {
    const result = applyHandScorerResult(
      game,
      { jenn: 80, ben: 208 },
      { playerId: 'bill', score: 336, isWinner: true },
    );

    expect(result).toEqual({
      scores: { jenn: 80, bill: 336, ben: 208 },
      selectedWinnerId: 'bill',
    });
    expect(game.balances).toEqual({ jenn: 0, bill: 0, ben: 0, jack: 0 });
    expect(game.handHistory).toEqual([]);
  });
});