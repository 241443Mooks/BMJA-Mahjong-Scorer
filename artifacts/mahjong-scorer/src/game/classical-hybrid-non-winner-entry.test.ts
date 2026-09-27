import { beforeAll, describe, expect, it } from 'vitest';
import { dragon, scoreHand, set, suited, wind } from '../scoring';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { mapCurrentClassicalScoreBreakdown } from '../rules-platform/current-runtime-compat';
import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import { projectClassicalInterpretation } from '../rules-platform/classical-interpretation';
import { MCR_WMO_2006_PROFILE } from '../rules-platform/mcr-profile';
import { BMJA_PROFILE_REF } from './ruleset';
import { BUZZARD_2000_PROFILE_REF } from './buzzard-2000';
import { OUTSIDE_THE_BOX_PROFILE_REF } from './outside-the-box-catalogue';
import { WESTERN_TM_PROFILE_REF } from './western-tm-catalogue';
import { resolveHybridNonWinner, restoreHybridNonWinnerEvidence } from './classical-hybrid-non-winner-entry';

const context = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000 };
const thirteenUnique = [
  suited('bamboo', 1), suited('bamboo', 9), suited('characters', 1), suited('characters', 9),
  suited('circles', 1), suited('circles', 9), wind('east'), wind('south'), wind('west'), wind('north'),
  dragon('red'), dragon('green'), dragon('white'),
];
const classicalRuntime = (profile: { id: string; version: string }) => {
  const compiled = getCurrentCompiledRulesRuntime(profile);
  if (compiled.grammar !== 'classical-points-doubles') throw new Error('Expected a Classical profile runtime.');
  return compiled.runtime;
};

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
    expect(restScore.pointRules.length).toBeGreaterThan(establishedScore.pointRules.length);
    expect(restScore.doubleRules.length).toBeGreaterThan(establishedScore.doubleRules.length);
    expect(withRest.resolvedHand.sets[0]).toBe(explicitSets[0]);
    expect(withRest.interpretation?.candidates.some(({ inferredGroups }) => inferredGroups.some(({ kind, tile }) =>
      kind === 'pung' && tile.family === 'dragon' && tile.dragon === 'green',
    ))).toBe(true);
  });

  it('preserves the existing 13-tile fishing result when no ordinary grouping is selected', () => {
    const result = resolveHybridNonWinner({ profile: BMJA_PROFILE_REF, explicitSets: [], unresolvedTiles: thirteenUnique, bonusTiles: [], context, handMode: 'normal' });
    expect(result.scoreResult.grammar).toBe('classical-points-doubles');
    if (result.scoreResult.grammar !== 'classical-points-doubles') return;
    expect(mapCurrentClassicalScoreBreakdown(result.scoreResult).specialFishing).toMatchObject({ id: 'thirteen-unique-wonders', fishingValue: 400 });
    expect(result.interpretation?.profile).toEqual(BMJA_PROFILE_REF);
    expect(result.selection).toBeUndefined();
    expect(result.resolvedHand.remainingTiles).toEqual(thirteenUnique);
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

  it('scores a Pung reading of four matching loose tiles without auto-scoring an inferred Kong', () => {
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
    expect(result.selection?.candidate.inferredGroups.some(({ kind }) => kind === 'kong')).toBe(false);
    expect(result.selection?.candidate.inferredGroups.some(({ kind, tile }) => kind === 'pung' && tile.family === 'wind')).toBe(true);
    expect(result.resolvedHand.remainingTiles).toEqual([wind('east')]);
    expect(mapCurrentClassicalScoreBreakdown(result.scoreResult).finalScore)
      .toBeGreaterThan(mapCurrentClassicalScoreBreakdown(established.scoreResult).finalScore);
  });

  it('maximizes grouped tile coverage before score minimization', () => {
    const unresolvedTiles = [suited('bamboo', 1), ...Array.from({ length: 4 }, () => suited('bamboo', 2)), suited('bamboo', 3)];
    const result = resolveHybridNonWinner({ profile: BMJA_PROFILE_REF, explicitSets: [], unresolvedTiles, bonusTiles: [], context, handMode: 'normal' });
    const selectedScore = mapCurrentClassicalScoreBreakdown(result.scoreResult).finalScore;
    const lowerCoverageScores = result.interpretation.candidates
      .filter(({ layout, inferredGroups }) => layout === 'grouped' && inferredGroups.length > 0 && inferredGroups.every(({ kind }) => kind !== 'kong'))
      .filter(({ inferredGroups }) => inferredGroups.reduce((count, group) => count + group.physicalTileIndexes.length, 0) < result.selection!.groupedTileCount)
      .flatMap((candidate) => candidate.lawfulVisibilityAssignments.map((visibility) => classicalRuntime(BMJA_PROFILE_REF).scoreHand({
        evidence: projectClassicalInterpretation({ profile: BMJA_PROFILE_REF, explicitSets: [], unresolvedTiles, bonusTiles: [], isWinner: false, context, handMode: 'normal' }, candidate, visibility),
        context,
      })))
      .map((score) => score.grammar === 'classical-points-doubles' ? mapCurrentClassicalScoreBreakdown(score).finalScore : Number.POSITIVE_INFINITY);

    expect(result.selection?.groupedTileCount).toBe(6);
    expect(result.selection?.candidate.inferredGroups.map(({ kind }) => kind).sort()).toEqual(['chow', 'pung']);
    expect(lowerCoverageScores.some((score) => score < selectedScore)).toBe(true);
  });

  it('chooses the lowest exact-runtime score among tied best-coverage candidates', () => {
    const unresolvedTiles = [
      suited('bamboo', 1), suited('bamboo', 1),
      ...Array.from({ length: 4 }, () => suited('bamboo', 2)),
      suited('bamboo', 3), suited('bamboo', 3),
    ];
    const result = resolveHybridNonWinner({ profile: BMJA_PROFILE_REF, explicitSets: [], unresolvedTiles, bonusTiles: [], context, handMode: 'normal' });
    const bestCoverage = Math.max(...result.interpretation.candidates
      .filter(({ layout, inferredGroups }) => layout === 'grouped' && inferredGroups.length > 0 && inferredGroups.every(({ kind }) => kind !== 'kong'))
      .map(({ inferredGroups }) => inferredGroups.reduce((count, group) => count + group.physicalTileIndexes.length, 0)));
    const tiedScores = result.interpretation.candidates
      .filter(({ layout, inferredGroups }) => layout === 'grouped' && inferredGroups.length > 0 && inferredGroups.every(({ kind }) => kind !== 'kong'))
      .filter(({ inferredGroups }) => inferredGroups.reduce((count, group) => count + group.physicalTileIndexes.length, 0) === bestCoverage)
      .flatMap((candidate) => candidate.lawfulVisibilityAssignments.map((visibility) => classicalRuntime(BMJA_PROFILE_REF).scoreHand({
        evidence: projectClassicalInterpretation({ profile: BMJA_PROFILE_REF, explicitSets: [], unresolvedTiles, bonusTiles: [], isWinner: false, context, handMode: 'normal' }, candidate, visibility),
        context,
      })))
      .map((score) => score.grammar === 'classical-points-doubles' ? mapCurrentClassicalScoreBreakdown(score).finalScore : Number.POSITIVE_INFINITY);
    const score = mapCurrentClassicalScoreBreakdown(result.scoreResult).finalScore;

    expect(result.selection?.groupedTileCount).toBe(bestCoverage);
    expect(new Set(tiedScores).size).toBeGreaterThan(1);
    expect(score).toBe(Math.min(...tiedScores));
  });

  it('uses the lowest lawful visibility score and leaves unmatched tiles untouched', () => {
    const unresolvedTiles = [...Array.from({ length: 3 }, () => dragon('green')), wind('north')];
    const result = resolveHybridNonWinner({ profile: BMJA_PROFILE_REF, explicitSets: [], unresolvedTiles, bonusTiles: [], context, handMode: 'normal' });
    const selected = result.selection!;
    const lawfulScores = selected.candidate.lawfulVisibilityAssignments.map((visibility) => ({
      visibility,
      score: mapCurrentClassicalScoreBreakdown(classicalRuntime(BMJA_PROFILE_REF).scoreHand({
        evidence: projectClassicalInterpretation({ profile: BMJA_PROFILE_REF, explicitSets: [], unresolvedTiles, bonusTiles: [], isWinner: false, context, handMode: 'normal' }, selected.candidate, visibility),
        context,
      })).finalScore,
    }));

    expect(selected.candidate.inferredGroups).toHaveLength(1);
    expect(result.resolvedHand.sets[0]?.visibility).toBe(lawfulScores.sort((left, right) => left.score - right.score)[0]?.visibility[selected.candidate.inferredGroups[0]!.id]);
    expect(result.resolvedHand.remainingTiles).toEqual([wind('north')]);
    expect(result.audit?.c1.factResolutions[0]).toMatchObject({ origin: 'default' });
  });

  it('reopens an applied resolution as its original editable evidence and reproduces score and audit', () => {
    const explicit = set('entered-red', 'pung', dragon('red'), 'exposed');
    const unresolvedTiles = [...Array.from({ length: 3 }, () => dragon('green')), suited('bamboo', 9)];
    const input = { profile: BMJA_PROFILE_REF, explicitSets: [explicit], unresolvedTiles, bonusTiles: [], context, handMode: 'normal' as const };
    const first = resolveHybridNonWinner(input);
    expect(first.audit).toBeDefined();
    const reopened = restoreHybridNonWinnerEvidence(first.resolvedHand, first.audit, BMJA_PROFILE_REF)!;
    const second = resolveHybridNonWinner({ ...input, explicitSets: reopened.sets, unresolvedTiles: reopened.remainingTiles ?? [], bonusTiles: reopened.bonusTiles });

    expect(reopened.sets).toEqual([explicit]);
    expect(reopened.remainingTiles).toEqual(unresolvedTiles);
    expect(second.resolvedHand).toEqual(first.resolvedHand);
    expect(second.scoreResult.result).toEqual(first.scoreResult.result);
    expect(second.audit).toEqual(first.audit);
  });

  it('keeps an explicit Kong authoritative and preserves explicit-only losing scores', () => {
    const explicitSets = [set('entered-east-kong', 'kong', wind('east'), 'exposed')];
    const result = resolveHybridNonWinner({ profile: BMJA_PROFILE_REF, explicitSets, unresolvedTiles: [], bonusTiles: [], context, handMode: 'normal' });
    const expected = scoreHand({ sets: explicitSets, bonusTiles: [], isWinner: false }, context);

    expect(result.selection).toBeUndefined();
    expect(result.resolvedHand.sets).toEqual(explicitSets);
    expect(mapCurrentClassicalScoreBreakdown(result.scoreResult)).toEqual(expected);
  });

  it.each([
    ['BMJA', BMJA_PROFILE_REF], ['Club', OUTSIDE_THE_BOX_PROFILE_REF],
    ['Buzzard', BUZZARD_2000_PROFILE_REF], ['Western', WESTERN_TM_PROFILE_REF],
  ] as const)('scores inferred evidence only through exact %s runtime', (_label, profile) => {
    const result = resolveHybridNonWinner({ profile, explicitSets: [], unresolvedTiles: [...Array.from({ length: 3 }, () => dragon('green'))], bonusTiles: [], context, handMode: 'normal' });
    expect(result.scoreResult.profile).toEqual(profile);
    expect(result.audit?.c1.profile).toEqual(profile);
    expect(result.scoreResult).toEqual(classicalRuntime(profile).scoreHand({ evidence: result.resolvedHand, context }));
  });
});
