import { scoreBonusDoubles, scoreBonusTiles } from '../../scoring/rules';
import { validateHand } from '../../scoring/validation';
import { settleBmjaRound } from '../../game/settlement';
import type { RuntimeTreatmentRef } from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';

/** Explicit rule-to-owner registry; these links are proved by behavioural fixtures. */
export const classicalScoringRuleOwners = Object.freeze({
  'scoring.scoreBonusTiles': scoreBonusTiles,
  'scoring.scoreBonusDoubles': scoreBonusDoubles,
  'scoring.validateHand': validateHand,
  'settlement.settleBmjaRound': settleBmjaRound,
});

export const flowerSeasonRuntimeRefBySubject = Object.freeze({
  'rule.classical.flower-season-base-scoring': { kind: 'rule', id: 'scoring.scoreBonusTiles' },
  'rule.classical.own-flower-season-double': { kind: 'rule', id: 'scoring.scoreBonusDoubles' },
  'rule.classical.complete-flower-season-set-double': { kind: 'rule', id: 'scoring.scoreBonusDoubles' },
} satisfies Record<string, RuntimeTreatmentRef>);

export const classicalRuntimeRefBySubject = Object.freeze({
  ...flowerSeasonRuntimeRefBySubject,
  'rule.classical.normal-hand-at-most-one-chow': { kind: 'rule', id: 'scoring.validateHand' },
  'rule.classical.draw-has-no-settlement': { kind: 'rule', id: 'settlement.settleBmjaRound' },
} satisfies Record<string, RuntimeTreatmentRef>);

/** Exact-profile owner links for non-scoring executable policies. */
export const profileRuntimeRefByFact = Object.freeze({
  'outside-the-box@0.1|rule.otb.goulash-round-transition': { kind: 'hand-mode', id: 'hand-mode.outside-the-box-goulash' },
} satisfies Record<string, RuntimeTreatmentRef>);

export const isClassicalScoringRule = (profile: RulesProfileRef, id: string): boolean =>
  profile.id === 'bmja'
  && profile.version === '1.0'
  && Object.hasOwn(classicalScoringRuleOwners, id);
