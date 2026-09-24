import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { canonicalSettlementExample } from './settlement-teaching-example';

beforeAll(() => initialiseCurrentRulesRuntimes());

describe('canonical settlement teaching example', () => {
  it('uses the production engine for the established #70 British example', () => {
    expect(canonicalSettlementExample().changes).toEqual({ east: -64, south: 240, west: -96, north: -80 });
  });
});
