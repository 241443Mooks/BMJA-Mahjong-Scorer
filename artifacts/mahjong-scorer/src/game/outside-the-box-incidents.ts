import { settleBmjaRound } from './settlement';
import type {
  GamePlayer,
  PlayerAmounts,
  RoundIncident,
  RoundInput,
  SeatAssignments,
  SettlementResult,
  SettlementTransaction,
} from './types';

const playerIds = (players: GamePlayer[]) => new Set(players.map((player) => player.id));

const assertPlayer = (ids: Set<string>, id: string, field: string) => {
  if (!ids.has(id)) throw new Error(`${field} must belong to this game.`);
};

type ActiveOverride = Extract<RoundIncident, { type: 'false-discard-name' }> | Extract<RoundIncident, { type: 'cannon' }>;
const activeOverrides = (incidents: RoundIncident[]): ActiveOverride[] => incidents.filter(
  (incident) =>
    (incident.type === 'false-discard-name' && incident.result === 'mah-jong') ||
    (incident.type === 'cannon' && !incident.noChoiceAccepted),
) as ActiveOverride[];

/** OTB's manual table evidence is prepared once, before preview or confirmation. */
export const prepareOutsideTheBoxRound = (
  players: GamePlayer[],
  _seats: SeatAssignments,
  round: RoundInput,
): RoundInput => {
  const ids = playerIds(players);
  const incidents = round.incidents ?? [];
  const tooMany = new Set<string>();
  const ineligibleWinners = new Set<string>();

  for (const incident of incidents) {
    switch (incident.type) {
      case 'incorrect-hand':
        assertPlayer(ids, incident.playerId, 'Incorrect-hand player');
        ineligibleWinners.add(incident.playerId);
        if (incident.condition === 'too-many') tooMany.add(incident.playerId);
        break;
      case 'false-discard-name':
        assertPlayer(ids, incident.discarderId, 'False-name discarder');
        assertPlayer(ids, incident.claimantId, 'False-name claimant');
        break;
      case 'false-mah-jong':
        assertPlayer(ids, incident.declarerId, 'False-Mah-Jong declarer');
        break;
      case 'wrong-tile-claim':
        assertPlayer(ids, incident.playerId, 'Wrong-claim player');
        if (!incident.correctedBeforeNextDraw) ineligibleWinners.add(incident.playerId);
        break;
      case 'cannon':
        assertPlayer(ids, incident.liablePlayerId, 'Cannon liable player');
        if (round.outcome.type === 'draw') {
          throw new Error('Cannon requires a winning hand.');
        }
        if (incident.liablePlayerId === round.outcome.winnerId) {
          throw new Error('Cannon liable player must not be the winner.');
        }
        break;
    }
  }

  const overrides = activeOverrides(incidents);
  if (overrides.length > 1) {
    throw new Error('Only one active full-settlement liability override may be recorded per round.');
  }
  if (round.outcome.type === 'draw' && overrides.length > 0) {
    throw new Error('False-name Mah Jong liability requires a winning hand.');
  }
  if (round.outcome.type === 'win') {
    const winnerId = round.outcome.winnerId;
    if (ineligibleWinners.has(winnerId)) {
      throw new Error('This player is ineligible to declare Mah Jong because of a recorded round incident.');
    }
    for (const incident of overrides) {
      const payer = incident.type === 'cannon' ? incident.liablePlayerId : incident.discarderId;
      const claimant = incident.type === 'cannon' ? winnerId : incident.claimantId;
      if (payer === winnerId || claimant !== winnerId) {
        throw new Error('A liability incident must name a non-winning payer and the winning claimant.');
      }
    }
  }

  const scores: PlayerAmounts = { ...round.scores };
  const scoreRecords = { ...(round.scoreRecords ?? {}) };
  for (const id of tooMany) {
    scores[id] = 0;
    delete scoreRecords[id];
  }
  return { ...round, scores, scoreRecords, incidents: [...incidents] };
};

const emptyChanges = (players: GamePlayer[]): PlayerAmounts =>
  Object.fromEntries(players.map((player) => [player.id, 0]));

const addTransfer = (
  changes: PlayerAmounts,
  transactions: SettlementTransaction[],
  fromPlayerId: string,
  toPlayerId: string,
  amount: number,
  reason: SettlementTransaction['reason'],
) => {
  if (amount <= 0) return;
  transactions.push({ fromPlayerId, toPlayerId, amount, baseAmount: amount, eastMultiplier: 1, reason });
  changes[fromPlayerId] -= amount;
  changes[toPlayerId] += amount;
};

export const settleOutsideTheBoxRound = (
  players: GamePlayer[],
  seats: SeatAssignments,
  input: RoundInput,
  limit: number,
): SettlementResult => {
  const round = prepareOutsideTheBoxRound(players, seats, input);
  const baseline = settleBmjaRound(players, seats, round);
  const incidents = round.incidents ?? [];
  const override = activeOverrides(incidents)[0];
  let transactions = baseline.transactions;
  let changes = { ...baseline.changes };

  if (override) {
    const winnerId = round.outcome.type === 'win' ? round.outcome.winnerId : undefined;
    if (!winnerId) throw new Error('Liability requires a winner.');
    const amount = baseline.transactions
      .filter((transaction) => transaction.reason === 'winner-payment')
      .reduce((total, transaction) => total + transaction.amount, 0);
    const payer = override.type === 'cannon' ? override.liablePlayerId : override.discarderId;
    transactions = [];
    changes = emptyChanges(players);
    addTransfer(changes, transactions, payer, winnerId, amount,
      override.type === 'cannon' ? 'cannon-liability' : 'false-name-mah-jong-liability');
  }

  // The guide records 50 for an ordinary false name but the supplied source does
  // not say who receives it. Refuse to invent a bank or recipient.
  if (incidents.some((incident) => incident.type === 'false-discard-name' && incident.result === 'claimed')) {
    throw new Error('Outside the Box false-discard-name recipient is not established by the recorded source.');
  }
  for (const incident of incidents) {
    if (incident.type === 'false-mah-jong' && incident.anyHandExposed) {
      for (const player of players) {
        if (player.id !== incident.declarerId) {
          addTransfer(changes, transactions, incident.declarerId, player.id, limit / 2, 'false-mah-jong-penalty');
        }
      }
    }
  }
  const total = Object.values(changes).reduce((sum, value) => sum + value, 0);
  if (total !== 0) throw new Error(`Settlement invariant failed: changes total ${total}.`);
  return { transactions, changes, zeroSum: true };
};

export const incidentDescription = (incident: RoundIncident, players: GamePlayer[]) => {
  const name = (id: string) => players.find((player) => player.id === id)?.name ?? 'Unknown player';
  switch (incident.type) {
    case 'incorrect-hand': return `Incorrect hand — ${name(incident.playerId)} had too ${incident.condition === 'too-few' ? 'few tiles' : 'many tiles'}${incident.condition === 'too-many' ? '; score 0' : ''}`;
    case 'false-discard-name': return `False discard name — ${name(incident.discarderId)}; ${incident.result === 'mah-jong' ? 'Mah Jong liability' : 'claim recorded'}`;
    case 'false-mah-jong': return `False Mah Jong — ${name(incident.declarerId)}${incident.anyHandExposed ? ' paid each opponent half-limit' : '; no hand exposed'}`;
    case 'wrong-tile-claim': return `Wrong tile claim — ${name(incident.playerId)}${incident.correctedBeforeNextDraw ? '; corrected in time' : '; ineligible for Mah Jong'}`;
    case 'cannon': return incident.noChoiceAccepted ? `No choice! accepted — Cannon cancelled for ${name(incident.liablePlayerId)}` : `Cannon — ${name(incident.liablePlayerId)} liable${incident.danger ? `; ${incident.danger} danger` : ''}`;
  }
};
