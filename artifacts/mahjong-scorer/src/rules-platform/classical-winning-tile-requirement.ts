import type { GameContext, MahjongHand, PlayingTile, WinningTileProvenance } from '../scoring/types';
import { expandedTiles, tileKey } from '../scoring/tiles';
import type { RulesProfileRef } from '../game/types';
import { getCurrentCompiledRulesRuntime } from './current-runtime-registry';
import type { HandScoreResult } from './types';

export type ClassicalWinningTileRequirement =
  | { kind: 'irrelevant' }
  | { kind: 'required'; alternatives: readonly WinningTileProvenance[] };

const alternativesFor = (hand: MahjongHand): WinningTileProvenance[] => {
  if (hand.sets.length === 0) {
    const seen = new Set<string>();
    return (hand.looseTiles ?? []).flatMap((tile) => {
      const key = tileKey(tile);
      if (seen.has(key)) return [];
      seen.add(key);
      return [{ tile, target: { type: 'loose-layout' as const } }];
    });
  }
  return hand.sets.flatMap((group) => expandedTiles(group).flatMap((tile, tileIndex) =>
    group.kind === 'chow'
      ? [{ tile, target: { type: 'grouped-set' as const, setId: group.id, tileIndex: tileIndex as 0 | 1 | 2 } }]
      : tileIndex === 0
        ? [{ tile, target: { type: 'grouped-set' as const, setId: group.id } }]
        : [],
  ));
};

const materialResult = (result: Extract<HandScoreResult, { grammar: 'classical-points-doubles' }>) =>
  JSON.stringify({ legal: result.legal, disposition: result.disposition, matchedCanonicalPatternIds: result.matchedCanonicalPatternIds, result: result.result });

/**
 * Compares only lawful destinations already represented by this complete hand.
 * The exact profile runtime remains the sole scoring authority.
 */
export const requireClassicalWinningTile = (
  profile: RulesProfileRef,
  hand: MahjongHand,
  context: GameContext,
): ClassicalWinningTileRequirement => {
  const compiled = getCurrentCompiledRulesRuntime(profile);
  if (compiled.grammar !== 'classical-points-doubles') throw new Error('CLASSICAL_WINNER_RUNTIME_REQUIRED');
  const alternatives = alternativesFor(hand);
  if (alternatives.length < 2) return { kind: 'irrelevant' };
  const outcomes = new Set(alternatives.map((provenance) => {
    const result = compiled.runtime.scoreHand({ evidence: { ...hand, winningTileProvenance: provenance }, context });
    if (result.grammar !== 'classical-points-doubles') throw new Error('CLASSICAL_WINNER_RUNTIME_GRAMMAR_CHANGED');
    return materialResult(result);
  }));
  return outcomes.size > 1 ? { kind: 'required', alternatives } : { kind: 'irrelevant' };
};
