import { beforeAll, describe, expect, it } from "vitest";
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { confirmHand, createBmjaGame, undoLastHand } from "./game";
import {
  clearGameRecovery,
  GAME_SNAPSHOT_STORAGE_KEY,
  gameProgressSummary,
  loadGameRecovery,
  loadInProgressGameRecovery,
  recoverableGameForReturn,
  saveGameRecovery,
} from "./persistence";
import { BMJA_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, WESTERN_TM_PROFILE_REF } from "./ruleset";
import { BUZZARD_2000_PROFILE_REF } from './buzzard-2000';

beforeAll(() => initialiseCurrentRulesRuntimes());

const memoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
};

const newGame = () =>
  createBmjaGame(
    [
      { id: "east", name: "East" },
      { id: "south", name: "South" },
      { id: "west", name: "West" },
      { id: "north", name: "North" },
    ],
    { east: "east", south: "south", west: "west", north: "north" },
    undefined,
    "full-game",
  );

describe("game recovery persistence", () => {
  it('migrates a missing Buzzard limit to 600 and rejects an explicit invalid limit', () => {
    const storage = memoryStorage();
    const buzzard = createBmjaGame(newGame().players, newGame().seats, undefined, 'full-game', BUZZARD_2000_PROFILE_REF);
    saveGameRecovery(storage, buzzard, 'win', 'east', { scores: {}, scoreRecords: {} });
    const snapshot = JSON.parse(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)!);
    snapshot.version = 1;
    snapshot.game.rounds = snapshot.game.rounds.map((round: { input: unknown }) => round.input);
    delete snapshot.game.setup.tableLimit;
    storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
    expect(loadGameRecovery(storage)?.game.setup.tableLimit).toBe(600);
    snapshot.game.setup.tableLimit = 0;
    storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
    expect(loadGameRecovery(storage)).toBeNull();
  });
  it('preserves a non-default Buzzard limit and exceptional liability through recovery, replay, and undo', () => {
    const storage = memoryStorage();
    const setup = createBmjaGame(newGame().players, newGame().seats, undefined, 'full-game', BUZZARD_2000_PROFILE_REF, 725);
    const confirmed = confirmHand(setup, {
      outcome: { type: 'win', winnerId: 'east' }, scores: { east: 100, south: 30, west: 20, north: 10 },
      buzzardIncidents: [{ type: 'buzzard-dangerous-discard', liablePlayerId: 'south', reason: 'one-suit' }],
    });
    saveGameRecovery(storage, confirmed, 'win', 'east', { scores: {}, scoreRecords: {} });
    const recovered = loadGameRecovery(storage)!.game;
    expect(recovered.setup.tableLimit).toBe(725);
    expect(recovered.handHistory[0].settlement).toEqual(confirmed.handHistory[0].settlement);
    expect(recovered.handHistory[0].settlement.transactions.map(({ reason }) => reason)).toEqual(['buzzard-dangerous-discard-liability', 'buzzard-dangerous-discard-liability', 'buzzard-dangerous-discard-liability']);
    expect(undoLastHand(recovered).setup.tableLimit).toBe(725);
  });
  it('restores active Buzzard incident and profile-result drafts without replacing profile identity', () => {
    const storage = memoryStorage();
    const game = createBmjaGame(newGame().players, newGame().seats, undefined, 'full-game', BUZZARD_2000_PROFILE_REF, 725);
    saveGameRecovery(storage, game, 'win', 'east', { scores: { east: 100, south: 725, west: 0, north: 0 }, scoreRecords: {}, buzzardIncidents: [], profileScoreResults: { south: { resultId: 'buzzard.incomplete-four-wind-limit' } } });
    const recovered = loadGameRecovery(storage)!;
    expect(recovered.game.setup).toMatchObject({ rulesProfile: BUZZARD_2000_PROFILE_REF, tableLimit: 725 });
    expect(recovered.draft.profileScoreResults).toEqual({ south: { resultId: 'buzzard.incomplete-four-wind-limit' } });
  });
  it('rejects Buzzard-only evidence under Outside the Box orchestration', () => {
    const otb = createBmjaGame(newGame().players, newGame().seats, undefined, 'full-game', OUTSIDE_THE_BOX_PROFILE_REF);
    expect(() => confirmHand(otb, { outcome: { type: 'win', winnerId: 'east' }, scores: { east: 100, south: 0, west: 0, north: 0 }, buzzardIncidents: [{ type: 'buzzard-dangerous-discard', liablePlayerId: 'south', reason: 'one-suit' }] })).toThrow('does not support Buzzard round evidence');
  });
  it("validates Cannon danger while preserving valid incident evidence", () => {
    const storage = memoryStorage();
    const otb = createBmjaGame(newGame().players, newGame().seats, undefined, 'full-game', OUTSIDE_THE_BOX_PROFILE_REF);
    const confirmed = confirmHand(otb, { outcome: { type: 'win', winnerId: 'east' }, scores: { east: 100, south: 0, west: 0, north: 0 }, incidents: [{ type: 'cannon', liablePlayerId: 'south', danger: 'one-suit', noChoiceAccepted: true }] });
    saveGameRecovery(storage, confirmed, 'win', 'east', { scores: {}, scoreRecords: {}, incidents: [{ type: 'cannon', liablePlayerId: 'south', noChoiceAccepted: true }] });
    expect(loadGameRecovery(storage)?.game.handHistory[0].incidents[0]).toMatchObject({ danger: 'one-suit' });
    const malformed = JSON.parse(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)!);
    malformed.currentRound.draft.incidents[0].danger = 'invented-danger';
    storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(malformed));
    expect(loadGameRecovery(storage)).toBeNull();
  });
  it("saves and restores the replayed game plus the active round draft", () => {
    const storage = memoryStorage();
    const game = confirmHand(newGame(), {
      outcome: { type: "win", winnerId: "east" },
      scores: { east: 200, south: 100, west: 100, north: 100 },
      scoreRecords: {
        east: {
          source: "detailed-scorer",
          finalScore: 200,
          hand: {
            sets: [],
            bonusTiles: [],
            isWinner: true,
            winningMethod: "wall",
          },
          context: { playerWind: "east", prevailingWind: "east", limit: 1000 },
          breakdown: {
            valid: true,
            evidenceCompleteness: "complete",
            validationErrors: [],
            pointRules: [],
            doubleRules: [],
            specialHands: [],
            basePoints: 200,
            doubles: 0,
            uncappedScore: 200,
            finalScore: 200,
            limitApplied: false,
            scoringMode: "standard",
            calculationComponents: [],
          },
        },
      },
    });
    saveGameRecovery(storage, game, "win", "south", {
      scores: { south: 88 },
      scoreRecords: { south: { source: "manual", finalScore: 88 } },
    });

    expect(loadGameRecovery(storage)).toMatchObject({
      game: {
        setup: { rulesProfile: BMJA_PROFILE_REF },
        balances: game.balances,
        handHistory: game.handHistory,
      },
      outcomeType: "win",
      winnerId: "south",
      draft: { scores: { south: 88 } },
    });
  });

  it("persists the exact rules profile identity with new saves", () => {
    const storage = memoryStorage();
    const game = newGame();
    saveGameRecovery(storage, game, "win", "east", {
      scores: {},
      scoreRecords: {},
    });

    const saved = JSON.parse(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)!);
    expect(saved.version).toBe(2);
    expect(saved.game.setup.rulesProfile).toEqual(BMJA_PROFILE_REF);
    expect(saved.game.runtimeFingerprint).toBe(game.runtimeFingerprint);
    expect(saved.game.rounds).toEqual([]);
    expect(saved.currentRound.grammar).toBe('classical-points-doubles');
    expect(loadGameRecovery(storage)?.game.runtimeFingerprint).toBe(game.runtimeFingerprint);
  });

  it("recovers legacy v1 snapshots without profile metadata as BMJA 1.0", () => {
    const storage = memoryStorage();
    const confirmed = confirmHand(newGame(), { outcome: { type: 'win', winnerId: 'east' }, scores: { east: 0, south: 0, west: 0, north: 0 } });
    saveGameRecovery(storage, confirmed, "win", "east", {
      scores: {},
      scoreRecords: {},
    });
    const legacy = JSON.parse(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)!);
    legacy.version = 1;
    legacy.game.rounds = legacy.game.rounds.map((round: { input: unknown }) => round.input);
    delete legacy.game.setup.rulesProfile;
    storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(legacy));

    const recovered = loadGameRecovery(storage);
    expect(recovered?.game.setup.rulesProfile).toEqual(BMJA_PROFILE_REF);
    expect(recovered?.game.rulesetId).toBe("bmja");
    expect(recovered?.game.handHistory).toEqual(confirmed.handHistory);
  });

  it('keeps valid legacy v1 profile snapshots readable without rewriting them', () => {
    for (const profile of [BMJA_PROFILE_REF, WESTERN_TM_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, BUZZARD_2000_PROFILE_REF]) {
      const storage = memoryStorage();
      const setup = createBmjaGame(newGame().players, newGame().seats, undefined, 'full-game', profile);
      const game = confirmHand(setup, { outcome: { type: 'win', winnerId: 'east' }, scores: { east: 0, south: 0, west: 0, north: 0 } });
      saveGameRecovery(storage, game, 'win', 'east', { scores: {}, scoreRecords: {} });
      const snapshot = JSON.parse(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)!);
      snapshot.version = 1;
      delete snapshot.game.runtimeFingerprint;
      snapshot.game.rounds = snapshot.game.rounds.map((round: { input: unknown }) => round.input);
      storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
      const original = storage.getItem(GAME_SNAPSHOT_STORAGE_KEY);
      expect(loadGameRecovery(storage)?.game.setup.rulesProfile).toEqual(profile);
      expect(loadGameRecovery(storage)?.game.handHistory).toEqual(game.handHistory);
      expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBe(original);
    }
  });

  it("does not silently replace an unknown saved profile with BMJA", () => {
    const storage = memoryStorage();
    saveGameRecovery(storage, newGame(), "win", "east", {
      scores: {},
      scoreRecords: {},
    });
    const saved = JSON.parse(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)!);
    saved.game.setup.rulesProfile = { id: "bmja", version: "999" };
    storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(saved));

    expect(loadGameRecovery(storage)).toBeNull();
    expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();

    const legacyStorage = memoryStorage();
    saveGameRecovery(legacyStorage, newGame(), 'win', 'east', { scores: {}, scoreRecords: {} });
    const legacy = JSON.parse(legacyStorage.getItem(GAME_SNAPSHOT_STORAGE_KEY)!);
    legacy.version = 1;
    delete legacy.game.runtimeFingerprint;
    legacy.game.rounds = legacy.game.rounds.map((round: { input: unknown }) => round.input);
    legacy.game.setup.rulesProfile = { id: 'bmja', version: '999' };
    legacyStorage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(legacy));
    expect(loadGameRecovery(legacyStorage)).toBeNull();
    expect(legacyStorage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it("clears a saved game for intentional start-over/new-game actions", () => {
    const storage = memoryStorage();
    saveGameRecovery(storage, newGame(), "win", "east", {
      scores: {},
      scoreRecords: {},
    });
    clearGameRecovery(storage);
    expect(loadGameRecovery(storage)).toBeNull();
  });

  it("discards malformed snapshots without preventing a new game", () => {
    const storage = memoryStorage();
    storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, "{not-json");
    expect(loadGameRecovery(storage)).toBeNull();
    expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it("discards incompatible schema versions", () => {
    const storage = memoryStorage();
    storage.setItem(
      GAME_SNAPSHOT_STORAGE_KEY,
      JSON.stringify({ version: 999 }),
    );
    expect(loadGameRecovery(storage)).toBeNull();
    expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it("discards malformed current detailed-hand data", () => {
    const storage = memoryStorage();
    saveGameRecovery(storage, newGame(), "win", "east", {
      scores: { east: 100 },
      scoreRecords: { east: { source: "manual", finalScore: 100 } },
    });
    const saved = JSON.parse(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)!);
    saved.currentRound.draft.scoreRecords.east = {
      source: "detailed-scorer",
      finalScore: 100,
    };
    storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(saved));

    expect(loadGameRecovery(storage)).toBeNull();
    expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it("derives the recovered round and hand progress from game state", () => {
    const afterFirstHand = confirmHand(newGame(), {
      outcome: { type: "win", winnerId: "east" },
      scores: { east: 0, south: 0, west: 0, north: 0 },
    });

    expect(gameProgressSummary(afterFirstHand)).toBe("Round 1 · Hand 2");
  });

  it("clears completed games instead of offering recovery", () => {
    const storage = memoryStorage();
    let game = newGame();
    for (let hand = 0; hand < 16; hand += 1) {
      const south = Object.entries(game.seats).find(
        ([, wind]) => wind === "south",
      );
      game = confirmHand(game, {
        outcome: { type: "win", winnerId: south![0] },
        scores: { east: 0, south: 0, west: 0, north: 0 },
      });
    }
    expect(game.isComplete).toBe(true);
    saveGameRecovery(storage, game, "win", "east", {
      scores: {},
      scoreRecords: {},
    });

    expect(loadInProgressGameRecovery(storage)).toBeNull();
    expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it("reads a recoverable game without changing its saved snapshot", () => {
    const storage = memoryStorage();
    saveGameRecovery(storage, newGame(), "win", "east", {
      scores: { east: 100 },
      scoreRecords: { east: { source: "manual", finalScore: 100 } },
    });
    const before = storage.getItem(GAME_SNAPSHOT_STORAGE_KEY);

    expect(loadInProgressGameRecovery(storage)?.game.isComplete).toBe(false);
    expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBe(before);
  });

  it("supplies a return target only for a valid in-progress game", () => {
    const storage = memoryStorage();
    expect(recoverableGameForReturn(storage)).toBeNull();

    saveGameRecovery(storage, newGame(), "win", "east", {
      scores: {},
      scoreRecords: {},
    });
    expect(recoverableGameForReturn(storage)?.game.isComplete).toBe(false);
  });
});
