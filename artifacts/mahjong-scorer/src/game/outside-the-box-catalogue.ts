import type {
  FixedSpecialHandPatternBinding,
  SpecialHandPatternBinding,
} from '../scoring/special-hands';
import type { RulesProfileRef } from './types';

export const OUTSIDE_THE_BOX_PROFILE_REF: RulesProfileRef = Object.freeze({
  id: 'outside-the-box',
  version: '0.1',
});

const fixed = (
  patternId: string,
  name: string,
  value: number,
  fishingValue: number,
  exposure?: FixedSpecialHandPatternBinding['exposure'],
): FixedSpecialHandPatternBinding => ({
  patternId,
  profile: OUTSIDE_THE_BOX_PROFILE_REF,
  name,
  description: name,
  value,
  fishingValue,
  exposure,
});

const concealed = { allowed: false } as const;
const half = (value: number, fishingValue: number) =>
  ({ allowed: true, exposedValue: value / 2, exposedFishingValue: fishingValue / 2 }) as const;

/** The 33 fixed special-pattern memberships in the verified OTB club guide.
 * Purity is deliberately absent: it remains the BMJA calculated-Purity rule. */
export const outsideTheBoxSpecialHandBindings: SpecialHandPatternBinding[] = [
  fixed('buried-treasure', 'Buried Treasure', 1000, 400, concealed),
  fixed('imperial-jade', 'Imperial Jade', 1000, 400, half(1000, 400)),
  fixed('heads-and-tails', 'Heads & Tails', 1000, 400, half(1000, 400)),
  fixed('all-winds-and-dragons', 'All Winds & Dragons', 1000, 400, { allowed: true }),
  fixed('club-three-great-scholars', 'Three Great Scholars', 1000, 400, { allowed: true }),
  fixed('four-blessings', 'Four Blessings', 1000, 400, { allowed: true }),
  fixed('fourfold-plenty', 'Fourfold Plenty', 1000, 400, half(1000, 400)),
  fixed('knitting', 'Knitting', 500, 200, concealed),
  fixed('triple-knitting', 'Triple Knitting', 500, 200, concealed),
  fixed('all-pair-honours', 'All Pair Honours', 500, 200, concealed),
  fixed('thirteen-unique-wonders', '13 Unique Wonders', 1000, 400, concealed),
  fixed('wriggling-snake', 'Wriggling Snake', 1000, 400, concealed),
  fixed('seven-pairs-one-suit-with-honours', 'All Pair', 500, 200, concealed),
  fixed('seven-pairs-one-suit', 'Heavenly Twins', 1000, 400, concealed),
  fixed('all-pair-ruby-jade', 'All Pair Ruby Jade', 1000, 400, concealed),
  fixed('four-bamboo-one-and-five-green-bamboo-pairs', "Sparrow's Sanctuary", 1000, 400, concealed),
  fixed('own-wind-meld-with-dragon-pair-and-three-suit-chows', 'Hovering Angel', 1000, 400, concealed),
  fixed('three-four-tile-suit-runs-with-honour-pair', 'Big Robert', 500, 200, concealed),
  fixed('three-matching-four-tile-suit-runs-with-honour-pair', 'Big Robert', 1000, 400, concealed),
  fixed('wriggling-snake-any-pair', 'Wriggly Snake', 1000, 400, concealed),
  fixed('windfall', 'Windfall', 1000, 400, concealed),
  fixed('wind-pair-with-three-suit-rank-one-melds', 'Windy Ones', 1000, 400, half(1000, 400)),
  fixed('wind-pair-with-three-suit-rank-nine-melds', 'Windy Nines', 1000, 400, half(1000, 400)),
  fixed('wind-pair-with-three-suit-chows', 'Windy Chow', 500, 200, concealed),
  fixed('hachi-ban', 'Hachi Ban', 1000, 400, concealed),
  fixed('three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair', 'Dragonfly', 1000, 400, half(1000, 400)),
  fixed('dragon-pair-with-five-suited-pairs', "Dragon's Breath", 1000, 400, concealed),
  fixed('wriggly-dragon', 'Wriggly Dragon', 1000, 400, concealed),
  fixed('green-dragon-pung-with-bamboo-melds', 'Green Jade', 1000, 400, half(1000, 400)),
  fixed('red-dragon-pung-with-character-melds', 'Red Coral', 1000, 400, half(1000, 400)),
  fixed('white-dragon-pung-with-circle-melds', 'White Opal', 1000, 400, half(1000, 400)),
  fixed('run-one-to-nine-with-same-suit-pung-and-pair', 'Run, Pung & Pair', 1000, 400, concealed),
  fixed('run-one-to-nine-with-honour-pung-and-suited-pair', 'Grand Sequence', 1000, 400, concealed),
];
