import type { SemanticSubject } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

export const mcrE4ProfileSubjects = [
  versioned<SemanticSubject>('rule.mcr-e4-permitted-winning-structures', { id: 'rule.mcr-e4-permitted-winning-structures', kind: 'rule' }),
  versioned<SemanticSubject>('rule.mcr-e4-basic-points-from-lawful-fan', { id: 'rule.mcr-e4-basic-points-from-lawful-fan', kind: 'rule' }),
  versioned<SemanticSubject>('rule.mcr-e4-discard-win-settlement', { id: 'rule.mcr-e4-discard-win-settlement', kind: 'rule' }),
  versioned<SemanticSubject>('rule.mcr-e4-self-draw-settlement', { id: 'rule.mcr-e4-self-draw-settlement', kind: 'rule' }),
  versioned<SemanticSubject>('rule.mcr-e4-dealer-always-passes', { id: 'rule.mcr-e4-dealer-always-passes', kind: 'rule' }),
  versioned<SemanticSubject>('rule.mcr-e4-four-dealer-positions-complete-round', { id: 'rule.mcr-e4-four-dealer-positions-complete-round', kind: 'rule' }),
  versioned<SemanticSubject>('rule.mcr-e4-prevailing-wind-order', { id: 'rule.mcr-e4-prevailing-wind-order', kind: 'rule' }),
  versioned<SemanticSubject>('rule.mcr-e4-four-wind-rounds-complete-game', { id: 'rule.mcr-e4-four-wind-rounds-complete-game', kind: 'rule' }),
];
