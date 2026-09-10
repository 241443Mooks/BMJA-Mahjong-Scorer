import { describe, expect, it } from "vitest";
import { bonus, dragon, set, suited, wind } from "../scoring";
import { BMJA_PROFILE_REF, resolveRulesProfile } from "./ruleset";
import type { MahjongHand, Wind } from "../scoring";
import type { GamePlayer, ProgressionState, SeatAssignments } from "./types";

const profile = resolveRulesProfile(BMJA_PROFILE_REF);

const players: GamePlayer[] = [
  { id: "bill", name: "Bill" },
  { id: "rod", name: "Rod" },
  { id: "ben", name: "Ben" },
  { id: "jack", name: "Jack" },
];

const seats: SeatAssignments = {
  bill: "south",
  rod: "east",
  ben: "west",
  jack: "north",
};

const score = (
  hand: MahjongHand,
  playerWind: Wind = "east",
  prevailingWind: Wind = "east",
) => profile.scoreHand({ hand, playerWind, prevailingWind });

describe("bmja@1.0 resolved-profile parity", () => {
  it("preserves ordinary scoring and doubles/bonus handling", () => {
    const ordinary: MahjongHand = {
      sets: [
        set("dragon", "pung", dragon("red"), "exposed"),
        set("chow-1", "chow", suited("bamboo", 2), "exposed"),
        set("minor", "pung", suited("bamboo", 5)),
        set("terminal", "pung", suited("bamboo", 9)),
        set("pair", "pair", wind("south")),
      ],
      bonusTiles: [bonus("flower", 2)],
      isWinner: true,
      winningMethod: "wall",
    };
    const purityWithBonuses: MahjongHand = {
      sets: [
        set("p1", "pung", suited("characters", 2), "exposed"),
        set("p2", "pung", suited("characters", 3)),
        set("p3", "pung", suited("characters", 6)),
        set("k1", "kong", suited("characters", 9)),
        set("pair", "pair", suited("characters", 5)),
      ],
      bonusTiles: [bonus("flower", 1), bonus("season", 2)],
      isWinner: true,
      winningMethod: "discard",
    };

    expect(score(ordinary, "south")).toMatchObject({
      finalScore: 352,
      basePoints: 44,
      doubles: 3,
    });
    expect(score(purityWithBonuses)).toMatchObject({
      finalScore: 512,
      basePoints: 70,
      doubles: 4,
    });
  });

  it("preserves fixed-value special and fishing results", () => {
    const allPairHonours: MahjongHand = {
      sets: [
        set("1", "pair", wind("east")),
        set("2", "pair", wind("south")),
        set("3", "pair", suited("bamboo", 1)),
        set("4", "pair", suited("characters", 9)),
        set("5", "pair", dragon("red")),
        set("6", "pair", dragon("green")),
        set("7", "pair", dragon("white")),
      ],
      bonusTiles: [],
      isWinner: true,
    };
    const fishingAllPairHonours: MahjongHand = {
      sets: [
        set("1", "pair", wind("east")),
        set("2", "pair", wind("south")),
        set("3", "pair", dragon("red")),
        set("4", "pair", suited("bamboo", 1)),
        set("5", "pair", suited("circles", 9)),
        set("6", "pair", suited("characters", 1)),
      ],
      remainingTiles: [dragon("green")],
      bonusTiles: [],
      isWinner: false,
      originalCall: false,
    };

    expect(score(allPairHonours)).toMatchObject({
      finalScore: 500,
      scoringMode: "special",
    });
    expect(score(fishingAllPairHonours)).toMatchObject({
      valid: true,
      finalScore: 200,
      specialFishing: { id: "all-pair-honours" },
    });
  });

  it("preserves settlement, including East and loser-to-loser effects", () => {
    const eastWins = profile.settleRound(players, seats, {
      outcome: { type: "win", winnerId: "rod" },
      scores: { bill: 100, rod: 200, ben: 300, jack: 400 },
    });
    expect(eastWins.changes.rod).toBe(1200);
    expect(
      eastWins.transactions
        .filter((transaction) => transaction.reason === "winner-payment")
        .map((transaction) => transaction.amount),
    ).toEqual([400, 400, 400]);

    const loserDifferences = profile.settleRound(players, seats, {
      outcome: { type: "win", winnerId: "jack" },
      scores: { bill: 300, rod: 100, ben: 200, jack: 50 },
    });
    expect(loserDifferences.transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fromPlayerId: "rod",
          toPlayerId: "bill",
          amount: 400,
        }),
        expect.objectContaining({
          fromPlayerId: "rod",
          toPlayerId: "ben",
          amount: 200,
        }),
      ]),
    );
  });

  it("preserves East retention, rotation, and prevailing-wind advancement", () => {
    const initial: ProgressionState = {
      seats: { bill: "east", rod: "south", ben: "west", jack: "north" },
      prevailingWind: "east",
      eastCycleStartPlayerId: "bill",
    };
    expect(
      profile.progressGame(players, initial, { type: "win", winnerId: "bill" }),
    ).toMatchObject({
      seats: initial.seats,
      seatsRotated: false,
      prevailingWind: "east",
    });

    let current = initial;
    for (const winnerId of ["ben", "jack", "bill"]) {
      current = profile.progressGame(players, current, {
        type: "win",
        winnerId,
      });
    }
    expect(
      profile.progressGame(players, current, { type: "win", winnerId: "rod" }),
    ).toMatchObject({
      seats: initial.seats,
      prevailingWind: "south",
      seatsRotated: true,
      prevailingWindAdvanced: true,
    });
  });
});
