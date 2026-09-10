import { scoreHand } from '../scoring';
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

const profileKey = ({ id, version }: RulesProfileRef) => `${id}@${version}`;

const RULES_PROFILE_REGISTRY = new Map<string, GameRuleset>([
  [profileKey(BMJA_PROFILE_REF), BMJA_RULESET],
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
