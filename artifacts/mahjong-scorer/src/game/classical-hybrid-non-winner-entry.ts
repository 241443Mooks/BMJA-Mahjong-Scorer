import type { BonusTile, GameContext, HandSet, MahjongHand, PlayingTile, UngroupedBlankTile, Visibility } from '../scoring/types';
import { expandedTiles, tileKey } from '../scoring/tiles';
import type { RulesProfileRef } from './types';
import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import { interpretClassicalHand, projectClassicalInterpretation, type ClassicalInterpretationCandidate, type ClassicalInterpretationResult } from '../rules-platform/classical-interpretation';
import { mapCurrentClassicalScoreBreakdown } from '../rules-platform/current-runtime-compat';
import type { HandScoreResult } from '../rules-platform/types';
import type { ClassicalWinnerFactResolution, ClassicalWinnerProvenance } from '../rules-platform/classical-winner-resolution';
import type { HybridWinnerAudit } from './classical-hybrid-winner-entry';

export type HybridNonWinnerState = {
  profile: RulesProfileRef;
  explicitSets: readonly HandSet[];
  unresolvedTiles: readonly PlayingTile[];
  bonusTiles: readonly BonusTile[];
  ungroupedBlankTiles?: readonly UngroupedBlankTile[];
  context: GameContext;
  handMode: 'normal' | 'goulash';
};

export type HybridNonWinnerSelection = {
  candidate: ClassicalInterpretationCandidate;
  visibilityByGroupId: Readonly<Record<string, Visibility>>;
  groupedTileCount: number;
};

export type HybridNonWinnerResolution = {
  /** Exact-runtime score and the projected evidence that produced it. */
  scoreResult: HandScoreResult;
  resolvedHand: MahjongHand;
  interpretation: ClassicalInterpretationResult;
  selection?: HybridNonWinnerSelection;
  audit?: HybridWinnerAudit;
};

const finalScore = (result: HandScoreResult): number | undefined => {
  if (result.grammar !== 'classical-points-doubles' || !result.legal) return undefined;
  const value = mapCurrentClassicalScoreBreakdown(result).finalScore;
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
};

const visibilityKey = (assignment: Readonly<Record<string, Visibility>>) =>
  JSON.stringify(Object.entries(assignment).sort(([left], [right]) => left.localeCompare(right)));

const candidateCoverage = (candidate: ClassicalInterpretationCandidate) =>
  candidate.inferredGroups.reduce((count, group) => count + group.physicalTileIndexes.length, 0);

const selectedAudit = (
  candidate: ClassicalInterpretationCandidate,
  visibilityByGroupId: Readonly<Record<string, Visibility>>,
): HybridWinnerAudit => {
  const factResolutions: ClassicalWinnerFactResolution[] = candidate.unresolvedFacts.map(({ groupId }) => ({
    type: 'group-visibility', groupId, value: visibilityByGroupId[groupId]!, origin: 'default',
  }));
  const c1: ClassicalWinnerProvenance = {
    schemaVersion: 1,
    profile: { ...candidate.profile },
    candidateId: candidate.id,
    explicitSetIds: candidate.explicitSets.map(({ id }) => id),
    inferredGroups: candidate.inferredGroups,
    factResolutions,
  };
  return { schemaVersion: 1, c1, factOrigins: Object.fromEntries(factResolutions.map(({ groupId }) => [groupId, 'default'])) };
};

/** Reopens an applied inferred score as editable explicit-plus-unresolved evidence. */
export const restoreHybridNonWinnerEvidence = (
  hand: MahjongHand | undefined,
  audit: HybridWinnerAudit | undefined,
  profile?: RulesProfileRef,
): MahjongHand | undefined => {
  if (!hand || hand.isWinner || hand.looseTiles?.length || !audit || audit.c1.inferredGroups.length === 0) return hand;
  if (profile && (audit.c1.profile.id !== profile.id || audit.c1.profile.version !== profile.version)) return hand;

  const inferredIds = new Set(audit.c1.inferredGroups.map(({ id }) => id));
  const inferredSets = hand.sets.filter(({ id }) => inferredIds.has(id));
  if (inferredSets.length !== inferredIds.size) return hand;
  const visibility = new Map(audit.c1.factResolutions.map(({ groupId, value }) => [groupId, value]));
  const sourceIndexes = audit.c1.inferredGroups.flatMap(({ physicalTileIndexes }) => physicalTileIndexes);
  if (new Set(sourceIndexes).size !== sourceIndexes.length) return hand;
  const sourceTileCount = sourceIndexes.length + (hand.remainingTiles?.length ?? 0);
  if (sourceIndexes.some((index) => !Number.isInteger(index) || index < 0 || index >= sourceTileCount)) return hand;
  const remainingSourceIndexes = Array.from({ length: sourceTileCount }, (_, index) => index).filter((index) => !sourceIndexes.includes(index));
  if (remainingSourceIndexes.length !== (hand.remainingTiles?.length ?? 0)) return hand;

  const sourceTiles: Array<PlayingTile | undefined> = Array.from({ length: sourceTileCount });
  for (const group of audit.c1.inferredGroups) {
    const savedSet = inferredSets.find(({ id }) => id === group.id);
    const tileIndexes = group.physicalTileIndexes;
    if (!savedSet || savedSet.kind !== group.kind || tileKey(savedSet.tile) !== tileKey(group.tile)
      || savedSet.visibility !== visibility.get(group.id)) return hand;
    const members = expandedTiles(savedSet);
    if (members.length !== tileIndexes.length) return hand;
    tileIndexes.forEach((index, memberIndex) => { sourceTiles[index] = members[memberIndex]; });
  }
  (hand.remainingTiles ?? []).forEach((tile, index) => { sourceTiles[remainingSourceIndexes[index]] = tile; });
  if (sourceTiles.some((tile) => tile === undefined)) return hand;

  const remainingIndexToSourceIndex = new Map(remainingSourceIndexes.map((sourceIndex, remainingIndex) => [remainingIndex, sourceIndex]));
  const ungroupedBlankTiles = hand.ungroupedBlankTiles?.map((blank) => {
    if (blank.location !== 'remaining') return blank;
    const tileIndex = remainingIndexToSourceIndex.get(blank.tileIndex);
    return tileIndex === undefined ? blank : { ...blank, tileIndex };
  });
  return {
    ...hand,
    sets: hand.sets.filter(({ id }) => !inferredIds.has(id)),
    remainingTiles: sourceTiles as PlayingTile[],
    ...(ungroupedBlankTiles ? { ungroupedBlankTiles } : {}),
  };
};

/** Selects maximum lawful ordinary coverage, then the lowest exact-runtime score. */
export function resolveHybridNonWinner(state: HybridNonWinnerState): HybridNonWinnerResolution {
  const compiled = getCurrentCompiledRulesRuntime(state.profile);
  if (compiled.grammar !== 'classical-points-doubles') {
    throw new Error(`CLASSICAL_RUNTIME_REQUIRED:${state.profile.id}@${state.profile.version}`);
  }

  const context = { ...state.context, handMode: state.handMode };
  const establishedHand: MahjongHand = {
    sets: [...state.explicitSets],
    ...(state.unresolvedTiles.length ? { remainingTiles: [...state.unresolvedTiles] } : {}),
    bonusTiles: [...state.bonusTiles],
    ...(state.ungroupedBlankTiles?.length ? { ungroupedBlankTiles: [...state.ungroupedBlankTiles] } : {}),
    isWinner: false,
  };
  const establishedScore = compiled.runtime.scoreHand({ evidence: establishedHand, context });
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

  const eligible = interpretation.candidates
    .filter((candidate) => candidate.layout === 'grouped' && candidate.inferredGroups.length > 0
      && candidate.inferredGroups.every(({ kind }) => kind !== 'kong'))
    .map((candidate) => ({ candidate, groupedTileCount: candidateCoverage(candidate) }))
    .filter(({ groupedTileCount }) => groupedTileCount > 0);
  const bestCoverage = eligible.reduce((maximum, candidate) => Math.max(maximum, candidate.groupedTileCount), 0);
  const ranked: Array<HybridNonWinnerSelection & { hand: MahjongHand; scoreResult: HandScoreResult; score: number; visibilityKey: string }> = [];
  for (const { candidate, groupedTileCount } of eligible) {
    if (groupedTileCount !== bestCoverage) continue;
    for (const visibilityByGroupId of candidate.lawfulVisibilityAssignments) {
      const resolvedHand = projectClassicalInterpretation({
        profile: state.profile, explicitSets: state.explicitSets, unresolvedTiles: state.unresolvedTiles,
        bonusTiles: state.bonusTiles, ungroupedBlankTiles: state.ungroupedBlankTiles,
        isWinner: false, context: state.context, handMode: state.handMode,
      }, candidate, visibilityByGroupId);
      const scoreResult = compiled.runtime.scoreHand({ evidence: resolvedHand, context });
      const score = finalScore(scoreResult);
      if (score === undefined) continue;
      ranked.push({ candidate, visibilityByGroupId, groupedTileCount, hand: resolvedHand, scoreResult, score, visibilityKey: visibilityKey(visibilityByGroupId) });
    }
  }

  ranked.sort((left, right) => right.groupedTileCount - left.groupedTileCount
    || left.score - right.score
    || left.candidate.id.localeCompare(right.candidate.id)
    || left.visibilityKey.localeCompare(right.visibilityKey));
  const best = ranked[0];
  if (!best) return { scoreResult: establishedScore, resolvedHand: establishedHand, interpretation };

  const selection: HybridNonWinnerSelection = {
    candidate: best.candidate,
    visibilityByGroupId: best.visibilityByGroupId,
    groupedTileCount: best.groupedTileCount,
  };
  return {
    scoreResult: best.scoreResult,
    resolvedHand: best.hand,
    interpretation,
    selection,
    audit: selectedAudit(best.candidate, best.visibilityByGroupId),
  };
}
