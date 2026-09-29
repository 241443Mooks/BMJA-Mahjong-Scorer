import { thirteenUniqueWondersClaims } from './claims/thirteen-unique-wonders';
import { createTruthIndex } from './queries';
import { sourceRecords } from './sources';
import { thirteenUniqueWondersSubjects } from './subjects/thirteen-unique-wonders';
import { thirteenUniqueWondersTreatments } from './treatments/thirteen-unique-wonders';
import { currentTruthValidationEnvironment } from './current-validation-environment';
import { mcrSourceRecords } from './sources-mcr';
import { mcrSliceESubjects } from './subjects/mcr-slice-e';
import { mcrSliceEClaims } from './claims/mcr-slice-e';
import { mcrSliceETreatments } from './treatments/mcr-slice-e';
import { bmjaSpecialHandClaims } from './claims/bmja-special-hands';
import { bmjaSpecialHandSubjects } from './subjects/bmja-special-hands';
import { bmjaSpecialHandTreatments } from './treatments/bmja-special-hands';
import { otbSpecialHandClaims, otbSpecialHandSubjects, otbSpecialHandTreatments } from './otb-special-hands';
import { buzzard2000SpecialHandSubjects } from './subjects/buzzard-2000-special-hands';
import { buzzard2000SpecialHandClaims } from './claims/buzzard-2000-special-hands';
import { buzzard2000SpecialHandTreatments } from './treatments/buzzard-2000-special-hands';

export const currentTruthCorpus = {
  sources: [...sourceRecords, ...mcrSourceRecords],
  subjects: [...thirteenUniqueWondersSubjects, ...bmjaSpecialHandSubjects, ...otbSpecialHandSubjects, ...buzzard2000SpecialHandSubjects, ...mcrSliceESubjects],
  claims: [...thirteenUniqueWondersClaims, ...bmjaSpecialHandClaims, ...otbSpecialHandClaims, ...buzzard2000SpecialHandClaims, ...mcrSliceEClaims],
  treatments: [...thirteenUniqueWondersTreatments, ...bmjaSpecialHandTreatments, ...otbSpecialHandTreatments, ...buzzard2000SpecialHandTreatments, ...mcrSliceETreatments],
} as const;

export const currentTruthIndex = createTruthIndex(currentTruthCorpus, currentTruthValidationEnvironment);
