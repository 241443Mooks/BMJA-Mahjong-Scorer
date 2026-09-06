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
): HandScorerLocalContext => ({
  playerWind: context?.playerWind ?? 'east',
  prevailingWind: context?.prevailingWind ?? 'east',
  limit: context?.limit ?? CURRENT_RULESET.defaultLimit,
  isWinner: context?.isWinner ?? false,
});