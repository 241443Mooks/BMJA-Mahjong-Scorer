import { detectMcr2006Fans } from './mcr-detectors';
import type { McrScoringInput } from './mcr-scoring-input';
import type { PatternAccumulatorCandidate, PatternAccumulatorInteraction, PatternAccumulatorStageContracts } from './pattern-accumulator-runtime';

export const MCR_2006_INTERACTION_POLICY_ID = 'interaction.mcr-2006-non-combination';

const binding = (candidate: PatternAccumulatorCandidate) => candidate.bindingId ?? candidate.id.split('#')[0]!;
const slug = (candidate: PatternAccumulatorCandidate) => binding(candidate).replace('mcr2006.fan.', '');
const reason = (kind: string) => `${MCR_2006_INTERACTION_POLICY_ID}.${kind}`;

/** Appendix-1 wording transcribed from the authoritative Green Book interaction policy. */
export const MCR_2006_SOURCE_EXCLUSIONS: Readonly<Record<string, readonly string[]>> = {
  'big-four-winds': ['big-three-winds', 'all-pungs', 'prevalent-wind', 'seat-wind', 'pung-terminals-or-honors'],
  'big-three-dragons': ['two-dragon-pungs', 'dragon-pung'],
  'nine-gates': ['full-flush', 'concealed-hand', 'pung-terminals-or-honors'],
  'four-kongs': ['single-wait'],
  'seven-shifted-pairs': ['full-flush', 'concealed-hand', 'single-wait'],
  'thirteen-orphans': ['all-types', 'concealed-hand', 'single-wait'],
  'all-terminals': ['all-pungs', 'outside-hand', 'pung-terminals-or-honors', 'no-honors'],
  'little-four-winds': ['big-three-winds', 'pung-terminals-or-honors'],
  'little-three-dragons': ['dragon-pung', 'two-dragon-pungs'],
  'all-honors': ['all-pungs', 'outside-hand', 'pung-terminals-or-honors'],
  'four-concealed-pungs': ['all-pungs', 'concealed-hand'],
  'pure-terminal-chows': ['seven-pairs', 'full-flush', 'all-chows', 'pure-double-chow', 'two-terminal-chows'],
  'all-terminals-and-honors': ['all-pungs', 'pung-terminals-or-honors'],
  'seven-pairs': ['concealed-hand', 'single-wait'],
  'greater-honors-knitted': ['all-types', 'concealed-hand'],
  'all-even-pungs': ['all-pungs', 'all-simples'],
  'full-flush': ['no-honors'],
  'pure-triple-chow': ['pure-shifted-pungs', 'pure-double-chow'],
  'pure-shifted-pungs': ['pure-triple-chow'],
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
  'quadruple-chow': ['pure-shifted-pungs', 'tile-hog', 'pure-double-chow'],
  'four-pure-shifted-pungs': ['pure-triple-chow', 'all-pungs'],
  'four-pure-shifted-chows': ['short-straight'],
};

/** Non-Repeat implications explicitly pinned by policy sections 4.1 and 4.2. */
const nonRepeat: Readonly<Record<string, readonly string[]>> = {
  'quadruple-chow': ['pure-triple-chow'],
  'four-pure-shifted-pungs': ['pure-shifted-pungs'],
  'four-pure-shifted-chows': ['pure-shifted-chows'],
  'triple-pung': ['double-pung'],
  'all-terminals': ['all-terminals-and-honors'],
  'all-honors': ['all-terminals-and-honors'],
  'all-terminals-and-honors': ['outside-hand'],
  'thirteen-orphans': ['all-terminals-and-honors'],
  'seven-shifted-pairs': ['seven-pairs', 'no-honors'],
  'nine-gates': ['no-honors'],
  'four-kongs': ['three-kongs', 'all-pungs'],
  'pure-terminal-chows': ['no-honors'],
  'all-even-pungs': ['no-honors'],
  'all-fives': ['no-honors'],
  'all-simples': ['no-honors'],
  'four-concealed-pungs': ['three-concealed-pungs', 'two-concealed-pungs'],
  'three-concealed-pungs': ['two-concealed-pungs'],
  'three-kongs': ['two-melded-kongs', 'two-concealed-kongs', 'melded-kong', 'concealed-kong'],
  'two-concealed-kongs': ['concealed-kong'],
  'two-melded-kongs': ['melded-kong'],
  'upper-tiles': ['upper-four'],
  'lower-tiles': ['lower-four'],
  'fully-concealed-hand': ['self-drawn'],
  'out-with-replacement-tile': ['self-drawn'],
};

const containedNonRepeatPairs = new Set([
  'quadruple-chow->pure-triple-chow',
  'four-pure-shifted-pungs->pure-shifted-pungs',
  'four-pure-shifted-chows->pure-shifted-chows',
  'triple-pung->double-pung',
]);

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

const sharedElements = (left: PatternAccumulatorCandidate, right: PatternAccumulatorCandidate) => occurrenceElements(left).filter((element) => occurrenceElements(right).includes(element));
const containsOccurrence = (higher: PatternAccumulatorCandidate, lower: PatternAccumulatorCandidate) => {
  const higherElements = occurrenceElements(higher);
  const lowerElements = occurrenceElements(lower);
  return higherElements.length > 0 && lowerElements.length > 0 && lowerElements.every((element) => higherElements.includes(element));
};

/**
 * The five principles are evaluated over structural occurrence IDs, never fan
 * names.  Different fan bindings may reuse one already-accounted set once;
 * two reused sets would be a prohibited re-grouping.  Exact competing uses of
 * the same set collection are High-versus-Low alternatives.
 */
const incompatibility = (selected: readonly PatternAccumulatorCandidate[], next: PatternAccumulatorCandidate): string | undefined => {
  const elements = occurrenceElements(next);
  if (!elements.length) return undefined;
  const sameBinding = selected.find((chosen) => binding(chosen) === binding(next) && sharedElements(chosen, next).length);
  if (sameBinding) return reason(`non-identical-${slug(next)}-occurrence-reuse`);
  const exactAlternative = selected.find((chosen) => binding(chosen) !== binding(next) && sharedElements(chosen, next).length === elements.length && occurrenceElements(chosen).length === elements.length);
  if (exactAlternative) return reason(`high-versus-low-${slug(exactAlternative)}-over-${slug(next)}`);
  const reused = [...new Set(selected.flatMap((chosen) => sharedElements(chosen, next)))];
  if (reused.length > 1) return reason(`non-separation-${slug(next)}-structural-regrouping`);
  if (reused.length === 1) {
    const useCount = selected.filter((chosen) => occurrenceElements(chosen).includes(reused[0]!)).length;
    if (useCount >= 2) return reason(`account-once-${slug(next)}-element-reused-twice`);
  }
  return undefined;
};

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
      for (const target of applicable.filter((candidate) => slug(candidate) === low)) {
        if (!suppressed.has(target.id)) suppressed.set(target.id, reason(`source-${slug(high)}-excludes-${low}`));
      }
    }
    for (const low of nonRepeat[slug(high)] ?? []) {
      for (const target of applicable.filter((candidate) => slug(candidate) === low)) {
        const pair = `${slug(high)}->${low}`;
        if ((!containedNonRepeatPairs.has(pair) || containsOccurrence(high, target)) && !suppressed.has(target.id)) suppressed.set(target.id, reason(`non-repeat-${slug(high)}-implies-${low}`));
      }
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
    if (incompatibility(selected, next)) return;
    visit(at + 1, [...selected, next]);
  };
  visit(0, []);
  for (const candidate of remaining) if (!best.some((chosen) => chosen.id === candidate.id)) {
    const reasonId = incompatibility(best, candidate);
    if (reasonId) suppressed.set(candidate.id, reasonId);
  }
  return { id, counted: [...best].sort((left, right) => left.id.localeCompare(right.id)), suppressed: applicable.filter((candidate) => suppressed.has(candidate.id)).sort((left, right) => left.id.localeCompare(right.id)).map((candidate) => suppress(candidate, suppressed.get(candidate.id)!)) };
};

export const interactMcr2006NonCombination: PatternAccumulatorStageContracts<McrScoringInput>['interaction'] = (candidates, input): PatternAccumulatorInteraction => {
  const interpretations = detectMcr2006Fans(input).interpretations;
  return { alternatives: interpretations.map((interpretation) => countAlternative(candidates, interpretation.id)) };
};
