import {
  validateHand,
  type GameContext,
  type MahjongHand,
  type SpecialHandPatternBinding,
} from '../scoring';
import {
  OUTSIDE_THE_BOX_PROFILE_REF,
  outsideTheBoxSpecialHandBindings,
} from '../game/outside-the-box-catalogue';
import {
  WESTERN_TM_PROFILE_REF,
  westernTmSpecialHandBindings,
} from '../game/western-tm-catalogue';
import { BUZZARD_2000_PROFILE_REF, buzzard2000SpecialHandBindings } from '../game/buzzard-2000';
import type { RulesProfileRef } from '../game/types';
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
  semanticRevision: 2,
};
export const BUZZARD_CLASSICAL_VALIDATION: ValidationRegistryIdentity = { id: 'validation.classical-buzzard', semanticRevision: 1 };

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
  { id: BUZZARD_CLASSICAL_VALIDATION.id, category: 'validation', status: 'executable', semanticRevision: 1, executableContract: deterministic },
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

export const BMJA_CLASSICAL_VALIDATION_PROFILE: RulesProfileRef = {
  id: 'bmja', version: '1.0',
};

export type ClassicalValidationInput = {
  family: RulesFamilyDefinition;
  evidenceCodecId: string;
  profile: RulesProfileRef;
  input: HandEvaluationInput<MahjongHand, GameContext>;
};

type ClassicalValidationImplementation = (
  input: HandEvaluationInput<MahjongHand, GameContext>,
  specialHandBindings?: readonly SpecialHandPatternBinding[],
) => string[];

type ClassicalValidationConfiguration = {
  familyId: string;
  evidenceCodecId: string;
  profiles: ReadonlyMap<string, readonly SpecialHandPatternBinding[] | undefined>;
};

const profileKey = ({ id, version }: RulesProfileRef) => `${id}@${version}`;

const currentClassicalConfiguration: ClassicalValidationConfiguration = {
  familyId: CLASSICAL_WESTERN_VALIDATION_FAMILY.id,
  evidenceCodecId: CLASSICAL_WESTERN_VALIDATION_FAMILY.handEvidenceCodecId,
  profiles: new Map([
    // The current BMJA validator's omitted-binding default includes its full
    // legacy fishing catalogue; explicit bindings intentionally do not.
    [profileKey(BMJA_CLASSICAL_VALIDATION_PROFILE), undefined],
    [profileKey(WESTERN_TM_PROFILE_REF), westernTmSpecialHandBindings],
    [profileKey(OUTSIDE_THE_BOX_PROFILE_REF), outsideTheBoxSpecialHandBindings],
    [profileKey(BUZZARD_2000_PROFILE_REF), buzzard2000SpecialHandBindings],
  ]),
};

const validateCurrentClassical: ClassicalValidationImplementation = (
  { evidence, context },
  specialHandBindings,
) => validateHand(evidence, context, specialHandBindings && [...specialHandBindings]);

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
  [keyFor(BUZZARD_CLASSICAL_VALIDATION), { configuration: currentClassicalConfiguration, validate: validateCurrentClassical }],
]);

/** Resolves the exact current implementation before any validation input runs. */
export const currentClassicalValidationImplementation = (
  identity: ValidationRegistryIdentity,
) => {
  classicalValidationRegistry.requireExecutable('validation', identity.id);
  const implementation = implementations.get(keyFor(identity));
  if (!implementation) {
    throw new Error(`Unknown current validation implementation: ${keyFor(identity)}`);
  }
  return implementation;
};

/**
 * Invokes only the exact current Classical validation contract. Evidence stays
 * as MahjongHand while GameContext remains a separate trusted input.
 */
export const validateCurrentClassicalHand = (
  identity: ValidationRegistryIdentity,
  { family, evidenceCodecId, profile, input }: ClassicalValidationInput,
): string[] => {
  const implementation = currentClassicalValidationImplementation(identity);
  const { configuration } = implementation;
  if (family.id !== configuration.familyId ||
      !family.allowedGrammars.includes('classical-points-doubles')) {
    throw new Error(`Validation family is incompatible: ${family.id}`);
  }
  if (family.handEvidenceCodecId !== configuration.evidenceCodecId ||
      evidenceCodecId !== configuration.evidenceCodecId) {
    throw new Error(`Validation evidence codec is incompatible: ${evidenceCodecId}`);
  }
  const key = profileKey(profile);
  if (!configuration.profiles.has(key)) {
    throw new Error(`Validation profile is unavailable: ${profileKey(profile)}`);
  }
  const errors = implementation.validate(input, configuration.profiles.get(key));
  return identity.id === BUZZARD_CLASSICAL_VALIDATION.id
    ? errors.filter((error) => error !== 'A normal BMJA hand may contain at most one chow.')
    : errors;
};
