import { describe, expect, it } from 'vitest';
import { currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment } from '../rules-knowledge/truth';
import { bmjaSpecialHandBindings } from '../scoring/special-hands';

const profile = { id: 'bmja', version: '1.0' } as const;

describe('Issue 440B1 BMJA special-hand truth migration', () => {
  it('accounts for every binding exactly once with an exact-profile executable treatment', () => {
    const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const refs = treatments.map(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? runtimeState.ref.id : '');
    expect(treatments).toHaveLength(18);
    expect(new Set(refs).size).toBe(18);
    expect(refs.sort()).toEqual(bmjaSpecialHandBindings.map(({ patternId }) => patternId).sort());
    for (const treatment of treatments) {
      expect(treatment.profile).toEqual(profile);
      expect(treatment.runtimeState.kind).toBe('executable');
      if (treatment.runtimeState.kind === 'executable') {
        expect(treatment.runtimeState.ref.kind).toBe('binding');
        expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, treatment.runtimeState.ref)).toBe(true);
      }
    }
  });

  it('uses registered BMJA evidence, valid subjects, and unique current record identities', () => {
    const bmjaClaims = currentTruthIndex.claimsSupportingProfile(profile).map(({ record }) => record);
    const migrated = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    expect(bmjaClaims).toHaveLength(18);
    expect(currentTruthIndex.sourceById('bmja-special-hands')?.record.authorityForProfileIds).toContain('bmja');
    expect(new Set(migrated.map(({ treatmentId }) => treatmentId)).size).toBe(18);
    expect(new Set(migrated.map(({ subjectId }) => subjectId)).size).toBe(18);
    for (const treatment of migrated) {
      expect(currentTruthIndex.subjectById(treatment.subjectId)).toBeDefined();
      if (treatment.treatmentId !== 'bmja@1.0:thirteen-unique-wonders') {
        expect(treatment.evidenceClaimIds).toHaveLength(1);
        const claim = currentTruthIndex.claimById(treatment.evidenceClaimIds[0]!)?.record;
        expect(claim).toBeDefined();
        expect(claim).toMatchObject({ sourceId: 'bmja-special-hands', subjectId: treatment.subjectId, status: 'verified', supportsProfile: profile });
        expect(claim?.locator.kind).toBe('url');
        if (claim?.locator.kind === 'url') {
          expect(claim.locator.url).toBe('https://mahjongbritishrules.wordpress.com/scoring/special-hands/');
          expect(claim.locator.section).toBeTruthy();
        }
      }
    }
  });

  it('keeps the existing Thirteen Unique Wonders treatment chain intact', () => {
    expect(currentTruthIndex.treatmentById('bmja@1.0:thirteen-unique-wonders')?.record).toMatchObject({
      treatmentId: 'bmja@1.0:thirteen-unique-wonders',
      profile,
      subjectId: 'pattern.thirteen-orphans',
      runtimeState: { kind: 'executable', ref: { kind: 'binding', id: 'thirteen-unique-wonders' } },
      evidenceClaimIds: ['evidence.pattern.thirteen-orphans.bmja', 'evidence.pattern.thirteen-orphans.classical-membership-audit'],
    });
    expect(currentTruthCorpus.treatments.filter(({ recordId }) => recordId === 'bmja@1.0:thirteen-unique-wonders')).toHaveLength(1);
  });
});
