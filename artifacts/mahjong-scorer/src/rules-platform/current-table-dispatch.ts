import { settlementImplementation } from './classical-strategies';
import { outsideTheBoxRoundPreparationImplementation, outsideTheBoxSettlementImplementation } from './outside-the-box-strategies';
import { buzzardSettlementImplementation, prepareBuzzardRound } from './buzzard-strategies';
import type { ExecutableRegistryIdentity, JsonObject } from './types';

const key = (identity: ExecutableRegistryIdentity) => `${identity.id}@${identity.semanticRevision}`;
type TableInput = { players: any[]; seats: Record<string, any>; round: any; tableLimit?: number };

export const currentSettlementImplementation = (identity: ExecutableRegistryIdentity, params: JsonObject, defaultTableLimit: number) => {
  const bank = new Map<string, () => (input: TableInput) => any>([
    ['settlement.classical-pairwise@1', () => settlementImplementation(identity as any)],
    ['settlement.outside-the-box-incidents@1', () => {
      const limit = params.limit;
      if (typeof limit !== 'number' || !Number.isFinite(limit) || limit <= 0) throw new Error('RUNTIME_OTB_SETTLEMENT_PARAMS_INVALID');
      const settle = outsideTheBoxSettlementImplementation(identity as any);
      return ({ players, seats, round }) => settle({ players, seats, round, limit });
    }],
    ['settlement.buzzard-2000@1', () => {
      const settle = buzzardSettlementImplementation(identity);
      return ({ players, seats, round, tableLimit }) => settle({ players, seats, round, tableLimit: tableLimit ?? defaultTableLimit });
    }],
  ]);
  const selected = bank.get(key(identity));
  if (!selected) throw new Error(`RUNTIME_SETTLEMENT_IMPLEMENTATION_UNAVAILABLE:${key(identity)}`);
  return selected();
};

export const currentRoundPreparationImplementation = (identity: ExecutableRegistryIdentity) => {
  const bank = new Map<string, () => (input: TableInput) => any>([
    ['incident.outside-the-box-round-preparation@1', () => outsideTheBoxRoundPreparationImplementation(identity as any)],
    ['incident.buzzard-2000-round-preparation@1', () => prepareBuzzardRound],
  ]);
  const selected = bank.get(key(identity));
  if (!selected) throw new Error(`RUNTIME_INCIDENT_IMPLEMENTATION_UNAVAILABLE:${key(identity)}`);
  return selected();
};
