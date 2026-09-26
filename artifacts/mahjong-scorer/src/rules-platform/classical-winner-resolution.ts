import type { GameContext, MahjongHand, Visibility } from '../scoring/types';
import type { RulesProfileRef } from '../game/types';
import { interpretClassicalHand, projectClassicalInterpretation, type ClassicalInterpretationCandidate, type ClassicalInterpretationInput } from './classical-interpretation';
import { getCurrentCompiledRulesRuntime } from './current-runtime-registry';
import type { HandScoreResult } from './types';

export type ClassicalWinnerEvidence = Pick<MahjongHand,
  'winningMethod' | 'winningTileProvenance' | 'winningEventEvidence' | 'originalCall' | 'classicalEvidence'>;
export type ClassicalWinnerVisibilityResolution = { groupId: string; value: Visibility };
export type ClassicalWinnerFactResolution = {
  type: 'group-visibility'; groupId: string; value: Visibility; origin: 'default' | 'confirmed';
};
export type ClassicalWinnerProvenance = {
  schemaVersion: 1;
  profile: RulesProfileRef;
  candidateId: string;
  explicitSetIds: readonly string[];
  inferredGroups: ClassicalInterpretationCandidate['inferredGroups'];
  factResolutions: readonly ClassicalWinnerFactResolution[];
};

export type ClassicalWinnerResolution =
  | { kind: 'no-lawful-candidate'; profile: RulesProfileRef; rejected: ReturnType<typeof interpretClassicalHand>['rejected'] }
  | { kind: 'candidate-choice-required'; candidates: readonly ClassicalInterpretationCandidate[] }
  | { kind: 'candidate-not-found'; candidateId: string }
  | { kind: 'facts-required'; candidate: ClassicalInterpretationCandidate; unresolvedFacts: readonly { type: 'group-visibility'; groupId: string; choices: readonly Visibility[] }[] }
  | { kind: 'runtime-rejected'; hand: MahjongHand; scoreResult: HandScoreResult }
  | { kind: 'ready'; hand: MahjongHand; scoreResult: HandScoreResult; provenance: ClassicalWinnerProvenance };

const scoreValue = (result: HandScoreResult): number | undefined => {
  if (result.grammar !== 'classical-points-doubles' || !result.legal) return undefined;
  const breakdown = result.result.breakdown;
  if (!breakdown || typeof breakdown !== 'object' || Array.isArray(breakdown)) return undefined;
  const value = breakdown.finalScore;
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
};

/** Resolve one complete Classical winner through B and the exact selected compiled runtime. */
export const resolveClassicalWinner = (
  input: ClassicalInterpretationInput,
  options: {
    candidateId?: string;
    visibility?: readonly ClassicalWinnerVisibilityResolution[];
    evidence?: ClassicalWinnerEvidence;
  } = {},
): ClassicalWinnerResolution => {
  if (!input.isWinner) throw new Error('CLASSICAL_WINNER_RESOLUTION_REQUIRES_WINNER');
  const interpreted = interpretClassicalHand(input);
  if (interpreted.candidates.length === 0) return { kind: 'no-lawful-candidate', profile: interpreted.profile, rejected: interpreted.rejected };
  if (!options.candidateId && interpreted.candidates.length > 1) return { kind: 'candidate-choice-required', candidates: interpreted.candidates };
  const candidate = options.candidateId
    ? interpreted.candidates.find(({ id }) => id === options.candidateId)
    : interpreted.candidates[0];
  if (!candidate) return { kind: 'candidate-not-found', candidateId: options.candidateId! };

  const compiled = getCurrentCompiledRulesRuntime(input.profile);
  if (compiled.grammar !== 'classical-points-doubles') throw new Error('CLASSICAL_WINNER_RUNTIME_REQUIRED');
  const supplied = new Map<string, Visibility>();
  for (const resolution of options.visibility ?? []) {
    const fact = candidate.unresolvedFacts.find(({ groupId }) => groupId === resolution.groupId);
    if (!fact || !fact.choices.includes(resolution.value) || supplied.has(resolution.groupId)) {
      throw new Error(`CLASSICAL_WINNER_INVALID_VISIBILITY_RESOLUTION:${resolution.groupId}`);
    }
    supplied.set(resolution.groupId, resolution.value);
  }

  const defaults = new Map<string, Visibility>();
  const unresolvedFacts = () => candidate.unresolvedFacts.filter(({ groupId }) => !supplied.has(groupId) && !defaults.has(groupId));
  // Only default an inferred Kong to exposed when every other visibility fact is fixed.
  for (const group of candidate.inferredGroups.filter(({ kind }) => kind === 'kong')) {
    if (supplied.has(group.id) || defaults.has(group.id)) continue;
    if (unresolvedFacts().some(({ groupId }) => groupId !== group.id)) continue;
    const fact = candidate.unresolvedFacts.find(({ groupId }) => groupId === group.id);
    if (!fact?.choices.includes('exposed') || !fact.choices.includes('concealed')) continue;
    const base = Object.fromEntries([...supplied, ...defaults]);
    const exposedHand = projectClassicalInterpretation(input, candidate, { ...base, [group.id]: 'exposed' });
    const concealedHand = projectClassicalInterpretation(input, candidate, { ...base, [group.id]: 'concealed' });
    const context: GameContext = input.context;
    const exposed = scoreValue(compiled.runtime.scoreHand({ evidence: exposedHand, context }));
    const concealed = scoreValue(compiled.runtime.scoreHand({ evidence: concealedHand, context }));
    if (exposed !== undefined && concealed !== undefined && exposed <= concealed) defaults.set(group.id, 'exposed');
  }

  const stillUnresolved = unresolvedFacts();
  if (stillUnresolved.length) return { kind: 'facts-required', candidate, unresolvedFacts: stillUnresolved };
  const visibility = Object.fromEntries([...supplied, ...defaults]);
  const lawfulAssignment = candidate.lawfulVisibilityAssignments.some((assignment) =>
    candidate.unresolvedFacts.every(({ groupId }) => assignment[groupId] === visibility[groupId]) &&
    Object.keys(assignment).length === candidate.unresolvedFacts.length,
  );
  if (!lawfulAssignment) throw new Error('CLASSICAL_WINNER_UNLAWFUL_VISIBILITY_ASSIGNMENT');
  let hand = projectClassicalInterpretation(input, candidate, visibility);
  if (hand.remainingTiles?.length || (candidate.layout === 'grouped' && candidate.unresolvedTileIndexes.length > 0)) {
    throw new Error('CLASSICAL_WINNER_PROJECTION_HAS_UNCONSUMED_TILES');
  }
  hand = { ...hand, ...(options.evidence ?? {}) };
  const validationErrors = compiled.runtime.validateHand({ evidence: hand, context: input.context });
  const scoreResult = compiled.runtime.scoreHand({ evidence: hand, context: input.context });
  if (validationErrors.length || !scoreResult.legal) return { kind: 'runtime-rejected', hand, scoreResult };
  const factResolutions: ClassicalWinnerFactResolution[] = candidate.unresolvedFacts.map(({ groupId }) => ({
    type: 'group-visibility', groupId, value: visibility[groupId]!, origin: defaults.has(groupId) ? 'default' : 'confirmed',
  }));
  return {
    kind: 'ready', hand, scoreResult,
    provenance: {
      schemaVersion: 1, profile: { ...candidate.profile }, candidateId: candidate.id,
      explicitSetIds: candidate.explicitSets.map(({ id }) => id), inferredGroups: candidate.inferredGroups, factResolutions,
    },
  };
};
