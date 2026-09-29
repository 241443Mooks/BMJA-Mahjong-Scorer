import type { ProfileTreatment } from '../../../rules-platform/truth-model';
import { versioned } from '../records';
import { westernTmB4cBindingIds } from '../subjects/western-tm-b4c-dragons-honours-colours';

const profile = { id: 'western-tm', version: '0.1' } as const;
const treatment = (patternId: (typeof westernTmB4cBindingIds)[number]) => {
  const id = `${profile.id}@${profile.version}:${patternId}`;
  return versioned<ProfileTreatment>(id, {
    treatmentId: id,
    profile,
    subjectId: `pattern.western-tm.${patternId}`,
    runtimeState: { kind: 'executable', ref: { kind: 'binding', id: patternId } },
    evidenceClaimIds: [`evidence.pattern.western-tm.${patternId}`],
  });
};

export const westernTmB4cSpecialHandTreatments = westernTmB4cBindingIds.map(treatment);
