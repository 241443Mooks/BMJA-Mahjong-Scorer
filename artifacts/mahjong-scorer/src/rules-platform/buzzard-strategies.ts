import { settleClassicalPairwise } from './classical-strategies';
import type { GamePlayer, RoundInput, SeatAssignments } from '../game/types';
import type { SettlementStrategy, SettlementTransaction } from './types';

type Input = { players: GamePlayer[]; seats: SeatAssignments; round: RoundInput; tableLimit: number };
const key = 'settlement.buzzard-2000@1';
export const BUZZARD_SETTLEMENT = { id: 'settlement.buzzard-2000', semanticRevision: 1 } as const;
export const BUZZARD_PREPARATION = { id: 'incident.buzzard-2000-round-preparation', semanticRevision: 1 } as const;

const validPlayers = (players: GamePlayer[], ids: string[]) => ids.every((id) => players.some((p) => p.id === id));
const fail = (reason: string): never => { throw new Error(`BUZZARD_EVIDENCE_INVALID:${reason}`); };

export const prepareBuzzardRound = ({ players, round, tableLimit }: Input): RoundInput => {
  if (!Number.isFinite(tableLimit) || tableLimit <= 0) fail('TABLE_LIMIT');
  const winner = round.outcome.type === 'win' ? round.outcome.winnerId : undefined;
  const results = round.profileScoreResults ?? {};
  for (const [playerId, result] of Object.entries(results)) {
    if (!result || !validPlayers(players, [playerId]) || playerId === winner ||
      !['buzzard.incomplete-four-wind-limit', 'buzzard.incomplete-three-dragon-limit'].includes(result.resultId) || round.scores[playerId] !== tableLimit) fail('PROFILE_RESULT');
  }
  const incidents = round.buzzardIncidents ?? [];
  if (incidents.length > 1 || (Object.keys(results).length && incidents.length)) fail('AMBIGUOUS_COMBINATION');
  for (const incident of incidents) {
    const playerId = incident.type === 'buzzard-dangerous-discard' ? incident.liablePlayerId : incident.declarerId;
    if (!validPlayers(players, [playerId]) || playerId === winner) fail('INCIDENT_PLAYER');
  }
  for (const incident of round.incidents ?? []) if (incident.type === 'incorrect-hand') {
    if (!validPlayers(players, [incident.playerId]) || incident.playerId === winner) fail('INCORRECT_HAND_PLAYER');
  }
  return round;
};

export const settleBuzzardRound: SettlementStrategy<Input> = ({ players, seats, round, tableLimit }) => {
  const tooMany = (round.incidents ?? []).find((i): i is Extract<typeof i, { type: 'incorrect-hand' }> => i.type === 'incorrect-hand' && i.condition === 'too-many');
  const effective = tooMany ? { ...round, scores: { ...round.scores, [tooMany.playerId]: 0 } } : round;
  const ordinary = settleClassicalPairwise({ players, seats, round: effective });
  const incident = round.buzzardIncidents?.[0];
  if (!incident) return ordinary;
  if (incident.type === 'buzzard-false-mah-jong') {
    if (incident.exposure === 'not-fully-exposed') return ordinary;
    return players.filter((p) => p.id !== incident.declarerId).map((p) => ({ from: incident.declarerId, to: p.id, amount: 2 * tableLimit, reasonId: 'settlement.buzzard-2000.false-mah-jong-penalty', metadata: { baseAmount: 2 * tableLimit, eastMultiplier: 1, legacyReason: 'buzzard-false-mah-jong-penalty', exposure: incident.exposure } }));
  }
  const winnerPayments = ordinary.filter((t) => t.reasonId.endsWith('.winner-payment'));
  return winnerPayments.map((t) => ({ ...t, from: incident.liablePlayerId, reasonId: 'settlement.buzzard-2000.dangerous-discard-liability', metadata: { ...t.metadata, legacyReason: 'buzzard-dangerous-discard-liability', buzzardReason: incident.reason, coveredOrdinaryFrom: t.from } }));
};

export const buzzardSettlementImplementation = (identity: { id: string; semanticRevision: number }) => {
  if (`${identity.id}@${identity.semanticRevision}` !== key) throw new Error(`Unknown Buzzard strategy implementation: ${identity.id}@${identity.semanticRevision}`);
  return settleBuzzardRound;
};
