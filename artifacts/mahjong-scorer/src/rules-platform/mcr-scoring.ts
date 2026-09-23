import { detectMcr2006Fans, MCR_2006_EVIDENCE_POLICY_ID, MCR_2006_FAN_BINDINGS, MCR_2006_INPUT_EVIDENCE } from './mcr-detectors';
import { interactMcr2006NonCombination, MCR_2006_INTERACTION_POLICY_ID } from './mcr-interaction';
import type { McrScoringInput } from './mcr-scoring-input';
import { compilePatternAccumulatorHandScorer, type PatternAccumulatorImplementationBank, type PatternAccumulatorInteraction, type PatternAccumulatorStageContracts } from './pattern-accumulator-runtime';
import type { ResolvedProfileArtifact } from './types';
import { categoryForId, type RegistryEntry } from './registry';

/** Canonical executable identities for the bounded MCR scoring closure. */
export const MCR_2006_SCORING_IDENTITIES = {
  catalogue: { id: 'catalogue.pattern.mcr-wmo-2006', semanticRevision: 1 },
  evidencePolicy: { id: MCR_2006_EVIDENCE_POLICY_ID, semanticRevision: 1 },
  interaction: { id: MCR_2006_INTERACTION_POLICY_ID, semanticRevision: 1 },
  interpretation: { id: 'interpretation.max-lawful-profile', semanticRevision: 1 },
  qualification: { id: 'qualification.mcr-8-before-flowers', semanticRevision: 1 },
  postQualificationBonus: { id: 'post-qualification-bonus.mcr-flowers', semanticRevision: 1 },
  conversion: { id: 'conversion.identity', semanticRevision: 1 },
} as const;

export const MCR_2006_SCORING_REGISTRY_ENTRIES: readonly RegistryEntry[] = Object.values(MCR_2006_SCORING_IDENTITIES).map(({ id, semanticRevision }) => ({
  id,
  category: categoryForId(id),
  status: 'executable',
  semanticRevision,
  executableContract: { kind: 'deterministic', dependencies: [] },
}));

const identityKey = (identity: { id: string; semanticRevision: number }) => `${identity.id}@${identity.semanticRevision}`;
const chickenBinding = MCR_2006_FAN_BINDINGS.find(({ id }) => id === 'mcr2006.fan.chicken-hand')!;
const chicken = (branchId: string) => ({ id: `${chickenBinding.id}#${branchId}#fallback`, bindingId: chickenBinding.id, value: chickenBinding.value, interpretationId: branchId, sourceLocator: chickenBinding.sourceLocator });
const subtotal = (items: readonly { value: number }[]) => items.reduce((total, item) => total + item.value, 0);
export const selectMcrHighestLawfulAlternative = (interaction: PatternAccumulatorInteraction) => [...interaction.alternatives]
  .sort((left, right) => subtotal(right.counted) - subtotal(left.counted) || left.id.localeCompare(right.id))[0]?.id;

/** Finalizes each lawful ordinary-interaction branch independently before interpretation. */
export const finalizeMcrZeroFanBranches = (ordinary: PatternAccumulatorInteraction): PatternAccumulatorInteraction => ({
  alternatives: ordinary.alternatives.map((branch) => subtotal(branch.counted) === 0
    ? { ...branch, counted: [...branch.counted, chicken(branch.id)] }
    : branch),
});

const mcrInteraction: PatternAccumulatorStageContracts<McrScoringInput>['interaction'] = (candidates, input) => finalizeMcrZeroFanBranches(interactMcr2006NonCombination(candidates, input));

const mcrBank: PatternAccumulatorImplementationBank<McrScoringInput> = {
  resultProvenance: { kind: 'mcr-2006-scoring' },
  inputEvidence: new Map([[identityKey(MCR_2006_SCORING_IDENTITIES.evidencePolicy), MCR_2006_INPUT_EVIDENCE]]),
  catalogue: new Map([[identityKey(MCR_2006_SCORING_IDENTITIES.catalogue), (input) => detectMcr2006Fans(input).candidates]]),
  interaction: new Map([[identityKey(MCR_2006_SCORING_IDENTITIES.interaction), mcrInteraction]]),
  interpretation: new Map([[identityKey(MCR_2006_SCORING_IDENTITIES.interpretation), selectMcrHighestLawfulAlternative]]),
  qualification: new Map([[identityKey(MCR_2006_SCORING_IDENTITIES.qualification), (value) => value >= 8 ? undefined : 'qualification.mcr-8-before-flowers']]),
  postQualificationBonus: new Map([[identityKey(MCR_2006_SCORING_IDENTITIES.postQualificationBonus), (input) => input.evidence.flowerCount]]),
  conversion: new Map([[identityKey(MCR_2006_SCORING_IDENTITIES.conversion), (value) => value]]),
};

/** Explicit opt-in compiler; resolving an MCR root profile does not activate this scorer. */
export const compileMcr2006HandScorer = (artifact: ResolvedProfileArtifact) => compilePatternAccumulatorHandScorer(artifact, mcrBank);
