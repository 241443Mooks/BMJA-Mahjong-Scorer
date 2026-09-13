import type { ScoringPolicy } from '../scoring/scoring-policy';
import type { GameContext, MahjongHand, RuleResult } from '../scoring/types';
import { isMajor, resolveWinningTileProvenance } from '../scoring/tiles';

const double = (
  id: string,
  label: string,
  description: string,
  amount = 1,
): RuleResult => ({ id, label, description, amount, unit: 'doubles' });

const pungOrKong = (hand: MahjongHand) =>
  hand.sets.filter((set) => set.kind === 'pung' || set.kind === 'kong');

const hasDistinctSets = (sets: MahjongHand['sets'], count: number) =>
  sets.length === count && new Set(sets.map((set) => {
    if (set.tile.family === 'dragon') return set.tile.dragon;
    return set.tile.family === 'wind' ? set.tile.wind : '';
  })).size === count;

export const outsideTheBoxDoubleRules = (
  hand: MahjongHand,
  _context: GameContext,
): RuleResult[] => {
  const rules: RuleResult[] = [];
  const groups = pungOrKong(hand);
  const dragonSets = groups.filter((set) => set.tile.family === 'dragon');
  const windSets = groups.filter((set) => set.tile.family === 'wind');
  const dragonPair = hand.sets.some(
    (set) => set.kind === 'pair' && set.tile.family === 'dragon',
  );
  const windPair = hand.sets.some(
    (set) => set.kind === 'pair' && set.tile.family === 'wind',
  );

  if (hasDistinctSets(dragonSets, 3)) {
    rules.push(double('otb-big-three-dragons', 'Big Three Dragons', 'Three Dragon Pungs/Kongs add two doubles.', 2));
  } else if (hasDistinctSets(dragonSets, 2) && dragonPair) {
    rules.push(double('otb-little-three-dragons', 'Little Three Dragons', 'Two Dragon Pungs/Kongs and the remaining Dragon pair add one double.'));
  }
  if (hasDistinctSets(windSets, 4)) {
    rules.push(double('otb-big-four-joys', 'Big Four Joys', 'Four Wind Pungs/Kongs add two doubles.', 2));
  } else if (hasDistinctSets(windSets, 3) && windPair) {
    rules.push(double('otb-little-four-joys', 'Little Four Joys', 'Three Wind Pungs/Kongs and the remaining Wind pair add one double.'));
  }

  const concealedPungOrKongCount = groups.filter(
    (set) => set.visibility === 'concealed' || set.kind === 'kong',
  ).length;
  if (concealedPungOrKongCount >= 3) {
    rules.push(double('otb-three-concealed-pung-kong', 'Three concealed Pungs/Kongs', 'Three concealed Pungs/Kongs qualify; an exposed Kong counts as a concealed Pung.'));
  }
  return rules;
};

export const outsideTheBoxPointRules = (
  hand: MahjongHand,
  _context: GameContext,
): RuleResult[] => {
  if (!hand.isWinner) return [];
  const rules: RuleResult[] = hand.winningMethod === 'last-wall-tile'
    ? [{
        id: 'otb-last-wall-live-wall',
        label: 'Winning from the live wall',
        description: 'The final tile of the main wall is still drawn from the live wall.',
        amount: 2,
        unit: 'points',
      }]
    : [];
  const provenance = resolveWinningTileProvenance(hand);
  if (!provenance || provenance.target.type !== 'grouped-set') return rules;
  const destination = provenance.target;
  const target = hand.sets.find((set) => set.id === destination.setId);
  if (target?.kind !== 'pair') return rules;
  const amount = isMajor(provenance.tile) ? 4 : 2;
  rules.push({
    id: 'otb-winning-pair',
    label: 'Completing a pair',
    description: 'Winning-tile provenance identifies the completed pair.',
    amount,
    unit: 'points',
  });
  return rules;
};

export const OUTSIDE_THE_BOX_SCORING_POLICY: ScoringPolicy = Object.freeze({
  additionalPointRules: outsideTheBoxPointRules,
  transformStandardDoubleRules: (rules, hand) =>
    hand.winningMethod === 'wall' || hand.winningMethod === 'last-wall-tile'
      ? rules
      : rules.filter((rule) => rule.id !== 'concealed-hand'),
  additionalDoubleRules: outsideTheBoxDoubleRules,
  fixedSpecialBonusSubtotalAboveLimit: true,
});
