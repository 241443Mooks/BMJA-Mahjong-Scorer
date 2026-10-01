import type { ProfileTreatment } from '../../../rules-platform/truth-model';
import { versioned } from '../records';
import { mcrFanE2Bindings } from '../subjects/mcr-fan-e2';

const profile = { id: 'mcr-wmo-2006', version: '0.1' } as const;

export const mcrFanE2Treatments = mcrFanE2Bindings.map(({ binding, subjectId, claimId, treatmentId }) =>
  versioned<ProfileTreatment>(treatmentId, {
    treatmentId,
    profile,
    subjectId,
    runtimeState: { kind: 'executable', ref: { kind: 'binding', id: binding.id } },
    evidenceClaimIds: [claimId],
  }),
);
