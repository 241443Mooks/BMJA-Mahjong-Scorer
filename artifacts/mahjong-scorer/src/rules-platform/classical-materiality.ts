import type { GameContext, MahjongHand } from '../scoring/types';
import type { RulesProfileRef } from '../game/types';
import { getCurrentCompiledRulesRuntime } from './current-runtime-registry';
import type { HandScoreResult } from './types';

/** Stable, user-facing scorer conclusions. Deliberately excludes explanation and trace ordering. */
export const classicalMaterialConclusion = (result: HandScoreResult) => ({
  legal: result.legal,
  disposition: result.disposition,
  result: result.result,
  matchedCanonicalPatternIds: result.matchedCanonicalPatternIds,
});

const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(',')}}`;
  return JSON.stringify(value);
};

/** Compare lawful alternatives through one exact current Classical runtime. */
export const classicalFactIsMaterial = (
  profile: RulesProfileRef,
  hand: MahjongHand,
  context: GameContext,
  alternatives: readonly { hand?: MahjongHand; context?: GameContext }[],
): boolean => {
  if (alternatives.length < 2) return false;
  const compiled = getCurrentCompiledRulesRuntime(profile);
  if (compiled.grammar !== 'classical-points-doubles') return false;
  const conclusions = alternatives.map((alternative) => stable(classicalMaterialConclusion(
    compiled.runtime.scoreHand({ evidence: alternative.hand ?? hand, context: alternative.context ?? context }),
  )));
  return conclusions.some((conclusion) => conclusion !== conclusions[0]);
};

export type ClassicalUncertaintyAxis = {
  id: string;
  label: string;
  alternatives: readonly { label: string; hand?: MahjongHand; context?: GameContext }[];
};

/** Scores only caller-selected material unknowns with the selected exact profile runtime. */
export const resolveClassicalScoreUncertainty = (
  profile: RulesProfileRef,
  hand: MahjongHand,
  context: GameContext,
  axes: readonly ClassicalUncertaintyAxis[],
) => {
  const compiled = getCurrentCompiledRulesRuntime(profile);
  if (compiled.grammar !== 'classical-points-doubles') return [];
  const groups = new Map<string, { conditions: string[]; result: HandScoreResult }>();
  const overlayHand = (candidate: MahjongHand, alternative: MahjongHand): MahjongHand => {
    const next = { ...candidate };
    for (const key of Object.keys(alternative) as (keyof MahjongHand)[]) {
      const before = hand[key];
      const value = alternative[key];
      if (key === 'classicalEvidence' && value && before && typeof value === 'object' && typeof before === 'object') {
        const evidence = { ...candidate.classicalEvidence };
        for (const evidenceKey of Object.keys(value) as (keyof typeof value)[]) {
          if (stable(value[evidenceKey]) !== stable(before[evidenceKey])) evidence[evidenceKey] = value[evidenceKey];
        }
        next.classicalEvidence = evidence;
      } else if (stable(value) !== stable(before)) (next as Record<string, unknown>)[key] = value;
    }
    return next;
  };
  const overlayContext = (candidate: GameContext, alternative: GameContext): GameContext => {
    const next = { ...candidate };
    for (const key of Object.keys(alternative) as (keyof GameContext)[]) {
      if (stable(alternative[key]) !== stable(context[key])) (next as Record<string, unknown>)[key] = alternative[key];
    }
    return next;
  };
  const visit = (index: number, candidateHand: MahjongHand, candidateContext: GameContext, conditions: string[]) => {
    if (index === axes.length) {
      const result = compiled.runtime.scoreHand({ evidence: candidateHand, context: candidateContext });
      const key = stable(classicalMaterialConclusion(result));
      const existing = groups.get(key);
      if (existing) existing.conditions.push(conditions.join(' · '));
      else groups.set(key, { conditions: [conditions.join(' · ')], result });
      return;
    }
    const axis = axes[index];
    for (const alternative of axis.alternatives) visit(
      index + 1,
      alternative.hand ? overlayHand(candidateHand, alternative.hand) : candidateHand,
      alternative.context ? overlayContext(candidateContext, alternative.context) : candidateContext,
      [...conditions, `${axis.label}: ${alternative.label}`],
    );
  };
  visit(0, hand, context, []);
  return [...groups.entries()].map(([conclusion, scenario]) => ({ conclusion, ...scenario }));
};
