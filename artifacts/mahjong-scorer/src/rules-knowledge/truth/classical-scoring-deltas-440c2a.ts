import type { EvidenceClaim, ProfileTreatment, SemanticSubject } from '../../rules-platform/truth-model';
import { versioned } from './records';

type ProfileId = 'bmja' | 'outside-the-box';
type ClaimRow = { profile: ProfileId; sourceId: 'bmja-scoring' | 'bmja-special-hands' | 'otb-guide-2026-09'; status: 'verified' | 'verified-club'; section: string; claim: string; runtimeState: 'migration-incomplete' | 'present-not-modelled' };
type Family = { id: string; rows: readonly ClaimRow[] };

const bmja = (section: string, claim: string, sourceId: 'bmja-scoring' | 'bmja-special-hands' = 'bmja-scoring'): ClaimRow => ({ profile: 'bmja', sourceId, status: 'verified', section, claim, runtimeState: 'migration-incomplete' });
const otb = (section: string, claim: string, runtimeState: ClaimRow['runtimeState'] = 'migration-incomplete'): ClaimRow => ({ profile: 'outside-the-box', sourceId: 'otb-guide-2026-09', status: 'verified-club', section, claim, runtimeState });

const shared = (id: string, bmjaRow: ClaimRow, otbRow: ClaimRow): Family => ({ id, rows: [bmjaRow, otbRow] });
const families: readonly Family[] = [
  shared('rule.classical.winner-no-chows-double',
    bmja('Doubling for the player who goes Mah-Jong — No chows', 'A winner whose hand contains no Chows receives one double.'),
    otb('Issue #88 body §1 Ordinary scoring base > Doubles for winners > no Chows', 'A winner whose hand contains no Chows receives one double.')),
  shared('rule.classical.one-suit-with-honours-double',
    bmja('Doubling for the player who goes Mah-Jong — All tiles are from the same suit with Dragons and/or Winds', 'A winner with one numbered suit and any Winds or Dragons receives one double.'),
    otb('Issue #88 body §1 Ordinary scoring base > Doubles for winners > one suit with honours', 'A winner with one numbered suit and any Winds or Dragons receives one double.')),
  shared('rule.classical.win-loose-tile-double',
    bmja('Doubling for the player who goes Mah-Jong — Going Mah-Jong with a loose tile', 'A winner who completes the hand with a tile from the loose tiles / Kong box receives one double.'),
    otb('Issue #88 body §1 Ordinary scoring base > Doubles for winners > winning from the loose tiles / Kong box', 'A winner who completes the hand with a tile from the loose tiles / Kong box receives one double.')),
  shared('rule.classical.win-last-wall-double',
    bmja('Doubling for the player who goes Mah-Jong — Going Mah-Jong with the last available tile from the wall', 'A winner who draws the last available main-wall tile receives one double.'),
    otb('Issue #88 body §1 Ordinary scoring base > Doubles for winners > last tile of the wall', 'A winner who draws the last available main-wall tile receives one double.')),
  shared('rule.classical.win-final-discard-double',
    bmja('Doubling for the player who goes Mah-Jong — Going Mah-Jong with the final discard', 'A winner who wins on the final discard receives one double.'),
    otb('Issue #88 body §1 Ordinary scoring base > Doubles for winners > winning on the last discard', 'A winner who wins on the final discard receives one double.')),
  shared('rule.classical.win-robbing-kong-double',
    bmja('Doubling for the player who goes Mah-Jong — Going Mah-Jong by robbing the kong', 'A winner who wins by robbing a Kong receives one double.'),
    otb('Issue #88 body §1 Ordinary scoring base > Doubles for winners > robbing a Kong', 'A winner who wins by robbing a Kong receives one double.')),
  shared('rule.classical.purity-calculated-three-doubles',
    bmja('Purity', 'Purity is one numbered suit formed from Pungs/Kongs and a pair, with no Winds, Dragons or Chows; calculate the basic score and apply three doubles. Flowers and Seasons are calculated separately.', 'bmja-special-hands'),
    otb('Issue #88 guide transcription — special hands, Purity', 'Purity is one numbered suit formed from Pungs/Kongs and a pair, with no Winds, Dragons or Chows; calculate the basic score and apply three doubles. Flowers and Seasons are calculated separately.')),
  { id: 'rule.otb.winning-pair-completion-bonus', rows: [otb('Issue #88 body §1 Ordinary scoring base > Winner bonuses > winning tile completes a pair', 'When the winning tile completes a pair, add 2 points for a minor tile or 4 points for a major or honour tile.')] },
  { id: 'rule.otb.concealed-winner-wall-draw-double', rows: [otb('Issue #88 body §1 Ordinary scoring base > Doubles for winners > concealed hand', 'The concealed-winner double applies only when the winning tile is drawn from the wall; the last main-wall tile is still a wall draw.')] },
  { id: 'rule.otb.little-three-dragons-double', rows: [otb('Issue #88 body §1 Ordinary scoring base > Doubles for winners > Little Three Dragons', 'Little Three Dragons receives one additional double, in addition to ordinary Dragon component doubles; it is exclusive with Big Three Dragons.')] },
  { id: 'rule.otb.big-three-dragons-double', rows: [otb('Issue #88 body §1 Ordinary scoring base > Doubles for winners > Big Three Dragons', 'Big Three Dragons receives two additional doubles, in addition to ordinary Dragon component doubles; it is exclusive with Little Three Dragons.')] },
  { id: 'rule.otb.little-four-joys-double', rows: [otb('Issue #88 body §1 Ordinary scoring base > Doubles for winners > Little Four Joys', 'Little Four Joys receives one additional double, in addition to ordinary Wind component doubles; it is exclusive with Big Four Joys.')] },
  { id: 'rule.otb.big-four-joys-double', rows: [otb('Issue #88 body §1 Ordinary scoring base > Doubles for winners > Big Four Joys', 'Big Four Joys receives two additional doubles, in addition to ordinary Wind component doubles; it is exclusive with Little Four Joys.')] },
  { id: 'rule.otb.three-concealed-pungs-kongs-double', rows: [otb('Issue #88 body §1 Ordinary scoring base > Doubles for winners > three concealed Pungs/Kongs', 'Three concealed Pungs/Kongs receive an additional double; an exposed Kong counts as a concealed Pung for this rule.')] },
  { id: 'rule.otb.fixed-special-flower-season-side-subtotal', rows: [otb('Issue #88 body §1 Ordinary scoring base > fixed special hands and Flowers/Seasons', 'A separately calculated Flower/Season side subtotal may be added above the ordinary table cap to a fixed special-hand score.')] },
  { id: 'rule.otb.only-possible-winning-tile-bonus', rows: [otb('Issue #88 body §1 Ordinary scoring base > Winner bonuses > only possible tile', 'A winner who had only one possible tile to complete the hand receives 2 points.', 'present-not-modelled')] },
  { id: 'rule.otb.heavenly-hand-limit-event', rows: [otb('Issue #88 body §1 Ordinary scoring base > Limit hands > Heavenly Hand', 'Heavenly Hand is an OTB limit event.', 'present-not-modelled')] },
  { id: 'rule.otb.earthly-hand-limit-event', rows: [otb('Issue #88 body §1 Ordinary scoring base > Limit hands > Earthly Hand', 'Earthly Hand is an OTB limit event.', 'present-not-modelled')] },
  { id: 'rule.otb.first-wall-draw-limit-event', rows: [otb('Issue #88 body §1 Ordinary scoring base > Limit hands > first wall draw', 'Winning on the first wall draw is an OTB limit event.', 'present-not-modelled') ] },
];

const profileRefs = {
  bmja: { id: 'bmja', version: '1.0' },
  'outside-the-box': { id: 'outside-the-box', version: '0.1' },
} as const;

const allRows = families.flatMap(({ id: subjectId, rows }) => rows.map((row) => ({ subjectId, row })));

export const classicalScoringDelta440c2aSubjects = families.map(({ id }) => versioned<SemanticSubject>(id, { id, kind: 'rule' }));

export const classicalScoringDelta440c2aClaims = allRows.map(({ subjectId, row }) => {
  const claimId = `evidence.${subjectId}.${row.profile}`;
  const locator = row.profile === 'bmja'
    ? { kind: 'url' as const, url: row.sourceId === 'bmja-special-hands' ? 'https://mahjongbritishrules.wordpress.com/scoring/special-hands/' : 'https://mahjongbritishrules.wordpress.com/scoring/working-out-the-scores/', section: row.section }
    : { kind: 'url' as const, url: 'https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/88', section: row.section };
  const record: EvidenceClaim = {
    claimId,
    subjectId,
    sourceId: row.sourceId,
    locator,
    status: row.status,
    claim: row.claim,
    checkedOn: '2026-09-30',
    supportsProfile: profileRefs[row.profile],
  };
  return versioned(claimId, record);
});

export const classicalScoringDelta440c2aTreatments = allRows.map(({ subjectId, row }) => {
  const treatmentId = `${profileRefs[row.profile].id}@${profileRefs[row.profile].version}:${subjectId}`;
  const claimId = `evidence.${subjectId}.${row.profile}`;
  const record: ProfileTreatment = {
    treatmentId,
    profile: profileRefs[row.profile],
    subjectId,
    runtimeState: { kind: row.runtimeState },
    evidenceClaimIds: [claimId],
  };
  return versioned(treatmentId, record);
});

export const classicalScoringDelta440c2aInventory = families.map(({ id }) => id);

export const classicalScoringDelta440c2aCoverage = families.flatMap(({ id, rows }) =>
  (Object.keys(profileRefs) as ProfileId[]).map((profile) => {
    const row = rows.find(({ profile: rowProfile }) => rowProfile === profile);
    return {
      subjectId: id,
      profile: profileRefs[profile],
      evidenceStatus: (row ? 'source-ready' : 'not-applicable') as 'source-ready' | 'not-applicable',
      recordStatus: (row ? 'migrated' : 'not-applicable') as 'migrated' | 'not-applicable',
      treatmentStatus: (row?.runtimeState === 'present-not-modelled' ? 'present-not-modelled' : row ? 'runtime-edge-migration-incomplete' : 'not-applicable') as 'runtime-edge-migration-incomplete' | 'present-not-modelled' | 'not-applicable',
    };
  }),
);
