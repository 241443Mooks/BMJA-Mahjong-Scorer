import { describe, expect, it } from 'vitest';
import { currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment } from '../rules-knowledge/truth';
import { westernTmB4aSpecialHandClaims } from '../rules-knowledge/truth/claims/western-tm-b4a-special-hands';
import { westernTmB4aBindingIds } from '../rules-knowledge/truth/subjects/western-tm-b4a-special-hands';
import { westernTmB4aSpecialHandSubjects } from '../rules-knowledge/truth/subjects/western-tm-b4a-special-hands';
import { westernTmB4aSpecialHandTreatments } from '../rules-knowledge/truth/treatments/western-tm-b4a-special-hands';
import { westernTmSpecialHandBindings } from '../game/western-tm-catalogue';

const expectedBindingIds = [
  'wriggly-dragon',
  'suit-run-one-to-seven-with-winds-and-dragon-pung',
  'full-suit-run-with-dragon-singles-and-wind-pair',
  'two-suit-pairs-and-chows-one-two-five-six-nine',
  'three-suit-chows-with-suited-meld-and-pair',
  'circle-chows-with-one-two-three-four-five-six-seven-eight-nine',
  'wriggling-snake-any-pair',
  'hachi-ban',
  'run-two-to-eight-with-one-and-nine-pungs',
  'full-suit-run-with-five-distinct-honours',
  'suit-run-one-to-seven-with-all-honours',
  'run-one-to-nine-with-same-suit-pung-and-pair',
  'run-one-to-nine-with-wind-pung-and-pair',
  'run-one-to-nine-with-dragon-pung-and-pair',
  'run-one-to-nine-with-honour-pung-and-any-pair',
  'full-suit-run-with-honour-pung-and-opposite-honour-pair',
  'four-chows-three-suits-one-two-one',
  'two-suit-knitting',
  'three-suit-knitting-with-pair',
  'western-gates-of-heaven',
  'two-suit-runs-one-to-seven',
  'north-south-wind-melds-with-1861-and-1865-two-suit-layout',
  'two-to-eight-run-pair-with-terminal-meld-and-corresponding-dragon-meld',
  'one-to-seven-run-pair-with-red-dragon-and-own-wind-melds',
  'three-suit-chows-with-mixed-chow-and-suited-pair',
  'four-mixed-chows-with-mixed-pair',
  'white-dragon-meld-green-dragon-pair-with-three-mixed-chows',
  'three-mixed-chows-three-dragon-singles-own-wind-pair',
  'three-four-tile-suit-runs-with-honour-pair',
  'three-matching-four-tile-suit-runs-with-honour-pair',
  'seven-pairs-all-from-wall',
  'four-concealed-chows-one-suit-from-wall',
  'four-winds-with-one-two-two-fours-three-sixes-four-eights',
  'four-winds-with-four-twos-three-fours-two-sixes-one-eight',
] as const;

describe('Issue #440B4A Western T&M Cohort A truth', () => {
  it('migrates exactly the selected eligible bindings as Western-local subjects', () => {
    expect(westernTmB4aBindingIds).toHaveLength(34);
    expect([...westernTmB4aBindingIds].sort()).toEqual([...expectedBindingIds].sort());
    expect(westernTmB4aSpecialHandSubjects.map(({ record }) => record.id).sort()).toEqual(
      expectedBindingIds.map((id) => `pattern.western-tm.${id}`).sort(),
    );
    expect(westernTmB4aSpecialHandSubjects.every(({ record }) => record.kind === 'pattern' && record.id.startsWith('pattern.western-tm.'))).toBe(true);
  });

  it('uses the Companion source and a precise 1997 publication locator for every claim', () => {
    expect(westernTmB4aSpecialHandClaims).toHaveLength(34);
    for (const { record } of westernTmB4aSpecialHandClaims) {
      expect(record.sourceId).toBe('tm-companion');
      expect(record.supportsProfile).toEqual({ id: 'western-tm', version: '0.1' });
      expect(record.status).toBe('verified');
      expect(record.locator).toMatchObject({
        kind: 'publication',
        title: 'Thompson & Maloney, The Mah Jong Player’s Companion',
        year: 1997,
      });
      expect(record.locator.kind === 'publication' && (record.locator.page?.length ?? 0) > 0).toBe(true);
    }
  });

  it('targets the exact current Western bindings without copying treatment values or qualifications', () => {
    expect(westernTmB4aSpecialHandTreatments).toHaveLength(34);
    const bindingIds = new Set(westernTmSpecialHandBindings.map(({ patternId }) => patternId));
    for (const versionedTreatment of westernTmB4aSpecialHandTreatments) {
      const { record } = versionedTreatment;
      const ref = record.runtimeState.kind === 'executable' ? record.runtimeState.ref : undefined;
      expect(record.profile).toEqual({ id: 'western-tm', version: '0.1' });
      expect(ref).toEqual({ kind: 'binding', id: record.treatmentId.split(':')[1] });
      expect(ref?.kind === 'binding' && bindingIds.has(ref.id)).toBe(true);
      expect(ref && currentTruthValidationEnvironment.runtimeTreatmentExists(record.profile, ref)).toBe(true);
      expect(record.subjectId).toBe(`pattern.western-tm.${ref?.kind === 'binding' ? ref.id : ''}`);
      expect(record.evidenceClaimIds).toEqual([`evidence.pattern.western-tm.${ref?.kind === 'binding' ? ref.id : ''}`]);
      expect(Object.keys(record).sort()).toEqual(['evidenceClaimIds', 'profile', 'runtimeState', 'subjectId', 'treatmentId']);
    }
  });

  it('preserves Unique Wonder and records Purity as the sole treatment-deferred calculated binding', () => {
    const westernTreatments = currentTruthIndex.treatmentsForProfile({ id: 'western-tm', version: '0.1' }).map(({ record }) => record);
    const uniqueWonder = westernTreatments.find(({ treatmentId }) => treatmentId === 'western-tm@0.1:thirteen-unique-wonders');
    expect(uniqueWonder).toEqual({
      treatmentId: 'western-tm@0.1:thirteen-unique-wonders',
      profile: { id: 'western-tm', version: '0.1' },
      subjectId: 'pattern.thirteen-orphans',
      runtimeState: { kind: 'executable', ref: { kind: 'binding', id: 'thirteen-unique-wonders' } },
      evidenceClaimIds: ['evidence.pattern.thirteen-orphans.western-tm', 'evidence.pattern.thirteen-orphans.classical-membership-audit'],
    });
    const deferred = ['purity-one-chow'];
    const treatmentBindingIds = new Set(westernTreatments.flatMap(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? [runtimeState.ref.id] : []));
    expect(deferred.every((id) => westernTmSpecialHandBindings.some(({ patternId }) => patternId === id))).toBe(true);
    expect(deferred.some((id) => treatmentBindingIds.has(id))).toBe(false);
    expect(currentTruthIndex.claimsForSubject('pattern.western-tm.purity-one-chow').map(({ record }) => record.claimId)).toEqual(['evidence.pattern.western-tm.purity-one-chow']);
    expect(currentTruthCorpus.treatments.filter(({ record }) => record.profile.id === 'western-tm')).toHaveLength(84);
  });
});
