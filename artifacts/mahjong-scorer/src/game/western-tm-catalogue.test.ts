import { describe, expect, it } from "vitest";
import {
  WESTERN_TM_PROFILE_REF,
  westernTmSpecialHandBindings,
} from "./western-tm-catalogue";

describe("western-tm@0.1 catalogue", () => {
  it("has the current authoritative binding count", () => {
    expect(westernTmSpecialHandBindings).toHaveLength(85);
    const names = westernTmSpecialHandBindings.map(({ name }) => name);
    expect(new Set(names).size).toBe(84);
    expect(names.filter((name) => name === 'Big Robert')).toHaveLength(2);
    expect(
      westernTmSpecialHandBindings
        .filter(({ name }) => name === 'Big Robert')
        .map(({ patternId }) => patternId),
    ).toEqual([
      'three-four-tile-suit-runs-with-honour-pair',
      'three-matching-four-tile-suit-runs-with-honour-pair',
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
});
