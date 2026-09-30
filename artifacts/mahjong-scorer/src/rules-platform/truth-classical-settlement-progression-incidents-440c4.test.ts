import { describe, expect, it } from 'vitest';
import { currentTruthCorpus } from '../rules-knowledge/truth';
import { classicalOrdinaryFoundationInventory } from '../rules-knowledge/truth/classical-ordinary-foundations';
import { classicalScoringDelta440c2aInventory } from '../rules-knowledge/truth/classical-scoring-deltas-440c2a';
import { classicalScoringDelta440c2bClaims, classicalScoringDelta440c2bInventory, classicalScoringDelta440c2bTreatments } from '../rules-knowledge/truth/classical-scoring-deltas-440c2b';
import { classicalHandValidation440c3aInventory } from '../rules-knowledge/truth/classical-hand-validation-440c3a';
import {
  classicalSettlementProgressionIncident440c4Coverage,
  classicalSettlementProgressionIncident440c4Inventory,
  classicalSettlementProgressionIncident440c4Unresolved,
} from '../rules-knowledge/truth/classical-settlement-progression-incidents-440c4';

const expectedInventory = [
  'rule.classical.loser-pays-winner-score',
  'rule.classical.nonwinners-settle-pairwise-score-differences',
  'rule.classical.east-payment-doubles',
  'rule.classical.draw-retains-east',
  'rule.classical.draw-has-no-settlement',
  'rule.classical.east-retained-after-east-win',
  'rule.classical.non-east-win-rotates-seats',
  'rule.classical.all-players-serve-and-lose-east-before-prevailing-advances',
  'rule.classical.prevailing-winds-east-south-west-north',
  'rule.classical.full-game-four-prevailing-wind-rounds',
  'rule.otb.goulash-round-transition',
  'rule.otb.incorrect-tile-count-consequences',
  'rule.otb.false-discard-name-mahjong-liability',
  'rule.otb.false-discard-name-claimed-tile-penalty-recipient',
  'rule.otb.false-mahjong-exposure-penalty',
  'rule.otb.wrong-tile-claim-timely-correction',
  'rule.otb.wrong-tile-claim-prevents-mahjong',
  'rule.otb.cannon-liability-suppresses-pairwise-settlement',
  'rule.otb.no-choice-cancels-cannon-liability',
  'rule.buzzard-2000.incomplete-wind-dragon-limit-settles-as-nonwinner',
  'rule.buzzard-2000.dangerous-discard-liability-suppresses-pairwise-settlement',
  'rule.buzzard-2000.false-mahjong-exposure-penalty',
  'rule.buzzard-2000.incorrect-tile-count-settlement',
];
const c4Claims = currentTruthCorpus.claims.filter(({ record }) => expectedInventory.includes(record.subjectId));
const c4Treatments = currentTruthCorpus.treatments.filter(({ record }) => expectedInventory.includes(record.subjectId));
const c4Subjects = currentTruthCorpus.subjects.filter(({ record }) => expectedInventory.includes(record.id));
describe('Issue 440C4 Classical settlement, progression and incident truth', () => {
  it('freezes the source inventory and exact row counts', () => {
    expect(classicalSettlementProgressionIncident440c4Inventory).toEqual(expectedInventory);
    expect(classicalSettlementProgressionIncident440c4Coverage).toHaveLength(69);
    expect(classicalSettlementProgressionIncident440c4Coverage.filter(({ evidenceStatus }) => evidenceStatus === 'source-ready')).toHaveLength(36);
    expect(classicalSettlementProgressionIncident440c4Coverage.filter(({ evidenceStatus }) => evidenceStatus === 'source-unresolved')).toHaveLength(7);
    expect(classicalSettlementProgressionIncident440c4Coverage.filter(({ evidenceStatus }) => evidenceStatus === 'not-applicable')).toHaveLength(26);
    expect(classicalSettlementProgressionIncident440c4Coverage.filter(({ treatmentStatus }) => treatmentStatus === 'runtime-edge-migration-incomplete')).toHaveLength(36);
    expect(classicalSettlementProgressionIncident440c4Coverage.filter(({ treatmentStatus }) => treatmentStatus === 'present-not-modelled')).toHaveLength(0);
    expect(c4Subjects).toHaveLength(23);
    expect(c4Claims).toHaveLength(36);
    expect(c4Treatments).toHaveLength(36);
    expect(classicalSettlementProgressionIncident440c4Unresolved).toHaveLength(7);
  });

  it('keeps ordinary settlement subjects shared only across independently sourced exact profiles', () => {
    const shared = expectedInventory.slice(0, 3);
    for (const subjectId of shared) {
      const claims = c4Claims.filter(({ record }) => record.subjectId === subjectId);
      const treatments = c4Treatments.filter(({ record }) => record.subjectId === subjectId);
      expect(claims.map(({ record }) => record.supportsProfile?.id).sort()).toEqual(['bmja', 'buzzard-2000', 'outside-the-box']);
      expect(treatments.map(({ record }) => record.profile.id).sort()).toEqual(['bmja', 'buzzard-2000', 'outside-the-box']);
      expect(claims.find(({ record }) => record.supportsProfile?.id === 'bmja')?.record.sourceId).toBe('bmja-settlement');
      expect(claims.find(({ record }) => record.supportsProfile?.id === 'outside-the-box')?.record.sourceId).toBe('otb-guide-2026-09');
      expect(claims.find(({ record }) => record.supportsProfile?.id === 'buzzard-2000')?.record.sourceId).toBe('buzzard-2000-classical');
    }
  });

  it('leaves unresolved BMJA draw settlement, OTB progression and false-discard recipient claim-free and treatment-free', () => {
    expect(classicalSettlementProgressionIncident440c4Unresolved).toEqual([
      { subjectId: 'rule.classical.draw-has-no-settlement', profile: 'bmja' },
      { subjectId: 'rule.classical.east-retained-after-east-win', profile: 'outside-the-box' },
      { subjectId: 'rule.classical.non-east-win-rotates-seats', profile: 'outside-the-box' },
      { subjectId: 'rule.classical.all-players-serve-and-lose-east-before-prevailing-advances', profile: 'outside-the-box' },
      { subjectId: 'rule.classical.prevailing-winds-east-south-west-north', profile: 'outside-the-box' },
      { subjectId: 'rule.classical.full-game-four-prevailing-wind-rounds', profile: 'outside-the-box' },
      { subjectId: 'rule.otb.false-discard-name-claimed-tile-penalty-recipient', profile: 'outside-the-box' },
    ]);
    for (const { subjectId, profile } of classicalSettlementProgressionIncident440c4Unresolved) {
      expect(currentTruthCorpus.claims.some(({ record }) => record.subjectId === subjectId && record.supportsProfile?.id === profile)).toBe(false);
      expect(currentTruthCorpus.treatments.some(({ record }) => record.subjectId === subjectId && record.profile.id === profile)).toBe(false);
      expect(classicalSettlementProgressionIncident440c4Coverage.find((row) => row.subjectId === subjectId && row.profile.id === profile)?.evidenceStatus).toBe('source-unresolved');
    }
  });

  it('keeps incidents profile-local and the Buzzard non-winner limit about settlement only', () => {
    for (const subjectId of expectedInventory.filter((id) => id.startsWith('rule.otb.'))) {
      expect(c4Claims.filter(({ record }) => record.subjectId === subjectId).every(({ record }) => record.supportsProfile?.id === 'outside-the-box')).toBe(true);
      expect(c4Treatments.filter(({ record }) => record.subjectId === subjectId).every(({ record }) => record.profile.id === 'outside-the-box')).toBe(true);
    }
    for (const subjectId of expectedInventory.filter((id) => id.startsWith('rule.buzzard-2000.'))) {
      expect(c4Claims.filter(({ record }) => record.subjectId === subjectId).every(({ record }) => record.supportsProfile?.id === 'buzzard-2000')).toBe(true);
      expect(c4Treatments.filter(({ record }) => record.subjectId === subjectId).every(({ record }) => record.profile.id === 'buzzard-2000')).toBe(true);
    }
    const nonWinner = 'rule.buzzard-2000.incomplete-wind-dragon-limit-settles-as-nonwinner';
    expect(c4Claims.filter(({ record }) => record.subjectId === nonWinner)).toHaveLength(1);
    expect(c4Claims.find(({ record }) => record.subjectId === nonWinner)?.record.claim).toContain('actual winner');
    expect(c4Claims.some(({ record }) => record.subjectId === nonWinner && record.subjectId.startsWith('pattern.'))).toBe(false);
  });

  it('keeps shortened game length as product policy and all C4 treatments migration-incomplete', () => {
    expect(c4Treatments.every(({ record }) => record.runtimeState.kind === 'migration-incomplete')).toBe(true);
    expect(c4Treatments.every(({ record }) => !('score' in record) && !('value' in record))).toBe(true);
    expect(c4Treatments.every(({ record }) => ['bmja', 'outside-the-box', 'buzzard-2000'].includes(record.profile.id))).toBe(true);
    expect(c4Claims.some(({ record }) => /one-round/i.test(record.claim))).toBe(false);
    expect(currentTruthCorpus.claims.some(({ record }) => record.subjectId === 'rule.product.one-round-game-end')).toBe(false);
    expect(currentTruthCorpus.treatments.some(({ record }) => record.subjectId === 'rule.product.one-round-game-end')).toBe(false);
    for (const profile of ['western-tm', 'mcr', 'riichi-ema-2025']) {
      expect(c4Claims.some(({ record }) => record.supportsProfile?.id === profile)).toBe(false);
      expect(c4Treatments.some(({ record }) => record.profile.id === profile)).toBe(false);
    }
  });

  it('preserves the frozen C1, C2A, C2B, C3A and special-hand coverage', () => {
    expect(classicalOrdinaryFoundationInventory).toHaveLength(16);
    expect(classicalScoringDelta440c2aInventory).toHaveLength(19);
    expect(classicalScoringDelta440c2bInventory).toHaveLength(18);
    expect(classicalHandValidation440c3aInventory).toHaveLength(14);
    const c2bClaimIds = new Set(classicalScoringDelta440c2bClaims.map(({ record }) => record.claimId));
    const c2bTreatmentIds = new Set(classicalScoringDelta440c2bTreatments.map(({ record }) => record.treatmentId));
    expect(currentTruthCorpus.claims.filter(({ record }) => classicalOrdinaryFoundationInventory.includes(record.subjectId))).toHaveLength(39);
    expect(currentTruthCorpus.claims.filter(({ record }) => classicalScoringDelta440c2aInventory.includes(record.subjectId) && ['bmja', 'outside-the-box'].includes(record.supportsProfile?.id ?? '')).length).toBe(26);
    expect(currentTruthCorpus.claims.filter(({ record }) => c2bClaimIds.has(record.claimId)).length).toBe(19);
    expect(currentTruthCorpus.treatments.filter(({ record }) => c2bTreatmentIds.has(record.treatmentId)).length).toBe(19);
    expect(currentTruthCorpus.claims.filter(({ record }) => classicalHandValidation440c3aInventory.includes(record.subjectId))).toHaveLength(24);
    const executablePatterns = currentTruthCorpus.treatments.filter(({ record }) => record.subjectId.startsWith('pattern.') && record.runtimeState.kind === 'executable');
    expect(['bmja', 'western-tm', 'outside-the-box', 'buzzard-2000'].map((profile) => executablePatterns.filter(({ record }) => record.profile.id === profile).length)).toEqual([18, 84, 33, 9]);
  });

  it('registers BMJA settlement authority and has no executable strategy refs', () => {
    const source = currentTruthCorpus.sources.find(({ record }) => record.sourceId === 'bmja-settlement')?.record;
    expect(source).toMatchObject({ authority: 'governing', authorityForProfileIds: ['bmja'] });
    expect(c4Treatments.every(({ record }) => record.runtimeState.kind !== 'executable')).toBe(true);
    expect(c4Claims.find(({ record }) => record.subjectId === 'rule.classical.draw-has-no-settlement' && record.supportsProfile?.id === 'outside-the-box')?.record.sourceId).toBe('otb-guide-2026-09');
  });
});
