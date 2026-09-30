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
import { westernTmB4cSpecialHandSubjects } from './subjects/western-tm-b4c-dragons-honours-colours';
import { westernTmB4cSpecialHandClaims } from './claims/western-tm-b4c-dragons-honours-colours';
import { westernTmB4cSpecialHandTreatments } from './treatments/western-tm-b4c-dragons-honours-colours';
import { westernTmB4dSpecialHandSubjects } from './subjects/western-tm-b4d-calculated-special-hands';
import { westernTmB4dSpecialHandClaims } from './claims/western-tm-b4d-calculated-special-hands';
import { westernTmB4dSpecialHandTreatments } from './treatments/western-tm-b4d-calculated-special-hands';
import { classicalOrdinaryFoundationClaims, classicalOrdinaryFoundationSubjects, classicalOrdinaryFoundationTreatments } from './classical-ordinary-foundations';
import { classicalScoringDelta440c2aClaims, classicalScoringDelta440c2aSubjects, classicalScoringDelta440c2aTreatments } from './classical-scoring-deltas-440c2a';
import { classicalScoringDelta440c2bClaims, classicalScoringDelta440c2bSubjects, classicalScoringDelta440c2bTreatments } from './classical-scoring-deltas-440c2b';
import { classicalHandValidation440c3aClaims, classicalHandValidation440c3aSubjects, classicalHandValidation440c3aTreatments } from './classical-hand-validation-440c3a';

export const currentTruthCorpus = {
  sources: [...sourceRecords, ...mcrSourceRecords],
  subjects: [...thirteenUniqueWondersSubjects, ...bmjaSpecialHandSubjects, ...otbSpecialHandSubjects, ...buzzard2000SpecialHandSubjects, ...westernTmB4aSpecialHandSubjects, ...westernTmB4bSpecialHandSubjects, ...westernTmB4cSpecialHandSubjects, ...westernTmB4dSpecialHandSubjects, ...mcrSliceESubjects, ...classicalOrdinaryFoundationSubjects, ...classicalScoringDelta440c2aSubjects, ...classicalScoringDelta440c2bSubjects, ...classicalHandValidation440c3aSubjects],
  claims: [...thirteenUniqueWondersClaims, ...bmjaSpecialHandClaims, ...otbSpecialHandClaims, ...buzzard2000SpecialHandClaims, ...westernTmB4aSpecialHandClaims, ...westernTmB4bSpecialHandClaims, ...westernTmB4cSpecialHandClaims, ...westernTmB4dSpecialHandClaims, ...mcrSliceEClaims, ...classicalOrdinaryFoundationClaims, ...classicalScoringDelta440c2aClaims, ...classicalScoringDelta440c2bClaims, ...classicalHandValidation440c3aClaims],
  treatments: [...thirteenUniqueWondersTreatments, ...bmjaSpecialHandTreatments, ...otbSpecialHandTreatments, ...buzzard2000SpecialHandTreatments, ...westernTmB4aSpecialHandTreatments, ...westernTmB4bSpecialHandTreatments, ...westernTmB4cSpecialHandTreatments, ...westernTmB4dSpecialHandTreatments, ...mcrSliceETreatments, ...classicalOrdinaryFoundationTreatments, ...classicalScoringDelta440c2aTreatments, ...classicalScoringDelta440c2bTreatments, ...classicalHandValidation440c3aTreatments],
} as const;

export const currentTruthIndex = createTruthIndex(currentTruthCorpus, currentTruthValidationEnvironment);
