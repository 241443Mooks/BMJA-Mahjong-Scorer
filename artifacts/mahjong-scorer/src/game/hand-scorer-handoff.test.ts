import { describe, expect, it } from 'vitest';
import { confirmHand, createBmjaGame } from './game';
import {
  applyHandScorerSession,
  applyManualScore,
  applyHandScorerResult,
  createHandScorerContext,
  handScorerLocalContext,
} from './hand-scorer-handoff';
import type {
  HandScorerResult,
  RoundScoringDraft,
} from './types';

const game = createBmjaGame(
  [
    { id: 'jenn', name: 'Jenn' },
    { id: 'bill', name: 'Bill' },
    { id: 'ben', name: 'Ben' },
    { id: 'jack', name: 'Jack' },
  ],
  { jenn: 'east', bill: 'south', ben: 'west', jack: 'north' },
);

const makeCalculatedResult = (
  playerId: string,
  score: number,
  isWinner: boolean,
  marker: string,
): HandScorerResult => ({
  playerId,
  score,
  isWinner,
  detailedHand: {
    source: 'detailed-scorer',
    hand: {
      sets: [
        {
          id: marker,
          kind: 'pair',
          visibility: 'concealed',
          tile: { family: 'dragon', dragon: 'red' },
        },
      ],
      bonusTiles: [],
      isWinner,
      winningMethod: isWinner ? 'wall' : undefined,
      originalCall: marker === 'replacement',
    },
    context: {
      playerWind: game.seats[playerId],
      prevailingWind: game.prevailingWind,
      limit: 1000,
    },
    breakdown: {
      valid: true,
      validationErrors: [],
      pointRules: [],
      doubleRules: [],
      specialHands: [],
      basePoints: score,
      doubles: 0,
      uncappedScore: score,
      finalScore: score,
      limitApplied: false,
      scoringMode: 'standard',
      calculationComponents: [],
    },
    finalScore: score,
  },
});

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

  it('resets winner state when a winner is opened before a non-winner', () => {
    const outcome = { type: 'win' as const, winnerId: 'bill' };
    const winner = handScorerLocalContext(
      createHandScorerContext(game, 'bill', outcome),
    );
    const nonWinner = handScorerLocalContext(
      createHandScorerContext(game, 'jenn', outcome),
    );

    expect([winner.isWinner, nonWinner.isWinner]).toEqual([true, false]);
  });

  it('resets winner state when a non-winner is opened before the winner', () => {
    const outcome = { type: 'win' as const, winnerId: 'ben' };
    const nonWinner = handScorerLocalContext(
      createHandScorerContext(game, 'bill', outcome),
    );
    const winner = handScorerLocalContext(
      createHandScorerContext(game, 'ben', outcome),
    );

    expect([nonWinner.isWinner, winner.isWinner]).toEqual([false, true]);
  });

  it('returns the full detailed record to only that player', () => {
    const calculated = makeCalculatedResult('bill', 336, true, 'original');
    const result = applyHandScorerResult(
      game,
      {
        scores: { jenn: 80, ben: 208 },
        scoreRecords: {
          jenn: { source: 'manual', finalScore: 80 },
          ben: { source: 'manual', finalScore: 208 },
        },
      },
      calculated,
    );

    expect(result.draft.scores).toEqual({
      jenn: 80,
      bill: 336,
      ben: 208,
    });
    expect(result.draft.scoreRecords.bill).toEqual(calculated.detailedHand);
    expect(result.selectedWinnerId).toBe('bill');
    expect(game.balances).toEqual({ jenn: 0, bill: 0, ben: 0, jack: 0 });
    expect(game.handHistory).toEqual([]);
  });

  it('recalculation replaces the previous detailed record for that player', () => {
    const first = applyHandScorerResult(
      game,
      { scores: {}, scoreRecords: {} },
      makeCalculatedResult('bill', 88, true, 'original'),
    );
    const replacement = makeCalculatedResult(
      'bill',
      176,
      true,
      'replacement',
    );
    const second = applyHandScorerResult(game, first.draft, replacement);

    expect(second.draft.scores.bill).toBe(176);
    expect(second.draft.scoreRecords.bill).toEqual(replacement.detailedHand);
    expect(
      second.draft.scoreRecords.bill?.source === 'detailed-scorer'
        ? second.draft.scoreRecords.bill.hand.sets[0].id
        : undefined,
    ).toBe('replacement');
  });

  it('cancel leaves an existing calculated record untouched', () => {
    const draft = applyHandScorerResult(
      game,
      { scores: {}, scoreRecords: {} },
      makeCalculatedResult('bill', 88, true, 'original'),
    ).draft;
    const cancelled = applyHandScorerSession(game, draft, null);

    expect(cancelled.draft).toBe(draft);
    expect(cancelled.draft.scoreRecords.bill).toEqual(
      draft.scoreRecords.bill,
    );
  });

  it('manual entry replaces stale calculated metadata', () => {
    const calculated = applyHandScorerResult(
      game,
      { scores: {}, scoreRecords: {} },
      makeCalculatedResult('bill', 88, true, 'original'),
    ).draft;
    const manual = applyManualScore(game, calculated, 'bill', 100);

    expect(manual.scores.bill).toBe(100);
    expect(manual.scoreRecords.bill).toEqual({
      source: 'manual',
      finalScore: 100,
    });
  });

  it('persists detailed and manual score sources into the confirmed ledger', () => {
    const calculated = makeCalculatedResult('bill', 88, true, 'original');
    let draft: RoundScoringDraft = {
      scores: {},
      scoreRecords: {},
    };
    draft = applyHandScorerResult(game, draft, calculated).draft;
    draft = applyManualScore(game, draft, 'jenn', 80);
    draft = applyManualScore(game, draft, 'ben', 208);
    draft = applyManualScore(game, draft, 'jack', 416);

    const confirmed = confirmHand(game, {
      outcome: { type: 'win', winnerId: 'bill' },
      scores: draft.scores as Record<string, number>,
      scoreRecords: draft.scoreRecords,
    });

    expect(confirmed.handHistory[0].scoreRecords.bill).toEqual(
      calculated.detailedHand,
    );
    expect(confirmed.handHistory[0].scoreRecords.jenn).toEqual({
      source: 'manual',
      finalScore: 80,
    });
  });
});