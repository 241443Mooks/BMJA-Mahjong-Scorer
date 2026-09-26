import { expandedTiles } from './tiles';
import type { ScoringPolicy } from './scoring-policy';
import type { GameContext, MahjongHand, RuleResult } from './types';

export type ClassicalPolicyConfig = Readonly<{
  points: Readonly<Record<'standingHand' | 'onlyPossibleWinningTile' | 'noChows' | 'scoreless' | 'lastWall' | 'looseTile', number>>;
  doubles: Readonly<{ allChowsNonScoringPair: number; pureSuit: { predicate: 'pure-suit-any-standard-meld'; amount: number }; bonusTiles: { own: number; complete: number; combination: 'additive' } }>;
  disabledInheritedRuleIds: readonly string[];
}>;
const point = (id: string, label: string, amount: number): RuleResult => ({ id, label, description: label, amount, unit: 'points' });
const double = (id: string, label: string, amount: number): RuleResult => ({ id, label, description: label, amount, unit: 'doubles' });

/** Finite Classical configuration adapter; predicates are deliberately code-owned. */
export const classicalConfiguredPolicy = (config: ClassicalPolicyConfig): ScoringPolicy => ({
  pureSuitAnyStandardMeld: config.doubles.pureSuit.predicate === 'pure-suit-any-standard-meld',
  transformStandardDoubleRules: (rules) => rules.filter((rule) => !config.disabledInheritedRuleIds.includes(rule.id)),
  additionalPointRules: (hand) => !hand.isWinner ? [] : [
    ...(hand.classicalEvidence?.standingHand ? [point('classical-standing-hand', 'Standing Hand', config.points.standingHand)] : []),
    ...(hand.classicalEvidence?.onlyPossibleWinningTile ? [point('classical-only-possible', 'Only possible winning tile', config.points.onlyPossibleWinningTile)] : []),
    ...(!hand.sets.some((set) => set.kind === 'chow') ? [point('classical-no-chows', 'No Chows', config.points.noChows)] : []),
    ...(hand.sets.every((set) => set.kind === 'chow' || (set.kind === 'pair' && set.tile.family === 'suit')) && hand.bonusTiles.length === 0 ? [point('classical-scoreless', 'Scoreless hand', config.points.scoreless)] : []),
    ...(hand.winningMethod === 'last-wall-tile' ? [point('classical-last-wall', 'Last wall tile', config.points.lastWall)] : []),
    ...(hand.winningMethod === 'loose-tile' ? [point('classical-loose-tile', 'Loose Tile', config.points.looseTile)] : []),
  ],
  additionalDoubleRules: (hand, context) => {
    if (!hand.isWinner) return []; const tiles = hand.sets.flatMap(expandedTiles); const suits = new Set(tiles.filter((tile) => tile.family === 'suit').map((tile) => tile.family === 'suit' ? tile.suit : ''));
    const own = context.playerWind === 'east' ? 1 : context.playerWind === 'south' ? 2 : context.playerWind === 'west' ? 3 : 4;
    return [
      ...(tiles.length && tiles.every((tile) => tile.family === 'suit') && suits.size === 1 ? [double('classical-pure-suit', 'Pure one suit', config.doubles.pureSuit.amount)] : []),
      ...(hand.sets.filter((set) => set.kind === 'chow').length === 4 && hand.sets.some((set) => set.kind === 'pair' && set.tile.family === 'suit') ? [double('classical-all-chows', 'All Chows with non-scoring pair', config.doubles.allChowsNonScoringPair)] : []),
      ...(['flower', 'season'] as const).flatMap((family) => { const tiles = hand.bonusTiles.filter((tile) => tile.family === family); return [
        ...(tiles.length === 4 ? [double(`classical-${family}-complete`, `Complete ${family}s`, config.doubles.bonusTiles.complete)] : []),
        ...(tiles.some((tile) => tile.number === own) ? [double(`classical-own-${family}`, `Own ${family}`, config.doubles.bonusTiles.own)] : []),
      ]; }),
    ];
  },
});
