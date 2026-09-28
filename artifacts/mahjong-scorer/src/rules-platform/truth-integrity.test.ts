import { describe, expect, it } from 'vitest';
import {
  assertTruthCorpusIntegrity,
  createTruthIndex,
  currentTruthCorpus,
  currentTruthValidationEnvironment,
  validateTruthCorpus,
} from '../rules-knowledge/truth';
import type { TruthCorpus } from '../rules-knowledge/truth';

const copyCorpus = (): TruthCorpus => structuredClone(currentTruthCorpus) as TruthCorpus;
const issueCodes = (corpus: TruthCorpus) => validateTruthCorpus(corpus, currentTruthValidationEnvironment).map(({ code }) => code);
const hasCode = (corpus: TruthCorpus, code: string) => expect(issueCodes(corpus)).toContain(code);

describe('truth corpus integrity gate', () => {
  it('accepts the migrated corpus and asserts fail closed', () => {
    expect(validateTruthCorpus(currentTruthCorpus, currentTruthValidationEnvironment)).toEqual([]);
    expect(() => assertTruthCorpusIntegrity(currentTruthCorpus, currentTruthValidationEnvironment)).not.toThrow();
  });

  it('finds duplicate current stable IDs before index construction', () => {
    for (const kind of ['sources', 'subjects', 'claims', 'treatments'] as const) {
      const corpus = copyCorpus();
      corpus[kind] = [...corpus[kind], corpus[kind][0]!] as never;
      hasCode(corpus, 'DUPLICATE_STABLE_ID');
      hasCode(corpus, 'AMBIGUOUS_CURRENT_REVISION');
      expect(() => assertTruthCorpusIntegrity(corpus, currentTruthValidationEnvironment)).toThrow();
      expect(() => createTruthIndex(corpus, currentTruthValidationEnvironment)).toThrow();
    }
  });

  it('checks version wrapper identity and revision validity', () => {
    const wrongIdentity = copyCorpus();
    wrongIdentity.sources[0]!.recordId = 'wrong-source-id';
    hasCode(wrongIdentity, 'RECORD_ID_MISMATCH');

    const badVersion = copyCorpus();
    badVersion.subjects[0]!.recordVersion = 0;
    hasCode(badVersion, 'INVALID_RECORD_VERSION');

    const badSchema = copyCorpus();
    (badSchema.claims[0]! as unknown as { schemaVersion: number }).schemaVersion = 1;
    hasCode(badSchema, 'INVALID_SCHEMA_VERSION');
  });

  it('reports orphaned claim sources and subjects', () => {
    const missingSource = copyCorpus();
    missingSource.claims[0]!.record.sourceId = 'source.missing';
    hasCode(missingSource, 'ORPHAN_SOURCE');

    const missingSubject = copyCorpus();
    missingSubject.claims[0]!.record.subjectId = 'pattern.missing';
    hasCode(missingSubject, 'ORPHAN_SUBJECT');
  });

  it('rejects materially empty locators', () => {
    const corpus = copyCorpus();
    corpus.claims[0]!.record.locator = { kind: 'url', url: '  ' };
    hasCode(corpus, 'EMPTY_LOCATOR');

    const missingLocator = copyCorpus();
    (missingLocator.claims[0]!.record as unknown as { locator?: unknown }).locator = undefined;
    hasCode(missingLocator, 'EMPTY_LOCATOR');
  });

  it('requires exact known profile versions on claims and treatments', () => {
    const claimProfile = copyCorpus();
    claimProfile.claims[0]!.record.supportsProfile = { id: 'bmja', version: '999' };
    hasCode(claimProfile, 'UNKNOWN_PROFILE');

    const treatmentProfile = copyCorpus();
    treatmentProfile.treatments[0]!.record.profile.version = '999';
    hasCode(treatmentProfile, 'UNKNOWN_PROFILE');

    const mismatchedAuthority = copyCorpus();
    mismatchedAuthority.sources[0]!.record.authorityForProfileIds = [];
    hasCode(mismatchedAuthority, 'SOURCE_PROFILE_SCOPE_MISMATCH');
  });

  it('requires treatment evidence to resolve and concern the same subject', () => {
    const missingEvidence = copyCorpus();
    missingEvidence.treatments[0]!.record.evidenceClaimIds = ['claim.missing'];
    hasCode(missingEvidence, 'ORPHAN_TREATMENT_EVIDENCE');

    const mismatchedEvidence = copyCorpus();
    mismatchedEvidence.claims[0]!.record.subjectId = 'pattern.other';
    hasCode(mismatchedEvidence, 'MISMATCHED_TREATMENT_EVIDENCE');
  });

  it('does not let secondary-only or unresolved claims authorize execution', () => {
    const secondaryOnly = copyCorpus();
    secondaryOnly.treatments[0]!.record.evidenceClaimIds = ['evidence.pattern.thirteen-orphans.classical-membership-audit'];
    hasCode(secondaryOnly, 'UNRESOLVED_EXECUTABLE_EVIDENCE');

    const conflictingEvidence = copyCorpus();
    conflictingEvidence.claims[0]!.record.status = 'conflict';
    conflictingEvidence.treatments[0]!.record.evidenceClaimIds = [conflictingEvidence.claims[0]!.record.claimId];
    hasCode(conflictingEvidence, 'UNRESOLVED_EXECUTABLE_EVIDENCE');
  });

  it('resolves runtime refs through the exact-profile adapter', () => {
    expect(currentTruthValidationEnvironment.runtimeTreatmentExists(
      { id: 'western-tm', version: '0.1' }, { kind: 'binding', id: 'thirteen-unique-wonders' },
    )).toBe(true);
    expect(currentTruthValidationEnvironment.runtimeTreatmentExists(
      { id: 'western-tm', version: '0.2' }, { kind: 'binding', id: 'thirteen-unique-wonders' },
    )).toBe(false);
    const corpus = copyCorpus();
    corpus.treatments[0]!.record.runtimeState = { kind: 'executable', ref: { kind: 'binding', id: 'binding.missing' } };
    hasCode(corpus, 'UNKNOWN_RUNTIME_TREATMENT');
  });

  it('rejects duplicate or conflicting current treatment identities', () => {
    const duplicateStable = copyCorpus();
    duplicateStable.treatments = [...duplicateStable.treatments, structuredClone(duplicateStable.treatments[0]!)];
    hasCode(duplicateStable, 'DUPLICATE_STABLE_ID');

    const conflictingSubjectTreatment = copyCorpus();
    const first = structuredClone(conflictingSubjectTreatment.treatments[0]!);
    first.recordId = 'alternate-treatment-record';
    first.record.treatmentId = 'alternate-treatment-record';
    conflictingSubjectTreatment.treatments = [...conflictingSubjectTreatment.treatments, first];
    hasCode(conflictingSubjectTreatment, 'CONFLICTING_CURRENT_TREATMENT');
  });

  it('returns byte-stable diagnostics under input reordering', () => {
    const corpus = copyCorpus();
    corpus.claims[0]!.record.locator = { kind: 'url', url: '' };
    corpus.claims[1]!.record.sourceId = 'source.missing';
    const reordered: TruthCorpus = {
      sources: [...corpus.sources].reverse(),
      subjects: [...corpus.subjects].reverse(),
      claims: [...corpus.claims].reverse(),
      treatments: [...corpus.treatments].reverse(),
    };
    expect(validateTruthCorpus(corpus, currentTruthValidationEnvironment))
      .toEqual(validateTruthCorpus(reordered, currentTruthValidationEnvironment));

    const duplicateClaim = copyCorpus();
    const conflictingRevision = structuredClone(duplicateClaim.claims[0]!);
    conflictingRevision.record.subjectId = 'pattern.other';
    duplicateClaim.claims = [...duplicateClaim.claims, conflictingRevision];
    const reorderedDuplicates: TruthCorpus = {
      sources: [...duplicateClaim.sources].reverse(),
      subjects: [...duplicateClaim.subjects].reverse(),
      claims: [...duplicateClaim.claims].reverse(),
      treatments: [...duplicateClaim.treatments].reverse(),
    };
    expect(validateTruthCorpus(duplicateClaim, currentTruthValidationEnvironment))
      .toEqual(validateTruthCorpus(reorderedDuplicates, currentTruthValidationEnvironment));
  });
});
