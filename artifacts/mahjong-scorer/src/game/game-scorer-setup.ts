import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import type { CurrentCapabilityId } from '../rules-platform/capabilities';
import type { ClassicalGameState, GameLength, GamePlayer, GameState, RoundScoringDraft, RulesProfileRef, SeatAssignments } from './types';
import { createGame } from './game';
import type { PersistedCurrentRoundV2 } from './persistence';

export const gameScorerSetup = (profile: RulesProfileRef, requestedLength: GameLength, tableLimit?: number) => {
  const compiled = getCurrentCompiledRulesRuntime(profile);
  return compiled.grammar === 'classical-points-doubles'
    ? { grammar: compiled.grammar, gameLength: requestedLength, tableLimit: tableLimit ?? compiled.runtime.defaultTableLimit, compiled }
    : { grammar: compiled.grammar, gameLength: 'full-game' as const, tableLimit: undefined, compiled };
};

export const gameScorerSupports = (profile: RulesProfileRef, capability: CurrentCapabilityId) => {
  const compiled = getCurrentCompiledRulesRuntime(profile);
  return compiled.grammar === 'classical-points-doubles' && compiled.runtime.supportedCapabilities().includes(capability);
};

export const isClassicalGameState = (game: GameState): game is ClassicalGameState =>
  getCurrentCompiledRulesRuntime(game.setup.rulesProfile).grammar === 'classical-points-doubles';

export const createGameScorerGame = (
  players: GamePlayer[], seats: SeatAssignments, requestedLength: GameLength,
  profile: RulesProfileRef, tableLimit?: number,
): GameState => {
  const setup = gameScorerSetup(profile, requestedLength, tableLimit);
  return createGame(players, seats, undefined, setup.gameLength, profile, setup.tableLimit);
};

export const gameScorerCurrentRound = (
  game: GameState, existing: PersistedCurrentRoundV2 | null, outcomeType: 'win' | 'draw', winnerId: string, draft: RoundScoringDraft,
): PersistedCurrentRoundV2 => {
  const compiled = getCurrentCompiledRulesRuntime(game.setup.rulesProfile);
  if (compiled.grammar === 'classical-points-doubles') {
    return { grammar: compiled.grammar, outcomeType, winnerId, draft: structuredClone(draft) };
  }
  return existing?.grammar === 'pattern-accumulator'
    ? structuredClone(existing)
    : { grammar: 'pattern-accumulator', draft: { scores: {}, scoreRecords: {} } };
};
