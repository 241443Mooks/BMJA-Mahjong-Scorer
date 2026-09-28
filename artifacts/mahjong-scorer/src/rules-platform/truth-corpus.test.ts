import { describe, expect, it } from 'vitest';
import { createTruthIndex, currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment, projectSourceRegister, truthImpactForSource } from '../rules-knowledge/truth';

describe('current typed truth corpus', () => {
  it('indexes exact source, subject, claim, and profile treatment identities', () => {
    const subjectId = 'pattern.thirteen-orphans';
    expect(currentTruthIndex.subjectById(subjectId)?.record.kind).toBe('pattern');
    expect(currentTruthIndex.claimsForSubject(subjectId)).toHaveLength(5);
    expect(currentTruthIndex.claimsForSource('buzzard-2000-classical').map(({ record }) => record.supportsProfile)).toEqual([
      { id: 'buzzard-2000', version: '0.1' },
    ]);
    expect(currentTruthIndex.claimById('evidence.pattern.thirteen-orphans.outside-the-box')?.record.locator).toEqual({
      kind: 'club-material',
      title: 'Outside the Box Mahjong guide supplied by Rachel',
      version: 'September 2026',
      section: '13 Unique Wonders',
      page: '12–14',
    });
    expect(currentTruthIndex.treatmentsForSubject(subjectId).map(({ record }) => record.treatmentId)).toEqual([
      'bmja@1.0:thirteen-unique-wonders',
      'buzzard-2000@0.1:thirteen-unique-wonders',
      'outside-the-box@0.1:thirteen-unique-wonders',
      'western-tm@0.1:thirteen-unique-wonders',
    ]);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'western-tm', version: '0.2' })).toEqual([]);
    expect(currentTruthIndex.claimsSupportingProfile({ id: 'outside-the-box', version: '0.1' })).toHaveLength(1);
  });

  it('follows source impact through claims to only the supported treatments', () => {
    expect(currentTruthIndex.treatmentsDependingOnSource('buzzard-2000-classical').map(({ record }) => record.treatmentId)).toEqual([
      'buzzard-2000@0.1:thirteen-unique-wonders',
    ]);
    expect(currentTruthIndex.treatmentsDependingOnSource('classical-atlas-concept-audit-v1')).toHaveLength(4);
    expect(currentTruthIndex.treatmentsDependingOnSource('classical-atlas-concept-audit-v1', { id: 'western-tm', version: '0.1' }).map(({ record }) => record.treatmentId)).toEqual([
      'western-tm@0.1:thirteen-unique-wonders',
    ]);
    expect(currentTruthIndex.treatmentsDependingOnSource('classical-atlas-concept-audit-v1', { id: 'western-tm', version: '0.2' })).toEqual([]);
    const impact = truthImpactForSource(currentTruthIndex, 'buzzard-2000-classical', [
      { treatmentId: 'western-tm@0.1:thirteen-unique-wonders', projectionId: 'atlas:shared-entry' },
      { treatmentId: 'buzzard-2000@0.1:thirteen-unique-wonders', projectionId: 'atlas:thirteen-unique-wonders' },
    ]);
    expect(impact).toMatchObject({
      claimIds: ['evidence.pattern.thirteen-orphans.buzzard-2000'],
      subjects: [{ subjectId: 'pattern.thirteen-orphans', treatmentIds: ['buzzard-2000@0.1:thirteen-unique-wonders'] }],
      treatments: [{ treatmentId: 'buzzard-2000@0.1:thirteen-unique-wonders', profile: { id: 'buzzard-2000', version: '0.1' }, runtimeState: { kind: 'executable', ref: { kind: 'binding', id: 'thirteen-unique-wonders' } } }],
      projections: [{ treatmentId: 'buzzard-2000@0.1:thirteen-unique-wonders', projectionId: 'atlas:thirteen-unique-wonders' }],
    });
    expect(currentTruthIndex.claimsByStatus('secondary-only')).toHaveLength(1);
    expect(currentTruthIndex.unresolvedClaims()).toEqual([]);
    const unresolvedStatuses = ['needs-primary-source', 'needs-club-confirmation', 'conflict'] as const;
    const unresolvedClaims = unresolvedStatuses.map((status) => {
      const base = currentTruthCorpus.claims[0];
      return { ...base, recordId: `fixture.${status}`, record: { ...base.record, claimId: `fixture.${status}`, status } };
    });
    const withUnresolved = createTruthIndex({ ...currentTruthCorpus, claims: [...currentTruthCorpus.claims, ...unresolvedClaims] }, currentTruthValidationEnvironment);
    expect(withUnresolved.unresolvedClaims().map(({ record }) => record.status)).toEqual([
      'conflict', 'needs-club-confirmation', 'needs-primary-source',
    ]);
  });

  it('projects the migrated source subset deterministically for human review', () => {
    const first = projectSourceRegister(currentTruthCorpus);
    expect(first).toContain('| buzzard-2000-classical |');
    expect(first).toContain('| classical-atlas-concept-audit-v1 |');
    expect(first).toBe(projectSourceRegister({ ...currentTruthCorpus, sources: [...currentTruthCorpus.sources].reverse() }));
    const reordered = createTruthIndex({
      ...currentTruthCorpus,
      sources: [...currentTruthCorpus.sources].reverse(),
      claims: [...currentTruthCorpus.claims].reverse(),
      treatments: [...currentTruthCorpus.treatments].reverse(),
    }, currentTruthValidationEnvironment);
    expect(reordered.treatmentsDependingOnSource('classical-atlas-concept-audit-v1').map(({ record }) => record.treatmentId))
      .toEqual(currentTruthIndex.treatmentsDependingOnSource('classical-atlas-concept-audit-v1').map(({ record }) => record.treatmentId));
  });

});
