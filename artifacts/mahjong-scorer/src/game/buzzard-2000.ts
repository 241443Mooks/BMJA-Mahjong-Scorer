import type { ScoringPolicy } from '../scoring/scoring-policy';
import type { GameContext, MahjongHand, RuleResult } from '../scoring/types';
import { expandedTiles } from '../scoring/tiles';
import type { SpecialHandPatternBinding } from '../scoring/special-hands';
import type { RulesProfileRef } from './types';

export const BUZZARD_2000_PROFILE_REF: RulesProfileRef = { id: 'buzzard-2000', version: '0.1' };
const d = (id: string, label: string, amount = 1): RuleResult => ({ id, label, description: label, amount, unit: 'doubles' });
const p = (id: string, label: string, amount: number): RuleResult => ({ id, label, description: label, amount, unit: 'points' });
const configured = (patternId: string, name: string): SpecialHandPatternBinding => ({ patternId, profile: BUZZARD_2000_PROFILE_REF, name, description: name, scoreModel: { kind: 'configured-limit' } });

export const buzzard2000SpecialHandBindings: SpecialHandPatternBinding[] = [
  configured('all-winds-and-dragons', 'All Winds and Dragons'), configured('three-winds-and-fourth-wind-pair', 'Three Winds and a Pair'),
  configured('heavens-blessing', 'Original Hand'), configured('earths-blessing', "East's First Discard"), configured('heads-and-tails', 'All Ones and Nines'),
  configured('three-great-scholars', 'Three Dragons'), configured('four-concealed-pung-kong-hand', 'Concealed Pungs/Kongs'),
  configured('thirteen-unique-wonders', 'Thirteen Odd Majors'), configured('one-suit-nine-gates-any-completion', 'Calling Nine Tile Hand'), configured('east-thirteenth-consecutive-mahjong', "East's Thirteenth Consecutive Mahjong"),
];

export const BUZZARD_2000_SCORING_POLICY: ScoringPolicy = {
  pureSuitAnyStandardMeld: true,
  transformStandardDoubleRules: (rules) => rules.filter((rule) => !['no-chows', 'concealed-hand', 'purity', 'original-call', 'win-final-discard', 'flower-bouquet', 'season-bouquet', 'own-flower', 'own-season'].includes(rule.id)),
  additionalPointRules: (hand) => !hand.isWinner ? [] : [
    ...(hand.classicalEvidence?.standingHand ? [p('buzzard-standing-hand', 'Standing Hand', 100)] : []),
    ...(hand.classicalEvidence?.onlyPossibleWinningTile ? [p('buzzard-only-possible', 'Only possible winning tile', 2)] : []),
    ...(!hand.sets.some((set) => set.kind === 'chow') ? [p('buzzard-no-chows', 'No Chows', 10)] : []),
    ...(hand.sets.every((set) => set.kind === 'chow' || (set.kind === 'pair' && set.tile.family === 'suit')) && hand.bonusTiles.length === 0 ? [p('buzzard-scoreless', 'Scoreless hand', 10)] : []),
    ...(hand.winningMethod === 'last-wall-tile' ? [p('buzzard-last-wall', 'Last wall tile', 10)] : []),
    ...(hand.winningMethod === 'loose-tile' ? [p('buzzard-loose-tile', 'Loose Tile', 10)] : []),
  ],
  additionalDoubleRules: (hand, context) => {
    if (!hand.isWinner) return [];
    const tiles = hand.sets.flatMap(expandedTiles); const suits = new Set(tiles.filter((tile) => tile.family === 'suit').map((tile) => tile.family === 'suit' ? tile.suit : ''));
    const own = context.playerWind === 'east' ? 1 : context.playerWind === 'south' ? 2 : context.playerWind === 'west' ? 3 : 4;
    const bonuses = (family: 'flower' | 'season') => hand.bonusTiles.filter((tile) => tile.family === family);
    return [
      ...(tiles.length > 0 && tiles.every((tile) => tile.family === 'suit') && suits.size === 1 ? [d('buzzard-pure-suit', 'Pure one suit', 3)] : []),
      ...(hand.sets.filter((set) => set.kind === 'chow').length === 4 && hand.sets.some((set) => set.kind === 'pair' && set.tile.family === 'suit') ? [d('buzzard-all-chows', 'All Chows with non-scoring pair')] : []),
      ...(['flower', 'season'] as const).flatMap((family) => [
        ...(bonuses(family).length === 4 ? [d(`buzzard-${family}-complete`, `Complete ${family}s`, 3)] : []),
        ...(bonuses(family).some((tile) => tile.number === own) ? [d(`buzzard-own-${family}`, `Own ${family}`)] : []),
      ]),
    ];
  },
};
