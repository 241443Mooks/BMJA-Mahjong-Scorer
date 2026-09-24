import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes, getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import { suited, wind } from '../scoring';
import { createGame, confirmHand } from './game';
import { buildMcrHandScorerResult, createHandScorerContext } from './hand-scorer-handoff';
import { buildMcrRoundInput, applyMcrScorerResult, transitionMcrRouting, type McrRoutingState } from './mcr-table-routing';
import { gameScorerCurrentRound } from './game-scorer-setup';
import { toMcrScoringInput } from './mcr-hand-input';
import { loadInProgressGameRecoveryCore, saveGameRecoveryV2 } from './persistence';

const profile = { id: 'mcr-wmo-2006', version: '0.1' } as const;
const players = ['A', 'B', 'C', 'D'].map((id) => ({ id, name: id }));
const seats = { A: 'east', B: 'south', C: 'west', D: 'north' } as const;
const hand = { sets: [], looseTiles: [suited('characters',1),suited('characters',1),suited('characters',2),suited('characters',2),suited('circles',3),suited('circles',3),suited('circles',4),suited('circles',4),suited('bamboo',5),suited('bamboo',5),suited('bamboo',6),suited('bamboo',6),wind('east'),wind('east')], bonusTiles: [], isWinner: true, winningTileProvenance: { tile: wind('east'), target: { type: 'loose-layout' as const } } };

beforeAll(() => initialiseCurrentRulesRuntimes());

const scored = (winner = 'A', winSource: 'discard' | 'self-draw' = 'discard') => {
  const game = createGame(players, seats, undefined, 'full-game', profile);
  const context = createHandScorerContext(game, winner, { type: 'mcr-win', winnerId: winner, winSource });
  const input = toMcrScoringInput(hand, { winSource, resolvedWinEvent: 'none', lastVisibleCopy: false, seatWind: game.seats[winner], prevailingWind: game.prevailingWind });
  if (input.kind !== 'ready') throw new Error('Fixture must produce a ready MCR input.');
  const runtime = getCurrentCompiledRulesRuntime(profile);
  if (runtime.grammar !== 'pattern-accumulator') throw new Error('Expected MCR runtime.');
  const returned = buildMcrHandScorerResult(context, hand, input.input, runtime.runtime.scoreHand(input.input));
  if (returned.grammar !== 'pattern-accumulator') throw new Error('Expected MCR result.');
  return { game, result: returned };
};

const empty: McrRoutingState = { draft: { scores: {}, scoreRecords: {} } };

describe('C2C1c MCR table routing', () => {
  it('retains an absent partial route exactly in the C2B current-round projection', () => {
    const { game } = scored();
    const route = { draft: { scores: {}, scoreRecords: {} } };
    const saved = gameScorerCurrentRound(game, null, 'win', '', { scores: {}, scoreRecords: {} }, route);
    expect(saved).toEqual({ grammar: 'pattern-accumulator', draft: { scores: {}, scoreRecords: {} } });
  });

  it('invalidates winner and source changes, clears discarders for self-draw, and preserves score for discarder-only edits', () => {
    const { result } = scored();
    const accepted = applyMcrScorerResult(scored().game, { outcomeType: 'win', winnerId: 'A', winSource: 'discard', draft: { scores: {}, scoreRecords: {} } }, result);
    const changedWinner = transitionMcrRouting({ outcomeType: 'win', winnerId: 'A', winSource: 'discard', discarderId: 'B', draft: accepted.draft }, { winnerId: 'C' });
    expect(changedWinner.draft).toEqual({ scores: {}, scoreRecords: {} });
    const changedSource = transitionMcrRouting({ ...accepted, discarderId: 'B' }, { winSource: 'self-draw' });
    expect(changedSource.draft).toEqual({ scores: {}, scoreRecords: {} });
    expect(changedSource.discarderId).toBeUndefined();
    const discarderOnly = transitionMcrRouting({ ...accepted, discarderId: 'B' }, { discarderId: 'C' });
    expect(discarderOnly.draft).toEqual(accepted.draft);
  });

  it('draw clears route and score; draw to win starts blank', () => {
    const { result } = scored();
    const route = applyMcrScorerResult(scored().game, { outcomeType: 'win', winnerId: 'A', winSource: 'discard', draft: empty.draft }, result);
    const draw = transitionMcrRouting({ ...route, winnerId: 'A', winSource: 'discard', discarderId: 'B' }, { outcomeType: 'draw' });
    expect(draw).toEqual({ outcomeType: 'draw', draft: { scores: {}, scoreRecords: {} } });
    expect(transitionMcrRouting(draw, { outcomeType: 'win' })).toEqual({ outcomeType: 'win', draft: { scores: {}, scoreRecords: {} } });
  });

  it('rejects stale or mismatched returned MCR results and accepts one canonical winner record', () => {
    const { game, result } = scored();
    expect(() => applyMcrScorerResult(game, { outcomeType: 'win', winnerId: 'B', winSource: 'discard', draft: empty.draft }, result)).toThrow();
    expect(() => applyMcrScorerResult(game, { outcomeType: 'win', winnerId: 'A', winSource: 'self-draw', draft: empty.draft }, result)).toThrow();
    const accepted = applyMcrScorerResult(game, { outcomeType: 'win', winnerId: 'A', winSource: 'discard', draft: empty.draft }, result);
    expect(Object.keys(accepted.draft.scoreRecords)).toEqual(['A']);
    expect(accepted.draft.scores).toEqual({ A: result.score });
    expect(() => buildMcrRoundInput(game, { ...accepted, discarderId: 'B' })).not.toThrow();
    expect(buildMcrRoundInput(game, { ...accepted, discarderId: 'B' })).toMatchObject({ mcrOutcome: { type: 'mcr-win', winnerId: 'A', winSource: 'discard', discarderId: 'B' }, scores: { A: 24, B: 0, C: 0, D: 0 }, scoreRecords: { A: result.acceptedScore } });
  });

  it('does not build a manually scored MCR round and does not require a discarder to score', () => {
    const { game } = scored();
    expect(() => buildMcrRoundInput(game, { outcomeType: 'win', winnerId: 'A', winSource: 'discard', draft: { scores: { A: 24 }, scoreRecords: {} } })).toThrow(/Score the current winner/);
    const context = createHandScorerContext(game, 'A', { type: 'mcr-win', winnerId: 'A', winSource: 'discard' });
    expect(context.mcr?.winSource).toBe('discard');
    expect(() => buildMcrRoundInput(game, { outcomeType: 'win', winnerId: 'A', winSource: 'discard', discarderId: 'B', draft: { scores: {}, scoreRecords: {} } })).toThrow();
  });

  it('builds an exact draw input and previews by committing the same confirmHand domain result', () => {
    const { game } = scored();
    const input = buildMcrRoundInput(game, { outcomeType: 'draw', winnerId: 'A', winSource: 'discard', discarderId: 'B', draft: { scores: { A: 24 }, scoreRecords: {} } });
    expect(input).toEqual({ mcrOutcome: { type: 'mcr-draw' }, scores: { A: 0, B: 0, C: 0, D: 0 }, scoreRecords: {} });
    const preview = confirmHand(game, input);
    expect(preview.handHistory[0]?.settlement.transactions).toEqual([]);
    expect(preview.seats).not.toEqual(game.seats);
    expect(confirmHand(game, input)).toEqual(preview);
  });

  it('routes the accepted 24 Basic Points through the domain for discard and self-draw settlement', () => {
    const { game, result } = scored();
    const accepted = applyMcrScorerResult(game, { outcomeType: 'win', winnerId: 'A', winSource: 'discard', draft: empty.draft }, result);
    const discard = confirmHand(game, buildMcrRoundInput(game, { ...accepted, discarderId: 'B' }));
    expect(discard.handHistory[0]?.settlement.transactions.map(({ fromPlayerId, amount }) => [fromPlayerId, amount])).toEqual([['B', 32], ['C', 8], ['D', 8]]);
    const compiled = getCurrentCompiledRulesRuntime(profile);
    if (compiled.grammar !== 'pattern-accumulator') throw new Error('Expected MCR runtime.');
    const selfDraw = compiled.runtime.settleRound({ participants: ['A', 'B', 'C', 'D'], round: { outcome: { kind: 'mcr-win', payload: { winnerId: 'B', winSource: 'self-draw' } }, acceptedScores: [{ playerId: 'B', score: result.acceptedScore.result }] } });
    expect(selfDraw.map(({ from, amount }) => [from, amount])).toEqual([['A', 32], ['C', 32], ['D', 32]]);
  });

  it('takes a real self-draw scorer result through routing, exact round input, and confirmation', () => {
    const { game } = scored();
    const discardRoute = transitionMcrRouting(empty, { outcomeType: 'win', winnerId: 'A', winSource: 'discard', discarderId: 'B' });
    const selfDrawRoute = transitionMcrRouting(discardRoute, { winSource: 'self-draw' });
    expect(selfDrawRoute.discarderId).toBeUndefined();
    expect(Object.keys(selfDrawRoute.draft.scoreRecords)).toHaveLength(0);

    const { result } = scored('A', 'self-draw');
    const acceptedRoute = applyMcrScorerResult(game, selfDrawRoute, result);
    expect(result.score).toBe(result.acceptedScore.result.result.total);
    expect(acceptedRoute.draft.scores.A).toBe(result.score);
    const input = buildMcrRoundInput(game, acceptedRoute);
    expect(input.mcrOutcome).toEqual({ type: 'mcr-win', winnerId: 'A', winSource: 'self-draw' });
    expect(input.mcrOutcome).not.toHaveProperty('discarderId');
    expect(input.scoreRecords).toEqual({ A: result.acceptedScore });

    const confirmed = confirmHand(game, input);
    expect(confirmed.handHistory[0]?.mcrReplay).toEqual(input);
    expect(confirmed.handHistory[0]?.settlement.transactions.map(({ amount }) => amount)).toEqual([result.score + 8, result.score + 8, result.score + 8]);
  });

  it('projects a populated route and recovers its exact accepted record through v2 persistence', () => {
    const { game, result } = scored('A', 'discard');
    const routed = transitionMcrRouting(empty, { outcomeType: 'win', winnerId: 'A', winSource: 'discard', discarderId: 'B' });
    const accepted = applyMcrScorerResult(game, routed, result);
    const projected = gameScorerCurrentRound(game, null, 'win', 'A', { scores: {}, scoreRecords: {} }, accepted);
    const stored = new Map<string, string>();
    const storage = {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => { stored.set(key, value); },
      removeItem: (key: string) => { stored.delete(key); },
    };

    saveGameRecoveryV2(storage, game, projected);
    const recovered = loadInProgressGameRecoveryCore(storage);
    expect(recovered?.currentRound).toEqual(projected);
    if (recovered?.currentRound.grammar !== 'pattern-accumulator') throw new Error('Expected recovered MCR route.');
    expect(recovered.currentRound).toMatchObject({ grammar: 'pattern-accumulator', outcomeType: 'win', winnerId: 'A', winSource: 'discard', discarderId: 'B', draft: { scores: { A: result.score }, scoreRecords: { A: result.acceptedScore } } });
    const recoveredRecord = recovered.currentRound.draft.scoreRecords.A;
    if (!recoveredRecord || recoveredRecord.source !== 'mcr-detailed-scorer') throw new Error('Expected recovered accepted MCR score.');
    expect(recoveredRecord).toEqual(result.acceptedScore);
    expect(recoveredRecord.rulesProfile).toEqual(profile);
    expect(recoveredRecord.rulesFingerprint).toBe(game.runtimeFingerprint);
    expect(recoveredRecord.input).toEqual(result.acceptedScore.input);
    expect(recoveredRecord.result).toEqual(result.acceptedScore.result);
  });
});
