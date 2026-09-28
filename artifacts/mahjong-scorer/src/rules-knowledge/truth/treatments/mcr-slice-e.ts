import type { ProfileTreatment, RuntimeTreatmentRef } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const profile = { id: 'mcr-wmo-2006', version: '0.1' } as const;
const treatment = (treatmentId: string, subjectId: string, claimId: string, ref: RuntimeTreatmentRef) => versioned<ProfileTreatment>(treatmentId, {
  treatmentId, profile, subjectId, runtimeState: { kind: 'executable', ref }, evidenceClaimIds: [claimId],
});

export const mcrSliceETreatments = [
  treatment('mcr-wmo-2006@0.1:thirteen-orphans', 'pattern.thirteen-orphans', 'evidence.pattern.thirteen-orphans.mcr-wmo-2006', { kind: 'binding', id: 'mcr2006.fan.thirteen-orphans' }),
  treatment('mcr-wmo-2006@0.1:non-combination', 'rule.mcr-2006-non-combination', 'evidence.rule.mcr-2006-non-combination', { kind: 'policy', id: 'interaction.mcr-2006-non-combination' }),
  treatment('mcr-wmo-2006@0.1:eight-point-qualification', 'rule.mcr-8-before-flowers', 'evidence.rule.mcr-8-before-flowers', { kind: 'policy', id: 'qualification.mcr-8-before-flowers' }),
];
