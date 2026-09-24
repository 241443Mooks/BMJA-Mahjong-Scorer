import { BMJA_PROFILE_REF } from './ruleset';
import { mapCurrentRuntimeSettlement } from '../rules-platform/current-runtime-compat';
import { getCurrentRulesRuntime } from '../rules-platform/current-runtime-registry';

/** The established #70 example, resolved by the production settlement engine. */
export const canonicalSettlementExample = () => {
  const players = [
    { id: 'east', name: 'East' },
    { id: 'south', name: 'South' },
    { id: 'west', name: 'West' },
    { id: 'north', name: 'North' },
  ];
  const seats = { east: 'east', south: 'south', west: 'west', north: 'north' } as const;
  const runtime = getCurrentRulesRuntime(BMJA_PROFILE_REF);
  return mapCurrentRuntimeSettlement(
    players.map(({ id }) => id),
    runtime.settleRound({
      players,
      seats,
      round: {
        outcome: { type: 'win', winnerId: 'south' },
        scores: { east: 56, south: 60, west: 40, north: 44 },
      },
    }),
  );
};
