import { scoreHand } from '../scoring';
import { progressBmjaGame } from './progression';
import { settleBmjaRound } from './settlement';
import type { GameRuleset } from './types';

export const BMJA_RULESET: GameRuleset = {
  id: 'bmja',
  name: 'British Mahjong Association',
  defaultLimit: 1000,
  scoreHand: ({ hand, playerWind, prevailingWind, limit = 1000 }) =>
    scoreHand(hand, { playerWind, prevailingWind, limit }),
  settleRound: settleBmjaRound,
  progressGame: progressBmjaGame,
};

export const CURRENT_RULESET = BMJA_RULESET;