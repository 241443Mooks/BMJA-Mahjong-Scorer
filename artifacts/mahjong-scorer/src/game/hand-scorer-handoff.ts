import { CURRENT_RULESET } from './ruleset';
import type {
  GameState,
  HandOutcome,
  HandScorerContext,
  HandScorerResult,
  PlayerId,
  RoundScoreDraft,
} from './types';

export const createHandScorerContext = (
  game: GameState,
  playerId: PlayerId,
  outcome: HandOutcome | null,
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
  };
};

export const applyHandScorerResult = (
  game: GameState,
  scores: RoundScoreDraft,
  result: HandScorerResult,
): {
  scores: RoundScoreDraft;
  selectedWinnerId: PlayerId | null;
} => {
  if (!game.players.some((player) => player.id === result.playerId)) {
    throw new Error('A returned hand score must belong to the current game.');
  }
  if (!Number.isFinite(result.score) || result.score < 0) {
    throw new Error('A returned hand score must be a non-negative number.');
  }

  return {
    scores: { ...scores, [result.playerId]: result.score },
    selectedWinnerId: result.isWinner ? result.playerId : null,
  };
};