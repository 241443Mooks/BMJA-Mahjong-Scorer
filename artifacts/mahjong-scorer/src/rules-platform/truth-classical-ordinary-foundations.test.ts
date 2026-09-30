import { describe, expect, it } from 'vitest';
import { currentTruthCorpus, currentTruthIndex } from '../rules-knowledge/truth';
import {
  classicalOrdinaryFoundationCoverage,
  classicalOrdinaryFoundationInventory,
} from '../rules-knowledge/truth/classical-ordinary-foundations';

const expectedInventory = [
  'rule.classical.chow-base-scoring',
  'rule.classical.pung-base-scoring',
  'rule.classical.kong-base-scoring',
  'rule.classical.qualifying-honour-pair-scoring',
  'rule.classical.flower-season-base-scoring',
  'rule.classical.mahjong-winner-bonus',
  'rule.classical.live-wall-self-draw-winner-bonus',
  'rule.buzzard-2000.self-draw-winner-bonus',
  'rule.classical.dragon-set-double',
  'rule.classical.own-wind-set-double',
  'rule.classical.prevailing-wind-set-double',
  'rule.classical.own-flower-season-double',
  'rule.classical.complete-flower-season-set-double',
  'rule.buzzard-2000.complete-flower-season-set-double',
  'rule.classical.ordinary-table-cap',
  'rule.buzzard-2000.ordinary-table-limit',
];

const profileRefs = [
  { id: 'bmja', version: '1.0' },
  { id: 'outside-the-box', version: '0.1' },
  { id: 'buzzard-2000', version: '0.1' },
] as const;

describe('Issue 440C1 ordinary scoring foundations', () => {
  it('preserves the frozen semantic subject inventory and treatment coverage', () => {
    expect(classicalOrdinaryFoundationInventory).toEqual(expectedInventory);
    const subjects = currentTruthCorpus.subjects.filter(({ record }) => expectedInventory.includes(record.id));
    const claims = currentTruthCorpus.claims.filter(({ record }) => expectedInventory.includes(record.subjectId));
    const treatments = currentTruthCorpus.treatments.filter(({ record }) => expectedInventory.includes(record.subjectId));
    expect(subjects.map(({ record }) => record.id)).toEqual(expectedInventory);
    expect(claims).toHaveLength(39);
    expect(treatments).toHaveLength(39);
    expect(treatments.every(({ record }) => record.runtimeState.kind === 'migration-incomplete')).toBe(true);
    expect(treatments.every(({ record }) => !('score' in record) && !('value' in record))).toBe(true);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'western-tm', version: '0.1' }).some(({ record }) => expectedInventory.includes(record.subjectId))).toBe(false);
  });

  it('uses exact profile claims and source provenance, with reviewed equivalence only', () => {
    const c1Claims = currentTruthCorpus.claims.filter(({ record }) => expectedInventory.includes(record.subjectId));
    const c1Treatments = currentTruthCorpus.treatments.filter(({ record }) => expectedInventory.includes(record.subjectId));
    for (const profile of profileRefs) {
      const claims = c1Claims.filter(({ record }) => record.supportsProfile?.id === profile.id && record.supportsProfile.version === profile.version);
      const treatments = c1Treatments.filter(({ record }) => record.profile.id === profile.id && record.profile.version === profile.version);
      expect(treatments).toHaveLength(13);
      expect(claims).toHaveLength(treatments.length);
      expect(treatments.every(({ record }) => record.evidenceClaimIds.length === 1 && claims.some(({ record: claim }) => claim.claimId === record.evidenceClaimIds[0]))).toBe(true);
      expect(treatments.every(({ record }) => record.runtimeState.kind === 'migration-incomplete')).toBe(true);
    }
    expect(c1Claims.filter(({ record }) => record.sourceId === 'bmja-scoring' && record.status === 'verified')).toHaveLength(13);
    expect(c1Claims.filter(({ record }) => record.sourceId === 'otb-guide-2026-09' && record.status === 'verified-club')).toHaveLength(13);
    expect(c1Claims.filter(({ record }) => record.sourceId === 'buzzard-2000-classical' && record.status === 'verified')).toHaveLength(13);
    expect(currentTruthCorpus.sources.filter(({ record }) => ['bmja-approved-site', 'bmja-scoring'].includes(record.sourceId))).toHaveLength(2);
    for (const source of currentTruthCorpus.sources.filter(({ record }) => ['bmja-approved-site', 'bmja-scoring'].includes(record.sourceId))) {
      expect(source.record.authorityForProfileIds).toEqual(['bmja']);
    }

    const otbSharedSubjects = new Set(c1Claims.filter(({ record }) => record.sourceId === 'otb-guide-2026-09').map(({ record }) => record.subjectId));
    expect([...otbSharedSubjects].sort()).toEqual(expectedInventory.filter((id) => !id.startsWith('rule.buzzard-2000.')).sort());
    const buzzardSubjects = new Set(c1Claims.filter(({ record }) => record.sourceId === 'buzzard-2000-classical').map(({ record }) => record.subjectId));
    expect(buzzardSubjects.has('rule.classical.complete-flower-season-set-double')).toBe(false);
    expect(buzzardSubjects.has('rule.buzzard-2000.complete-flower-season-set-double')).toBe(true);
    expect(buzzardSubjects.has('rule.classical.live-wall-self-draw-winner-bonus')).toBe(false);
    expect(buzzardSubjects.has('rule.buzzard-2000.self-draw-winner-bonus')).toBe(true);
    expect(currentTruthIndex.claimById('evidence.rule.buzzard-2000.self-draw-winner-bonus.buzzard-2000')?.record).toMatchObject({
      sourceId: 'buzzard-2000-classical',
      status: 'verified',
      supportsProfile: { id: 'buzzard-2000', version: '0.1' },
      locator: { kind: 'publication', page: '10', section: 'BONUS SCORES — self-draw' },
    });
  });

  it('keeps claims profile-scoped and locators on governing sources', () => {
    const claims = currentTruthCorpus.claims.filter(({ record }) => expectedInventory.includes(record.subjectId));
    expect(claims.every(({ record }) => record.supportsProfile !== undefined)).toBe(true);
    expect(claims.filter(({ record }) => record.sourceId === 'bmja-scoring').every(({ record }) => record.locator.kind === 'url' && record.locator.url.endsWith('/scoring/working-out-the-scores/'))).toBe(true);
    const otbClaims = claims.filter(({ record }) => record.sourceId === 'otb-guide-2026-09');
    expect(otbClaims.every(({ record }) => record.locator.kind === 'url' && record.locator.url.includes('/issues/88') && record.status === 'verified-club')).toBe(true);
    expect(otbClaims.every(({ record }) => record.locator.kind === 'url' && !(record.locator.section ?? '').toLowerCase().includes('crosswalk'))).toBe(true);
    expect(currentTruthIndex.claimById('evidence.rule.classical.ordinary-table-cap.outside-the-box')?.record.locator).toMatchObject({
      kind: 'url',
      url: 'https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/88#issuecomment-5651104307',
    });
    expect(claims.filter(({ record }) => record.sourceId === 'buzzard-2000-classical').every(({ record }) => record.locator.kind === 'publication' && record.locator.page !== undefined)).toBe(true);
    expect(currentTruthCorpus.treatments.filter(({ record }) => expectedInventory.includes(record.subjectId)).some(({ record }) => record.runtimeState.kind === 'present-not-modelled')).toBe(false);
  });

  it('projects deterministic semantic-family by exact-profile coverage without scoring values', () => {
    expect(classicalOrdinaryFoundationCoverage).toHaveLength(48);
    expect(classicalOrdinaryFoundationCoverage.filter(({ evidenceStatus }) => evidenceStatus === 'source-ready')).toHaveLength(39);
    expect(classicalOrdinaryFoundationCoverage.filter(({ recordStatus }) => recordStatus === 'migrated')).toHaveLength(39);
    expect(classicalOrdinaryFoundationCoverage.filter(({ treatmentStatus }) => treatmentStatus === 'runtime-edge-migration-incomplete')).toHaveLength(39);
    expect(classicalOrdinaryFoundationCoverage.filter(({ evidenceStatus }) => evidenceStatus === 'not-applicable')).toHaveLength(9);
    expect(classicalOrdinaryFoundationCoverage.filter(({ evidenceStatus }) => evidenceStatus === 'source-unresolved')).toHaveLength(0);
    expect(classicalOrdinaryFoundationCoverage.filter(({ treatmentStatus }) => treatmentStatus === 'present-not-modelled')).toHaveLength(0);
    for (const family of expectedInventory) {
      expect(classicalOrdinaryFoundationCoverage.filter(({ subjectId }) => subjectId === family)).toHaveLength(3);
    }
  });
});
