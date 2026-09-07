import { describe, expect, it } from "vitest";
import { bonus, set, suited } from "../scoring";
import type {
  DetailedHandRecord,
  GamePlayer,
  SettlementTransaction,
} from "./types";
import { detailedHandStatus, settlementDescription } from "./HandRecord";

const players: GamePlayer[] = [
  { id: "jenn", name: "Jenn" },
  { id: "andy", name: "Andy" },
  { id: "louise", name: "Louise" },
  { id: "smooks", name: "SMooks" },
];

const record = (partial = false): DetailedHandRecord => ({
  source: "detailed-scorer",
  hand: {
    sets: [
      set("chow", "chow", suited("bamboo", 2)),
      set("pung", "pung", suited("circles", 5), "exposed"),
    ],
    ...(partial
      ? { remainingTiles: [suited("characters", 9)] }
      : { looseTiles: [suited("characters", 1)] }),
    bonusTiles: [bonus("flower", 1)],
    isWinner: !partial,
    ...(partial
      ? {}
      : {
          winningMethod: "wall" as const,
          winningTileProvenance: {
            tile: suited("bamboo", 3),
            target: {
              type: "grouped-set" as const,
              setId: "chow",
              tileIndex: 1 as const,
            },
          },
        }),
  },
  context: { playerWind: "east", prevailingWind: "east", limit: 1000 },
  breakdown: {
    valid: true,
    evidenceCompleteness: partial ? "partial" : "complete",
    validationErrors: [],
    pointRules: [],
    doubleRules: [],
    specialHands: [],
    basePoints: 20,
    doubles: 1,
    uncappedScore: 40,
    finalScore: 40,
    limitApplied: false,
    scoringMode: "standard",
    calculationComponents: [],
  },
  finalScore: 40,
});

describe("game-record presentation", () => {
  it("labels complete and partial detailed hands without claiming missing evidence", () => {
    expect(detailedHandStatus(record())).toBe("Recorded hand");
    expect(detailedHandStatus(record(true))).toBe("Partial recorded hand");
    expect(record(true).hand.remainingTiles).toEqual([suited("characters", 9)]);
  });

  it("keeps settlement descriptions tied to canonical transactions and identifies East doubling", () => {
    const transaction: SettlementTransaction = {
      fromPlayerId: "andy",
      toPlayerId: "jenn",
      amount: 640,
      baseAmount: 320,
      eastMultiplier: 2,
      reason: "winner-payment",
    };
    expect(settlementDescription(transaction, players, "andy")).toBe(
      "Andy paid Jenn 640 — doubled because Andy was East",
    );
  });
});
