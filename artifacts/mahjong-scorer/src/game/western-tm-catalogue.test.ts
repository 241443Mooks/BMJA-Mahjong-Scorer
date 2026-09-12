import { describe, expect, it } from "vitest";
import {
  WESTERN_TM_PROFILE_REF,
  westernTmSpecialHandBindings,
} from "./western-tm-catalogue";

describe("western-tm@0.1 catalogue", () => {
  it("has the current authoritative binding count", () => {
    expect(westernTmSpecialHandBindings).toHaveLength(52);
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
