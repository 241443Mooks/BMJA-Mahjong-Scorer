import { scoreHand, type GameContext, type MahjongHand, type ScoreBreakdown } from '../scoring';
import { bmjaSpecialHandBindings } from '../scoring/special-hands';
import {
  CLASSICAL_EAST_CYCLE_GAME_END,
  CLASSICAL_EAST_CYCLE_PROGRESSION,
  CLASSICAL_PAIRWISE_SETTLEMENT,
  gameEndImplementation,
  handModeImplementation,
  NO_HAND_MODE,
  progressionImplementation,
  settlementImplementation,
} from './classical-strategies';
import {
  CLASSICAL_CURRENT_VALIDATION,
  CLASSICAL_WESTERN_VALIDATION_FAMILY,
  validateCurrentClassicalHand,
} from './classical-validation';
import type {
  ClassicalGameEndInput,
} from './classical-strategies';
import type {
  ExecutableRegistryIdentity,
  HandEvaluationInput,
  HandScoreResult,
  JsonObject,
  ResolvedProfileArtifact,
  ScoreDecisionTraceEntry,
} from './types';

const BMJA_PROFILE = { id: 'bmja', version: '1.0' } as const;
const keyFor = ({ id, semanticRevision }: ExecutableRegistryIdentity) =>
  `${id}@${semanticRevision}`;

type ClassicalScoringImplementation = (
  input: HandEvaluationInput<MahjongHand, GameContext>,
) => ScoreBreakdown;

const currentBmjaScoring: ClassicalScoringImplementation = ({ evidence, context }) =>
  scoreHand(evidence, context, bmjaSpecialHandBindings);

/** Exact bank entries, not inferred aliases: Run 1 deliberately contains BMJA only. */
const scoringImplementations = new Map<string, ClassicalScoringImplementation>([
  ['classical.scorer.current@1|classical.bindings.bmja-current@1|classical.policy.bmja-current@1', currentBmjaScoring],
]);

const requireDependency = (
  artifact: ResolvedProfileArtifact,
  identity: ExecutableRegistryIdentity,
): ExecutableRegistryIdentity => {
  const found = artifact.executableDependencies.find(({ id }) => id === identity.id);
  if (!found) throw new Error(`RUNTIME_DEPENDENCY_UNAVAILABLE:${keyFor(identity)}`);
  if (found.semanticRevision !== identity.semanticRevision) {
    throw new Error(`RUNTIME_DEPENDENCY_REVISION_MISMATCH:${keyFor(identity)}`);
  }
  return found;
};

const classicalConfig = (artifact: ResolvedProfileArtifact) => {
  if (artifact.profile.scoring.grammar !== 'classical-points-doubles') {
    throw new Error(`RUNTIME_GRAMMAR_UNSUPPORTED:${artifact.profile.scoring.grammar}`);
  }
  const { config } = artifact.profile.scoring;
  if (config.configVersion !== 1 || typeof config.scorerId !== 'string' ||
    typeof config.bindingId !== 'string' || typeof config.policyId !== 'string') {
    throw new Error('RUNTIME_CLASSICAL_CONFIG_INVALID');
  }
  return {
    scorer: requireDependency(artifact, { id: config.scorerId, semanticRevision: 1 }),
    binding: requireDependency(artifact, { id: config.bindingId, semanticRevision: 1 }),
    policy: requireDependency(artifact, { id: config.policyId, semanticRevision: 1 }),
  };
};

const auditMetadata = (artifact: ResolvedProfileArtifact): JsonObject => ({
  profileId: artifact.profile.identity.id,
  profileVersion: artifact.profile.identity.version,
  rulesFingerprint: artifact.rulesFingerprint,
  executableDependencies: artifact.executableDependencies.map(keyFor),
});

const traceFor = (
  artifact: ResolvedProfileArtifact,
  breakdown: ScoreBreakdown,
  scorer: ExecutableRegistryIdentity,
  binding: ExecutableRegistryIdentity,
  policy: ExecutableRegistryIdentity,
): readonly ScoreDecisionTraceEntry[] => [
  {
    id: 'classical-runtime.validation',
    kind: 'stage',
    identities: {
      policyId: keyFor(CLASSICAL_CURRENT_VALIDATION),
      reasonId: breakdown.valid ? 'validation.classical-current.complete' : 'validation.classical-current.invalid',
    },
    metadata: auditMetadata(artifact),
  },
  {
    id: 'classical-runtime.scoring',
    kind: 'stage',
    identities: { ruleId: keyFor(scorer), bindingId: keyFor(binding), policyId: keyFor(policy) },
  },
  ...breakdown.pointRules.map((rule) => ({
    id: `point:${rule.id}`,
    kind: 'count' as const,
    identities: { ruleId: rule.id },
  })),
  ...breakdown.doubleRules.map((rule) => ({
    id: `double:${rule.id}`,
    kind: 'count' as const,
    identities: { ruleId: rule.id },
  })),
  ...breakdown.specialHands.filter(({ matched }) => matched).map((hand) => ({
    id: `special:${hand.id}`,
    kind: 'count' as const,
    identities: { bindingId: hand.id },
  })),
  ...breakdown.calculationComponents.map((component) => ({
    id: `calculation:${component.id}`,
    kind: 'count' as const,
    identities: { ruleId: component.id },
  })),
  {
    id: 'classical-runtime.final',
    kind: 'final',
    identities: {
      ruleId: keyFor(scorer),
      bindingId: keyFor(binding),
      policyId: keyFor(policy),
      reasonId: breakdown.valid ? 'classical-runtime.scored' : 'classical-runtime.invalid',
    },
    metadata: { finalScore: breakdown.finalScore },
  },
];

export type RulesRuntime = Readonly<{
  artifact: ResolvedProfileArtifact;
  validateHand(input: HandEvaluationInput<MahjongHand, GameContext>): readonly string[];
  scoreHand(input: HandEvaluationInput<MahjongHand, GameContext>): HandScoreResult;
  settleRound: ReturnType<typeof settlementImplementation>;
  progressGame: ReturnType<typeof progressionImplementation>;
  evaluateGameEnd: ReturnType<typeof gameEndImplementation>;
  nextHandMode: ReturnType<typeof handModeImplementation>;
}>;

/** Compiles only the Run-0 sealed BMJA artifact into exact current implementations. */
export const compileBmjaRuntime = (artifact: ResolvedProfileArtifact): RulesRuntime => {
  if (artifact.profile.identity.id !== BMJA_PROFILE.id || artifact.profile.identity.version !== BMJA_PROFILE.version) {
    throw new Error(`RUNTIME_PROFILE_UNSUPPORTED:${artifact.profile.identity.id}@${artifact.profile.identity.version}`);
  }
  requireDependency(artifact, CLASSICAL_CURRENT_VALIDATION);
  requireDependency(artifact, CLASSICAL_PAIRWISE_SETTLEMENT);
  requireDependency(artifact, CLASSICAL_EAST_CYCLE_PROGRESSION);
  requireDependency(artifact, CLASSICAL_EAST_CYCLE_GAME_END);
  requireDependency(artifact, NO_HAND_MODE);
  const { scorer, binding, policy } = classicalConfig(artifact);
  const scoring = scoringImplementations.get(`${keyFor(scorer)}|${keyFor(binding)}|${keyFor(policy)}`);
  if (!scoring) throw new Error(`RUNTIME_SCORING_IMPLEMENTATION_UNAVAILABLE:${keyFor(scorer)}|${keyFor(binding)}|${keyFor(policy)}`);

  const validate = (input: HandEvaluationInput<MahjongHand, GameContext>) => validateCurrentClassicalHand(
    CLASSICAL_CURRENT_VALIDATION,
    {
      family: CLASSICAL_WESTERN_VALIDATION_FAMILY,
      evidenceCodecId: CLASSICAL_WESTERN_VALIDATION_FAMILY.handEvidenceCodecId,
      profile: BMJA_PROFILE,
      input,
    },
  );

  return Object.freeze({
    artifact,
    validateHand: validate,
    scoreHand(input: HandEvaluationInput<MahjongHand, GameContext>): HandScoreResult {
      const validationErrors = validate(input);
      const breakdown = scoring(input);
      const disposition = validationErrors.length === 0
        ? { kind: 'scored' as const }
        : { kind: 'invalid' as const, reasonId: 'validation.classical-current.invalid' };
      return {
        grammar: 'classical-points-doubles',
        profile: BMJA_PROFILE,
        rulesFingerprint: artifact.rulesFingerprint,
        legal: disposition.kind === 'scored',
        disposition,
        explanation: breakdown.validationErrors.map((id) => ({ id })),
        decisionTrace: traceFor(artifact, breakdown, scorer, binding, policy),
        matchedCanonicalPatternIds: breakdown.specialHands.filter(({ matched }) => matched).map(({ id }) => id).sort(),
        result: { breakdown } as unknown as JsonObject,
      };
    },
    settleRound: settlementImplementation(CLASSICAL_PAIRWISE_SETTLEMENT),
    progressGame: progressionImplementation(CLASSICAL_EAST_CYCLE_PROGRESSION),
    evaluateGameEnd: gameEndImplementation(CLASSICAL_EAST_CYCLE_GAME_END),
    nextHandMode: handModeImplementation(NO_HAND_MODE),
  });
};

export type { ClassicalGameEndInput };
