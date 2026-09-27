import { beforeAll, describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { mapCurrentClassicalScoreBreakdown } from '../rules-platform/current-runtime-compat';
import { BMJA_PROFILE_REF } from './ruleset';
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
    expect(withRest.interpretation?.candidates.every(({ inferredGroups }) => inferredGroups.length === 0)).toBe(true);
  });

  it('finds supported all-loose 13-tile fishing without promoting its reading into score evidence', () => {
    const result = resolveHybridNonWinner({ profile: BMJA_PROFILE_REF, explicitSets: [], unresolvedTiles: thirteenUnique, bonusTiles: [], context, handMode: 'normal' });
    expect(result.scoreResult.grammar).toBe('classical-points-doubles');
    if (result.scoreResult.grammar !== 'classical-points-doubles') return;
    expect(mapCurrentClassicalScoreBreakdown(result.scoreResult).specialFishing).toMatchObject({ id: 'thirteen-unique-wonders', fishingValue: 400 });
    expect(result.interpretation?.profile).toEqual(BMJA_PROFILE_REF);
    expect(result.interpretation?.candidates.every(({ inferredGroups }) => inferredGroups.length === 0)).toBe(true);
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
