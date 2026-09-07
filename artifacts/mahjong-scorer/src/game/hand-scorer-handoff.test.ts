import { describe, expect, it } from 'vitest';
import { suited } from '../scoring';
import { confirmHand, createBmjaGame, undoLastHand } from './game';
import {
  applyHandScorerSession,
  applyManualScore,
  applyHandScorerResult,
  createHandScorerContext,
  handScorerLocalContext,
  reconcileDetailedHandsForOutcome,
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

const billWins = { type: 'win' as const, winnerId: 'bill' };

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
      evidenceCompleteness: 'complete',
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

  it('derives exactly one winner across every player context', () => {
    expect(
      game.players.map(
        (player) =>
          createHandScorerContext(game, player.id, billWins).isWinner,
      ),
    ).toEqual([false, true, false, false]);
  });

  it('derives no winners for a draw or wash-out', () => {
    expect(
      game.players.map(
        (player) =>
          createHandScorerContext(game, player.id, { type: 'draw' }).isWinner,
      ),
    ).toEqual([false, false, false, false]);
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
      billWins,
      calculated,
    );

    expect(result.draft.scores).toEqual({
      jenn: 80,
      bill: 336,
      ben: 208,
    });
    expect(result.draft.scoreRecords.bill).toEqual(calculated.detailedHand);
    expect(game.balances).toEqual({ jenn: 0, bill: 0, ben: 0, jack: 0 });
    expect(game.handHistory).toEqual([]);
  });

  it('preserves arbitrary remaining tiles in a non-winner handoff', () => {
    const result = makeCalculatedResult('jenn', 44, false, 'remaining-tiles');
    result.detailedHand.hand.remainingTiles = [
      suited('bamboo', 2),
      suited('characters', 5),
      suited('circles', 8),
    ];

    const applied = applyHandScorerResult(
      game,
      { scores: {}, scoreRecords: {} },
      billWins,
      result,
    );
    const stored = applied.draft.scoreRecords.jenn;

    expect(
      stored?.source === 'detailed-scorer'
        ? stored.hand.remainingTiles
        : undefined,
    ).toEqual(result.detailedHand.hand.remainingTiles);
  });

  it('recalculation replaces the previous detailed record for that player', () => {
    const first = applyHandScorerResult(
      game,
      { scores: {}, scoreRecords: {} },
      billWins,
      makeCalculatedResult('bill', 88, true, 'original'),
    );
    const replacement = makeCalculatedResult(
      'bill',
      176,
      true,
      'replacement',
    );
    const second = applyHandScorerResult(
      game,
      first.draft,
      billWins,
      replacement,
    );

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
      billWins,
      makeCalculatedResult('bill', 88, true, 'original'),
    ).draft;
    const cancelled = applyHandScorerSession(game, draft, billWins, null);

    expect(cancelled.draft).toBe(draft);
    expect(cancelled.draft.scoreRecords.bill).toEqual(
      draft.scoreRecords.bill,
    );
  });

  it('manual entry replaces stale calculated metadata', () => {
    const calculated = applyHandScorerResult(
      game,
      { scores: {}, scoreRecords: {} },
      billWins,
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
    calculated.detailedHand.hand.winningMethod = 'discard';
    calculated.detailedHand.hand.winningTileProvenance = {
      tile: { family: 'dragon', dragon: 'red' },
      target: { type: 'grouped-set', setId: 'original' },
    };
    calculated.detailedHand.hand.winningEventEvidence = {
      type: 'discard',
      discardedBy: 'east',
      handDiscardOrdinal: 1,
    };
    let draft: RoundScoringDraft = {
      scores: {},
      scoreRecords: {},
    };
    draft = applyHandScorerResult(game, draft, billWins, calculated).draft;
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
    expect(
      confirmed.handHistory[0].scoreRecords.bill?.source === 'detailed-scorer'
        ? confirmed.handHistory[0].scoreRecords.bill.hand
            .winningTileProvenance
        : undefined,
    ).toEqual({
      tile: { family: 'dragon', dragon: 'red' },
      target: { type: 'grouped-set', setId: 'original' },
    });
    expect(
      confirmed.handHistory[0].scoreRecords.bill?.source === 'detailed-scorer'
        ? confirmed.handHistory[0].scoreRecords.bill.hand.winningEventEvidence
        : undefined,
    ).toEqual({
      type: 'discard',
      discardedBy: 'east',
      handDiscardOrdinal: 1,
    });
    expect(confirmed.handHistory[0].scoreRecords.jenn).toEqual({
      source: 'manual',
      finalScore: 80,
    });
  });

  it('retains remaining tiles through apply, confirmation, replay and undo', () => {
    const bill = makeCalculatedResult('bill', 88, true, 'winner');
    const jenn = makeCalculatedResult('jenn', 44, false, 'loser');
    jenn.detailedHand.hand.remainingTiles = [
      suited('bamboo', 1),
      suited('bamboo', 2),
      suited('bamboo', 3),
      suited('characters', 4),
      suited('characters', 5),
      suited('characters', 7),
      suited('circles', 2),
      suited('circles', 6),
      suited('circles', 8),
      { family: 'wind', wind: 'north' },
      { family: 'dragon', dragon: 'green' },
    ];

    let draft: RoundScoringDraft = { scores: {}, scoreRecords: {} };
    draft = applyHandScorerResult(game, draft, billWins, bill).draft;
    draft = applyHandScorerResult(game, draft, billWins, jenn).draft;
    draft = applyManualScore(game, draft, 'ben', 32);
    draft = applyManualScore(game, draft, 'jack', 20);

    const first = confirmHand(game, {
      outcome: billWins,
      scores: draft.scores as Record<string, number>,
      scoreRecords: draft.scoreRecords,
    });
    const afterSecond = confirmHand(first, {
      outcome: { type: 'draw' },
      scores: { jenn: 0, bill: 0, ben: 0, jack: 0 },
    });
    const replayed = undoLastHand(afterSecond);
    const stored = replayed.handHistory[0].scoreRecords.jenn;

    expect(
      stored?.source === 'detailed-scorer'
        ? stored.hand.remainingTiles
        : undefined,
    ).toEqual(jenn.detailedHand.hand.remainingTiles);
  });

  it('rejects a detailed result that contradicts the selected round winner', () => {
    expect(() =>
      applyHandScorerResult(
        game,
        { scores: {}, scoreRecords: {} },
        billWins,
        makeCalculatedResult('jenn', 88, true, 'contradiction'),
      ),
    ).toThrow('winner status does not match');
  });

  it('rejects winning-event evidence on a non-winner', () => {
    const result = makeCalculatedResult('jenn', 44, false, 'non-winner-event');
    result.detailedHand.hand.winningEventEvidence = {
      type: 'discard',
      discardedBy: 'east',
      handDiscardOrdinal: 1,
    };
    expect(() =>
      applyHandScorerResult(
        game,
        { scores: {}, scoreRecords: {} },
        billWins,
        result,
      ),
    ).toThrow('winner status does not match');
  });

  it('invalidates every affected calculated hand when the winner changes', () => {
    let draft: RoundScoringDraft = { scores: {}, scoreRecords: {} };
    const originalBillWinner = makeCalculatedResult(
      'bill',
      88,
      true,
      'bill-winner',
    );
    originalBillWinner.detailedHand.hand.winningMethod = 'discard';
    originalBillWinner.detailedHand.hand.winningEventEvidence = {
      type: 'discard',
      discardedBy: 'east',
      handDiscardOrdinal: 1,
    };
    draft = applyHandScorerResult(
      game,
      draft,
      billWins,
      originalBillWinner,
    ).draft;
    draft = applyHandScorerResult(
      game,
      draft,
      billWins,
      makeCalculatedResult('jenn', 44, false, 'jenn-non-winner'),
    ).draft;
    draft = applyHandScorerResult(
      game,
      draft,
      billWins,
      makeCalculatedResult('ben', 32, false, 'ben-non-winner'),
    ).draft;

    const changed = reconcileDetailedHandsForOutcome(game, draft, {
      type: 'win',
      winnerId: 'jenn',
    });

    expect(changed.scores.bill).toBeUndefined();
    expect(changed.scores.jenn).toBeUndefined();
    expect(changed.scores.ben).toBe(32);
    expect(changed.scoreRecords.bill).toMatchObject({
      source: 'detailed-scorer',
      requiresRecalculation: true,
      hand: { isWinner: false, winningEventEvidence: undefined },
    });
    expect(changed.scoreRecords.jenn).toMatchObject({
      source: 'detailed-scorer',
      requiresRecalculation: true,
      hand: { isWinner: true },
    });
    expect(changed.scoreRecords.ben).toMatchObject({
      source: 'detailed-scorer',
      hand: { isWinner: false },
    });
  });

  it('prevents contradictory detailed winner metadata entering the ledger', () => {
    const contradictory = makeCalculatedResult(
      'jenn',
      80,
      true,
      'second-winner',
    );

    expect(() =>
      confirmHand(game, {
        outcome: billWins,
        scores: { jenn: 80, bill: 88, ben: 32, jack: 16 },
        scoreRecords: { jenn: contradictory.detailedHand },
      }),
    ).toThrow('winner status does not match');
  });
});
