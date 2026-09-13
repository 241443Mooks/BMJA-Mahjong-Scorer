import type { GameContext, MahjongHand, RuleResult } from './types';

/**
 * A ruleset-owned extension point for the small scoring differences that are
 * not properties of a canonical hand pattern.  The base scorer remains
 * profile-neutral: a ruleset opts in by supplying a policy.
 */
export type ScoringPolicy = {
  additionalPointRules?: (
    hand: MahjongHand,
    context: GameContext,
  ) => RuleResult[];
  transformStandardDoubleRules?: (
    rules: RuleResult[],
    hand: MahjongHand,
    context: GameContext,
  ) => RuleResult[];
  additionalDoubleRules?: (
    hand: MahjongHand,
    context: GameContext,
  ) => RuleResult[];
  /** Fixed specials may retain their separately-calculated bonus subtotal. */
  fixedSpecialBonusSubtotalAboveLimit?: boolean;
};
