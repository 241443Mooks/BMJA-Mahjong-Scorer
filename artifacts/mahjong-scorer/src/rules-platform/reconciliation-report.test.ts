import { describe, expect, it } from 'vitest';
import { buildTruthReconciliationReport, renderTruthReconciliationMarkdown } from '../rules-knowledge/truth/reconciliation-report';

describe('automated governed-fact reconciliation', () => {
  it('separates stable coverage inventory from actionable exceptions', () => {
    const profile = { id: 'bmja', version: '1.0' };
    const first = buildTruthReconciliationReport(profile);
    const second = buildTruthReconciliationReport(profile);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    const flowers = first.coverage.filter(({ subject }) => ['rule.classical.flower-season-base-scoring', 'rule.classical.own-flower-season-double', 'rule.classical.complete-flower-season-set-double'].includes(subject.id));
    expect(flowers.map(({ subject }) => subject.id)).toEqual([
      'rule.classical.complete-flower-season-set-double',
      'rule.classical.flower-season-base-scoring',
      'rule.classical.own-flower-season-double',
    ]);
    expect(flowers.every(({ claims }) => claims.every(({ source }) => source?.locator.label))).toBe(true);
    expect(first.exceptions).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'C1-bmja-goulash', disposition: 'disclosed' }),
      expect.objectContaining({ id: 'C3-rob-kong-validation', disposition: 'unresolved' }),
      expect.objectContaining({ id: 'C6-blessing-chow-wording', disposition: 'unresolved' }),
    ]));
    expect(first.exceptions.some(({ id }) => id.includes('goulash-round-transition'))).toBe(false);
    const draw = first.coverage.find(({ subject }) => subject.id === 'rule.classical.draw-has-no-settlement');
    expect(draw?.sourceState).toBe('verified');
    expect(draw?.runtime.mappingState).toBe('complete');
    expect(draw?.runtime.conformance).toBe('exact-fact-fixture');
    const doubles = first.mechanisms.find(({ ref }) => ref === 'rule:scoring.scoreBonusDoubles');
    expect(doubles?.factIds).toEqual(expect.arrayContaining([
      'bmja@1.0:rule.classical.own-flower-season-double',
      'bmja@1.0:rule.classical.complete-flower-season-set-double',
    ]));
    const markdown = renderTruthReconciliationMarkdown(first);
    expect(markdown).toContain('# Rules evidence reconciliation: bmja@1.0');
    expect(markdown).toContain('## Actionable exceptions');
    expect(markdown).toContain('## Coverage inventory');
    expect(markdown).toContain('mapping incomplete');
    expect(markdown).not.toMatch(/\b\d+(?:\.\d+)?%\b/);
  });
});
