import { describe, expect, it, beforeAll } from 'vitest';
import { getCurrentCompiledRulesRuntime, initialiseCurrentRulesRuntimes } from './current-runtime-registry';
import {
  CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE,
  profileDimensionValue,
  projectProfileDimensions,
  RULES_DIMENSIONS,
  type ProfileDimensionRelationshipKind,
  type RuleValue,
} from './profile-dimensions';
import type { RulesProfileRef } from './types';

const ref = (id: string, version: string): RulesProfileRef => ({ id, version });
const project = (profile: RulesProfileRef) => projectProfileDimensions(
  getCurrentCompiledRulesRuntime(profile).artifact,
  CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE,
);

describe('shared profile dimension contract', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());

  it('exposes the reviewed finite catalogue with stable IDs, groups and order', () => {
    expect(RULES_DIMENSIONS).toHaveLength(37);
    expect(new Set(RULES_DIMENSIONS.map(({ id }) => id)).size).toBe(RULES_DIMENSIONS.length);
    expect(RULES_DIMENSIONS.map(({ order }) => order)).toEqual(RULES_DIMENSIONS.map((_, index) => index + 1));
    expect(RULES_DIMENSIONS.every(({ groupOrder }) => groupOrder >= 1 && groupOrder <= 6)).toBe(true);
  });

  it('projects current Classical calibration rows from resolved artifacts and exact profile versions', () => {
    const refs = [ref('bmja','1.0'), ref('western-tm','0.1'), ref('outside-the-box','0.1'), ref('buzzard-2000','0.1')];
    const rows = refs.map((profile) => project(profile));
    for (const [index, profile] of refs.entries()) {
      expect(rows[index]!.every((row) => row.profile.id === profile.id && row.profile.version === profile.version)).toBe(true);
      expect(rows[index]).toHaveLength(RULES_DIMENSIONS.length);
    }
    const players = rows.map((values) => profileDimensionValue(values, 'table.player-count')!);
    expect(players.map(({ value }) => value)).toEqual(refs.map(() => ({ status: 'present', data: 4 })));
    expect(players.map(({ sourceStatus }) => sourceStatus)).toEqual([
      'source-verified', 'source-provisional', 'verified-club', 'source-verified',
    ]);
    expect(players[1]!.caveat).toContain('does not establish source equivalence');
    expect(players[0]!.runtimeSupport).toBe(players[1]!.runtimeSupport);
  });

  it('keeps absent, unknown, not-applicable and runtime-not-modelled distinct', () => {
    const values = project(ref('bmja','1.0'));
    const distinctRuleStates: RuleValue[] = [
      { status: 'present', data: true }, { status: 'absent' }, { status: 'unknown' }, { status: 'not-applicable' },
    ];
    expect(distinctRuleStates.map(({ status }) => status)).toEqual(['present', 'absent', 'unknown', 'not-applicable']);
    expect(profileDimensionValue(values, 'tiles.substitute-special')).toMatchObject({
      value: { status: 'unknown' }, runtimeSupport: 'not-modelled', sourceStatus: 'source-unknown',
    });
    expect(profileDimensionValue(values, 'play.ordinary-chow-policy')).toMatchObject({
      value: { status: 'unknown' }, runtimeSupport: 'not-modelled', sourceStatus: 'source-unknown',
    });
    expect(profileDimensionValue(values, 'settlement.false-mahjong')!.value).not.toEqual({ status: 'absent' });
    expect(profileDimensionValue(values, 'profile.identity')!.runtimeSupport).toBe('not-applicable');
    expect(profileDimensionValue(values, 'round.draw-follow-up')!.runtimeSupport).toBe('partial');
  });

  it('retains the reviewed #296 relationship vocabulary in the shared contract', () => {
    const relationships: ProfileDimensionRelationshipKind[] = [
      'exact-same', 'same-provisional', 'parameter-variation', 'binding-variation', 'policy-variation',
      'narrower', 'broader', 'related-analogue', 'unique', 'absent', 'unknown',
    ];
    expect(new Set(relationships).size).toBe(11);
  });

  it('projects MCR into the same general contract and derives its grammar/catalogue from the artifact', () => {
    const values = project(ref('mcr-wmo-2006','0.1'));
    expect(values).toHaveLength(RULES_DIMENSIONS.length);
    expect(profileDimensionValue(values, 'scoring.grammar')).toMatchObject({
      value: { status: 'present', data: 'pattern-accumulator' }, runtimeSupport: 'executable',
    });
    expect(profileDimensionValue(values, 'scoring.special-catalogue')).toMatchObject({
      value: { status: 'present', data: 'catalogue.pattern.mcr-wmo-2006' }, runtimeSupport: 'executable',
    });
  });
});
