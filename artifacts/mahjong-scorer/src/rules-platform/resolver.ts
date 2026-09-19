import { z } from 'zod';
import type { CapabilityMetadata } from './capabilities';
import { executableIdentity, type RegistryBank, type RegistryCategory, type RegistryEntry } from './registry';
import { resolvedScoringConfigSchema } from './schemas';
import type {
  CatalogueRef, DerivedProfileDefinition, ExecutableRegistryIdentity, JsonObject, JsonValue,
  ProfileAuthoringDefinition, ResolvedProfileArtifact, ResolvedRulesProfile, RulesFamilyDefinition,
  RulesProfileRef, ScoringGrammarId,
} from './types';

export type ReferenceRole = 'metadata' | 'functional';
export type ProfileReferenceUse = {
  path: string; role: ReferenceRole; expectedCategory: RegistryCategory; id: string;
  actualStatus?: RegistryEntry['status']; semanticRevision?: number; blockerCode?: string;
};
export type ProfileInspection = { profile?: ResolvedRulesProfile; references: readonly ProfileReferenceUse[]; blockers: readonly ProfileReferenceUse[] };
export type ContractResult = { value: JsonValue; references?: readonly { path: string; category: RegistryCategory; id: string }[] };
export type JsonContract = { validate(value: JsonValue): ContractResult };
export type CapabilityAdapter = {
  apply(profile: ResolvedRulesProfile, value: JsonValue): ResolvedRulesProfile;
  isActive(profile: ResolvedRulesProfile): boolean;
};
export type ResolverEnvironment = {
  registry: RegistryBank;
  families: { get(id: string): RulesFamilyDefinition | undefined };
  profiles: { get(ref: RulesProfileRef): ProfileAuthoringDefinition | undefined };
  capabilities?: { get(id: string): CapabilityMetadata | undefined };
  contracts?: { get(id: string): JsonContract | undefined };
  capabilityAdapters?: { get(id: string): CapabilityAdapter | undefined };
  targetCatalogues?: { has(ref: CatalogueRef): boolean };
  familyContracts?: { get(id: string): JsonContract | undefined };
};

const object = z.record(z.string(), z.unknown());
const strategy = z.object({ id: z.string().min(1), params: object }).strict();
const body = z.object({
  familyId: z.string().min(1), grammar: z.enum(['classical-points-doubles', 'pattern-accumulator', 'riichi-han-fu', 'target-catalogue']),
  table: z.object({ playerCount: z.number().int().positive(), seatModelId: z.string().min(1) }).strict(),
  tileSet: z.object({ presetId: z.string().min(1), options: object }).strict(),
  handShape: z.object({ presetId: z.string().min(1), options: object }).strict(),
  validation: z.object({ handShapePolicyId: z.string().min(1), policyIds: z.array(z.string().min(1)) }).strict(),
  scoring: z.object({ grammar: z.enum(['classical-points-doubles', 'pattern-accumulator', 'riichi-han-fu', 'target-catalogue']), config: object }).strict(),
  evidence: z.object({ policyIds: z.array(z.string().min(1)), alwaysRequired: z.array(z.string().min(1)) }).strict(),
  settlement: strategy, progression: strategy, gameEnd: strategy,
  handMode: strategy.optional(), incidents: z.array(strategy).optional(), procedure: strategy.optional(),
  provenance: z.object({ sources: z.array(z.string().min(1)).optional(), metadata: object.optional() }).strict(),
}).strict();

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function freeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value); for (const child of Object.values(value as Record<string, unknown>)) freeze(child);
  } return value;
}
function canonical(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k] as JsonValue)]));
  return value;
}
function sortedIds(values: readonly string[]): string[] { return [...new Set(values)].sort(); }
function refKey(ref: RulesProfileRef): string { return `${ref.id}@${ref.version}`; }
function nonEmpty(value: JsonObject): boolean { return Object.keys(value).length > 0; }

function decodeRoot(definition: ProfileAuthoringDefinition): ResolvedRulesProfile {
  if (definition.kind !== 'root') throw new Error('ROOT_REQUIRED');
  if (!definition.identity.id || !definition.identity.version) throw new Error('PROFILE_IDENTITY_REQUIRED');
  const parsed = body.parse(definition.definition);
  if (parsed.grammar !== parsed.scoring.grammar) throw new Error('GRAMMAR_MISMATCH');
  const scoring = resolvedScoringConfigSchema.parse(parsed.scoring);
  return {
    schemaVersion: 1,
    identity: { id: definition.identity.id, version: definition.identity.version, status: definition.identity.status, familyId: parsed.familyId, grammar: parsed.grammar },
    table: parsed.table, tileSet: parsed.tileSet as { presetId: string; options: JsonObject }, handShape: parsed.handShape as { presetId: string; options: JsonObject },
    validation: parsed.validation, scoring: scoring as ResolvedRulesProfile['scoring'], evidence: parsed.evidence,
    settlement: parsed.settlement as { id: string; params: JsonObject }, progression: parsed.progression as { id: string; params: JsonObject }, gameEnd: parsed.gameEnd as { id: string; params: JsonObject },
    handMode: parsed.handMode as { id: string; params: JsonObject } | undefined, incidents: parsed.incidents as readonly { id: string; params: JsonObject }[] | undefined,
    procedure: parsed.procedure as { id: string; params: JsonObject } | undefined, provenance: parsed.provenance as ResolvedRulesProfile['provenance'],
  };
}

function use(references: ProfileReferenceUse[], path: string, role: ReferenceRole, expectedCategory: RegistryCategory, id: string, env: ResolverEnvironment): void {
  try {
    const entry = env.registry.get(expectedCategory, id);
    references.push({ path, role, expectedCategory, id, actualStatus: entry.status, semanticRevision: entry.semanticRevision,
      blockerCode: role === 'functional' && entry.status !== 'executable' ? 'REFERENCE_NOT_EXECUTABLE' : undefined });
  } catch { references.push({ path, role, expectedCategory, id, blockerCode: 'REFERENCE_UNRESOLVED' }); }
}
function scoreReferences(profile: ResolvedRulesProfile, refs: ProfileReferenceUse[], env: ResolverEnvironment): void {
  const scoring = profile.scoring;
  if (scoring.grammar === 'pattern-accumulator') {
    const c = scoring.config; const map: [string, RegistryCategory, string | undefined][] = [
      ['patternCatalogueId', 'catalogue.pattern', c.patternCatalogueId], ['interactionPolicyId', 'interaction', c.interactionPolicyId], ['qualificationPolicyId', 'qualification', c.qualificationPolicyId], ['interpretationPolicyId', 'interpretation', c.interpretationPolicyId], ['postQualificationBonusPolicyId', 'post-qualification-bonus', c.postQualificationBonusPolicyId], ['floorPolicyId', 'value-policy', c.floorPolicyId], ['capPolicyId', 'value-policy', c.capPolicyId], ['conversionPolicyId', 'conversion', c.conversionPolicyId],
    ]; map.forEach(([p, cat, id]) => { if (id) use(refs, `scoring.config.${p}`, 'functional', cat, id, env); });
  } else if (scoring.grammar === 'riichi-han-fu') {
    const c = scoring.config; const map: [string, RegistryCategory, string][] = [['yakuCatalogueId','catalogue.yaku',c.yakuCatalogueId],['yakumanCatalogueId','catalogue.yakuman',c.yakumanCatalogueId],['decompositionPolicyId','riichi-decomposition',c.decompositionPolicyId],['doraPolicyId','dora',c.doraPolicyId],['fuPolicyId','fu',c.fuPolicyId],['limitTierPolicyId','riichi-limit-tier',c.limitTierPolicyId],['handValuePolicyId','riichi-hand-value',c.handValuePolicyId]]; map.forEach(([p,cat,id]) => use(refs, `scoring.config.${p}`, 'functional', cat, id, env));
  } else if (scoring.grammar === 'target-catalogue') {
    const c = scoring.config; if (!c.catalogueRef.version) refs.push({ path: 'scoring.config.catalogueRef.version', role: 'functional', expectedCategory: 'catalogue.target', id: c.catalogueRef.id, blockerCode: 'CATALOGUE_VERSION_REQUIRED' });
    use(refs, 'scoring.config.catalogueRef.id', 'functional', 'catalogue.target', c.catalogueRef.id, env);
    if (!env.targetCatalogues?.has(c.catalogueRef)) refs.push({ path: 'scoring.config.catalogueRef', role: 'functional', expectedCategory: 'catalogue.target', id: c.catalogueRef.id, blockerCode: 'CATALOGUE_UNAVAILABLE' });
    [['matchPolicyId','target-match',c.matchPolicyId],['substitutionPolicyId','substitution',c.substitutionPolicyId],['exposurePolicyId','target-exposure',c.exposurePolicyId],['valuePolicyId','target-value',c.valuePolicyId]].forEach(([p,cat,id]) => use(refs, `scoring.config.${p}`, 'functional', cat as RegistryCategory, id, env));
  }
}

function validateOpen(path: string, entry: RegistryEntry, value: JsonObject, refs: ProfileReferenceUse[], env: ResolverEnvironment): void {
  if (!nonEmpty(value)) return;
  const contract = entry.parameterSchemaId ? env.contracts?.get(entry.parameterSchemaId) : undefined;
  if (!contract) { refs.push({ path, role: 'functional', expectedCategory: entry.category, id: entry.id, blockerCode: 'OPEN_JSON_UNVALIDATED' }); return; }
  for (const nested of contract.validate(value).references ?? []) use(refs, `${path}.${nested.path}`, 'functional', nested.category, nested.id, env);
}

export function inspectProfile(definition: ProfileAuthoringDefinition, env: ResolverEnvironment): ProfileInspection {
  let profile: ResolvedRulesProfile;
  try { profile = decodeRoot(definition); } catch (error) { return { references: [], blockers: [{ path: 'definition', role: 'functional', expectedCategory: 'family', id: '', blockerCode: error instanceof z.ZodError ? 'ROOT_INVALID' : error instanceof Error ? error.message : 'ROOT_INVALID' }] }; }
  const refs: ProfileReferenceUse[] = [];
  const family = env.families.get(profile.identity.familyId);
  use(refs, 'familyId', 'functional', 'family', profile.identity.familyId, env);
  if (!family || family.id !== profile.identity.familyId) refs.push({ path: 'familyId', role: 'functional', expectedCategory: 'family', id: profile.identity.familyId, blockerCode: 'FAMILY_UNAVAILABLE' });
  else {
    if (!family.allowedGrammars.includes(profile.identity.grammar)) refs.push({ path: 'grammar', role: 'functional', expectedCategory: 'family', id: family.id, blockerCode: 'FAMILY_GRAMMAR_INCOMPATIBLE' });
    if (family.allowedTileSetIds && !family.allowedTileSetIds.includes(profile.tileSet.presetId)) refs.push({ path: 'tileSet.presetId', role: 'functional', expectedCategory: 'tiles', id: profile.tileSet.presetId, blockerCode: 'FAMILY_TILESET_INCOMPATIBLE' });
    if (family.allowedSeatModelIds && !family.allowedSeatModelIds.includes(profile.table.seatModelId)) refs.push({ path: 'table.seatModelId', role: 'functional', expectedCategory: 'seats', id: profile.table.seatModelId, blockerCode: 'FAMILY_SEATMODEL_INCOMPATIBLE' });
  }
  use(refs, 'table.seatModelId','functional','seats',profile.table.seatModelId,env); use(refs, 'tileSet.presetId','functional','tiles',profile.tileSet.presetId,env); use(refs, 'handShape.presetId','functional','shape',profile.handShape.presetId,env); use(refs, 'validation.handShapePolicyId','functional','validation',profile.validation.handShapePolicyId,env);
  profile.validation.policyIds.forEach((id,i) => use(refs, `validation.policyIds[${i}]`,'functional','validation',id,env)); profile.evidence.policyIds.forEach((id,i) => use(refs, `evidence.policyIds[${i}]`,'functional','evidence-policy',id,env)); profile.evidence.alwaysRequired.forEach((id,i) => use(refs, `evidence.alwaysRequired[${i}]`,'functional','evidence',id,env));
  const strategies: [string, RegistryCategory, { id: string; params: JsonObject }][] = [['settlement','settlement',profile.settlement],['progression','progression',profile.progression],['gameEnd','game-end',profile.gameEnd], ...profile.handMode ? [['handMode','hand-mode',profile.handMode] as [string,RegistryCategory,{id:string;params:JsonObject}]] : [], ...profile.incidents?.map((s,i) => [`incidents[${i}]`,'incident',s] as [string,RegistryCategory,{id:string;params:JsonObject}]) ?? [], ...profile.procedure ? [['procedure','procedure',profile.procedure] as [string,RegistryCategory,{id:string;params:JsonObject}]] : []];
  for (const [path, category, item] of strategies) { use(refs, `${path}.id`, 'functional', category, item.id, env); try { validateOpen(`${path}.params`, env.registry.get(category,item.id), item.params, refs, env); } catch { /* use already reports resolution */ } }
  for (const id of profile.provenance.sources ?? []) use(refs, 'provenance.sources', 'metadata', 'source', id, env);
  scoreReferences(profile, refs, env);
  for (const [path, category, id, options] of [['tileSet.options','tiles',profile.tileSet.presetId,profile.tileSet.options],['handShape.options','shape',profile.handShape.presetId,profile.handShape.options]] as [string,RegistryCategory,string,JsonObject][]) try { validateOpen(path, env.registry.get(category,id), options, refs, env); } catch { /* resolution captured */ }
  if (profile.scoring.grammar === 'classical-points-doubles' && nonEmpty(profile.scoring.config)) {
    const contract = env.familyContracts?.get(profile.identity.familyId); if (!contract) refs.push({ path: 'scoring.config', role: 'functional', expectedCategory: 'family', id: profile.identity.familyId, blockerCode: 'CLASSICAL_CONFIG_UNVALIDATED' }); else for (const nested of contract.validate(profile.scoring.config).references ?? []) use(refs, `scoring.config.${nested.path}`, 'functional', nested.category, nested.id, env);
  }
  return { profile, references: refs, blockers: refs.filter(r => r.blockerCode) };
}

function capability(metadata: CapabilityMetadata, env: ResolverEnvironment): string | undefined {
  try { const entry = env.registry.get(metadata.category, metadata.id); if (entry.category !== metadata.category || entry.status !== metadata.status || (entry.status === 'executable' && entry.semanticRevision !== metadata.semanticRevision)) return 'CAPABILITY_REGISTRY_MISMATCH'; if (metadata.provenance?.sourceId) { const source = env.registry.get('source', metadata.provenance.sourceId); if (source.status !== 'metadata') return 'CAPABILITY_SOURCE_INVALID'; } return undefined; } catch { return 'CAPABILITY_UNRESOLVED'; }
}
function rootFromProfile(profile: ResolvedRulesProfile): ProfileAuthoringDefinition {
  const { schemaVersion, identity, ...definition } = clone(profile);
  return {
    kind: 'root', schemaVersion: 1,
    identity: { id: identity.id, version: identity.version, name: '', status: identity.status },
    definition: { familyId: identity.familyId, grammar: identity.grammar, ...definition } as unknown as JsonObject,
  };
}
async function fingerprint(profile: ResolvedRulesProfile, dependencies: readonly ExecutableRegistryIdentity[]): Promise<string> {
  const semantic = clone(profile) as unknown as Record<string, unknown>; delete semantic.identity; delete semantic.provenance;
  const validation = semantic.validation as Record<string, unknown>; validation.policyIds = sortedIds(validation.policyIds as string[]);
  const evidence = semantic.evidence as Record<string, unknown>; evidence.policyIds = sortedIds(evidence.policyIds as string[]); evidence.alwaysRequired = sortedIds(evidence.alwaysRequired as string[]);
  const payload = canonical({ schemaVersion: 1, profile: semantic as unknown as JsonValue, executableDependencies: dependencies.map(d => ({ id: d.id, semanticRevision: d.semanticRevision })) } as unknown as JsonValue);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function resolvePlayableProfile(ref: RulesProfileRef, env: ResolverEnvironment): Promise<ResolvedProfileArtifact> {
  const resolving = new Set<string>();
  const resolve = async (current: RulesProfileRef): Promise<ResolvedProfileArtifact> => {
    const key = refKey(current); if (resolving.has(key)) throw new Error('PROFILE_INHERITANCE_CYCLE'); resolving.add(key);
    const definition = env.profiles.get(current); if (!definition) throw new Error('PROFILE_UNRESOLVED'); if (definition.identity.id !== current.id || definition.identity.version !== current.version) throw new Error('PROFILE_IDENTITY_MISMATCH');
    let profile: ResolvedRulesProfile;
    if (definition.kind === 'root') profile = decodeRoot(definition);
    else {
      if (refKey(definition.baseProfile) === key) throw new Error('PROFILE_INHERITANCE_SELF');
      const base = await resolve(definition.baseProfile); profile = clone(base.profile); profile.identity = { id: definition.identity.id, version: definition.identity.version, status: definition.identity.status, familyId: profile.identity.familyId, grammar: profile.identity.grammar, baseProfile: clone(definition.baseProfile) };
      for (const id of Object.keys(definition.overrides).sort()) {
        const metadata = env.capabilities?.get(id); if (!metadata) throw new Error('CAPABILITY_UNRESOLVED'); const issue = capability(metadata, env); if (issue) throw new Error(issue); if (metadata.customisation !== 'customisable') throw new Error('CAPABILITY_LOCKED'); if (metadata.compatibleGrammars && !metadata.compatibleGrammars.includes(profile.identity.grammar)) throw new Error('CAPABILITY_GRAMMAR_INCOMPATIBLE'); if (metadata.compatibleFamilyIds && !metadata.compatibleFamilyIds.includes(profile.identity.familyId)) throw new Error('CAPABILITY_FAMILY_INCOMPATIBLE'); const contract = metadata.valueSchemaId ? env.contracts?.get(metadata.valueSchemaId) : undefined; if (!contract) throw new Error('CAPABILITY_VALUE_UNVALIDATED'); const adapter = env.capabilityAdapters?.get(id); if (!adapter) throw new Error('CAPABILITY_ADAPTER_UNRESOLVED'); profile = adapter.apply(clone(profile), contract.validate(definition.overrides[id]).value);
      }
      for (const id of Object.keys(definition.overrides)) { const metadata = env.capabilities!.get(id)!; for (const required of metadata.requires ?? []) { const requiredMeta = env.capabilities?.get(required); if (!requiredMeta || !env.capabilityAdapters?.get(required)?.isActive(profile)) throw new Error('CAPABILITY_REQUIREMENT_UNMET'); } for (const conflict of metadata.conflicts ?? []) { const conflictMeta = env.capabilities?.get(conflict); if (!conflictMeta || env.capabilityAdapters?.get(conflict)?.isActive(profile)) throw new Error('CAPABILITY_CONFLICT_ACTIVE'); } }
    }
    const inspection = inspectProfile(rootFromProfile(profile), env);
    if (!inspection.profile || inspection.blockers.some(b => b.role === 'functional')) throw new Error(`PROFILE_NOT_PLAYABLE:${inspection.blockers.map(b => b.blockerCode).join(',')}`);
    const dependencies = inspection.references.filter(r => r.role === 'functional' && !r.blockerCode).map(r => executableIdentity(env.registry.requireExecutable(r.expectedCategory, r.id))).filter((d,i,a) => a.findIndex(x => x.id === d.id && x.semanticRevision === d.semanticRevision) === i).sort((a,b) => a.id.localeCompare(b.id) || a.semanticRevision - b.semanticRevision);
    const artifact = freeze({ profile: freeze(clone(profile)), executableDependencies: freeze(dependencies), rulesFingerprint: await fingerprint(profile, dependencies) }); resolving.delete(key); return artifact;
  };
  return resolve(ref);
}
