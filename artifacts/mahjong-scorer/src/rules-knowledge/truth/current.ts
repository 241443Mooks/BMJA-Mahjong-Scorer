import { thirteenUniqueWondersClaims } from './claims/thirteen-unique-wonders';
import { createTruthIndex } from './queries';
import { sourceRecords } from './sources';
import { thirteenUniqueWondersSubjects } from './subjects/thirteen-unique-wonders';
import { thirteenUniqueWondersTreatments } from './treatments/thirteen-unique-wonders';
import { currentTruthValidationEnvironment } from './current-validation-environment';

export const currentTruthCorpus = {
  sources: sourceRecords,
  subjects: [...thirteenUniqueWondersSubjects],
  claims: [...thirteenUniqueWondersClaims],
  treatments: [...thirteenUniqueWondersTreatments],
} as const;

export const currentTruthIndex = createTruthIndex(currentTruthCorpus, currentTruthValidationEnvironment);
