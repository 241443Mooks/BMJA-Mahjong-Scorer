import { replayGame } from "./game";
import { BMJA_PROFILE_REF } from "./ruleset";
import { getCurrentRulesRuntime } from '../rules-platform/current-runtime-registry';
import type { Wind } from "../scoring";
import type {
  GameSetup,
  GameState,
  ClassicalGameState,
  GameRoundInput,
  HandOutcome,
  McrAcceptedScoreRecord,
  McrRoundInput,
  RoundInput,
  RoundScoringDraft,
  RoundIncident,
  RulesProfileRef,
} from "./types";
import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import { validateMcrScoringInput } from '../rules-platform/mcr-scoring-input';
import type { HandScoreResult } from '../rules-platform/types';

export const GAME_SNAPSHOT_STORAGE_KEY = "bmja-mahjong-scorer/game-snapshot";
export const ACTIVE_GAME_LOCK_NAME = "bmja-mahjong-scorer/active-game-owner";
const LEGACY_GAME_SNAPSHOT_VERSION = 1;
const GAME_SNAPSHOT_VERSION = 2;
const GAME_LEDGER_VERSION = 3;

export type FinishedGameLedger = {
  id: string;
  startedAt: string;
  finishedAt: string;
  game: GameState;
};

type PersistedGameSetup = Omit<GameSetup, "rulesProfile"> & {
  rulesProfile?: RulesProfileRef;
};

type PersistedLegacyGameSnapshot = {
  version: typeof LEGACY_GAME_SNAPSHOT_VERSION;
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

export type PersistedRoundV2 =
  | { grammar: 'classical-points-doubles'; input: RoundInput }
  | { grammar: 'pattern-accumulator'; input: McrRoundInput };
export type McrRoundScoringDraft = Pick<RoundScoringDraft, 'scores' | 'scoreRecords'>;
export type PersistedCurrentRoundV2 =
  | { grammar: 'classical-points-doubles'; outcomeType?: 'win' | 'draw'; winnerId?: string; draft: RoundScoringDraft }
  | { grammar: 'pattern-accumulator'; outcomeType?: 'win' | 'draw'; winnerId?: string; winSource?: 'discard' | 'self-draw'; discarderId?: string; draft: McrRoundScoringDraft };
type PersistedGameSnapshotV2 = {
  version: typeof GAME_SNAPSHOT_VERSION;
  game: { setup: GameSetup; runtimeFingerprint: string; rounds: PersistedRoundV2[] };
  currentRound: PersistedCurrentRoundV2;
};
type PersistedFinishedLedger = {
  id: string;
  startedAt: string;
  finishedAt: string;
  game: PersistedGameSnapshotV2['game'];
};
type PersistedGameLedgerStore = {
  version: typeof GAME_LEDGER_VERSION;
  active: { id: string; startedAt: string; snapshot: PersistedGameSnapshotV2 } | null;
  finished: PersistedFinishedLedger[];
};

export type RecoveredGame = {
  game: ClassicalGameState;
  outcomeType: "win" | "draw";
  winnerId: string;
  draft: RoundScoringDraft;
};
export type RecoveredGameV2 = {
  game: GameState;
  currentRound: PersistedCurrentRoundV2;
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
): value is PersistedLegacyGameSnapshot => {
  if (!isRecord(value) || value.version !== LEGACY_GAME_SNAPSHOT_VERSION) return false;
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

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
};

const emptyLedgerStore = (): PersistedGameLedgerStore => ({ version: GAME_LEDGER_VERSION, active: null, finished: [] });
const legacyActiveSnapshot = (value: unknown): PersistedGameSnapshotV2 | null => {
  if (!isValidV2SnapshotShape(value)) return null;
  return value;
};
const readLedgerStore = (storage: StorageLike): PersistedGameLedgerStore => {
  let parsed: unknown;
  try {
    const raw = storage.getItem(GAME_SNAPSHOT_STORAGE_KEY);
    if (!raw) return emptyLedgerStore();
    parsed = JSON.parse(raw);
  } catch { return emptyLedgerStore(); }
  if (isRecord(parsed) && parsed.version === GAME_LEDGER_VERSION && Array.isArray(parsed.finished)) {
    const store = parsed as unknown as PersistedGameLedgerStore;
    const finished = store.finished.filter((entry) => isRecord(entry) && typeof entry.id === 'string' && entry.id.length > 0 && typeof entry.startedAt === 'string' && Number.isFinite(Date.parse(entry.startedAt)) && typeof entry.finishedAt === 'string' && Number.isFinite(Date.parse(entry.finishedAt)) && isRecord(entry.game) && validFinishedGame(entry.game));
    const active = isRecord(store.active) && typeof store.active.id === 'string' && typeof store.active.startedAt === 'string' && legacyActiveSnapshot(store.active.snapshot) ? store.active : null;
    return { version: GAME_LEDGER_VERSION, active, finished };
  }
  const snapshot = legacyActiveSnapshot(parsed) ?? (isRecord(parsed) && parsed.version === 1 ? parsed : null);
  if (!snapshot) return emptyLedgerStore();
  const now = new Date().toISOString();
  return {
    version: GAME_LEDGER_VERSION,
    active: { id: createLedgerId(), startedAt: now, snapshot: snapshot as PersistedGameSnapshotV2 },
    finished: [],
  };
};
const validFinishedGame = (game: unknown) => {
  return isRecord(game) && validV2Setup(game.setup) && typeof game.runtimeFingerprint === 'string' && !!game.runtimeFingerprint && Array.isArray(game.rounds);
};
const createLedgerId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const writeLedgerStore = (storage: StorageLike, store: PersistedGameLedgerStore) => {
  try { storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(store)); return true; } catch { return false; }
};

const validateMcrRecord = (
  value: unknown,
  profile: RulesProfileRef,
  fingerprint: string,
  expectedOwner?: string,
  expectedSource?: 'discard' | 'self-draw',
): value is McrAcceptedScoreRecord => {
  if (!isRecord(value) || value.source !== 'mcr-detailed-scorer' || typeof value.playerId !== 'string' || (expectedOwner && value.playerId !== expectedOwner) || !isRulesProfileRef(value.rulesProfile) || value.rulesProfile.id !== profile.id || value.rulesProfile.version !== profile.version || value.rulesFingerprint !== fingerprint || !Number.isFinite(value.finalScore) || !Number.isInteger(value.finalScore) || !isRecord(value.hand) || !Array.isArray(value.hand.sets) || !Array.isArray(value.hand.bonusTiles) || typeof value.hand.isWinner !== 'boolean' || !isRecord(value.input) || !isRecord(value.result)) return false;
  const input = value.input as Record<string, unknown>;
  if (!validateMcrScoringInput(input as never).valid) return false;
  if (expectedSource && (!isRecord(input.context) || input.context.winSource !== expectedSource)) return false;
  const result = value.result as Record<string, unknown>;
  if (result.grammar !== 'pattern-accumulator' || result.legal !== true || !isRecord(result.disposition) || result.disposition.kind !== 'scored' || !isRecord(result.profile) || result.profile.id !== profile.id || result.profile.version !== profile.version || result.rulesFingerprint !== fingerprint || !isRecord(result.result) || result.result.unit !== 'points' || !Number.isFinite(result.result.total) || !Number.isInteger(result.result.total) || value.finalScore !== result.result.total) return false;
  const compiled = getCurrentCompiledRulesRuntime(profile);
  if (compiled.grammar !== 'pattern-accumulator') return false;
  const rescored = compiled.runtime.scoreHand(input as never);
  return stableJson(rescored) === stableJson(result);
};

const validMcrRecordMap = (
  value: unknown,
  profile: RulesProfileRef,
  fingerprint: string,
  playerIds: Set<string>,
  owner?: string,
  source?: 'discard' | 'self-draw',
): boolean => isRecord(value) && Object.entries(value).length <= 1 && Object.entries(value).every(([playerId, record]) => playerIds.has(playerId) && isRecord(record) && playerId === record.playerId && (!owner || playerId === owner) && validateMcrRecord(record, profile, fingerprint, playerId, source));

const isValidMcrRoundInput = (value: unknown, setup: GameSetup, fingerprint: string): value is McrRoundInput => {
  if (!isRecord(value) || !isRecord(value.mcrOutcome) || !isFiniteAmountMap(value.scores, new Set(setup.players.map(({ id }) => id)))) return false;
  const raw = value as Record<string, unknown>;
  const outcome = raw.mcrOutcome as Record<string, unknown>;
  const scores = raw.scores as Record<string, number>;
  const ids = new Set(setup.players.map(({ id }) => id));
  if (Object.keys(scores).length !== ids.size) return false;
  if (outcome.type === 'mcr-draw') return Object.values(scores).every((score) => score === 0) && (!raw.scoreRecords || isRecord(raw.scoreRecords) && Object.keys(raw.scoreRecords).length === 0);
  if (outcome.type !== 'mcr-win' || typeof outcome.winnerId !== 'string' || !ids.has(outcome.winnerId) || !['discard', 'self-draw'].includes(outcome.winSource as string)) return false;
  const winner = outcome.winnerId;
  if (outcome.winSource === 'discard' ? typeof outcome.discarderId !== 'string' || !ids.has(outcome.discarderId) || winner === outcome.discarderId : outcome.discarderId !== undefined) return false;
  return isRecord(raw.scoreRecords) && Object.keys(raw.scoreRecords).length === 1 && validateMcrRecord(raw.scoreRecords[winner], setup.rulesProfile, fingerprint, winner, outcome.winSource as 'discard' | 'self-draw') && scores[winner] === (raw.scoreRecords[winner] as McrAcceptedScoreRecord).finalScore && Object.entries(scores).every(([id, score]) => id === winner || score === 0);
};

const validV2Setup = (value: unknown): value is GameSetup => {
  if (!isRecord(value) || !isRulesProfileRef(value.rulesProfile) || !Array.isArray(value.players) || value.players.length !== 4 || !isRecord(value.startingSeats) || !isRecord(value.startingBalances) || !['east', 'south', 'west', 'north'].includes(value.startingPrevailingWind as string) || !['one-round', 'full-game'].includes(value.gameLength as string)) return false;
  const playerIds = new Set(value.players.map((player) => isRecord(player) && typeof player.id === 'string' ? player.id : ''));
  if (playerIds.size !== 4 || playerIds.has('') || !isFiniteAmountMap(value.startingBalances, playerIds) || Object.keys(value.startingBalances).length !== 4 || Object.keys(value.startingSeats).length !== 4 || !Object.keys(value.startingSeats).every((id) => playerIds.has(id)) || !Object.values(value.startingSeats).every((wind) => ['east', 'south', 'west', 'north'].includes(wind as string)) || new Set(Object.values(value.startingSeats)).size !== 4) return false;
  if (value.players.some((player) => !isRecord(player) || typeof player.name !== 'string' || !player.name.trim())) return false;
  if ('tableLimit' in value && (!Number.isFinite(value.tableLimit) || (value.tableLimit as number) <= 0)) return false;
  return true;
};

const isValidV2SnapshotShape = (value: unknown): value is PersistedGameSnapshotV2 => {
  if (!isRecord(value) || value.version !== GAME_SNAPSHOT_VERSION || !isRecord(value.game) || !validV2Setup(value.game.setup) || typeof value.game.runtimeFingerprint !== 'string' || !value.game.runtimeFingerprint || !Array.isArray(value.game.rounds) || !isRecord(value.currentRound)) return false;
  const snapshot = value as unknown as PersistedGameSnapshotV2;
  const setup = snapshot.game.setup;
  const players = new Set(setup.players.map(({ id }) => id));
  if (!isFiniteAmountMap(snapshot.currentRound.draft && isRecord(snapshot.currentRound.draft) ? snapshot.currentRound.draft.scores : undefined, players)) return false;
  if (!isRecord(snapshot.currentRound.draft) || !isRecord(snapshot.currentRound.draft.scoreRecords)) return false;
  let compiled;
  try { compiled = getCurrentCompiledRulesRuntime(setup.rulesProfile); } catch { return false; }
  if (compiled.artifact.rulesFingerprint !== snapshot.game.runtimeFingerprint) return false;
  const grammar = compiled.grammar;
  if (('tableLimit' in setup) !== (grammar === 'classical-points-doubles')) return false;
  if (grammar === 'classical-points-doubles') {
    const { outcomeType, winnerId } = snapshot.currentRound;
    const hasDraftScores = Object.keys(snapshot.currentRound.draft.scores).length > 0;
    const hasScoreRecords = Object.keys(snapshot.currentRound.draft.scoreRecords).length > 0;
    if (snapshot.currentRound.grammar !== grammar || (outcomeType !== undefined && !['win', 'draw'].includes(outcomeType)) || (winnerId !== undefined && (typeof winnerId !== 'string' || !players.has(winnerId))) || (outcomeType === undefined && (winnerId !== undefined || hasDraftScores || hasScoreRecords)) || (outcomeType === 'win' && winnerId === undefined && (hasDraftScores || hasScoreRecords)) || Object.entries(snapshot.currentRound.draft.scoreRecords).some(([id, record]) => !players.has(id) || !isValidScoreRecord(record))) return false;
    if (snapshot.currentRound.draft.incidents !== undefined && (!Array.isArray(snapshot.currentRound.draft.incidents) || !snapshot.currentRound.draft.incidents.every((incident) => isValidIncident(incident, players)))) return false;
    if (snapshot.currentRound.draft.buzzardIncidents !== undefined && (!Array.isArray(snapshot.currentRound.draft.buzzardIncidents) || !snapshot.currentRound.draft.buzzardIncidents.every((incident) => isValidBuzzardIncident(incident, players)))) return false;
    if (snapshot.currentRound.draft.profileScoreResults !== undefined && !isValidProfileResults(snapshot.currentRound.draft.profileScoreResults, players)) return false;
  } else {
    if (Object.keys(snapshot.currentRound).some((key) => !['grammar', 'outcomeType', 'winnerId', 'winSource', 'discarderId', 'draft'].includes(key)) || Object.keys(snapshot.currentRound.draft).some((key) => !['scores', 'scoreRecords'].includes(key))) return false;
    if (snapshot.currentRound.grammar !== grammar || (snapshot.currentRound.outcomeType !== undefined && !['win', 'draw'].includes(snapshot.currentRound.outcomeType as string)) || (snapshot.currentRound.winnerId !== undefined && (typeof snapshot.currentRound.winnerId !== 'string' || !players.has(snapshot.currentRound.winnerId))) || (snapshot.currentRound.winSource !== undefined && !['discard', 'self-draw'].includes(snapshot.currentRound.winSource as string)) || (snapshot.currentRound.discarderId !== undefined && (typeof snapshot.currentRound.discarderId !== 'string' || !players.has(snapshot.currentRound.discarderId)))) return false;
    if (snapshot.currentRound.outcomeType === 'draw' && (snapshot.currentRound.winnerId !== undefined || snapshot.currentRound.winSource !== undefined || snapshot.currentRound.discarderId !== undefined || Object.keys(snapshot.currentRound.draft.scoreRecords).length > 0)) return false;
    if (snapshot.currentRound.winSource === 'discard' && snapshot.currentRound.winnerId !== undefined && snapshot.currentRound.discarderId !== undefined && snapshot.currentRound.winnerId === snapshot.currentRound.discarderId) return false;
    if (snapshot.currentRound.winSource === 'self-draw' && snapshot.currentRound.discarderId !== undefined) return false;
    const owner = snapshot.currentRound.winnerId;
    const source = snapshot.currentRound.winSource;
    if (!validMcrRecordMap(snapshot.currentRound.draft.scoreRecords, setup.rulesProfile, snapshot.game.runtimeFingerprint, players, owner, source)) return false;
  }
  return snapshot.game.rounds.every((round) => isRecord(round) && (grammar === 'classical-points-doubles' ? round.grammar === grammar && isValidSnapshotShape({ version: 1, game: { setup, rounds: [round.input] }, currentRound: { outcomeType: 'draw', winnerId: setup.players[0]!.id, draft: { scores: {}, scoreRecords: {} } } }) : round.grammar === grammar && isValidMcrRoundInput(round.input, setup, snapshot.game.runtimeFingerprint)));
};

const normalisePersistedSetup = (setup: PersistedGameSetup): ClassicalGameState['setup'] => ({
  ...setup,
  rulesProfile: { ...(setup.rulesProfile ?? BMJA_PROFILE_REF) },
  tableLimit: typeof setup.tableLimit === 'number' && Number.isFinite(setup.tableLimit) && setup.tableLimit > 0
    ? setup.tableLimit
    : getCurrentRulesRuntime(setup.rulesProfile ?? BMJA_PROFILE_REF).defaultTableLimit,
});

const roundsFrom = (game: GameState): PersistedRoundV2[] => game.handHistory.map((hand) => {
  if (hand.mcrReplay) return { grammar: 'pattern-accumulator', input: structuredClone(hand.mcrReplay) };
  return { grammar: 'classical-points-doubles', input: {
    outcome: hand.outcome as HandOutcome, scores: { ...hand.scores }, scoreRecords: structuredClone(hand.scoreRecords),
    incidents: structuredClone(hand.incidents), buzzardIncidents: structuredClone(hand.buzzardIncidents), profileScoreResults: structuredClone(hand.profileScoreResults),
  } };
});

export const saveGameRecoveryV2 = (storage: StorageLike, game: GameState, currentRound: PersistedCurrentRoundV2): boolean => {
  const snapshot: PersistedGameSnapshotV2 = {
    version: GAME_SNAPSHOT_VERSION,
    game: { setup: structuredClone(game.setup), runtimeFingerprint: game.runtimeFingerprint, rounds: roundsFrom(game) },
    currentRound: structuredClone(currentRound),
  };
  const store = readLedgerStore(storage);
  const active = store.active && store.active.snapshot.game.setup.players.map(({ id }) => id).join('|') === game.setup.players.map(({ id }) => id).join('|') && store.active.snapshot.game.setup.rulesProfile.id === game.setup.rulesProfile.id
    ? { ...store.active, snapshot }
    : { id: createLedgerId(), startedAt: new Date().toISOString(), snapshot };
  return writeLedgerStore(storage, { ...store, active });
};

export const finishGameLedger = (storage: StorageLike, game: GameState, currentRound: PersistedCurrentRoundV2): boolean => {
  if (!game.isComplete) return false;
  const store = readLedgerStore(storage);
  const active = store.active;
  const snapshot: PersistedGameSnapshotV2 = {
    version: GAME_SNAPSHOT_VERSION,
    game: { setup: structuredClone(game.setup), runtimeFingerprint: game.runtimeFingerprint, rounds: roundsFrom(game) },
    currentRound: structuredClone(currentRound),
  };
  try {
    const replayed = replayGame(snapshot.game.setup, snapshot.game.rounds.map(({ input }) => input));
    if (!replayed.isComplete) return false;
    const id = active?.id ?? createLedgerId();
    if (!active && store.finished.some((entry) => stableJson(entry.game) === stableJson(snapshot.game))) return true;
    if (!store.finished.some((entry) => entry.id === id)) {
      store.finished.unshift({ id, startedAt: active?.startedAt ?? new Date().toISOString(), finishedAt: new Date().toISOString(), game: snapshot.game });
    }
    return writeLedgerStore(storage, { ...store, active: null });
  } catch { return false; }
};

export const reopenFinishedGameAfterUndo = (
  storage: StorageLike,
  completedGame: GameState,
  undoneGame: GameState,
  currentRound: PersistedCurrentRoundV2,
): boolean => {
  if (!completedGame.isComplete || undoneGame.isComplete || completedGame.handHistory.length !== undoneGame.handHistory.length + 1) return false;
  const completedRecord = { setup: structuredClone(completedGame.setup), runtimeFingerprint: completedGame.runtimeFingerprint, rounds: roundsFrom(completedGame) };
  const undoneSnapshot: PersistedGameSnapshotV2 = {
    version: GAME_SNAPSHOT_VERSION,
    game: { setup: structuredClone(undoneGame.setup), runtimeFingerprint: undoneGame.runtimeFingerprint, rounds: roundsFrom(undoneGame) },
    currentRound: structuredClone(currentRound),
  };
  const persistedJson = (value: unknown) => stableJson(JSON.parse(JSON.stringify(value)));
  if (persistedJson(undoneSnapshot.game.rounds) !== persistedJson(completedRecord.rounds.slice(0, -1))) return false;
  const store = readLedgerStore(storage);
  const finished = store.finished.find((entry) => persistedJson(entry.game) === persistedJson(completedRecord));
  if (!finished) return false;
  const active = { id: finished.id, startedAt: finished.startedAt, snapshot: undoneSnapshot };
  return writeLedgerStore(storage, { ...store, active, finished: store.finished.filter((entry) => entry.id !== finished.id) });
};

export const loadFinishedGameLedgers = (storage: StorageLike): FinishedGameLedger[] => {
  const store = readLedgerStore(storage);
  return store.finished.flatMap((entry) => {
    try {
      const compiled = getCurrentCompiledRulesRuntime(entry.game.setup.rulesProfile);
      if (compiled.artifact.rulesFingerprint !== entry.game.runtimeFingerprint) return [];
      const game = replayGame(entry.game.setup, entry.game.rounds.map(({ input }) => input));
      if (!game.isComplete) return [];
      return [{ id: entry.id, startedAt: entry.startedAt, finishedAt: entry.finishedAt, game }];
    } catch { return []; }
  });
};

export const loadFinishedGameLedger = (storage: StorageLike, id: string): FinishedGameLedger | null =>
  loadFinishedGameLedgers(storage).find((entry) => entry.id === id) ?? null;

export const saveGameRecovery = (
  storage: StorageLike,
  game: GameState,
  outcomeType: "win" | "draw",
  winnerId: string,
  draft: RoundScoringDraft,
): void => {
  const grammar = getCurrentCompiledRulesRuntime(game.setup.rulesProfile).grammar;
  if (grammar !== 'classical-points-doubles') return;
  saveGameRecoveryV2(storage, game, { grammar, outcomeType, winnerId, draft: structuredClone(draft) });
};

export const clearGameRecovery = (storage: StorageLike): void => {
  try {
    const store = readLedgerStore(storage);
    if (store.finished.length) writeLedgerStore(storage, { ...store, active: null });
    else storage.removeItem(GAME_SNAPSHOT_STORAGE_KEY);
  } catch {
    // Clearing recovery must never interrupt the game UI.
  }
};

const readSnapshot = (storage: StorageLike): unknown | null => {
  let parsed: unknown;
  try {
    const raw = storage.getItem(GAME_SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    parsed = JSON.parse(raw);
  } catch {
    clearGameRecovery(storage);
    return null;
  }
  if (isRecord(parsed) && parsed.version === GAME_LEDGER_VERSION) {
    if (!Array.isArray(parsed.finished) || parsed.active !== null && !isRecord(parsed.active)) { clearGameRecovery(storage); return null; }
    return isRecord(parsed.active) ? parsed.active.snapshot : null;
  }
  return parsed;
};

const recoverLegacyV1 = (storage: StorageLike, parsed: unknown): RecoveredGame | null => {
  if (!isValidSnapshotShape(parsed)) { clearGameRecovery(storage); return null; }
  try {
    const game = replayGame(normalisePersistedSetup(parsed.game.setup), parsed.game.rounds);
    const { outcomeType, winnerId, draft } = parsed.currentRound;
    if ((outcomeType === 'win' && !game.players.some((player) => player.id === winnerId)) || Object.keys(draft.scoreRecords).some((playerId) => !game.players.some((player) => player.id === playerId))) throw new Error('Recovered round does not match this game.');
    return { game, outcomeType, winnerId, draft };
  } catch { clearGameRecovery(storage); return null; }
};

export const loadGameRecoveryCore = (storage: StorageLike): RecoveredGameV2 | null => {
  const parsed = readSnapshot(storage);
  if (parsed === null) return null;
  if (isRecord(parsed) && parsed.version === LEGACY_GAME_SNAPSHOT_VERSION) {
    const legacy = recoverLegacyV1(storage, parsed);
    return legacy ? { game: legacy.game, currentRound: { grammar: 'classical-points-doubles', outcomeType: legacy.outcomeType, winnerId: legacy.winnerId, draft: legacy.draft } } : null;
  }
  if (!isValidV2SnapshotShape(parsed)) { clearGameRecovery(storage); return null; }
  try {
    const runtime = getCurrentCompiledRulesRuntime(parsed.game.setup.rulesProfile);
    if (runtime.artifact.rulesFingerprint !== parsed.game.runtimeFingerprint) throw new Error('Persisted runtime fingerprint mismatch.');
    const inputs: GameRoundInput[] = parsed.game.rounds.map((round) => round.input);
    const game = replayGame(parsed.game.setup, inputs);
    if (game.runtimeFingerprint !== parsed.game.runtimeFingerprint) throw new Error('Recovered runtime fingerprint mismatch.');
    if (parsed.currentRound.grammar === 'pattern-accumulator') {
      for (const record of Object.values(parsed.currentRound.draft.scoreRecords)) {
        if (!record || record.source !== 'mcr-detailed-scorer') continue;
        if ((record.input.context.seatWind !== undefined && record.input.context.seatWind !== game.seats[record.playerId]) || (record.input.context.prevailingWind !== undefined && record.input.context.prevailingWind !== game.prevailingWind)) throw new Error('Active MCR score table context does not match the recovered game.');
      }
    }
    return { game, currentRound: parsed.currentRound };
  } catch { clearGameRecovery(storage); return null; }
};

export const loadGameRecovery = (storage: StorageLike): RecoveredGame | null => {
  const core = loadGameRecoveryCore(storage);
  if (!core || core.currentRound.grammar !== 'classical-points-doubles') return null;
  if (!core.currentRound.outcomeType || !core.currentRound.winnerId) return null;
  if (getCurrentCompiledRulesRuntime(core.game.setup.rulesProfile).grammar !== 'classical-points-doubles' || core.game.setup.tableLimit === undefined) return null;
  return { game: core.game as ClassicalGameState, outcomeType: core.currentRound.outcomeType, winnerId: core.currentRound.winnerId, draft: core.currentRound.draft };
};

export const loadInProgressGameRecoveryCore = (storage: StorageLike): RecoveredGameV2 | null => {
  const recovered = loadGameRecoveryCore(storage);
  if (!recovered || !recovered.game.isComplete) return recovered;
  clearGameRecovery(storage);
  return null;
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
export const recoverableGameForReturn = (storage: StorageLike): RecoveredGameV2 | null =>
  loadInProgressGameRecoveryCore(storage);

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
