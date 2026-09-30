import type { EvidenceClaim, ProfileTreatment, SemanticSubject } from '../../rules-platform/truth-model';
import { versioned } from './records';

type ProfileKey = 'bmja' | 'outside-the-box' | 'buzzard-2000';
type ClaimRow = { profile: ProfileKey; text: string; section: string; page?: string; locatorUrl?: string };
type Family = { id: string; claims: Partial<Record<ProfileKey, ClaimRow>> };

const bmja = (text: string, section: string): ClaimRow => ({ profile: 'bmja', text, section });
const otb = (text: string, section: string, locatorUrl?: string): ClaimRow => ({ profile: 'outside-the-box', text, section, locatorUrl });
const buzzard = (text: string, page: string, section: string): ClaimRow => ({ profile: 'buzzard-2000', text, page, section });

const families: readonly Family[] = [
  { id: 'rule.classical.chow-base-scoring', claims: {
    bmja: bmja('An ordinary Chow scores no base points, whether exposed or concealed.', 'Chows'),
    'outside-the-box': otb('Ordinary Chows score no base points.', 'Issue #88 body §1 Ordinary scoring base > Basic set values > Chows'),
    'buzzard-2000': buzzard('An ordinary Chow scores no points.', '9–10', 'THE SCORES AND HOW TO CALCULATE THEM — ordinary hand values'),
  } },
  { id: 'rule.classical.pung-base-scoring', claims: {
    bmja: bmja('An exposed minor-tile Pung scores 2, a concealed minor-tile Pung 4, an exposed major-tile Pung 4, and a concealed major-tile Pung 8.', 'Pungs'),
    'outside-the-box': otb('Pung base scoring is 2/4 for exposed/concealed minor tiles and 4/8 for exposed/concealed major tiles.', 'Issue #88 body §1 Ordinary scoring base > Basic set values > Pungs'),
    'buzzard-2000': buzzard('Pung base scoring is 2/4 for exposed/concealed simple tiles and 4/8 for exposed/concealed major tiles.', '9–10', 'THE SCORES AND HOW TO CALCULATE THEM — ordinary hand values'),
  } },
  { id: 'rule.classical.kong-base-scoring', claims: {
    bmja: bmja('An exposed minor-tile Kong scores 8, a concealed minor-tile Kong 16, an exposed major-tile Kong 16, and a concealed major-tile Kong 32.', 'Kongs'),
    'outside-the-box': otb('Kong base scoring is 8/16 for exposed/concealed minor tiles and 16/32 for exposed/concealed major tiles.', 'Issue #88 body §1 Ordinary scoring base > Basic set values > Kongs'),
    'buzzard-2000': buzzard('Kong base scoring is 8/16 for exposed/concealed simple tiles and 16/32 for exposed/concealed major tiles.', '9–10', 'THE SCORES AND HOW TO CALCULATE THEM — ordinary hand values'),
  } },
  { id: 'rule.classical.qualifying-honour-pair-scoring', claims: {
    bmja: bmja('A pair of Dragons, the player’s own Wind, or the prevailing Wind scores 2 points; a Wind pair that is both own and prevailing scores 4.', 'Pairs of honour tiles'),
    'outside-the-box': otb('A qualifying Dragon, own-Wind, or prevailing-Wind pair scores 2 points.', 'Issue #88 body §1 Ordinary scoring base > Basic set values > Pair of Dragons / own Wind / prevailing Wind'),
    'buzzard-2000': buzzard('A Dragon pair, own-Wind pair, or round-Wind pair scores 2 points.', '9–10', 'THE SCORES AND HOW TO CALCULATE THEM — ordinary hand values'),
  } },
  { id: 'rule.classical.flower-season-base-scoring', claims: {
    bmja: bmja('Each Flower or Season scores 4 points.', 'Flowers and Seasons'),
    'outside-the-box': otb('Each Flower or Season scores 4 points.', 'Issue #88 body §1 Ordinary scoring base > Basic set values > Flower / Season'),
    'buzzard-2000': buzzard('Each Flower or Season scores 4 points.', '9–10', 'THE SCORES AND HOW TO CALCULATE THEM — ordinary hand values'),
  } },
  { id: 'rule.classical.mahjong-winner-bonus', claims: {
    bmja: bmja('The winner receives 20 points for going Mah-Jong.', 'For going Mah-Jong'),
    'outside-the-box': otb('The winner receives 20 points for going Mah-Jong.', 'Issue #88 body §1 Ordinary scoring base > Winner bonuses > Mah Jong'),
    'buzzard-2000': buzzard('The winner receives a 20-point Mah-Jong bonus.', '10', 'BONUS SCORES'),
  } },
  { id: 'rule.classical.live-wall-self-draw-winner-bonus', claims: {
    bmja: bmja('The winner receives 2 additional points when the winning tile is drawn from the live wall rather than the Kong box.', 'For going Mah-Jong'),
    'outside-the-box': otb('The winner receives 2 additional points for a live-wall draw.', 'Issue #88 body §1 Ordinary scoring base > Winner bonuses > winning tile drawn from wall'),
  } },
  { id: 'rule.buzzard-2000.self-draw-winner-bonus', claims: {
    'buzzard-2000': buzzard('The winner receives 2 points for a self-draw.', '10', 'BONUS SCORES — self-draw'),
  } },
  { id: 'rule.classical.dragon-set-double', claims: {
    bmja: bmja('A Pung or Kong of Dragons doubles the score.', 'Doubling for all players — Dragons'),
    'outside-the-box': otb('A Pung or Kong of any Dragon doubles the score.', 'Issue #88 body §1 Ordinary scoring base > Doubles for all players shown in the guide > any Dragon'),
    'buzzard-2000': buzzard('A Pung or Kong of any Dragon doubles the score.', '10', 'DOUBLES'),
  } },
  { id: 'rule.classical.own-wind-set-double', claims: {
    bmja: bmja('A Pung or Kong of the player’s own Wind doubles the score.', 'Doubling for all players — own Wind'),
    'outside-the-box': otb('A Pung or Kong of the player’s own Wind doubles the score.', 'Issue #88 body §1 Ordinary scoring base > Doubles for all players shown in the guide > own Wind'),
    'buzzard-2000': buzzard('A Pung or Kong of the player’s own Wind doubles the score.', '10', 'DOUBLES'),
  } },
  { id: 'rule.classical.prevailing-wind-set-double', claims: {
    bmja: bmja('A Pung or Kong of the prevailing Wind doubles the score.', 'Doubling for all players — prevailing Wind'),
    'outside-the-box': otb('A Pung or Kong of the prevailing Wind doubles the score.', 'Issue #88 body §1 Ordinary scoring base > Doubles for all players shown in the guide > prevailing Wind'),
    'buzzard-2000': buzzard('A Pung or Kong of the Wind of the Round doubles the score.', '10', 'DOUBLES'),
  } },
  { id: 'rule.classical.own-flower-season-double', claims: {
    bmja: bmja('Having the player’s own Flower or own Season doubles the score.', 'Doubling for all players — own Flower and own Season'),
    'outside-the-box': otb('Having the player’s own Flower or own Season doubles the score.', 'Issue #88 body §1 Ordinary scoring base > Doubles for all players shown in the guide > own Flower/Season'),
    'buzzard-2000': buzzard('Having the player’s own Season or own Flower doubles the score.', '10', 'DOUBLES'),
  } },
  { id: 'rule.classical.complete-flower-season-set-double', claims: {
    bmja: bmja('A complete set of Flowers or of Seasons doubles twice, including the corresponding own-tile double.', 'Doubling for all players — complete Flowers and complete Seasons'),
    'outside-the-box': otb('A complete set of Flowers or of Seasons doubles twice, including the corresponding own-tile double.', 'Issue #88 body §1 Ordinary scoring base > Doubles for all players shown in the guide > all four Flowers / all four Seasons'),
  } },
  { id: 'rule.buzzard-2000.complete-flower-season-set-double', claims: {
    'buzzard-2000': buzzard('Four Flowers or four Seasons receive an eightfold complete-set treatment; the source states that doubles are cumulative and separately lists the own-tile double.', '10–11', 'DOUBLES; NOTES ON SCORING'),
  } },
  { id: 'rule.classical.ordinary-table-cap', claims: {
    bmja: bmja('The ordinary final score is capped at the table limit, normally 1,000 points.', 'The limit'),
    'outside-the-box': otb('Ordinary hands are capped at the configured table limit.', 'Pass 88C confirmed club rule > ordinary score limit', 'https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/88#issuecomment-5651104307'),
  } },
  { id: 'rule.buzzard-2000.ordinary-table-limit', claims: {
    'buzzard-2000': buzzard('The table agrees a maximum score; 600 points is given as an example rather than a required universal value.', '8', 'THE LIMIT'),
  } },
];

const profileRefs = {
  bmja: { id: 'bmja', version: '1.0' },
  'outside-the-box': { id: 'outside-the-box', version: '0.1' },
  'buzzard-2000': { id: 'buzzard-2000', version: '0.1' },
} as const;

const evidence = families.flatMap(({ id: subjectId, claims }) => Object.values(claims).map((row) => {
  const claimId = `evidence.${subjectId}.${row.profile}`;
  const locator = row.profile === 'bmja'
    ? { kind: 'url' as const, url: 'https://mahjongbritishrules.wordpress.com/scoring/working-out-the-scores/', section: row.section }
    : row.profile === 'outside-the-box'
      ? { kind: 'url' as const, url: row.locatorUrl ?? 'https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/88', section: row.section }
      : { kind: 'publication' as const, title: 'Buzzard 2000 Classical rules, retained original source snapshot', year: 2000, page: row.page, section: row.section };
  const record: EvidenceClaim = {
    claimId,
    subjectId,
    sourceId: row.profile === 'bmja' ? 'bmja-scoring' : row.profile === 'outside-the-box' ? 'otb-guide-2026-09' : 'buzzard-2000-classical',
    locator,
    status: row.profile === 'outside-the-box' ? 'verified-club' : 'verified',
    claim: row.text,
    checkedOn: '2026-09-30',
    supportsProfile: profileRefs[row.profile],
  };
  return versioned(claimId, record);
}));

export const classicalOrdinaryFoundationSubjects = families.map(({ id }) =>
  versioned<SemanticSubject>(id, { id, kind: 'rule' }),
);

export const classicalOrdinaryFoundationClaims = evidence;

export const classicalOrdinaryFoundationTreatments = families.flatMap(({ id: subjectId, claims }) =>
  Object.keys(claims).map((profile) => {
    const profileKey = profile as ProfileKey;
    const treatmentId = `${profileRefs[profileKey].id}@${profileRefs[profileKey].version}:${subjectId}`;
    const claimId = `evidence.${subjectId}.${profileKey}`;
    const record: ProfileTreatment = {
      treatmentId,
      profile: profileRefs[profileKey],
      subjectId,
      runtimeState: { kind: 'migration-incomplete' },
      evidenceClaimIds: [claimId],
    };
    return versioned(treatmentId, record);
  }),
);

export const classicalOrdinaryFoundationInventory = families.map(({ id }) => id);

export const classicalOrdinaryFoundationCoverage = families.flatMap(({ id, claims }) =>
  (Object.keys(profileRefs) as ProfileKey[]).map((profile) => {
    const row = claims[profile];
    return {
      subjectId: id,
      profile: profileRefs[profile],
      evidenceStatus: (row ? 'source-ready' : 'not-applicable') as 'source-ready' | 'source-unresolved' | 'not-applicable',
      recordStatus: (row ? 'migrated' : 'not-applicable') as 'migrated' | 'not-migrated' | 'not-applicable',
      treatmentStatus: (row ? 'runtime-edge-migration-incomplete' : 'not-applicable') as 'migrated' | 'runtime-edge-migration-incomplete' | 'present-not-modelled' | 'not-applicable',
    };
  }),
);
