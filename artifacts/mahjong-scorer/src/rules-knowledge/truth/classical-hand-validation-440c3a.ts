import type { EvidenceClaim, ProfileTreatment, SemanticSubject } from '../../rules-platform/truth-model';
import { versioned } from './records';

type ProfileKey = 'bmja' | 'outside-the-box' | 'buzzard-2000';
type ClaimRow = {
  profile: ProfileKey;
  sourceId: 'bmja-qa' | 'bmja-scoring' | 'otb-guide-2026-09' | 'buzzard-2000-classical';
  status: 'verified' | 'verified-club';
  claim: string;
  url?: string;
  section: string;
  page?: string;
  runtimeState?: 'migration-incomplete' | 'present-not-modelled';
};
type Family = { id: string; kind?: SemanticSubject['kind']; claims: Partial<Record<ProfileKey, ClaimRow>> };

const bmjaQa = (claim: string, section: string, url = 'https://mahjongbritishrules.wordpress.com/questions/playing-the-game/'): ClaimRow => ({ profile: 'bmja', sourceId: 'bmja-qa', status: 'verified', claim, url, section });
const otb = (claim: string, section: string): ClaimRow => ({ profile: 'outside-the-box', sourceId: 'otb-guide-2026-09', status: 'verified-club', claim, url: 'https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/88', section });
const buzzard = (claim: string, section: string, page: string): ClaimRow => ({ profile: 'buzzard-2000', sourceId: 'buzzard-2000-classical', status: 'verified', claim, section, page });

const families: readonly Family[] = [
  { id: 'rule.classical.flowers-seasons-outside-ordinary-structure', claims: {
    bmja: bmjaQa('Flowers and Seasons are bonus tiles and do not occupy ordinary playing-tile structure.', 'GLOSSARY — Bonus tiles; Questions about playing the game — Numbers of tiles'),
    'outside-the-box': otb('Flowers and Seasons are bonus tiles outside ordinary playing-tile structure.', 'Issue #88 body — ordinary scoring base; supplied guide evidence'),
  } },
  { id: 'rule.classical.ordinary-nonwinning-structural-count', claims: {
    bmja: bmjaQa('A non-winning ordinary hand has thirteen structural playing tiles.', 'Questions about playing the game — Numbers of tiles'),
    'outside-the-box': otb('A non-winning ordinary hand has thirteen structural playing tiles.', 'Issue #88 body §1 — ordinary hand structure'),
    'buzzard-2000': buzzard('A non-winning calling hand contains thirteen structural tiles before its completing tile.', 'Calling Nine Tile Hand — thirteen-tile calling shape', '11'),
  } },
  { id: 'rule.classical.ordinary-winning-structural-count', claims: {
    bmja: bmjaQa('A winning ordinary hand has fourteen structural playing tiles; the final claimed or drawn tile is retained.', 'Questions about playing the game — Numbers of tiles; Going Mah-Jong'),
    'outside-the-box': otb('A winning ordinary hand has fourteen structural playing tiles.', 'Issue #88 body §1 — ordinary hand structure'),
    'buzzard-2000': buzzard('A winning ordinary hand is completed by the fourteenth structural tile.', 'Calling Nine Tile Hand — fourteen-tile completion', '11'),
  } },
  { id: 'rule.classical.kong-physical-four-structural-one-set', claims: {
    bmja: bmjaQa('A Kong is a four-tile set and occupies one of the four set positions in an ordinary winning hand.', 'Questions about playing the game — Kongs; Playing the game — Types of sets'),
    'outside-the-box': otb('A Kong is a four-tile set and occupies one of the four set positions in an ordinary winning hand.', 'Issue #88 body §1 — ordinary hand structure and Kong evidence'),
    'buzzard-2000': buzzard('A Kong is a four-tile set occupying one set position in the ordinary hand structure.', 'THE SCORES AND HOW TO CALCULATE THEM — Kong; ordinary hand structure', '9–10'),
  } },
  { id: 'rule.classical.ordinary-winning-four-sets-and-pair', claims: {
    bmja: bmjaQa('An ordinary winning hand consists of four sets and one identical pair.', 'Questions about playing the game — Numbers of tiles; Sets and Mah-Jong'),
    'outside-the-box': otb('An ordinary winning hand consists of four sets and one pair.', 'Issue #88 body §1 — ordinary hand structure'),
    'buzzard-2000': buzzard('An ordinary winning hand consists of four sets and a pair.', 'Calling Nine Tile Hand — fourteen-tile completion; ordinary hand structure', '11'),
  } },
  { id: 'rule.classical.normal-hand-at-most-one-chow', claims: {
    bmja: bmjaQa('A normal BMJA hand permits at most one Chow.', 'Questions about playing the game — Chows'),
  } },
  { id: 'rule.buzzard-2000.multiple-chows-permitted', claims: {
    'buzzard-2000': buzzard('The ordinary hand rules permit multiple Chows, including a winning hand made of four Chows and a non-scoring pair.', 'DOUBLES — All Chows + a non-scoring pair', '10'),
  } },
  { id: 'rule.otb.goulash-no-chows', claims: {
    'outside-the-box': otb('An OTB Goulash hand permits no Chows.', 'Issue #88A supplied guide transcription; #88D Goulash legality contract'),
  } },
  { id: 'rule.classical.exposed-concealed-set-meaning', claims: {
    bmja: bmjaQa('A set formed using another player’s discard is exposed; a set formed from the deal or wall without claiming a discard is concealed.', 'Questions about playing the game — Concealed and exposed sets'),
    'buzzard-2000': buzzard('A set made by claiming a discard is exposed; a set formed without a claimed discard is concealed.', 'Exposed and concealed sets — definitions', '3–8'),
  } },
  { id: 'concept.bmja.fishing-state', kind: 'concept', claims: {
    bmja: bmjaQa('Fishing is a non-winning calling state in which one more tile is required to complete Mahjong.', 'GLOSSARY — Fishing / Calling; Questions about playing the game — Fishing', 'https://mahjongbritishrules.wordpress.com/glossary/'),
  } },
  { id: 'concept.bmja.fishing-distinct-from-original-call', kind: 'concept', claims: {
    bmja: bmjaQa('Fishing describes the one-tile-away state; Original Call is the distinct case in which that state is found after the first discard and the hand is not altered.', 'GLOSSARY — Fishing / Calling; Original call', 'https://mahjongbritishrules.wordpress.com/glossary/'),
  } },
  { id: 'rule.bmja.dead-wanted-tile-does-not-remove-fishing-eligibility', claims: {
    bmja: { ...bmjaQa('A player fishing for a special hand may remain eligible for its fishing treatment even when the needed tile is dead.', 'Questions about playing the game — Fishing — Tile wanted is dead'), runtimeState: 'present-not-modelled' },
  } },
  { id: 'concept.bmja.original-call-declaration-evidence', kind: 'concept', claims: {
    bmja: bmjaQa('Original Call describes a player who finds a calling hand after the first discard and does not alter it (apart from taking the completing tile).', 'GLOSSARY — Original call', 'https://mahjongbritishrules.wordpress.com/glossary/'),
  } },
  { id: 'rule.otb.goulash-blank-substitution-policy', claims: {
    'outside-the-box': otb('OTB Goulash permits up to four physical blanks as substitutes for ordinary playing tiles, never Flowers or Seasons. A Pung uses at most one blank and at least two genuine identical tiles; a Kong uses at most two blanks and at least two genuine identical tiles; a pair may use zero, one or two blanks without another genuine-tile minimum.', 'Issue #88A supplied guide evidence; #88D blank and set legality contract'),
  } },
];

const profileRefs = {
  bmja: { id: 'bmja', version: '1.0' },
  'outside-the-box': { id: 'outside-the-box', version: '0.1' },
  'buzzard-2000': { id: 'buzzard-2000', version: '0.1' },
} as const;

export const classicalHandValidation440c3aInventory = families.map(({ id }) => id);

export const classicalHandValidation440c3aUnresolved = [
  { subjectId: 'rule.classical.flowers-seasons-outside-ordinary-structure', profile: profileRefs['buzzard-2000'] },
  { subjectId: 'rule.classical.normal-hand-at-most-one-chow', profile: profileRefs['outside-the-box'] },
  { subjectId: 'rule.classical.exposed-concealed-set-meaning', profile: profileRefs['outside-the-box'] },
] as const;

const evidence = families.flatMap(({ id: subjectId, claims }) => Object.values(claims).map((row) => {
  const claimId = `evidence.${subjectId}.${row.profile}`;
  const locator = row.sourceId === 'buzzard-2000-classical'
    ? { kind: 'publication' as const, title: 'Buzzard 2000 Classical rules, retained original source snapshot', year: 2000, page: row.page, section: row.section }
    : { kind: 'url' as const, url: row.url!, section: row.section };
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
}));

export const classicalHandValidation440c3aSubjects = families.map(({ id, kind = 'rule' }) =>
  versioned<SemanticSubject>(id, { id, kind }),
);

export const classicalHandValidation440c3aClaims = evidence;

export const classicalHandValidation440c3aTreatments = families.flatMap(({ id: subjectId, claims }) =>
  Object.values(claims).map((row) => {
    const treatmentId = `${profileRefs[row.profile].id}@${profileRefs[row.profile].version}:${subjectId}`;
    const record: ProfileTreatment = {
      treatmentId,
      profile: profileRefs[row.profile],
      subjectId,
      runtimeState: { kind: row.runtimeState ?? 'migration-incomplete' },
      evidenceClaimIds: [`evidence.${subjectId}.${row.profile}`],
    };
    return versioned(treatmentId, record);
  }),
);

export const classicalHandValidation440c3aCoverage = families.flatMap(({ id, claims }) =>
  (Object.keys(profileRefs) as ProfileKey[]).map((profile) => {
    const row = claims[profile];
    const isUnresolved = classicalHandValidation440c3aUnresolved.some((candidate) => candidate.subjectId === id && candidate.profile.id === profileRefs[profile].id);
    return {
      subjectId: id,
      profile: profileRefs[profile],
      evidenceStatus: (row ? 'source-ready' : isUnresolved ? 'source-unresolved' : 'not-applicable') as 'source-ready' | 'source-unresolved' | 'not-applicable',
      recordStatus: (row ? 'migrated' : isUnresolved ? 'not-migrated' : 'not-applicable') as 'migrated' | 'not-migrated' | 'not-applicable',
      treatmentStatus: (row?.runtimeState === 'present-not-modelled' ? 'present-not-modelled' : row ? 'runtime-edge-migration-incomplete' : 'not-applicable') as 'runtime-edge-migration-incomplete' | 'present-not-modelled' | 'not-applicable',
    };
  }),
);
