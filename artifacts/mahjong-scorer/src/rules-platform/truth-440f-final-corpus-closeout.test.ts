import { describe, expect, it } from 'vitest';
import {
  assertTruthCorpusIntegrity,
  currentTruthCorpus,
  currentTruthIndex,
  currentTruthValidationEnvironment,
  validateTruthCorpus,
} from '../rules-knowledge/truth';
import {
  classicalHandValidation440c3aCoverage,
  classicalHandValidation440c3aUnresolved,
} from '../rules-knowledge/truth/classical-hand-validation-440c3a';
import {
  classicalSettlementProgressionIncident440c4Coverage,
  classicalSettlementProgressionIncident440c4Unresolved,
} from '../rules-knowledge/truth/classical-settlement-progression-incidents-440c4';
import { mcrE4CloseoutLedger } from './truth-mcr-e4-profile-closeout.test';
import { westernTm440dOrdinaryCoverage } from './truth-western-tm-440d-coverage.test';
import { bmjaSpecialHandBindings } from '../scoring/special-hands';
import { westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { outsideTheBoxSpecialHandBindings } from '../game/outside-the-box-catalogue';
import { buzzard2000SpecialHandBindings } from '../game/buzzard-2000';
import { MCR_2006_FAN_BINDINGS } from './mcr-detectors';
import { MCR_WMO_2006_PROFILE } from './mcr-profile';
import { currentPlayableProfiles } from './current-profiles';

const profiles = [
  { id: 'bmja', version: '1.0' },
  { id: 'western-tm', version: '0.1' },
  { id: 'outside-the-box', version: '0.1' },
  { id: 'buzzard-2000', version: '0.1' },
  { id: 'mcr-wmo-2006', version: '0.1' },
] as const;

const treatments = currentTruthCorpus.treatments.map(({ record }) => record);
const histogram = (values: readonly string[]) => Object.fromEntries(
  [...new Set(values)].sort().map((value) => [value, values.filter((item) => item === value).length]),
);
const treatmentStates = ['executable', 'absent-by-rule', 'present-not-modelled', 'unknown', 'not-applicable', 'migration-incomplete'] as const;
const treatmentStateCounts = Object.fromEntries(treatmentStates.map((state) => [
  state,
  treatments.filter(({ runtimeState }) => runtimeState.kind === state).length,
])) as Record<(typeof treatmentStates)[number], number>;
const executableByRefKind = histogram(treatments.flatMap(({ runtimeState }) =>
  runtimeState.kind === 'executable' ? [runtimeState.ref.kind] : [],
));
const profileTreatmentCounts = Object.fromEntries(profiles.map((profile) => [
  `${profile.id}@${profile.version}`,
  treatments.filter(({ profile: candidate }) => candidate.id === profile.id && candidate.version === profile.version).length,
]));

describe('Issue 440F final truth-corpus closeout', () => {
  it('freezes the assembled corpus and deterministic treatment accounting', () => {
    expect(currentTruthCorpus.subjects).toHaveLength(317);
    expect(currentTruthCorpus.claims).toHaveLength(380);
    expect(currentTruthCorpus.treatments).toHaveLength(378);
    expect(currentTruthCorpus.sources).toHaveLength(10);
    expect(new Set(treatmentStates).size).toBe(6);
    expect(Object.values(treatmentStateCounts).reduce((sum, count) => sum + count, 0)).toBe(378);
    expect(treatmentStateCounts.unknown).toBe(0);
    expect(profileTreatmentCounts).toEqual({
      'bmja@1.0': 62,
      'western-tm@0.1': 84,
      'outside-the-box@0.1': 85,
      'buzzard-2000@0.1': 56,
      'mcr-wmo-2006@0.1': 91,
    });
    expect(Object.values(profileTreatmentCounts).reduce((sum, count) => sum + count, 0)).toBe(378);
    expect(treatmentStateCounts).toEqual({
      executable: 227,
      'absent-by-rule': 0,
      'present-not-modelled': 5,
      unknown: 0,
      'not-applicable': 0,
      'migration-incomplete': 146,
    });
    expect(executableByRefKind).toEqual({ binding: 225, policy: 2 });
    expect(treatments.filter(({ runtimeState }) => runtimeState.kind === 'present-not-modelled').map(({ treatmentId, subjectId }) => ({ treatmentId, subjectId })).sort((a, b) => a.treatmentId.localeCompare(b.treatmentId))).toEqual([
      { treatmentId: 'bmja@1.0:rule.bmja.dead-wanted-tile-does-not-remove-fishing-eligibility', subjectId: 'rule.bmja.dead-wanted-tile-does-not-remove-fishing-eligibility' },
      { treatmentId: 'outside-the-box@0.1:rule.otb.earthly-hand-limit-event', subjectId: 'rule.otb.earthly-hand-limit-event' },
      { treatmentId: 'outside-the-box@0.1:rule.otb.first-wall-draw-limit-event', subjectId: 'rule.otb.first-wall-draw-limit-event' },
      { treatmentId: 'outside-the-box@0.1:rule.otb.heavenly-hand-limit-event', subjectId: 'rule.otb.heavenly-hand-limit-event' },
      { treatmentId: 'outside-the-box@0.1:rule.otb.only-possible-winning-tile-bonus', subjectId: 'rule.otb.only-possible-winning-tile-bonus' },
    ]);
  });

  it('joins current special-hand truth to every frozen runtime inventory and preserves only the two named deferrals', () => {
    const special = [
      { profile: profiles[0], bindings: bmjaSpecialHandBindings.map(({ patternId }) => patternId), expectedBindings: 18, expectedTreatments: 18 },
      { profile: profiles[1], bindings: westernTmSpecialHandBindings.map(({ patternId }) => patternId), expectedBindings: 85, expectedTreatments: 84 },
      { profile: profiles[2], bindings: outsideTheBoxSpecialHandBindings.map(({ patternId }) => patternId), expectedBindings: 33, expectedTreatments: 33 },
      { profile: profiles[3], bindings: buzzard2000SpecialHandBindings.map(({ patternId }) => patternId), expectedBindings: 10, expectedTreatments: 9 },
    ];
    let totalBindings = 0;
    let totalTreatments = 0;
    const gaps: string[] = [];
    for (const { profile, bindings, expectedBindings, expectedTreatments } of special) {
      const executable = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record).filter(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding');
      const refs = executable.flatMap(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? [runtimeState.ref.id] : []);
      const missing = bindings.filter((binding) => !refs.includes(binding));
      expect(bindings).toHaveLength(expectedBindings);
      expect(refs).toHaveLength(expectedTreatments);
      expect(new Set(refs).size).toBe(expectedTreatments);
      expect(refs.sort()).toEqual(bindings.filter((binding) => !missing.includes(binding)).sort());
      for (const record of executable) {
        if (record.runtimeState.kind === 'executable') expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, record.runtimeState.ref)).toBe(true);
      }
      totalBindings += bindings.length;
      totalTreatments += refs.length;
      gaps.push(...missing.map((binding) => `${profile.id}:${binding}`));
    }
    expect(totalBindings).toBe(146);
    expect(totalTreatments).toBe(144);
    expect(gaps.sort()).toEqual(['buzzard-2000:four-concealed-pung-kong-hand', 'western-tm:purity-one-chow']);
    expect(currentTruthCorpus.treatments.some(({ record }) => record.treatmentId === 'western-tm@0.1:purity-one-chow')).toBe(false);
    expect(currentTruthCorpus.treatments.some(({ record }) => record.treatmentId === 'buzzard-2000@0.1:four-concealed-pung-kong-hand')).toBe(false);
  });

  it('accounts for MCR fan bindings, policies and E4 profile-semantic treatments separately', () => {
    const profile = profiles[4];
    const exact = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const fan = exact.filter(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding');
    const policies = exact.filter(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'policy');
    const semantics = exact.filter(({ runtimeState }) => runtimeState.kind === 'migration-incomplete');
    expect(MCR_2006_FAN_BINDINGS).toHaveLength(81);
    expect(fan).toHaveLength(81);
    expect(new Set(fan.flatMap(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? [runtimeState.ref.id] : []))).toEqual(new Set(MCR_2006_FAN_BINDINGS.map(({ id }) => id)));
    expect(policies.map(({ treatmentId }) => treatmentId).sort()).toEqual(['mcr-wmo-2006@0.1:eight-point-qualification', 'mcr-wmo-2006@0.1:non-combination']);
    expect(semantics).toHaveLength(8);
    expect(exact).toHaveLength(91);
    expect(MCR_WMO_2006_PROFILE.identity.status).toBe('provisional');
    expect(currentPlayableProfiles.some(({ identity }) => identity.id === 'mcr-wmo-2006')).toBe(false);
  });

  it('derives the 66 source-blocked rows from the frozen Western, C3A, C4 and E4 inventories', () => {
    const western = westernTm440dOrdinaryCoverage.filter(([, , , disposition]) => disposition === 'needs-primary-source');
    const c3a = classicalHandValidation440c3aUnresolved;
    const c4 = classicalSettlementProgressionIncident440c4Unresolved;
    const e4 = mcrE4CloseoutLedger.filter(({ disposition }) => disposition === 'source-unresolved');
    expect(western).toHaveLength(54);
    expect(histogram(western.map(([, domain]) => domain))).toEqual({
      'Calling and hand legality': 6,
      'Goulash, incidents and procedure': 9,
      'Ordinary doubles and calculated scoring': 15,
      'Ordinary point scoring': 9,
      'Settlement and progression': 8,
      'Setup and hand model': 7,
    });
    expect(c3a).toHaveLength(3);
    expect(c4).toHaveLength(8);
    expect(e4).toHaveLength(1);
    expect(western.length + c3a.length + c4.length + e4.length).toBe(66);
    expect(classicalHandValidation440c3aCoverage.filter(({ evidenceStatus }) => evidenceStatus === 'source-unresolved')).toHaveLength(3);
    expect(classicalSettlementProgressionIncident440c4Coverage.filter(({ evidenceStatus }) => evidenceStatus === 'source-unresolved')).toHaveLength(8);
    for (const row of c3a) {
      expect(currentTruthCorpus.claims.some(({ record }) => record.subjectId === row.subjectId && record.supportsProfile?.id === row.profile.id)).toBe(false);
      expect(currentTruthCorpus.treatments.some(({ record }) => record.subjectId === row.subjectId && record.profile.id === row.profile.id)).toBe(false);
    }
    for (const row of c4) {
      expect(currentTruthCorpus.claims.some(({ record }) => record.subjectId === row.subjectId && record.supportsProfile?.id === row.profile)).toBe(false);
      expect(currentTruthCorpus.treatments.some(({ record }) => record.subjectId === row.subjectId && record.profile.id === row.profile)).toBe(false);
    }
    expect(currentTruthCorpus.claims.some(({ record }) => record.subjectId.includes('draw-has-no-settlement') && record.supportsProfile?.id === 'mcr-wmo-2006')).toBe(false);
    expect(currentTruthCorpus.treatments.some(({ record }) => record.subjectId.includes('draw-has-no-settlement') && record.profile.id === 'mcr-wmo-2006')).toBe(false);
  });

  it('proves uniqueness, evidence, exact-profile, executable-edge and lifecycle integrity', () => {
    expect(new Set(currentTruthCorpus.subjects.map(({ record }) => record.id)).size).toBe(317);
    expect(new Set(currentTruthCorpus.claims.map(({ record }) => record.claimId)).size).toBe(380);
    expect(new Set(treatments.map(({ treatmentId }) => treatmentId)).size).toBe(378);
    expect(validateTruthCorpus(currentTruthCorpus, currentTruthValidationEnvironment)).toEqual([]);
    expect(() => assertTruthCorpusIntegrity(currentTruthCorpus, currentTruthValidationEnvironment)).not.toThrow();
    for (const { record } of currentTruthCorpus.claims) expect(currentTruthIndex.sourceById(record.sourceId)).toBeDefined();
    for (const treatment of treatments) {
      expect(profiles.some(({ id, version }) => id === treatment.profile.id && version === treatment.profile.version)).toBe(true);
      expect(treatment.evidenceClaimIds.length).toBeGreaterThan(0);
      expect(treatment.evidenceClaimIds.every((claimId) => currentTruthIndex.claimById(claimId)?.record.subjectId === treatment.subjectId)).toBe(true);
      if (treatment.runtimeState.kind === 'executable') expect(currentTruthValidationEnvironment.runtimeTreatmentExists(treatment.profile, treatment.runtimeState.ref)).toBe(true);
      expect(['value', 'points', 'fanValue', 'score'].some((key) => key in treatment)).toBe(false);
    }
    expect(currentTruthCorpus.subjects.some(({ record }) => record.kind === 'policy' as never)).toBe(false);
    expect(currentTruthCorpus.sources.some(({ record }) => record.sourceId === 'tm-game-illustrated')).toBe(false);
    expect(currentTruthCorpus.claims.some(({ record }) => record.sourceId === 'tm-game-illustrated')).toBe(false);
    const westernOrdinaryIds = new Set<string>(westernTm440dOrdinaryCoverage.map(([candidateId]) => candidateId));
    expect(currentTruthCorpus.claims.some(({ record }) => record.supportsProfile?.id === 'western-tm' && westernOrdinaryIds.has(record.subjectId))).toBe(false);
    expect(treatments.some(({ profile, subjectId }) => profile.id === 'western-tm' && westernOrdinaryIds.has(subjectId))).toBe(false);
    expect(MCR_WMO_2006_PROFILE.identity).toMatchObject({ id: 'mcr-wmo-2006', version: '0.1', status: 'provisional' });
    for (const record of [...currentTruthCorpus.subjects, ...currentTruthCorpus.claims, ...currentTruthCorpus.treatments]) {
      expect(record.schemaVersion).toBe(0);
      expect(record.recordVersion).toBeGreaterThan(0);
      expect(record.recordId).toBeTruthy();
    }
  });
});
