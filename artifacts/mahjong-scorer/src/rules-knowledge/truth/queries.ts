import type { EvidenceClaim, EvidenceStatus, ProfileTreatment, SemanticSubject, SourceRecord, VersionedTruthRecord } from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';
import type { TruthCorpus } from './records';
import { assertTruthCorpusIntegrity, type TruthValidationEnvironment } from './integrity';

const byId = <T>(records: readonly VersionedTruthRecord<T>[], id: (record: T) => string) =>
  new Map(records.map((entry) => [id(entry.record), entry]));
const compareIds = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const ordered = <T>(records: readonly VersionedTruthRecord<T>[]) => [...records].sort((a, b) => compareIds(a.recordId, b.recordId));
const exactProfile = (a: RulesProfileRef, b: RulesProfileRef) => a.id === b.id && a.version === b.version;

export type TruthIndex = ReturnType<typeof createTruthIndex>;

export const createTruthIndex = (corpus: TruthCorpus, environment: TruthValidationEnvironment) => {
  assertTruthCorpusIntegrity(corpus, environment);
  const sources = ordered(corpus.sources.filter(({ lifecycle }) => lifecycle === 'current'));
  const subjects = ordered(corpus.subjects.filter(({ lifecycle }) => lifecycle === 'current'));
  const claims = ordered(corpus.claims.filter(({ lifecycle }) => lifecycle === 'current'));
  const treatments = ordered(corpus.treatments.filter(({ lifecycle }) => lifecycle === 'current'));
  const sourcesById = byId(sources, (record: SourceRecord) => record.sourceId);
  const subjectsById = byId(subjects, (record: SemanticSubject) => record.id);
  const claimsById = byId(claims, (record: EvidenceClaim) => record.claimId);
  const treatmentsById = byId(treatments, (record: ProfileTreatment) => record.treatmentId);
  const claimsFor = (predicate: (claim: EvidenceClaim) => boolean) => claims.filter(({ record }) => predicate(record));
  const treatmentsFor = (predicate: (treatment: ProfileTreatment) => boolean) => treatments.filter(({ record }) => predicate(record));

  return {
    corpus: { sources, subjects, claims, treatments } satisfies TruthCorpus,
    sourceById: (id: string) => sourcesById.get(id),
    subjectById: (id: string) => subjectsById.get(id),
    claimsForSource: (id: string) => claimsFor((claim) => claim.sourceId === id),
    claimsForSubject: (id: string) => claimsFor((claim) => claim.subjectId === id),
    treatmentsForSubject: (id: string) => treatmentsFor((treatment) => treatment.subjectId === id),
    treatmentsForProfile: (profile: RulesProfileRef) => treatmentsFor((treatment) => exactProfile(treatment.profile, profile)),
    treatmentsDependingOnSource: (id: string, profile?: RulesProfileRef) => {
      const claimIds = new Set(claimsFor((claim) => claim.sourceId === id).map(({ record }) => record.claimId));
      return treatmentsFor((treatment) =>
        (profile === undefined || exactProfile(treatment.profile, profile))
        && treatment.evidenceClaimIds.some((claimId) => claimIds.has(claimId)));
    },
    claimsByStatus: (status: EvidenceStatus) => claimsFor((claim) => claim.status === status),
    unresolvedClaims: () => claimsFor((claim) =>
      claim.status === 'needs-primary-source'
      || claim.status === 'needs-club-confirmation'
      || claim.status === 'conflict'),
    claimsSupportingProfile: (profile: RulesProfileRef) => claimsFor((claim) => claim.supportsProfile !== undefined && exactProfile(claim.supportsProfile, profile)),
    claimById: (id: string) => claimsById.get(id),
    treatmentById: (id: string) => treatmentsById.get(id),
  };
};
