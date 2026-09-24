import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { suited } from '../scoring';
import { confirmHand, createBmjaGame, undoLastHand } from './game';
import type {
  DetailedHandRecord,
  GamePlayer,
  SeatAssignments,
} from './types';

beforeAll(() => initialiseCurrentRulesRuntimes());

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

const rodDetailedScore: DetailedHandRecord = {
  source: 'detailed-scorer',
  hand: {
    sets: [],
    bonusTiles: [],
    isWinner: true,
    winningMethod: 'wall',
  },
  context: {
    playerWind: 'east',
    prevailingWind: 'east',
    limit: 1000,
  },
  breakdown: {
    valid: true,
    evidenceCompleteness: 'complete',
    validationErrors: [],
    pointRules: [],
    doubleRules: [],
    specialHands: [],
    basePoints: 200,
    doubles: 0,
    uncappedScore: 200,
    finalScore: 200,
    limitApplied: false,
    scoringMode: 'standard',
    calculationComponents: [],
  },
  finalScore: 200,
};

const billEarthDetailedScore: DetailedHandRecord = {
  ...rodDetailedScore,
  hand: {
    ...rodDetailedScore.hand,
    winningMethod: 'discard',
    winningEventEvidence: {
      type: 'discard',
      discardedBy: 'east',
      handDiscardOrdinal: 1,
    },
  },
  context: {
    ...rodDetailedScore.context,
    playerWind: 'south',
  },
};

describe('BMJA game-level golden fixtures', () => {
  const zeroScores = { bill: 0, rod: 0, ben: 0, jack: 0 };

  const rotateOnce = (game: ReturnType<typeof createBmjaGame>) => {
    const southId = Object.entries(game.seats).find(
      ([, wind]) => wind === 'south',
    )?.[0];
    if (!southId) throw new Error('Expected a South player.');
    return confirmHand(game, {
      outcome: { type: 'win', winnerId: southId },
      scores: zeroScores,
    });
  };

  it('records the published settlement, totals and next seats in the ledger', () => {
    const game = createBmjaGame(players, seats, undefined, 'full-game');
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
    expect(next.isComplete).toBe(false);
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

  it('completes the game after one round if configured', () => {
    let game = createBmjaGame(players, seats, undefined, 'one-round');
    for (let rotation = 0; rotation < 3; rotation += 1) {
      game = rotateOnce(game);
      expect(game.isComplete).toBe(false);
    }
    game = rotateOnce(game);

    expect(game.prevailingWind).toBe('south');
    expect(game.isComplete).toBe(true);
  });

  it('completes a full official game only after the North cycle', () => {
    let game = createBmjaGame(players, seats, undefined, 'full-game');

    for (let rotation = 0; rotation < 15; rotation += 1) {
      game = rotateOnce(game);
      expect(game.isComplete).toBe(false);
    }
    expect(game.prevailingWind).toBe('north');

    game = rotateOnce(game);
    expect(game.prevailingWind).toBe('east');
    expect(game.isComplete).toBe(true);
  });

  it('undoing the completing hand reopens the configured game', () => {
    let game = createBmjaGame(players, seats, undefined, 'one-round');
    for (let rotation = 0; rotation < 4; rotation += 1) {
      game = rotateOnce(game);
    }
    expect(game.isComplete).toBe(true);

    const reopened = undoLastHand(game);
    expect(reopened.isComplete).toBe(false);
    expect(reopened.prevailingWind).toBe('east');
    expect(reopened.handHistory).toHaveLength(3);
  });

  it('undoes by replaying retained ledger entries from the original setup', () => {
    const initial = createBmjaGame(players, seats);
    const afterFirst = confirmHand(initial, {
      outcome: { type: 'win', winnerId: 'rod' },
      scores: { bill: 100, rod: 200, ben: 300, jack: 400 },
      scoreRecords: { rod: rodDetailedScore },
    });
    const afterSecond = confirmHand(afterFirst, {
      outcome: { type: 'draw' },
      scores: { bill: 20, rod: 40, ben: 60, jack: 80 },
    });
    const undone = undoLastHand(afterSecond);

    expect(undone).toEqual(afterFirst);
    expect(undone.handHistory).toHaveLength(1);
    expect(undone.handHistory[0].scoreRecords.rod).toEqual(rodDetailedScore);
  });

  it('retains winning-event evidence while replaying the ledger during undo', () => {
    const initial = createBmjaGame(players, seats);
    const afterFirst = confirmHand(initial, {
      outcome: { type: 'win', winnerId: 'bill' },
      scores: { bill: 200, rod: 100, ben: 80, jack: 60 },
      scoreRecords: { bill: billEarthDetailedScore },
    });
    const afterSecond = confirmHand(afterFirst, {
      outcome: { type: 'draw' },
      scores: { bill: 20, rod: 40, ben: 60, jack: 80 },
    });

    const undone = undoLastHand(afterSecond);
    const billRecord = undone.handHistory[0].scoreRecords.bill;
    expect(
      billRecord?.source === 'detailed-scorer'
        ? billRecord.hand.winningEventEvidence
        : undefined,
    ).toEqual({
      type: 'discard',
      discardedBy: 'east',
      handDiscardOrdinal: 1,
    });
  });

  it('discards stale score records and scores when a round is confirmed as a draw', () => {
    const remainingTile = suited('characters', 4);
    const record: DetailedHandRecord = {
      ...rodDetailedScore,
      hand: {
        sets: [],
        remainingTiles: [remainingTile],
        bonusTiles: [],
        isWinner: false,
      },
    };
    const confirmed = confirmHand(createBmjaGame(players, seats), {
      outcome: { type: 'draw' },
      scores: { bill: 0, rod: 200, ben: 0, jack: 0 },
      scoreRecords: { rod: record },
    });

    expect(confirmed.handHistory[0]).toMatchObject({
      outcome: { type: 'draw' },
      scores: zeroScores,
      scoreRecords: {},
      settlement: { transactions: [], changes: zeroScores, zeroSum: true },
    });
  });

  it('deep-clones remaining tiles and blank metadata stored in detailed hand records', () => {
    const remainingTile = suited('characters', 4);
    const blankTileIds = ['blank-east'];
    const ungroupedBlankTiles = [{ id: 'blank-loose', location: 'remaining' as const, tileIndex: 0 }];
    const record: DetailedHandRecord = {
      ...rodDetailedScore,
      hand: {
        sets: [{ id: 'east', kind: 'pung', tile: suited('bamboo', 2), visibility: 'concealed', blankTileIds }],
        remainingTiles: [remainingTile], ungroupedBlankTiles,
        bonusTiles: [], isWinner: true,
      },
    };
    const confirmed = confirmHand(createBmjaGame(players, seats), {
      outcome: { type: 'win', winnerId: 'rod' },
      scores: { bill: 0, rod: 200, ben: 0, jack: 0 },
      scoreRecords: { rod: record },
    });
    remainingTile.rank = 7;
    blankTileIds[0] = 'mutated';
    ungroupedBlankTiles[0].id = 'mutated-loose';
    const stored = confirmed.handHistory[0].scoreRecords.rod;
    expect(stored?.source === 'detailed-scorer' ? stored.hand.remainingTiles?.[0] : undefined).toEqual(suited('characters', 4));
    expect(stored?.source === 'detailed-scorer' ? stored.hand.sets[0].blankTileIds : undefined).toEqual(['blank-east']);
    expect(stored?.source === 'detailed-scorer' ? stored.hand.ungroupedBlankTiles : undefined).toEqual([{ id: 'blank-loose', location: 'remaining', tileIndex: 0 }]);
  });
});
