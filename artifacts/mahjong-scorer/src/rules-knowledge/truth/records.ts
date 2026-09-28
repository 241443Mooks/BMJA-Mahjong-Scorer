import type { EvidenceClaim, ProfileTreatment, SemanticSubject, SourceRecord, VersionedTruthRecord } from '../../rules-platform/truth-model';

export type TruthCorpus = {
  sources: readonly VersionedTruthRecord<SourceRecord>[];
  subjects: readonly VersionedTruthRecord<SemanticSubject>[];
  claims: readonly VersionedTruthRecord<EvidenceClaim>[];
  treatments: readonly VersionedTruthRecord<ProfileTreatment>[];
};

export const versioned = <T>(recordId: string, record: T): VersionedTruthRecord<T> => ({
  schemaVersion: 0,
  recordId,
  recordVersion: 1,
  lifecycle: 'current',
  record,
});
