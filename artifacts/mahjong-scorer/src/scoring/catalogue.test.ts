import { describe, expect, it } from 'vitest';
import catalogue from './scoring-rules.catalog.json';
import { specialHandDetectors } from './special-hands';

describe('machine-readable scoring catalogue', () => {
  it('gives every audited rule an implementation and a test reference', () => {
    expect(catalogue.rules.length).toBeGreaterThan(40);
    for (const rule of catalogue.rules) {
      expect(rule.id).toBeTruthy();
      expect(rule.implementation).toBeTruthy();
      expect(rule.test).toMatch(/\.test\.ts:/);
    }
  });

  it('catalogues every supported fixed-value special-hand detector', () => {
    const cataloguedIds = new Set(catalogue.rules.map((rule) => rule.id));
    for (const detector of specialHandDetectors) {
      expect(cataloguedIds.has(`special.${detector.id}`)).toBe(true);
    }
  });

  it('contains no duplicate rule identifiers', () => {
    expect(new Set(catalogue.rules.map((rule) => rule.id)).size).toBe(
      catalogue.rules.length,
    );
  });
});