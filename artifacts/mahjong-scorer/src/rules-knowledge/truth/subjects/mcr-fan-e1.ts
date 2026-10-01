import type { SemanticSubject } from '../../../rules-platform/truth-model';
import { MCR_2006_FAN_BINDINGS } from '../../../rules-platform/mcr-detectors';
import { versioned } from '../records';

export const mcrFanE1SourceSemantics = [
  'An ordinary winning interpretation contains a Pung or Kong of each of the four Winds.',
  'An ordinary winning interpretation contains a Pung or Kong of each of the three Dragons.',
  'Every non-Flower tile is Bamboo 2, 3, 4, 6, 8, or Green Dragon.',
  'The hand has no melded groups; before the winning tile its concealed tiles are 1112345678999 in one numbered suit, and the winning tile is of that suit.',
  'The completed hand contains four declared Kongs, whether concealed or melded.',
  'The irregular hand consists of seven pairs in one numbered suit at seven consecutive ranks.',
  undefined,
  'Every tile is a suited terminal, and the ordinary interpretation consists of terminal sets and a terminal pair.',
  'An ordinary winning interpretation contains Pungs or Kongs of three Wind kinds and a pair of the fourth Wind.',
  'An ordinary winning interpretation contains Pungs or Kongs of two Dragon kinds and a pair of the third Dragon.',
  'Every non-Flower tile is a Wind or Dragon.',
  'An ordinary winning interpretation contains four Pung or Kong sets achieved without melding; a declared concealed Kong counts, while a melded set does not.',
  'An ordinary winning interpretation consists of two 123 Chows and two 789 Chows in one numbered suit, with a pair of 5s in that suit.',
  'Four Chow elements in an ordinary winning interpretation have the same numbered suit and start rank.',
  'Four Pung or Kong elements in an ordinary winning interpretation are in one numbered suit at four consecutive ranks.',
  'Four Chow elements in an ordinary winning interpretation are in one numbered suit with start ranks progressing consistently by one or consistently by two.',
  'The completed hand contains at least three declared Kongs.',
  'Every tile is a suited terminal or an Honor, with both categories present.',
  'The irregular winning hand partitions into exactly seven pairs.',
  'The irregular hand has fourteen distinct single tiles: all seven Honors and seven suited tiles from one assignment of 147, 258, and 369 across the three numbered suits.',
  'An ordinary winning interpretation has only Pung/Kong sets and a pair, all in suited even ranks 2, 4, 6, or 8.',
  'Every tile is in one numbered suit, with no Honors.',
  'Three Chow elements in an ordinary winning interpretation have the same numbered suit and start rank.',
  'Three Pung or Kong elements in an ordinary winning interpretation are in one numbered suit at three consecutive ranks.',
  'Every tile is a suited rank 7, 8, or 9, with no Honors.',
  'Every tile is a suited rank 4, 5, or 6, with no Honors.',
  'Every tile is a suited rank 1, 2, or 3, with no Honors.',
] as const;

export const mcrFanE1Bindings = MCR_2006_FAN_BINDINGS.slice(0, 27).map((binding, index) => ({
  fanNumber: index + 1,
  binding,
  subjectId: `pattern.mcr-wmo-2006.${binding.id.slice('mcr2006.fan.'.length)}`,
  claimId: `evidence.pattern.mcr-wmo-2006.${binding.id.slice('mcr2006.fan.'.length)}`,
  treatmentId: `mcr-wmo-2006@0.1:${binding.id.slice('mcr2006.fan.'.length)}`,
  sourceSemantics: mcrFanE1SourceSemantics[index],
})).filter(({ fanNumber }) => fanNumber !== 7);

export const mcrFanE1Subjects = mcrFanE1Bindings.map(({ subjectId }) =>
  versioned<SemanticSubject>(subjectId, { id: subjectId, kind: 'pattern' }),
);
