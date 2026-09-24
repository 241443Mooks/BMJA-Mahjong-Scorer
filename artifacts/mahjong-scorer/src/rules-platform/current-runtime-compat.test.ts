import { describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import type { ProgressionState } from '../game/types';
import { currentPlayableProfiles } from './current-profiles';
import {
  mapCurrentClassicalScoreBreakdown,
  mapCurrentRuntimeProgression,
  mapCurrentRuntimeSettlement,
} from './current-runtime-compat';
import {
  createParityHarness,
  jsonNormalise,
  platformScoreInput,
} from './parity-harness.test-support';
import type { HandScoreResult } from './types';

const refs = Object.fromEntries(currentPlayableProfiles.map(({ identity }) => [
  identity.id,
  { id: identity.id, version: identity.version },
]));
const players = [
  { id: 'east', name: 'East' }, { id: 'south', name: 'South' },
  { id: 'west', name: 'West' }, { id: 'north', name: 'North' },
];
const seats = { east: 'east', south: 'south', west: 'west', north: 'north' } as const;
const current = {
  seats: { east: 'east', south: 'south', west: 'west', north: 'north' },
  prevailingWind: 'east', eastCycleStartPlayerId: 'east',
} satisfies ProgressionState;
const ordinaryInput = {
  hand: {
    sets: [
      set('red', 'pung', dragon('red')), set('two', 'pung', suited('bamboo', 2)),
      set('three', 'pung', suited('bamboo', 3)), set('four', 'pung', suited('bamboo', 4)),
      set('pair', 'pair', wind('east')),
    ], bonusTiles: [], isWinner: true, winningMethod: 'wall' as const,
  }, playerWind: 'east' as const, prevailingWind: 'east' as const,
};

describe('current runtime compatibility projections', () => {
  it('maps a certified Classical ordinary settlement from neutral effects', async () => {
    const { legacy, runtime } = await createParityHarness(refs.bmja);
    const round = { outcome: { type: 'win' as const, winnerId: 'east' }, scores: { east: 200, south: 100, west: 300, north: 400 } };
    const neutral = runtime.settleRound({ players, seats, round });
    expect(mapCurrentRuntimeSettlement(players.map(({ id }) => id), neutral))
      .toEqual(legacy.settleRound(players, seats, round));
  });

  it('maps a certified OTB liability settlement from neutral effects', async () => {
    const { legacy, runtime } = await createParityHarness(refs['outside-the-box']);
    const round = {
      outcome: { type: 'win' as const, winnerId: 'south' },
      scores: { east: 100, south: 30, west: 20, north: 10 },
      incidents: [{ type: 'cannon' as const, liablePlayerId: 'east', danger: 'one-suit' as const, noChoiceAccepted: false }],
    };
    const neutral = runtime.settleRound({ players, seats, round });
    expect(mapCurrentRuntimeSettlement(players.map(({ id }) => id), neutral))
      .toEqual(legacy.settleRound(players, seats, round));
  });

  it('maps certified progression metadata, including prevailing-wind advancement, without re-deciding it', async () => {
    const { legacy, runtime } = await createParityHarness(refs.bmja);
    const progressionPlayers = ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id }));
    let state: ProgressionState = {
      seats: { a: 'east', b: 'south', c: 'west', d: 'north' },
      prevailingWind: 'east', eastCycleStartPlayerId: 'a',
    };
    for (const winnerId of ['c', 'd', 'a', 'b']) {
      const outcome = { type: 'win' as const, winnerId };
      const neutral = runtime.progressGame({ players: progressionPlayers, current: state, outcome });
      const mapped = mapCurrentRuntimeProgression(neutral);
      expect(mapped).toEqual(legacy.progressGame(progressionPlayers, state, outcome));
      state = mapped;
    }
    expect(state.prevailingWind).toBe('south');
  });

  it('unwraps a complete Classical breakdown and fails closed for invalid result grammar', async () => {
    const { legacy, runtime } = await createParityHarness(refs.bmja);
    const scored = runtime.scoreHand(platformScoreInput(legacy, ordinaryInput));
    expect(jsonNormalise(mapCurrentClassicalScoreBreakdown(scored)))
      .toEqual(jsonNormalise(legacy.scoreHand(ordinaryInput)));
    const invalid = { ...scored, grammar: 'pattern-accumulator' as const } as HandScoreResult;
    expect(() => mapCurrentClassicalScoreBreakdown(invalid)).toThrow('CURRENT_RUNTIME_COMPAT_INVALID:CLASSICAL_BREAKDOWN');
  });

  it('fails closed when settlement or progression compatibility metadata is absent', () => {
    expect(() => mapCurrentRuntimeSettlement(['east'], [{ from: 'east', to: 'east', amount: 0, reasonId: 'test' }]))
      .toThrow('CURRENT_RUNTIME_COMPAT_INVALID:METADATA_REQUIRED');
    expect(() => mapCurrentRuntimeProgression({ nextState: current, reasonId: 'test' }))
      .toThrow('CURRENT_RUNTIME_COMPAT_INVALID:METADATA_REQUIRED');
  });
});
