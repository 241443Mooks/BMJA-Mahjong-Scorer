import { describe, expect, it } from 'vitest';
import { buzzard2000SpecialHandBindings } from '../game/buzzard-2000';
import { outsideTheBoxSpecialHandBindings } from '../game/outside-the-box-catalogue';
import { westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment } from '../rules-knowledge/truth';
import { westernTmB4aBindingIds } from '../rules-knowledge/truth/subjects/western-tm-b4a-special-hands';
import { westernTmB4bBindingIds } from '../rules-knowledge/truth/subjects/western-tm-b4b-pairs-winds';
import { westernTmB4cBindingIds } from '../rules-knowledge/truth/subjects/western-tm-b4c-dragons-honours-colours';
import { westernTmB4dBindingIds } from '../rules-knowledge/truth/subjects/western-tm-b4d-calculated-special-hands';
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
      const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record).filter(({ runtimeState }) => runtimeState.kind === 'executable');
      const executableIds = new Set(treatments.flatMap((record) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding' ? [record.runtimeState.ref.id] : []));
      const inventoryIds = new Set(bindings.map(({ patternId }) => patternId));
      expect(executableIds.size).toBe(treatments.length);
      for (const id of executableIds) expect(inventoryIds.has(id)).toBe(true);
      expect(bindings.length).toBeGreaterThan(0);
    }
    expect(classicalInventories.map(({ profile }) => currentTruthIndex.treatmentsForProfile(profile).filter(({ record }) => record.runtimeState.kind === 'executable').length)).toEqual([18, 84, 33, 9]);
    expect(classicalInventories.map(({ bindings }) => bindings.length)).toEqual([18, 85, 33, 10]);
  });

  it('partitions Western coverage into existing, B4A, B4B, B4C, B4D, and one documented runtime-equivalence deferral', () => {
    const profile = { id: 'western-tm', version: '0.1' } as const;
    const inventoryIds = westernTmSpecialHandBindings.map(({ patternId }) => patternId);
    const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record).filter(({ runtimeState }) => runtimeState.kind === 'executable');
    const executableIds = treatments.flatMap(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? [runtimeState.ref.id] : []);
    const alreadyCurrent = ['thirteen-unique-wonders'];
    const deferred = ['purity-one-chow'];
    const b4d = new Set<string>(westernTmB4dBindingIds.filter((id) => id !== 'purity-one-chow'));
    const b4b = new Set<string>(westernTmB4bBindingIds);
    const b4c = new Set<string>(westernTmB4cBindingIds);
    const migratedB4a = new Set<string>(westernTmB4aBindingIds);
    const untreated = inventoryIds.filter((id) => !executableIds.includes(id));
    const expectedB4c = [
      'all-winds-and-dragons', 'east-wind-meld-white-dragon-pair-three-suit-nonterminal-melds',
      'green-and-white-dragon-melds-with-green-bamboo', 'green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow',
      'green-dragon-pung-white-dragon-pair-three-circle-melds', 'green-dragon-pung-with-bamboo-melds',
      'green-dragon-pung-with-blue-circle-melds', 'heads-and-tails', 'one-suit-odd-melds',
      'own-wind-meld-with-dragon-pair-and-three-suit-chows', 'parallel-suit-rank-melds-with-honours',
      'red-and-green-dragon-melds-with-bamboo', 'red-and-green-dragon-pungs-with-three-suits',
      'red-and-white-dragon-melds-with-red-bamboo', 'red-dragon-meld-with-red-bamboo-melds',
      'red-dragon-pung-with-character-melds', 'red-dragon-pung-with-even-character-melds',
      'red-white-dragon-pungs-with-seven-tile-character-or-circle-run-pair',
      'three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair', 'three-great-scholars',
      'two-odd-suits-and-one-even-suit', 'two-ranks-doubled-across-two-suits-with-honour-pair',
      'white-dragon-meld-red-dragon-pair-three-suit-nonterminal-melds',
      'white-dragon-meld-with-even-circle-melds', 'white-dragon-pung-with-circle-melds',
      'white-dragon-pung-with-odd-character-melds',
    ];

    expect(westernTmSpecialHandBindings).toHaveLength(85);
    expect(new Set(westernTmB4aBindingIds).size).toBe(34);
    expect(new Set(westernTmB4bBindingIds).size).toBe(21);
    expect(b4c.size).toBe(26);
    expect([...b4c].sort()).toEqual(expectedB4c.sort());
    expect(new Set(executableIds)).toEqual(new Set([...alreadyCurrent, ...migratedB4a, ...b4b, ...b4c, ...b4d]));
    expect(westernTmB4dBindingIds).toHaveLength(3);
    expect(westernTmB4dBindingIds.every((id) => currentTruthIndex.claimsForSubject(`pattern.western-tm.${id}`).length > 0)).toBe(true);
    expect(deferred).toHaveLength(1);
    expect(deferred.every((id) => inventoryIds.includes(id))).toBe(true);
    expect(deferred.some((id) => executableIds.includes(id))).toBe(false);
    expect(untreated.sort()).toEqual([...deferred].sort());
    expect([alreadyCurrent.length, migratedB4a.size, b4b.size, b4c.size, b4d.size, deferred.length]).toEqual([1, 34, 21, 26, 2, 1]);
    expect(alreadyCurrent.length + migratedB4a.size + b4b.size + b4c.size + b4d.size + deferred.length).toBe(85);
    expect(treatments).toHaveLength(84);
  });

  it('accounts for Buzzard special-hand coverage while keeping Concealed Pungs/Kongs visibly deferred', () => {
    const profile = { id: 'buzzard-2000', version: '0.1' } as const;
    const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record).filter(({ runtimeState }) => runtimeState.kind === 'executable');
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
    expect(new Set(migratedFanIds).size).toBe(27);
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
    expect(currentTruthCorpus.treatments).toHaveLength(316);
    expect(currentTruthCorpus.subjects).toHaveLength(255);
    expect(currentTruthCorpus.claims).toHaveLength(318);
  });
});
