import { describe, expect, it } from 'vitest';
import { buzzard2000SpecialHandBindings } from '../game/buzzard-2000';
import { currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment } from '../rules-knowledge/truth';

const profile = { id: 'buzzard-2000', version: '0.1' } as const;
const migratedBindings = [
  'all-winds-and-dragons',
  'three-winds-and-fourth-wind-pair',
  'heavens-blessing',
  'earths-blessing',
  'heads-and-tails',
  'buzzard-three-dragons-winner',
  'one-suit-nine-gates-any-completion',
  'east-thirteenth-consecutive-mahjong',
].sort();

describe('Buzzard 2000 special-hand truth', () => {
  it('joins eight newly migrated exact-profile treatments to the existing executable bindings', () => {
    const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record).filter(({ runtimeState }) => runtimeState.kind === 'executable');
    const newTreatments = treatments.filter(({ treatmentId }) => treatmentId !== 'buzzard-2000@0.1:thirteen-unique-wonders');
    expect(buzzard2000SpecialHandBindings).toHaveLength(10);
    expect(treatments).toHaveLength(9);
    expect(newTreatments.map(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? runtimeState.ref.id : '').sort()).toEqual(migratedBindings);
    expect(newTreatments.map(({ treatmentId }) => treatmentId).sort()).toEqual(migratedBindings.map((id) => `buzzard-2000@0.1:${id}`).sort());
    for (const treatment of newTreatments) {
      expect(treatment.profile).toEqual(profile);
      expect(treatment).not.toHaveProperty('value');
      expect(treatment.runtimeState.kind).toBe('executable');
      if (treatment.runtimeState.kind === 'executable') {
        expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, treatment.runtimeState.ref)).toBe(true);
      }
      expect(treatment.evidenceClaimIds).toHaveLength(1);
    }
    expect(treatments.map(({ treatmentId }) => treatmentId)).toContain('buzzard-2000@0.1:thirteen-unique-wonders');
    expect(treatments.map(({ treatmentId }) => treatmentId)).not.toContain('buzzard-2000@0.1:four-concealed-pung-kong-hand');
  });

  it('uses Buzzard-scoped subjects and exact retained-snapshot locators for all new claims', () => {
    const claims = currentTruthIndex.claimsForSource('buzzard-2000-classical')
      .map(({ record }) => record)
      .filter(({ subjectId }) => subjectId.startsWith('pattern.buzzard-2000.'));
    expect(claims).toHaveLength(8);
    for (const claim of claims) {
      expect(claim.subjectId).toMatch(/^pattern\.buzzard-2000\./);
      expect(claim.supportsProfile).toEqual(profile);
      expect(claim.locator).toMatchObject({
        kind: 'publication',
        title: 'Buzzard 2000 Classical rules, retained original source snapshot',
        year: 2000,
      });
      expect(claim.locator.page).toMatch(/^11/);
      expect(claim.status).toBe('verified');
      expect(currentTruthIndex.subjectById(claim.subjectId)).toBeDefined();
    }
    expect(claims.map(({ subjectId }) => subjectId).sort()).toEqual([
      'pattern.buzzard-2000.all-ones-and-nines',
      'pattern.buzzard-2000.all-winds-and-dragons',
      'pattern.buzzard-2000.calling-nine-tile-hand',
      'pattern.buzzard-2000.easts-first-discard',
      'pattern.buzzard-2000.easts-thirteenth-consecutive-mahjong',
      'pattern.buzzard-2000.original-hand',
      'pattern.buzzard-2000.three-dragons-winner',
      'pattern.buzzard-2000.three-winds-and-fourth-wind-pair',
    ].sort());
    expect(currentTruthCorpus.subjects.filter(({ record }) => record.id.startsWith('pattern.buzzard-2000.'))).toHaveLength(8);
  });

  it('states Buzzard-specific event and table-history qualifications without generic semantics', () => {
    expect(currentTruthIndex.claimById('evidence.pattern.buzzard-2000.original-hand')?.record.claim).toContain('East win immediately from the original fourteen dealt tiles');
    expect(currentTruthIndex.claimById('evidence.pattern.buzzard-2000.original-hand')?.record.claim).not.toContain('Heaven’s Blessing');
    expect(currentTruthIndex.claimById('evidence.pattern.buzzard-2000.easts-first-discard')?.record.claim).toContain('winning on East Wind’s first discard');
    expect(currentTruthIndex.claimById('evidence.pattern.buzzard-2000.easts-first-discard')?.record.claim).not.toContain('Earth’s Blessing');
    expect(currentTruthIndex.claimById('evidence.pattern.buzzard-2000.easts-thirteenth-consecutive-mahjong')?.record.claim).toContain('table/history context');
    expect(currentTruthIndex.treatmentById('buzzard-2000@0.1:east-thirteenth-consecutive-mahjong')?.record.runtimeState).toEqual({ kind: 'executable', ref: { kind: 'binding', id: 'east-thirteenth-consecutive-mahjong' } });
  });
});
