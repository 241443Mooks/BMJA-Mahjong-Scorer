import { describe, expect, it } from 'vitest';
import { buzzard2000SpecialHandBindings } from '../game/buzzard-2000';
import { outsideTheBoxSpecialHandBindings } from '../game/outside-the-box-catalogue';
import { westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment } from '../rules-knowledge/truth';
import { bmjaSpecialHandBindings } from '../scoring/special-hands';
import { MCR_2006_FAN_BINDINGS } from './mcr-detectors';

const classicalInventories = [
  { profile: { id: 'bmja', version: '1.0' }, bindings: bmjaSpecialHandBindings },
  { profile: { id: 'western-tm', version: '0.1' }, bindings: westernTmSpecialHandBindings },
  { profile: { id: 'outside-the-box', version: '0.1' }, bindings: outsideTheBoxSpecialHandBindings },
  { profile: { id: 'buzzard-2000', version: '0.1' }, bindings: buzzard2000SpecialHandBindings },
] as const;

describe('Issue 440A derived coverage accounting', () => {
  it('joins all current Classical special-hand inventory IDs to exact-profile truth or leaves them visibly unrecorded', () => {
    for (const { profile, bindings } of classicalInventories) {
      const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
      const executableIds = new Set(treatments.flatMap((record) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding' ? [record.runtimeState.ref.id] : []));
      const inventoryIds = new Set(bindings.map(({ patternId }) => patternId));
      expect(executableIds.size).toBe(treatments.length);
      for (const id of executableIds) expect(inventoryIds.has(id)).toBe(true);
      expect(bindings.length).toBeGreaterThan(0);
    }
    expect(classicalInventories.map(({ profile }) => currentTruthIndex.treatmentsForProfile(profile).length)).toEqual([1, 1, 1, 1]);
    expect(classicalInventories.map(({ bindings }) => bindings.length)).toEqual([18, 85, 33, 10]);
  });

  it('accounts for the complete MCR fan catalogue without copying its scoring values', () => {
    const profile = { id: 'mcr-wmo-2006', version: '0.1' } as const;
    const bindings = new Set(MCR_2006_FAN_BINDINGS.map(({ id }) => id));
    const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const migratedFanIds = treatments.flatMap((record) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding' ? [record.runtimeState.ref.id] : []);
    expect(MCR_2006_FAN_BINDINGS).toHaveLength(81);
    expect(new Set(migratedFanIds).size).toBe(1);
    expect(migratedFanIds.every((id) => bindings.has(id))).toBe(true);
    expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, { kind: 'binding', id: migratedFanIds[0]! })).toBe(true);
  });

  it('records the exact currently supported policy edge and migrated-treatment count', () => {
    const profile = { id: 'mcr-wmo-2006', version: '0.1' } as const;
    const policyTreatments = currentTruthIndex.treatmentsForProfile(profile)
      .map(({ record }) => record)
      .filter(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'policy');
    expect(policyTreatments.map(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'policy' ? runtimeState.ref.id : '').sort()).toEqual([
      'interaction.mcr-2006-non-combination',
      'qualification.mcr-8-before-flowers',
    ].sort());
    for (const { runtimeState } of policyTreatments) {
      if (runtimeState.kind === 'executable') expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, runtimeState.ref)).toBe(true);
    }
    expect(currentTruthCorpus.treatments).toHaveLength(7);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'bmja', version: '1.0' })).toHaveLength(1);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'western-tm', version: '0.1' })).toHaveLength(1);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'outside-the-box', version: '0.1' })).toHaveLength(1);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'buzzard-2000', version: '0.1' })).toHaveLength(1);
  });
});
