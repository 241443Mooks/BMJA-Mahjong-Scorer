import { describe, expect, it } from 'vitest';
import { westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { currentTruthCorpus, currentTruthIndex } from '../rules-knowledge/truth';
import { WESTERN_TM_CURRENT_PROFILE, currentPlayableResolverEnvironment } from './current-profiles';
import { resolvePlayableProfile } from './resolver';

type CoverageStatus = 'source-ready' | 'needs-primary-source' | 'secondary-corroboration-only' | 'product-policy-not-source-truth' | 'not-applicable';

// Frozen in 440D after review of the runtime, source register, crosswalk,
// Australian evidence notes, profile matrix, and 440A/B4D/C1-C4 evidence.
export const westernTm440dOrdinaryCoverage = [
  ['A.setup.tile-set.flowers-seasons', 'Setup and hand model', 'Classical tile set with Flowers and Seasons', 'needs-primary-source'],
  ['A.setup.players.four-player', 'Setup and hand model', 'Four-player structure', 'needs-primary-source'],
  ['A.setup.seat-winds', 'Setup and hand model', 'Seat Winds', 'needs-primary-source'],
  ['A.setup.prevailing-wind', 'Setup and hand model', 'Prevailing Wind', 'needs-primary-source'],
  ['A.hand.ordinary.four-sets-pair', 'Setup and hand model', 'Ordinary four-sets-and-pair structure', 'needs-primary-source'],
  ['A.hand.kong-structure', 'Setup and hand model', 'Kong structural treatment in an ordinary hand', 'needs-primary-source'],
  ['A.hand.concealed-exposed', 'Setup and hand model', 'Meaning of concealed and exposed groups', 'needs-primary-source'],
  ['B.call.chow-availability', 'Calling and hand legality', 'Chow availability and restrictions', 'needs-primary-source'],
  ['B.call.pung', 'Calling and hand legality', 'Pung calling', 'needs-primary-source'],
  ['B.call.kong', 'Calling and hand legality', 'Kong calling', 'needs-primary-source'],
  ['B.call.exposure-consequences', 'Calling and hand legality', 'Exposure consequences', 'needs-primary-source'],
  ['B.fishing.ready', 'Calling and hand legality', 'Fishing or ready semantics', 'needs-primary-source'],
  ['B.winning-tile.provenance', 'Calling and hand legality', 'Winning-tile provenance where relevant', 'needs-primary-source'],
  ['C.base.chow', 'Ordinary point scoring', 'Chow base treatment', 'needs-primary-source'],
  ['C.base.pung.exposed', 'Ordinary point scoring', 'Exposed Pung values', 'needs-primary-source'],
  ['C.base.pung.concealed', 'Ordinary point scoring', 'Concealed Pung values', 'needs-primary-source'],
  ['C.base.kong.exposed', 'Ordinary point scoring', 'Exposed Kong values', 'needs-primary-source'],
  ['C.base.kong.concealed', 'Ordinary point scoring', 'Concealed Kong values', 'needs-primary-source'],
  ['C.base.pair.qualifying', 'Ordinary point scoring', 'Qualifying pair values', 'needs-primary-source'],
  ['C.base.flower-season', 'Ordinary point scoring', 'Flower and Season base points', 'needs-primary-source'],
  ['C.base.mahjong', 'Ordinary point scoring', 'Mahjong base points', 'needs-primary-source'],
  ['C.base.self-draw', 'Ordinary point scoring', 'Self-draw bonus', 'needs-primary-source'],
  ['D.double.own-wind', 'Ordinary doubles and calculated scoring', 'Own Wind', 'needs-primary-source'],
  ['D.double.prevailing-wind', 'Ordinary doubles and calculated scoring', 'Prevailing Wind', 'needs-primary-source'],
  ['D.double.dragons', 'Ordinary doubles and calculated scoring', 'Dragons', 'needs-primary-source'],
  ['D.double.own-flower-season', 'Ordinary doubles and calculated scoring', 'Own Flower or Season', 'needs-primary-source'],
  ['D.double.complete-flowers-seasons', 'Ordinary doubles and calculated scoring', 'Complete Flowers or Seasons', 'needs-primary-source'],
  ['D.double.no-chows', 'Ordinary doubles and calculated scoring', 'No Chows', 'needs-primary-source'],
  ['D.double.mixed-one-suit-honours', 'Ordinary doubles and calculated scoring', 'Mixed one suit and honours', 'needs-primary-source'],
  ['D.double.all-majors', 'Ordinary doubles and calculated scoring', 'All-majors family', 'needs-primary-source'],
  ['D.double.concealed-winner', 'Ordinary doubles and calculated scoring', 'Concealed winner', 'needs-primary-source'],
  ['D.double.robbing-kong', 'Ordinary doubles and calculated scoring', 'Robbing Kong', 'needs-primary-source'],
  ['D.double.last-wall', 'Ordinary doubles and calculated scoring', 'Last wall', 'needs-primary-source'],
  ['D.double.loose-tile', 'Ordinary doubles and calculated scoring', 'Loose Tile', 'needs-primary-source'],
  ['D.double.final-discard', 'Ordinary doubles and calculated scoring', 'Final discard', 'needs-primary-source'],
  ['D.double.original-call', 'Ordinary doubles and calculated scoring', 'Original Call or Western equivalent, if any', 'needs-primary-source'],
  ['D.cap.ordinary', 'Ordinary doubles and calculated scoring', 'Ordinary cap semantics', 'needs-primary-source'],
  ['E.settlement.loser-winner', 'Settlement and progression', 'Loser-to-winner settlement', 'needs-primary-source'],
  ['E.settlement.loser-loser', 'Settlement and progression', 'Loser-to-loser differences', 'needs-primary-source'],
  ['E.settlement.east-multiplier', 'Settlement and progression', 'East multiplier', 'needs-primary-source'],
  ['E.settlement.draw', 'Settlement and progression', 'Draw settlement', 'needs-primary-source'],
  ['E.progression.east-retention', 'Settlement and progression', 'East retention', 'needs-primary-source'],
  ['E.progression.seat-rotation', 'Settlement and progression', 'Seat rotation', 'needs-primary-source'],
  ['E.progression.prevailing-wind', 'Settlement and progression', 'Prevailing-Wind advancement', 'needs-primary-source'],
  ['E.progression.full-game-length', 'Settlement and progression', 'Full-game length', 'needs-primary-source'],
  ['F.goulash.draw-trigger', 'Goulash, incidents and procedure', 'Draw-to-Goulash trigger, if any', 'needs-primary-source'],
  ['F.goulash.blanks-wilds', 'Goulash, incidents and procedure', 'Goulash blanks or wilds', 'needs-primary-source'],
  ['F.goulash.chow-treatment', 'Goulash, incidents and procedure', 'Goulash Chow treatment', 'needs-primary-source'],
  ['F.procedure.charleston-exchange', 'Goulash, incidents and procedure', 'Charleston or exchange procedure', 'needs-primary-source'],
  ['F.incident.incorrect-hand', 'Goulash, incidents and procedure', 'Incorrect hand', 'needs-primary-source'],
  ['F.incident.false-mahjong', 'Goulash, incidents and procedure', 'False Mahjong', 'needs-primary-source'],
  ['F.incident.false-discard-naming', 'Goulash, incidents and procedure', 'False discard naming', 'needs-primary-source'],
  ['F.incident.wrongful-claims', 'Goulash, incidents and procedure', 'Wrongful claims', 'needs-primary-source'],
  ['F.liability', 'Goulash, incidents and procedure', 'Liability rules', 'needs-primary-source'],
] as const satisfies readonly (readonly [string, string, string, CoverageStatus])[];

describe('440D Western provisional ordinary coverage', () => {
  const profile = { id: 'western-tm', version: '0.1' } as const;

  it('freezes and explicitly classifies every ordinary candidate', () => {
    expect(westernTm440dOrdinaryCoverage).toHaveLength(54);
    expect(new Set(westernTm440dOrdinaryCoverage.map(([id]) => id)).size).toBe(westernTm440dOrdinaryCoverage.length);
    expect(westernTm440dOrdinaryCoverage.every(([, , , status]) => [
      'source-ready', 'needs-primary-source', 'secondary-corroboration-only',
      'product-policy-not-source-truth', 'not-applicable',
    ].includes(status))).toBe(true);
    expect(westernTm440dOrdinaryCoverage.every(([, , , status]) => status === 'needs-primary-source')).toBe(true);
  });

  it('keeps Western ordinary coverage out of claims and treatments', () => {
    const ordinaryIds = new Set<string>(westernTm440dOrdinaryCoverage.map(([id]) => id));
    const westernSubjects = currentTruthCorpus.subjects.filter(({ record }) => record.id.startsWith('rule.western-tm.'));
    const westernClaims = currentTruthCorpus.claims.map(({ record }) => record).filter(({ supportsProfile }) => supportsProfile?.id === profile.id && supportsProfile.version === profile.version);
    const westernTreatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    expect(westernSubjects.filter(({ record }) => ordinaryIds.has(record.id))).toEqual([]);
    expect(westernClaims.filter(({ subjectId }) => ordinaryIds.has(subjectId))).toEqual([]);
    expect(westernTreatments.filter(({ subjectId }) => ordinaryIds.has(subjectId))).toEqual([]);
    expect(currentTruthIndex.claimsSupportingProfile(profile).map(({ record }) => record.subjectId).every((id) => !ordinaryIds.has(id))).toBe(true);
    expect(currentTruthIndex.claimsSupportingProfile(profile).every(({ record }) => record.subjectId === 'pattern.thirteen-orphans' || record.subjectId.startsWith('pattern.western-tm.'))).toBe(true);
    expect(currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record.subjectId).every((id) => !ordinaryIds.has(id))).toBe(true);
    expect(currentTruthIndex.treatmentsForProfile(profile).every(({ record }) => record.subjectId === 'pattern.thirteen-orphans' || record.subjectId.startsWith('pattern.western-tm.'))).toBe(true);
    expect(currentTruthCorpus.sources.some(({ record }) => record.sourceId === 'tm-game-illustrated')).toBe(false);
  });

  it('retains provisional runtime reuse and the 84-of-85 special-hand boundary', async () => {
    expect(WESTERN_TM_CURRENT_PROFILE).toMatchObject({ identity: { id: 'western-tm', version: '0.1', status: 'provisional' } });
    const { profile: resolved } = await resolvePlayableProfile(profile, currentPlayableResolverEnvironment);
    expect(resolved.scoring.config).toEqual({ configVersion: 1, scorerId: 'classical.scorer.current', bindingId: 'classical.bindings.western-tm-current', policyId: 'classical.policy.western-tm-current', defaultTableLimit: 1000 });
    expect(resolved.settlement.id).toBe('settlement.classical-pairwise');
    expect(resolved.progression.id).toBe('progression.classical-east-cycle');
    expect(resolved.gameEnd.id).toBe('game-end.classical-east-cycle');
    expect(resolved.handMode?.id).toBe('hand-mode.none');
    expect(currentTruthIndex.treatmentsForProfile(profile)).toHaveLength(84);
    expect(westernTmSpecialHandBindings).toHaveLength(85);
    expect(westernTmSpecialHandBindings.map(({ patternId }) => patternId).filter((id) => !currentTruthIndex.treatmentsForProfile(profile).some(({ record }) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding' && record.runtimeState.ref.id === id))).toEqual(['purity-one-chow']);
  });
});
