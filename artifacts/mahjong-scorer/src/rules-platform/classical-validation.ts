import {
  bmjaSpecialHandBindings,
  validateHand,
  type GameContext,
  type MahjongHand,
  type SpecialHandPatternBinding,
} from '../scoring';
import { RegistryBank, type RegistryEntry } from './registry';
import type {
  ExecutableRegistryIdentity,
  HandEvaluationInput,
  RulesFamilyDefinition,
} from './types';

const deterministic = { kind: 'deterministic', dependencies: [] } as const;

/** The legacy BMJA validator's exact current-runtime contract. */
export const CLASSICAL_CURRENT_VALIDATION: ValidationRegistryIdentity = {
  id: 'validation.classical-current',
  semanticRevision: 1,
};

export type ValidationRegistryIdentity =
  ExecutableRegistryIdentity & { id: `validation.${string}` };

export const classicalValidationRegistryEntries: readonly RegistryEntry[] = [
  {
    id: CLASSICAL_CURRENT_VALIDATION.id,
    category: 'validation',
    status: 'executable',
    semanticRevision: CLASSICAL_CURRENT_VALIDATION.semanticRevision,
    executableContract: deterministic,
  },
];

export const classicalValidationRegistry = new RegistryBank(
  classicalValidationRegistryEntries,
);

export const CLASSICAL_WESTERN_VALIDATION_FAMILY: RulesFamilyDefinition = {
  id: 'family.classical-western',
  allowedGrammars: ['classical-points-doubles'],
  handEvidenceCodecId: 'classical.hand.v1',
  roundOutcomeCodecId: 'classical.round.v1',
  strategyStateCodecId: 'classical.strategy.v1',
};

export type ClassicalValidationInput = {
  family: RulesFamilyDefinition;
  evidenceCodecId: string;
  input: HandEvaluationInput<MahjongHand, GameContext>;
};

type ClassicalValidationImplementation = (
  input: HandEvaluationInput<MahjongHand, GameContext>,
  specialHandBindings: readonly SpecialHandPatternBinding[],
) => string[];

type ClassicalValidationConfiguration = {
  familyId: string;
  evidenceCodecId: string;
  specialHandBindings: readonly SpecialHandPatternBinding[];
};

const currentClassicalConfiguration: ClassicalValidationConfiguration = {
  familyId: CLASSICAL_WESTERN_VALIDATION_FAMILY.id,
  evidenceCodecId: CLASSICAL_WESTERN_VALIDATION_FAMILY.handEvidenceCodecId,
  specialHandBindings: bmjaSpecialHandBindings,
};

const validateCurrentClassical: ClassicalValidationImplementation = (
  { evidence, context },
  specialHandBindings,
) => validateHand(evidence, context, [...specialHandBindings]);

const keyFor = ({ id, semanticRevision }: ExecutableRegistryIdentity) =>
  `${id}@${semanticRevision}`;

const implementations = new Map<string, {
  configuration: ClassicalValidationConfiguration;
  validate: ClassicalValidationImplementation;
}>([
  [keyFor(CLASSICAL_CURRENT_VALIDATION), {
    configuration: currentClassicalConfiguration,
    validate: validateCurrentClassical,
  }],
]);

/**
 * Invokes only the exact current Classical validation contract. Evidence stays
 * as MahjongHand while GameContext remains a separate trusted input.
 */
export const validateCurrentClassicalHand = (
  identity: ValidationRegistryIdentity,
  { family, evidenceCodecId, input }: ClassicalValidationInput,
): string[] => {
  classicalValidationRegistry.requireExecutable('validation', identity.id);
  const implementation = implementations.get(keyFor(identity));
  if (!implementation) {
    throw new Error(`Unknown current validation implementation: ${keyFor(identity)}`);
  }
  const { configuration } = implementation;
  if (family.id !== configuration.familyId ||
      !family.allowedGrammars.includes('classical-points-doubles')) {
    throw new Error(`Validation family is incompatible: ${family.id}`);
  }
  if (family.handEvidenceCodecId !== configuration.evidenceCodecId ||
      evidenceCodecId !== configuration.evidenceCodecId) {
    throw new Error(`Validation evidence codec is incompatible: ${evidenceCodecId}`);
  }
  return implementation.validate(input, configuration.specialHandBindings);
};
