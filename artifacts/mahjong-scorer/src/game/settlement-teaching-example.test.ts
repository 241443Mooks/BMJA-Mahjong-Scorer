import { describe, expect, it } from 'vitest';
import { canonicalSettlementExample } from './settlement-teaching-example';

describe('canonical settlement teaching example', () => {
  it('uses the production engine for the established #70 British example', () => {
    expect(canonicalSettlementExample().changes).toEqual({ east: -64, south: 240, west: -96, north: -80 });
  });
});
