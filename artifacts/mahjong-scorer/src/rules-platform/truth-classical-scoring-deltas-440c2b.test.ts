import { describe, expect, it } from 'vitest';
import { currentTruthCorpus, currentTruthIndex } from '../rules-knowledge/truth';
import { classicalOrdinaryFoundationInventory } from '../rules-knowledge/truth/classical-ordinary-foundations';
import { classicalScoringDelta440c2aInventory } from '../rules-knowledge/truth/classical-scoring-deltas-440c2a';
import { classicalScoringDelta440c2bClaims, classicalScoringDelta440c2bCoverage, classicalScoringDelta440c2bInventory, classicalScoringDelta440c2bTreatments } from '../rules-knowledge/truth/classical-scoring-deltas-440c2b';

const reused = [
  'rule.classical.winner-no-chows-double', 'rule.classical.one-suit-with-honours-double',
  'rule.classical.win-loose-tile-double', 'rule.classical.win-last-wall-double',
  'rule.classical.win-robbing-kong-double',
];
const bmja = { id: 'bmja', version: '1.0' };
const buzzard = { id: 'buzzard-2000', version: '0.1' };
const claimIds = new Set(classicalScoringDelta440c2bClaims.map(({ record }) => record.claimId));
const treatmentIds = new Set(classicalScoringDelta440c2bTreatments.map(({ record }) => record.treatmentId));
const rows = currentTruthCorpus.claims.filter(({ record }) => claimIds.has(record.claimId));
const treatments = currentTruthCorpus.treatments.filter(({ record }) => treatmentIds.has(record.treatmentId));

describe('Issue 440C2B Buzzard and reconciled scoring truth', () => {
  it('freezes 19 exact-profile rows across 18 semantic families', () => {
    expect(classicalScoringDelta440c2bInventory).toHaveLength(18);
    expect(rows).toHaveLength(19);
    expect(treatments).toHaveLength(19);
    expect(classicalScoringDelta440c2bCoverage).toHaveLength(36);
    expect(classicalScoringDelta440c2bCoverage.filter(({ evidenceStatus }) => evidenceStatus === 'source-ready')).toHaveLength(19);
    expect(classicalScoringDelta440c2bCoverage.filter(({ evidenceStatus }) => evidenceStatus === 'not-applicable')).toHaveLength(17);
  });

  it('extends five shared C2A subjects without changing their BMJA or OTB records', () => {
    for (const id of reused) {
      const claims = currentTruthCorpus.claims.filter(({ record }) => record.subjectId === id);
      const records = currentTruthCorpus.treatments.filter(({ record }) => record.subjectId === id);
      expect(claims.filter(({ record }) => record.supportsProfile?.id === 'buzzard-2000')).toHaveLength(1);
      expect(claims.some(({ record }) => record.supportsProfile?.id === 'bmja')).toBe(true);
      expect(claims.some(({ record }) => record.supportsProfile?.id === 'outside-the-box')).toBe(true);
      expect(records.some(({ record }) => record.profile.id === 'bmja')).toBe(true);
      expect(records.some(({ record }) => record.profile.id === 'outside-the-box')).toBe(true);
    }
    const allMajors = currentTruthCorpus.claims.filter(({ record }) => record.subjectId === 'rule.classical.all-majors-with-honours-double');
    expect(allMajors.map(({ record }) => record.supportsProfile).sort((a, b) => (a?.id ?? '').localeCompare(b?.id ?? ''))).toEqual([bmja, buzzard]);
  });

  it('keeps BMJA reconciliations profile-local and Original Call layers distinct', () => {
    const concealed = currentTruthCorpus.claims.filter(({ record }) => record.subjectId === 'rule.classical.concealed-mixed-winner-double');
    expect(concealed).toHaveLength(1);
    expect(concealed[0].record.supportsProfile).toEqual(bmja);
    const originalFishing = 'rule.classical.original-call-fishing-all-player-double';
    const originalWinner = 'rule.classical.original-call-winner-double';
    expect(originalFishing).not.toBe(originalWinner);
    for (const id of [originalFishing, originalWinner]) expect(currentTruthCorpus.claims.filter(({ record }) => record.subjectId === id)).toHaveLength(1);
  });

  it('keeps additive awards separate from doubles and Flower/Season interaction separate from C1 components', () => {
    for (const id of ['rule.buzzard-2000.no-chows-additive-bonus', 'rule.buzzard-2000.last-wall-additive-bonus', 'rule.buzzard-2000.loose-tile-additive-bonus']) {
      expect(currentTruthCorpus.claims.some(({ record }) => record.subjectId === id)).toBe(true);
      expect(currentTruthCorpus.claims.some(({ record }) => record.subjectId === id.replace('-additive-bonus', '-double'))).toBe(false);
    }
    const interaction = 'rule.buzzard-2000.flower-season-set-own-tile-cumulative-doubles';
    expect(classicalOrdinaryFoundationInventory).not.toContain(interaction);
    expect(currentTruthCorpus.claims.some(({ record }) => record.subjectId === interaction)).toBe(true);
    expect(currentTruthCorpus.claims.some(({ record }) => record.subjectId === 'rule.classical.complete-flower-season-set-double')).toBe(true);
    expect(currentTruthCorpus.claims.some(({ record }) => record.subjectId === 'rule.classical.own-flower-season-double')).toBe(true);
  });

  it('keeps every treatment migration-incomplete, value-free and limited to BMJA/Buzzard', () => {
    expect(treatments.every(({ record }) => record.runtimeState.kind === 'migration-incomplete')).toBe(true);
    expect(treatments.every(({ record }) => !('score' in record) && !('value' in record))).toBe(true);
    expect(treatments.every(({ record }) => ['bmja', 'buzzard-2000'].includes(record.profile.id))).toBe(true);
    for (const profile of ['western-tm', 'mcr', 'riichi-ema-2025']) {
      expect(treatments.some(({ record }) => record.profile.id === profile)).toBe(false);
    }
    expect(classicalScoringDelta440c2aInventory).toHaveLength(19);
    expect(currentTruthCorpus.claims.filter(({ record }) => classicalScoringDelta440c2aInventory.includes(record.subjectId) && ['bmja', 'outside-the-box'].includes(record.supportsProfile?.id ?? ''))).toHaveLength(26);
    expect(currentTruthCorpus.treatments.filter(({ record }) => classicalScoringDelta440c2aInventory.includes(record.subjectId) && ['bmja', 'outside-the-box'].includes(record.profile.id))).toHaveLength(26);
    expect(currentTruthCorpus.claims.filter(({ record }) => classicalOrdinaryFoundationInventory.includes(record.subjectId))).toHaveLength(39);
    expect(currentTruthCorpus.treatments.filter(({ record }) => classicalOrdinaryFoundationInventory.includes(record.subjectId))).toHaveLength(39);
    expect(currentTruthIndex.treatmentsForProfile(buzzard).filter(({ record }) => classicalScoringDelta440c2bInventory.includes(record.subjectId))).toHaveLength(15);
  });
});
