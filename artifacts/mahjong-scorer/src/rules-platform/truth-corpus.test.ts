import { describe, expect, it } from 'vitest';
import { createTruthIndex, currentTruthCorpus, currentTruthIndex, projectSourceRegister } from '../rules-knowledge/truth';

describe('current typed truth corpus', () => {
  it('indexes exact source, subject, claim, and profile treatment identities', () => {
    const subjectId = 'pattern.thirteen-orphans';
    expect(currentTruthIndex.subjectById(subjectId)?.record.kind).toBe('pattern');
    expect(currentTruthIndex.claimsForSubject(subjectId)).toHaveLength(5);
    expect(currentTruthIndex.claimsForSource('buzzard-2000-classical').map(({ record }) => record.supportsProfile)).toEqual([
      { id: 'buzzard-2000', version: '0.1' },
    ]);
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
    expect(currentTruthIndex.claimsByStatus('secondary-only')).toHaveLength(1);
    expect(currentTruthIndex.unresolvedClaims().map(({ record }) => record.claimId)).toEqual([
      'evidence.pattern.thirteen-orphans.classical-membership-audit',
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
    });
    expect(reordered.treatmentsDependingOnSource('classical-atlas-concept-audit-v1').map(({ record }) => record.treatmentId))
      .toEqual(currentTruthIndex.treatmentsDependingOnSource('classical-atlas-concept-audit-v1').map(({ record }) => record.treatmentId));
  });

  it('refuses executable treatments without exact-profile verified evidence', () => {
    const secondaryOnly = currentTruthCorpus.claims.find(({ record }) => record.status === 'secondary-only')!;
    const invalid = {
      ...currentTruthCorpus,
      treatments: currentTruthCorpus.treatments.map((entry, index) => index === 0
        ? { ...entry, record: { ...entry.record, evidenceClaimIds: [secondaryOnly.record.claimId] } }
        : entry),
    };
    expect(() => createTruthIndex(invalid)).toThrow(/verified evidence for its exact subject and profile version/);
  });
});
