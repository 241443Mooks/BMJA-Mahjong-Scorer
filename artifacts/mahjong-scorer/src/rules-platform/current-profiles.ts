import {
  OUTSIDE_THE_BOX_PROFILE_REF,
} from '../game/outside-the-box-catalogue';
import { WESTERN_TM_PROFILE_REF } from '../game/western-tm-catalogue';
import { BUZZARD_2000_PROFILE_REF } from '../game/buzzard-2000';
import { architectureSeedEntries } from './architecture-seeds';
import { classicalStrategyRegistryEntries } from './classical-strategies';
import {
  CLASSICAL_WESTERN_VALIDATION_FAMILY,
  BUZZARD_CLASSICAL_VALIDATION,
  classicalValidationRegistryEntries,
} from './classical-validation';
import { outsideTheBoxStrategyRegistryEntries } from './outside-the-box-strategies';
import { RegistryBank, type RegistryEntry } from './registry';
import type { JsonContract, ResolverEnvironment } from './resolver';
import type {
  JsonObject,
  JsonValue,
  ProfileAuthoringDefinition,
  RootProfileDefinition,
  RulesFamilyDefinition,
  RulesProfileRef,
  SeatModelDefinition,
} from './types';

const deterministic = { kind: 'deterministic', dependencies: [] } as const;
const executable = <C extends RegistryEntry['category']>(id: string, category: C, semanticRevision = 1): RegistryEntry<C> => ({
  id,
  category,
  status: 'executable',
  semanticRevision,
  executableContract: deterministic,
});

/**
 * These are current product seams, deliberately separate from the architecture
 * pressure seeds.  They identify the legacy Classical implementation that Run
 * 1 will adapt; they do not introduce another scorer or configuration DSL.
 */
export const currentClassicalRegistryEntries: readonly RegistryEntry[] = [
  executable('family.classical-western', 'family'),
  executable('tiles.flowers-144', 'tiles'),
  executable('seats.winds-4', 'seats'),
  executable('shape.four-sets-pair', 'shape'),
  executable('evidence.classical-hand-v1', 'evidence'),
  executable('evidence.seat-wind', 'evidence'),
  executable('evidence.round-wind', 'evidence'),
  executable('evidence-policy.classical-current', 'evidence-policy'),
  executable('classical.scorer.current', 'classical'),
  executable('classical.bindings.bmja-current', 'classical', 2),
  executable('classical.bindings.western-tm-current', 'classical'),
  executable('classical.bindings.outside-the-box-current', 'classical'),
  executable('classical.policy.bmja-current', 'classical'),
  executable('classical.policy.western-tm-current', 'classical'),
  executable('classical.policy.outside-the-box-current', 'classical'),
  executable('classical.bindings.buzzard-2000', 'classical'),
  executable('classical.policy.buzzard-2000', 'classical'),
];

const currentIds = new Set([
  ...currentClassicalRegistryEntries,
  ...classicalStrategyRegistryEntries,
  ...classicalValidationRegistryEntries,
  ...outsideTheBoxStrategyRegistryEntries,
].map(({ id }) => id));

/** The single registry used to seal the three current playable profiles. */
export const currentPlayableRegistry = new RegistryBank([
  ...architectureSeedEntries.filter(({ id }) => !currentIds.has(id)),
  ...currentClassicalRegistryEntries,
  ...classicalStrategyRegistryEntries,
  ...classicalValidationRegistryEntries,
  ...outsideTheBoxStrategyRegistryEntries,
]);

export const CURRENT_CLASSICAL_FAMILY: RulesFamilyDefinition = {
  ...CLASSICAL_WESTERN_VALIDATION_FAMILY,
  allowedTileSetIds: ['tiles.flowers-144'],
  allowedSeatModelIds: ['seats.winds-4'],
};

const seatModels = new Map<string, SeatModelDefinition>([
  ['seats.winds-4', { id: 'seats.winds-4', playerCount: 4 }],
]);

type ClassicalCurrentConfig = {
  configVersion: 1;
  scorerId: 'classical.scorer.current';
  bindingId: string;
  policyId: string;
};

const classicalCurrentConfigs: Readonly<Record<string, ClassicalCurrentConfig>> = {
  'bmja@1.0': {
    configVersion: 1,
    scorerId: 'classical.scorer.current',
    bindingId: 'classical.bindings.bmja-current',
    policyId: 'classical.policy.bmja-current',
  },
  'western-tm@0.1': {
    configVersion: 1,
    scorerId: 'classical.scorer.current',
    bindingId: 'classical.bindings.western-tm-current',
    policyId: 'classical.policy.western-tm-current',
  },
  'outside-the-box@0.1': {
    configVersion: 1,
    scorerId: 'classical.scorer.current',
    bindingId: 'classical.bindings.outside-the-box-current',
    policyId: 'classical.policy.outside-the-box-current',
  },
  'buzzard-2000@0.1': { configVersion: 1, scorerId: 'classical.scorer.current', bindingId: 'classical.bindings.buzzard-2000', policyId: 'classical.policy.buzzard-2000' },
};

const own = (value: unknown, key: string): unknown =>
  value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined;

/** Bounded JSON only: it selects existing scorer, bindings, and policy seams. */
const classicalCurrentConfigContract: JsonContract = {
  validate(value: JsonValue) {
    const config = value as JsonObject;
    const keys = Object.keys(config).sort();
    if (keys.join(',') !== 'bindingId,configVersion,policyId,scorerId' ||
      own(config, 'configVersion') !== 1 ||
      own(config, 'scorerId') !== 'classical.scorer.current' ||
      typeof own(config, 'bindingId') !== 'string' ||
      typeof own(config, 'policyId') !== 'string') {
      throw new Error('CLASSICAL_CURRENT_CONFIG_INVALID');
    }
    return {
      value: config,
      references: [
        { path: 'scorerId', category: 'classical' as const, id: config.scorerId as string },
        { path: 'bindingId', category: 'classical' as const, id: config.bindingId as string },
        { path: 'policyId', category: 'classical' as const, id: config.policyId as string },
      ],
    };
  },
};

/** Current OTB settlement is deliberately parameterised: the legacy limit is 1000. */
const outsideTheBoxSettlementContract: JsonContract = {
  validate(value: JsonValue) {
    const params = value as JsonObject;
    if (Object.keys(params).join(',') !== 'limit' ||
      typeof params.limit !== 'number' || !Number.isFinite(params.limit) || params.limit <= 0) {
      throw new Error('OUTSIDE_THE_BOX_SETTLEMENT_PARAMS_INVALID');
    }
    return { value: { limit: params.limit } };
  },
};

const profile = (
  identity: RootProfileDefinition['identity'],
  config: ClassicalCurrentConfig,
  overrides: Pick<JsonObject, 'settlement' | 'progression' | 'gameEnd'> &
    Partial<Pick<JsonObject, 'handMode' | 'incidents' | 'validation'>>,
): RootProfileDefinition => ({
  kind: 'root',
  schemaVersion: 1,
  identity,
  definition: {
    familyId: CURRENT_CLASSICAL_FAMILY.id,
    grammar: 'classical-points-doubles',
    table: { playerCount: 4, seatModelId: 'seats.winds-4' },
    tileSet: { presetId: 'tiles.flowers-144', options: {} },
    handShape: { presetId: 'shape.four-sets-pair', options: {} },
    validation: { handShapePolicyId: 'validation.classical-current', policyIds: [] },
    scoring: { grammar: 'classical-points-doubles', config },
    evidence: {
      policyIds: ['evidence-policy.classical-current'],
      alwaysRequired: [
        'evidence.classical-hand-v1',
        'evidence.seat-wind',
        'evidence.round-wind',
      ],
    },
    ...overrides,
    provenance: { metadata: { currentRuntime: true } },
  },
});

const classicalTable = {
  settlement: { id: 'settlement.classical-pairwise', params: {} },
  progression: { id: 'progression.classical-east-cycle', params: {} },
  gameEnd: { id: 'game-end.classical-east-cycle', params: {} },
  handMode: { id: 'hand-mode.none', params: {} },
};

export const BMJA_CURRENT_PROFILE: RootProfileDefinition = profile(
  { id: 'bmja', version: '1.0', name: 'British Mahjong Association', status: 'published' },
  classicalCurrentConfigs['bmja@1.0'],
  classicalTable,
);

export const WESTERN_TM_CURRENT_PROFILE: RootProfileDefinition = profile(
  { id: WESTERN_TM_PROFILE_REF.id, version: WESTERN_TM_PROFILE_REF.version, name: 'Western — Thompson & Maloney', status: 'provisional' },
  classicalCurrentConfigs['western-tm@0.1'],
  classicalTable,
);

export const OUTSIDE_THE_BOX_CURRENT_PROFILE: RootProfileDefinition = profile(
  { id: OUTSIDE_THE_BOX_PROFILE_REF.id, version: OUTSIDE_THE_BOX_PROFILE_REF.version, name: 'Outside the Box', status: 'club' },
  classicalCurrentConfigs['outside-the-box@0.1'],
  {
    settlement: { id: 'settlement.outside-the-box-incidents', params: { limit: 1000 } },
    progression: { id: 'progression.classical-east-cycle', params: {} },
    gameEnd: { id: 'game-end.classical-east-cycle', params: {} },
    handMode: { id: 'hand-mode.outside-the-box-goulash', params: {} },
    incidents: [{ id: 'incident.outside-the-box-round-preparation', params: {} }],
  },
);
export const BUZZARD_2000_CURRENT_PROFILE: RootProfileDefinition = profile(
  { id: BUZZARD_2000_PROFILE_REF.id, version: BUZZARD_2000_PROFILE_REF.version, name: 'British/Western Classical — Buzzard 2000', status: 'provisional' },
  classicalCurrentConfigs['buzzard-2000@0.1'], { ...classicalTable, validation: { handShapePolicyId: BUZZARD_CLASSICAL_VALIDATION.id, policyIds: [] } },
);

export const currentPlayableProfiles: readonly ProfileAuthoringDefinition[] = [
  BMJA_CURRENT_PROFILE,
  WESTERN_TM_CURRENT_PROFILE,
  OUTSIDE_THE_BOX_CURRENT_PROFILE,
  BUZZARD_2000_CURRENT_PROFILE,
];

const profiles = new Map(currentPlayableProfiles.map((definition) => [
  `${definition.identity.id}@${definition.identity.version}`,
  definition,
]));

/** The real #231 resolver environment for the current product profiles. */
export const currentPlayableResolverEnvironment: ResolverEnvironment = {
  registry: currentPlayableRegistry,
  families: { get: (id) => id === CURRENT_CLASSICAL_FAMILY.id ? CURRENT_CLASSICAL_FAMILY : undefined },
  seatModels: { get: (id) => seatModels.get(id) },
  profiles: { get: ({ id, version }: RulesProfileRef) => profiles.get(`${id}@${version}`) },
  contracts: { get: (id) => id === 'params.settlement.outside-the-box-incidents@1' ? outsideTheBoxSettlementContract : undefined },
  familyContracts: { get: (id) => id === CURRENT_CLASSICAL_FAMILY.id ? classicalCurrentConfigContract : undefined },
};
