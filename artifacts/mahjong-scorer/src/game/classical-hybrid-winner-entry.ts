import type { BonusTile, GameContext, HandSet, MahjongHand, PlayingTile, UngroupedBlankTile, Visibility } from '../scoring/types';
import type { RulesProfileRef } from './types';
import { resolveClassicalWinner, type ClassicalWinnerEvidence, type ClassicalWinnerProvenance, type ClassicalWinnerResolution } from '../rules-platform/classical-winner-resolution';
import { interpretClassicalHand } from '../rules-platform/classical-interpretation';

export type HybridWinnerState = {
  profile: RulesProfileRef;
  explicitSets: readonly HandSet[];
  unresolvedTiles: readonly PlayingTile[];
  bonusTiles: readonly BonusTile[];
  ungroupedBlankTiles?: readonly UngroupedBlankTile[];
  context: GameContext;
  handMode: 'normal' | 'goulash';
  evidence: ClassicalWinnerEvidence;
  candidateId?: string;
  visibility: readonly { groupId: string; value: Visibility }[];
  rejectedCandidateIds?: readonly string[];
};

/** UI adapter only: all interpretation, validation and scoring remain in C1/exact runtime. */
export function resolveHybridWinner(state: HybridWinnerState): ClassicalWinnerResolution {
  const input = {
    profile: state.profile, explicitSets: state.explicitSets, unresolvedTiles: state.unresolvedTiles,
    bonusTiles: state.bonusTiles, ungroupedBlankTiles: state.ungroupedBlankTiles,
    isWinner: true, context: state.context, handMode: state.handMode,
  };
  const rejected = new Set(state.rejectedCandidateIds ?? []);
  const interpreted = rejected.size ? interpretClassicalHand(input) : undefined;
  const candidates = interpreted?.candidates.filter(({ id }) => !rejected.has(id));
  if (interpreted && candidates?.length === 0) return { kind: 'no-lawful-candidate', profile: state.profile, rejected: interpreted.rejected };
  if (state.candidateId && rejected.has(state.candidateId)) return { kind: 'candidate-choice-required', candidates: candidates! };
  if (!state.candidateId && candidates) {
    if (candidates.length > 1) return { kind: 'candidate-choice-required', candidates };
    return resolveClassicalWinner(input, { candidateId: candidates[0]!.id, visibility: state.visibility, evidence: state.evidence });
  }
  return resolveClassicalWinner(input, { candidateId: state.candidateId, visibility: state.visibility, evidence: state.evidence });
}

export type HybridWinnerAudit = { schemaVersion: 1; c1: ClassicalWinnerProvenance; factOrigins: Record<string, 'default' | 'confirmed' | 'unknown' | 'inherited' | 'absent'> };
export type ResolvedHybridWinner = Extract<ClassicalWinnerResolution, { kind: 'ready' }> & { hand: MahjongHand };
