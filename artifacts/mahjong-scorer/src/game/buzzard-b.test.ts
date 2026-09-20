import { describe, expect, it } from 'vitest';
import { prepareBuzzardRound, settleBuzzardRound } from '../rules-platform/buzzard-strategies';

const players = ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id }));
const seats = { east: 'east', south: 'south', west: 'west', north: 'north' } as const;
const scores = { east: 100, south: 600, west: 30, north: 20 };
const win = { outcome: { type: 'win' as const, winnerId: 'east' }, scores };
const input = (round: any) => ({ players, seats: { ...seats }, round, tableLimit: 600 });

describe('Buzzard B table-running acceptance fixtures', () => {
  it.each(['buzzard.incomplete-four-wind-limit', 'buzzard.incomplete-three-dragon-limit'] as const)('keeps %s a non-winner limit in Classical settlement', (resultId) => {
    const round = { ...win, profileScoreResults: { south: { resultId } } };
    expect(prepareBuzzardRound(input(round))).toEqual(round);
    expect(settleBuzzardRound(input(round)).some((transaction) => transaction.from === 'south' && transaction.to === 'east')).toBe(true);
  });
  it('fails closed for malformed evidence and ambiguous exception combinations', () => {
    expect(() => prepareBuzzardRound(input({ ...win, profileScoreResults: { east: { resultId: 'unknown' } } }))).toThrow('BUZZARD_EVIDENCE_INVALID');
    expect(() => prepareBuzzardRound(input({ ...win, buzzardIncidents: [{ type: 'buzzard-dangerous-discard', liablePlayerId: 'south', reason: 'bad' }] }))).toThrow('DANGER_REASON');
    expect(() => prepareBuzzardRound(input({ ...win, incidents: [{ type: 'incorrect-hand', playerId: 'south', condition: 'too-many' }], profileScoreResults: { west: { resultId: 'buzzard.incomplete-four-wind-limit' } } }))).toThrow('AMBIGUOUS_COMBINATION');
  });
  it.each([
    { type: 'false-discard-name', discarderId: 'south', claimantId: 'west', result: 'claimed' },
    { type: 'false-mah-jong', declarerId: 'south', anyHandExposed: true },
    { type: 'wrong-tile-claim', playerId: 'south', correctedBeforeNextDraw: true },
    { type: 'cannon', liablePlayerId: 'south', noChoiceAccepted: true },
  ])('rejects unsupported legacy incident $type', (incident) => {
    expect(() => prepareBuzzardRound(input({ ...win, incidents: [incident] }))).toThrow('UNSUPPORTED_LEGACY_INCIDENT');
  });
  it('routes dangerous discard only through winner obligations and makes false Mahjong non-East-multiplied', () => {
    const danger = { ...win, buzzardIncidents: [{ type: 'buzzard-dangerous-discard' as const, liablePlayerId: 'south', reason: 'one-suit' as const }] };
    expect(settleBuzzardRound(input(danger)).every((transaction) => transaction.from === 'south' && transaction.reasonId.includes('dangerous-discard'))).toBe(true);
    const falseMahJong = { outcome: { type: 'draw' as const }, scores: { east: 0, south: 0, west: 0, north: 0 }, buzzardIncidents: [{ type: 'buzzard-false-mah-jong' as const, declarerId: 'east', exposure: 'fully-exposed' as const }] };
    expect(settleBuzzardRound(input(falseMahJong)).map((transaction) => transaction.amount)).toEqual([1200, 1200, 1200]);
  });
});
