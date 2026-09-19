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
