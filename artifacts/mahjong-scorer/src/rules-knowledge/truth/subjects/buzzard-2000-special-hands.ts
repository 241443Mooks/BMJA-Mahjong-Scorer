import type { SemanticSubject } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const subjectIds = [
  'pattern.buzzard-2000.all-winds-and-dragons',
  'pattern.buzzard-2000.three-winds-and-fourth-wind-pair',
  'pattern.buzzard-2000.original-hand',
  'pattern.buzzard-2000.easts-first-discard',
  'pattern.buzzard-2000.all-ones-and-nines',
  'pattern.buzzard-2000.three-dragons-winner',
  'pattern.buzzard-2000.calling-nine-tile-hand',
  'pattern.buzzard-2000.easts-thirteenth-consecutive-mahjong',
] as const;

export const buzzard2000SpecialHandSubjects = subjectIds.map((id) =>
  versioned<SemanticSubject>(id, { id, kind: 'pattern' }),
);
