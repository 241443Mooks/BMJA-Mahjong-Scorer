import { describe, expect, it } from 'vitest';
import { currentTruthCorpus, currentTruthIndex } from '../rules-knowledge/truth';
import { classicalOrdinaryFoundationInventory } from '../rules-knowledge/truth/classical-ordinary-foundations';
import {
  classicalScoringDelta440c2aCoverage,
  classicalScoringDelta440c2aInventory,
} from '../rules-knowledge/truth/classical-scoring-deltas-440c2a';

const inventory = [
  'rule.classical.winner-no-chows-double',
  'rule.classical.one-suit-with-honours-double',
  'rule.classical.win-loose-tile-double',
  'rule.classical.win-last-wall-double',
  'rule.classical.win-final-discard-double',
  'rule.classical.win-robbing-kong-double',
  'rule.classical.purity-calculated-three-doubles',
  'rule.otb.winning-pair-completion-bonus',
  'rule.otb.concealed-winner-wall-draw-double',
  'rule.otb.little-three-dragons-double',
  'rule.otb.big-three-dragons-double',
  'rule.otb.little-four-joys-double',
  'rule.otb.big-four-joys-double',
  'rule.otb.three-concealed-pungs-kongs-double',
  'rule.otb.fixed-special-flower-season-side-subtotal',
  'rule.otb.only-possible-winning-tile-bonus',
  'rule.otb.heavenly-hand-limit-event',
  'rule.otb.earthly-hand-limit-event',
  'rule.otb.first-wall-draw-limit-event',
];
const bmja = { id: 'bmja', version: '1.0' };
const otb = { id: 'outside-the-box', version: '0.1' };
const shared = inventory.slice(0, 7);
const bmjaIds = new Set(inventory.slice(0, 7));

describe('Issue 440C2A BMJA and Outside the Box scoring deltas truth', () => {
  const subjects = currentTruthCorpus.subjects.filter(({ record }) => inventory.includes(record.id));
  const claims = currentTruthCorpus.claims.filter(({ record }) => inventory.includes(record.subjectId));
  const treatments = currentTruthCorpus.treatments.filter(({ record }) => inventory.includes(record.subjectId));

  it('freezes the 19-family inventory and expected claim/treatment counts', () => {
    expect(classicalScoringDelta440c2aInventory).toEqual(inventory);
    expect(subjects.map(({ record }) => record.id)).toEqual(inventory);
    expect(claims).toHaveLength(26);
    expect(treatments).toHaveLength(26);
    expect(classicalScoringDelta440c2aCoverage).toHaveLength(38);
    expect(classicalScoringDelta440c2aCoverage.filter(({ evidenceStatus }) => evidenceStatus === 'source-ready')).toHaveLength(26);
    expect(classicalScoringDelta440c2aCoverage.filter(({ evidenceStatus }) => evidenceStatus === 'not-applicable')).toHaveLength(12);
    expect(classicalScoringDelta440c2aCoverage.filter(({ evidenceStatus }) => !['source-ready', 'not-applicable'].includes(evidenceStatus))).toEqual([]);
  });

  it('shares only seven independently sourced BMJA/OTB propositions', () => {
    for (const id of shared) {
      const familyClaims = claims.filter(({ record }) => record.subjectId === id);
      expect(familyClaims).toHaveLength(2);
      expect(familyClaims.map(({ record }) => record.supportsProfile).sort((a, b) => (a?.id ?? '').localeCompare(b?.id ?? ''))).toEqual([bmja, otb]);
      expect(familyClaims.some(({ record }) => ['bmja-scoring', 'bmja-special-hands'].includes(record.sourceId) && record.status === 'verified')).toBe(true);
      expect(familyClaims.some(({ record }) => record.sourceId === 'otb-guide-2026-09' && record.status === 'verified-club')).toBe(true);
    }
    expect(claims.filter(({ record }) => record.supportsProfile?.id === 'bmja').every(({ record }) => bmjaIds.has(record.subjectId))).toBe(true);
    expect(claims.filter(({ record }) => record.supportsProfile?.id === 'outside-the-box').every(({ record }) => record.supportsProfile?.version === '0.1')).toBe(true);
  });

  it('keeps exact-profile treatments non-executable, without values or excluded profiles', () => {
    expect(treatments.every(({ record }) => record.evidenceClaimIds.length === 1)).toBe(true);
    expect(treatments.every(({ record }) => record.evidenceClaimIds[0] === `evidence.${record.subjectId}.${record.profile.id}`)).toBe(true);
    expect(treatments.filter(({ record }) => record.runtimeState.kind === 'migration-incomplete')).toHaveLength(22);
    expect(treatments.filter(({ record }) => record.runtimeState.kind === 'present-not-modelled')).toHaveLength(4);
    expect(treatments.every(({ record }) => ['migration-incomplete', 'present-not-modelled'].includes(record.runtimeState.kind))).toBe(true);
    expect(treatments.every(({ record }) => !('score' in record) && !('value' in record))).toBe(true);
    expect(treatments.every(({ record }) => ['bmja', 'outside-the-box'].includes(record.profile.id))).toBe(true);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'buzzard-2000', version: '0.1' }).some(({ record }) => inventory.includes(record.subjectId))).toBe(false);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'western-tm', version: '0.1' }).some(({ record }) => inventory.includes(record.subjectId))).toBe(false);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'mcr', version: '2006' }).some(({ record }) => inventory.includes(record.subjectId))).toBe(false);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'riichi-ema-2025', version: '0.1' }).some(({ record }) => inventory.includes(record.subjectId))).toBe(false);
  });

  it('holds OTB evidence-model gaps explicitly and preserves C1 as an independent cohort', () => {
    for (const id of inventory.slice(15)) {
      const treatment = treatments.find(({ record }) => record.subjectId === id)?.record;
      expect(treatment).toMatchObject({ profile: otb, runtimeState: { kind: 'present-not-modelled' } });
    }
    const c1Claims = currentTruthCorpus.claims.filter(({ record }) => classicalOrdinaryFoundationInventory.includes(record.subjectId));
    const c1Treatments = currentTruthCorpus.treatments.filter(({ record }) => classicalOrdinaryFoundationInventory.includes(record.subjectId));
    expect(c1Claims).toHaveLength(39);
    expect(c1Treatments).toHaveLength(39);
    expect(c1Treatments.every(({ record }) => record.runtimeState.kind === 'migration-incomplete')).toBe(true);
    expect(currentTruthCorpus.claims.filter(({ record }) => record.subjectId === 'rule.buzzard-2000.self-draw-winner-bonus' || record.subjectId === 'rule.buzzard-2000.complete-flower-season-set-double' || record.subjectId === 'rule.buzzard-2000.ordinary-table-limit')).toHaveLength(3);
    expect(currentTruthCorpus.treatments.filter(({ record }) => record.subjectId === 'rule.buzzard-2000.self-draw-winner-bonus' || record.subjectId === 'rule.buzzard-2000.complete-flower-season-set-double' || record.subjectId === 'rule.buzzard-2000.ordinary-table-limit')).toHaveLength(3);
    expect(currentTruthCorpus.treatments.filter(({ record }) => record.subjectId.startsWith('pattern.') && record.runtimeState.kind === 'executable').length).toBeGreaterThan(0);
  });

  it('uses registered governing sources, profile-scoped claims, and transcription locators', () => {
    for (const { record } of claims) {
      expect(record.supportsProfile).toBeDefined();
      if (record.sourceId === 'bmja-scoring') {
        expect(record).toMatchObject({ status: 'verified', supportsProfile: bmja, locator: { kind: 'url', url: 'https://mahjongbritishrules.wordpress.com/scoring/working-out-the-scores/' } });
      } else if (record.sourceId === 'bmja-special-hands') {
        expect(record).toMatchObject({ subjectId: 'rule.classical.purity-calculated-three-doubles', status: 'verified', supportsProfile: bmja, locator: { kind: 'url', url: 'https://mahjongbritishrules.wordpress.com/scoring/special-hands/', section: 'Purity' } });
      } else {
        expect(record).toMatchObject({ status: 'verified-club', supportsProfile: otb, locator: { kind: 'url', url: 'https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/88' } });
        expect(record.locator.kind === 'url' && (record.locator.section ?? '').toLowerCase().includes('crosswalk')).toBe(false);
      }
    }
  });
});
