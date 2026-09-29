import type { SemanticSubject } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

export const westernTmB4aBindingIds = [
  "wriggly-dragon",
  "wriggling-snake-any-pair",
  "hachi-ban",
  "suit-run-one-to-seven-with-winds-and-dragon-pung",
  "full-suit-run-with-dragon-singles-and-wind-pair",
  "two-suit-pairs-and-chows-one-two-five-six-nine",
  "three-suit-chows-with-suited-meld-and-pair",
  "circle-chows-with-one-two-three-four-five-six-seven-eight-nine",
  "run-two-to-eight-with-one-and-nine-pungs",
  "full-suit-run-with-five-distinct-honours",
  "suit-run-one-to-seven-with-all-honours",
  "run-one-to-nine-with-same-suit-pung-and-pair",
  "run-one-to-nine-with-wind-pung-and-pair",
  "run-one-to-nine-with-dragon-pung-and-pair",
  "run-one-to-nine-with-honour-pung-and-any-pair",
  "full-suit-run-with-honour-pung-and-opposite-honour-pair",
  "four-chows-three-suits-one-two-one",
  "western-gates-of-heaven",
  "two-suit-runs-one-to-seven",
  "north-south-wind-melds-with-1861-and-1865-two-suit-layout",
  "two-to-eight-run-pair-with-terminal-meld-and-corresponding-dragon-meld",
  "one-to-seven-run-pair-with-red-dragon-and-own-wind-melds",
  "three-suit-chows-with-mixed-chow-and-suited-pair",
  "four-mixed-chows-with-mixed-pair",
  "white-dragon-meld-green-dragon-pair-with-three-mixed-chows",
  "three-mixed-chows-three-dragon-singles-own-wind-pair",
  "two-suit-knitting",
  "three-suit-knitting-with-pair",
  "three-four-tile-suit-runs-with-honour-pair",
  "three-matching-four-tile-suit-runs-with-honour-pair",
  "seven-pairs-all-from-wall",
  "four-concealed-chows-one-suit-from-wall",
  "four-winds-with-one-two-two-fours-three-sixes-four-eights",
  "four-winds-with-four-twos-three-fours-two-sixes-one-eight",
] as const;

export const westernTmB4aSpecialHandSubjects = westernTmB4aBindingIds.map((bindingId) => {
  const id = `pattern.western-tm.${bindingId}`;
  return versioned<SemanticSubject>(id, { id, kind: 'pattern' as const });
});
