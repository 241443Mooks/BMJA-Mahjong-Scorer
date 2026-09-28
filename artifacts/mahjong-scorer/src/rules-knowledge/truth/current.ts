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

export const currentTruthCorpus = {
  sources: [...sourceRecords, ...mcrSourceRecords],
  subjects: [...thirteenUniqueWondersSubjects, ...mcrSliceESubjects],
  claims: [...thirteenUniqueWondersClaims, ...mcrSliceEClaims],
  treatments: [...thirteenUniqueWondersTreatments, ...mcrSliceETreatments],
} as const;

export const currentTruthIndex = createTruthIndex(currentTruthCorpus, currentTruthValidationEnvironment);
