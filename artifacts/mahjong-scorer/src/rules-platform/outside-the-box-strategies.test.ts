import { describe, expect, it } from 'vitest';
import {
  prepareOutsideTheBoxRound,
  settleOutsideTheBoxRound,
} from '../game/outside-the-box-incidents';
import type { GamePlayer, RoundInput, SeatAssignments } from '../game/types';
import { executableIdentity } from './registry';
import {
  OUTSIDE_THE_BOX_GOULASH_HAND_MODE,
  OUTSIDE_THE_BOX_ROUND_PREPARATION,
  OUTSIDE_THE_BOX_SETTLEMENT,
  outsideTheBoxHandModeImplementation,
  outsideTheBoxRoundPreparationImplementation,
  outsideTheBoxSettlementImplementation,
  outsideTheBoxStrategyRegistry,
  prepareOutsideTheBox,
  selectOutsideTheBoxHandMode,
  settleOutsideTheBox,
} from './outside-the-box-strategies';

const players: GamePlayer[] = ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id }));
const seats: SeatAssignments = { east: 'east', south: 'south', west: 'west', north: 'north' };
const scores = { east: 100, south: 30, west: 20, north: 10 };
const limit = 1000;

const effects = (transactions: readonly { from: string; to: string; amount: number }[]) =>
  Object.fromEntries(players.map(({ id }) => [id, transactions.reduce(
    (total, transaction) => total + (transaction.to === id ? transaction.amount : 0) - (transaction.from === id ? transaction.amount : 0),
    0,
  )]));

const expectSettlementParity = (round: RoundInput) => {
  const direct = settleOutsideTheBoxRound(players, seats, round, limit);
  const adapted = settleOutsideTheBox({ players, seats, round, limit });
  expect(effects(adapted)).toEqual(direct.changes);
  expect(adapted.map(({ from, to, amount }) => ({ from, to, amount }))).toEqual(
    direct.transactions.map(({ fromPlayerId, toPlayerId, amount }) => ({
      from: fromPlayerId, to: toPlayerId, amount,
    })),
  );
  return adapted;
};

describe('Outside the Box current strategy adapters', () => {
  it('preserves ordinary direct settlement with stable neutral audit data', () => {
    const adapted = expectSettlementParity({
      outcome: { type: 'win', winnerId: 'south' }, scores,
    });
    expect(adapted[0]).toMatchObject({
      reasonId: 'settlement.outside-the-box-incidents.winner-payment',
      metadata: { legacyReason: 'winner-payment', incidentTypes: [] },
    });
  });

  it.each([
    { type: 'false-discard-name', discarderId: 'south', claimantId: 'east', result: 'mah-jong' },
    { type: 'cannon', liablePlayerId: 'east', danger: 'one-suit', noChoiceAccepted: false },
    { type: 'false-mah-jong', declarerId: 'east', anyHandExposed: true },
  ] as const)('preserves direct liability or penalty routing for %o', (incident) => {
    const outcome = incident.type === 'false-mah-jong'
      ? { type: 'draw' as const }
      : { type: 'win' as const, winnerId: incident.type === 'cannon' ? 'south' : 'east' };
    const round: RoundInput = {
      outcome,
      scores: outcome.type === 'draw' ? { east: 0, south: 0, west: 0, north: 0 } : scores,
      incidents: [incident],
    };
    const adapted = expectSettlementParity(round);
    expect(adapted).toEqual(expect.arrayContaining([
      expect.objectContaining({ metadata: expect.objectContaining({ incidentTypes: [incident.type] }) }),
    ]));
  });

  it('keeps incident preparation separate and lossless', () => {
    const round: RoundInput = {
      outcome: { type: 'win', winnerId: 'east' },
      scores,
      scoreRecords: { south: { source: 'manual', finalScore: 30 } },
      incidents: [{ type: 'incorrect-hand', playerId: 'south', condition: 'too-many' }],
    };
    expect(prepareOutsideTheBox({ players, seats, round })).toEqual(
      prepareOutsideTheBoxRound(players, seats, round),
    );
  });

  it('preserves the fail-closed ordinary false-name source gap', () => {
    const round: RoundInput = {
      outcome: { type: 'win', winnerId: 'east' }, scores,
      incidents: [{ type: 'false-discard-name', discarderId: 'south', claimantId: 'east', result: 'claimed' }],
    };
    expect(() => settleOutsideTheBoxRound(players, seats, round, limit)).toThrow('recipient is not established');
    expect(() => settleOutsideTheBox({ players, seats, round, limit })).toThrow('recipient is not established');
  });

  it('preserves draw-to-Goulash and win-to-normal hand-mode selection', () => {
    expect(selectOutsideTheBoxHandMode({ current: 'normal', outcome: { type: 'draw' } })).toBe('goulash');
    expect(selectOutsideTheBoxHandMode({ current: 'goulash', outcome: { type: 'win', winnerId: 'east' } })).toBe('normal');
  });

  it('uses exact executable identities in category-safe OTB accessors', () => {
    expect(executableIdentity(outsideTheBoxStrategyRegistry.requireExecutable('settlement', OUTSIDE_THE_BOX_SETTLEMENT.id))).toEqual(OUTSIDE_THE_BOX_SETTLEMENT);
    expect(executableIdentity(outsideTheBoxStrategyRegistry.requireExecutable('incident', OUTSIDE_THE_BOX_ROUND_PREPARATION.id))).toEqual(OUTSIDE_THE_BOX_ROUND_PREPARATION);
    expect(executableIdentity(outsideTheBoxStrategyRegistry.requireExecutable('hand-mode', OUTSIDE_THE_BOX_GOULASH_HAND_MODE.id))).toEqual(OUTSIDE_THE_BOX_GOULASH_HAND_MODE);
    expect(outsideTheBoxSettlementImplementation(OUTSIDE_THE_BOX_SETTLEMENT)).toBe(settleOutsideTheBox);
    expect(outsideTheBoxRoundPreparationImplementation(OUTSIDE_THE_BOX_ROUND_PREPARATION)).toBe(prepareOutsideTheBox);
    expect(outsideTheBoxHandModeImplementation(OUTSIDE_THE_BOX_GOULASH_HAND_MODE)).toBe(selectOutsideTheBoxHandMode);
  });
});
