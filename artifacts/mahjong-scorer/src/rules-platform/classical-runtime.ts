import { scoreHand, type GameContext, type MahjongHand, type ScoreBreakdown } from '../scoring';
import { bmjaSpecialHandBindings } from '../scoring/special-hands';
import {
  gameEndImplementation,
  handModeImplementation,
  progressionImplementation,
  settlementImplementation,
} from './classical-strategies';
import {
  CLASSICAL_WESTERN_VALIDATION_FAMILY,
  currentClassicalValidationImplementation,
  type ValidationRegistryIdentity,
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
import { jsonValueSchema } from './schemas';

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

const selectedIdentity = (
  artifact: ResolvedProfileArtifact,
  id: string,
): ExecutableRegistryIdentity => {
  const found = artifact.executableDependencies.find((dependency) => dependency.id === id);
  if (!found) throw new Error(`RUNTIME_DEPENDENCY_UNAVAILABLE:${id}`);
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
    scorer: selectedIdentity(artifact, config.scorerId),
    binding: selectedIdentity(artifact, config.bindingId),
    policy: selectedIdentity(artifact, config.policyId),
  };
};

const normalizeJson = (value: unknown): JsonObject | import('./types').JsonValue => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('RUNTIME_RESULT_NON_FINITE_NUMBER');
    return value;
  }
  if (Array.isArray(value)) return value.map(normalizeJson);
  if (!value || typeof value !== 'object' ||
    (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) {
    throw new Error('RUNTIME_RESULT_UNSUPPORTED_VALUE');
  }
  return Object.fromEntries(Object.entries(value)
    .filter(([, nested]) => nested !== undefined)
    .map(([key, nested]) => [key, normalizeJson(nested)]));
};

const isJsonObject = (value: unknown): value is JsonObject =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** Preserves every current breakdown field while making omission/rejection explicit. */
const jsonSafeBreakdown = (breakdown: ScoreBreakdown): JsonObject => {
  const value = jsonValueSchema.parse(normalizeJson({ breakdown }));
  if (!isJsonObject(value)) throw new Error('RUNTIME_RESULT_NOT_OBJECT');
  return value;
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
  disposition: HandScoreResult['disposition'],
  validation: ExecutableRegistryIdentity,
  scorer: ExecutableRegistryIdentity,
  binding: ExecutableRegistryIdentity,
  policy: ExecutableRegistryIdentity,
): readonly ScoreDecisionTraceEntry[] => [
  {
    id: 'classical-runtime.validation',
    kind: 'stage',
    identities: {
      policyId: keyFor(validation),
      reasonId: disposition.kind === 'invalid' ? disposition.reasonId : 'validation.classical-current.complete',
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
      reasonId: disposition.kind === 'invalid' ? 'classical-runtime.invalid' : 'classical-runtime.scored',
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
  const validation = selectedIdentity(artifact, artifact.profile.validation.handShapePolicyId);
  const settlement = selectedIdentity(artifact, artifact.profile.settlement.id);
  const progression = selectedIdentity(artifact, artifact.profile.progression.id);
  const gameEnd = selectedIdentity(artifact, artifact.profile.gameEnd.id);
  if (!artifact.profile.handMode) throw new Error('RUNTIME_HAND_MODE_UNAVAILABLE');
  const handMode = selectedIdentity(artifact, artifact.profile.handMode.id);
  currentClassicalValidationImplementation(validation as ValidationRegistryIdentity);
  const { scorer, binding, policy } = classicalConfig(artifact);
  const scoring = scoringImplementations.get(`${keyFor(scorer)}|${keyFor(binding)}|${keyFor(policy)}`);
  if (!scoring) throw new Error(`RUNTIME_SCORING_IMPLEMENTATION_UNAVAILABLE:${keyFor(scorer)}|${keyFor(binding)}|${keyFor(policy)}`);

  const validate = (input: HandEvaluationInput<MahjongHand, GameContext>) => validateCurrentClassicalHand(
    validation as ValidationRegistryIdentity,
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
      const valid = validationErrors.length === 0;
      if (breakdown.valid !== valid ||
        JSON.stringify(breakdown.validationErrors) !== JSON.stringify(validationErrors)) {
        throw new Error('RUNTIME_VALIDATION_DISAGREEMENT');
      }
      const disposition = validationErrors.length === 0
        ? { kind: 'scored' as const }
        : { kind: 'invalid' as const, reasonId: 'validation.classical-current.invalid' };
      return {
        grammar: 'classical-points-doubles',
        profile: BMJA_PROFILE,
        rulesFingerprint: artifact.rulesFingerprint,
        legal: disposition.kind === 'scored',
        disposition,
        explanation: validationErrors.map((id) => ({ id })),
        decisionTrace: traceFor(artifact, breakdown, disposition, validation, scorer, binding, policy),
        matchedCanonicalPatternIds: breakdown.specialHands.filter(({ matched }) => matched).map(({ id }) => id).sort(),
        result: jsonSafeBreakdown(breakdown),
      };
    },
    settleRound: settlementImplementation(settlement as Parameters<typeof settlementImplementation>[0]),
    progressGame: progressionImplementation(progression as Parameters<typeof progressionImplementation>[0]),
    evaluateGameEnd: gameEndImplementation(gameEnd as Parameters<typeof gameEndImplementation>[0]),
    nextHandMode: handModeImplementation(handMode as Parameters<typeof handModeImplementation>[0]),
  });
};

export type { ClassicalGameEndInput };
