import type { EvidenceClaim, RuntimeTreatmentRef, SourceLocator, SourceRecord, VersionedTruthRecord } from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';
import type { TruthCorpus } from './records';

export type TruthIntegrityIssueCode =
  | 'DUPLICATE_RECORD_ID'
  | 'DUPLICATE_STABLE_ID'
  | 'AMBIGUOUS_CURRENT_REVISION'
  | 'RECORD_ID_MISMATCH'
  | 'INVALID_RECORD_VERSION'
  | 'INVALID_SCHEMA_VERSION'
  | 'ORPHAN_SOURCE'
  | 'ORPHAN_SUBJECT'
  | 'EMPTY_LOCATOR'
  | 'UNKNOWN_PROFILE'
  | 'SOURCE_PROFILE_SCOPE_MISMATCH'
  | 'ORPHAN_TREATMENT_EVIDENCE'
  | 'MISMATCHED_TREATMENT_EVIDENCE'
  | 'MISSING_EXECUTABLE_EVIDENCE'
  | 'UNRESOLVED_EXECUTABLE_EVIDENCE'
  | 'UNKNOWN_RUNTIME_TREATMENT'
  | 'CONFLICTING_CURRENT_TREATMENT';

export type TruthIntegrityIssue = {
  code: TruthIntegrityIssueCode;
  path: string;
  recordId?: string;
  message: string;
};

export type TruthValidationEnvironment = {
  profileExists(profile: RulesProfileRef): boolean;
  runtimeTreatmentExists(profile: RulesProfileRef, ref: RuntimeTreatmentRef): boolean;
};

const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
const exactProfile = (a: RulesProfileRef, b: RulesProfileRef) => a.id === b.id && a.version === b.version;
const nonBlank = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const locatorIsMaterial = (claim: EvidenceClaim): boolean => {
  const locator = claim.locator as unknown;
  if (!locator || typeof locator !== 'object' || !('kind' in locator)) return false;
  const usable = locator as SourceLocator;
  switch (usable.kind) {
    case 'url':
      if (!nonBlank(usable.url)) return false;
      try { return ['http:', 'https:'].includes(new URL(usable.url).protocol); } catch { return false; }
    case 'publication':
      return nonBlank(usable.title) && (nonBlank(usable.page) || nonBlank(usable.section));
    case 'club-material':
      return nonBlank(usable.title)
        && [usable.version, usable.date, usable.section, usable.page].some(nonBlank);
    case 'image':
      return nonBlank(usable.collection) && nonBlank(usable.imageId);
    default:
      return false;
  }
};

type RecordSet<T> = { name: string; records: readonly VersionedTruthRecord<T>[]; stableId(record: T): string };

const checkRecordSet = <T>(set: RecordSet<T>, issues: TruthIntegrityIssue[]) => {
  const wrapperIds = new Map<string, number>();
  const currentStableIds = new Map<string, number>();
  for (const entry of set.records) {
    const payloadId = set.stableId(entry.record);
    const path = `${set.name}.${entry.recordId}`;
    if (entry.schemaVersion !== 0) issues.push({ code: 'INVALID_SCHEMA_VERSION', path: `${path}.schemaVersion`, recordId: entry.recordId, message: 'Truth records must use schema version 0.' });
    if (!Number.isInteger(entry.recordVersion) || entry.recordVersion < 1) issues.push({ code: 'INVALID_RECORD_VERSION', path: `${path}.recordVersion`, recordId: entry.recordId, message: 'Record version must be a positive integer.' });
    if (entry.recordId !== payloadId) issues.push({ code: 'RECORD_ID_MISMATCH', path: `${path}.recordId`, recordId: entry.recordId, message: 'Version wrapper recordId must equal the payload stable identity.' });
    if (entry.lifecycle === 'current') {
      wrapperIds.set(entry.recordId, (wrapperIds.get(entry.recordId) ?? 0) + 1);
      currentStableIds.set(payloadId, (currentStableIds.get(payloadId) ?? 0) + 1);
    }
  }
  for (const [id, count] of wrapperIds) {
    if (count > 1) issues.push({ code: 'DUPLICATE_RECORD_ID', path: set.name, recordId: id, message: `Version wrapper ID ${id} occurs ${count} times.` });
  }
  for (const [id, count] of currentStableIds) {
    if (count > 1) {
      issues.push({ code: 'DUPLICATE_STABLE_ID', path: set.name, recordId: id, message: `Current stable ID ${id} occurs ${count} times.` });
      issues.push({ code: 'AMBIGUOUS_CURRENT_REVISION', path: set.name, recordId: id, message: `Current stable ID ${id} has more than one current revision.` });
    }
  }
};

const current = <T>(records: readonly VersionedTruthRecord<T>[]) => records.filter(({ lifecycle }) => lifecycle === 'current');

/** Deterministic, collecting integrity validation for the records currently migrated into the truth graph. */
export const validateTruthCorpus = (corpus: TruthCorpus, environment: TruthValidationEnvironment): TruthIntegrityIssue[] => {
  const issues: TruthIntegrityIssue[] = [];
  const sources = current(corpus.sources);
  const subjects = current(corpus.subjects);
  const claims = current(corpus.claims);
  const treatments = current(corpus.treatments);
  checkRecordSet({ name: 'sources', records: corpus.sources, stableId: (record) => record.sourceId }, issues);
  checkRecordSet({ name: 'subjects', records: corpus.subjects, stableId: (record) => record.id }, issues);
  checkRecordSet({ name: 'claims', records: corpus.claims, stableId: (record) => record.claimId }, issues);
  checkRecordSet({ name: 'treatments', records: corpus.treatments, stableId: (record) => record.treatmentId }, issues);

  const sourceIds = new Set(sources.map(({ record }) => record.sourceId));
  const sourcesById = new Map<string, SourceRecord[]>();
  for (const { record } of sources) {
    const records = sourcesById.get(record.sourceId);
    if (records) records.push(record);
    else sourcesById.set(record.sourceId, [record]);
  }
  const subjectIds = new Set(subjects.map(({ record }) => record.id));
  const claimsById = new Map<string, EvidenceClaim[]>();
  for (const { record } of claims) {
    const records = claimsById.get(record.claimId);
    if (records) records.push(record);
    else claimsById.set(record.claimId, [record]);
  }

  for (const { record: claim } of claims) {
    const recordId = claim.claimId;
    if (!subjectIds.has(claim.subjectId)) issues.push({ code: 'ORPHAN_SUBJECT', path: `claims.${recordId}.subjectId`, recordId, message: `Claim subject ${claim.subjectId} is not registered.` });
    if (!sourceIds.has(claim.sourceId)) issues.push({ code: 'ORPHAN_SOURCE', path: `claims.${recordId}.sourceId`, recordId, message: `Claim source ${claim.sourceId} is not registered.` });
    if (!locatorIsMaterial(claim)) issues.push({ code: 'EMPTY_LOCATOR', path: `claims.${recordId}.locator`, recordId, message: 'Evidence locator does not contain a usable source location.' });
    if (claim.supportsProfile && !environment.profileExists(claim.supportsProfile)) {
      issues.push({ code: 'UNKNOWN_PROFILE', path: `claims.${recordId}.supportsProfile`, recordId, message: `Supported profile ${claim.supportsProfile.id}@${claim.supportsProfile.version} is not registered.` });
    }
    if (claim.supportsProfile && !sourcesById.get(claim.sourceId)?.some((source) => source.authorityForProfileIds.includes(claim.supportsProfile!.id))) {
      issues.push({ code: 'SOURCE_PROFILE_SCOPE_MISMATCH', path: `claims.${recordId}.sourceId`, recordId, message: `Source ${claim.sourceId} is not registered as authority for profile ${claim.supportsProfile.id}.` });
    }
  }

  const treatmentKeys = new Map<string, string[]>();
  for (const { record: treatment } of treatments) {
    const recordId = treatment.treatmentId;
    if (!subjectIds.has(treatment.subjectId)) issues.push({ code: 'ORPHAN_SUBJECT', path: `treatments.${recordId}.subjectId`, recordId, message: `Treatment subject ${treatment.subjectId} is not registered.` });
    if (!environment.profileExists(treatment.profile)) issues.push({ code: 'UNKNOWN_PROFILE', path: `treatments.${recordId}.profile`, recordId, message: `Profile ${treatment.profile.id}@${treatment.profile.version} is not registered.` });
    for (const [index, relationship] of (treatment.relationships ?? []).entries()) {
      if (!environment.profileExists(relationship.profile)) issues.push({ code: 'UNKNOWN_PROFILE', path: `treatments.${recordId}.relationships[${index}].profile`, recordId, message: `Related profile ${relationship.profile.id}@${relationship.profile.version} is not registered.` });
    }
    const key = `${treatment.profile.id}@${treatment.profile.version}|${treatment.subjectId}`;
    const currentIds = treatmentKeys.get(key);
    if (currentIds) currentIds.push(recordId);
    else treatmentKeys.set(key, [recordId]);

    let hasExactAcceptableEvidence = false;
    for (const [index, claimId] of treatment.evidenceClaimIds.entries()) {
      const evidenceRecords = claimsById.get(claimId) ?? [];
      if (evidenceRecords.length === 0) {
        issues.push({ code: 'ORPHAN_TREATMENT_EVIDENCE', path: `treatments.${recordId}.evidenceClaimIds[${index}]`, recordId, message: `Evidence claim ${claimId} is not registered as current.` });
        continue;
      }
      if (evidenceRecords.some((evidence) => evidence.subjectId !== treatment.subjectId)) {
        issues.push({ code: 'MISMATCHED_TREATMENT_EVIDENCE', path: `treatments.${recordId}.evidenceClaimIds[${index}]`, recordId, message: `Evidence claim ${claimId} includes a different semantic subject from ${treatment.subjectId}.` });
      }
      if (evidenceRecords.some((evidence) => (evidence.status === 'verified' || evidence.status === 'verified-club')
        && evidence.subjectId === treatment.subjectId
        && evidence.supportsProfile !== undefined
        && exactProfile(evidence.supportsProfile, treatment.profile)
        && sourceIds.has(evidence.sourceId)
        && sourcesById.get(evidence.sourceId)?.some((source) => source.authorityForProfileIds.includes(treatment.profile.id)) === true)) hasExactAcceptableEvidence = true;
    }

    if (treatment.runtimeState.kind === 'executable') {
      if (!hasExactAcceptableEvidence) {
        const hasLinkedEvidence = treatment.evidenceClaimIds.some((claimId) => (claimsById.get(claimId)?.length ?? 0) > 0);
        issues.push({
          code: hasLinkedEvidence ? 'UNRESOLVED_EXECUTABLE_EVIDENCE' : 'MISSING_EXECUTABLE_EVIDENCE',
          path: `treatments.${recordId}.evidenceClaimIds`,
          recordId,
          message: 'Executable treatment requires verified or verified-club evidence for this exact subject and profile version.',
        });
      }
      if (!environment.runtimeTreatmentExists(treatment.profile, treatment.runtimeState.ref)) {
        issues.push({ code: 'UNKNOWN_RUNTIME_TREATMENT', path: `treatments.${recordId}.runtimeState.ref`, recordId, message: `Runtime treatment ${treatment.runtimeState.ref.kind}:${treatment.runtimeState.ref.id} is not registered for the exact profile.` });
      }
    }
  }

  for (const [key, ids] of treatmentKeys) {
    if (ids.length > 1) issues.push({ code: 'CONFLICTING_CURRENT_TREATMENT', path: 'treatments', recordId: [...ids].sort(compare)[0], message: `Multiple current treatments exist for ${key}.` });
  }

  return issues.sort((a, b) => compare(a.code, b.code) || compare(a.path, b.path) || compare(a.message, b.message));
};

export class TruthCorpusIntegrityError extends Error {
  constructor(readonly issues: readonly TruthIntegrityIssue[]) {
    super(`TRUTH_CORPUS_INVALID:${issues.map(({ code }) => code).join(',')}`);
    this.name = 'TruthCorpusIntegrityError';
  }
}

export const assertTruthCorpusIntegrity = (corpus: TruthCorpus, environment: TruthValidationEnvironment): void => {
  const issues = validateTruthCorpus(corpus, environment);
  if (issues.length > 0) throw new TruthCorpusIntegrityError(issues);
};
