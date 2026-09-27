import { beforeAll, describe, expect, it } from 'vitest';
import { dragon, scoreHand, set, suited, wind } from '../scoring';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { mapCurrentClassicalScoreBreakdown } from '../rules-platform/current-runtime-compat';
import { MCR_WMO_2006_PROFILE } from '../rules-platform/mcr-profile';
import { BMJA_PROFILE_REF } from './ruleset';
import { BUZZARD_2000_PROFILE_REF } from './buzzard-2000';
import { OUTSIDE_THE_BOX_PROFILE_REF } from './outside-the-box-catalogue';
import { WESTERN_TM_PROFILE_REF } from './western-tm-catalogue';
import { resolveHybridNonWinner } from './classical-hybrid-non-winner-entry';

const context = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000 };
const thirteenUnique = [
  suited('bamboo', 1), suited('bamboo', 9), suited('characters', 1), suited('characters', 9),
  suited('circles', 1), suited('circles', 9), wind('east'), wind('south'), wind('west'), wind('north'),
  dragon('red'), dragon('green'), dragon('white'),
];

describe('Classical hybrid non-winner orchestration', () => {
  beforeAll(async () => initialiseCurrentRulesRuntimes());

  it('keeps explicit-group scoring conservative when rest tiles contain a possible pung', () => {
    const explicitSets = [set('entered-red', 'pung', dragon('red'), 'exposed')];
    const common = { profile: BMJA_PROFILE_REF, explicitSets, bonusTiles: [], context, handMode: 'normal' as const };
    const established = resolveHybridNonWinner({ ...common, unresolvedTiles: [] });
    const withRest = resolveHybridNonWinner({
      ...common,
      unresolvedTiles: [dragon('green'), dragon('green'), dragon('green'), suited('bamboo', 1), suited('bamboo', 2), suited('bamboo', 4), suited('circles', 2), suited('circles', 5), suited('characters', 3), wind('east')],
    });

    expect(withRest.scoreResult.grammar).toBe('classical-points-doubles');
    if (withRest.scoreResult.grammar !== 'classical-points-doubles' || established.scoreResult.grammar !== 'classical-points-doubles') return;
    const establishedScore = mapCurrentClassicalScoreBreakdown(established.scoreResult);
    const restScore = mapCurrentClassicalScoreBreakdown(withRest.scoreResult);
    expect(restScore).toMatchObject({
      pointRules: establishedScore.pointRules,
      doubleRules: establishedScore.doubleRules,
    });
    expect(withRest.interpretation?.candidates.some(({ inferredGroups }) => inferredGroups.some(({ kind, tile }) =>
      kind === 'pung' && tile.family === 'dragon' && tile.dragon === 'green',
    ))).toBe(true);
  });

  it('finds supported all-loose 13-tile fishing without promoting its reading into score evidence', () => {
    const result = resolveHybridNonWinner({ profile: BMJA_PROFILE_REF, explicitSets: [], unresolvedTiles: thirteenUnique, bonusTiles: [], context, handMode: 'normal' });
    expect(result.scoreResult.grammar).toBe('classical-points-doubles');
    if (result.scoreResult.grammar !== 'classical-points-doubles') return;
    expect(mapCurrentClassicalScoreBreakdown(result.scoreResult).specialFishing).toMatchObject({ id: 'thirteen-unique-wonders', fishingValue: 400 });
    expect(result.interpretation?.profile).toEqual(BMJA_PROFILE_REF);
    expect(result.interpretation?.candidates.every(({ inferredGroups }) => inferredGroups.length === 0)).toBe(true);
  });

  it('preserves the existing fishing result for mixed explicit-group and rest-tile evidence', () => {
    const explicitSets = [
      set('bamboo-two', 'pung', suited('bamboo', 2)),
      set('bamboo-three', 'pung', suited('bamboo', 3)),
      set('bamboo-six', 'kong', suited('bamboo', 6)),
      set('bamboo-eight-pair', 'pair', suited('bamboo', 8)),
    ];
    const unresolvedTiles = [suited('bamboo', 4), suited('bamboo', 4)];
    const result = resolveHybridNonWinner({
      profile: BMJA_PROFILE_REF,
      explicitSets,
      unresolvedTiles,
      bonusTiles: [], context, handMode: 'normal',
    });

    expect(result.scoreResult.grammar).toBe('classical-points-doubles');
    if (result.scoreResult.grammar !== 'classical-points-doubles') return;
    const resolvedScore = mapCurrentClassicalScoreBreakdown(result.scoreResult);
    const existingScore = scoreHand({ sets: explicitSets, remainingTiles: unresolvedTiles, bonusTiles: [], isWinner: false }, { ...context, handMode: 'normal' });
    expect(resolvedScore.specialFishingMatches).toEqual(existingScore.specialFishingMatches);
    expect(resolvedScore.specialFishing).toEqual(existingScore.specialFishing);
    expect(resolvedScore.specialFishingMatches?.length).toBeGreaterThan(0);
  });

  it('keeps a fifth copy out of the fishing waits when four are already represented by Kongs', () => {
    const result = resolveHybridNonWinner({
      profile: BMJA_PROFILE_REF,
      explicitSets: [1, 2, 4, 6].map((rank) => set(`bamboo-${rank}-kong`, 'kong', suited('bamboo', rank as 1 | 2 | 4 | 6))),
      unresolvedTiles: [suited('bamboo', 8)],
      bonusTiles: [], context, handMode: 'normal',
    });

    expect(result.scoreResult.grammar).toBe('classical-points-doubles');
    if (result.scoreResult.grammar !== 'classical-points-doubles') return;
    const fishing = mapCurrentClassicalScoreBreakdown(result.scoreResult).specialFishing;
    expect(fishing?.id).toBe('purity');
    expect(fishing?.completingTiles).not.toEqual(expect.arrayContaining([1, 2, 4, 6].map((rank) => suited('bamboo', rank as 1 | 2 | 4 | 6))));
  });

  it.each([
    ['BMJA', BMJA_PROFILE_REF],
    ['Club', OUTSIDE_THE_BOX_PROFILE_REF],
    ['Buzzard', BUZZARD_2000_PROFILE_REF],
    ['Western', WESTERN_TM_PROFILE_REF],
  ] as const)('keeps 13-tile analysis bound to the exact %s profile', (_label, profile) => {
    const result = resolveHybridNonWinner({ profile, explicitSets: [], unresolvedTiles: thirteenUnique, bonusTiles: [], context, handMode: 'normal' });
    expect(result.scoreResult.profile).toEqual(profile);
    expect(result.interpretation?.profile).toEqual(profile);
    expect(result.interpretation?.candidates.every(({ profile: candidateProfile }) => candidateProfile.id === profile.id && candidateProfile.version === profile.version)).toBe(true);
  });

  it('preserves the unresolved Goulash blank fail-closed rejection', () => {
    const result = resolveHybridNonWinner({
      profile: OUTSIDE_THE_BOX_PROFILE_REF,
      explicitSets: [], unresolvedTiles: thirteenUnique, bonusTiles: [], context,
      handMode: 'goulash',
      ungroupedBlankTiles: [{ id: 'blank-1', location: 'remaining', tileIndex: 0 }],
    });
    expect(result.interpretation?.candidates).toEqual([]);
    expect(result.interpretation?.rejected[0]?.code).toBe('needs-explicit-goulash-blank-placement');
  });

  it('rejects MCR before entering Classical non-winner interpretation', () => {
    const profile = { id: MCR_WMO_2006_PROFILE.identity.id, version: MCR_WMO_2006_PROFILE.identity.version };
    expect(() => resolveHybridNonWinner({ profile, explicitSets: [], unresolvedTiles: thirteenUnique, bonusTiles: [], context, handMode: 'normal' }))
      .toThrow(`CLASSICAL_RUNTIME_REQUIRED:${profile.id}@${profile.version}`);
  });

  it('retains physical four-of-a-kind rest evidence without scoring an inferred Kong', () => {
    const explicitSets = [
      set('bamboo-one', 'pung', suited('bamboo', 1)),
      set('circles-two', 'pung', suited('circles', 2)),
      set('characters-three', 'pung', suited('characters', 3)),
    ];
    const common = { profile: BMJA_PROFILE_REF, explicitSets, bonusTiles: [], context, handMode: 'normal' as const };
    const established = resolveHybridNonWinner({ ...common, unresolvedTiles: [] });
    const result = resolveHybridNonWinner({ ...common, unresolvedTiles: Array.from({ length: 4 }, () => wind('east')) });
    expect(result.scoreResult.grammar).toBe('classical-points-doubles');
    if (result.scoreResult.grammar !== 'classical-points-doubles' || established.scoreResult.grammar !== 'classical-points-doubles') return;
    expect(mapCurrentClassicalScoreBreakdown(result.scoreResult)).toMatchObject({
      pointRules: mapCurrentClassicalScoreBreakdown(established.scoreResult).pointRules,
      doubleRules: mapCurrentClassicalScoreBreakdown(established.scoreResult).doubleRules,
    });
    expect(result.interpretation?.candidates.some(({ inferredGroups, structuralTileCount }) => {
      const kong = inferredGroups.find(({ kind }) => kind === 'kong');
      return structuralTileCount === 12 && kong?.structuralSlots === 3 && kong.physicalTileIndexes.length === 4;
    })).toBe(true);
  });
});
