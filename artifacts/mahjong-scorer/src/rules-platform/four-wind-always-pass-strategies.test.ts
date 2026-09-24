import { describe, expect, it } from 'vitest';
import { executableIdentity } from './registry';
import type { ExplainedProgressionResult } from './types';
import {
  ALWAYS_PASS_PROGRESSION,
  FOUR_ROUND_ALWAYS_PASS_GAME_END,
  alwaysPassProgressionImplementation,
  determineFourRoundAlwaysPassGameEnd,
  fourRoundAlwaysPassGameEndImplementation,
  fourWindAlwaysPassStrategyRegistry,
  progressFourWindAlwaysPass,
  type FourWind,
  type FourWindAlwaysPassState,
  type FourWindResolvedRound,
} from './four-wind-always-pass-strategies';

const participants = ['A', 'B', 'C', 'D'] as const;
const winds: readonly FourWind[] = ['east', 'south', 'west', 'north'];
const state = (prevailingWind: FourWind = 'east', seats: Record<string, FourWind> = { A: 'east', B: 'south', C: 'west', D: 'north' }): FourWindAlwaysPassState => ({ seats, prevailingWind, dealerCycleStartPlayerId: 'A' });
const round = (kind = 'completed-hand'): FourWindResolvedRound => ({ outcome: { kind, payload: { winnerId: 'A' } }, acceptedScores: [] });
const transition = (current: FourWindAlwaysPassState, completedRound = round()) => progressFourWindAlwaysPass({ participants, current, round: completedRound });
const gameEnd = (previous: FourWindAlwaysPassState, progression: ExplainedProgressionResult<FourWindAlwaysPassState>) => determineFourRoundAlwaysPassGameEnd({ participants, previous, progression });
const rotate = (current: FourWindAlwaysPassState): FourWindAlwaysPassState => ({ ...current, seats: Object.fromEntries(Object.entries(current.seats).map(([id, wind]) => [id, ({ east: 'north', south: 'east', west: 'south', north: 'west' })[wind]])) as Record<string, FourWind> });
const afterRotations = (count: number, prevailing: FourWind) => { let result = state(prevailing); for (let i = 0; i < count; i += 1) result = rotate(result); return result; };

describe('generic four-wind always-pass B2 strategies', () => {
  it('registers the exact executable identity and semantic revision for both strategies', () => {
    expect(executableIdentity(fourWindAlwaysPassStrategyRegistry.requireExecutable('progression', ALWAYS_PASS_PROGRESSION.id))).toEqual({ id: 'progression.always-pass', semanticRevision: 1 });
    expect(executableIdentity(fourWindAlwaysPassStrategyRegistry.requireExecutable('game-end', FOUR_ROUND_ALWAYS_PASS_GAME_END.id))).toEqual({ id: 'game-end.four-round-always-pass', semanticRevision: 1 });
    expect(alwaysPassProgressionImplementation(ALWAYS_PASS_PROGRESSION)).toBe(progressFourWindAlwaysPass);
    expect(fourRoundAlwaysPassGameEndImplementation(FOUR_ROUND_ALWAYS_PASS_GAME_END)).toBe(determineFourRoundAlwaysPassGameEnd);
    expect(() => alwaysPassProgressionImplementation({ id: ALWAYS_PASS_PROGRESSION.id, semanticRevision: 2 })).toThrow();
    expect(() => fourRoundAlwaysPassGameEndImplementation({ id: FOUR_ROUND_ALWAYS_PASS_GAME_END.id, semanticRevision: 2 })).toThrow();
  });

  it.each([
    ['P001 East wins', round('east-win')],
    ['P002 non-East wins', { outcome: { kind: 'non-east-win', payload: { winnerId: 'C' } }, acceptedScores: [] }],
    ['P003 draw', { outcome: { kind: 'draw', payload: {} }, acceptedScores: [] }],
  ])('%s passes the dealer with the same state transition', (_label, completedRound) => {
    const result = transition(state(), completedRound);
    expect(result.nextState).toEqual({ seats: { A: 'north', B: 'east', C: 'south', D: 'west' }, prevailingWind: 'east', dealerCycleStartPlayerId: 'A' });
    expect(result.metadata).toMatchObject({ previousDealerPlayerId: 'A', nextDealerPlayerId: 'B', dealerCycleCompleted: false, seatsRotated: true });
    expect(result.reasonId).toBe('progression.always-pass.dealer-passed');
  });

  it.each([
    ['east', 'south'], ['south', 'west'], ['west', 'north'],
  ] as const)('P004 advances a completed %s cycle to %s', (beforeWind, afterWind) => {
    const previous = afterRotations(3, beforeWind);
    const result = transition(previous, round('draw'));
    expect(result.nextState.seats).toEqual(state().seats);
    expect(result.nextState.prevailingWind).toBe(afterWind);
    expect(result.reasonId).toBe('progression.always-pass.prevailing-wind-advanced');
    expect(result.metadata).toMatchObject({ previousDealerPlayerId: 'D', nextDealerPlayerId: 'A', dealerCycleCompleted: true, seatsRotated: true });
    expect(gameEnd(previous, result)).toEqual({ complete: false, reasonId: 'game-end.four-round-always-pass.continues' });
  });

  it('P005 completes the North cycle without wrapping to East', () => {
    const previous = afterRotations(3, 'north');
    const result = transition(previous, round('draw'));
    expect(result.nextState.seats).toEqual(state().seats);
    expect(result.nextState.prevailingWind).toBe('north');
    expect(result.reasonId).toBe('progression.always-pass.dealer-cycle-completed');
    expect(gameEnd(previous, result)).toEqual({ complete: true, reasonId: 'game-end.four-round-always-pass.four-rounds-complete' });
  });

  it('continues on ordinary, incomplete dealer transitions', () => {
    const previous = state();
    expect(gameEnd(previous, transition(previous))).toEqual({ complete: false, reasonId: 'game-end.four-round-always-pass.continues' });
  });

  it.each(winds.slice(0, 3))('continues after a completed %s cycle', (wind) => {
    const previous = afterRotations(3, wind);
    expect(gameEnd(previous, transition(previous))).toEqual({ complete: false, reasonId: 'game-end.four-round-always-pass.continues' });
  });

  it.each([
    ['participant count', ['A', 'B', 'C']],
    ['duplicate participant', ['A', 'B', 'C', 'C']],
    ['empty participant', ['A', 'B', 'C', '']],
  ])('fails closed for %s', (_label, ids) => {
    expect(() => progressFourWindAlwaysPass({ participants: ids, current: state(), round: round() })).toThrow();
  });

  it.each([
    ['extra seat-map participant', { A: 'east', B: 'south', C: 'west', D: 'north', E: 'east' }],
    ['missing seat-map participant', { A: 'east', B: 'south', C: 'west' }],
    ['duplicate wind assignment', { A: 'east', B: 'east', C: 'west', D: 'north' }],
    ['missing wind assignment', { A: 'east', B: 'south', C: 'west', D: 'west' }],
  ])('fails closed for %s', (_label, seats) => {
    expect(() => transition(state('east', seats as Record<string, FourWind>))).toThrow();
  });

  it('fails closed for an unknown cycle anchor, invalid prevailing wind, or malformed round envelope', () => {
    expect(() => transition({ ...state(), dealerCycleStartPlayerId: 'E' })).toThrow();
    expect(() => transition({ ...state(), prevailingWind: 'middle' as FourWind })).toThrow();
    expect(() => progressFourWindAlwaysPass({ participants, current: state(), round: undefined as never })).toThrow();
    expect(() => progressFourWindAlwaysPass({ participants, current: state(), round: { outcome: { kind: '', payload: {} }, acceptedScores: [] } })).toThrow();
    expect(() => progressFourWindAlwaysPass({ participants, current: state(), round: { outcome: { kind: 'resolved' } as never, acceptedScores: [] } })).toThrow();
  });

  it('rotates deterministically on each completed hand independent of round outcome details', () => {
    const first = transition(state(), round('win'));
    const second = transition(state(), round('draw'));
    expect(first.nextState).toEqual(second.nextState);
    expect(first.nextState.seats).toEqual({ A: 'north', B: 'east', C: 'south', D: 'west' });
  });

  it('fails closed when game-end receives an inconsistent or non-North transition', () => {
    const previous = afterRotations(3, 'east');
    const valid = transition(previous);
    expect(() => gameEnd(previous, { ...valid, reasonId: 'progression.always-pass.dealer-cycle-completed' })).toThrow();
    expect(() => gameEnd(previous, { ...valid, nextState: { ...valid.nextState, prevailingWind: 'north' } })).toThrow();
    const north = afterRotations(3, 'north');
    const northernValid = transition(north);
    expect(() => gameEnd(north, { ...northernValid, nextState: { ...northernValid.nextState, prevailingWind: 'east' } })).toThrow();
  });
});
