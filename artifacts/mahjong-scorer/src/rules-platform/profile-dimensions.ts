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
  /** Player-facing answer and semantic comparison key, when the reviewed matrix has one. */
  playerAnswer?: string;
  comparisonKey?: string;
  playerQualification?: string;
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

type PlayerFact = Pick<ProfileDimensionValue, 'playerAnswer' | 'comparisonKey' | 'playerQualification' | 'sourceStatus' | 'runtimeSupport'> & {
  provenanceIds: readonly string[];
};
const auditFact = (
  playerAnswer: string,
  comparisonKey: string | undefined,
  sourceStatus: SourceEvidenceStatus,
  runtimeSupport: RuntimeSupport,
  playerQualification?: string,
): PlayerFact => ({
  playerAnswer, comparisonKey, sourceStatus, runtimeSupport,
  provenanceIds: [auditReference],
  ...(playerQualification ? { playerQualification } : {}),
});

/**
 * Reviewed, profile-local answers from the Classical comparator matrix.
 * The comparison key carries meaning independently of the English wording;
 * audit prose is never compared as though it were a rule value.
 */
export const CLASSICAL_COMPARATOR_PLAYER_FACTS: Readonly<Record<string, Partial<Record<RulesDimensionId, PlayerFact>>>> = Object.freeze({
  'bmja@1.0': {
    'table.player-count': auditFact('Four players.', 'table:four-players', 'source-verified', 'executable'),
    'table.seat-model': auditFact('Players sit at East, South, West and North.', 'seats:east-south-west-north', 'source-verified', 'executable'),
    'tiles.physical-set': auditFact('The profile uses a 144-tile set, including Flowers and Seasons.', 'tiles:flowers-144', 'source-verified', 'executable'),
    'tiles.bonus-tiles': auditFact('Each Flower and Season adds 4 points. Your own-number tile gives one double; a complete bouquet gives two doubles total, including the own-tile double.', 'bonus-tiles:classical-four-points-and-profile-doubles', 'source-verified', 'executable'),
    'tiles.substitute-special': auditFact('The British rules do not use substitute tiles.', 'substitutes:none-normal-british-play', 'source-unknown', 'not-modelled'),
    'hand.structural-size': auditFact('A hand has 13 tiles while waiting and 14 when complete. A Kong uses four physical tiles but remains one set.', 'hand-size:13-waiting-14-complete-kong-is-one-set', 'source-verified', 'executable'),
    'hand.normal-winning-shape': auditFact('A normal winning hand has four sets and a pair.', 'winning-shape:four-sets-pair', 'source-verified', 'executable'),
    'play.ordinary-chow-policy': auditFact('An ordinary hand can contain at most one Chow.', 'ordinary-chows:max-one', 'source-verified', 'executable'),
    'play.exposure-model': auditFact('Showing a set changes its points. Some special hands also require concealed sets or have a separate exposed value; a concealed hand is not automatically worth double.', 'exposure:shown-sets-change-value-special-hands-own-rules', 'source-verified', 'executable'),
    'play.rob-kong': auditFact('A player may win on a tile taken from another player’s Kong. The win earns one double.', 'rob-kong:allowed-one-double', 'source-verified', 'executable'),
    'hand.irregular-special-model': auditFact('The scorer recognises named, calculated and event-based special hands.', 'special-model:named-calculated-event-hands', 'source-verified', 'executable'),
    'ready.model': auditFact('A waiting hand needs one tile to complete it. Fishing scores apply to some special hands; Original Call is a separate declaration.', 'ready:fishing-and-original-call', 'source-verified', 'partial'),
    'ready.fishing-score': auditFact('Some special hands have their own Fishing score while waiting for the winning tile.', 'fishing:bmja-hand-values', 'source-verified', 'executable'),
    'scoring.special-catalogue': auditFact('The BMJA catalogue has 18 inventoried named-hand entries, plus calculated and event-based hands.', 'catalogue:bmja-18-bindings-plus-calculated-events', 'source-verified', 'executable'),
    'scoring.special-binding': auditFact('Each BMJA special hand has its own score and any concealment requirements.', 'binding:bmja-profile-treatments', 'source-verified', 'executable'),
    'scoring.grammar': auditFact('Ordinary hands score points, then apply doubles.', 'scoring:points-and-doubles', 'source-verified', 'executable'),
    'scoring.ordinary-base': auditFact('Chows score no points. Pungs score 2/4 for minor/major exposed sets and 4/8 concealed. Kongs score 8/16 exposed and 16/32 concealed.', 'ordinary-base:classical-set-values', 'source-verified', 'executable'),
    'scoring.winner-base-bonus': auditFact('A winning hand adds 20 points; winning from the live wall adds 2 more.', 'winner-bonus:20-and-live-wall-2', 'source-verified', 'executable'),
    'scoring.multiplier-bonus-policy': auditFact('Pungs or Kongs of Dragons and relevant Winds, own bonus tiles, and complete Flower or Season bouquets add doubles. Other hand-specific doubles also apply.', 'doubles:bmja-profile-policy', 'source-verified', 'executable'),
    'scoring.limit-composition': auditFact('For fixed-value special hands, eligible Flower and Season points and doubles are scored separately from the special-hand value.', 'limit-composition:fixed-value-plus-bonus-subtotal', 'source-verified', 'executable'),
    'scoring.decomposition-policy': auditFact('If a hand fits more than one pattern, score it using the legal pattern worth the most under these rules.', 'decomposition:best-valid-profile-score', 'source-verified', 'executable'),
    'settlement.winner-payments': auditFact('Each losing player pays the winner according to the hand score.', 'winner-payments:each-loser-pays-winner', 'source-verified', 'executable'),
    'settlement.loser-to-loser': auditFact('Losing players settle score differences with each other.', 'loser-settlement:pairwise-score-differences', 'source-verified', 'executable'),
    'settlement.dealer-multiplier': auditFact('East pays or receives double.', 'dealer-payment:double', 'source-verified', 'executable'),
    'round.draw-settlement': auditFact('Nobody pays anything after a drawn hand.', 'draw-settlement:no-payments', 'source-unknown', 'executable', 'Check your table’s agreed rules for any local variation.'),
    'round.draw-follow-up': auditFact('The published rules restart as Goulash after a drawn hand; the current scorer does not switch hand mode automatically.', 'draw-follow-up:goulash-source-not-modelled', 'source-verified', 'partial', 'Published source and current scorer behaviour differ here.'),
    'progression.dealer-retention': auditFact('East stays East after an East win or a draw.', 'dealer-retention:east-win-or-draw', 'source-verified', 'executable'),
    'progression.seat-rotation': auditFact('After another player wins, the deal moves to the next seat.', 'seat-rotation:after-non-east-win', 'source-verified', 'executable'),
    'progression.prevailing-wind': auditFact('The prevailing Wind advances East, South, West, then North.', 'prevailing-wind:east-south-west-north', 'source-verified', 'executable'),
    'progression.game-end': auditFact('The game ends after the North prevailing-Wind round.', 'game-end:four-wind-cycle', 'source-verified', 'executable'),
  },
  'western-tm@0.1': {
    'table.player-count': auditFact('This profile uses four players.', 'table:four-players', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'table.seat-model': auditFact('This profile uses East, South, West and North seats.', 'seats:east-south-west-north', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'tiles.physical-set': auditFact('This profile uses a 144-tile set, including Flowers and Seasons.', 'tiles:flowers-144', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'tiles.bonus-tiles': auditFact('This profile adds 4 points for each Flower and Season and applies its profile bonus doubles.', 'bonus-tiles:classical-four-points-and-profile-doubles', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'tiles.substitute-special': auditFact('The current scorer has no substitute-tile mechanic for this profile.', 'substitutes:unmodelled', 'source-unknown', 'not-modelled', 'The profile’s ordinary source rules have not established whether substitutes are used.'),
    'hand.structural-size': auditFact('This profile uses 13 tiles while waiting and 14 when complete. A Kong uses four physical tiles but remains one set.', 'hand-size:13-waiting-14-complete-kong-is-one-set', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'hand.normal-winning-shape': auditFact('A normal winning hand in this profile has four sets and a pair.', 'winning-shape:four-sets-pair', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'play.ordinary-chow-policy': auditFact('An ordinary hand in this profile can contain at most one Chow.', 'ordinary-chows:max-one', 'source-provisional', 'executable', 'Check your table’s agreed sheet; club play may vary.'),
    'play.exposure-model': auditFact('The Companion has hand-specific exposure rules. This profile uses BMJA exposed and concealed Pung/Kong points in ordinary play.', 'exposure:shown-sets-change-value-special-hands-own-rules', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'play.rob-kong': auditFact('A player can win on a tile taken from a Kong in this profile; that win adds one double.', 'rob-kong:allowed-one-double', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'hand.irregular-special-model': auditFact('The scorer checks the Companion special-hand catalogue alongside ordinary hands.', 'special-model:named-calculated-event-hands', 'source-verified', 'executable'),
    'ready.model': auditFact('A waiting hand needs one tile to complete it. The Companion gives winning and Fishing values for its special hands; ordinary-play details remain provisional.', 'ready:companion-winning-and-fishing', 'source-verified', 'partial', 'The Companion catalogue is source-verified; ordinary-play details are not.'),
    'ready.fishing-score': auditFact('The Companion gives profile-specific Fishing scores for its named special hands.', 'fishing:western-tm-hand-values', 'source-verified', 'executable'),
    'scoring.special-catalogue': auditFact('The Companion catalogue contains 84 named hands in 85 scoring entries.', 'catalogue:western-tm-84-names-85-bindings', 'source-verified', 'executable'),
    'scoring.special-binding': auditFact('Each Companion hand has its own name, score and any exposure requirements.', 'binding:western-tm-profile-treatments', 'source-verified', 'executable'),
    'scoring.grammar': auditFact('The current scorer uses points and doubles.', 'scoring:points-and-doubles', 'source-provisional', 'executable', 'The intended ordinary-play source is not fully established.'),
    'scoring.ordinary-base': auditFact('The current scorer uses BMJA exposed and concealed Pung/Kong points; the ordinary source has not confirmed them.', 'ordinary-base:classical-set-values', 'source-provisional', 'executable', 'Check the table’s agreed ordinary-play rules.'),
    'scoring.winner-base-bonus': auditFact('This profile adds 20 points for a win and 2 more for a live-wall win.', 'winner-bonus:20-and-live-wall-2', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'scoring.multiplier-bonus-policy': auditFact('This profile uses BMJA-style ordinary doubles; Companion hands have their own scores and Fishing values.', 'doubles:bmja-profile-policy', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'scoring.limit-composition': auditFact('The Companion has hand-specific scoring; how its fixed values combine with bonus tiles depends on the binding.', 'limit-composition:western-tm-profile-treatment', 'source-verified', 'executable'),
    'scoring.decomposition-policy': auditFact('The profile uses the best-scoring valid interpretation under its hand rules.', 'decomposition:best-valid-profile-score', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'settlement.winner-payments': auditFact('This profile makes each losing player pay the winner according to the hand score.', 'winner-payments:each-loser-pays-winner', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'settlement.loser-to-loser': auditFact('This profile settles score differences between losing players.', 'loser-settlement:pairwise-score-differences', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'settlement.dealer-multiplier': auditFact('This profile makes East pay or receive double.', 'dealer-payment:double', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'round.draw-settlement': auditFact('Nobody pays anything after a drawn hand in this profile.', 'draw-settlement:no-payments', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'round.draw-follow-up': auditFact('East stays East and the next hand is played normally in this profile.', 'draw-follow-up:east-retained-normal-hand', 'source-provisional', 'partial', 'Check your table’s agreed rules for local variations.'),
    'progression.dealer-retention': auditFact('This profile keeps East after an East win or a draw.', 'dealer-retention:east-win-or-draw', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'progression.seat-rotation': auditFact('This profile moves the deal after another player wins.', 'seat-rotation:after-non-east-win', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'progression.prevailing-wind': auditFact('This profile advances the prevailing Wind East, South, West, then North.', 'prevailing-wind:east-south-west-north', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
    'progression.game-end': auditFact('This profile ends after the North prevailing-Wind round.', 'game-end:four-wind-cycle', 'source-provisional', 'executable', 'Check your table’s agreed rules for local variations.'),
  },
  'outside-the-box@0.1': {
    'table.player-count': auditFact('Four players.', 'table:four-players', 'verified-club', 'executable'),
    'table.seat-model': auditFact('Players sit at East, South, West and North.', 'seats:east-south-west-north', 'verified-club', 'executable'),
    'tiles.physical-set': auditFact('The profile uses a 144-tile set, including Flowers and Seasons.', 'tiles:flowers-144', 'verified-club', 'executable'),
    'tiles.bonus-tiles': auditFact('Flowers and Seasons are used as bonus tiles; the current scorer adds 4 points for each and applies the profile’s bonus doubles.', 'bonus-tiles:classical-four-points-and-profile-doubles', 'verified-club', 'executable', 'Check the club sheet for the complete bonus treatment.'),
    'tiles.substitute-special': auditFact('Goulash uses four blank substitute tiles; ordinary play does not use them.', 'substitutes:four-blanks-goulash-only', 'verified-club', 'executable'),
    'hand.structural-size': auditFact('A hand has 13 tiles while waiting and 14 when complete. A Kong uses four physical tiles but remains one set.', 'hand-size:13-waiting-14-complete-kong-is-one-set', 'verified-club', 'executable'),
    'hand.normal-winning-shape': auditFact('A normal winning hand has four sets and a pair.', 'winning-shape:four-sets-pair', 'verified-club', 'executable'),
    'play.ordinary-chow-policy': auditFact('The current Bramhall scorer allows at most one Chow in an ordinary hand.', 'ordinary-chows:max-one', 'source-unknown', 'executable', 'Check with your table whether ordinary hands may contain more than one Chow.'),
    'play.exposure-model': auditFact('Some club special hands require concealed sets or score less when exposed. Ask your table how exposure affects ordinary sets.', undefined, 'source-unknown', 'executable'),
    'play.rob-kong': auditFact('A player may win on a tile taken from another player’s Kong. The win earns one double.', 'rob-kong:allowed-one-double', 'verified-club', 'executable'),
    'hand.irregular-special-model': auditFact('The profile includes British, Western-derived and club-specific special hands.', 'special-model:named-calculated-event-hands', 'verified-club', 'executable'),
    'ready.model': auditFact('A waiting hand needs one tile to complete it. The club catalogue gives winning and Fishing values for its special hands.', 'ready:club-winning-and-fishing', 'verified-club', 'partial'),
    'ready.fishing-score': auditFact('The club catalogue gives profile-specific Fishing scores for its named special hands.', 'fishing:otb-hand-values', 'verified-club', 'executable'),
    'scoring.special-catalogue': auditFact('The club catalogue lists 33 unique named special hands.', 'catalogue:otb-33-named-hands', 'verified-club', 'executable'),
    'scoring.special-binding': auditFact('Each club special hand has its own score and any exposure requirements.', 'binding:otb-profile-treatments', 'verified-club', 'executable'),
    'scoring.grammar': auditFact('Ordinary hands score points, then apply doubles.', 'scoring:points-and-doubles', 'verified-club', 'executable'),
    'scoring.ordinary-base': auditFact('Chows score no points. Pungs score 2/4 for minor/major exposed sets and 4/8 concealed. Kongs score 8/16 exposed and 16/32 concealed.', 'ordinary-base:classical-set-values', 'verified-club', 'executable'),
    'scoring.winner-base-bonus': auditFact('A winning hand adds 20 points; a live-wall win adds 2 more.', 'winner-bonus:20-and-live-wall-2', 'verified-club', 'executable'),
    'scoring.multiplier-bonus-policy': auditFact('The profile adds club-specific doubles for major Dragon and Wind sets, including Big Three Dragons and Big Four Joys.', 'doubles:otb-profile-policy', 'verified-club', 'executable'),
    'scoring.limit-composition': auditFact('A fixed-value special hand can still score eligible Flower and Season points separately, even above the hand limit.', 'limit-composition:fixed-value-plus-bonus-subtotal', 'verified-club', 'executable'),
    'scoring.decomposition-policy': auditFact('If a hand fits more than one pattern, score it using the legal pattern worth the most under these rules.', 'decomposition:best-valid-profile-score', 'verified-club', 'executable'),
    'settlement.winner-payments': auditFact('Each losing player pays the winner according to the hand score.', 'winner-payments:each-loser-pays-winner', 'verified-club', 'executable'),
    'settlement.liability': auditFact('The club has specific liability incidents, including Cannon and the “No choice!” exception.', 'liability:otb-club-incidents', 'verified-club', 'executable'),
    'settlement.loser-to-loser': auditFact('Losing players settle score differences with each other.', 'loser-settlement:pairwise-score-differences', 'verified-club', 'executable'),
    'settlement.dealer-multiplier': auditFact('East pays or receives double.', 'dealer-payment:double', 'verified-club', 'executable'),
    'round.draw-settlement': auditFact('Nobody pays anything after a drawn hand.', 'draw-settlement:no-payments', 'verified-club', 'executable'),
    'round.draw-follow-up': auditFact('East stays East and the next hand is Goulash.', 'draw-follow-up:east-retained-goulash', 'verified-club', 'executable'),
    'progression.dealer-retention': auditFact('East stays East after an East win or a draw.', 'dealer-retention:east-win-or-draw', 'verified-club', 'executable'),
    'progression.seat-rotation': auditFact('After another player wins, the deal moves to the next seat.', 'seat-rotation:after-non-east-win', 'verified-club', 'executable'),
    'progression.prevailing-wind': auditFact('The prevailing Wind advances East, South, West, then North.', 'prevailing-wind:east-south-west-north', 'verified-club', 'executable'),
    'progression.game-end': auditFact('The current profile ends after the North prevailing-Wind round.', 'game-end:four-wind-cycle', 'verified-club', 'executable'),
  },
  'buzzard-2000@0.1': {
    'table.player-count': auditFact('Four players.', 'table:four-players', 'source-verified', 'executable'),
    'table.seat-model': auditFact('Players sit at East, South, West and North.', 'seats:east-south-west-north', 'source-verified', 'executable'),
    'tiles.physical-set': auditFact('The profile uses a 144-tile set, including Flowers and Seasons.', 'tiles:flowers-144', 'source-verified', 'executable'),
    'tiles.bonus-tiles': auditFact('Flowers and Seasons are used as bonus tiles; the Buzzard policy can award doubles for your own tile and a complete bouquet.', 'bonus-tiles:buzzard-bonus-policy', 'source-verified', 'executable'),
    'tiles.substitute-special': auditFact('The available Buzzard source does not establish whether substitute tiles are used in ordinary play.', undefined, 'source-unknown', 'not-modelled'),
    'hand.structural-size': auditFact('A hand has 13 tiles while waiting and 14 when complete. A Kong uses four physical tiles but remains one set.', 'hand-size:13-waiting-14-complete-kong-is-one-set', 'source-verified', 'executable'),
    'hand.normal-winning-shape': auditFact('A normal winning hand has four sets and a pair.', 'winning-shape:four-sets-pair', 'source-verified', 'executable'),
    'play.ordinary-chow-policy': auditFact('Ordinary hands may contain more than one Chow.', 'ordinary-chows:multiple-allowed', 'source-verified', 'executable'),
    'play.exposure-model': auditFact('Showing a set changes its points. Some Buzzard hands have specific concealed or exposed set requirements; a concealed hand is not automatically worth double.', 'exposure:shown-sets-change-value-special-hands-own-rules', 'source-verified', 'executable'),
    'play.rob-kong': auditFact('A player may win on a tile taken from another player’s Kong. The win earns one double.', 'rob-kong:allowed-one-double', 'source-verified', 'executable'),
    'hand.irregular-special-model': auditFact('Buzzard adds source-defined limit hands to the normal hand rules.', 'special-model:named-calculated-event-hands', 'source-verified', 'executable'),
    'ready.model': auditFact('A waiting hand needs one tile to complete it. A player may declare Calling; a completed Standing Hand adds 100 points.', 'ready:calling-standing-hand', 'source-verified', 'executable'),
    'ready.fishing-score': auditFact('Buzzard uses Calling and Standing Hand, not the BMJA/T&M style of special-hand Fishing scores.', 'ready:calling-standing-not-fishing', 'source-verified', 'executable'),
    'scoring.special-catalogue': auditFact('The Buzzard source lists 10 named limit hands.', 'catalogue:buzzard-10-limit-hands', 'source-verified', 'executable'),
    'scoring.special-binding': auditFact('Buzzard gives its limit hands their own names and limit treatment.', 'binding:buzzard-profile-treatments', 'source-verified', 'executable'),
    'scoring.grammar': auditFact('Ordinary hands score points, then apply doubles.', 'scoring:points-and-doubles', 'source-verified', 'executable'),
    'scoring.ordinary-base': auditFact('The source uses the Classical exposed and concealed Pung/Kong point values.', 'ordinary-base:classical-set-values', 'source-verified', 'executable'),
    'scoring.winner-base-bonus': auditFact('A winning hand adds 20 points; a live-wall win adds 2 more.', 'winner-bonus:20-and-live-wall-2', 'source-verified', 'executable'),
    'scoring.multiplier-bonus-policy': auditFact('The profile keeps the Classical scoring core and adds Buzzard-specific bonuses, including Standing Hand.', 'doubles:buzzard-profile-policy', 'source-verified', 'executable'),
    'scoring.limit-composition': auditFact('The profile uses source-defined limit hands; the table limit is configurable.', 'limit-composition:buzzard-limit-hands', 'source-verified', 'executable'),
    'scoring.decomposition-policy': auditFact('If a hand fits more than one pattern, score it using the legal pattern worth the most under these rules.', 'decomposition:best-valid-profile-score', 'source-verified', 'executable'),
    'settlement.winner-payments': auditFact('Each losing player pays the winner according to the hand score unless a profile liability rule changes who pays.', 'winner-payments:each-loser-pays-winner', 'source-verified', 'executable'),
    'settlement.liability': auditFact('A dangerous discard on a source-defined hand can make the discarder pay the full limit to each other player.', 'liability:buzzard-dangerous-discard', 'source-verified', 'executable'),
    'settlement.loser-to-loser': auditFact('Losing players settle score differences with each other.', 'loser-settlement:pairwise-score-differences', 'source-verified', 'executable'),
    'settlement.dealer-multiplier': auditFact('East pays or receives double.', 'dealer-payment:double', 'source-verified', 'executable'),
    'round.draw-settlement': auditFact('A drawn hand is dead: nobody scores or pays.', 'draw-settlement:no-payments', 'source-verified', 'executable'),
    'round.draw-follow-up': auditFact('East stays East and the next hand is played normally.', 'draw-follow-up:east-retained-normal-hand', 'source-verified', 'executable'),
    'progression.dealer-retention': auditFact('East stays East after an East win or a draw.', 'dealer-retention:east-win-or-draw', 'source-verified', 'executable'),
    'progression.seat-rotation': auditFact('After another player wins, the deal moves to the next seat.', 'seat-rotation:after-non-east-win', 'source-verified', 'executable'),
    'progression.prevailing-wind': auditFact('The prevailing Wind advances East, South, West, then North.', 'prevailing-wind:east-south-west-north', 'source-verified', 'executable'),
    'progression.game-end': auditFact('The game consists of four rounds, one for each prevailing Wind.', 'game-end:four-wind-cycle', 'source-verified', 'executable'),
  },
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
    const playerFact = CLASSICAL_COMPARATOR_PLAYER_FACTS[`${profile.id}@${profile.version}`]?.[id];
    const value = data !== undefined
      ? present(data)
      : playerFact
        ? present({ reviewedMeaning: playerFact.comparisonKey ?? 'unresolved' })
        : { status: 'unknown' as const };
    return {
      profile, dimensionId: id, value, displayValue: playerFact?.playerAnswer ?? display(value),
      runtimeSupport: playerFact?.runtimeSupport ?? (id === 'profile.identity' || id === 'profile.authority-status'
        ? 'not-applicable'
        : data === undefined ? 'not-modelled' : id === 'round.draw-follow-up' ? 'partial' : 'executable'),
      sourceStatus: playerFact?.sourceStatus ?? evidence.sourceStatus,
      ...(evidence.caveat ? { caveat: evidence.caveat } : {}),
      ...(playerFact?.playerAnswer ? { playerAnswer: playerFact.playerAnswer } : {}),
      ...(playerFact?.comparisonKey ? { comparisonKey: playerFact.comparisonKey } : {}),
      ...(playerFact?.playerQualification ? { playerQualification: playerFact.playerQualification } : {}),
      provenanceIds: playerFact?.provenanceIds ?? evidence.provenanceIds ?? artifact.profile.provenance.sources ?? [],
    };
  });
};

export const profileDimensionValue = (
  values: readonly ProfileDimensionValue[], id: RulesDimensionId,
): ProfileDimensionValue | undefined => values.find((value) => value.dimensionId === id);
