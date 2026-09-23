import { currentPlayableRegistryEntries } from './current-profiles';
import { mcrStrategyRegistryEntries } from './mcr-strategies';
import { fourWindAlwaysPassStrategyRegistryEntries } from './four-wind-always-pass-strategies';
import { mcrValidationRegistryEntries } from './mcr-validation';
import { RegistryBank, type RegistryEntry } from './registry';
import type { ResolverEnvironment } from './resolver';
import type { ProfileAuthoringDefinition, RulesFamilyDefinition, SeatModelDefinition } from './types';

const deterministic = { kind: 'deterministic', dependencies: [] } as const;
const executable = (id: string, category: RegistryEntry['category']): RegistryEntry => ({
  id, category, status: 'executable', semanticRevision: 1, executableContract: deterministic,
});

export const MCR_FAMILY: RulesFamilyDefinition = {
  id: 'family.mcr',
  allowedGrammars: ['pattern-accumulator'],
  handEvidenceCodecId: 'mcr.hand-evidence.v1',
  roundOutcomeCodecId: 'mcr.round-outcome.v1',
  strategyStateCodecId: 'mcr.strategy-state.v1',
  allowedTileSetIds: ['tiles.flowers-144'],
  allowedSeatModelIds: ['seats.winds-4'],
};

export const MCR_WMO_2006_PROFILE: ProfileAuthoringDefinition = {
  kind: 'root', schemaVersion: 1,
  identity: { id: 'mcr-wmo-2006', version: '0.1', name: 'Mahjong Competition Rules — WMO 2006', status: 'provisional' },
  definition: {
    familyId: 'family.mcr',
    grammar: 'pattern-accumulator',
    table: { playerCount: 4, seatModelId: 'seats.winds-4' },
    tileSet: { presetId: 'tiles.flowers-144', options: {} },
    handShape: { presetId: 'shape.four-sets-pair', options: {} },
    validation: { handShapePolicyId: 'validation.mcr-winning-shape', policyIds: [] },
    scoring: { grammar: 'pattern-accumulator', config: {
      configVersion: 1, unit: 'points', patternCatalogueId: 'catalogue.pattern.mcr-wmo-2006',
      interactionPolicyId: 'interaction.mcr-2006-non-combination', qualificationPolicyId: 'qualification.mcr-8-before-flowers',
      interpretationPolicyId: 'interpretation.max-lawful-profile', postQualificationBonusPolicyId: 'post-qualification-bonus.mcr-flowers',
      conversionPolicyId: 'conversion.identity',
    } },
    evidence: { policyIds: ['evidence-policy.mcr-wmo-2006'], alwaysRequired: ['evidence.winning-method', 'evidence.resolved-win-event'] },
    settlement: { id: 'settlement.mcr-2006', params: {} },
    progression: { id: 'progression.always-pass', params: {} },
    gameEnd: { id: 'game-end.four-round-always-pass', params: {} },
    provenance: { sources: ['source.mcr-ema-green-book-2006'] },
  },
};

const mcrExecutableEntries: readonly RegistryEntry[] = [
  executable('family.mcr', 'family'),
  executable('evidence.winning-method', 'evidence'),
  executable('evidence.resolved-win-event', 'evidence'),
  executable('evidence.last-visible-copy', 'evidence'),
  executable('evidence.flower-count', 'evidence'),
];
const mcrOwnedIds = new Set([
  ...mcrExecutableEntries,
  ...mcrValidationRegistryEntries,
  ...mcrStrategyRegistryEntries,
  ...fourWindAlwaysPassStrategyRegistryEntries,
].map(({ id }) => id));
const registryEntries = [
  ...currentPlayableRegistryEntries.filter(({ id }) => !mcrOwnedIds.has(id)),
  ...mcrExecutableEntries,
  ...mcrValidationRegistryEntries,
  ...mcrStrategyRegistryEntries,
  ...fourWindAlwaysPassStrategyRegistryEntries,
];

export const mcrProfileResolverRegistry = new RegistryBank(registryEntries);
const seatModels = new Map<string, SeatModelDefinition>([['seats.winds-4', { id: 'seats.winds-4', playerCount: 4 }]]);

/** Non-public proof environment; it is deliberately absent from currentPlayableProfiles. */
export const mcrProfileResolverEnvironment: ResolverEnvironment = {
  registry: mcrProfileResolverRegistry,
  families: { get: (id) => id === MCR_FAMILY.id ? MCR_FAMILY : undefined },
  seatModels: { get: (id) => seatModels.get(id) },
  profiles: { get: ({ id, version }) => id === MCR_WMO_2006_PROFILE.identity.id && version === MCR_WMO_2006_PROFILE.identity.version ? MCR_WMO_2006_PROFILE : undefined },
};
