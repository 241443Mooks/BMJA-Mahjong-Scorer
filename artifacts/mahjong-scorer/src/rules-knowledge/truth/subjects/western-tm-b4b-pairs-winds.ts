import type { SemanticSubject } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

export const westernTmB4bBindingIds = [
  'all-pair-honours',
  'four-blessings',
  'wind-pair-with-three-suit-chows',
  'wind-pair-with-three-suit-one-two-three-chows',
  'wind-pair-with-three-suit-seven-eight-nine-chows',
  'dragonette',
  'windfall',
  'all-pair-ruby-jade',
  'four-bamboo-one-and-five-green-bamboo-pairs',
  'seven-pairs-one-suit',
  'seven-pairs-one-suit-with-honours',
  'dragon-pair-with-five-suited-pairs',
  'golden-gates',
  'all-pair-green-dragon-and-bamboo',
  'four-wind-pairs-with-two-dragon-melds',
  'wind-pair-with-three-suit-rank-one-melds',
  'wind-pair-with-three-suit-rank-nine-melds',
  'wind-pair-with-one-meld-in-each-suit',
  'wind-pair-with-three-suit-rank-three-melds',
  'wind-pair-with-three-suit-rank-seven-melds',
  'four-chows-three-suits-with-own-wind-pair',
] as const;

export const westernTmB4bSpecialHandSubjects = westernTmB4bBindingIds.map((bindingId) => {
  const id = `pattern.western-tm.${bindingId}`;
  return versioned<SemanticSubject>(id, { id, kind: 'pattern' as const });
});
