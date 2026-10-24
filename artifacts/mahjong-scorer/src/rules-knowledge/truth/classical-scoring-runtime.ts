import { scoreBonusDoubles, scoreBonusTiles } from '../../scoring/rules';
import type { RulesProfileRef } from '../../rules-platform/types';

/** Explicit rule-to-owner registry; these links are proved by behavioural fixtures. */
export const classicalScoringRuleOwners = Object.freeze({
  'scoring.scoreBonusTiles': scoreBonusTiles,
  'scoring.scoreBonusDoubles': scoreBonusDoubles,
});

export const isClassicalScoringRule = (profile: RulesProfileRef, id: string): boolean =>
  profile.id === 'bmja'
  && profile.version === '1.0'
  && Object.hasOwn(classicalScoringRuleOwners, id);
