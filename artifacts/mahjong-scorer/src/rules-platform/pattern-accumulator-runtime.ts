import type {
  ExecutableRegistryIdentity,
  HandScoreResult,
  JsonObject,
  PatternAccumulatorConfigV1,
  ResolvedProfileArtifact,
  ScoreDecisionTraceEntry,
} from './types';

const keyFor = ({ id, semanticRevision }: ExecutableRegistryIdentity) => `${id}@${semanticRevision}`;

/** A deliberately tiny, non-production input contract used only by A0's proof catalogue. */
export type PatternAccumulatorProofInput = {
  structurallyValid: boolean;
  candidates: readonly { id: string; value: number; interpretationId?: string; requiresEvidenceId?: string }[];
  knownEvidenceIds: readonly string[];
  flowerCount: number;
};

type PatternRuntimeIdentityBank = Readonly<{
  catalogue: ExecutableRegistryIdentity;
  interaction: ExecutableRegistryIdentity;
  qualification: ExecutableRegistryIdentity;
  interpretation: ExecutableRegistryIdentity;
  postQualificationBonus?: ExecutableRegistryIdentity;
  conversion?: ExecutableRegistryIdentity;
  evidencePolicy: ExecutableRegistryIdentity;
}>;

const proofIdentities: PatternRuntimeIdentityBank = {
  catalogue: { id: 'catalogue.pattern.a0-proof', semanticRevision: 1 },
  interaction: { id: 'interaction.a0-proof-highest-only', semanticRevision: 1 },
  qualification: { id: 'qualification.a0-proof-eight-before-flowers', semanticRevision: 1 },
  interpretation: { id: 'interpretation.a0-proof-highest-lawful', semanticRevision: 1 },
  postQualificationBonus: { id: 'post-qualification-bonus.a0-proof-flowers', semanticRevision: 1 },
  conversion: { id: 'conversion.a0-proof-identity', semanticRevision: 1 },
  evidencePolicy: { id: 'evidence-policy.a0-proof', semanticRevision: 1 },
};

const identityFor = (artifact: ResolvedProfileArtifact, id: string): ExecutableRegistryIdentity => {
  const found = artifact.executableDependencies.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`HAND_SCORER_DEPENDENCY_UNAVAILABLE:${id}`);
  return found;
};

const exact = (actual: ExecutableRegistryIdentity, expected: ExecutableRegistryIdentity) =>
  actual.id === expected.id && actual.semanticRevision === expected.semanticRevision;

/**
 * Compiles only a hand-scoring grammar.  It intentionally consumes no settlement,
 * progression, game-end, or hand-mode strategy, so unfinished table profiles stay
 * unsealed while their scoring grammar can be exercised independently.
 */
export const compilePatternAccumulatorHandScorer = (artifact: ResolvedProfileArtifact) => {
  if (artifact.profile.scoring.grammar !== 'pattern-accumulator') {
    throw new Error(`HAND_SCORER_GRAMMAR_UNSUPPORTED:${artifact.profile.scoring.grammar}`);
  }
  const config: PatternAccumulatorConfigV1 = artifact.profile.scoring.config;
  const identities: PatternRuntimeIdentityBank = {
    catalogue: identityFor(artifact, config.patternCatalogueId),
    interaction: identityFor(artifact, config.interactionPolicyId),
    qualification: identityFor(artifact, config.qualificationPolicyId),
    interpretation: identityFor(artifact, config.interpretationPolicyId),
    ...(config.postQualificationBonusPolicyId ? { postQualificationBonus: identityFor(artifact, config.postQualificationBonusPolicyId) } : {}),
    ...(config.conversionPolicyId ? { conversion: identityFor(artifact, config.conversionPolicyId) } : {}),
    evidencePolicy: identityFor(artifact, artifact.profile.evidence.policyIds[0] ?? 'evidence-policy.unavailable'),
  };
  if (!Object.entries(proofIdentities).every(([name, expected]) =>
    expected === undefined || exact(identities[name as keyof PatternRuntimeIdentityBank]!, expected))) {
    throw new Error(`PATTERN_ACCUMULATOR_IMPLEMENTATION_UNAVAILABLE:${Object.values(identities).map(keyFor).join('|')}`);
  }

  return (input: PatternAccumulatorProofInput): HandScoreResult => {
    const profile = { id: artifact.profile.identity.id, version: artifact.profile.identity.version };
    const trace: ScoreDecisionTraceEntry[] = [];
    const finish = (disposition: HandScoreResult['disposition'], total: number, details: JsonObject): HandScoreResult => ({
      grammar: 'pattern-accumulator', profile, rulesFingerprint: artifact.rulesFingerprint,
      legal: disposition.kind === 'scored', disposition, explanation: [], decisionTrace: trace,
      matchedCanonicalPatternIds: [], result: { unit: config.unit, total, details },
    });
    if (!input.structurallyValid || !Number.isInteger(input.flowerCount) || input.flowerCount < 0 ||
      input.candidates.some((candidate) => !Number.isFinite(candidate.value) || candidate.value < 0)) {
      return finish({ kind: 'invalid', reasonId: 'pattern-accumulator.a0-proof.invalid-input' }, 0, {});
    }
    const missing = [...new Set(input.candidates.flatMap((candidate) => candidate.requiresEvidenceId && !input.knownEvidenceIds.includes(candidate.requiresEvidenceId) ? [candidate.requiresEvidenceId] : []))].sort();
    trace.push({ id: 'evidence:resolved', kind: 'stage', identities: { policyId: keyFor(identities.evidencePolicy) }, metadata: { knownEvidenceIds: [...input.knownEvidenceIds].sort(), missingEvidenceIds: missing } });
    if (missing.length) return finish({ kind: 'needs-evidence', missingEvidenceIds: missing }, 0, {});
    const byInterpretation = new Map<string, typeof input.candidates>();
    for (const candidate of input.candidates) {
      const id = candidate.interpretationId ?? 'default';
      byInterpretation.set(id, [...(byInterpretation.get(id) ?? []), candidate]);
      trace.push({ id: `candidate:${candidate.id}`, kind: 'candidate', identities: { ruleId: candidate.id, sourceId: keyFor(identities.catalogue) } });
    }
    // Interaction produces lawful alternatives before interpretation maximises.
    const alternatives = [...byInterpretation.entries()].map(([id, candidates]) => {
      const suppressed = candidates.filter((candidate) => candidate.id === 'proof.suppressed');
      const counted = candidates.filter((candidate) => candidate.id !== 'proof.suppressed');
      return { id, counted, suppressed, total: counted.reduce((sum, candidate) => sum + candidate.value, 0) };
    });
    const selected = alternatives.sort((a, b) => b.total - a.total || a.id.localeCompare(b.id))[0] ?? { id: 'default', counted: [], suppressed: [], total: 0 };
    trace.push({ id: 'interpretation:selected', kind: 'select', identities: { policyId: keyFor(identities.interpretation), ruleId: selected.id }, metadata: { total: selected.total } });
    const { counted, suppressed } = selected;
    for (const candidate of suppressed) trace.push({ id: `suppressed:${candidate.id}`, kind: 'suppress', identities: { ruleId: candidate.id, policyId: keyFor(identities.interaction), reasonId: 'interaction.a0-proof.highest-only' } });
    for (const candidate of counted) trace.push({ id: `counted:${candidate.id}`, kind: 'count', identities: { ruleId: candidate.id, sourceId: keyFor(identities.catalogue) }, metadata: { value: candidate.value } });
    const qualifyingSubtotal = counted.reduce((sum, candidate) => sum + candidate.value, 0);
    if (qualifyingSubtotal < 8) return finish({ kind: 'not-qualifying', reasonId: 'qualification.a0-proof.eight-before-flowers' }, 0, { qualifyingSubtotal, postQualificationBonus: 0, selectedInterpretationId: selected.id, countedPatterns: counted.map(({ id, value }) => ({ id, value })), suppressedPatternIds: suppressed.map((candidate) => candidate.id) });
    const bonus = input.flowerCount;
    const total = qualifyingSubtotal + bonus;
    trace.push({ id: 'final:converted', kind: 'final', identities: { policyId: keyFor(identities.conversion!), reasonId: 'pattern-accumulator.a0-proof.scored' }, metadata: { qualifyingSubtotal, postQualificationBonus: bonus, total } });
    return finish({ kind: 'scored' }, total, { qualifyingSubtotal, postQualificationBonus: bonus, selectedInterpretationId: selected.id, countedPatterns: counted.map(({ id, value }) => ({ id, value })), suppressedPatternIds: suppressed.map((candidate) => candidate.id), provenance: { kind: 'non-production-a0-proof', executableDependencies: Object.values(identities).filter(Boolean).map(keyFor) } });
  };
};

/** Grammar dispatch for consumers that require only a hand scorer, never table strategies. */
export const compileHandScorer = (artifact: ResolvedProfileArtifact) => {
  if (artifact.profile.scoring.grammar === 'pattern-accumulator') return compilePatternAccumulatorHandScorer(artifact);
  throw new Error(`HAND_SCORER_GRAMMAR_UNSUPPORTED:${artifact.profile.scoring.grammar}`);
};

export const PATTERN_ACCUMULATOR_A0_PROOF_IDENTITIES = proofIdentities;
