import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { bonus, set, suited } from "../scoring";
import type {
  DetailedHandRecord,
  GamePlayer,
  SettlementTransaction,
} from "./types";
import { HandRecord, detailedHandStatus, settlementDescription } from "./HandRecord";
import { handCountLabel } from "./GameScorer";

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
      set("pung-2", "pung", suited("characters", 2)),
      set("pung-3", "pung", suited("bamboo", 7)),
      set("pair", "pair", suited("characters", 9)),
    ],
    ...(partial ? { remainingTiles: [suited("characters", 9)] } : {}),
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

  it("renders the named complete and partial records from stored hands", () => {
    const complete = renderToStaticMarkup(createElement(HandRecord, { playerName: "Jenn", record: record() }));
    const partial = renderToStaticMarkup(createElement(HandRecord, { playerName: "Bob", record: record(true) }));

    expect(complete).toContain("Jenn · Recorded hand");
    expect(complete).toContain("concealed chow");
    expect(complete).toContain("exposed pung");
    expect(complete).toContain("Flowers and Seasons");
    expect(partial).toContain("Bob · Partial recorded hand");
    expect(partial).toContain("Remaining tiles recorded");
  });

  it("only marks the exact chow occurrence and describes ambiguous winning groups honestly", () => {
    const chow = renderToStaticMarkup(createElement(HandRecord, { playerName: "Jenn", record: record() }));
    expect((chow.match(/winning tile/g) ?? [])).toHaveLength(1);

    const pungRecord = record();
    pungRecord.hand.winningTileProvenance = {
      tile: suited("circles", 5),
      target: { type: "grouped-set", setId: "pung" },
    };
    const pung = renderToStaticMarkup(createElement(HandRecord, { playerName: "Jenn", record: pungRecord }));
    expect(pung).toContain("Winning tile completed this pung");
    expect(pung).not.toContain("Circles, winning tile");
  });

  it("does not claim an exact loose-tile occurrence when identical copies are stored", () => {
    const looseRecord = record();
    looseRecord.hand = {
      sets: [],
      looseTiles: Array.from({ length: 14 }, () => suited("characters", 1)),
      bonusTiles: [],
      isWinner: true,
      winningMethod: "wall",
      winningTileProvenance: {
        tile: suited("characters", 1),
        target: { type: "loose-layout" },
      },
    };
    const markup = renderToStaticMarkup(createElement(HandRecord, { playerName: "Jenn", record: looseRecord }));
    expect(markup).toContain("Winning tile: 1 Characters");
    expect(markup).not.toContain("1 Characters, winning tile");
  });

  it("uses canonical singular and plural ledger counts", () => {
    expect(handCountLabel(1)).toBe("1 hand played");
    expect(handCountLabel(3)).toBe("3 hands played");
  });
});
