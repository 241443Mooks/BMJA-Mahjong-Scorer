import { describe, expect, it } from 'vitest';
import { currentTruthCorpus, currentTruthIndex } from '../rules-knowledge/truth';
import {
  classicalHandValidation440c3aCoverage,
  classicalHandValidation440c3aInventory,
  classicalHandValidation440c3aUnresolved,
} from '../rules-knowledge/truth/classical-hand-validation-440c3a';
import { classicalOrdinaryFoundationInventory } from '../rules-knowledge/truth/classical-ordinary-foundations';
import { classicalScoringDelta440c2aInventory } from '../rules-knowledge/truth/classical-scoring-deltas-440c2a';
import { classicalScoringDelta440c2bClaims, classicalScoringDelta440c2bInventory, classicalScoringDelta440c2bTreatments } from '../rules-knowledge/truth/classical-scoring-deltas-440c2b';
import { bmjaSpecialHandBindings } from '../scoring/special-hands';
import { outsideTheBoxSpecialHandBindings } from '../game/outside-the-box-catalogue';
import { buzzard2000SpecialHandBindings } from '../game/buzzard-2000';

const inventory = [
  'rule.classical.flowers-seasons-outside-ordinary-structure',
  'rule.classical.ordinary-nonwinning-structural-count',
  'rule.classical.ordinary-winning-structural-count',
  'rule.classical.kong-physical-four-structural-one-set',
  'rule.classical.ordinary-winning-four-sets-and-pair',
  'rule.classical.normal-hand-at-most-one-chow',
  'rule.buzzard-2000.multiple-chows-permitted',
  'rule.otb.goulash-no-chows',
  'rule.classical.exposed-concealed-set-meaning',
  'concept.bmja.fishing-state',
  'concept.bmja.fishing-distinct-from-original-call',
  'rule.bmja.dead-wanted-tile-does-not-remove-fishing-eligibility',
  'concept.bmja.original-call-declaration-evidence',
  'rule.otb.goulash-blank-substitution-policy',
];
const profiles = {
  bmja: { id: 'bmja', version: '1.0' },
  otb: { id: 'outside-the-box', version: '0.1' },
  buzzard: { id: 'buzzard-2000', version: '0.1' },
} as const;
const c3aClaims = currentTruthCorpus.claims.filter(({ record }) => inventory.includes(record.subjectId));
const c3aTreatments = currentTruthCorpus.treatments.filter(({ record }) => inventory.includes(record.subjectId));
const c2bClaimIds = new Set(classicalScoringDelta440c2bClaims.map(({ record }) => record.claimId));
const c2bTreatmentIds = new Set(classicalScoringDelta440c2bTreatments.map(({ record }) => record.treatmentId));

describe('Issue 440C3A Classical hand structure and validation truth', () => {
  it('freezes the reviewed subject inventory and assembled claim/treatment counts', () => {
    expect(classicalHandValidation440c3aInventory).toEqual(inventory);
    expect(currentTruthCorpus.subjects.filter(({ record }) => inventory.includes(record.id)).map(({ record }) => record.id)).toEqual(inventory);
    expect(c3aClaims).toHaveLength(24);
    expect(c3aTreatments).toHaveLength(24);
    expect(c3aTreatments.filter(({ record }) => record.profile.id === 'bmja')).toHaveLength(11);
    expect(c3aTreatments.filter(({ record }) => record.profile.id === 'outside-the-box')).toHaveLength(7);
    expect(c3aTreatments.filter(({ record }) => record.profile.id === 'buzzard-2000')).toHaveLength(6);
    expect(classicalHandValidation440c3aCoverage).toHaveLength(42);
    expect(classicalHandValidation440c3aUnresolved).toEqual([
      { subjectId: 'rule.classical.flowers-seasons-outside-ordinary-structure', profile: profiles.buzzard },
      { subjectId: 'rule.classical.normal-hand-at-most-one-chow', profile: profiles.otb },
      { subjectId: 'rule.classical.exposed-concealed-set-meaning', profile: profiles.otb },
    ]);
    expect(classicalHandValidation440c3aCoverage.filter(({ evidenceStatus }) => evidenceStatus === 'source-ready')).toHaveLength(24);
    expect(classicalHandValidation440c3aCoverage.filter(({ evidenceStatus }) => evidenceStatus === 'source-unresolved')).toHaveLength(3);
    expect(classicalHandValidation440c3aCoverage.filter(({ evidenceStatus }) => evidenceStatus === 'not-applicable')).toHaveLength(15);
    expect(classicalHandValidation440c3aCoverage.filter(({ treatmentStatus }) => treatmentStatus === 'runtime-edge-migration-incomplete')).toHaveLength(23);
    expect(classicalHandValidation440c3aCoverage.filter(({ treatmentStatus }) => treatmentStatus === 'present-not-modelled')).toHaveLength(1);
  });

  it('keeps exact-profile evidence, migration state, and treatment records provenance-only', () => {
    const expectedProfiles: Record<string, string[]> = {
      'rule.classical.flowers-seasons-outside-ordinary-structure': ['bmja', 'outside-the-box'],
      'rule.classical.ordinary-nonwinning-structural-count': ['bmja', 'outside-the-box', 'buzzard-2000'],
      'rule.classical.ordinary-winning-structural-count': ['bmja', 'outside-the-box', 'buzzard-2000'],
      'rule.classical.kong-physical-four-structural-one-set': ['bmja', 'outside-the-box', 'buzzard-2000'],
      'rule.classical.ordinary-winning-four-sets-and-pair': ['bmja', 'outside-the-box', 'buzzard-2000'],
      'rule.classical.normal-hand-at-most-one-chow': ['bmja'],
      'rule.buzzard-2000.multiple-chows-permitted': ['buzzard-2000'],
      'rule.otb.goulash-no-chows': ['outside-the-box'],
      'rule.classical.exposed-concealed-set-meaning': ['bmja', 'buzzard-2000'],
      'concept.bmja.fishing-state': ['bmja'],
      'concept.bmja.fishing-distinct-from-original-call': ['bmja'],
      'rule.bmja.dead-wanted-tile-does-not-remove-fishing-eligibility': ['bmja'],
      'concept.bmja.original-call-declaration-evidence': ['bmja'],
      'rule.otb.goulash-blank-substitution-policy': ['outside-the-box'],
    };
    for (const subjectId of inventory) {
      expect(c3aClaims.filter(({ record }) => record.subjectId === subjectId).map(({ record }) => record.supportsProfile!.id).sort())
        .toEqual(expectedProfiles[subjectId]!.sort());
      expect(c3aTreatments.filter(({ record }) => record.subjectId === subjectId).map(({ record }) => record.profile.id).sort())
        .toEqual(expectedProfiles[subjectId]!.sort());
    }
    for (const { record } of c3aClaims) {
      expect(record.supportsProfile).toBeDefined();
      expect(record.claim).not.toMatch(/setId|array index|tileIndex|blankTileIds|UI control/i);
    }
    for (const { record } of c3aTreatments) {
      expect(record).toEqual({
        treatmentId: `${record.profile.id}@${record.profile.version}:${record.subjectId}`,
        profile: record.profile,
        subjectId: record.subjectId,
        runtimeState: record.subjectId === 'rule.bmja.dead-wanted-tile-does-not-remove-fishing-eligibility'
          ? { kind: 'present-not-modelled' }
          : { kind: 'migration-incomplete' },
        evidenceClaimIds: [`evidence.${record.subjectId}.${record.profile.id}`],
      });
      expect('score' in record || 'value' in record).toBe(false);
      expect(record.runtimeState.kind).not.toBe('executable');
    }
    expect(currentTruthCorpus.sources.filter(({ record }) => record.sourceId === 'bmja-qa')).toHaveLength(1);
    expect(currentTruthCorpus.sources.find(({ record }) => record.sourceId === 'bmja-qa')?.record).toMatchObject({
      authority: 'governing', authorityForProfileIds: ['bmja'],
    });
  });

  it('keeps unresolved source propositions unresolved and does not inherit Western truth', () => {
    const unresolved = [
      ['rule.classical.flowers-seasons-outside-ordinary-structure', 'buzzard-2000'],
      ['rule.classical.normal-hand-at-most-one-chow', 'outside-the-box'],
      ['rule.classical.exposed-concealed-set-meaning', 'outside-the-box'],
    ] as const;
    for (const [subjectId, profileId] of unresolved) {
      expect(c3aClaims.some(({ record }) => record.subjectId === subjectId && record.supportsProfile?.id === profileId)).toBe(false);
      expect(c3aTreatments.some(({ record }) => record.subjectId === subjectId && record.profile.id === profileId)).toBe(false);
    }
    expect(currentTruthCorpus.claims.some(({ record }) => record.supportsProfile?.id === 'western-tm' && inventory.includes(record.subjectId))).toBe(false);
    expect(c3aTreatments.every(({ record }) => ['bmja', 'outside-the-box', 'buzzard-2000'].includes(record.profile.id))).toBe(true);
    for (const profile of [{ id: 'mcr-wmo-2006', version: '0.1' }, { id: 'riichi-ema-2025', version: '0.1' }]) {
      expect(inventory.some((subjectId) => currentTruthIndex.treatmentsForProfile(profile).some(({ record }) => record.subjectId === subjectId))).toBe(false);
    }
  });

  it('separates Original Call declaration evidence from C2B score treatments', () => {
    const declaration = 'concept.bmja.original-call-declaration-evidence';
    const allPlayerScore = 'rule.classical.original-call-fishing-all-player-double';
    const winnerScore = 'rule.classical.original-call-winner-double';
    expect(declaration).not.toBe(allPlayerScore);
    expect(declaration).not.toBe(winnerScore);
    expect(c3aClaims.filter(({ record }) => record.subjectId === declaration)).toHaveLength(1);
    expect(c3aTreatments.filter(({ record }) => record.subjectId === declaration)).toHaveLength(1);
    expect(currentTruthCorpus.claims.filter(({ record }) => [allPlayerScore, winnerScore].includes(record.subjectId))).toHaveLength(2);
  });

  it('keeps OTB Goulash hand legality separate from C4 mode transition and round rules', () => {
    const goulashLegality = ['rule.otb.goulash-no-chows', 'rule.otb.goulash-blank-substitution-policy'];
    expect(c3aTreatments.filter(({ record }) => goulashLegality.includes(record.subjectId))).toHaveLength(2);
    expect(inventory.some((subjectId) => /transition|draw-settlement|east-retention/i.test(subjectId))).toBe(false);
    expect(c3aClaims.find(({ record }) => record.subjectId === 'rule.otb.goulash-blank-substitution-policy')?.record.claim).not.toMatch(/blankTileIds|array|index|codec/i);
    expect(currentTruthCorpus.treatments.some(({ record }) => inventory.includes(record.subjectId) && /strategy|validation\./i.test(record.treatmentId))).toBe(false);
  });

  it('leaves C1, C2A, C2B, and special-hand treatment coverage unchanged', () => {
    expect(classicalOrdinaryFoundationInventory).toHaveLength(16);
    expect(currentTruthCorpus.claims.filter(({ record }) => classicalOrdinaryFoundationInventory.includes(record.subjectId))).toHaveLength(39);
    expect(currentTruthCorpus.treatments.filter(({ record }) => classicalOrdinaryFoundationInventory.includes(record.subjectId))).toHaveLength(39);
    expect(classicalScoringDelta440c2aInventory).toHaveLength(19);
    expect(currentTruthCorpus.claims.filter(({ record }) => classicalScoringDelta440c2aInventory.includes(record.subjectId) && ['bmja', 'outside-the-box'].includes(record.supportsProfile?.id ?? '')).length).toBe(26);
    expect(currentTruthCorpus.treatments.filter(({ record }) => classicalScoringDelta440c2aInventory.includes(record.subjectId) && ['bmja', 'outside-the-box'].includes(record.profile.id)).length).toBe(26);
    expect(classicalScoringDelta440c2bInventory).toHaveLength(18);
    expect(currentTruthCorpus.claims.filter(({ record }) => c2bClaimIds.has(record.claimId)).length).toBe(19);
    expect(currentTruthCorpus.treatments.filter(({ record }) => c2bTreatmentIds.has(record.treatmentId)).length).toBe(19);
    expect([bmjaSpecialHandBindings, outsideTheBoxSpecialHandBindings, buzzard2000SpecialHandBindings].map((bindings) => bindings.length)).toEqual([18, 33, 10]);
    const exactProfiles = [profiles.bmja, { id: 'western-tm', version: '0.1' }, profiles.otb, profiles.buzzard] as const;
    expect(exactProfiles.map((profile) => currentTruthIndex.treatmentsForProfile(profile).filter(({ record }) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding').length)).toEqual([18, 84, 33, 9]);
  });
});
