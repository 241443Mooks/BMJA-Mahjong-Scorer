export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type ScoringGrammarId =
  | 'classical-points-doubles'
  | 'pattern-accumulator'
  | 'riichi-han-fu'
  | 'target-catalogue';

export type RulesProfileRef = { id: string; version: string };
export type CatalogueRef = { id: string; version: string };
export type ExecutableRegistryIdentity = { id: string; semanticRevision: number };
export type ProfileStatus = 'published' | 'club' | 'provisional' | 'custom';
export type ProfileAuthoringIdentity = {
  id: string;
  version: string;
  name: string;
  status: ProfileStatus;
};

export type RootProfileDefinition = {
  kind: 'root';
  schemaVersion: 1;
  identity: ProfileAuthoringIdentity;
  definition: JsonObject;
};

export type DerivedProfileDefinition = {
  kind: 'derived';
  schemaVersion: 1;
  identity: ProfileAuthoringIdentity;
  baseProfile: RulesProfileRef;
  overrides: Record<string, JsonValue>;
};

export type ProfileAuthoringDefinition = RootProfileDefinition | DerivedProfileDefinition;

export type RulesFamilyDefinition = {
  id: string;
  allowedGrammars: readonly ScoringGrammarId[];
  handEvidenceCodecId: string;
  roundOutcomeCodecId: string;
  strategyStateCodecId: string;
  allowedTileSetIds?: readonly string[];
  allowedSeatModelIds?: readonly string[];
};

export type HandEvaluationInput<TEvidence, TContext> = {
  evidence: TEvidence;
  context: TContext;
};

export type HandEvidenceEnvelope = {
  evidenceSchemaVersion: number;
  kind: string;
  shared?: JsonObject;
  profilePayload: JsonObject;
};

export type ResolvedEvidenceConfig = {
  policyIds: readonly string[];
  alwaysRequired: readonly string[];
};

export type CanonicalTileFace =
  | { family: 'suit'; suit: string; rank: number }
  | { family: 'wind'; wind: string }
  | { family: 'dragon'; dragon: string }
  | { family: 'flower'; id: string }
  | { family: 'season'; id: string }
  | { family: 'joker'; id: string }
  | { family: 'profile-defined'; kindId: string; id: string };

export type PhysicalTileEvidence = {
  face: CanonicalTileFace;
  traitIds?: readonly string[];
};

export type ResolvedTableConfig = { playerCount: number; seatModelId: string };
export type ResolvedTileSetConfig = { presetId: string; options: JsonObject };
export type ResolvedHandShapeConfig = { presetId: string; options: JsonObject };
export type ResolvedValidationConfig = { handShapePolicyId: string; policyIds: readonly string[] };
export type ResolvedStrategyRef = { id: string; params: JsonObject };

export type PatternAccumulatorConfigV1 = {
  configVersion: 1;
  unit: 'fan' | 'points' | 'tai';
  patternCatalogueId: string;
  interactionPolicyId: string;
  qualificationPolicyId: string;
  interpretationPolicyId: string;
  postQualificationBonusPolicyId?: string;
  floorPolicyId?: string;
  capPolicyId?: string;
  conversionPolicyId?: string;
};

export type RiichiScoringConfigV1 = {
  configVersion: 1;
  yakuCatalogueId: string;
  yakumanCatalogueId: string;
  decompositionPolicyId: string;
  doraPolicyId: string;
  fuPolicyId: string;
  limitTierPolicyId: string;
  handValuePolicyId: string;
};

export type TargetCatalogueConfigV1 = {
  configVersion: 1;
  catalogueRef: CatalogueRef;
  matchPolicyId: string;
  substitutionPolicyId: string;
  exposurePolicyId: string;
  valuePolicyId: string;
};

export type ResolvedScoringConfig =
  | { grammar: 'classical-points-doubles'; config: JsonObject }
  | { grammar: 'pattern-accumulator'; config: PatternAccumulatorConfigV1 }
  | { grammar: 'riichi-han-fu'; config: RiichiScoringConfigV1 }
  | { grammar: 'target-catalogue'; config: TargetCatalogueConfigV1 };

export type EvaluationDisposition =
  | { kind: 'scored' }
  | { kind: 'not-qualifying'; reasonId: string }
  | { kind: 'invalid'; reasonId: string }
  | { kind: 'needs-evidence'; missingEvidenceIds: readonly string[] }
  | { kind: 'unsupported'; reasonId: string };

export type ScoreDecisionIdentity = {
  ruleId?: string;
  bindingId?: string;
  policyId?: string;
  reasonId?: string;
  sourceId?: string;
};

export type ScoreDecisionTraceEntry = {
  id: string;
  kind: 'candidate' | 'count' | 'suppress' | 'select' | 'stage' | 'final';
  identities: ScoreDecisionIdentity;
  metadata?: JsonObject;
};

export type ScoreExplanationEntry = { id: string; detail?: JsonObject };
export type HandScoreAuditHeader = {
  grammar: ScoringGrammarId;
  profile: RulesProfileRef;
  rulesFingerprint: string;
  legal: boolean;
  disposition: EvaluationDisposition;
  explanation: readonly ScoreExplanationEntry[];
  decisionTrace: readonly ScoreDecisionTraceEntry[];
  matchedCanonicalPatternIds: readonly string[];
};

export type HandScoreResult =
  | (HandScoreAuditHeader & { grammar: 'classical-points-doubles'; result: JsonObject })
  | (HandScoreAuditHeader & { grammar: 'pattern-accumulator'; result: { unit: 'fan' | 'points' | 'tai'; total: number; details?: JsonObject } })
  | (HandScoreAuditHeader & { grammar: 'riichi-han-fu'; result: { han: number; fu: number; value: number; details?: JsonObject } })
  | (HandScoreAuditHeader & { grammar: 'target-catalogue'; result: { targetIds: readonly string[]; value: number; details?: JsonObject } });

export type LedgerPartyId = string;
export type SettlementTransaction = {
  from: LedgerPartyId;
  to: LedgerPartyId;
  amount: number;
  reasonId: string;
  metadata?: JsonObject;
};

export type ResolvedRoundOutcome = { kind: string; payload: JsonObject };
export type ResolvedStrategyState = { kind: string; payload: JsonObject };
export type RoundResolution<TRoundOutcome, TAcceptedScoreResult, TRoundEvidence = JsonObject> = {
  outcome: TRoundOutcome;
  acceptedScores: readonly TAcceptedScoreResult[];
  roundEvidence?: TRoundEvidence;
};

export type GameEndResult = {
  complete: boolean;
  reasonId?: string;
  finalisation?: { transactions?: readonly SettlementTransaction[]; payload?: JsonObject };
};

export type ProfileProvenance = { sources?: readonly string[]; metadata?: JsonObject };
export type ResolvedRulesProfile = {
  schemaVersion: 1;
  identity: { id: string; version: string; status: ProfileStatus; familyId: string; grammar: ScoringGrammarId; baseProfile?: RulesProfileRef };
  table: ResolvedTableConfig;
  tileSet: ResolvedTileSetConfig;
  handShape: ResolvedHandShapeConfig;
  validation: ResolvedValidationConfig;
  scoring: ResolvedScoringConfig;
  evidence: ResolvedEvidenceConfig;
  settlement: ResolvedStrategyRef;
  progression: ResolvedStrategyRef;
  gameEnd: ResolvedStrategyRef;
  handMode?: ResolvedStrategyRef;
  incidents?: readonly ResolvedStrategyRef[];
  procedure?: ResolvedStrategyRef;
  provenance: ProfileProvenance;
};

export type ResolvedProfileArtifact = {
  profile: ResolvedRulesProfile;
  rulesFingerprint: string;
  executableDependencies: readonly ExecutableRegistryIdentity[];
};
