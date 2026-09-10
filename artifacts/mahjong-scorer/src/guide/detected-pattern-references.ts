import type { DetectedPattern, RuleReferenceId } from '../scoring';
import { specialHandReferenceHref } from './special-hand-references';

/** Public guide destinations keyed by stable scoring-rule references, not display labels. */
const ordinaryRuleHrefs: Partial<Record<RuleReferenceId, string>> = {
  'pung-minor': '/guide#rule-pung-minor',
  'pung-major': '/guide#rule-pung-major',
  'kong-minor': '/guide#rule-kong-minor',
  'kong-major': '/guide#rule-kong-major',
  'dragon-pair': '/guide#rule-dragon-pair',
  'own-wind-pair': '/guide#rule-own-wind-pair',
  'prevailing-wind-pair': '/guide#rule-prevailing-wind-pair',
  'bonus-tile-points': '/guide#rule-bonus-tile-points',
  'mahjong-points': '/guide#rule-mahjong-points',
  'live-wall-win': '/guide#rule-live-wall-win',
  'own-flower-double': '/guide#rule-own-bonus-double',
  'own-season-double': '/guide#rule-own-bonus-double',
  'flower-bouquet-double': '/guide#rule-bonus-bouquet-double',
  'season-bouquet-double': '/guide#rule-bonus-bouquet-double',
};

/**
 * Resolve a detected scorer callout to the smallest useful explanation.
 * Unknown/future ordinary rules retain a safe chapter-level fallback.
 */
export const detectedPatternReferenceHref = (
  pattern: Pick<DetectedPattern, 'id' | 'type' | 'referenceId'>,
): string | undefined => {
  if (pattern.type === 'points') {
    return (pattern.referenceId && ordinaryRuleHrefs[pattern.referenceId]) || '/guide#ordinary-scoring';
  }
  if (pattern.type === 'doubles') {
    return (pattern.referenceId && ordinaryRuleHrefs[pattern.referenceId]) || '/guide#doubles';
  }
  if (pattern.type === 'special') {
    return specialHandReferenceHref(pattern.id.replace('special-', ''));
  }
  if (pattern.type === 'fishing') {
    return specialHandReferenceHref(pattern.id.replace('fishing-', '')) ?? '/guide#fishing';
  }
  return undefined;
};
