import type { ProfileTreatment } from '../rules-platform/truth-model';
import type { RulesProfileRef } from '../rules-platform/types';
import type { RulesDimensionId } from '../rules-platform/profile-dimensions';
import { currentTruthIndex } from './truth';

/** #251 projection handle. Named-hand IDs reuse SemanticSubject IDs; dimension concepts reuse #406 IDs. */
export type ReferenceConceptId = string;

export type ReferenceConceptProjection = {
  conceptId: ReferenceConceptId;
  semanticSubjectIds: readonly string[];
  dimensionIds: readonly RulesDimensionId[];
};

export type ReferenceRelationshipKind =
  | 'equivalent'
  | 'narrower-than'
  | 'profile-specific'
  | 'unresolved';

/** Relationship metadata references governed treatments and evidence; it owns no rule facts. */
export type ReviewedReferenceRelationship = {
  id: string;
  kind: ReferenceRelationshipKind;
  /** For `narrower-than`, the first concept is narrower than the second. */
  conceptIds: readonly ReferenceConceptId[];
  treatmentIds: readonly string[];
  evidenceClaimIds: readonly string[];
  peerProfile?: RulesProfileRef;
};

export const referenceConceptProjections: readonly ReferenceConceptProjection[] = [
  {
    conceptId: 'pattern.thirteen-orphans',
    semanticSubjectIds: ['pattern.thirteen-orphans'],
    dimensionIds: [],
  },
  {
    conceptId: 'pattern.bmja.imperial-jade',
    semanticSubjectIds: ['pattern.bmja.imperial-jade'],
    dimensionIds: [],
  },
  {
    conceptId: 'pattern.mcr-wmo-2006.all-green',
    semanticSubjectIds: ['pattern.mcr-wmo-2006.all-green'],
    dimensionIds: [],
  },
  {
    conceptId: 'pattern.bmja.wriggling-snake',
    semanticSubjectIds: ['pattern.bmja.wriggling-snake'],
    dimensionIds: [],
  },
  {
    conceptId: 'pattern.bmja.gates-of-heaven',
    semanticSubjectIds: ['pattern.bmja.gates-of-heaven'],
    dimensionIds: [],
  },
  {
    conceptId: 'pattern.mcr-wmo-2006.nine-gates',
    semanticSubjectIds: ['pattern.mcr-wmo-2006.nine-gates'],
    dimensionIds: [],
  },
  {
    // This is a #251 view handle for the existing #406 dimension, not a SemanticSubject.
    conceptId: 'dimension:scoring.grammar',
    semanticSubjectIds: [],
    dimensionIds: ['scoring.grammar'],
  },
];

export const reviewedReferenceRelationships: readonly ReviewedReferenceRelationship[] = [
  {
    id: 'thirteen-orphans-classical-mcr',
    kind: 'equivalent',
    conceptIds: ['pattern.thirteen-orphans'],
    treatmentIds: [
      'bmja@1.0:thirteen-unique-wonders',
      'mcr-wmo-2006@0.1:thirteen-orphans',
    ],
    evidenceClaimIds: [
      'evidence.pattern.thirteen-orphans.bmja',
      'evidence.pattern.thirteen-orphans.mcr-wmo-2006',
    ],
  },
  {
    id: 'imperial-jade-narrower-than-all-green',
    kind: 'narrower-than',
    conceptIds: [
      'pattern.bmja.imperial-jade',
      'pattern.mcr-wmo-2006.all-green',
    ],
    treatmentIds: [
      'bmja@1.0:imperial-jade',
      'mcr-wmo-2006@0.1:all-green',
    ],
    evidenceClaimIds: [
      'evidence.pattern.bmja.imperial-jade',
      'evidence.pattern.mcr-wmo-2006.all-green',
    ],
  },
  {
    id: 'bmja-wriggling-snake-no-mcr-partner',
    kind: 'profile-specific',
    conceptIds: ['pattern.bmja.wriggling-snake'],
    treatmentIds: ['bmja@1.0:wriggling-snake'],
    evidenceClaimIds: ['evidence.pattern.bmja.wriggling-snake'],
    peerProfile: { id: 'mcr-wmo-2006', version: '0.1' },
  },
  {
    id: 'gates-of-heaven-nine-gates-unresolved',
    kind: 'unresolved',
    conceptIds: [
      'pattern.bmja.gates-of-heaven',
      'pattern.mcr-wmo-2006.nine-gates',
    ],
    treatmentIds: [
      'bmja@1.0:gates-of-heaven',
      'mcr-wmo-2006@0.1:nine-gates',
    ],
    evidenceClaimIds: [
      'evidence.pattern.bmja.gates-of-heaven',
      'evidence.pattern.mcr-wmo-2006.nine-gates',
    ],
  },
];

const projectionById = new Map(referenceConceptProjections.map((projection) => [projection.conceptId, projection]));

/** Returns current governed treatments for a projected concept without copying their facts. */
export const referenceTreatmentsForConcept = (conceptId: ReferenceConceptId) => {
  const projection = projectionById.get(conceptId);
  if (!projection) return [];
  const unique = new Map<string, NonNullable<ReturnType<typeof currentTruthIndex.treatmentById>>>();
  for (const subjectId of projection.semanticSubjectIds) {
    for (const entry of currentTruthIndex.treatmentsForSubject(subjectId)) unique.set(entry.record.treatmentId, entry);
  }
  return [...unique.values()];
};

/** Returns the #251 concept projection(s) for one exact governed treatment. */
export const referenceConceptsForTreatment = (treatmentId: string) => {
  const treatment = currentTruthIndex.treatmentById(treatmentId)?.record;
  if (!treatment) return [];
  return referenceConceptProjections.filter((projection) => projection.semanticSubjectIds.includes(treatment.subjectId));
};

/** Returns reviewed relationships that include both exact treatment identities. */
export const referenceRelationshipsBetweenTreatments = (leftTreatmentId: string, rightTreatmentId: string) =>
  reviewedReferenceRelationships.filter(({ treatmentIds }) =>
    treatmentIds.includes(leftTreatmentId) && treatmentIds.includes(rightTreatmentId));

/** Returns reviewed relationships that connect two projected concepts. */
export const referenceRelationshipsBetweenConcepts = (leftConceptId: ReferenceConceptId, rightConceptId: ReferenceConceptId) =>
  reviewedReferenceRelationships.filter(({ conceptIds }) =>
    conceptIds.includes(leftConceptId) && conceptIds.includes(rightConceptId));

/** Returns relationships touching a projected concept; unresolved rows remain queryable. */
export const referenceRelationshipsForConcept = (conceptId: ReferenceConceptId) =>
  reviewedReferenceRelationships.filter(({ conceptIds }) => conceptIds.includes(conceptId));

export const unresolvedReferenceRelationships = () =>
  reviewedReferenceRelationships.filter(({ kind }) => kind === 'unresolved');

/** Resolves an existing #406 dimension to its #251 projection handle. */
export const referenceConceptsForDimension = (dimensionId: RulesDimensionId) =>
  referenceConceptProjections.filter((projection) => projection.dimensionIds.includes(dimensionId));

export type GovernedReferenceTreatment = ProfileTreatment;
