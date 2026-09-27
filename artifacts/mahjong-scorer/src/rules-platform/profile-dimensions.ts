import type { JsonValue, ResolvedProfileArtifact, RulesProfileRef } from './types';

export type RulesDimensionGroup =
  | 'identity-table-tiles' | 'hand-play' | 'ready-declarations' | 'scoring'
  | 'settlement-incidents' | 'draws-progression';

export type RulesDimensionId =
  | 'profile.identity' | 'profile.authority-status' | 'table.player-count' | 'table.seat-model'
  | 'tiles.physical-set' | 'tiles.bonus-tiles' | 'tiles.substitute-special'
  | 'hand.structural-size' | 'hand.normal-winning-shape' | 'play.ordinary-chow-policy'
  | 'play.exposure-model' | 'play.rob-kong' | 'hand.irregular-special-model'
  | 'ready.model' | 'ready.fishing-score' | 'scoring.grammar' | 'scoring.ordinary-base'
  | 'scoring.winner-base-bonus' | 'scoring.multiplier-bonus-policy' | 'scoring.limit-cap'
  | 'scoring.limit-composition' | 'scoring.special-catalogue' | 'scoring.special-binding'
  | 'scoring.nonwinner-special-result' | 'scoring.decomposition-policy'
  | 'settlement.winner-payments' | 'settlement.loser-to-loser' | 'settlement.dealer-multiplier'
  | 'settlement.liability' | 'settlement.false-mahjong' | 'settlement.incorrect-hand'
  | 'round.draw-settlement' | 'round.draw-follow-up' | 'progression.dealer-retention'
  | 'progression.seat-rotation' | 'progression.prevailing-wind' | 'progression.game-end';

export type RulesDimensionDefinition = {
  id: RulesDimensionId;
  label: string;
  group: RulesDimensionGroup;
  groupOrder: number;
  order: number;
  diagnosticValue: 'low' | 'medium' | 'high' | 'very-high';
};

const definitions: readonly RulesDimensionDefinition[] = [
  ['profile.identity','Rules profile','identity-table-tiles','low'], ['profile.authority-status','Rules/source status','identity-table-tiles','medium'],
  ['table.player-count','Players','identity-table-tiles','low'], ['table.seat-model','Seats','identity-table-tiles','low'],
  ['tiles.physical-set','Main tile set','identity-table-tiles','medium'], ['tiles.bonus-tiles','Flowers & Seasons','identity-table-tiles','medium'],
  ['tiles.substitute-special','Jokers, blanks or substitutes','identity-table-tiles','high'],
  ['hand.structural-size','Normal hand size','hand-play','low'], ['hand.normal-winning-shape','Normal winning shape','hand-play','high'],
  ['play.ordinary-chow-policy','Chows in an ordinary hand','hand-play','high'], ['play.exposure-model','Exposed vs concealed','hand-play','medium'],
  ['play.rob-kong','Robbing a Kong affects scoring','hand-play','medium'], ['hand.irregular-special-model','Special/irregular hands','hand-play','high'],
  ['ready.model','Ready / waiting concepts','ready-declarations','high'], ['ready.fishing-score','Non-winning fishing score','ready-declarations','high'],
  ['scoring.grammar','Scoring system','scoring','very-high'], ['scoring.ordinary-base','Basic Pung/Kong/pair/bonus points','scoring','medium'],
  ['scoring.winner-base-bonus','Basic Mahjong / self-draw bonuses','scoring','low'], ['scoring.multiplier-bonus-policy','Doubles and extra bonuses','scoring','high'],
  ['scoring.limit-cap','Normal limit / table limit','scoring','high'], ['scoring.limit-composition','How limits combine with bonus scoring','scoring','medium'],
  ['scoring.special-catalogue','Named special-hand / pattern catalogue','scoring','very-high'], ['scoring.special-binding','Values/exposure for the same structural pattern','scoring','very-high'],
  ['scoring.nonwinner-special-result','Exceptional non-winner special score','scoring','high'], ['scoring.decomposition-policy','How alternate hand interpretations are handled','scoring','high'],
  ['settlement.winner-payments','Who pays the winner?','settlement-incidents','medium'], ['settlement.loser-to-loser','Do non-winners settle with each other?','settlement-incidents','high'],
  ['settlement.dealer-multiplier','East/dealer payment multiplier','settlement-incidents','medium'], ['settlement.liability','Liability / one player pays for others','settlement-incidents','very-high'],
  ['settlement.false-mahjong','False Mahjong consequence','settlement-incidents','high'], ['settlement.incorrect-hand','Wrong tile-count consequence','settlement-incidents','high'],
  ['round.draw-settlement','What happens financially on a draw?','draws-progression','medium'], ['round.draw-follow-up','What happens after a draw?','draws-progression','very-high'],
  ['progression.dealer-retention','When does East stay East?','draws-progression','medium'], ['progression.seat-rotation','When do seats rotate?','draws-progression','low'],
  ['progression.prevailing-wind','Prevailing Wind progression','draws-progression','medium'], ['progression.game-end','Full-game end','draws-progression','medium'],
].map(([id,label,group,diagnosticValue], index) => ({
  id: id as RulesDimensionId, label: label as string, group: group as RulesDimensionGroup,
  groupOrder: ['identity-table-tiles','hand-play','ready-declarations','scoring','settlement-incidents','draws-progression'].indexOf(group as string) + 1,
  order: index + 1, diagnosticValue: diagnosticValue as RulesDimensionDefinition['diagnosticValue'],
}));

export const RULES_DIMENSIONS = Object.freeze(definitions);
export const rulesDimension = (id: RulesDimensionId) => definitions.find((dimension) => dimension.id === id)!;

export type RuleValue =
  | { status: 'present'; data: JsonValue }
  | { status: 'absent' }
  | { status: 'unknown' }
  | { status: 'not-applicable' };
export type RuntimeSupport = 'executable' | 'partial' | 'reference-only' | 'not-modelled' | 'not-applicable';
export type SourceEvidenceStatus = 'source-verified' | 'verified-club' | 'source-provisional' | 'source-unknown' | 'not-applicable';
export type ProfileDimensionRelationshipKind =
  | 'exact-same' | 'same-provisional' | 'parameter-variation' | 'binding-variation' | 'policy-variation'
  | 'narrower' | 'broader' | 'related-analogue' | 'unique' | 'absent' | 'unknown';
export type ProfileDimensionRelationship = {
  dimensionId: RulesDimensionId;
  leftProfile: RulesProfileRef;
  rightProfile: RulesProfileRef;
  relationship: ProfileDimensionRelationshipKind;
};
export type ProfileDimensionValue = {
  profile: RulesProfileRef;
  dimensionId: RulesDimensionId;
  value: RuleValue;
  displayValue: string;
  runtimeSupport: RuntimeSupport;
  sourceStatus: SourceEvidenceStatus;
  caveat?: string;
  provenanceIds: readonly string[];
};

export type ReviewedEvidence = Pick<ProfileDimensionValue, 'sourceStatus'> & Partial<Pick<ProfileDimensionValue, 'caveat' | 'provenanceIds'>>;
export type ReviewedEvidenceIndex = Partial<Record<string, Partial<Record<RulesDimensionId, ReviewedEvidence>>>>;

const auditReference = 'docs/rules/CLASSICAL_COMPARATOR_AUDIT_V1.md';
const evidenceFor = (status: SourceEvidenceStatus, caveat?: string): ReviewedEvidence => ({
  sourceStatus: status, provenanceIds: [auditReference], ...(caveat ? { caveat } : {}),
});
const reviewed = (
  dimensions: readonly RulesDimensionId[],
  status: SourceEvidenceStatus,
  caveat?: string,
): Partial<Record<RulesDimensionId, ReviewedEvidence>> => Object.fromEntries(
  dimensions.map((dimension) => [dimension, evidenceFor(status, caveat)]),
);
const classicalCore: RulesDimensionId[] = [
  'table.player-count', 'table.seat-model', 'tiles.physical-set', 'hand.normal-winning-shape', 'scoring.grammar',
  'scoring.limit-cap', 'settlement.winner-payments', 'progression.dealer-retention', 'progression.game-end',
];

/** Calibration statuses transcribed from the reviewed #296 Classical comparator audit. */
export const CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE: ReviewedEvidenceIndex = Object.freeze({
  'bmja@1.0': reviewed(classicalCore, 'source-verified'),
  'western-tm@0.1': reviewed(classicalCore, 'source-provisional',
    'Current ordinary runtime reuse does not establish source equivalence.'),
  'outside-the-box@0.1': reviewed(classicalCore, 'verified-club'),
  'buzzard-2000@0.1': reviewed(classicalCore, 'source-verified'),
});

const evidenceStatus = (index: ReviewedEvidenceIndex, ref: RulesProfileRef, id: RulesDimensionId): ReviewedEvidence =>
  index[`${ref.id}@${ref.version}`]?.[id] ?? { sourceStatus: 'source-unknown' };
const present = (data: JsonValue): RuleValue => ({ status: 'present', data });

const runtimeValue = (artifact: ResolvedProfileArtifact, id: RulesDimensionId): JsonValue | undefined => {
  const { profile } = artifact;
  const config = profile.scoring.config as Record<string, JsonValue>;
  switch (id) {
    case 'profile.identity': return { id: profile.identity.id, version: profile.identity.version };
    case 'profile.authority-status': return profile.identity.status;
    case 'table.player-count': return profile.table.playerCount;
    case 'table.seat-model': return profile.table.seatModelId;
    case 'tiles.physical-set': return profile.tileSet.presetId;
    case 'hand.normal-winning-shape': return profile.handShape.presetId;
    case 'scoring.grammar': return profile.scoring.grammar;
    case 'scoring.limit-cap': return typeof config.defaultTableLimit === 'number' ? config.defaultTableLimit : undefined;
    case 'scoring.special-catalogue': return typeof config.patternCatalogueId === 'string' ? config.patternCatalogueId : undefined;
    case 'settlement.winner-payments': return profile.settlement.id;
    case 'round.draw-follow-up': return profile.handMode?.id ?? 'hand-mode.none';
    case 'progression.dealer-retention': return profile.progression.id;
    case 'progression.game-end': return profile.gameEnd.id;
    default: return undefined;
  }
};

const display = (value: RuleValue): string => value.status === 'present'
  ? (typeof value.data === 'string' || typeof value.data === 'number'
    ? String(value.data)
    : value.data && !Array.isArray(value.data) && typeof value.data === 'object' && 'id' in value.data && 'version' in value.data
      ? `${String(value.data.id)}@${String(value.data.version)}`
      : JSON.stringify(value.data))
  : value.status;

/** Projects dimension rows from a resolved artifact. Unsupported facts remain explicit unknowns. */
export const projectProfileDimensions = (
  artifact: ResolvedProfileArtifact,
  reviewedEvidence: ReviewedEvidenceIndex = {},
): readonly ProfileDimensionValue[] => {
  const profile = { id: artifact.profile.identity.id, version: artifact.profile.identity.version };
  return definitions.map(({ id }) => {
    const data = runtimeValue(artifact, id);
    const evidence = evidenceStatus(reviewedEvidence, profile, id);
    const value = data === undefined ? { status: 'unknown' as const } : present(data);
    return {
      profile, dimensionId: id, value, displayValue: display(value),
      runtimeSupport: id === 'profile.identity' || id === 'profile.authority-status'
        ? 'not-applicable'
        : data === undefined ? 'not-modelled' : id === 'round.draw-follow-up' ? 'partial' : 'executable',
      sourceStatus: evidence.sourceStatus,
      ...(evidence.caveat ? { caveat: evidence.caveat } : {}),
      provenanceIds: evidence.provenanceIds ?? artifact.profile.provenance.sources ?? [],
    };
  });
};

export const profileDimensionValue = (
  values: readonly ProfileDimensionValue[], id: RulesDimensionId,
): ProfileDimensionValue | undefined => values.find((value) => value.dimensionId === id);
