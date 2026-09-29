import type { SemanticSubject } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const subjectIds = [
  'pattern.bmja.knitting',
  'pattern.bmja.triple-knitting',
  'pattern.bmja.all-pair-honours',
  'pattern.bmja.imperial-jade',
  'pattern.bmja.gates-of-heaven',
  'pattern.bmja.wriggling-snake',
  'pattern.bmja.all-winds-and-dragons',
  'pattern.bmja.heads-and-tails',
  'pattern.bmja.fourfold-plenty',
  'pattern.bmja.three-great-scholars',
  'pattern.bmja.four-blessings-hovering-over-the-door',
  'pattern.bmja.buried-treasure',
  'pattern.bmja.heavens-blessing',
  'pattern.bmja.earths-blessing',
  'pattern.bmja.gathering-plum-blossom-from-the-roof',
  'pattern.bmja.plucking-moon-from-bottom-of-the-sea',
  'pattern.bmja.twofold-fortune',
] as const;

export const bmjaSpecialHandSubjects = subjectIds.map((id) =>
  versioned<SemanticSubject>(id, { id, kind: 'pattern' }),
);
