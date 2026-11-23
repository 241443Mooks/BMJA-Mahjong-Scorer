import type { RulesProfileRef } from '../rules-platform/types';
import type { ReferenceConceptId, ReviewedReferenceRelationship } from './reference-crosswalk';
import {
  referenceConceptsForDimension,
  referenceRelationshipsForConcept,
  referenceTreatmentsForConcept,
} from './reference-crosswalk';
import type { RulesDimensionId } from '../rules-platform/profile-dimensions';

export type PublicationState = 'publishable' | 'withheld';
export type ReferencePublicationPolicy = {
  concepts: Readonly<Record<ReferenceConceptId, PublicationState>>;
  treatments: Readonly<Record<string, PublicationState>>;
  relationships: Readonly<Record<string, PublicationState>>;
  profiles: Readonly<Record<string, PublicationState>>;
};

const profileKey = (profile: RulesProfileRef) => `${profile.id}@${profile.version}`;

/** Editorial release controls are deliberately separate from governed truth and semantic relationships. */
export const referencePublicationPolicy: ReferencePublicationPolicy = Object.freeze({
  concepts: {
    'pattern.thirteen-orphans': 'publishable',
    'pattern.bmja.imperial-jade': 'publishable',
    'pattern.bmja.wriggling-snake': 'publishable',
    'dimension:scoring.grammar': 'publishable',
    'pattern.bmja.gates-of-heaven': 'withheld',
    'pattern.mcr-wmo-2006.nine-gates': 'withheld',
    'pattern.mcr-wmo-2006.all-green': 'withheld',
  },
  treatments: {
    'bmja@1.0:thirteen-unique-wonders': 'publishable',
    'western-tm@0.1:thirteen-unique-wonders': 'publishable',
    'outside-the-box@0.1:thirteen-unique-wonders': 'publishable',
    'buzzard-2000@0.1:thirteen-unique-wonders': 'publishable',
    'mcr-wmo-2006@0.1:thirteen-orphans': 'withheld',
    'bmja@1.0:imperial-jade': 'publishable',
    'mcr-wmo-2006@0.1:all-green': 'withheld',
    'bmja@1.0:wriggling-snake': 'publishable',
    'bmja@1.0:gates-of-heaven': 'withheld',
    'mcr-wmo-2006@0.1:nine-gates': 'withheld',
  },
  relationships: {
    'thirteen-orphans-classical-mcr': 'withheld',
    'imperial-jade-narrower-than-all-green': 'withheld',
    'bmja-wriggling-snake-no-mcr-partner': 'withheld',
    'gates-of-heaven-nine-gates-unresolved': 'withheld',
  },
  profiles: {
    'bmja@1.0': 'publishable',
    'western-tm@0.1': 'publishable',
    'outside-the-box@0.1': 'publishable',
    'buzzard-2000@0.1': 'publishable',
    'mcr-wmo-2006@0.1': 'withheld',
  },
});

export type PublicTreatmentCandidate<T> = {
  treatment: T;
  treatmentId: string;
  profile: RulesProfileRef;
};

export type PublicConceptProjection<T, P> = {
  conceptId: ReferenceConceptId;
  treatments: Array<PublicTreatmentCandidate<T> & { presentation: P }>;
  relationships: ReviewedReferenceRelationship[];
};

/** Generic projection seam; a treatment joins public output only through explicit release data. */
export function projectPublicConcept<T extends { treatmentId: string; profile: RulesProfileRef }, P>({
  conceptId,
  policy = referencePublicationPolicy,
  treatments = referenceTreatmentsForConcept(conceptId).map(({ record }) => record) as unknown as readonly T[],
  relationships = referenceRelationshipsForConcept(conceptId),
  presentTreatment,
}: {
  conceptId: ReferenceConceptId;
  policy?: ReferencePublicationPolicy;
  treatments?: readonly T[];
  relationships?: readonly ReviewedReferenceRelationship[];
  presentTreatment: (treatment: T) => P | undefined;
}): PublicConceptProjection<T, P> | undefined {
  if (policy.concepts[conceptId] !== 'publishable') return undefined;
  const published = treatments.flatMap((treatment) => {
    if (policy.treatments[treatment.treatmentId] !== 'publishable') return [];
    const presentation = presentTreatment(treatment);
    return presentation === undefined ? [] : [{ treatment, treatmentId: treatment.treatmentId, profile: treatment.profile, presentation }];
  });
  const visibleIds = new Set(published.map(({ treatmentId }) => treatmentId));
  const visibleRelationships = relationships.filter((relationship) =>
    policy.relationships[relationship.id] === 'publishable'
      && relationship.kind !== 'unresolved'
      && relationship.treatmentIds.every((id) => visibleIds.has(id)));
  return { conceptId, treatments: published, relationships: visibleRelationships };
}

export const publicConceptIds = (): ReferenceConceptId[] => Object.entries(referencePublicationPolicy.concepts)
  .flatMap(([conceptId, state]) => state === 'publishable' ? [conceptId] : []);

export const publicProfiles = (): RulesProfileRef[] => Object.entries(referencePublicationPolicy.profiles)
  .flatMap(([key, state]) => {
    if (state !== 'publishable') return [];
    const separator = key.lastIndexOf('@');
    return [{ id: key.slice(0, separator), version: key.slice(separator + 1) }];
  });

export const publicDimensionConcepts = (dimensionId: RulesDimensionId) =>
  referenceConceptsForDimension(dimensionId).filter(({ conceptId }) => referencePublicationPolicy.concepts[conceptId] === 'publishable');

export const publicationStateForProfile = (profile: RulesProfileRef): PublicationState | undefined =>
  referencePublicationPolicy.profiles[profileKey(profile)];
