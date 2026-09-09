import { describe, expect, it } from "vitest";
import { confirmHand, createBmjaGame } from "./game";
import {
  clearGameRecovery,
  GAME_SNAPSHOT_STORAGE_KEY,
  gameProgressSummary,
  loadGameRecovery,
  loadInProgressGameRecovery,
  recoverableGameForReturn,
  saveGameRecovery,
} from "./persistence";

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
      game: { balances: game.balances, handHistory: game.handHistory },
      outcomeType: "win",
      winnerId: "south",
      draft: { scores: { south: 88 } },
    });
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
