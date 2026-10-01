import type { SemanticSubject } from '../../../rules-platform/truth-model';
import { MCR_2006_FAN_BINDINGS } from '../../../rules-platform/mcr-detectors';
import { versioned } from '../records';

export const mcrFanE2SourceSemantics = [
  'An ordinary interpretation contains 123, 456, and 789 Chows in the same numbered suit.',
  'An ordinary interpretation contains both 123 and 789 Chows in two numbered suits, with a pair of 5s in the third suit.',
  'Three Chow elements in one numbered suit start at consecutive ranks or at ranks separated by two throughout; the step size is consistent.',
  'Each of the four sets and the pair contains at least one suited rank-5 tile.',
  'Three Pung or Kong elements share one rank, with one element in each numbered suit.',
  'An ordinary interpretation contains at least three Pung or Kong sets achieved without melding; a melded fixed set does not count.',
  'The irregular hand has fourteen distinct single tiles from one knitted assignment and the Honors, but does not contain all seven Honors; it therefore has five or six Honors and respectively nine or eight suited knitted tiles.',
  'The hand contains all nine distinct suited tiles from one assignment of 147, 258, and 369 across the three numbered suits; the remaining tiles may form any compatible part of a lawful hand.',
  'Every non-Flower tile is a suited rank from 6 through 9, with no Honors.',
  'Every non-Flower tile is a suited rank from 1 through 4, with no Honors.',
  'An ordinary interpretation contains Pung or Kong sets of any three distinct Winds.',
  'An ordinary interpretation contains 123, 456, and 789 Chows, with each Chow in a different numbered suit.',
  'Every non-Flower tile is in the Green Book reversible set: Dots 1, 2, 3, 4, 5, 8, or 9; Bamboo 2, 4, 5, 6, 8, or 9; or White Dragon.',
  'Three Chow elements have the same start rank, one in each numbered suit.',
  'Three Pung or Kong elements, one in each numbered suit, use three consecutive ranks in any suit-to-rank assignment.',
  'Chicken Hand is the source-defined fan identity for a legal winning hand with no other non-Flower fan counted; its fallback determination remains part of scoring resolution.',
  'The win is made by drawing the final tile from the wall.',
  'The win is made on the final discard after the wall is exhausted.',
  'The win is made by self-drawing a Kong replacement tile; a Flower replacement win is not this fan.',
  'The win is made by claiming the tile added to promote an existing melded Pung to a Kong.',
  'The hand contains at least two declared Kongs whose exposure is concealed.',
  'An ordinary interpretation consists of four Pung or Kong sets and a pair, with no Chow sets.',
  'All numbered tiles belong to one suit and the hand also contains at least one Honor.',
  'Three Chow elements, one per numbered suit, start at three consecutive ranks.',
  'Across the five elements of an ordinary interpretation, Characters, Bamboo, Dots, Winds, and Dragons are all represented.',
  'All four sets are exposed fixed melds; before the win the concealed tiles contain only one tile of the eventual pair; the player wins by discard on that same tile face, which is the sole legal winning tile.',
  'An ordinary interpretation contains Pung or Kong elements of two distinct Dragon kinds.',
] as const;

export const mcrFanE2Bindings = MCR_2006_FAN_BINDINGS.slice(27, 54).map((binding, index) => ({
  fanNumber: index + 28,
  binding,
  subjectId: `pattern.mcr-wmo-2006.${binding.id.slice('mcr2006.fan.'.length)}`,
  claimId: `evidence.pattern.mcr-wmo-2006.${binding.id.slice('mcr2006.fan.'.length)}`,
  treatmentId: `mcr-wmo-2006@0.1:${binding.id.slice('mcr2006.fan.'.length)}`,
  sourceSemantics: mcrFanE2SourceSemantics[index],
}));

export const mcrFanE2Subjects = mcrFanE2Bindings.map(({ subjectId }) =>
  versioned<SemanticSubject>(subjectId, { id: subjectId, kind: 'pattern' }),
);
