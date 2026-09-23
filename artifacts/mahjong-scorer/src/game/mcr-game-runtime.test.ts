import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes, getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import type { HandScoreResult } from '../rules-platform/types';
import type { McrScoringInput } from '../rules-platform/mcr-scoring-input';
import type { GamePlayer, McrRoundInput, PlayerAmounts, PlayerScoreRecords, RulesProfileRef, SeatAssignments } from './types';
import { confirmHand, createBmjaGame, createGame, replayGame, undoLastHand } from './game';
import { saveGameRecovery, GAME_SNAPSHOT_STORAGE_KEY } from './persistence';

const ref: RulesProfileRef = { id: 'mcr-wmo-2006', version: '0.1' };
const fingerprint = '8044ee6ee883192bae97e83a67380f6c0bff999179df93229fc9daa4308a7ace';
const players: GamePlayer[] = ['A', 'B', 'C', 'D'].map((id) => ({ id, name: id }));
const seats: SeatAssignments = { A: 'east', B: 'south', C: 'west', D: 'north' };
const zeroes: PlayerAmounts = { A: 0, B: 0, C: 0, D: 0 };
const draw = { mcrOutcome: { type: 'mcr-draw' as const }, scores: { ...zeroes } };

const syntheticAccepted = (total: number, winSource: 'discard' | 'self-draw', playerId = 'A') => {
  const compiled = getCurrentCompiledRulesRuntime(ref);
  if (compiled.grammar !== 'pattern-accumulator') throw new Error('Expected MCR runtime');
  const input: McrScoringInput = {
    evidence: { fixedGroups: [], freeTiles: [{ face: { family: 'wind', wind: 'east' } }], winningTile: { face: { family: 'wind', wind: 'east' } }, flowerCount: 0 },
    context: { winSource, resolvedWinEvent: 'none', lastVisibleCopy: false },
  };
  const result: Extract<HandScoreResult, { grammar: 'pattern-accumulator' }> = {
    grammar: 'pattern-accumulator', profile: { ...ref }, rulesFingerprint: fingerprint, legal: true,
    disposition: { kind: 'scored' }, explanation: [], decisionTrace: [], matchedCanonicalPatternIds: [],
    result: { unit: 'points', total },
  };
  return {
    source: 'mcr-detailed-scorer' as const, playerId, rulesProfile: { ...ref }, rulesFingerprint: fingerprint,
    hand: { sets: [], looseTiles: [], bonusTiles: [], isWinner: true }, input, result, finalScore: total,
  };
};

const win = (total: number, winSource: 'discard' | 'self-draw' = 'self-draw', discarderId?: string, playerId = 'A') => ({
  mcrOutcome: { type: 'mcr-win' as const, winnerId: playerId, winSource, ...(winSource === 'discard' ? { discarderId } : {}) },
  scores: { ...zeroes, [playerId]: total },
  scoreRecords: { [playerId]: syntheticAccepted(total, winSource, playerId) },
});

const sevenPairs: McrScoringInput = {
  evidence: { fixedGroups: [], freeTiles: [
    ...([['characters',1],['characters',1],['characters',2],['characters',2],['dots',3],['dots',3],['dots',4],['dots',4],['bamboo',5],['bamboo',5],['bamboo',6],['bamboo',6]] as const).map(([suit, rank]) => ({ face: { family: 'suit' as const, suit, rank } })),
    { face: { family: 'wind', wind: 'east' } }, { face: { family: 'wind', wind: 'east' } },
  ], winningTile: { face: { family: 'wind', wind: 'east' } }, flowerCount: 0 },
  context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false },
};

const actualRecord = (input = sevenPairs, playerId = 'A', winSource: 'discard' | 'self-draw' = 'discard') => {
  const compiled = getCurrentCompiledRulesRuntime(ref);
  if (compiled.grammar !== 'pattern-accumulator') throw new Error('Expected MCR runtime');
  const acceptedInput = { ...input, context: { ...input.context, winSource } };
  const result = compiled.runtime.scoreHand(acceptedInput);
  return { source: 'mcr-detailed-scorer' as const, playerId, rulesProfile: { ...ref }, rulesFingerprint: compiled.artifact.rulesFingerprint, hand: { sets: [], looseTiles: [], bonusTiles: [], isWinner: true }, input: acceptedInput, result, finalScore: result.result.total };
};

const memoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    values,
  };
};

describe('C2A profile-aware MCR game runtime', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());

  it('seals exact MCR setup, has no table limit, rejects one-round, and leaves Classical defaults intact', () => {
    const game = createGame(players, seats, undefined, 'full-game', ref);
    expect(game.setup.rulesProfile).toEqual(ref);
    expect(game.runtimeFingerprint).toBe(fingerprint);
    expect(game.setup).not.toHaveProperty('tableLimit');
    expect(() => createGame(players, seats, undefined, 'one-round', ref)).toThrow(/four-round/);
    expect(() => createGame(players, seats, undefined, 'full-game', ref, 600)).toThrow(/table limit/);
    const classical = createBmjaGame(players, seats);
    const classicalRuntime = getCurrentCompiledRulesRuntime({ id: 'bmja', version: '1.0' });
    if (classicalRuntime.grammar !== 'classical-points-doubles') throw new Error('Expected Classical runtime');
    expect(classical.setup.tableLimit).toBe(classicalRuntime.runtime.defaultTableLimit);
  });

  it('maps the existing B1 S001 and S002 accepted-score fixtures into public typed ledger records', () => {
    const initial = createGame(players, seats, undefined, 'full-game', ref);
    const discard = confirmHand(initial, win(11, 'discard', 'B'));
    expect(discard.handHistory[0]!.settlement.transactions).toEqual([
      { fromPlayerId: 'B', toPlayerId: 'A', amount: 19, reasonId: 'settlement.mcr-2006.discarder-payment', basicPoints: 11, fixedComponent: 8, winSource: 'discard', payerRole: 'discarder' },
      { fromPlayerId: 'C', toPlayerId: 'A', amount: 8, reasonId: 'settlement.mcr-2006.other-player-base-payment', basicPoints: 11, fixedComponent: 8, winSource: 'discard', payerRole: 'other-player' },
      { fromPlayerId: 'D', toPlayerId: 'A', amount: 8, reasonId: 'settlement.mcr-2006.other-player-base-payment', basicPoints: 11, fixedComponent: 8, winSource: 'discard', payerRole: 'other-player' },
    ]);
    for (const transaction of discard.handHistory[0]!.settlement.transactions) {
      expect(transaction).not.toHaveProperty('baseAmount');
      expect(transaction).not.toHaveProperty('eastMultiplier');
      expect(transaction).not.toHaveProperty('reason');
    }
    const selfDraw = confirmHand(initial, win(11));
    if (selfDraw.handHistory[0]!.settlement.transactions[0] && !('reasonId' in selfDraw.handHistory[0]!.settlement.transactions[0]!)) throw new Error('Expected MCR transaction');
    expect(selfDraw.handHistory[0]!.settlement.transactions.map((transaction) => ({ fromPlayerId: transaction.fromPlayerId, toPlayerId: transaction.toPlayerId, amount: transaction.amount, reasonId: 'reasonId' in transaction ? transaction.reasonId : '', basicPoints: 'basicPoints' in transaction ? transaction.basicPoints : -1, fixedComponent: 'fixedComponent' in transaction ? transaction.fixedComponent : -1, winSource: 'winSource' in transaction ? transaction.winSource : '', payerRole: 'payerRole' in transaction ? transaction.payerRole : '' }))).toEqual(
      ['B', 'C', 'D'].map((fromPlayerId) => ({ fromPlayerId, toPlayerId: 'A', amount: 19, reasonId: 'settlement.mcr-2006.self-draw-payment', basicPoints: 11, fixedComponent: 8, winSource: 'self-draw', payerRole: 'non-winner' })),
    );
  });

  it('uses the accepted S003 total 10 unchanged and pays 18 each on self-draw', () => {
    const result = confirmHand(createGame(players, seats, undefined, 'full-game', ref), win(10));
    expect(result.handHistory[0]!.settlement.transactions.map(({ amount }) => amount)).toEqual([18, 18, 18]);
    expect(result.handHistory[0]!.mcrReplay?.scoreRecords?.A?.finalScore).toBe(10);
  });

  it('settles a draw with no accepted scores or payments and applies B2 always-pass progression', () => {
    const result = confirmHand(createGame(players, seats, undefined, 'full-game', ref), draw);
    expect(result.handHistory[0]!.settlement.transactions).toEqual([]);
    expect(result.handHistory[0]!.scores).toEqual(zeroes);
    expect(result.seats).toEqual({ A: 'north', B: 'east', C: 'south', D: 'west' });
    expect(result.eastCycleStartPlayerId).toBe('A');
  });

  it('applies B2 seat rotation, East-cycle wind advancement, and North-cycle completion', () => {
    const eastRecord = actualRecord(sevenPairs, 'A', 'self-draw');
    const first = confirmHand(createGame(players, seats, undefined, 'full-game', ref), {
      mcrOutcome: { type: 'mcr-win', winnerId: 'A', winSource: 'self-draw' },
      scores: { ...zeroes, A: eastRecord.finalScore }, scoreRecords: { A: eastRecord },
    });
    expect(first.seats).toEqual({ A: 'north', B: 'east', C: 'south', D: 'west' });
    let game = createGame(players, seats, undefined, 'full-game', ref);
    for (let i = 0; i < 4; i += 1) game = confirmHand(game, draw);
    expect(game.prevailingWind).toBe('south');
    expect(game.eastCycleStartPlayerId).toBe('A');
    for (let i = 4; i < 16; i += 1) game = confirmHand(game, draw);
    expect(game.prevailingWind).toBe('north');
    expect(game.isComplete).toBe(true);
    expect(first.runtimeFingerprint).toBe(fingerprint);
  });

  it('rejects manual, owner/profile/fingerprint-mismatched, routing-invalid, and summary-mismatched scores', () => {
    const initial = createGame(players, seats, undefined, 'full-game', ref);
    const manual: McrRoundInput = { ...win(11, 'self-draw'), scoreRecords: { A: { source: 'manual', finalScore: 11 } } as PlayerScoreRecords };
    expect(() => confirmHand(initial, manual)).toThrow(/accepted detailed/);
    const wrongOwner = win(11); wrongOwner.scoreRecords.A = syntheticAccepted(11, 'self-draw', 'B');
    expect(() => confirmHand(initial, wrongOwner)).toThrow(/accepted detailed/);
    const wrongProfile = win(11); (wrongProfile.scoreRecords.A as ReturnType<typeof syntheticAccepted>).rulesProfile = { id: 'bmja', version: '1.0' };
    expect(() => confirmHand(initial, wrongProfile)).toThrow(/profile\/version\/fingerprint/);
    const wrongVersion = win(11); (wrongVersion.scoreRecords.A as ReturnType<typeof syntheticAccepted>).rulesProfile.version = '9.9';
    expect(() => confirmHand(initial, wrongVersion)).toThrow(/profile\/version\/fingerprint/);
    const wrongFingerprint = win(11); (wrongFingerprint.scoreRecords.A as ReturnType<typeof syntheticAccepted>).rulesFingerprint = 'bad';
    expect(() => confirmHand(initial, wrongFingerprint)).toThrow(/profile\/version\/fingerprint/);
    expect(() => confirmHand(initial, win(11, 'discard'))).toThrow(/discarder/);
    const invalidSelfDraw = win(11, 'self-draw'); invalidSelfDraw.mcrOutcome = { ...invalidSelfDraw.mcrOutcome, discarderId: 'B' } as typeof invalidSelfDraw.mcrOutcome;
    expect(() => confirmHand(initial, invalidSelfDraw)).toThrow(/cannot include a discarder/);
    const mismatch = win(12); mismatch.scoreRecords.A = syntheticAccepted(11, 'self-draw');
    expect(() => confirmHand(initial, mismatch)).toThrow(/summary does not match/);
  });

  it('replays and undoes from the full in-memory MCR payload, preserving result and progression state', () => {
    const setup = createGame(players, seats, undefined, 'full-game', ref).setup;
    const rounds = [
      { mcrOutcome: { type: 'mcr-win' as const, winnerId: 'A', winSource: 'discard' as const, discarderId: 'B' }, scores: { ...zeroes, A: 24 }, scoreRecords: { A: actualRecord(sevenPairs, 'A', 'discard') } },
      draw,
      { mcrOutcome: { type: 'mcr-win' as const, winnerId: 'C', winSource: 'discard' as const, discarderId: 'B' }, scores: { ...zeroes, C: 24 }, scoreRecords: { C: actualRecord(sevenPairs, 'C', 'discard') } },
    ];
    let beforeRemoved = createGame(players, seats, undefined, 'full-game', ref);
    for (const round of rounds.slice(0, 2)) beforeRemoved = confirmHand(beforeRemoved, round);
    const state = confirmHand(beforeRemoved, rounds[2]!);
    const replayed = replayGame(setup, rounds);
    expect(replayed).toEqual(state);
    const undone = undoLastHand(state);
    expect(undone).toEqual(beforeRemoved);
    expect(undone.handHistory[0]!.mcrReplay?.scoreRecords?.A).toMatchObject({ source: 'mcr-detailed-scorer', finalScore: 24 });
  });

  it('does not serialize the C2A in-memory MCR replay payload in the v1 snapshot projection', () => {
    const storage = memoryStorage();
    const game = confirmHand(createGame(players, seats, undefined, 'full-game', ref), {
      mcrOutcome: { type: 'mcr-win', winnerId: 'A', winSource: 'discard', discarderId: 'B' },
      scores: { ...zeroes, A: 24 }, scoreRecords: { A: actualRecord(sevenPairs, 'A', 'discard') },
    });
    saveGameRecovery(storage, game, 'win', 'A', { scores: { A: 24 }, scoreRecords: { A: actualRecord(sevenPairs, 'A', 'discard') } });
    const snapshot = JSON.parse(storage.values.get(GAME_SNAPSHOT_STORAGE_KEY)!);
    expect(snapshot.version).toBe(1);
    expect(snapshot.game.rounds).toEqual([]);
    expect(JSON.stringify(snapshot)).not.toContain('mcrReplay');
    expect(JSON.stringify(snapshot)).not.toContain('mcr-detailed-scorer');
  });
});
