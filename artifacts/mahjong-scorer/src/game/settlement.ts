import type {
  GamePlayer,
  PlayerAmounts,
  PlayerId,
  RoundInput,
  SeatAssignments,
  SettlementResult,
  SettlementTransaction,
} from './types';

const emptyAmounts = (players: GamePlayer[]): PlayerAmounts =>
  Object.fromEntries(players.map((player) => [player.id, 0]));

const assertRoundInput = (
  players: GamePlayer[],
  seats: SeatAssignments,
  round: RoundInput,
) => {
  if (players.length !== 4) {
    throw new Error('BMJA settlement requires exactly four players.');
  }
  const ids = new Set(players.map((player) => player.id));
  if (ids.size !== 4) {
    throw new Error('Every player must have a unique id.');
  }
  for (const player of players) {
    if (!(player.id in seats)) {
      throw new Error(`Missing seat wind for ${player.name}.`);
    }
    const score = round.scores[player.id];
    if (!Number.isFinite(score) || score < 0) {
      throw new Error(`Score for ${player.name} must be a non-negative number.`);
    }
  }
  if (new Set(Object.values(seats)).size !== 4) {
    throw new Error('Each wind must be assigned to exactly one player.');
  }
  if (round.outcome.type === 'win' && !ids.has(round.outcome.winnerId)) {
    throw new Error('The winning player must belong to this game.');
  }
};

const eastMultiplier = (
  seats: SeatAssignments,
  first: PlayerId,
  second: PlayerId,
): 1 | 2 =>
  seats[first] === 'east' || seats[second] === 'east' ? 2 : 1;

/**
 * BMJA settlement is pairwise and deliberately separate from hand scoring:
 * - each loser pays the winner the winner's score;
 * - non-winners pay the difference between their scores;
 * - a payment is doubled whenever East is one side of it.
 */
export const settleBmjaRound = (
  players: GamePlayer[],
  seats: SeatAssignments,
  round: RoundInput,
): SettlementResult => {
  assertRoundInput(players, seats, round);
  const changes = emptyAmounts(players);
  const transactions: SettlementTransaction[] = [];

  if (round.outcome.type === 'draw') {
    return { transactions, changes, zeroSum: true };
  }

  const winnerId = round.outcome.winnerId;
  const winnerScore = round.scores[winnerId];
  const losers = players.filter((player) => player.id !== winnerId);

  const transfer = (
    fromPlayerId: PlayerId,
    toPlayerId: PlayerId,
    baseAmount: number,
    reason: SettlementTransaction['reason'],
  ) => {
    if (baseAmount <= 0) return;
    const multiplier = eastMultiplier(seats, fromPlayerId, toPlayerId);
    const amount = baseAmount * multiplier;
    transactions.push({
      fromPlayerId,
      toPlayerId,
      amount,
      baseAmount,
      eastMultiplier: multiplier,
      reason,
    });
    changes[fromPlayerId] -= amount;
    changes[toPlayerId] += amount;
  };

  for (const loser of losers) {
    transfer(loser.id, winnerId, winnerScore, 'winner-payment');
  }

  for (let left = 0; left < losers.length; left += 1) {
    for (let right = left + 1; right < losers.length; right += 1) {
      const first = losers[left];
      const second = losers[right];
      const difference = round.scores[first.id] - round.scores[second.id];
      if (difference > 0) {
        transfer(second.id, first.id, difference, 'score-difference');
      } else if (difference < 0) {
        transfer(first.id, second.id, Math.abs(difference), 'score-difference');
      }
    }
  }

  const total = Object.values(changes).reduce((sum, change) => sum + change, 0);
  if (total !== 0) {
    throw new Error(`Settlement invariant failed: changes total ${total}.`);
  }

  return { transactions, changes, zeroSum: true };
};