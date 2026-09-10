import { describe, expect, it } from 'vitest';
import type { DetectedPattern, RuleReferenceId } from '../scoring';
import { detectedPatternReferenceHref } from './detected-pattern-references';

const ordinaryPattern = (
  type: 'points' | 'doubles',
  referenceId?: RuleReferenceId,
): Pick<DetectedPattern, 'id' | 'type' | 'referenceId'> => ({
  id: `${type}-test`,
  type,
  ...(referenceId ? { referenceId } : {}),
});

describe('detected pattern guide references', () => {
  it.each([
    ['pung-minor', '/guide#rule-pung-minor'],
    ['pung-major', '/guide#rule-pung-major'],
    ['kong-minor', '/guide#rule-kong-minor'],
    ['kong-major', '/guide#rule-kong-major'],
    ['dragon-pair', '/guide#rule-dragon-pair'],
    ['own-wind-pair', '/guide#rule-own-wind-pair'],
    ['prevailing-wind-pair', '/guide#rule-prevailing-wind-pair'],
    ['bonus-tile-points', '/guide#rule-bonus-tile-points'],
    ['mahjong-points', '/guide#rule-mahjong-points'],
    ['live-wall-win', '/guide#rule-live-wall-win'],
  ] as const)('deep-links %s to its exact point rule', (referenceId, href) => {
    expect(detectedPatternReferenceHref(ordinaryPattern('points', referenceId))).toBe(href);
  });

  it('keeps basic Flower/Season points distinct from matching bonus doubles', () => {
    expect(
      detectedPatternReferenceHref(ordinaryPattern('points', 'bonus-tile-points')),
    ).toBe('/guide#rule-bonus-tile-points');
    expect(
      detectedPatternReferenceHref(ordinaryPattern('doubles', 'own-flower-double')),
    ).toBe('/guide#rule-own-bonus-double');
    expect(
      detectedPatternReferenceHref(ordinaryPattern('doubles', 'season-bouquet-double')),
    ).toBe('/guide#rule-bonus-bouquet-double');
  });

  it('falls back safely for ordinary rules without a specific destination', () => {
    expect(detectedPatternReferenceHref(ordinaryPattern('points'))).toBe(
      '/guide#ordinary-scoring',
    );
    expect(detectedPatternReferenceHref(ordinaryPattern('doubles'))).toBe(
      '/guide#doubles',
    );
  });

  it('preserves special-hand and fishing routes', () => {
    expect(
      detectedPatternReferenceHref({ id: 'special-purity', type: 'special' }),
    ).toBe('/special-hands#purity');
    expect(
      detectedPatternReferenceHref({ id: 'fishing-purity', type: 'fishing' }),
    ).toBe('/special-hands#purity');
    expect(
      detectedPatternReferenceHref({ id: 'fishing-future-rule', type: 'fishing' }),
    ).toBe('/guide#fishing');
  });
});
