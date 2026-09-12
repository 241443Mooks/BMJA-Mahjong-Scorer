import { describe, expect, it } from "vitest";
import {
  bmjaSpecialHandBindings,
  canonicalSpecialHandPatterns,
  isCalculatedSpecialHandBinding,
  isFixedSpecialHandBinding,
} from "../scoring/special-hands";
import {
  WESTERN_TM_PROFILE_REF,
  westernTmSpecialHandBindings,
} from "./western-tm-catalogue";

// Transcribed from the 84-name source inventory in
// docs/rules/TM_COMPANION_CATALOGUE_INDEX.md, rather than derived from bindings.
const companionSourceNames = [
  "Run, Pung & Pair",
  "Gates of Heaven",
  "Confused Gates",
  "Wriggly Snake",
  "Hachi Ban",
  "Guardian Winds",
  "Wriggly Dragon",
  "Five Odd Honours",
  "Guardian Dragons",
  "Grand Sequence",
  "Dragon's Tail",
  "Dragon's Gates",
  "Dragon's Teeth",
  "Greta's Garden",
  "Greta's Dragon",
  "Red Lantern",
  "Gertie's Garter",
  "Yin Yang",
  "Big Robert",
  "Moon at Bottom of Well",
  "Three Philosophers",
  "Crazy Chows",
  "Little Robert",
  "Windy Chow",
  "Chop Suey",
  "Chow Mein",
  "Hovering Angel",
  "Little Brother",
  "Apple Blossom",
  "The Professors",
  "Chow Chow",
  "Knitting",
  "Triple Knitting",
  "Sparrow's Sanctuary",
  "Heavenly Twins",
  "Seven Twins",
  "All Pair",
  "All Pair Honours",
  "Golden Gates",
  "All Pair Jade",
  "All Pair Ruby Jade",
  "Dragonette",
  "Windfall",
  "Dragon's Breath",
  "Windy Dragons",
  "Windy Ones",
  "Windy Nines",
  "Windvane",
  "Three Sisters",
  "Seven Brothers",
  "Civil War",
  "Up You Go",
  "Down You Go",
  "Four Blessings",
  "Dragonfly",
  "Three Great Scholars",
  "Green Jade",
  "Red Coral",
  "White Opal",
  "Imperial Jade",
  "Lily of the Valley",
  "Lillypilly",
  "Red Waratah",
  "Ruby Jade",
  "Royal Ruby",
  "Red Lily",
  "Unique Wonder",
  "All Honour Hand",
  "All Winds and Dragons",
  "Heads and Tails",
  "Dragon's Run",
  "Ordinary Mah Jong",
  "Sunrise",
  "Sunset",
  "Numbers in Parallel",
  "Numbers Doubled",
  "Purity",
  "Chinese Odds",
  "Odds & Evens",
  "Robin",
  "Blue Mountains",
  "White Elephant",
  "Driven Snow",
  "Dragon's Scales",
] as const;

const bindingFor = (name: string) =>
  westernTmSpecialHandBindings.find((binding) => binding.name === name)!;

describe("western-tm@0.1 catalogue", () => {
  it("exactly matches the authoritative 84-name Companion source inventory", () => {
    expect(westernTmSpecialHandBindings).toHaveLength(85);
    const names = westernTmSpecialHandBindings.map(({ name }) => name);
    const runtimeNames = new Set<string>(names);
    const sourceNames = new Set<string>(companionSourceNames);

    expect(companionSourceNames).toHaveLength(84);
    expect(runtimeNames).toHaveLength(84);
    expect([...runtimeNames].sort()).toEqual([...sourceNames].sort());
    expect([...sourceNames].filter((name) => !runtimeNames.has(name))).toEqual(
      [],
    );
    expect([...runtimeNames].filter((name) => !sourceNames.has(name))).toEqual(
      [],
    );

    const duplicateNames = [...runtimeNames].filter(
      (name) => names.filter((candidate) => candidate === name).length > 1,
    );
    expect(duplicateNames).toEqual(["Big Robert"]);
    expect(names.filter((name) => name === "Big Robert")).toHaveLength(2);
    expect(
      westernTmSpecialHandBindings
        .filter(({ name }) => name === "Big Robert")
        .map(({ patternId }) => patternId),
    ).toEqual([
      "three-four-tile-suit-runs-with-honour-pair",
      "three-matching-four-tile-suit-runs-with-honour-pair",
    ]);
  });

  it("has one internally consistent binding per profile and pattern", () => {
    const entries = westernTmSpecialHandBindings.map(
      ({ patternId, profile }) =>
        `${profile.id}@${profile.version}:${patternId}`,
    );
    expect(new Set(entries).size).toBe(entries.length);
    expect(
      westernTmSpecialHandBindings.every(
        ({ profile }) =>
          profile.id === WESTERN_TM_PROFILE_REF.id &&
          profile.version === WESTERN_TM_PROFILE_REF.version,
      ),
    ).toBe(true);
  });

  it("binds only canonical patterns and keeps profile membership explicit", () => {
    const canonicalIds = new Set(
      canonicalSpecialHandPatterns.map(({ id }) => id),
    );
    const bmjaIds = new Set(
      bmjaSpecialHandBindings.map(({ patternId }) => patternId),
    );
    const westernIds = new Set(
      westernTmSpecialHandBindings.map(({ patternId }) => patternId),
    );

    expect(
      westernTmSpecialHandBindings.every(({ patternId }) =>
        canonicalIds.has(patternId),
      ),
    ).toBe(true);
    const sharedPatternIds = [...westernIds]
      .filter((id) => bmjaIds.has(id))
      .sort();
    expect(sharedPatternIds).toEqual([
      "all-pair-honours",
      "all-winds-and-dragons",
      "four-blessings",
      "heads-and-tails",
      "thirteen-unique-wonders",
      "three-great-scholars",
    ]);
    expect(bmjaIds.has("three-four-tile-suit-runs-with-honour-pair")).toBe(
      false,
    );
    expect(
      bmjaIds.has("three-matching-four-tile-suit-runs-with-honour-pair"),
    ).toBe(false);
    expect(westernIds.has("knitting")).toBe(false);
  });

  it("locks corrected source values and exposure decisions", () => {
    const fixed = (name: string) => {
      const binding = bindingFor(name);
      expect(isFixedSpecialHandBinding(binding)).toBe(true);
      return binding;
    };

    expect(["Chop Suey", "Chow Mein"].map((name) => fixed(name))).toEqual([
      expect.objectContaining({ value: 1000, fishingValue: 400 }),
      expect.objectContaining({ value: 1000, fishingValue: 400 }),
    ]);
    expect(fixed("Little Brother")).toMatchObject({
      value: 500,
      fishingValue: 200,
    });
    expect(fixed("Odds & Evens")).toMatchObject({
      value: 1500,
      fishingValue: 600,
    });
    expect(fixed("Crazy Chows")).toMatchObject({
      value: 500,
      fishingValue: 200,
    });
    expect(fixed("Gertie's Garter")).toMatchObject({
      value: 1000,
      fishingValue: 400,
    });
    expect(fixed("Dragon's Gates")).toMatchObject({
      value: 1000,
      fishingValue: 400,
      exposure: { allowed: true, exposedValue: 500, exposedFishingValue: 200 },
    });
    expect(fixed("Red Lantern")).toMatchObject({
      value: 2000,
      fishingValue: 800,
      exposure: { allowed: true, exposedValue: 1000, exposedFishingValue: 400 },
    });
    expect(
      westernTmSpecialHandBindings.filter(({ name }) => name === "Big Robert"),
    ).toEqual([
      expect.objectContaining({ value: 500, fishingValue: 200 }),
      expect.objectContaining({ value: 1000, fishingValue: 400 }),
    ]);
  });

  it("retains profile-local score and eligibility treatments", () => {
    const fixedBindings = westernTmSpecialHandBindings.filter(
      isFixedSpecialHandBinding,
    );
    const calculatedBindings = westernTmSpecialHandBindings.filter(
      isCalculatedSpecialHandBinding,
    );

    expect(fixedBindings.some(({ value }) => value > 1000)).toBe(true);
    expect(calculatedBindings.map(({ name }) => name).sort()).toEqual([
      "All Honour Hand",
      "Ordinary Mah Jong",
      "Purity",
    ]);
    expect(
      fixedBindings.some(({ exposure }) => exposure?.allowed === true),
    ).toBe(true);
    expect(
      fixedBindings.some(({ exposure }) => exposure?.allowed === false),
    ).toBe(true);
    expect(
      westernTmSpecialHandBindings.some(
        ({ name }) => name === "Little Brother",
      ),
    ).toBe(true);
    expect(
      westernTmSpecialHandBindings
        .filter(({ winningMethods }) => winningMethods !== undefined)
        .map(({ name }) => name)
        .sort(),
    ).toEqual(["Chow Chow", "Seven Twins"]);
    expect(
      fixedBindings.some(({ fishingValue }) => fishingValue !== undefined),
    ).toBe(true);
  });
});
