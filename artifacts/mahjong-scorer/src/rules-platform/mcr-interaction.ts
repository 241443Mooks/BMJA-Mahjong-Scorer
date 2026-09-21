import { detectMcr2006Fans } from './mcr-detectors';
import type { McrScoringInput } from './mcr-scoring-input';
import type { PatternAccumulatorCandidate, PatternAccumulatorInteraction, PatternAccumulatorStageContracts } from './pattern-accumulator-runtime';

export const MCR_2006_INTERACTION_POLICY_ID = 'interaction.mcr-2006-non-combination';

const binding = (candidate: PatternAccumulatorCandidate) => candidate.bindingId ?? candidate.id.split('#')[0]!;
const slug = (candidate: PatternAccumulatorCandidate) => binding(candidate).replace('mcr2006.fan.', '');
const reason = (kind: string) => `${MCR_2006_INTERACTION_POLICY_ID}.${kind}`;

/** Appendix-1 wording transcribed from the source-linked catalogue, rather than inferred from fan names. */
export const MCR_2006_SOURCE_EXCLUSIONS: Readonly<Record<string, readonly string[]>> = {
  'big-four-winds': ['big-three-winds', 'all-pungs', 'prevalent-wind', 'seat-wind', 'pung-terminals-or-honors'],
  'big-three-dragons': ['two-dragon-pungs', 'dragon-pung'],
  'nine-gates': ['full-flush', 'concealed-hand', 'pung-terminals-or-honors'],
  'four-kongs': ['single-wait'],
  'seven-shifted-pairs': ['full-flush', 'concealed-hand', 'single-wait'],
  'thirteen-orphans': ['all-types', 'concealed-hand', 'single-wait'],
  'all-terminals': ['all-pungs', 'outside-hand', 'pung-terminals-or-honors', 'no-honors', 'all-terminals-and-honors', 'four-concealed-pungs', 'three-concealed-pungs', 'two-concealed-pungs'],
  'little-four-winds': ['big-three-winds', 'pung-terminals-or-honors'],
  'little-three-dragons': ['dragon-pung', 'two-dragon-pungs'],
  'all-honors': ['all-pungs', 'outside-hand', 'pung-terminals-or-honors'],
  'four-concealed-pungs': ['all-pungs', 'concealed-hand', 'three-concealed-pungs', 'two-concealed-pungs'],
  'pure-terminal-chows': ['seven-pairs', 'full-flush', 'all-chows', 'pure-double-chow', 'two-terminal-chows', 'no-honors', 'one-voided-suit'],
  'all-terminals-and-honors': ['all-pungs', 'pung-terminals-or-honors'],
  'seven-pairs': ['concealed-hand', 'single-wait'],
  'greater-honors-knitted': ['all-types', 'concealed-hand'],
  'all-even-pungs': ['all-pungs', 'all-simples'],
  'full-flush': ['no-honors', 'one-voided-suit'],
  'pure-triple-chow': ['pure-double-chow'],
  'upper-tiles': ['no-honors'],
  'middle-tiles': ['no-honors', 'all-simples'],
  'lower-tiles': ['no-honors'],
  'three-suited-terminal-chows': ['pure-double-chow', 'two-terminal-chows', 'no-honors', 'all-chows'],
  'all-fives': ['all-simples'],
  'lesser-honors-knitted': ['all-types', 'concealed-hand'],
  'upper-four': ['no-honors'],
  'lower-four': ['no-honors'],
  'reversible-tiles': ['one-voided-suit'],
  'last-tile-draw': ['self-drawn'],
  'robbing-the-kong': ['last-tile'],
  'melded-hand': ['single-wait'],
  'all-chows': ['no-honors'],
  // Preserve the formal names exactly; these are not typo repairs.
  'quadruple-chow': ['pure-shifted-pungs'],
  'four-pure-shifted-pungs': ['pure-triple-chow'],
};

/** Non-Repeat implications not stated by the table but mechanically inevitable from the detected structural occurrence. */
const nonRepeat: Readonly<Record<string, readonly string[]>> = {
  'quadruple-chow': ['pure-triple-chow', 'pure-double-chow', 'tile-hog', 'concealed-hand', 'no-honors'],
  'four-pure-shifted-pungs': ['pure-shifted-pungs'],
  'four-pure-shifted-chows': ['pure-shifted-chows'],
  'pure-terminal-chows': ['concealed-hand', 'no-honors'],
  'three-kongs': ['two-melded-kongs', 'two-concealed-kongs', 'melded-kong', 'concealed-kong'],
  'two-concealed-kongs': ['concealed-kong'],
  'two-melded-kongs': ['melded-kong'],
};

const specialOwner: Readonly<Record<string, string>> = {
  'seven-pairs': 'seven-pairs',
  'seven-shifted-pairs': 'seven-pairs',
  'thirteen-orphans': 'thirteen-orphans',
};

const occurrenceElements = (candidate: PatternAccumulatorCandidate): readonly string[] => {
  const parts = candidate.id.split('#');
  const occurrence = parts.slice(2).join('#');
  return occurrence === 'hand' || occurrence === 'match' || occurrence === 'pre-win' || occurrence === 'winning-role' || occurrence === 'pair' || occurrence.includes('assignment:') || occurrence.includes('wall') || occurrence.includes('draw') || occurrence.includes('replacement') || occurrence.includes('kong') && !occurrence.includes('fixed:')
    ? []
    : occurrence.split('+').filter((part) => part.startsWith('fixed:') || part.startsWith('free:'));
};

const compare = (left: PatternAccumulatorCandidate, right: PatternAccumulatorCandidate) => right.value - left.value || left.id.localeCompare(right.id);

const availableTo = (candidate: PatternAccumulatorCandidate, alternativeId: string) => {
  if (candidate.interpretationId === alternativeId || candidate.interpretationId === 'context') return true;
  if (candidate.interpretationId !== 'hand') return false;
  const owner = specialOwner[slug(candidate)];
  return owner === undefined || alternativeId === owner;
};

const suppress = (candidate: PatternAccumulatorCandidate, reasonId: string) => ({ candidate, reasonId });

/**
 * Applies the source table first, then uses occurrence identities for the five
 * §3.9.1 principles.  The search is deliberately order-independent: it finds
 * the highest lawful subset and only uses stable candidate identity on ties.
 */
const countAlternative = (candidates: readonly PatternAccumulatorCandidate[], id: string) => {
  const applicable = candidates.filter((candidate) => availableTo(candidate, id) && !['chicken-hand', 'flower-tiles'].includes(slug(candidate))).sort(compare);
  const suppressed = new Map<string, string>();
  for (const high of applicable) {
    for (const low of MCR_2006_SOURCE_EXCLUSIONS[slug(high)] ?? []) {
      for (const target of applicable.filter((candidate) => slug(candidate) === low)) suppressed.set(target.id, reason(`source-${slug(high)}-excludes-${low}`));
    }
    for (const low of nonRepeat[slug(high)] ?? []) {
      for (const target of applicable.filter((candidate) => slug(candidate) === low)) suppressed.set(target.id, reason(`non-repeat-${slug(high)}-implies-${low}`));
    }
  }
  const remaining = applicable.filter((candidate) => !suppressed.has(candidate.id));
  let best: readonly PatternAccumulatorCandidate[] = [];
  const score = (items: readonly PatternAccumulatorCandidate[]) => items.reduce((total, candidate) => total + candidate.value, 0);
  const canonical = (items: readonly PatternAccumulatorCandidate[]) => [...items].map((candidate) => candidate.id).sort().join('|');
  const visit = (at: number, selected: readonly PatternAccumulatorCandidate[]) => {
    if (at === remaining.length) {
      if (score(selected) > score(best) || score(selected) === score(best) && canonical(selected) < canonical(best)) best = selected;
      return;
    }
    visit(at + 1, selected);
    const next = remaining[at]!;
    const elements = occurrenceElements(next);
    const sameFanReuse = selected.some((chosen) => binding(chosen) === binding(next) && elements.length > 0 && occurrenceElements(chosen).some((element) => elements.includes(element)));
    if (sameFanReuse) return;
    visit(at + 1, [...selected, next]);
  };
  visit(0, []);
  for (const candidate of remaining) if (!best.some((chosen) => chosen.id === candidate.id)) {
    const same = best.find((chosen) => binding(chosen) === binding(candidate) && occurrenceElements(candidate).some((element) => occurrenceElements(chosen).includes(element)));
    if (same) suppressed.set(candidate.id, reason(`non-identical-${slug(candidate)}-occurrence-reuse`));
  }
  return { id, counted: [...best].sort((left, right) => left.id.localeCompare(right.id)), suppressed: applicable.filter((candidate) => suppressed.has(candidate.id)).sort((left, right) => left.id.localeCompare(right.id)).map((candidate) => suppress(candidate, suppressed.get(candidate.id)!)) };
};

export const interactMcr2006NonCombination: PatternAccumulatorStageContracts<McrScoringInput>['interaction'] = (candidates, input): PatternAccumulatorInteraction => {
  const interpretations = detectMcr2006Fans(input).interpretations;
  return { alternatives: interpretations.map((interpretation) => countAlternative(candidates, interpretation.id)) };
};
