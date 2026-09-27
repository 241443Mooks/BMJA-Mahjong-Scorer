import type { GameContext, MahjongHand, PlayingTile, WinningTileProvenance } from '../scoring/types';
import { expandedTiles, tileKey } from '../scoring/tiles';
import type { RulesProfileRef } from '../game/types';
import { getCurrentCompiledRulesRuntime } from './current-runtime-registry';
import type { HandScoreResult } from './types';

export type ClassicalWinningTileRequirement =
  | { kind: 'irrelevant' }
  | { kind: 'required'; alternatives: readonly WinningTileProvenance[] }
  | { kind: 'unknown'; alternatives: readonly WinningTileProvenance[] }
  | { kind: 'unsupported' };

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
 * Compares only represented destinations accepted by the exact profile
 * validator. The exact runtime remains the sole legality and scoring authority.
 * The available evidence has no pre-win 13-tile state or per-tile arrival
 * history. Even a sole remaining destination after filtering cannot prove
 * which tile arrived last; it can only remove a material choice. Therefore
 * this seam never manufactures derived provenance.
 */
export const requireClassicalWinningTile = (
  profile: RulesProfileRef,
  hand: MahjongHand,
  context: GameContext,
): ClassicalWinningTileRequirement => {
  const compiled = getCurrentCompiledRulesRuntime(profile);
  if (compiled.grammar !== 'classical-points-doubles') throw new Error('CLASSICAL_WINNER_RUNTIME_REQUIRED');
  const lawful = alternativesFor(hand).flatMap((provenance) => {
    const evidence = { ...hand, winningTileProvenance: provenance, winningTileEvidenceOrigin: 'confirmed' as const };
    if (compiled.runtime.validateHand({ evidence, context }).length > 0) return [];
    const result = compiled.runtime.scoreHand({ evidence, context });
    if (result.grammar !== 'classical-points-doubles') throw new Error('CLASSICAL_WINNER_RUNTIME_GRAMMAR_CHANGED');
    return result.legal ? [{ provenance, outcome: materialResult(result) }] : [];
  });
  if (lawful.length === 0) return { kind: 'unsupported' };
  if (lawful.length === 1) return { kind: 'irrelevant' };
  if (new Set(lawful.map(({ outcome }) => outcome)).size === 1) return { kind: 'irrelevant' };
  if (hand.winningTileEvidenceOrigin === 'unknown' && !hand.winningTileProvenance) {
    return { kind: 'unknown', alternatives: lawful.map(({ provenance }) => provenance) };
  }
  return { kind: 'required', alternatives: lawful.map(({ provenance }) => provenance) };
};
