import { z } from 'zod';

export const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

const jsonObjectSchema = z.record(z.string(), jsonValueSchema);
const profileIdentitySchema = z.object({
  id: z.string(), version: z.string(), name: z.string(),
  status: z.enum(['published', 'club', 'provisional', 'custom']),
}).strict();
const profileRefSchema = z.object({ id: z.string(), version: z.string() }).strict();

export const canonicalTileFaceSchema = z.discriminatedUnion('family', [
  z.object({ family: z.literal('suit'), suit: z.string(), rank: z.number() }).strict(),
  z.object({ family: z.literal('wind'), wind: z.string() }).strict(),
  z.object({ family: z.literal('dragon'), dragon: z.string() }).strict(),
  z.object({ family: z.literal('flower'), id: z.string() }).strict(),
  z.object({ family: z.literal('season'), id: z.string() }).strict(),
  z.object({ family: z.literal('joker'), id: z.string() }).strict(),
  z.object({ family: z.literal('profile-defined'), kindId: z.string(), id: z.string() }).strict(),
]);

export const evaluationDispositionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('scored') }).strict(),
  z.object({ kind: z.literal('not-qualifying'), reasonId: z.string() }).strict(),
  z.object({ kind: z.literal('invalid'), reasonId: z.string() }).strict(),
  z.object({ kind: z.literal('needs-evidence'), missingEvidenceIds: z.array(z.string()) }).strict(),
  z.object({ kind: z.literal('unsupported'), reasonId: z.string() }).strict(),
]);

const scoreDecisionIdentitySchema = z.object({
  ruleId: z.string().optional(), bindingId: z.string().optional(), policyId: z.string().optional(),
  reasonId: z.string().optional(), sourceId: z.string().optional(),
}).strict();

export const scoreDecisionTraceEntrySchema = z.object({
  id: z.string(),
  kind: z.enum(['candidate', 'count', 'suppress', 'select', 'stage', 'final']),
  identities: scoreDecisionIdentitySchema,
  metadata: jsonObjectSchema.optional(),
}).strict();

export const profileAuthoringDefinitionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('root'), schemaVersion: z.literal(1), identity: profileIdentitySchema, definition: jsonObjectSchema }).strict(),
  z.object({ kind: z.literal('derived'), schemaVersion: z.literal(1), identity: profileIdentitySchema, baseProfile: profileRefSchema, overrides: jsonObjectSchema }).strict(),
]);

const patternAccumulatorConfigSchema = z.object({
  configVersion: z.literal(1), unit: z.enum(['fan', 'points', 'tai']), patternCatalogueId: z.string(),
  interactionPolicyId: z.string(), qualificationPolicyId: z.string(), interpretationPolicyId: z.string(),
  postQualificationBonusPolicyId: z.string().optional(), floorPolicyId: z.string().optional(),
  capPolicyId: z.string().optional(), conversionPolicyId: z.string().optional(),
}).strict();
const riichiScoringConfigSchema = z.object({
  configVersion: z.literal(1), yakuCatalogueId: z.string(), yakumanCatalogueId: z.string(),
  decompositionPolicyId: z.string(), doraPolicyId: z.string(), fuPolicyId: z.string(),
  limitTierPolicyId: z.string(), handValuePolicyId: z.string(),
}).strict();
const targetCatalogueConfigSchema = z.object({
  configVersion: z.literal(1), catalogueRef: profileRefSchema, matchPolicyId: z.string(),
  substitutionPolicyId: z.string(), exposurePolicyId: z.string(), valuePolicyId: z.string(),
}).strict();

export const resolvedScoringConfigSchema = z.discriminatedUnion('grammar', [
  z.object({ grammar: z.literal('classical-points-doubles'), config: jsonObjectSchema }).strict(),
  z.object({ grammar: z.literal('pattern-accumulator'), config: patternAccumulatorConfigSchema }).strict(),
  z.object({ grammar: z.literal('riichi-han-fu'), config: riichiScoringConfigSchema }).strict(),
  z.object({ grammar: z.literal('target-catalogue'), config: targetCatalogueConfigSchema }).strict(),
]);
