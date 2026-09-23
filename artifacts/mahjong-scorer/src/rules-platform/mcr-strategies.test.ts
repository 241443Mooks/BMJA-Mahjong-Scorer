import { describe, expect, it } from 'vitest';
import { executableIdentity } from './registry';
import type { HandScoreResult } from './types';
import {
  MCR_2006_SETTLEMENT,
  mcrSettlementImplementation,
  mcrStrategyRegistry,
  settleMcr2006,
  type McrSettlementInput,
} from './mcr-strategies';

const participants = ['A', 'B', 'C', 'D'] as const;

const score = (
  total = 11,
  disposition: HandScoreResult['disposition'] = { kind: 'scored' },
  legal = true,
): Extract<HandScoreResult, { grammar: 'pattern-accumulator' }> => ({
  grammar: 'pattern-accumulator',
  profile: { id: 'mcr-proof', version: '0.1' },
  rulesFingerprint: 'proof',
  legal,
  disposition,
  explanation: [],
  decisionTrace: [],
  matchedCanonicalPatternIds: [],
  result: { unit: 'points', total },
});

const win = (
  winSource: 'discard' | 'self-draw',
  options: { winnerId?: string; discarderId?: string; scores?: readonly unknown[] } = {},
): McrSettlementInput => ({
  participants,
  round: {
    outcome: {
      kind: 'mcr-win',
      payload: {
        winnerId: options.winnerId ?? 'A',
        winSource,
        ...(winSource === 'discard' && options.discarderId !== undefined ? { discarderId: options.discarderId } : {}),
      },
    },
    acceptedScores: (options.scores ?? [{ playerId: options.winnerId ?? 'A', score: score() }]) as McrSettlementInput['round']['acceptedScores'],
  },
});

const transactions = (input: McrSettlementInput) => settleMcr2006(input).map(({ from, to, amount, reasonId }) => ({ from, to, amount, reasonId }));

describe('MCR 2006 settlement B1', () => {
  it('settles S001 discard win using 8 + accepted Basic Points and base payments', () => {
    expect(transactions(win('discard', { discarderId: 'B' }))).toEqual([
      { from: 'B', to: 'A', amount: 19, reasonId: 'settlement.mcr-2006.discarder-payment' },
      { from: 'C', to: 'A', amount: 8, reasonId: 'settlement.mcr-2006.other-player-base-payment' },
      { from: 'D', to: 'A', amount: 8, reasonId: 'settlement.mcr-2006.other-player-base-payment' },
    ]);
  });

  it('settles S002 self-draw with each non-winner paying 8 + accepted Basic Points', () => {
    expect(transactions(win('self-draw'))).toEqual([
      { from: 'B', to: 'A', amount: 19, reasonId: 'settlement.mcr-2006.self-draw-payment' },
      { from: 'C', to: 'A', amount: 19, reasonId: 'settlement.mcr-2006.self-draw-payment' },
      { from: 'D', to: 'A', amount: 19, reasonId: 'settlement.mcr-2006.self-draw-payment' },
    ]);
  });

  it('settles S003 from final Basic Points without reconstructing qualification or Flowers', () => {
    const finalScore = { ...score(10), result: { unit: 'points' as const, total: 10, details: { qualifyingSubtotal: 8, postQualificationBonus: 2 } } };
    const input = win('self-draw', { scores: [{ playerId: 'A', score: finalScore }] });
    expect(settleMcr2006(input).map(({ amount }) => amount)).toEqual([18, 18, 18]);
  });

  it('returns no ordinary settlement for S004 not-qualifying results', () => {
    const notQualifying = score(0, { kind: 'not-qualifying', reasonId: 'qualification.mcr-8-before-flowers' }, false);
    expect(settleMcr2006(win('self-draw', { scores: [{ playerId: 'A', score: notQualifying }] }))).toEqual([]);
  });

  it('returns no transactions for a valid draw with no accepted score', () => {
    expect(settleMcr2006({ participants, round: { outcome: { kind: 'mcr-draw', payload: {} }, acceptedScores: [] } })).toEqual([]);
  });

  it('keeps supplied participant order for payer transactions', () => {
    const input = { ...win('self-draw'), participants: ['D', 'A', 'C', 'B'] } as McrSettlementInput;
    expect(settleMcr2006(input).map(({ from }) => from)).toEqual(['D', 'C', 'B']);
  });

  it('uses exactly the executable settlement identity at revision 1', () => {
    const entry = mcrStrategyRegistry.requireExecutable('settlement', MCR_2006_SETTLEMENT.id);
    expect(executableIdentity(entry)).toEqual({ id: 'settlement.mcr-2006', semanticRevision: 1 });
    expect(MCR_2006_SETTLEMENT).toEqual({ id: 'settlement.mcr-2006', semanticRevision: 1 });
    expect(mcrSettlementImplementation(MCR_2006_SETTLEMENT)).toBe(settleMcr2006);
  });

  it.each([
    ['fewer participants', (input: any) => { input.participants = ['A', 'B', 'C']; }],
    ['more participants', (input: any) => { input.participants = ['A', 'B', 'C', 'D', 'E']; }],
    ['duplicate participant', (input: any) => { input.participants = ['A', 'B', 'C', 'C']; }],
    ['empty participant', (input: any) => { input.participants = ['A', 'B', 'C', '']; }],
    ['unknown winner', (input: any) => { input.round.outcome.payload.winnerId = 'E'; input.round.acceptedScores[0].playerId = 'E'; }],
    ['discard without discarder', (input: any) => { delete input.round.outcome.payload.discarderId; }],
    ['discarder equals winner', (input: any) => { input.round.outcome.payload.discarderId = 'A'; }],
    ['unknown discarder', (input: any) => { input.round.outcome.payload.discarderId = 'E'; }],
    ['self-draw carrying discarder', (input: any) => { input.round.outcome.payload.winSource = 'self-draw'; input.round.outcome.payload.discarderId = 'B'; }],
    ['zero scores for win', (input: any) => { input.round.acceptedScores = []; }],
    ['multiple scores for win', (input: any) => { input.round.acceptedScores.push(input.round.acceptedScores[0]); }],
    ['score owner mismatch', (input: any) => { input.round.acceptedScores[0].playerId = 'B'; }],
    ['wrong grammar', (input: any) => { input.round.acceptedScores[0].score.grammar = 'riichi-han-fu'; }],
    ['wrong unit', (input: any) => { input.round.acceptedScores[0].score.result.unit = 'fan'; }],
    ['non-finite Basic Points', (input: any) => { input.round.acceptedScores[0].score.result.total = Infinity; }],
    ['non-integer Basic Points', (input: any) => { input.round.acceptedScores[0].score.result.total = 1.5; }],
  ] as const)('fails closed for %s', (_category, corrupt) => {
    const input = structuredClone(win('discard', { discarderId: 'B' }));
    corrupt(input);
    expect(() => settleMcr2006(input)).toThrow();
  });

  it('fails closed when a draw carries an accepted score', () => {
    const input = { participants, round: { outcome: { kind: 'mcr-draw', payload: {} }, acceptedScores: [{ playerId: 'A', score: score() }] } } as unknown as McrSettlementInput;
    expect(() => settleMcr2006(input)).toThrow();
  });
});
