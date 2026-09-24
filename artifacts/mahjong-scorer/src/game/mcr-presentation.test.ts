import { beforeAll, afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { set, suited, wind } from '../scoring/tiles';
import type { MahjongHand } from '../scoring/types';
import { initialiseCurrentRulesRuntimes, getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import { toMcrScoringInput } from './mcr-hand-input';
import { presentMcrScore } from './mcr-score-presentation';
import { McrHandRecord, mcrSettlementDescription } from './McrPresentation';
import { GameScorer } from './GameScorer';
import { createGame, confirmHand } from './game';
import { saveGameRecoveryV2 } from './persistence';
import * as persistence from './persistence';
import type { McrAcceptedScoreRecord, McrConfirmedHand, McrRoundInput, PlayerAmounts } from './types';

const ref = { id: 'mcr-wmo-2006', version: '0.1' } as const;
const players = ['A', 'B', 'C', 'D'].map((id) => ({ id, name: id }));
const seats = { A: 'east', B: 'south', C: 'west', D: 'north' } as const;
const zeros: PlayerAmounts = { A: 0, B: 0, C: 0, D: 0 };
const sevenPairs: MahjongHand = {
  sets: [],
  looseTiles: [suited('characters',1),suited('characters',1),suited('characters',2),suited('characters',2),suited('circles',3),suited('circles',3),suited('circles',4),suited('circles',4),suited('bamboo',5),suited('bamboo',5),suited('bamboo',6),suited('bamboo',6),wind('east'),wind('east')],
  bonusTiles: [], isWinner: true, winningTileProvenance: { tile: wind('east'), target: { type: 'loose-layout' } },
};
const ordinary: MahjongHand = {
  sets: [set('open-chow', 'chow', suited('characters', 1), 'exposed'), set('free-c1', 'chow', suited('characters', 1)), set('free-c2', 'chow', suited('characters', 1)), set('free-c3', 'chow', suited('characters', 1)), set('winning-pair', 'pair', suited('characters', 4))],
  bonusTiles: [], isWinner: true, winningTileProvenance: { tile: suited('characters', 4), target: { type: 'grouped-set', setId: 'winning-pair' } },
};

function accepted(hand: MahjongHand, winSource: 'discard' | 'self-draw', playerId = 'A'): McrAcceptedScoreRecord {
  const adapted = toMcrScoringInput(hand, { winSource, resolvedWinEvent: 'none', lastVisibleCopy: false, seatWind: 'east', prevailingWind: 'east' });
  if (adapted.kind !== 'ready') throw new Error('Source fixture must adapt to MCR input');
  const compiled = getCurrentCompiledRulesRuntime(ref);
  if (compiled.grammar !== 'pattern-accumulator') throw new Error('Expected MCR runtime');
  const result = compiled.runtime.scoreHand(adapted.input);
  return { source: 'mcr-detailed-scorer', playerId, rulesProfile: ref, rulesFingerprint: compiled.artifact.rulesFingerprint, hand, input: adapted.input, result, finalScore: result.result.total };
}

function win(record: McrAcceptedScoreRecord, winSource: 'discard' | 'self-draw', discarderId?: string): McrRoundInput {
  return { mcrOutcome: { type: 'mcr-win', winnerId: record.playerId, winSource, ...(discarderId ? { discarderId } : {}) }, scores: { ...zeros, [record.playerId]: record.finalScore }, scoreRecords: { [record.playerId]: record } };
}

function renderRecoveredGame(game: ReturnType<typeof createGame>, currentRound: Parameters<typeof saveGameRecoveryV2>[2]) {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) };
  saveGameRecoveryV2(storage, game, currentRound);
  vi.stubGlobal('window', { localStorage: storage });
  return renderToStaticMarkup(createElement(GameScorer, { initialRulesProfile: ref, onOpenHandScorer: () => undefined, onClearReturnedScore: () => undefined }));
}

describe('MCR presentation and recorded hand', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());
  afterEach(() => vi.unstubAllGlobals());

  it('formats the confirmed 24 point discard transaction metadata without Classical language', () => {
    const record = accepted(sevenPairs, 'discard');
    expect(record.finalScore).toBe(24);
    const game = confirmHand(createGame(players, seats, undefined, 'full-game', ref), win(record, 'discard', 'B'));
    const transactions = (game.handHistory[0] as McrConfirmedHand).settlement.transactions;
    expect(transactions.map((transaction) => mcrSettlementDescription(transaction, players))).toEqual([
      'B paid A 32 — discarder payment · winner 24 Basic Points · fixed component 8',
      'C paid A 8 — fixed 8-point payment',
      'D paid A 8 — fixed 8-point payment',
    ]);
    expect(JSON.stringify(transactions.map((transaction) => mcrSettlementDescription(transaction, players)))).not.toMatch(/East|baseAmount|doubles/i);
  });

  it('uses real Seven Pairs runtime output for a 28 Basic Point self-draw and its three payments', () => {
    const record = accepted(sevenPairs, 'self-draw');
    expect(record.finalScore).toBe(28);
    const game = confirmHand(createGame(players, seats, undefined, 'full-game', ref), win(record, 'self-draw'));
    expect((game.handHistory[0] as McrConfirmedHand).settlement.transactions.map((transaction) => [transaction.amount, mcrSettlementDescription(transaction, players)])).toEqual([
      [36, 'B paid A 36 — self-draw · winner 28 Basic Points · fixed component 8'],
      [36, 'C paid A 36 — self-draw · winner 28 Basic Points · fixed component 8'],
      [36, 'D paid A 36 — self-draw · winner 28 Basic Points · fixed component 8'],
    ]);
  });

  it('renders saved Seven Pairs physical tiles, fan evidence and context from presentMcrScore', () => {
    const record = accepted(sevenPairs, 'discard');
    const html = renderToStaticMarkup(createElement(McrHandRecord, { playerName: 'A', record }));
    expect(html).toContain('MCR recorded hand');
    expect(html).toContain('Loose tiles / special layout');
    expect(html).toContain('Basic Points:');
    expect(html).toContain('24');
    expect(html).toContain('Seven Pairs');
    expect(html).toContain('Seat wind: east');
    expect(html).toContain('Runtime fingerprint:');
    expect(html).not.toMatch(/Base points|Doubles|East multiplier|table limit|fishing/i);
  });

  it('renders suppressed fan names, values and reasons from presentMcrScore output', () => {
    const record = accepted(ordinary, 'discard');
    const view = presentMcrScore(record.result);
    expect(view.kind).toBe('scored');
    if (view.kind !== 'scored') return;
    expect(view.suppressed.length).toBeGreaterThan(0);
    const html = renderToStaticMarkup(createElement(McrHandRecord, { playerName: 'A', record }));
    expect(html).toContain('Suppressed fan:');
    expect(html).toContain(view.suppressed[0]!.name);
    expect(html).toContain(view.suppressed[0]!.reason);
  });

  it('renders the confirmed MCR ledger, winner record once, full print evidence, and complete table tools', () => {
    const record = accepted(sevenPairs, 'discard');
    const game = confirmHand(createGame(players, seats, undefined, 'full-game', ref), win(record, 'discard', 'B'));
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) };
    saveGameRecoveryV2(storage, game, { grammar: 'pattern-accumulator', draft: { scores: {}, scoreRecords: {} } });
    vi.stubGlobal('window', { localStorage: storage });
    const html = renderToStaticMarkup(createElement(GameScorer, { initialRulesProfile: ref, onOpenHandScorer: () => undefined, onClearReturnedScore: () => undefined }));
    expect(html).toContain('MCR / WMO 2006 game record');
    expect(html).toContain('Profile mcr-wmo-2006 · Version 0.1');
    expect(html).toContain(game.runtimeFingerprint);
    expect(html).toContain('Current balances');
    expect(html).toContain('A won (discard · B discarded)');
    expect(html).toContain('B paid A 32');
    expect(html.match(/data-testid="mcr-hand-record"/g)).toHaveLength(1);
    expect(html).not.toContain('Score entered manually');
    expect(html).toContain('mcr-print-full');
    expect(html).toContain('mcr-undo');
    expect(html).toContain('mcr-start-over');
    expect(html).not.toMatch(/Base points|Doubles|East multiplier|table limit|fishing/i);
  });

  it('renders MCR draw ledger as dealer passed with no payment and no hand record', () => {
    const game = confirmHand(createGame(players, seats, undefined, 'full-game', ref), { mcrOutcome: { type: 'mcr-draw' }, scores: { ...zeros } });
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) };
    saveGameRecoveryV2(storage, game, { grammar: 'pattern-accumulator', draft: { scores: {}, scoreRecords: {} } });
    vi.stubGlobal('window', { localStorage: storage });
    const html = renderToStaticMarkup(createElement(GameScorer, { initialRulesProfile: ref, onOpenHandScorer: () => undefined, onClearReturnedScore: () => undefined }));
    expect(html).toContain('Hand 1 · Draw');
    expect(html).toContain('Dealer passed · no payment');
    expect(html).toContain('Next East: B');
    expect(html).not.toContain('mcr-hand-record');
    expect(html).not.toContain('Score entered manually');
  });

  it('previews exact confirmed discard transactions, net changes and prospective progression', () => {
    const record = accepted(sevenPairs, 'discard');
    const game = createGame(players, seats, undefined, 'full-game', ref);
    const html = renderRecoveredGame(game, { grammar: 'pattern-accumulator', outcomeType: 'win', winnerId: 'A', winSource: 'discard', discarderId: 'B', draft: { scores: { A: record.finalScore }, scoreRecords: { A: record } } });
    expect(html).toContain('Settlement preview');
    expect(html).toContain('A wins by discard · B discarded · 24 Basic Points');
    expect(html).toContain('B paid A 32');
    expect(html).toContain('C paid A 8');
    expect(html).toContain('A: net +48');
    expect(html).toContain('B: net −32');
    expect(html).toContain('A: net +48');
    expect(html).toContain('Next East: B');
    expect(html).not.toContain('East remains unchanged');
  });

  it('previews the exact 28 point self-draw transactions from the prospective confirmed state', () => {
    const record = accepted(sevenPairs, 'self-draw');
    expect(record.finalScore).toBe(28);
    const game = createGame(players, seats, undefined, 'full-game', ref);
    const html = renderRecoveredGame(game, { grammar: 'pattern-accumulator', outcomeType: 'win', winnerId: 'A', winSource: 'self-draw', draft: { scores: { A: record.finalScore }, scoreRecords: { A: record } } });
    expect(html).toContain('A wins by self-draw · 28 Basic Points');
    expect(html.match(/paid A 36 — self-draw/g)).toHaveLength(3);
    expect(html).toContain('B: net −36');
    expect(html).toContain('A: net +108');
  });

  it('previews draw progression after four East-round draws using progressionAfter', () => {
    const start = createGame(players, seats, undefined, 'full-game', ref);
    const beforeFourth = [1, 2, 3].reduce((state) => confirmHand(state, { mcrOutcome: { type: 'mcr-draw' }, scores: { ...zeros } }), start);
    const html = renderRecoveredGame(beforeFourth, { grammar: 'pattern-accumulator', outcomeType: 'draw', draft: { scores: {}, scoreRecords: {} } });
    expect(html).toContain('No payments. Dealer passes and seats rotate.');
    expect(html).toContain('Next East: A');
    expect(html).toContain('Next prevailing wind: South (advanced from East)');
  });

  it('keeps final balances, full ledger, undo, start-over and print on a completed game', () => {
    const start = createGame(players, seats, undefined, 'full-game', ref);
    const complete = Array.from({ length: 16 }, () => ({ mcrOutcome: { type: 'mcr-draw' as const }, scores: { ...zeros } })).reduce((state, round) => confirmHand(state, round), start);
    expect(complete.isComplete).toBe(true);
    const currentRound = { grammar: 'pattern-accumulator' as const, draft: { scores: {}, scoreRecords: {} } };
    vi.spyOn(persistence, 'loadInProgressGameRecoveryCore').mockReturnValue({ game: complete, currentRound });
    vi.stubGlobal('window', { localStorage: { getItem: () => null, setItem: () => undefined, removeItem: () => undefined } });
    const html = renderToStaticMarkup(createElement(GameScorer, { initialRulesProfile: ref, onOpenHandScorer: () => undefined, onClearReturnedScore: () => undefined }));
    expect(html).toContain('Game complete');
    expect(html).toContain('Final balances');
    expect(html).toContain('Confirmed ledger · 16 hands');
    expect(html).toContain('mcr-undo');
    expect(html).toContain('mcr-start-over');
    expect(html).toContain('mcr-print-full');
  });
});
