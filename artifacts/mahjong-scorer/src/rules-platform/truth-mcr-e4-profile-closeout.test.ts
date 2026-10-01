import { describe, expect, it } from 'vitest';
import { currentTruthCorpus, currentTruthIndex } from '../rules-knowledge/truth';
import { mcrE4ProfileClaims } from '../rules-knowledge/truth/claims/mcr-e4-profile';
import { mcrE4ProfileSubjects } from '../rules-knowledge/truth/subjects/mcr-e4-profile';
import { mcrE4ProfileTreatments } from '../rules-knowledge/truth/treatments/mcr-e4-profile';
import { MCR_WMO_2006_PROFILE, mcrProfileResolverEnvironment } from './mcr-profile';
import { resolvePlayableProfile } from './resolver';
import { currentPlayableProfiles } from './current-profiles';
import { MCR_2006_FAN_BINDINGS } from './mcr-detectors';

const profile = { id: 'mcr-wmo-2006', version: '0.1' } as const;
const sourceId = 'source.mcr-ema-green-book-2006';
const migrated = [
  { slug: 'permitted-winning-structures', locator: '§3.7.2', runtime: 'validation.mcr-winning-shape' },
  { slug: 'basic-points-from-lawful-fan', locator: '§3.9.1(2), §3.9.1(5)', runtime: 'conversion.identity' },
  { slug: 'discard-win-settlement', locator: '§3.9.1(2)–(3)', runtime: 'settlement.mcr-2006' },
  { slug: 'self-draw-settlement', locator: '§3.9.1(2)–(3)', runtime: 'settlement.mcr-2006' },
  { slug: 'dealer-always-passes', locator: '§3.4.8', runtime: 'progression.always-pass' },
  { slug: 'four-dealer-positions-complete-round', locator: '§3.4.3', runtime: 'progression.always-pass' },
  { slug: 'prevailing-wind-order', locator: '§3.4.5', runtime: 'progression.always-pass' },
  { slug: 'four-wind-rounds-complete-game', locator: '§3.4.4–3.4.5', runtime: 'game-end.four-round-always-pass' },
] as const;

const ledger = [
  ...migrated.map(({ slug }) => ({ family: slug, disposition: 'source-ready/migrated' })),
  { family: 'draw-has-no-settlement', disposition: 'source-unresolved' },
  { family: 'highest-lawful-interpretation', disposition: 'product/runtime-policy-not-separate-source-truth' },
  { family: 'minimal-input-evidence-policy', disposition: 'product-contract-not-source-truth' },
  { family: 'tournament-penalties-referee-procedure', disposition: 'reference-only-out-of-product-scope' },
] as const;

describe('Issue 440E4 MCR non-catalogue/profile truth closeout', () => {
  it('freezes exactly eight migrated source families and four explicit dispositions', () => {
    expect(ledger).toHaveLength(12);
    expect(ledger.filter(({ disposition }) => disposition === 'source-ready/migrated')).toHaveLength(8);
    expect(ledger.filter(({ disposition }) => disposition === 'source-unresolved')).toHaveLength(1);
    expect(ledger.filter(({ disposition }) => disposition === 'product/runtime-policy-not-separate-source-truth' || disposition === 'product-contract-not-source-truth')).toHaveLength(2);
    expect(ledger.filter(({ disposition }) => disposition === 'reference-only-out-of-product-scope')).toHaveLength(1);
    expect(mcrE4ProfileSubjects).toHaveLength(8);
    expect(mcrE4ProfileClaims).toHaveLength(8);
    expect(mcrE4ProfileTreatments).toHaveLength(8);
    expect(currentTruthCorpus.subjects).toHaveLength(317);
    expect(currentTruthCorpus.claims).toHaveLength(380);
    expect(currentTruthCorpus.treatments).toHaveLength(378);

    for (const { slug, locator, runtime } of migrated) {
      const subjectId = `rule.mcr-e4-${slug}`;
      const claimId = `evidence.${subjectId}`;
      const treatmentId = `mcr-wmo-2006@0.1:e4-${slug}`;
      expect(currentTruthIndex.subjectById(subjectId)?.record).toEqual({ id: subjectId, kind: 'rule' });
      expect(currentTruthIndex.claimById(claimId)?.record).toMatchObject({
        claimId, subjectId, sourceId, status: 'verified', supportsProfile: profile,
        locator: { kind: 'publication', section: locator },
      });
      expect(currentTruthIndex.treatmentById(treatmentId)?.record).toEqual({
        treatmentId, profile, subjectId, runtimeState: { kind: 'migration-incomplete' }, evidenceClaimIds: [claimId],
      });
      expect(JSON.stringify(currentTruthIndex.treatmentById(treatmentId)?.record)).not.toContain(runtime);
    }

    for (const excluded of ['draw-has-no-settlement', 'highest-lawful-interpretation', 'minimal-input-evidence-policy', 'tournament-penalties-referee-procedure']) {
      expect(currentTruthCorpus.subjects.some(({ record }) => record.id.includes(`mcr-e4-${excluded}`))).toBe(false);
      expect(currentTruthCorpus.claims.some(({ record }) => record.claimId.includes(`mcr-e4-${excluded}`))).toBe(false);
      expect(currentTruthCorpus.treatments.some(({ record }) => record.treatmentId.includes(`e4-${excluded}`))).toBe(false);
    }
    expect(ledger.find(({ family }) => family === 'draw-has-no-settlement')?.disposition).toBe('source-unresolved');
    expect(currentTruthIndex.claimsSupportingProfile(profile).some(({ record }) => record.subjectId.includes('draw-has-no-settlement'))).toBe(false);
    expect(currentTruthIndex.treatmentsForProfile(profile).some(({ record }) => record.subjectId.includes('draw-has-no-settlement'))).toBe(false);
  });

  it('preserves fan coverage, prior executable policies, runtime identities, and exact profile boundaries', async () => {
    const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const fanRefs = treatments.flatMap(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? [runtimeState.ref.id] : []);
    expect(MCR_2006_FAN_BINDINGS).toHaveLength(81);
    expect(new Set(fanRefs)).toEqual(new Set(MCR_2006_FAN_BINDINGS.map(({ id }) => id)));
    expect(fanRefs).toHaveLength(81);
    expect(treatments.filter(({ treatmentId }) => treatmentId.startsWith('mcr-wmo-2006@0.1:e4-'))).toHaveLength(8);
    expect(treatments.filter(({ treatmentId }) => treatmentId.startsWith('mcr-wmo-2006@0.1:') && !treatmentId.startsWith('mcr-wmo-2006@0.1:e4-'))).toHaveLength(83);
    expect(treatments.find(({ treatmentId }) => treatmentId === 'mcr-wmo-2006@0.1:non-combination')).toMatchObject({
      subjectId: 'rule.mcr-2006-non-combination', runtimeState: { kind: 'executable', ref: { kind: 'policy', id: 'interaction.mcr-2006-non-combination' } },
    });
    expect(treatments.find(({ treatmentId }) => treatmentId === 'mcr-wmo-2006@0.1:eight-point-qualification')).toMatchObject({
      subjectId: 'rule.mcr-8-before-flowers', runtimeState: { kind: 'executable', ref: { kind: 'policy', id: 'qualification.mcr-8-before-flowers' } },
    });
    const policies = treatments.filter(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'policy')
      .map(({ treatmentId, subjectId, runtimeState, evidenceClaimIds }) => ({ treatmentId, subjectId, runtimeState, evidenceClaimIds }))
      .sort((a, b) => a.treatmentId.localeCompare(b.treatmentId));
    expect(policies).toEqual([
      { treatmentId: 'mcr-wmo-2006@0.1:eight-point-qualification', subjectId: 'rule.mcr-8-before-flowers', runtimeState: { kind: 'executable', ref: { kind: 'policy', id: 'qualification.mcr-8-before-flowers' } }, evidenceClaimIds: ['evidence.rule.mcr-8-before-flowers'] },
      { treatmentId: 'mcr-wmo-2006@0.1:non-combination', subjectId: 'rule.mcr-2006-non-combination', runtimeState: { kind: 'executable', ref: { kind: 'policy', id: 'interaction.mcr-2006-non-combination' } }, evidenceClaimIds: ['evidence.rule.mcr-2006-non-combination'] },
    ].sort((a, b) => a.treatmentId.localeCompare(b.treatmentId)));
    expect(currentTruthCorpus.treatments.filter(({ record }) => record.profile.id === 'mcr-wmo-2006' && record.runtimeState.kind === 'migration-incomplete')).toEqual(
      expect.arrayContaining(mcrE4ProfileTreatments),
    );
    for (const record of [...currentTruthCorpus.subjects, ...currentTruthCorpus.claims, ...currentTruthCorpus.treatments].map(({ record }) => record)) {
      expect(['value', 'points', 'fanValue', 'score'].some((key) => key in record)).toBe(false);
    }
    for (const otherProfile of [{ id: 'bmja', version: '1.0' }, { id: 'western-tm', version: '0.1' }, { id: 'outside-the-box', version: '0.1' }, { id: 'buzzard-2000', version: '0.1' }] as const) {
      expect(currentTruthIndex.treatmentsForProfile(otherProfile).some(({ record }) => record.subjectId.startsWith('rule.mcr-e4-'))).toBe(false);
    }
    expect(MCR_WMO_2006_PROFILE.identity).toMatchObject({ id: 'mcr-wmo-2006', version: '0.1', status: 'provisional' });
    expect(currentPlayableProfiles.some(({ identity }) => identity.id === 'mcr-wmo-2006')).toBe(false);
    const resolved = await resolvePlayableProfile(profile, mcrProfileResolverEnvironment);
    expect(resolved.profile.validation.handShapePolicyId).toBe('validation.mcr-winning-shape');
    expect(resolved.profile.settlement.id).toBe('settlement.mcr-2006');
    expect(resolved.profile.progression.id).toBe('progression.always-pass');
    expect(resolved.profile.gameEnd.id).toBe('game-end.four-round-always-pass');
  });
});
