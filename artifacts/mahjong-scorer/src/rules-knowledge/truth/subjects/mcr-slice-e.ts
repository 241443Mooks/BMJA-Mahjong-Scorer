import type { SemanticSubject } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

export const mcrSliceESubjects = [
  versioned<SemanticSubject>('rule.mcr-2006-non-combination', { id: 'rule.mcr-2006-non-combination', kind: 'rule' }),
  versioned<SemanticSubject>('rule.mcr-8-before-flowers', { id: 'rule.mcr-8-before-flowers', kind: 'rule' }),
];
