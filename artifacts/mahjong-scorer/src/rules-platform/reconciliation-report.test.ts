import { describe, expect, it } from 'vitest';
import { buildTruthReconciliationReport, renderTruthReconciliationMarkdown } from '../rules-knowledge/truth/reconciliation-report';

describe('automated governed-fact reconciliation', () => {
  it('produces stable JSON-ready and reader-readable reports without completeness percentages', () => {
    const profile = { id: 'bmja', version: '1.0' };
    const first = buildTruthReconciliationReport(profile);
    const second = buildTruthReconciliationReport(profile);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    const flowers = first.facts.filter(({ subject }) => ['rule.classical.flower-season-base-scoring', 'rule.classical.own-flower-season-double', 'rule.classical.complete-flower-season-set-double'].includes(subject.id));
    expect(flowers.map(({ subject }) => subject.id)).toEqual([
      'rule.classical.complete-flower-season-set-double',
      'rule.classical.flower-season-base-scoring',
      'rule.classical.own-flower-season-double',
    ]);
    expect(flowers.every(({ claims }) => claims.every(({ source }) => source?.locator.label))).toBe(true);
    expect(first.exceptions).toEqual(expect.arrayContaining([
      expect.objectContaining({ factId: expect.stringContaining('rule.classical.goulash-round-transition'), kind: 'runtime-not-modelled' }),
      expect.objectContaining({ factId: expect.stringContaining('rule.classical.goulash-round-transition'), kind: 'conformance-not-established' }),
    ]));
    const markdown = renderTruthReconciliationMarkdown(first);
    expect(markdown).toContain('# Rules evidence reconciliation: bmja@1.0');
    expect(markdown).toContain('runtime-mapping-incomplete');
    expect(markdown).not.toMatch(/\b\d+(?:\.\d+)?%\b/);
  });
});
