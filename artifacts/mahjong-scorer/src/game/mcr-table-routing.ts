import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import type { GameState, HandScorerResult, McrAcceptedScoreRecord, McrHandOutcome, McrRoundInput, PlayerAmounts, PlayerScoreRecords, RulesProfileRef } from './types';

export type McrRoutingState = {
  outcomeType?: 'win' | 'draw';
  winnerId?: string;
  winSource?: 'discard' | 'self-draw';
  discarderId?: string;
  draft: { scores: Partial<PlayerAmounts>; scoreRecords: PlayerScoreRecords };
};

const withoutOwner = (state: McrRoutingState, owner = state.winnerId): McrRoutingState => {
  const scores = { ...state.draft.scores };
  const scoreRecords = { ...state.draft.scoreRecords };
  if (owner) { delete scores[owner]; delete scoreRecords[owner]; }
  return { ...state, draft: { scores, scoreRecords } };
};

export const transitionMcrRouting = (state: McrRoutingState, change: Partial<Pick<McrRoutingState, 'outcomeType' | 'winnerId' | 'winSource' | 'discarderId'>>): McrRoutingState => {
  const next = { ...state, ...change, draft: { scores: { ...state.draft.scores }, scoreRecords: { ...state.draft.scoreRecords } } };
  if (change.outcomeType === 'draw') return { outcomeType: 'draw', draft: { scores: {}, scoreRecords: {} } };
  if (state.outcomeType === 'draw' && change.outcomeType === 'win') return { outcomeType: 'win', draft: { scores: {}, scoreRecords: {} } };
  if ('winnerId' in change && change.winnerId !== state.winnerId) return withoutOwner(next, state.winnerId);
  if ('winSource' in change && change.winSource !== state.winSource) {
    const cleared = withoutOwner(next);
    if (change.winSource === 'self-draw') delete cleared.discarderId;
    return cleared;
  }
  if ('discarderId' in change && change.discarderId !== state.discarderId) return next;
  return next;
};

export const applyMcrScorerResult = (game: GameState, state: McrRoutingState, returned: HandScorerResult): McrRoutingState => {
  const compiled = getCurrentCompiledRulesRuntime(game.setup.rulesProfile);
  if (returned.grammar !== 'pattern-accumulator' || compiled.grammar !== 'pattern-accumulator' || compiled.artifact.profile.identity.familyId !== 'family.mcr') throw new Error('The returned score is not for the active MCR game.');
  const { acceptedScore: record } = returned;
  if (state.outcomeType !== 'win' || !state.winnerId || !state.winSource) throw new Error('Choose a winner and win source before scoring.');
  if (returned.playerId !== state.winnerId || !returned.isWinner) throw new Error('Only the current winner score can be accepted.');
  if (record.playerId !== state.winnerId || record.rulesProfile.id !== game.setup.rulesProfile.id || record.rulesProfile.version !== game.setup.rulesProfile.version || record.rulesFingerprint !== game.runtimeFingerprint || record.input.context.winSource !== state.winSource) throw new Error('The returned MCR score does not match the active game route.');
  if (record.input.context.seatWind !== undefined && record.input.context.seatWind !== game.seats[state.winnerId]) throw new Error('The returned MCR score seat wind does not match the current game.');
  if (record.input.context.prevailingWind !== undefined && record.input.context.prevailingWind !== game.prevailingWind) throw new Error('The returned MCR score prevailing wind does not match the current game.');
  if (record.source !== 'mcr-detailed-scorer' || record.result.grammar !== 'pattern-accumulator' || record.result.profile.id !== game.setup.rulesProfile.id || record.result.profile.version !== game.setup.rulesProfile.version || record.result.rulesFingerprint !== game.runtimeFingerprint || !record.result.legal || record.result.disposition.kind !== 'scored' || record.result.result.unit !== 'points' || returned.score !== record.finalScore || record.finalScore !== record.result.result.total) throw new Error('The returned MCR score is not a canonical accepted result.');
  return { ...state, draft: { scores: { [state.winnerId]: record.finalScore }, scoreRecords: { [state.winnerId]: record } } };
};

export const buildMcrRoundInput = (game: GameState, state: McrRoutingState): McrRoundInput => {
  const compiled = getCurrentCompiledRulesRuntime(game.setup.rulesProfile);
  if (compiled.grammar !== 'pattern-accumulator' || compiled.artifact.profile.identity.familyId !== 'family.mcr') throw new Error('The active game is not an MCR pattern-accumulator game.');
  const scores = Object.fromEntries(game.players.map(({ id }) => [id, 0])) as PlayerAmounts;
  if (state.outcomeType === 'draw') return { mcrOutcome: { type: 'mcr-draw' }, scores, scoreRecords: {} };
  if (state.outcomeType !== 'win' || !state.winnerId || !game.players.some(({ id }) => id === state.winnerId) || !state.winSource) throw new Error('Choose a winner and win source.');
  const records = state.draft.scoreRecords;
  const ids = Object.keys(records);
  const record = records[state.winnerId] as McrAcceptedScoreRecord | undefined;
  if (!record || ids.length !== 1 || record.source !== 'mcr-detailed-scorer' || record.playerId !== state.winnerId || record.rulesProfile.id !== game.setup.rulesProfile.id || record.rulesProfile.version !== game.setup.rulesProfile.version || record.rulesFingerprint !== game.runtimeFingerprint || record.rulesProfile.id !== compiled.artifact.profile.identity.id || record.rulesProfile.version !== compiled.artifact.profile.identity.version || record.rulesFingerprint !== compiled.artifact.rulesFingerprint || record.input.context.winSource !== state.winSource || (record.input.context.seatWind !== undefined && record.input.context.seatWind !== game.seats[state.winnerId]) || (record.input.context.prevailingWind !== undefined && record.input.context.prevailingWind !== game.prevailingWind) || record.result.grammar !== 'pattern-accumulator' || record.result.profile.id !== game.setup.rulesProfile.id || record.result.profile.version !== game.setup.rulesProfile.version || record.result.rulesFingerprint !== game.runtimeFingerprint || !record.result.legal || record.result.disposition.kind !== 'scored' || record.result.result.unit !== 'points' || state.draft.scores[state.winnerId] !== record.finalScore || record.finalScore !== record.result.result.total) throw new Error('Score the current winner hand before recording it.');
  let mcrOutcome: McrHandOutcome;
  if (state.winSource === 'discard') {
    if (!state.discarderId || state.discarderId === state.winnerId || !game.players.some(({ id }) => id === state.discarderId)) throw new Error('Choose a different in-game discarder.');
    mcrOutcome = { type: 'mcr-win', winnerId: state.winnerId, winSource: 'discard', discarderId: state.discarderId };
  } else {
    if (state.discarderId) throw new Error('A self-draw cannot have a discarder.');
    mcrOutcome = { type: 'mcr-win', winnerId: state.winnerId, winSource: 'self-draw' };
  }
  scores[state.winnerId] = record.finalScore;
  return { mcrOutcome, scores, scoreRecords: { [state.winnerId]: record } };
};

export const mcrTableProfile = (profile: RulesProfileRef) => {
  const compiled = getCurrentCompiledRulesRuntime(profile);
  return compiled.grammar === 'pattern-accumulator' && compiled.artifact.profile.identity.familyId === 'family.mcr';
};
