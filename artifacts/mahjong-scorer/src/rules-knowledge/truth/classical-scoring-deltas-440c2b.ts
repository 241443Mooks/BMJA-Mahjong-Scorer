import type { EvidenceClaim, ProfileTreatment, SemanticSubject } from '../../rules-platform/truth-model';
import { versioned } from './records';
import { classicalScoringDelta440c2aInventory } from './classical-scoring-deltas-440c2a';

type ProfileId = 'bmja' | 'buzzard-2000';
type Row = { profile: ProfileId; section: string; claim: string; sourceId: 'bmja-scoring' | 'buzzard-2000-classical'; page?: string };
type Family = { id: string; rows: readonly Row[]; createSubject?: boolean };
const bmja = (section: string, claim: string): Row => ({ profile: 'bmja', sourceId: 'bmja-scoring', section, claim });
const buzzard = (section: string, claim: string, page = '10'): Row => ({ profile: 'buzzard-2000', sourceId: 'buzzard-2000-classical', section, claim, page });
const family = (id: string, ...rows: Row[]): Family => ({ id, rows });

const families: readonly Family[] = [
  family('rule.classical.winner-no-chows-double',
    buzzard('DOUBLES — Winning by Pairs', 'A winner with four Pung/Kong sets and a pair, with no Chows, receives one double.')),
  family('rule.classical.one-suit-with-honours-double',
    buzzard('DOUBLES — One suit and Winds/Dragons', 'A winner whose tiles use one numbered suit together with Winds and/or Dragons receives one double.')),
  family('rule.classical.win-loose-tile-double',
    buzzard('DOUBLES — Loose Tile', 'A winner completing the hand with a Loose Tile receives one double.')),
  family('rule.classical.win-last-wall-double',
    buzzard('DOUBLES — Last drawable wall tile', 'A winner completing the hand with the last drawable wall tile receives one double.')),
  family('rule.classical.win-robbing-kong-double',
    buzzard('DOUBLES — Snatching a Kong', 'A winner who wins by robbing a Kong receives one double.')),
  family('rule.classical.all-majors-with-honours-double',
    bmja('Doubling for the player who goes Mah-Jong — all Ones and Nines with some Dragons and/or Winds', 'An ordinary winner whose tiles are suited terminals together with one or more Winds or Dragons receives one double.'),
    buzzard('DOUBLES — Ones/Nines with Winds/Dragons', 'An ordinary winner whose tiles are suited terminals together with one or more Winds or Dragons receives one double.')),
  family('rule.classical.concealed-mixed-winner-double',
    bmja('Doubling for the player who goes Mah-Jong — concealed hand; Glossary — concealed hand', 'A winner receives one double when all groups are concealed, at least one non-pair suited set and one non-pair Wind/Dragon set are present; an exposed winning pair prevents qualification.')),
  family('rule.classical.original-call-fishing-all-player-double',
    bmja('Doubling for all players — Original call; Glossary — original call', 'A player fishing after the first discard receives one double while the hand remains unaltered, including before Mahjong.')),
  family('rule.classical.original-call-winner-double',
    bmja('Doubling for the player who goes Mah-Jong — Going Mah-Jong with the original call', 'A player who goes Mahjong with Original Call receives an additional winner double.')),
  family('rule.buzzard-2000.pure-one-suit-winner-three-doubles',
    buzzard('DOUBLES — Entirely one suit', 'A winner whose hand uses a single numbered suit receives three doubles (×8); Chows are allowed.')),
  family('rule.buzzard-2000.all-chows-nonscoring-pair-double',
    buzzard('DOUBLES — All Chows and a non-scoring pair', 'A winner with all Chows and a non-scoring suited pair receives one double.')),
  family('rule.buzzard-2000.standing-hand-winner-bonus',
    buzzard('BONUS SCORES — Standing Hand', 'A winner with a Standing Hand receives +100 points.')),
  family('rule.buzzard-2000.only-possible-winning-tile-bonus',
    buzzard('BONUS SCORES — Only possible winning tile', 'A winner who had only one possible winning tile receives +2 points.')),
  family('rule.buzzard-2000.no-chows-additive-bonus',
    buzzard('BONUS SCORES — No Chows', 'A winner whose hand contains no Chows receives +10 points, separately from any no-Chows winner double.')),
  family('rule.buzzard-2000.scoreless-hand-bonus',
    buzzard('BONUS SCORES — Scoreless hand', 'A scoreless winner receives +10 points.')),
  family('rule.buzzard-2000.last-wall-additive-bonus',
    buzzard('BONUS SCORES — Last drawable wall tile', 'A winner completing the hand with the last drawable wall tile receives +10 points, separately from the last-wall double.')),
  family('rule.buzzard-2000.loose-tile-additive-bonus',
    buzzard('BONUS SCORES — Loose Tile', 'A winner completing the hand with a Loose Tile receives +10 points, separately from the Loose-Tile double.')),
  family('rule.buzzard-2000.flower-season-set-own-tile-cumulative-doubles',
    buzzard('DOUBLES — Four Flowers/Four Seasons and own Flower/Season; NOTES ON SCORING — cumulative doubles', 'A complete Flower or Season set gives three doubles (×8), and the player’s own corresponding tile gives one further double; together the four doubles are cumulative (×16).', '10–11')),
];

const profiles = { bmja: { id: 'bmja', version: '1.0' }, 'buzzard-2000': { id: 'buzzard-2000', version: '0.1' } } as const;
const allRows = families.flatMap(({ id: subjectId, rows }) => rows.map((row) => ({ subjectId, row })));
export const classicalScoringDelta440c2bSubjects = families.filter(({ id }) => !classicalScoringDelta440c2aInventory.includes(id)).map(({ id }) => versioned<SemanticSubject>(id, { id, kind: 'rule' }));
export const classicalScoringDelta440c2bClaims = allRows.map(({ subjectId, row }) => {
  const claimId = `evidence.${subjectId}.${row.profile}`;
  const record: EvidenceClaim = {
    claimId, subjectId, sourceId: row.sourceId,
    locator: row.profile === 'bmja'
      ? { kind: 'url', url: 'https://mahjongbritishrules.wordpress.com/scoring/working-out-the-scores/', section: row.section }
      : { kind: 'publication', title: 'Buzzard 2000 Classical rules, retained original source snapshot', year: 2000, page: row.page, section: row.section },
    status: 'verified', claim: row.claim, checkedOn: '2026-09-30', supportsProfile: profiles[row.profile],
  };
  return versioned(claimId, record);
});
export const classicalScoringDelta440c2bTreatments = allRows.map(({ subjectId, row }) => {
  const treatmentId = `${profiles[row.profile].id}@${profiles[row.profile].version}:${subjectId}`;
  const claimId = `evidence.${subjectId}.${row.profile}`;
  const record: ProfileTreatment = { treatmentId, profile: profiles[row.profile], subjectId, runtimeState: { kind: 'migration-incomplete' }, evidenceClaimIds: [claimId] };
  return versioned(treatmentId, record);
});
export const classicalScoringDelta440c2bInventory = families.map(({ id }) => id);
export const classicalScoringDelta440c2bCoverage = families.flatMap(({ id, rows }) =>
  (Object.keys(profiles) as ProfileId[]).map((profile) => {
    const row = rows.find((candidate) => candidate.profile === profile);
    return { subjectId: id, profile: profiles[profile], evidenceStatus: row ? 'source-ready' as const : 'not-applicable' as const, recordStatus: row ? 'migrated' as const : 'not-applicable' as const, treatmentStatus: row ? 'runtime-edge-migration-incomplete' as const : 'not-applicable' as const };
  }),
);
