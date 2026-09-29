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
import { westernTmB4aSpecialHandSubjects } from './subjects/western-tm-b4a-special-hands';
import { westernTmB4aSpecialHandClaims } from './claims/western-tm-b4a-special-hands';
import { westernTmB4aSpecialHandTreatments } from './treatments/western-tm-b4a-special-hands';
import { westernTmB4bSpecialHandSubjects } from './subjects/western-tm-b4b-pairs-winds';
import { westernTmB4bSpecialHandClaims } from './claims/western-tm-b4b-pairs-winds';
import { westernTmB4bSpecialHandTreatments } from './treatments/western-tm-b4b-pairs-winds';

export const currentTruthCorpus = {
  sources: [...sourceRecords, ...mcrSourceRecords],
  subjects: [...thirteenUniqueWondersSubjects, ...bmjaSpecialHandSubjects, ...otbSpecialHandSubjects, ...buzzard2000SpecialHandSubjects, ...westernTmB4aSpecialHandSubjects, ...westernTmB4bSpecialHandSubjects, ...mcrSliceESubjects],
  claims: [...thirteenUniqueWondersClaims, ...bmjaSpecialHandClaims, ...otbSpecialHandClaims, ...buzzard2000SpecialHandClaims, ...westernTmB4aSpecialHandClaims, ...westernTmB4bSpecialHandClaims, ...mcrSliceEClaims],
  treatments: [...thirteenUniqueWondersTreatments, ...bmjaSpecialHandTreatments, ...otbSpecialHandTreatments, ...buzzard2000SpecialHandTreatments, ...westernTmB4aSpecialHandTreatments, ...westernTmB4bSpecialHandTreatments, ...mcrSliceETreatments],
} as const;

export const currentTruthIndex = createTruthIndex(currentTruthCorpus, currentTruthValidationEnvironment);
