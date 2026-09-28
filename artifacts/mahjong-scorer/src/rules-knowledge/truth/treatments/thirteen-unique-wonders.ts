import type { ProfileTreatment } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const subjectId = 'pattern.thirteen-orphans';
const supplemental = 'evidence.pattern.thirteen-orphans.classical-membership-audit';
const treatment = (id: string, profile: ProfileTreatment['profile'], claimId: string) => versioned<ProfileTreatment>(id, {
  treatmentId: id,
  profile,
  subjectId,
  runtimeState: { kind: 'executable', ref: { kind: 'binding', id: 'thirteen-unique-wonders' } },
  evidenceClaimIds: [claimId, supplemental],
});

export const thirteenUniqueWondersTreatments = [
  treatment('bmja@1.0:thirteen-unique-wonders', { id: 'bmja', version: '1.0' }, 'evidence.pattern.thirteen-orphans.bmja'),
  treatment('western-tm@0.1:thirteen-unique-wonders', { id: 'western-tm', version: '0.1' }, 'evidence.pattern.thirteen-orphans.western-tm'),
  treatment('outside-the-box@0.1:thirteen-unique-wonders', { id: 'outside-the-box', version: '0.1' }, 'evidence.pattern.thirteen-orphans.outside-the-box'),
  treatment('buzzard-2000@0.1:thirteen-unique-wonders', { id: 'buzzard-2000', version: '0.1' }, 'evidence.pattern.thirteen-orphans.buzzard-2000'),
];
