import { replayGame } from "./game";
import type { Wind } from "../scoring";
import type {
  GameState,
  HandOutcome,
  RoundInput,
  RoundScoringDraft,
} from "./types";

export const GAME_SNAPSHOT_STORAGE_KEY = "bmja-mahjong-scorer/game-snapshot";
const GAME_SNAPSHOT_VERSION = 1;

type PersistedGameSnapshot = {
  version: typeof GAME_SNAPSHOT_VERSION;
  game: {
    setup: GameState["setup"];
    rounds: RoundInput[];
  };
  currentRound: {
    outcomeType: "win" | "draw";
    winnerId: string;
    draft: RoundScoringDraft;
  };
};

export type RecoveredGame = {
  game: GameState;
  outcomeType: "win" | "draw";
  winnerId: string;
  draft: RoundScoringDraft;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteAmountMap = (value: unknown, playerIds: Set<string>) =>
  isRecord(value) &&
  Object.keys(value).every(
    (playerId) => playerIds.has(playerId) && Number.isFinite(value[playerId]),
  );

const isValidScoreRecord = (value: unknown): boolean => {
  if (!isRecord(value) || !Number.isFinite(value.finalScore)) return false;
  if (value.source === "manual") return true;
  if (value.source !== "detailed-scorer") return false;
  return (
    isRecord(value.hand) &&
    Array.isArray(value.hand.sets) &&
    Array.isArray(value.hand.bonusTiles) &&
    isRecord(value.context) &&
    isRecord(value.breakdown) &&
    (value.breakdown.evidenceCompleteness === undefined ||
      value.breakdown.evidenceCompleteness === "partial" ||
      value.breakdown.evidenceCompleteness === "complete" ||
      value.breakdown.evidenceCompleteness === "invalid") &&
    Array.isArray(value.breakdown.validationErrors) &&
    Array.isArray(value.breakdown.pointRules) &&
    Array.isArray(value.breakdown.doubleRules) &&
    Array.isArray(value.breakdown.specialHands) &&
    Array.isArray(value.breakdown.calculationComponents) &&
    Number.isFinite(value.breakdown.finalScore)
  );
};

const isValidSnapshotShape = (
  value: unknown,
): value is PersistedGameSnapshot => {
  if (!isRecord(value) || value.version !== GAME_SNAPSHOT_VERSION) return false;
  if (!isRecord(value.game) || !isRecord(value.currentRound)) return false;
  if (!isRecord(value.game.setup) || !Array.isArray(value.game.rounds))
    return false;
  if (
    !Array.isArray(value.game.setup.players) ||
    value.game.setup.players.length !== 4
  )
    return false;
  const playerIds = new Set(
    value.game.setup.players.map((player) =>
      isRecord(player) && typeof player.id === "string" ? player.id : "",
    ),
  );
  if (playerIds.size !== 4 || playerIds.has("")) return false;
  if (!isFiniteAmountMap(value.game.setup.startingBalances, playerIds))
    return false;
  if (
    !isFiniteAmountMap(
      value.currentRound.draft && isRecord(value.currentRound.draft)
        ? value.currentRound.draft.scores
        : undefined,
      playerIds,
    )
  ) {
    return false;
  }
  return (
    (value.currentRound.outcomeType === "win" ||
      value.currentRound.outcomeType === "draw") &&
    typeof value.currentRound.winnerId === "string" &&
    isRecord(value.currentRound.draft) &&
    isRecord(value.currentRound.draft.scoreRecords) &&
    Object.entries(value.currentRound.draft.scoreRecords).every(
      ([playerId, record]) =>
        playerIds.has(playerId) && isValidScoreRecord(record),
    )
  );
};

const roundsFrom = (game: GameState): RoundInput[] =>
  game.handHistory.map(({ outcome, scores, scoreRecords }) => ({
    outcome,
    scores,
    scoreRecords,
  }));

export const saveGameRecovery = (
  storage: StorageLike,
  game: GameState,
  outcomeType: "win" | "draw",
  winnerId: string,
  draft: RoundScoringDraft,
): void => {
  const snapshot: PersistedGameSnapshot = {
    version: GAME_SNAPSHOT_VERSION,
    game: { setup: game.setup, rounds: roundsFrom(game) },
    currentRound: { outcomeType, winnerId, draft },
  };
  try {
    storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Browser storage may be unavailable or full; the game remains usable in memory.
  }
};

export const clearGameRecovery = (storage: StorageLike): void => {
  try {
    storage.removeItem(GAME_SNAPSHOT_STORAGE_KEY);
  } catch {
    // Clearing recovery must never interrupt the game UI.
  }
};

export const loadGameRecovery = (
  storage: StorageLike,
): RecoveredGame | null => {
  let parsed: unknown;
  try {
    const raw = storage.getItem(GAME_SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    parsed = JSON.parse(raw);
  } catch {
    clearGameRecovery(storage);
    return null;
  }

  if (!isValidSnapshotShape(parsed)) {
    clearGameRecovery(storage);
    return null;
  }

  try {
    const game = replayGame(parsed.game.setup, parsed.game.rounds);
    const { outcomeType, winnerId, draft } = parsed.currentRound;
    if (
      (outcomeType === "win" &&
        !game.players.some((player) => player.id === winnerId)) ||
      Object.keys(draft.scoreRecords).some(
        (playerId) => !game.players.some((player) => player.id === playerId),
      )
    ) {
      throw new Error("Recovered round does not match this game.");
    }
    return { game, outcomeType, winnerId, draft };
  } catch {
    clearGameRecovery(storage);
    return null;
  }
};

export const loadInProgressGameRecovery = (
  storage: StorageLike,
): RecoveredGame | null => {
  const recovered = loadGameRecovery(storage);
  if (!recovered || !recovered.game.isComplete) return recovered;
  clearGameRecovery(storage);
  return null;
};

/** The sole eligibility check for recovery actions outside the game screen. */
export const recoverableGameForReturn = (storage: StorageLike): RecoveredGame | null =>
  loadInProgressGameRecovery(storage);

const windRoundNumber: Record<Wind, number> = {
  east: 1,
  south: 2,
  west: 3,
  north: 4,
};

export const gameProgressSummary = (game: GameState): string => {
  const handInRound =
    game.handHistory.filter((hand) => hand.prevailingWind === game.prevailingWind)
      .length + 1;
  return `Round ${windRoundNumber[game.prevailingWind]} · Hand ${handInRound}`;
};
