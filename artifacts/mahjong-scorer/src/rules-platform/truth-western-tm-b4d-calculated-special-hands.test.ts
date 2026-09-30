import { describe, expect, it } from 'vitest';
import { westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment } from '../rules-knowledge/truth';
import { westernTmB4dSpecialHandClaims } from '../rules-knowledge/truth/claims/western-tm-b4d-calculated-special-hands';
import { westernTmB4dBindingIds, westernTmB4dSpecialHandSubjects } from '../rules-knowledge/truth/subjects/western-tm-b4d-calculated-special-hands';
import { westernTmB4dSpecialHandTreatments } from '../rules-knowledge/truth/treatments/western-tm-b4d-calculated-special-hands';

const profile = { id: 'western-tm', version: '0.1' } as const;
const migratedIds = [
  'honours-and-one-suit-terminals-pung-kong-hand',
  'one-suit-with-honours-mostly-pung-kong-hand',
] as const;

describe('Issue #440B4D Western calculated special-hand truth', () => {
  it('records Western-local identities and Companion claims for all three bindings', () => {
    expect(westernTmB4dBindingIds).toEqual([
      'purity-one-chow',
      'honours-and-one-suit-terminals-pung-kong-hand',
      'one-suit-with-honours-mostly-pung-kong-hand',
    ]);
    expect(westernTmB4dSpecialHandSubjects.map(({ record }) => record.id)).toEqual(
      westernTmB4dBindingIds.map((id) => `pattern.western-tm.${id}`),
    );
    expect(westernTmB4dSpecialHandClaims).toHaveLength(3);
    for (const { record } of westernTmB4dSpecialHandClaims) {
      expect(record.sourceId).toBe('tm-companion');
      expect(record.status).toBe('verified');
      expect(record.supportsProfile).toEqual(profile);
      expect(record.subjectId).toBe(`pattern.western-tm.${record.claimId.replace('evidence.pattern.western-tm.', '')}`);
      expect(record.locator).toMatchObject({
        kind: 'publication',
        title: 'Thompson & Maloney, The Mah Jong Player’s Companion',
        year: 1997,
      });
      expect(record.locator.kind === 'publication' && record.locator.page).toBeTruthy();
    }
    expect(currentTruthIndex.claimsForSubject('pattern.western-tm.purity-one-chow')).toHaveLength(1);
    expect(currentTruthIndex.treatmentsForSubject('pattern.western-tm.purity-one-chow')).toHaveLength(0);
  });

  it('executes exactly All Honour Hand and Ordinary Mah Jong, leaving Purity claim-backed and treatment-deferred', () => {
    expect(westernTmB4dSpecialHandTreatments).toHaveLength(2);
    expect(westernTmB4dSpecialHandTreatments.map(({ record }) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding' ? record.runtimeState.ref.id : '')).toEqual(migratedIds);
    for (const { record } of westernTmB4dSpecialHandTreatments) {
      const ref = record.runtimeState.kind === 'executable' ? record.runtimeState.ref : undefined;
      expect(record.profile).toEqual(profile);
      expect(record.runtimeState).toEqual({ kind: 'executable', ref: { kind: 'binding', id: record.treatmentId.split(':')[1] } });
      expect(ref?.kind).toBe('binding');
      if (ref?.kind !== 'binding') continue;
      expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, ref)).toBe(true);
      expect(record.evidenceClaimIds).toEqual([`evidence.pattern.western-tm.${ref.id}`]);
      expect(Object.keys(record).sort()).toEqual(['evidenceClaimIds', 'profile', 'runtimeState', 'subjectId', 'treatmentId']);
    }
    const untreated = westernTmSpecialHandBindings.map(({ patternId }) => patternId).filter((id) =>
      !currentTruthIndex.treatmentsForProfile(profile).some(({ record }) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding' && record.runtimeState.ref.id === id),
    );
    expect(untreated).toEqual(['purity-one-chow']);
    expect(currentTruthIndex.treatmentsForProfile(profile)).toHaveLength(84);
    expect(currentTruthCorpus.treatments.filter(({ record }) => record.profile.id === 'western-tm')).toHaveLength(84);
  });
});
