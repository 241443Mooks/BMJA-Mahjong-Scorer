import type { EvidenceClaim, ProfileTreatment, SemanticSubject } from '../../rules-platform/truth-model';
import { versioned } from './records';

type ProfileId = 'bmja' | 'outside-the-box' | 'buzzard-2000';
type Row = {
  profile: ProfileId;
  sourceId: 'bmja-settlement' | 'bmja-qa' | 'bmja-approved-site' | 'otb-guide-2026-09' | 'buzzard-2000-classical';
  claim: string;
  section: string;
  status: 'verified' | 'verified-club';
  page?: string;
  url?: string;
};
type Family = { id: string; rows: readonly Row[]; unresolvedProfiles?: readonly ProfileId[] };

const bmjaSettlement = (claim: string, section: string): Row => ({ profile: 'bmja', sourceId: 'bmja-settlement', claim, section, status: 'verified', url: 'https://mahjongbritishrules.wordpress.com/scoring/settling-up/' });
const bmjaQa = (claim: string, section: string): Row => ({ profile: 'bmja', sourceId: 'bmja-qa', claim, section, status: 'verified', url: 'https://mahjongbritishrules.wordpress.com/questions/playing-the-game/' });
const bmjaPlaying = (claim: string, section: string): Row => ({ profile: 'bmja', sourceId: 'bmja-approved-site', claim, section, status: 'verified', url: 'https://mahjongbritishrules.wordpress.com/the-game/preparing-to-play/' });
const otb = (claim: string, section: string): Row => ({ profile: 'outside-the-box', sourceId: 'otb-guide-2026-09', claim, section, status: 'verified-club' });
const buzzard = (claim: string, section: string, page: string): Row => ({ profile: 'buzzard-2000', sourceId: 'buzzard-2000-classical', claim, section, page, status: 'verified' });

const families: readonly Family[] = [
  { id: 'rule.classical.loser-pays-winner-score', rows: [
    bmjaSettlement('Each loser pays the winner the winner’s hand score.', 'Paying the winner'),
    otb('Each loser pays the winner the winner’s Mah Jong score.', 'Ordinary settlement — winner payments'),
    buzzard('Each loser pays the winner the winner’s hand score.', 'SETTLEMENT OF SCORES', '8'),
  ] },
  { id: 'rule.classical.nonwinners-settle-pairwise-score-differences', rows: [
    bmjaSettlement('The non-winners settle pairwise differences between their hand scores.', 'Paying the other players'),
    otb('The non-winners settle pairwise differences between their scores.', 'Ordinary settlement — non-winner payments'),
    buzzard('The non-winners settle pairwise differences between their scores.', 'SETTLEMENT OF SCORES', '8'),
  ] },
  { id: 'rule.classical.east-payment-doubles', rows: [
    bmjaSettlement('A payment doubles whenever East is one side of that payment.', 'Paying the winner; Paying the other players'),
    otb('A payment doubles whenever East is one side of that payment.', 'Ordinary settlement — East treatment'),
    buzzard('A payment doubles whenever East is one side of that payment.', 'SETTLEMENT OF SCORES', '8'),
  ] },
  { id: 'rule.classical.draw-retains-east', rows: [
    bmjaQa('If a game is drawn, East does not change.', 'Winds — When does East Wind move to another player?'),
    otb('After a draw, East remains East.', 'Drawn game / round-state'),
    buzzard('After a dead hand, East remains East.', 'Rules 11–14 — dead hand', '7'),
  ] },
  { id: 'rule.classical.draw-has-no-settlement', rows: [
    otb('A draw produces no score or settlement.', 'Drawn game / round-state'),
    buzzard('A dead hand has no scoring.', 'Rules 11–14 — dead hand', '7'),
  ], unresolvedProfiles: ['bmja'] },
  { id: 'rule.classical.east-retained-after-east-win', rows: [
    bmjaQa('If East declares Mah-Jong, East remains East.', 'Winds — When does East Wind move to another player?'),
    buzzard('If East wins, East remains East.', 'Rules 11–14 — East wins', '7'),
  ], unresolvedProfiles: ['outside-the-box'] },
  { id: 'rule.classical.non-east-win-rotates-seats', rows: [
    bmjaQa('After a non-East player wins, South becomes East and the seat Winds rotate.', 'And East Wind'),
    buzzard('After a non-East player wins, South becomes East and the seat Winds rotate.', 'Rules 11–14 — East loses', '7'),
  ], unresolvedProfiles: ['outside-the-box'] },
  { id: 'rule.classical.all-players-serve-and-lose-east-before-prevailing-advances', rows: [
    bmjaQa('The prevailing Wind advances after each player has served as East and subsequently lost East.', 'Winds — When does the prevailing Wind change?'),
    buzzard('The prevailing Wind advances after each player has held and lost East.', 'Rules 11–14 — prevailing Wind', '7'),
  ], unresolvedProfiles: ['outside-the-box'] },
  { id: 'rule.classical.prevailing-winds-east-south-west-north', rows: [
    bmjaPlaying('Prevailing Winds advance East, then South, West, and North.', 'Changing the prevailing Wind'),
    buzzard('Prevailing Winds progress East, South, West, and North.', 'Rules 11–14 — prevailing Wind', '7'),
  ], unresolvedProfiles: ['outside-the-box'] },
  { id: 'rule.classical.full-game-four-prevailing-wind-rounds', rows: [
    bmjaPlaying('A full traditional game continues through the East, South, West, and North prevailing-Wind rounds.', 'Determine the prevailing Wind; Changing the prevailing Wind'),
    buzzard('A complete traditional game comprises four prevailing-Wind rounds.', 'Rules 11–14 — complete game', '7'),
  ], unresolvedProfiles: ['outside-the-box'] },
  { id: 'rule.otb.goulash-round-transition', rows: [
    otb('Normal followed by a winner remains Normal; Normal followed by a draw enters Goulash; Goulash followed by a winner returns to Normal; Goulash followed by a draw remains Goulash.', 'Goulash / round transitions'),
  ] },
  { id: 'rule.otb.incorrect-tile-count-consequences', rows: [
    otb('A wrong-count hand cannot win; a too-few-tile hand may retain a score, while a too-many-tile hand scores zero.', 'Incorrect tile count'),
  ] },
  { id: 'rule.otb.false-discard-name-mahjong-liability', rows: [
    otb('When a false discard name leads to Mah Jong, play stops, the discarder pays the winner all three loser shares, and no other settlement occurs.', 'False discard name — Mah Jong result'),
  ] },
  { id: 'rule.otb.false-discard-name-claimed-tile-penalty-recipient', rows: [], unresolvedProfiles: ['outside-the-box'] },
  { id: 'rule.otb.false-mahjong-exposure-penalty', rows: [
    otb('A false Mah Jong call with no exposed hand has no penalty; after any hand is exposed, the declarer pays each other player half the table limit.', 'False Mah Jong'),
  ] },
  { id: 'rule.otb.wrong-tile-claim-timely-correction', rows: [
    otb('A wrong tile claim corrected before the next draw carries no penalty.', 'Wrong tile claim — timely correction'),
  ] },
  { id: 'rule.otb.wrong-tile-claim-prevents-mahjong', rows: [
    otb('If a wrong tile claim is not corrected before the next draw, the claimant cannot Mahjong.', 'Wrong tile claim — late correction'),
  ] },
  { id: 'rule.otb.cannon-liability-suppresses-pairwise-settlement', rows: [
    otb('When Cannon liability applies, the cannoner pays all winner-payment shares and ordinary loser-to-loser settlement is suppressed.', 'Cannon'),
  ] },
  { id: 'rule.otb.no-choice-cancels-cannon-liability', rows: [
    otb('Accepted No choice! evidence cancels Cannon liability.', 'No choice!'),
  ] },
  { id: 'rule.buzzard-2000.incomplete-wind-dragon-limit-settles-as-nonwinner', rows: [
    buzzard('A qualifying incomplete Four-Wind or Three-Dragon result can score the limit against the other losers while still settling normally against the actual winner.', 'Limit-hand non-winner settlement', '11–12'),
  ] },
  { id: 'rule.buzzard-2000.dangerous-discard-liability-suppresses-pairwise-settlement', rows: [
    buzzard('For source-defined dangerous completion, the liable discarder covers all winner payments and loser-to-loser settlement is suppressed.', 'ERRORS AND PENALTIES — dangerous discard', '12'),
  ] },
  { id: 'rule.buzzard-2000.false-mahjong-exposure-penalty', rows: [
    buzzard('A fully exposed invalid Mahjong requires the declarer to pay twice the table limit to each other player; if the hand is not fully exposed, the call may be withdrawn without that penalty.', 'ERRORS AND PENALTIES — false Mahjong', '12'),
  ] },
  { id: 'rule.buzzard-2000.incorrect-tile-count-settlement', rows: [
    buzzard('A wrong-count hand cannot win; a too-many-tile hand’s own score is not deducted before settlement, while a too-few-tile hand’s own score is deducted normally.', 'Rule 12 — incorrect tile count', '7'),
  ] },
];

export const classicalSettlementProgressionIncident440c4Inventory = families.map(({ id }) => id);
export const classicalSettlementProgressionIncident440c4Unresolved = families.flatMap(({ id: subjectId, unresolvedProfiles = [] }) => unresolvedProfiles.map((profile) => ({ subjectId, profile })));

const profileRefs = {
  bmja: { id: 'bmja', version: '1.0' },
  'outside-the-box': { id: 'outside-the-box', version: '0.1' },
  'buzzard-2000': { id: 'buzzard-2000', version: '0.1' },
} as const;
const allProfiles = Object.keys(profileRefs) as ProfileId[];

const claims = families.flatMap(({ id: subjectId, rows }) => rows.map((row) => {
  const claimId = `evidence.${subjectId}.${row.profile}`;
  const locator = row.sourceId === 'buzzard-2000-classical'
    ? { kind: 'publication' as const, title: 'Buzzard 2000 Classical rules, retained original source snapshot', year: 2000, page: row.page, section: row.section }
    : row.sourceId === 'otb-guide-2026-09'
      ? { kind: 'club-material' as const, title: 'Outside the Box guide supplied by Rachel', version: '2026-09', date: '2026-09-09', section: row.section }
      : { kind: 'url' as const, url: row.url!, section: row.section };
  const record: EvidenceClaim = {
    claimId, subjectId, sourceId: row.sourceId, locator, status: row.status,
    claim: row.claim, checkedOn: '2026-09-30', supportsProfile: profileRefs[row.profile],
  };
  return versioned(claimId, record);
}));

export const classicalSettlementProgressionIncident440c4Subjects = families.map(({ id }) => versioned<SemanticSubject>(id, { id, kind: 'rule' }));
export const classicalSettlementProgressionIncident440c4Claims = claims;
export const classicalSettlementProgressionIncident440c4Treatments = claims.map(({ record }) => {
  const treatmentId = `${record.supportsProfile!.id}@${record.supportsProfile!.version}:${record.subjectId}`;
  const treatment: ProfileTreatment = {
    treatmentId, profile: record.supportsProfile!, subjectId: record.subjectId,
    runtimeState: { kind: 'migration-incomplete' }, evidenceClaimIds: [record.claimId],
  };
  return versioned(treatmentId, treatment);
});

export const classicalSettlementProgressionIncident440c4Coverage = families.flatMap(({ id, rows, unresolvedProfiles = [] }) =>
  allProfiles.map((profile) => {
    const row = rows.find((candidate) => candidate.profile === profile);
    const unresolved = unresolvedProfiles.includes(profile);
    return {
      subjectId: id,
      profile: profileRefs[profile],
      evidenceStatus: (row ? 'source-ready' : unresolved ? 'source-unresolved' : 'not-applicable') as 'source-ready' | 'source-unresolved' | 'not-applicable',
      recordStatus: (row ? 'migrated' : unresolved ? 'not-migrated' : 'not-applicable') as 'migrated' | 'not-migrated' | 'not-applicable',
      treatmentStatus: (row ? 'runtime-edge-migration-incomplete' : 'not-applicable') as 'runtime-edge-migration-incomplete' | 'present-not-modelled' | 'not-applicable',
    };
  }),
);
