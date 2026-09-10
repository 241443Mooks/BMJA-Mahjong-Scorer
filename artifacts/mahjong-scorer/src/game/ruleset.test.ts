import { describe, expect, it } from 'vitest';
import { createBmjaGame } from './game';
import {
  BMJA_PROFILE_REF,
  BMJA_RULESET,
  resolveRulesProfile,
} from './ruleset';
import type { GamePlayer, SeatAssignments } from './types';

const players: GamePlayer[] = [
  { id: 'east', name: 'East' },
  { id: 'south', name: 'South' },
  { id: 'west', name: 'West' },
  { id: 'north', name: 'North' },
];

const seats: SeatAssignments = {
  east: 'east',
  south: 'south',
  west: 'west',
  north: 'north',
};

describe('versioned rules profiles', () => {
  it('registers BMJA as an immutable versioned profile and stamps new games', () => {
    const game = createBmjaGame(players, seats);

    expect(BMJA_PROFILE_REF).toEqual({ id: 'bmja', version: '1.0' });
    expect(Object.isFrozen(BMJA_PROFILE_REF)).toBe(true);
    expect(Object.isFrozen(BMJA_RULESET)).toBe(true);
    expect(game.setup.rulesProfile).toEqual(BMJA_PROFILE_REF);
    expect(game.rulesetId).toBe('bmja');
    expect(resolveRulesProfile(game.setup.rulesProfile)).toBe(BMJA_RULESET);
  });

  it('fails explicitly for an unknown profile id', () => {
    expect(() =>
      resolveRulesProfile({ id: 'unknown', version: '1.0' }),
    ).toThrow('Unknown rules profile "unknown" version "1.0".');
  });

  it('fails explicitly for an unknown version', () => {
    expect(() =>
      resolveRulesProfile({ id: 'bmja', version: '999' }),
    ).toThrow('Unknown rules profile "bmja" version "999".');
  });
});
