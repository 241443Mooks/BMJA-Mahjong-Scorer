import { BMJA_PROFILE_REF } from './ruleset';
import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import type { McrScoringInput } from '../rules-platform/mcr-scoring-input';
import type { HandScoreResult } from '../rules-platform/types';
import type { MahjongHand } from '../scoring';
import type {
  GameState,
  HandScorerLocalContext,
  HandOutcome,
  McrHandOutcome,
  HandScorerContext,
  HandScorerResult,
  PlayerScoreRecord,
  PlayerScoreRecords,
  PlayerId,
  RoundScoringDraft,
} from './types';

export const buildMcrHandScorerResult = (
  context: HandScorerContext,
  hand: MahjongHand,
  input: McrScoringInput,
  result: Extract<HandScoreResult, { grammar: 'pattern-accumulator' }>,
): HandScorerResult => {
  if (!context.mcr?.lockedTableContext || !context.isWinner || context.handMode !== 'normal') throw new Error('A game-owned MCR winner context is required.');
  const compiled = getCurrentCompiledRulesRuntime(context.rulesProfile);
  if (compiled.grammar !== 'pattern-accumulator' || compiled.artifact.profile.identity.familyId !== 'family.mcr' || compiled.artifact.profile.identity.id !== context.rulesProfile.id || compiled.artifact.profile.identity.version !== context.rulesProfile.version) throw new Error('The compiled MCR profile does not match the scorer context.');
  if (result.grammar !== 'pattern-accumulator' || result.profile.id !== compiled.artifact.profile.identity.id || result.profile.version !== compiled.artifact.profile.identity.version || result.rulesFingerprint !== compiled.artifact.rulesFingerprint || !result.legal || result.disposition.kind !== 'scored' || result.result.unit !== 'points' || !Number.isFinite(result.result.total) || !Number.isInteger(result.result.total)) throw new Error('Only an exact legal scored MCR points result can be accepted.');
  if (input.context.winSource !== context.mcr.winSource || input.context.seatWind !== context.playerWind || input.context.prevailingWind !== context.prevailingWind) throw new Error('Canonical MCR input conflicts with the locked table context.');
  const acceptedScore = { source: 'mcr-detailed-scorer' as const, playerId: context.playerId, rulesProfile: { id: compiled.artifact.profile.identity.id, version: compiled.artifact.profile.identity.version }, rulesFingerprint: compiled.artifact.rulesFingerprint, hand, input, result, finalScore: result.result.total };
  return { grammar: 'pattern-accumulator', playerId: context.playerId, score: result.result.total, isWinner: true, acceptedScore };
};

export const createHandScorerContext = (
  game: GameState,
  playerId: PlayerId,
  outcome: HandOutcome | McrHandOutcome | null,
  scoreRecord?: PlayerScoreRecord,
): HandScorerContext => {
  const player = game.players.find((candidate) => candidate.id === playerId);
  if (!player || !game.seats[playerId]) {
    throw new Error('The selected player must belong to the current game.');
  }
  const compiled = getCurrentCompiledRulesRuntime(game.setup.rulesProfile);
  if (compiled.grammar === 'pattern-accumulator') {
    if (compiled.artifact.profile.identity.familyId !== 'family.mcr') throw new Error('Unsupported profile: pattern-accumulator game handoff requires the MCR family.');
    if (outcome?.type !== 'mcr-win' || outcome.winnerId !== playerId || !['discard', 'self-draw'].includes(outcome.winSource)) throw new Error('A game-owned MCR scorer requires the selected MCR winner and locked win source.');
    const record = scoreRecord?.source === 'mcr-detailed-scorer' ? scoreRecord : undefined;
    if (scoreRecord && !record) throw new Error('Only an accepted MCR detailed score can be reopened.');
    if (record && (record.playerId !== playerId || record.rulesProfile.id !== compiled.artifact.profile.identity.id || record.rulesProfile.version !== compiled.artifact.profile.identity.version || record.rulesFingerprint !== compiled.artifact.rulesFingerprint || record.input.context.winSource !== outcome.winSource || record.input.context.seatWind !== game.seats[playerId] || record.input.context.prevailingWind !== game.prevailingWind || record.result.grammar !== 'pattern-accumulator' || record.result.profile.id !== compiled.artifact.profile.identity.id || record.result.profile.version !== compiled.artifact.profile.identity.version || record.result.rulesFingerprint !== compiled.artifact.rulesFingerprint || !record.result.legal || record.result.disposition.kind !== 'scored' || record.result.result.unit !== 'points' || record.result.result.total !== record.finalScore || !Number.isFinite(record.finalScore) || !Number.isInteger(record.finalScore))) throw new Error('The accepted MCR score conflicts with the current game context.');
    return { rulesProfile: game.setup.rulesProfile, playerId, playerName: player.name, playerWind: game.seats[playerId], prevailingWind: game.prevailingWind, isWinner: true, handMode: 'normal', mcr: { winSource: outcome.winSource, lockedTableContext: true, ...(record ? { acceptedScore: record } : {}) } };
  }
  if (outcome?.type === 'mcr-win' || outcome?.type === 'mcr-draw') throw new Error('An MCR outcome cannot be routed to a Classical hand scorer.');
  if (game.setup.tableLimit === undefined) throw new Error('A Classical hand scorer requires a table limit.');

  return {
    rulesProfile: game.setup.rulesProfile,
    playerId,
    playerName: player.name,
    playerWind: game.seats[playerId],
    prevailingWind: game.prevailingWind,
    isWinner: outcome?.type === 'win' && outcome.winnerId === playerId,
    limit: game.setup.tableLimit,
    handMode: game.currentHandMode,
    eastThirteenthConsecutiveMahjong: scoreRecord?.source === 'detailed-scorer'
      ? scoreRecord.context.eastThirteenthConsecutiveMahjong
      : undefined,
    ...(scoreRecord?.source === 'detailed-scorer'
      ? {
          detailedHand: scoreRecord,
          requiresRecalculation: scoreRecord.requiresRecalculation === true,
        }
      : {}),
  };
};

export const isRoundWinner = (
  outcome: HandOutcome,
  playerId: PlayerId,
): boolean => outcome.type === 'win' && outcome.winnerId === playerId;

export const assertDetailedWinnerMatchesOutcome = (
  outcome: HandOutcome,
  playerId: PlayerId,
  record: PlayerScoreRecord,
): void => {
  if (record.source !== 'detailed-scorer') return;

  const expectedWinner = isRoundWinner(outcome, playerId);
  if (
    record.requiresRecalculation ||
    record.hand.isWinner !== expectedWinner ||
    (!expectedWinner && record.hand.winningMethod !== undefined) ||
    (!expectedWinner && record.hand.winningTileProvenance !== undefined) ||
    (!expectedWinner && record.hand.winningEventEvidence !== undefined) ||
    (!expectedWinner && record.hand.originalCall === true)
  ) {
    throw new Error(
      'The detailed hand winner status does not match the active round.',
    );
  }
};

export const applyHandScorerResult = (
  game: GameState,
  draft: RoundScoringDraft,
  outcome: HandOutcome,
  result: HandScorerResult,
): {
  draft: RoundScoringDraft;
} => {
  if (!game.players.some((player) => player.id === result.playerId)) {
    throw new Error('A returned hand score must belong to the current game.');
  }
  if (result.grammar === 'pattern-accumulator') throw new Error('The Classical game draft cannot accept a pattern-accumulator hand score yet.');
  if (result.grammar !== 'classical-points-doubles') throw new Error('A Classical hand score must carry its grammar tag.');
  if (!Number.isFinite(result.score) || result.score < 0) {
    throw new Error('A returned hand score must be a non-negative number.');
  }
  const expectedWinner = isRoundWinner(outcome, result.playerId);
  if (result.isWinner !== expectedWinner) {
    throw new Error(
      'The detailed hand winner status does not match the active round.',
    );
  }
  assertDetailedWinnerMatchesOutcome(
    outcome,
    result.playerId,
    result.detailedHand,
  );
  if (
    result.detailedHand.source !== 'detailed-scorer' ||
    result.detailedHand.finalScore !== result.score ||
    result.detailedHand.breakdown.finalScore !== result.score
  ) {
    throw new Error('Detailed hand metadata must match the returned score.');
  }

  return {
    draft: {
      scores: { ...draft.scores, [result.playerId]: result.score },
      scoreRecords: {
        ...draft.scoreRecords,
        [result.playerId]: result.detailedHand,
      },
    },
  };
};

export const applyHandScorerSession = (
  game: GameState,
  draft: RoundScoringDraft,
  outcome: HandOutcome,
  result: HandScorerResult | null,
): {
  draft: RoundScoringDraft;
} =>
  result
    ? applyHandScorerResult(game, draft, outcome, result)
    : { draft };

export const reconcileDetailedHandsForOutcome = (
  game: GameState,
  draft: RoundScoringDraft,
  outcome: HandOutcome,
): RoundScoringDraft => {
  const scores = { ...draft.scores };
  const scoreRecords: PlayerScoreRecords = { ...draft.scoreRecords };

  for (const player of game.players) {
    const record = scoreRecords[player.id];
    if (
      record?.source !== 'detailed-scorer' ||
      record.requiresRecalculation ||
      record.hand.isWinner === isRoundWinner(outcome, player.id)
    ) {
      continue;
    }

    const expectedWinner = isRoundWinner(outcome, player.id);
    delete scores[player.id];
    scoreRecords[player.id] = {
      ...record,
      requiresRecalculation: true,
      hand: {
        ...record.hand,
        isWinner: expectedWinner,
        winningMethod: expectedWinner
          ? record.hand.winningMethod
          : undefined,
        winningTileProvenance: expectedWinner
          ? record.hand.winningTileProvenance
          : undefined,
        winningEventEvidence: expectedWinner
          ? record.hand.winningEventEvidence
          : undefined,
        originalCall: expectedWinner ? record.hand.originalCall : false,
      },
    };
  }

  return { scores, scoreRecords };
};

export const applyManualScore = (
  game: GameState,
  draft: RoundScoringDraft,
  playerId: PlayerId,
  score: number | null,
): RoundScoringDraft => {
  if (!game.players.some((player) => player.id === playerId)) {
    throw new Error('A manual score must belong to the current game.');
  }

  const scores = { ...draft.scores };
  const scoreRecords: PlayerScoreRecords = { ...draft.scoreRecords };

  if (score === null) {
    delete scores[playerId];
    delete scoreRecords[playerId];
  } else {
    if (!Number.isFinite(score) || score < 0) {
      throw new Error('A manual score must be a non-negative number.');
    }
    scores[playerId] = score;
    scoreRecords[playerId] = { source: 'manual', finalScore: score };
  }

  return { scores, scoreRecords };
};

export const handScorerLocalContext = (
  context: HandScorerContext | null,
  rulesProfile = BMJA_PROFILE_REF,
): HandScorerLocalContext => {
  const compiled = getCurrentCompiledRulesRuntime(rulesProfile);
  return {
    playerWind: context?.playerWind ?? 'east',
    prevailingWind: context?.prevailingWind ?? 'east',
    ...(context?.limit !== undefined ? { limit: context.limit } : compiled.grammar === 'classical-points-doubles' ? { limit: compiled.runtime.defaultTableLimit } : {}),
    isWinner: context?.isWinner ?? false,
    handMode: context?.handMode ?? 'normal',
    eastThirteenthConsecutiveMahjong: context?.eastThirteenthConsecutiveMahjong,
  };
};
