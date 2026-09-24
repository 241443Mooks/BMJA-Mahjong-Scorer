import { compileMcr2006HandScorer } from './mcr-scoring';
import type { McrScoringInput } from './mcr-scoring-input';
import { mcrSettlementImplementation, type McrSettlementInput } from './mcr-strategies';
import { MCR_WINNING_SHAPE_VALIDATION, mcrValidationImplementation } from './mcr-validation';
import { alwaysPassProgressionImplementation, fourRoundAlwaysPassGameEndImplementation, type FourWindAlwaysPassGameEndInput, type FourWindAlwaysPassInput, type FourWindAlwaysPassState } from './four-wind-always-pass-strategies';
import type { ExecutableRegistryIdentity, HandScoreResult, ResolvedProfileArtifact } from './types';

const key = ({ id, semanticRevision }: ExecutableRegistryIdentity) => `${id}@${semanticRevision}`;
const dependency = (artifact: ResolvedProfileArtifact, id: string): ExecutableRegistryIdentity => {
  const found = artifact.executableDependencies.find((item) => item.id === id);
  if (!found) throw new Error(`MCR_RUNTIME_DEPENDENCY_UNAVAILABLE:${id}`);
  return found;
};

export type McrRulesRuntime = {
  artifact: ResolvedProfileArtifact;
  requiredEvidence: () => readonly string[];
  validateHand: (input: McrScoringInput) => ReturnType<ReturnType<typeof mcrValidationImplementation>>;
  scoreHand: (input: McrScoringInput) => Extract<HandScoreResult, { grammar: 'pattern-accumulator' }>;
  settleRound: ReturnType<typeof mcrSettlementImplementation>;
  progressGame: ReturnType<typeof alwaysPassProgressionImplementation>;
  evaluateGameEnd: ReturnType<typeof fourRoundAlwaysPassGameEndImplementation>;
};

export const compileMcrRulesRuntime = (artifact: ResolvedProfileArtifact): McrRulesRuntime => {
  if (artifact.profile.scoring.grammar !== 'pattern-accumulator') {
    throw new Error(`MCR_RUNTIME_GRAMMAR_UNSUPPORTED:${artifact.profile.scoring.grammar}`);
  }
  const validation = artifact.profile.validation.handShapePolicyId;
  if (validation !== MCR_WINNING_SHAPE_VALIDATION.id) throw new Error(`MCR_RUNTIME_VALIDATION_UNSUPPORTED:${validation}`);
  const validationIdentity = dependency(artifact, validation);
  if (key(validationIdentity) !== key(MCR_WINNING_SHAPE_VALIDATION)) throw new Error(`MCR_RUNTIME_VALIDATION_UNSUPPORTED:${key(validationIdentity)}`);
  const settlementIdentity = dependency(artifact, artifact.profile.settlement.id);
  const progressionIdentity = dependency(artifact, artifact.profile.progression.id);
  const gameEndIdentity = dependency(artifact, artifact.profile.gameEnd.id);
  const validate = mcrValidationImplementation(validationIdentity);
  const score = compileMcr2006HandScorer(artifact);
  return {
    artifact,
    requiredEvidence: () => artifact.profile.evidence.alwaysRequired,
    validateHand: validate,
    scoreHand: (input) => score(input) as Extract<HandScoreResult, { grammar: 'pattern-accumulator' }>,
    settleRound: mcrSettlementImplementation(settlementIdentity),
    progressGame: alwaysPassProgressionImplementation(progressionIdentity),
    evaluateGameEnd: fourRoundAlwaysPassGameEndImplementation(gameEndIdentity),
  };
};

export type { McrSettlementInput, FourWindAlwaysPassGameEndInput, FourWindAlwaysPassInput, FourWindAlwaysPassState };
