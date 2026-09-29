import type { SemanticSubject } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

export const westernTmB4cBindingIds = [
  'all-winds-and-dragons',
  'east-wind-meld-white-dragon-pair-three-suit-nonterminal-melds',
  'green-and-white-dragon-melds-with-green-bamboo',
  'green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow',
  'green-dragon-pung-white-dragon-pair-three-circle-melds',
  'green-dragon-pung-with-bamboo-melds',
  'green-dragon-pung-with-blue-circle-melds',
  'heads-and-tails',
  'one-suit-odd-melds',
  'own-wind-meld-with-dragon-pair-and-three-suit-chows',
  'parallel-suit-rank-melds-with-honours',
  'red-and-green-dragon-melds-with-bamboo',
  'red-and-green-dragon-pungs-with-three-suits',
  'red-and-white-dragon-melds-with-red-bamboo',
  'red-dragon-meld-with-red-bamboo-melds',
  'red-dragon-pung-with-character-melds',
  'red-dragon-pung-with-even-character-melds',
  'red-white-dragon-pungs-with-seven-tile-character-or-circle-run-pair',
  'three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair',
  'three-great-scholars',
  'two-odd-suits-and-one-even-suit',
  'two-ranks-doubled-across-two-suits-with-honour-pair',
  'white-dragon-meld-red-dragon-pair-three-suit-nonterminal-melds',
  'white-dragon-meld-with-even-circle-melds',
  'white-dragon-pung-with-circle-melds',
  'white-dragon-pung-with-odd-character-melds',
] as const;

export const westernTmB4cSpecialHandSubjects = westernTmB4cBindingIds.map((bindingId) => {
  const id = `pattern.western-tm.${bindingId}`;
  return versioned<SemanticSubject>(id, { id, kind: 'pattern' as const });
});
