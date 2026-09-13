import { createBmjaGame } from './game';
import { BMJA_PROFILE_REF, resolveRulesProfile } from './ruleset';

/** The established #70 example, resolved by the production settlement engine. */
export const canonicalSettlementExample = () => {
  const players = [
    { id: 'east', name: 'East' },
    { id: 'south', name: 'South' },
    { id: 'west', name: 'West' },
    { id: 'north', name: 'North' },
  ];
  const game = createBmjaGame(players, { east: 'east', south: 'south', west: 'west', north: 'north' }, undefined, 'full-game', BMJA_PROFILE_REF);
  return resolveRulesProfile(game.setup.rulesProfile).settleRound(game.players, game.seats, {
    outcome: { type: 'win', winnerId: 'south' },
    scores: { east: 56, south: 60, west: 40, north: 44 },
  });
};
