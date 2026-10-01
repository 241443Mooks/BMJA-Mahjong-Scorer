import { describe, expect, it } from 'vitest';
import { currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment } from '../rules-knowledge/truth';
import { mcrFanE1Bindings } from '../rules-knowledge/truth/subjects/mcr-fan-e1';
import { MCR_2006_FAN_BINDINGS } from './mcr-detectors';

const profile = { id: 'mcr-wmo-2006', version: '0.1' } as const;

describe('Issue 440E1 MCR fan truth coverage', () => {
  it('covers formal fan positions 1–27 from the canonical runtime inventory', () => {
    const cohort = MCR_2006_FAN_BINDINGS.slice(0, 27);
    const profileTreatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const e1BindingIds = new Set(MCR_2006_FAN_BINDINGS.slice(0, 27).map(({ id }) => id));
    const fanTreatments = profileTreatments.filter((record) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding' && e1BindingIds.has(record.runtimeState.ref.id));
    const fanBindings = fanTreatments.flatMap(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? [runtimeState.ref.id] : []);
    const claims = currentTruthIndex.claimsSupportingProfile(profile).map(({ record }) => record);
    const e1Subjects = new Set(MCR_2006_FAN_BINDINGS.slice(0, 27).map((binding, index) => index === 6 ? 'pattern.thirteen-orphans' : `pattern.mcr-wmo-2006.${binding.id.slice('mcr2006.fan.'.length)}`));

    expect(MCR_2006_FAN_BINDINGS).toHaveLength(81);
    expect(cohort).toHaveLength(27);
    expect(new Set(fanBindings)).toEqual(new Set(cohort.map(({ id }) => id)));
    expect(mcrFanE1Bindings).toHaveLength(26);
    expect(fanTreatments).toHaveLength(27);
    const e1Claims = claims.filter(({ sourceId, subjectId }) => sourceId === 'source.mcr-ema-green-book-2006'
      && (e1Subjects.has(subjectId) || subjectId === 'rule.mcr-2006-non-combination' || subjectId === 'rule.mcr-8-before-flowers'));
    expect(e1Claims).toHaveLength(29);

    for (const [index, binding] of cohort.entries()) {
      const number = index + 1;
      const subjectId = number === 7 ? 'pattern.thirteen-orphans' : `pattern.mcr-wmo-2006.${binding.id.slice('mcr2006.fan.'.length)}`;
      const claimId = number === 7 ? 'evidence.pattern.thirteen-orphans.mcr-wmo-2006' : `evidence.pattern.mcr-wmo-2006.${binding.id.slice('mcr2006.fan.'.length)}`;
      const treatmentId = `mcr-wmo-2006@0.1:${binding.id.slice('mcr2006.fan.'.length)}`;
      const claim = currentTruthIndex.claimById(claimId)?.record;
      const treatment = currentTruthIndex.treatmentById(treatmentId)?.record;

      expect(currentTruthIndex.subjectById(subjectId)).toBeDefined();
      expect(claim).toMatchObject({
        subjectId,
        sourceId: 'source.mcr-ema-green-book-2006',
        status: 'verified',
        supportsProfile: profile,
        locator: { kind: 'publication', section: `§3.8.1 #${number}; Appendix 1 #${number}` },
      });
      expect(treatment).toMatchObject({
        treatmentId,
        profile,
        subjectId,
        runtimeState: { kind: 'executable', ref: { kind: 'binding', id: binding.id } },
        evidenceClaimIds: [claimId],
      });
      expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, { kind: 'binding', id: binding.id })).toBe(true);
    }

    expect(currentTruthIndex.treatmentsForSubject('pattern.thirteen-orphans').filter(({ record }) => record.treatmentId === 'mcr-wmo-2006@0.1:thirteen-orphans')).toHaveLength(1);
    expect(mcrFanE1Bindings.every(({ fanNumber }) => fanNumber !== 7)).toBe(true);
    expect(mcrFanE1Bindings.map(({ fanNumber }) => fanNumber)).toEqual(cohort.map((_, index) => index + 1).filter((number) => number !== 7));
  });

  it('keeps fan points out of truth records and leaves policy and other profile ownership unchanged', () => {
    const mcrTreatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const policyTreatments = mcrTreatments.filter(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'policy');
    const bindingIds = new Set(MCR_2006_FAN_BINDINGS.map(({ id }) => id));
    const forbiddenKeys = ['value', 'points', 'fanValue', 'score'];

    expect(policyTreatments.map(({ treatmentId, subjectId, runtimeState, evidenceClaimIds }) => ({ treatmentId, subjectId, runtimeState, evidenceClaimIds })).sort((a, b) => a.treatmentId.localeCompare(b.treatmentId))).toEqual([
      { treatmentId: 'mcr-wmo-2006@0.1:eight-point-qualification', subjectId: 'rule.mcr-8-before-flowers', runtimeState: { kind: 'executable', ref: { kind: 'policy', id: 'qualification.mcr-8-before-flowers' } }, evidenceClaimIds: ['evidence.rule.mcr-8-before-flowers'] },
      { treatmentId: 'mcr-wmo-2006@0.1:non-combination', subjectId: 'rule.mcr-2006-non-combination', runtimeState: { kind: 'executable', ref: { kind: 'policy', id: 'interaction.mcr-2006-non-combination' } }, evidenceClaimIds: ['evidence.rule.mcr-2006-non-combination'] },
    ]);
    expect(currentTruthCorpus.subjects.some(({ record }) => forbiddenKeys.some((key) => key in record))).toBe(false);
    expect(currentTruthCorpus.claims.some(({ record }) => forbiddenKeys.some((key) => key in record))).toBe(false);
    expect(currentTruthCorpus.treatments.some(({ record }) => forbiddenKeys.some((key) => key in record))).toBe(false);
    expect(currentTruthIndex.treatmentsForProfile(profile).filter(({ record }) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding').every(({ record }) => record.profile.id === 'mcr-wmo-2006')).toBe(true);
    for (const otherProfile of [{ id: 'bmja', version: '1.0' }, { id: 'western-tm', version: '0.1' }, { id: 'outside-the-box', version: '0.1' }, { id: 'buzzard-2000', version: '0.1' }] as const) {
      const bindings = currentTruthIndex.treatmentsForProfile(otherProfile).flatMap(({ record }) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding' ? [record.runtimeState.ref.id] : []);
      expect(bindings.some((id) => bindingIds.has(id))).toBe(false);
    }
  });
});
