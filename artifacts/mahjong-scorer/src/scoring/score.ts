import {
  applyDoubleRules,
  applyPointRules,
  scoreBonusDoubles,
  scoreBonusTiles,
} from './rules';
import { detectSpecialHands } from './special-hands';
import type { GameContext, MahjongHand, ScoreBreakdown } from './types';
import { validateHand } from './validation';

export const DEFAULT_CONTEXT: GameContext = {
  playerWind: 'east',
  prevailingWind: 'east',
  limit: 1000,
};

/**
 * Pure scoring entry point. It has no UI, storage, clock, network or mutation.
 * Standard hands use basic points × 2^doubles. For a special hand, ordinary
 * set scoring is replaced by its fixed value; eligible bonus-tile points are
 * doubled separately and then added, as required by BMJA-style rules.
 */
export const scoreHand = (
  hand: MahjongHand,
  context: GameContext = DEFAULT_CONTEXT,
): ScoreBreakdown => {
  const specialHands = detectSpecialHands(hand);
  const matchedSpecial = specialHands
    .filter((result) => result.matched)
    .sort((a, b) => b.value - a.value)[0];
  const validationErrors = validateHand(hand);
  const specialFinalDiscardDouble =
    matchedSpecial && hand.winningMethod === 'final-discard'
      ? [
          {
            id: 'special-final-discard',
            label: 'Final discard bonus',
            description:
              'For a special hand, the final discard doubles bonus-tile points only.',
            amount: 1,
            unit: 'doubles' as const,
          },
        ]
      : [];
  const pointRules = matchedSpecial
    ? scoreBonusTiles(hand)
    : applyPointRules(hand, context);
  const doubleRules = matchedSpecial
    ? [...scoreBonusDoubles(hand, context), ...specialFinalDiscardDouble]
    : applyDoubleRules(hand, context);
  const basePoints = pointRules.reduce((sum, rule) => sum + rule.amount, 0);
  const doubles = doubleRules.reduce((sum, rule) => sum + rule.amount, 0);
  const standardScore = basePoints * 2 ** doubles;
  const uncappedScore = matchedSpecial
    ? matchedSpecial.value + basePoints * 2 ** doubles
    : standardScore;
  const finalScore = Math.min(uncappedScore, context.limit);

  return {
    valid: validationErrors.length === 0,
    validationErrors,
    pointRules,
    doubleRules,
    specialHands,
    basePoints,
    doubles,
    uncappedScore,
    finalScore,
    limitApplied: finalScore < uncappedScore,
    scoringMode: matchedSpecial ? 'special' : 'standard',
  };
};
