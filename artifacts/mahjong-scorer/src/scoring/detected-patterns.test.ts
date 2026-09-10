import { describe, expect, it } from "vitest";
import { detectedPatterns } from "./detected-patterns";
import { scoreHand } from "./score";
import { bonus, dragon, set, suited, wind } from "./tiles";
import type { MahjongHand } from "./types";

const ordinaryWinner: MahjongHand = {
  sets: [
    set("red-pung", "pung", dragon("red"), "concealed"),
    set("bamboo-pung", "pung", suited("bamboo", 2), "concealed"),
    set("circle-chow", "chow", suited("circles", 3), "concealed"),
    set("character-chow", "chow", suited("characters", 4), "concealed"),
    set("east-pair", "pair", wind("east"), "concealed"),
  ],
  bonusTiles: [],
  isWinner: true,
  winningMethod: "wall",
};

describe("detected pattern callouts", () => {
  it("shows only applied ordinary point and double rules", () => {
    const patterns = detectedPatterns(scoreHand(ordinaryWinner));
    expect(patterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "points-pung-red-pung",
          effect: "+8 points",
          explanation: "Pung value from tile class and exposure.",
        }),
        expect.objectContaining({
          id: "doubles-dragon-set-red-pung",
          effect: "1 double",
          explanation: "Every dragon pung or kong gives one double.",
        }),
      ]),
    );
    expect(patterns.map((pattern) => pattern.name)).not.toContain("Purity");
  });

  it("carries stable guide reference ids for ordinary scoring explanations", () => {
    const patterns = detectedPatterns(
      scoreHand(
        {
          sets: [
            set("minor", "pung", suited("bamboo", 2), "concealed"),
            set("major-kong", "kong", wind("south"), "exposed"),
            set("chow", "chow", suited("circles", 3), "exposed"),
            set("other", "pung", suited("characters", 5), "exposed"),
            set("pair", "pair", dragon("red"), "concealed"),
          ],
          bonusTiles: [bonus("flower", 1)],
          isWinner: true,
          winningMethod: "wall",
        },
        { playerWind: "east", prevailingWind: "west", limit: 1000 },
      ),
    );

    expect(patterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "points-pung-minor",
          referenceId: "pung-minor",
        }),
        expect.objectContaining({
          id: "points-kong-major-kong",
          referenceId: "kong-major",
        }),
        expect.objectContaining({
          id: "points-dragon-pair",
          referenceId: "dragon-pair",
        }),
        expect.objectContaining({
          id: "points-bonus-flower-1",
          referenceId: "bonus-tile-points",
        }),
        expect.objectContaining({
          id: "points-mahjong",
          referenceId: "mahjong-points",
        }),
        expect.objectContaining({
          id: "points-live-wall-win",
          referenceId: "live-wall-win",
        }),
        expect.objectContaining({
          id: "doubles-own-flower",
          referenceId: "own-flower-double",
        }),
      ]),
    );
  });

  it("shows a matched special hand with its existing description and value", () => {
    const patterns = detectedPatterns(
      scoreHand({
        sets: [
          set("one", "pair", suited("bamboo", 1)),
          set("nine", "pair", suited("circles", 9)),
          set("east", "pair", wind("east")),
          set("south", "pair", wind("south")),
          set("red", "pair", dragon("red")),
          set("green", "pair", dragon("green")),
          set("white", "pair", dragon("white")),
        ],
        bonusTiles: [],
        isWinner: true,
      }),
    );
    expect(patterns).toContainEqual(
      expect.objectContaining({
        id: "special-all-pair-honours",
        name: "All pair honours",
        effect: "500 points",
      }),
    );
  });

  it("shows fishing only for an actual one-tile-away special and removes it when the hand changes", () => {
    const fishingHand: MahjongHand = {
      sets: [
        set("two", "pung", suited("bamboo", 2)),
        set("three", "pung", suited("bamboo", 3)),
        set("four", "pung", suited("bamboo", 4)),
        set("pair", "pair", suited("bamboo", 8)),
      ],
      remainingTiles: [suited("bamboo", 6), suited("bamboo", 6)],
      bonusTiles: [],
      isWinner: false,
    };
    expect(detectedPatterns(scoreHand(fishingHand))).toContainEqual(
      expect.objectContaining({
        id: "fishing-purity",
        effect: "3 doubles while fishing",
      }),
    );
    expect(
      detectedPatterns(
        scoreHand({
          ...fishingHand,
          remainingTiles: [suited("characters", 2)],
        }),
      ).some((pattern) => pattern.id === "fishing-purity"),
    ).toBe(false);
  });

  it("does not alter scoring outputs", () => {
    const before = scoreHand(ordinaryWinner);
    const finalScore = before.finalScore;
    detectedPatterns(before);
    expect(before.finalScore).toBe(finalScore);
    expect(scoreHand(ordinaryWinner).finalScore).toBe(finalScore);
  });
});
