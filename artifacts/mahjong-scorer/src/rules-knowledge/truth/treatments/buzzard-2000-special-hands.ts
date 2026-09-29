import type { ProfileTreatment } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const profile = { id: 'buzzard-2000', version: '0.1' } as const;
const treatment = (patternId: string, subjectId: string, claimId: string) => {
  const id = `${profile.id}@${profile.version}:${patternId}`;
  return versioned<ProfileTreatment>(id, {
    treatmentId: id,
    profile,
    subjectId,
    runtimeState: { kind: 'executable', ref: { kind: 'binding', id: patternId } },
    evidenceClaimIds: [claimId],
  });
};

export const buzzard2000SpecialHandTreatments = [
  treatment('all-winds-and-dragons', 'pattern.buzzard-2000.all-winds-and-dragons', 'evidence.pattern.buzzard-2000.all-winds-and-dragons'),
  treatment('three-winds-and-fourth-wind-pair', 'pattern.buzzard-2000.three-winds-and-fourth-wind-pair', 'evidence.pattern.buzzard-2000.three-winds-and-fourth-wind-pair'),
  treatment('heavens-blessing', 'pattern.buzzard-2000.original-hand', 'evidence.pattern.buzzard-2000.original-hand'),
  treatment('earths-blessing', 'pattern.buzzard-2000.easts-first-discard', 'evidence.pattern.buzzard-2000.easts-first-discard'),
  treatment('heads-and-tails', 'pattern.buzzard-2000.all-ones-and-nines', 'evidence.pattern.buzzard-2000.all-ones-and-nines'),
  treatment('buzzard-three-dragons-winner', 'pattern.buzzard-2000.three-dragons-winner', 'evidence.pattern.buzzard-2000.three-dragons-winner'),
  treatment('one-suit-nine-gates-any-completion', 'pattern.buzzard-2000.calling-nine-tile-hand', 'evidence.pattern.buzzard-2000.calling-nine-tile-hand'),
  treatment('east-thirteenth-consecutive-mahjong', 'pattern.buzzard-2000.easts-thirteenth-consecutive-mahjong', 'evidence.pattern.buzzard-2000.easts-thirteenth-consecutive-mahjong'),
];
