import { scoreBonusDoubles, scoreBonusTiles } from '../../scoring/rules';
import type { RuntimeTreatmentRef } from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';

/** Explicit rule-to-owner registry; these links are proved by behavioural fixtures. */
export const classicalScoringRuleOwners = Object.freeze({
  'scoring.scoreBonusTiles': scoreBonusTiles,
  'scoring.scoreBonusDoubles': scoreBonusDoubles,
});

export const flowerSeasonRuntimeRefBySubject = Object.freeze({
  'rule.classical.flower-season-base-scoring': { kind: 'rule', id: 'scoring.scoreBonusTiles' },
  'rule.classical.own-flower-season-double': { kind: 'rule', id: 'scoring.scoreBonusDoubles' },
  'rule.classical.complete-flower-season-set-double': { kind: 'rule', id: 'scoring.scoreBonusDoubles' },
} satisfies Record<string, RuntimeTreatmentRef>);

export const isClassicalScoringRule = (profile: RulesProfileRef, id: string): boolean =>
  profile.id === 'bmja'
  && profile.version === '1.0'
  && Object.hasOwn(classicalScoringRuleOwners, id);
