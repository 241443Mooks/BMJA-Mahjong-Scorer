import type { ProfileTreatment, ProfileTreatmentRuntimeState } from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';
import type { TruthIndex } from './queries';

export type KnownTruthProjectionRef = { treatmentId: string; projectionId: string };
export type TruthSourceImpact = {
  sourceId: string;
  claimIds: string[];
  subjects: { subjectId: string; treatmentIds: string[] }[];
  treatments: { treatmentId: string; profile: RulesProfileRef; runtimeState: ProfileTreatmentRuntimeState }[];
  projections: KnownTruthProjectionRef[];
};

/** Projects deterministic source -> claim -> subject/treatment -> runtime/projection impact. */
export const truthImpactForSource = (
  index: TruthIndex,
  sourceId: string,
  knownProjections: readonly KnownTruthProjectionRef[] = [],
): TruthSourceImpact => {
  const claims = index.claimsForSource(sourceId);
  const treatments = index.treatmentsDependingOnSource(sourceId);
  const treatmentsBySubject = new Map<string, string[]>();
  for (const { record: treatment } of treatments) {
    treatmentsBySubject.set(treatment.subjectId, [...(treatmentsBySubject.get(treatment.subjectId) ?? []), treatment.treatmentId]);
  }
  const impactedTreatmentIds = new Set(treatments.map(({ record }) => record.treatmentId));
  return {
    sourceId,
    claimIds: claims.map(({ record }) => record.claimId).sort(),
    subjects: [...new Set([
      ...claims.map(({ record }) => record.subjectId),
      ...treatments.map(({ record }) => record.subjectId),
    ])].sort().map((subjectId) => ({ subjectId, treatmentIds: [...(treatmentsBySubject.get(subjectId) ?? [])].sort() })),
    treatments: treatments.map(({ record }) => ({
      treatmentId: record.treatmentId,
      profile: record.profile,
      runtimeState: record.runtimeState,
    } satisfies Pick<ProfileTreatment, 'treatmentId' | 'profile' | 'runtimeState'>)),
    projections: knownProjections
      .filter(({ treatmentId }) => impactedTreatmentIds.has(treatmentId))
      .map((projection) => ({ ...projection }))
      .sort((a, b) => a.treatmentId < b.treatmentId ? -1 : a.treatmentId > b.treatmentId ? 1 : a.projectionId < b.projectionId ? -1 : a.projectionId > b.projectionId ? 1 : 0),
  };
};
