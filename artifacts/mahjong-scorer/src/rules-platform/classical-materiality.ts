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
