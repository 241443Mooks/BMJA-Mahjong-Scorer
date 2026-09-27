import type { BonusTile, GameContext, HandSet, MahjongHand, PlayingTile, UngroupedBlankTile } from '../scoring/types';
import type { RulesProfileRef } from './types';
import { structuralTileCount } from '../scoring/tiles';
import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import { interpretClassicalHand, type ClassicalInterpretationResult } from '../rules-platform/classical-interpretation';
import type { HandScoreResult } from '../rules-platform/types';

export type HybridNonWinnerState = {
  profile: RulesProfileRef;
  explicitSets: readonly HandSet[];
  unresolvedTiles: readonly PlayingTile[];
  bonusTiles: readonly BonusTile[];
  ungroupedBlankTiles?: readonly UngroupedBlankTile[];
  context: GameContext;
  handMode: 'normal' | 'goulash';
};

export type HybridNonWinnerResolution = {
  /** Exact-runtime score of established evidence only; unresolved tiles stay loose. */
  scoreResult: HandScoreResult;
  /** Structural readings are analysis only and are never projected into scoreResult. */
  interpretation?: ClassicalInterpretationResult;
};

/**
 * Scores the current non-winner evidence conservatively, then exposes the
 * existing interpreter's lawful 13-tile readings for analysis. Fishing remains
 * inside the exact compiled runtime and its existing completion machinery.
 */
export function resolveHybridNonWinner(state: HybridNonWinnerState): HybridNonWinnerResolution {
  const compiled = getCurrentCompiledRulesRuntime(state.profile);
  if (compiled.grammar !== 'classical-points-doubles') {
    throw new Error(`CLASSICAL_RUNTIME_REQUIRED:${state.profile.id}@${state.profile.version}`);
  }

  const evidence: MahjongHand = {
    sets: [...state.explicitSets],
    ...(state.unresolvedTiles.length ? { remainingTiles: [...state.unresolvedTiles] } : {}),
    bonusTiles: [...state.bonusTiles],
    ...(state.ungroupedBlankTiles?.length ? { ungroupedBlankTiles: [...state.ungroupedBlankTiles] } : {}),
    isWinner: false,
  };
  const scoreResult = compiled.runtime.scoreHand({ evidence, context: { ...state.context, handMode: state.handMode } });
  // More than thirteen physical tiles may still have a lawful thirteen-slot
  // reading when the interpreter identifies one or more Kongs. Keep those
  // readings informational until the player establishes them explicitly.
  if (structuralTileCount(evidence) < 13) return { scoreResult };

  const interpretation = interpretClassicalHand({
    profile: state.profile,
    explicitSets: state.explicitSets,
    unresolvedTiles: state.unresolvedTiles,
    bonusTiles: state.bonusTiles,
    ungroupedBlankTiles: state.ungroupedBlankTiles,
    isWinner: false,
    context: state.context,
    handMode: state.handMode,
  });
  return { scoreResult, interpretation };
}
