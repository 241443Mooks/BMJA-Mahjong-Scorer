import type { ProfileTreatment } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const bindings = [
  ['knitting', 'knitting'],
  ['triple-knitting', 'triple-knitting'],
  ['all-pair-honours', 'all-pair-honours'],
  ['imperial-jade', 'imperial-jade'],
  ['gates-of-heaven', 'gates-of-heaven'],
  ['wriggling-snake', 'wriggling-snake'],
  ['all-winds-and-dragons', 'all-winds-and-dragons'],
  ['heads-and-tails', 'heads-and-tails'],
  ['fourfold-plenty', 'fourfold-plenty'],
  ['three-great-scholars', 'three-great-scholars'],
  ['four-blessings-hovering-over-the-door', 'four-blessings'],
  ['buried-treasure', 'buried-treasure'],
  ['heavens-blessing', 'heavens-blessing'],
  ['earths-blessing', 'earths-blessing'],
  ['gathering-plum-blossom-from-the-roof', 'gathering-plum-blossom'],
  ['plucking-moon-from-bottom-of-the-sea', 'plucking-moon'],
  ['twofold-fortune', 'twofold-fortune'],
] as const;

export const bmjaSpecialHandTreatments = bindings.map(([semanticId, bindingId]) => {
  const subjectId = `pattern.bmja.${semanticId}`;
  const claimId = `evidence.pattern.bmja.${bindingId}`;
  const treatmentId = `bmja@1.0:${bindingId}`;
  return versioned<ProfileTreatment>(treatmentId, {
    treatmentId,
    profile: { id: 'bmja', version: '1.0' },
    subjectId,
    runtimeState: { kind: 'executable', ref: { kind: 'binding', id: bindingId } },
    evidenceClaimIds: [claimId],
  });
});
