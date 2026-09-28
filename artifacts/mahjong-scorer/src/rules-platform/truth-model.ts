import type { RulesProfileRef } from './types';

/** Stable identity for a rule, structural pattern, or documented concept. */
export type SemanticSubject = {
  id: string;
  kind: 'rule' | 'pattern' | 'concept';
};

/** A source pointer precise enough to find the cited material again. */
export type SourceLocator =
  | { kind: 'url'; url: string; section?: string; page?: string }
  | { kind: 'publication'; title: string; edition?: string; year?: number; page?: string; section?: string }
  | { kind: 'club-material'; title: string; version?: string; date?: string; section?: string; page?: string }
  | { kind: 'image'; collection: string; imageId: string; page?: string };

export type SourceAuthority = 'governing' | 'published-primary' | 'club-primary' | 'secondary';

/** Registered source metadata. It stores citations and provenance, not copied source text. */
export type SourceRecord = {
  sourceId: string;
  citation: string;
  authority: SourceAuthority;
  authorityForProfileIds: readonly string[];
  publicationVersion?: string;
  recordedOn: string;
};

export type EvidenceStatus =
  | 'verified'
  | 'verified-club'
  | 'needs-primary-source'
  | 'needs-club-confirmation'
  | 'secondary-only'
  | 'conflict';

/** Epistemic state; it does not itself authorize executable behaviour. */
export type EvidenceClaim = {
  claimId: string;
  subjectId: string;
  sourceId: string;
  locator: SourceLocator;
  status: EvidenceStatus;
  claim: string;
  checkedOn: string;
  supportsProfile?: RulesProfileRef;
};

export type ProfileRelationship =
  | 'identical'
  | 'subset'
  | 'superset'
  | 'override'
  | 'alias'
  | 'unique'
  | 'unknown';

/** Pointer to an existing runtime-owned rule or binding; no treatment payload is copied here. */
export type RuntimeTreatmentRef =
  | { kind: 'rule'; id: string }
  | { kind: 'binding'; id: string }
  | { kind: 'policy'; id: string };

/** Runtime/treatment state is explicit; omission is never used to encode uncertainty. */
export type ProfileTreatmentRuntimeState =
  | { kind: 'executable'; ref: RuntimeTreatmentRef }
  | { kind: 'absent-by-rule' }
  | { kind: 'present-not-modelled' }
  | { kind: 'unknown' }
  | { kind: 'not-applicable' }
  | { kind: 'migration-incomplete' };

/** Exact profile/version treatment identity, joined to runtime by identity when executable. */
export type ProfileTreatment = {
  treatmentId: string;
  profile: RulesProfileRef;
  subjectId: string;
  runtimeState: ProfileTreatmentRuntimeState;
  evidenceClaimIds: readonly string[];
  relationships?: readonly {
    profile: RulesProfileRef;
    relationship: ProfileRelationship;
  }[];
};

/** Record lifecycle is separate from evidence confidence and runtime support. */
export type TruthRecordLifecycle = 'draft' | 'current' | 'superseded';

/** Identifies one immutable revision of a record with a stable record ID. */
export type TruthRecordVersionRef = {
  recordId: string;
  recordVersion: number;
};

export type VersionedTruthRecord<T> = {
  schemaVersion: 0;
  recordId: string;
  recordVersion: number;
  lifecycle: TruthRecordLifecycle;
  supersedes?: TruthRecordVersionRef;
  record: T;
};

/** Explicitly separate authoritative rule facts from downstream human projections. */
export type TruthOwnership =
  | { layer: 'runtime-truth'; owner: 'resolved-profile-artifact'; contains: 'executable-treatment' | 'runtime-support' }
  | { layer: 'reference-fact'; owner: 'runtime-projection'; contains: 'profile-treatment-fact' }
  | { layer: 'editorial-explanation'; owner: 'product-content'; contains: 'learner-wording' };
