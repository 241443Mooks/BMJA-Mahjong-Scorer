import type { ProfileTreatment } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const profile = { id: 'mcr-wmo-2006', version: '0.1' } as const;
const treatment = (slug: string) => {
  const subjectId = `rule.mcr-e4-${slug}`;
  const treatmentId = `mcr-wmo-2006@0.1:e4-${slug}`;
  return versioned<ProfileTreatment>(treatmentId, {
    treatmentId,
    profile,
    subjectId,
    runtimeState: { kind: 'migration-incomplete' },
    evidenceClaimIds: [`evidence.${subjectId}`],
  });
};

export const mcrE4ProfileTreatments = [
  treatment('permitted-winning-structures'),
  treatment('basic-points-from-lawful-fan'),
  treatment('discard-win-settlement'),
  treatment('self-draw-settlement'),
  treatment('dealer-always-passes'),
  treatment('four-dealer-positions-complete-round'),
  treatment('prevailing-wind-order'),
  treatment('four-wind-rounds-complete-game'),
];
