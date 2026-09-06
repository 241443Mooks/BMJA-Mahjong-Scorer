import { CURRENT_RULESET } from './ruleset';
import type {
  GameState,
  HandScorerLocalContext,
  HandOutcome,
  HandScorerContext,
  HandScorerResult,
  PlayerScoreRecord,
  PlayerScoreRecords,
  PlayerId,
  RoundScoringDraft,
} from './types';

export const createHandScorerContext = (
  game: GameState,
  playerId: PlayerId,
  outcome: HandOutcome | null,
  scoreRecord?: PlayerScoreRecord,
): HandScorerContext => {
  const player = game.players.find((candidate) => candidate.id === playerId);
  if (!player || !game.seats[playerId]) {
    throw new Error('The selected player must belong to the current game.');
  }

  return {
    playerId,
    playerName: player.name,
    playerWind: game.seats[playerId],
    prevailingWind: game.prevailingWind,
    isWinner: outcome?.type === 'win' && outcome.winnerId === playerId,
    limit: CURRENT_RULESET.defaultLimit,
    ...(scoreRecord?.source === 'detailed-scorer'
      ? { detailedHand: scoreRecord }
      : {}),
  };
};

export const applyHandScorerResult = (
  game: GameState,
  draft: RoundScoringDraft,
  result: HandScorerResult,
): {
  draft: RoundScoringDraft;
  selectedWinnerId: PlayerId | null;
} => {
  if (!game.players.some((player) => player.id === result.playerId)) {
    throw new Error('A returned hand score must belong to the current game.');
  }
  if (!Number.isFinite(result.score) || result.score < 0) {
    throw new Error('A returned hand score must be a non-negative number.');
  }
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
    selectedWinnerId: result.isWinner ? result.playerId : null,
  };
};

export const applyHandScorerSession = (
  game: GameState,
  draft: RoundScoringDraft,
  result: HandScorerResult | null,
): {
  draft: RoundScoringDraft;
  selectedWinnerId: PlayerId | null;
} =>
  result
    ? applyHandScorerResult(game, draft, result)
    : { draft, selectedWinnerId: null };

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
): HandScorerLocalContext => ({
  playerWind: context?.playerWind ?? 'east',
  prevailingWind: context?.prevailingWind ?? 'east',
  limit: context?.limit ?? CURRENT_RULESET.defaultLimit,
  isWinner: context?.isWinner ?? false,
});