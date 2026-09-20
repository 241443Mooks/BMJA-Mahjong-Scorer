import { replayGame } from "./game";
import { BMJA_PROFILE_REF } from "./ruleset";
import { getCurrentRulesRuntime } from '../rules-platform/current-runtime-registry';
import type { Wind } from "../scoring";
import type {
  GameSetup,
  GameState,
  HandOutcome,
  RoundInput,
  RoundScoringDraft,
  RoundIncident,
  RulesProfileRef,
} from "./types";

export const GAME_SNAPSHOT_STORAGE_KEY = "bmja-mahjong-scorer/game-snapshot";
const GAME_SNAPSHOT_VERSION = 1;

type PersistedGameSetup = Omit<GameSetup, "rulesProfile"> & {
  rulesProfile?: RulesProfileRef;
};

type PersistedGameSnapshot = {
  version: typeof GAME_SNAPSHOT_VERSION;
  game: {
    setup: PersistedGameSetup;
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

const isRulesProfileRef = (value: unknown): value is RulesProfileRef =>
  isRecord(value) &&
  typeof value.id === "string" &&
  value.id.length > 0 &&
  typeof value.version === "string" &&
  value.version.length > 0;

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
const isValidIncident = (value: unknown, playerIds: Set<string>): value is RoundIncident => {
  if (!isRecord(value) || typeof value.type !== 'string') return false;
  const has = (key: string) => typeof value[key] === 'string' && playerIds.has(value[key] as string);
  if (value.type === 'incorrect-hand') return has('playerId') && (value.condition === 'too-few' || value.condition === 'too-many');
  if (value.type === 'false-discard-name') return has('discarderId') && has('claimantId') && (value.result === 'claimed' || value.result === 'mah-jong');
  if (value.type === 'false-mah-jong') return has('declarerId') && typeof value.anyHandExposed === 'boolean';
  if (value.type === 'wrong-tile-claim') return has('playerId') && typeof value.correctedBeforeNextDraw === 'boolean';
  return value.type === 'cannon' && has('liablePlayerId') && typeof value.noChoiceAccepted === 'boolean' &&
    (value.danger === undefined || ['third-dragon', 'fourth-wind', 'honours', 'majors', 'one-suit'].includes(value.danger as string));
};
const isValidBuzzardIncident = (value: unknown, playerIds: Set<string>) => isRecord(value) && (
  (value.type === 'buzzard-dangerous-discard' && typeof value.liablePlayerId === 'string' && playerIds.has(value.liablePlayerId) && ['one-suit', 'three-dragons', 'all-winds', 'ones-and-nines'].includes(value.reason as string)) ||
  (value.type === 'buzzard-false-mah-jong' && typeof value.declarerId === 'string' && playerIds.has(value.declarerId) && ['fully-exposed', 'not-fully-exposed'].includes(value.exposure as string))
);
const isValidProfileResults = (value: unknown, playerIds: Set<string>) => isRecord(value) && Object.entries(value).every(([playerId, result]) => playerIds.has(playerId) && isRecord(result) && ['buzzard.incomplete-four-wind-limit', 'buzzard.incomplete-three-dragon-limit'].includes(result.resultId as string));

const isValidSnapshotShape = (
  value: unknown,
): value is PersistedGameSnapshot => {
  if (!isRecord(value) || value.version !== GAME_SNAPSHOT_VERSION) return false;
  if (!isRecord(value.game) || !isRecord(value.currentRound)) return false;
  if (!isRecord(value.game.setup) || !Array.isArray(value.game.rounds))
    return false;
  if (
    value.game.setup.rulesProfile !== undefined &&
    !isRulesProfileRef(value.game.setup.rulesProfile)
  )
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
  if ('tableLimit' in value.game.setup && (!Number.isFinite(value.game.setup.tableLimit) || (value.game.setup.tableLimit as number) <= 0)) return false;
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
  if (!value.game.rounds.every((round) => isRecord(round) && (!round.incidents || Array.isArray(round.incidents) && round.incidents.every((incident) => isValidIncident(incident, playerIds))) && (!round.buzzardIncidents || Array.isArray(round.buzzardIncidents) && round.buzzardIncidents.every((incident) => isValidBuzzardIncident(incident, playerIds))) && (!round.profileScoreResults || isValidProfileResults(round.profileScoreResults, playerIds)))) return false;
  return (
    (value.currentRound.outcomeType === "win" ||
      value.currentRound.outcomeType === "draw") &&
    typeof value.currentRound.winnerId === "string" &&
    isRecord(value.currentRound.draft) &&
    isRecord(value.currentRound.draft.scoreRecords) &&
    Object.entries(value.currentRound.draft.scoreRecords).every(
      ([playerId, record]) =>
        playerIds.has(playerId) && isValidScoreRecord(record),
    ) &&
    (value.currentRound.draft.incidents === undefined || (Array.isArray(value.currentRound.draft.incidents) && value.currentRound.draft.incidents.every((incident) => isValidIncident(incident, playerIds))))
  );
};

const normalisePersistedSetup = (setup: PersistedGameSetup): GameSetup => ({
  ...setup,
  rulesProfile: { ...(setup.rulesProfile ?? BMJA_PROFILE_REF) },
  tableLimit: typeof setup.tableLimit === 'number' && Number.isFinite(setup.tableLimit) && setup.tableLimit > 0
    ? setup.tableLimit
    : getCurrentRulesRuntime(setup.rulesProfile ?? BMJA_PROFILE_REF).defaultTableLimit,
});

const roundsFrom = (game: GameState): RoundInput[] =>
  game.handHistory.map(({ outcome, scores, scoreRecords, incidents, buzzardIncidents, profileScoreResults }) => ({
    outcome,
    scores,
    scoreRecords,
    incidents,
    buzzardIncidents,
    profileScoreResults,
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
    const game = replayGame(
      normalisePersistedSetup(parsed.game.setup),
      parsed.game.rounds,
    );
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
