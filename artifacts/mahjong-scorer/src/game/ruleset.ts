import { scoreHand } from '../scoring';
import type { SpecialHandPatternBinding } from '../scoring/special-hands';
import { progressBmjaGame } from './progression';
import { settleBmjaRound } from './settlement';
import type { GameRuleset, RulesProfileRef } from './types';

export const BMJA_RULESET: GameRuleset = Object.freeze({
  id: 'bmja',
  version: '1.0',
  name: 'British Mahjong Association',
  defaultLimit: 1000,
  scoreHand: ({ hand, playerWind, prevailingWind, limit = 1000 }) =>
    scoreHand(hand, { playerWind, prevailingWind, limit }),
  settleRound: settleBmjaRound,
  progressGame: progressBmjaGame,
});

export const BMJA_PROFILE_REF: RulesProfileRef = Object.freeze({
  id: BMJA_RULESET.id,
  version: BMJA_RULESET.version,
});

export const WESTERN_TM_PROFILE_REF: RulesProfileRef = Object.freeze({
  id: 'western-tm',
  version: '0.1',
});

export const westernTmSpecialHandBindings: SpecialHandPatternBinding[] = [
  {
    patternId: 'three-great-scholars',
    profile: WESTERN_TM_PROFILE_REF,
    name: 'Three Great Scholars',
    description: 'A pung or kong of each of the three dragons.',
    value: 1500,
    fishingValue: 600,
  },
  {
    patternId: 'thirteen-unique-wonders', profile: WESTERN_TM_PROFILE_REF,
    name: 'Unique Wonder',
    description: 'One of every terminal, wind and dragon, plus a pair of any one.',
    value: 2000, fishingValue: 800,
  },
  {
    patternId: 'all-pair-honours', profile: WESTERN_TM_PROFILE_REF,
    name: 'All Pair Honours',
    description: 'Seven pairs of major tiles: 1s, 9s, winds and dragons; repeated pairs are allowed.',
    value: 1000, fishingValue: 400,
  },
  {
    patternId: 'four-blessings', profile: WESTERN_TM_PROFILE_REF,
    name: 'Four Blessings', description: 'A pung or kong of each wind, plus any pair.',
    value: 1500, fishingValue: 600,
  },
  {
    patternId: 'all-winds-and-dragons', profile: WESTERN_TM_PROFILE_REF,
    name: 'All Winds and Dragons',
    description: 'Four pungs/kongs and a pair, all made from winds and dragons.',
    value: 1000, fishingValue: 400,
  },
  {
    patternId: 'heads-and-tails', profile: WESTERN_TM_PROFILE_REF,
    name: 'Heads and Tails',
    description: 'Four pungs/kongs and a pair, all made from suited 1s and 9s.',
    value: 1000, fishingValue: 400,
  },
  { patternId: 'wriggly-dragon', profile: WESTERN_TM_PROFILE_REF, name: 'Wriggly Dragon', description: 'Three Dragon singles plus a Dragon pair, and a suited run from 1 through 9.', value: 1000, fishingValue: 400 },
  { patternId: 'dragonette', profile: WESTERN_TM_PROFILE_REF, name: 'Dragonette', description: 'One of each Wind, a Dragon pair with the other Dragons single, and three non-terminal pairs in one suit.', value: 1000, fishingValue: 400 },
  { patternId: 'windfall', profile: WESTERN_TM_PROFILE_REF, name: 'Windfall', description: 'One of each Wind and five pairs in one suit.', value: 1000, fishingValue: 400 },
  { patternId: 'all-pair-ruby-jade', profile: WESTERN_TM_PROFILE_REF, name: 'All Pair Ruby Jade', description: 'Pairs of Green and Red Dragons plus five pairs of red or green Bamboo ranks.', value: 1000, fishingValue: 400 },
];

export const WESTERN_TM_RULESET: GameRuleset = Object.freeze({
  id: WESTERN_TM_PROFILE_REF.id,
  version: WESTERN_TM_PROFILE_REF.version,
  name: 'Western — Thompson & Maloney (provisional)',
  defaultLimit: 1000,
  scoreHand: ({ hand, playerWind, prevailingWind, limit = 1000 }) =>
    scoreHand(
      hand,
      { playerWind, prevailingWind, limit },
      westernTmSpecialHandBindings,
    ),
  settleRound: settleBmjaRound,
  progressGame: progressBmjaGame,
});

const profileKey = ({ id, version }: RulesProfileRef) => `${id}@${version}`;

const RULES_PROFILE_REGISTRY = new Map<string, GameRuleset>([
  [profileKey(BMJA_PROFILE_REF), BMJA_RULESET],
  [profileKey(WESTERN_TM_PROFILE_REF), WESTERN_TM_RULESET],
]);

export const resolveRulesProfile = (profile: RulesProfileRef): GameRuleset => {
  const ruleset = RULES_PROFILE_REGISTRY.get(profileKey(profile));
  if (!ruleset) {
    throw new Error(
      `Unknown rules profile "${profile.id}" version "${profile.version}".`,
    );
  }
  return ruleset;
};

// The product still exposes one active profile. Keep this alias for callers that
// do not yet have game state; game orchestration resolves the persisted profile.
export const CURRENT_RULESET = BMJA_RULESET;
