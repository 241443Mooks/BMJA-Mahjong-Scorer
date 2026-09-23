import { RegistryBank, type RegistryEntry } from './registry';
import { resolveMcrWinningInterpretations } from './mcr-detectors';
import { validateMcrScoringInput, type McrInputValidation, type McrScoringInput } from './mcr-scoring-input';

export const MCR_WINNING_SHAPE_VALIDATION = { id: 'validation.mcr-winning-shape', semanticRevision: 1 } as const;
const deterministic = { kind: 'deterministic', dependencies: [] } as const;
export const mcrValidationRegistryEntries: readonly RegistryEntry[] = [
  { ...MCR_WINNING_SHAPE_VALIDATION, category: 'validation', status: 'executable', executableContract: deterministic },
];
export const mcrValidationRegistry = new RegistryBank(mcrValidationRegistryEntries);

/** Structural adapter over A1 physical-input and lawful-interpretation truth. */
export const validateMcrWinningShape = (input: McrScoringInput): McrInputValidation => {
  const physical = validateMcrScoringInput(input);
  if (!physical.valid) return physical;
  return resolveMcrWinningInterpretations(input).length > 0
    ? { valid: true }
    : { valid: false, reasonId: 'validation.mcr-winning-shape.no-lawful-winning-interpretation' };
};
