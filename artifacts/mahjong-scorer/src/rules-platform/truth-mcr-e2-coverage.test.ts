import { describe, expect, it } from 'vitest';
import { currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment } from '../rules-knowledge/truth';
import { mcrFanE1Bindings } from '../rules-knowledge/truth/subjects/mcr-fan-e1';
import { mcrFanE2Bindings } from '../rules-knowledge/truth/subjects/mcr-fan-e2';
import { MCR_2006_FAN_BINDINGS } from './mcr-detectors';

const profile = { id: 'mcr-wmo-2006', version: '0.1' } as const;
const sourceId = 'source.mcr-ema-green-book-2006';

describe('Issue 440E2 MCR fan truth coverage', () => {
  it('covers canonical formal positions 28–54 and cumulatively 1–54', () => {
    const cohort = MCR_2006_FAN_BINDINGS.slice(27, 54);
    const allFirst54 = MCR_2006_FAN_BINDINGS.slice(0, 54);
    const profileTreatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const fanTreatments = profileTreatments.filter((record) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding');
    const fanIds = fanTreatments.flatMap(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? [runtimeState.ref.id] : []);
    const e2SubjectIds = new Set(cohort.map((binding) => `pattern.mcr-wmo-2006.${binding.id.slice('mcr2006.fan.'.length)}`));
    const e2Claims = currentTruthIndex.claimsSupportingProfile(profile).map(({ record }) => record)
      .filter((claim) => claim.sourceId === sourceId && e2SubjectIds.has(claim.subjectId));

    expect(MCR_2006_FAN_BINDINGS).toHaveLength(81);
    expect(cohort).toHaveLength(27);
    expect(mcrFanE2Bindings).toHaveLength(27);
    expect(e2Claims).toHaveLength(27);
    expect(fanTreatments).toHaveLength(54);
    expect(new Set(fanIds)).toEqual(new Set(allFirst54.map(({ id }) => id)));
    expect(mcrFanE1Bindings).toHaveLength(26);

    for (const [index, binding] of cohort.entries()) {
      const fanNumber = index + 28;
      const slug = binding.id.slice('mcr2006.fan.'.length);
      const subjectId = `pattern.mcr-wmo-2006.${slug}`;
      const claimId = `evidence.pattern.mcr-wmo-2006.${slug}`;
      const treatmentId = `mcr-wmo-2006@0.1:${slug}`;
      expect(currentTruthIndex.subjectById(subjectId)?.record).toEqual({ id: subjectId, kind: 'pattern' });
      expect(currentTruthIndex.claimById(claimId)?.record).toMatchObject({
        claimId,
        subjectId,
        sourceId,
        status: 'verified',
        supportsProfile: profile,
        locator: { kind: 'publication', section: `§3.8.1 #${fanNumber}; Appendix 1 #${fanNumber}` },
      });
      expect(currentTruthIndex.treatmentById(treatmentId)?.record).toMatchObject({
        treatmentId,
        profile,
        subjectId,
        runtimeState: { kind: 'executable', ref: { kind: 'binding', id: binding.id } },
        evidenceClaimIds: [claimId],
      });
      expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, { kind: 'binding', id: binding.id })).toBe(true);
    }

    expect(currentTruthCorpus.sources.filter(({ record }) => record.sourceId === sourceId)).toHaveLength(1);
    expect(currentTruthIndex.treatmentsForSubject('pattern.thirteen-orphans').filter(({ record }) => record.treatmentId === 'mcr-wmo-2006@0.1:thirteen-orphans')).toHaveLength(1);
    expect(currentTruthIndex.treatmentById('mcr-wmo-2006@0.1:thirteen-orphans')?.record.runtimeState).toEqual({ kind: 'executable', ref: { kind: 'binding', id: 'mcr2006.fan.thirteen-orphans' } });
  });

  it('preserves E1 and both policies without truth values or cross-profile leakage', () => {
    const e1Cohort = MCR_2006_FAN_BINDINGS.slice(0, 27);
    const profileTreatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const fanRefs = profileTreatments.flatMap(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? [runtimeState.ref.id] : []);
    const policyTreatments = profileTreatments.filter(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'policy');
    const forbiddenKeys = ['value', 'points', 'fanValue', 'score'];

    expect(fanRefs).toHaveLength(54);
    expect(e1Cohort.every((binding, index) => {
      const subjectId = index === 6 ? 'pattern.thirteen-orphans' : `pattern.mcr-wmo-2006.${binding.id.slice('mcr2006.fan.'.length)}`;
      const claimId = index === 6 ? 'evidence.pattern.thirteen-orphans.mcr-wmo-2006' : `evidence.pattern.mcr-wmo-2006.${binding.id.slice('mcr2006.fan.'.length)}`;
      const treatmentId = `mcr-wmo-2006@0.1:${binding.id.slice('mcr2006.fan.'.length)}`;
      const treatment = currentTruthIndex.treatmentById(treatmentId)?.record;
      const runtimeState = treatment?.runtimeState;
      return currentTruthIndex.claimById(claimId)?.record.subjectId === subjectId
        && runtimeState?.kind === 'executable'
        && runtimeState.ref.kind === 'binding'
        && runtimeState.ref.id === binding.id;
    })).toBe(true);
    expect(fanRefs.filter((id) => e1Cohort.some((binding) => binding.id === id))).toHaveLength(27);
    expect(policyTreatments.map(({ treatmentId, subjectId, runtimeState, evidenceClaimIds }) => ({ treatmentId, subjectId, runtimeState, evidenceClaimIds })).sort((a, b) => a.treatmentId.localeCompare(b.treatmentId))).toEqual([
      { treatmentId: 'mcr-wmo-2006@0.1:eight-point-qualification', subjectId: 'rule.mcr-8-before-flowers', runtimeState: { kind: 'executable', ref: { kind: 'policy', id: 'qualification.mcr-8-before-flowers' } }, evidenceClaimIds: ['evidence.rule.mcr-8-before-flowers'] },
      { treatmentId: 'mcr-wmo-2006@0.1:non-combination', subjectId: 'rule.mcr-2006-non-combination', runtimeState: { kind: 'executable', ref: { kind: 'policy', id: 'interaction.mcr-2006-non-combination' } }, evidenceClaimIds: ['evidence.rule.mcr-2006-non-combination'] },
    ]);
    expect(currentTruthCorpus.subjects.some(({ record }) => forbiddenKeys.some((key) => key in record))).toBe(false);
    expect(currentTruthCorpus.claims.some(({ record }) => forbiddenKeys.some((key) => key in record))).toBe(false);
    expect(currentTruthCorpus.treatments.some(({ record }) => forbiddenKeys.some((key) => key in record))).toBe(false);

    const allMcrBindings = new Set(MCR_2006_FAN_BINDINGS.map(({ id }) => id));
    for (const otherProfile of [{ id: 'bmja', version: '1.0' }, { id: 'western-tm', version: '0.1' }, { id: 'outside-the-box', version: '0.1' }, { id: 'buzzard-2000', version: '0.1' }] as const) {
      const refs = currentTruthIndex.treatmentsForProfile(otherProfile).flatMap(({ record }) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding' ? [record.runtimeState.ref.id] : []);
      expect(refs.some((id) => allMcrBindings.has(id))).toBe(false);
    }
  });
});
