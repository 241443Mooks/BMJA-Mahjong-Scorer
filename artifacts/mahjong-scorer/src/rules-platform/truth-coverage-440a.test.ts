import { describe, expect, it } from 'vitest';
import { buzzard2000SpecialHandBindings } from '../game/buzzard-2000';
import { outsideTheBoxSpecialHandBindings } from '../game/outside-the-box-catalogue';
import { westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment } from '../rules-knowledge/truth';
import { westernTmB4aBindingIds } from '../rules-knowledge/truth/subjects/western-tm-b4a-special-hands';
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
    expect(classicalInventories.map(({ profile }) => currentTruthIndex.treatmentsForProfile(profile).length)).toEqual([18, 35, 33, 9]);
    expect(classicalInventories.map(({ bindings }) => bindings.length)).toEqual([18, 85, 33, 10]);
  });

  it('partitions Western coverage into existing, B4A, remaining eligible B4B/C, and deferred bindings', () => {
    const profile = { id: 'western-tm', version: '0.1' } as const;
    const inventoryIds = westernTmSpecialHandBindings.map(({ patternId }) => patternId);
    const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const executableIds = treatments.flatMap(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? [runtimeState.ref.id] : []);
    const alreadyCurrent = ['thirteen-unique-wonders'];
    const deferred = ['purity-one-chow', 'honours-and-one-suit-terminals-pung-kong-hand', 'one-suit-with-honours-mostly-pung-kong-hand'];
    const migratedB4a = new Set<string>(westernTmB4aBindingIds);
    const remainingEligibleB4bC = inventoryIds.filter((id) => !alreadyCurrent.includes(id) && !migratedB4a.has(id) && !deferred.includes(id));

    expect(westernTmSpecialHandBindings).toHaveLength(85);
    expect(new Set(westernTmB4aBindingIds).size).toBe(34);
    expect(new Set(executableIds)).toEqual(new Set([...alreadyCurrent, ...migratedB4a]));
    expect(remainingEligibleB4bC).toHaveLength(47);
    expect(deferred).toHaveLength(3);
    expect(deferred.every((id) => inventoryIds.includes(id))).toBe(true);
    expect(deferred.some((id) => executableIds.includes(id))).toBe(false);
    expect(alreadyCurrent.length + migratedB4a.size + remainingEligibleB4bC.length + deferred.length).toBe(85);
    expect(treatments).toHaveLength(35);
  });

  it('accounts for Buzzard special-hand coverage while keeping Concealed Pungs/Kongs visibly deferred', () => {
    const profile = { id: 'buzzard-2000', version: '0.1' } as const;
    const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const executableIds = treatments.flatMap(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? [runtimeState.ref.id] : []);
    const inventoryIds = buzzard2000SpecialHandBindings.map(({ patternId }) => patternId);
    expect(buzzard2000SpecialHandBindings).toHaveLength(10);
    expect(treatments).toHaveLength(9);
    expect([...executableIds].sort()).toEqual(inventoryIds.filter((id) => id !== 'four-concealed-pung-kong-hand').sort());
    expect(inventoryIds.filter((id) => !executableIds.includes(id))).toEqual(['four-concealed-pung-kong-hand']);
    expect(treatments.some(({ treatmentId }) => treatmentId === 'buzzard-2000@0.1:thirteen-unique-wonders')).toBe(true);
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
    expect(currentTruthCorpus.treatments).toHaveLength(98);
    expect(currentTruthCorpus.subjects).toHaveLength(94);
    expect(currentTruthCorpus.claims).toHaveLength(99);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'bmja', version: '1.0' })).toHaveLength(18);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'western-tm', version: '0.1' })).toHaveLength(35);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'outside-the-box', version: '0.1' })).toHaveLength(33);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'buzzard-2000', version: '0.1' })).toHaveLength(9);
  });
});
