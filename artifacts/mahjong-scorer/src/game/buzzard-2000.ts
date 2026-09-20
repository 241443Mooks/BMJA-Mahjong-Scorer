import { classicalConfiguredPolicy, type ClassicalPolicyConfig } from '../scoring/classical-configured-policy';
import type { SpecialHandPatternBinding } from '../scoring/special-hands';
import type { RulesProfileRef } from './types';

export const BUZZARD_2000_PROFILE_REF: RulesProfileRef = { id: 'buzzard-2000', version: '0.1' };
const configured = (patternId: string, name: string): SpecialHandPatternBinding => ({ patternId, profile: BUZZARD_2000_PROFILE_REF, name, description: name, scoreModel: { kind: 'configured-limit' } });

export const buzzard2000SpecialHandBindings: SpecialHandPatternBinding[] = [
  configured('all-winds-and-dragons', 'All Winds and Dragons'), configured('three-winds-and-fourth-wind-pair', 'Three Winds and a Pair'),
  configured('heavens-blessing', 'Original Hand'), configured('earths-blessing', "East's First Discard"), configured('heads-and-tails', 'All Ones and Nines'),
  configured('three-great-scholars', 'Three Dragons'), configured('four-concealed-pung-kong-hand', 'Concealed Pungs/Kongs'),
  configured('thirteen-unique-wonders', 'Thirteen Odd Majors'), configured('one-suit-nine-gates-any-completion', 'Calling Nine Tile Hand'), configured('east-thirteenth-consecutive-mahjong', "East's Thirteenth Consecutive Mahjong"),
];

export const BUZZARD_2000_CLASSICAL_CONFIG: ClassicalPolicyConfig = { points: { standingHand: 100, onlyPossibleWinningTile: 2, noChows: 10, scoreless: 10, lastWall: 10, looseTile: 10 }, doubles: { allChowsNonScoringPair: 1, pureSuit: { predicate: 'pure-suit-any-standard-meld', amount: 3 }, bonusTiles: { own: 1, complete: 3, combination: 'additive' } }, disabledInheritedRuleIds: ['no-chows', 'concealed-hand', 'purity', 'original-call', 'win-final-discard', 'flower-bouquet', 'season-bouquet', 'own-flower', 'own-season'] };
export const BUZZARD_2000_SCORING_POLICY = classicalConfiguredPolicy(BUZZARD_2000_CLASSICAL_CONFIG);
