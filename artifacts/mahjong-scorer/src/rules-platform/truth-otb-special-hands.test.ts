import { describe, expect, it } from 'vitest';
import { outsideTheBoxSpecialHandBindings } from '../game/outside-the-box-catalogue';
import { currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment } from '../rules-knowledge/truth';

const profile = { id: 'outside-the-box', version: '0.1' } as const;
const newlyMigratedIds = [
  'buried-treasure', 'imperial-jade', 'heads-and-tails', 'all-winds-and-dragons',
  'club-three-great-scholars', 'four-blessings', 'fourfold-plenty', 'knitting',
  'triple-knitting', 'all-pair-honours', 'wriggling-snake',
  'seven-pairs-exactly-one-suit-with-optional-honours', 'seven-pairs-one-suit',
  'all-pair-ruby-jade', 'four-bamboo-one-and-five-green-bamboo-pairs',
  'own-wind-meld-with-dragon-pair-and-three-suit-chows',
  'three-four-tile-suit-runs-with-honour-pair',
  'three-matching-four-tile-suit-runs-with-honour-pair', 'wriggling-snake-any-pair',
  'windfall', 'wind-pair-with-three-suit-rank-one-melds',
  'wind-pair-with-three-suit-rank-nine-melds', 'wind-pair-with-three-suit-chows',
  'hachi-ban', 'three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair',
  'dragon-pair-with-five-suited-pairs', 'wriggly-dragon',
  'green-dragon-pung-with-bamboo-melds', 'red-dragon-pung-with-character-melds',
  'white-dragon-pung-with-circle-melds', 'run-one-to-nine-with-same-suit-pung-and-pair',
  'run-one-to-nine-with-honour-pung-and-suited-pair',
] as const;

describe('Issue 440B2 Outside the Box special-hand truth migration', () => {
  it('accounts for all 33 fixed bindings with exact-profile executable treatments', () => {
    const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const refs = treatments.map((record) => {
      expect(record.profile).toEqual(profile);
      expect(record.runtimeState.kind).toBe('executable');
      if (record.runtimeState.kind !== 'executable') return '';
      expect(record.runtimeState.ref.kind).toBe('binding');
      if (record.runtimeState.ref.kind !== 'binding') return '';
      expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, record.runtimeState.ref)).toBe(true);
      return record.runtimeState.ref.id;
    });
    expect(outsideTheBoxSpecialHandBindings).toHaveLength(33);
    expect(treatments).toHaveLength(33);
    expect(new Set(refs).size).toBe(33);
    expect(refs.sort()).toEqual(outsideTheBoxSpecialHandBindings.map(({ patternId }) => patternId).sort());
    expect(refs.filter((id) => id !== 'thirteen-unique-wonders').sort()).toEqual([...newlyMigratedIds].sort());
  });

  it('keeps new claims source-backed, exact-profiled and connected to valid OTB-local subjects', () => {
    const treatments = newlyMigratedIds.map((id) => currentTruthIndex.treatmentById(`outside-the-box@0.1:${id}`)!.record);
    expect(new Set(treatments.map(({ treatmentId }) => treatmentId)).size).toBe(32);
    expect(new Set(treatments.map(({ subjectId }) => subjectId)).size).toBe(32);
    for (const treatment of treatments) {
      expect(treatment.profile).toEqual(profile);
      expect(treatment.subjectId).toBe(`pattern.otb.${treatment.runtimeState.kind === 'executable' && treatment.runtimeState.ref.kind === 'binding' ? treatment.runtimeState.ref.id : ''}`);
      expect(currentTruthIndex.subjectById(treatment.subjectId)?.record).toEqual({ id: treatment.subjectId, kind: 'pattern' });
      expect(treatment.evidenceClaimIds).toHaveLength(1);
      const evidence = currentTruthIndex.claimById(treatment.evidenceClaimIds[0]!)?.record;
      expect(evidence).toBeDefined();
      expect(evidence).toMatchObject({
        subjectId: treatment.subjectId,
        sourceId: 'otb-guide-2026-09',
        status: 'verified-club',
        supportsProfile: profile,
        locator: { kind: 'club-material', title: 'Outside the Box Mahjong guide supplied by Rachel', version: 'September 2026' },
      });
      expect(currentTruthIndex.sourceById('otb-guide-2026-09')).toBeDefined();
      expect(['12', '13', '14']).toContain(evidence?.locator.kind === 'club-material' ? evidence.locator.page : undefined);
      expect(evidence?.locator.kind === 'club-material' && evidence.locator.section).toBeTruthy();
    }
  });

  it('preserves distinct Big Robert identities and one Hachi Ban membership', () => {
    const bigRobert = currentTruthIndex.treatmentsForProfile(profile)
      .map(({ record }) => record)
      .filter(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' && runtimeState.ref.id.includes('four-tile-suit-runs-with-honour-pair'));
    expect(bigRobert.map(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? runtimeState.ref.id : '').sort()).toEqual([
      'three-four-tile-suit-runs-with-honour-pair',
      'three-matching-four-tile-suit-runs-with-honour-pair',
    ]);
    expect(new Set(bigRobert.map(({ treatmentId }) => treatmentId)).size).toBe(2);
    expect(new Set(bigRobert.map(({ subjectId }) => subjectId)).size).toBe(2);
    expect(currentTruthIndex.treatmentsForProfile(profile).filter(({ record }) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding' && record.runtimeState.ref.id === 'hachi-ban')).toHaveLength(1);
    expect(currentTruthIndex.treatmentsForProfile(profile).filter(({ record }) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding' && record.runtimeState.ref.id === 'all-pair-ruby-jade')).toHaveLength(1);
    expect(currentTruthIndex.treatmentsForProfile(profile).some(({ record }) => record.runtimeState.kind === 'executable' && record.runtimeState.ref.kind === 'binding' && record.runtimeState.ref.id === 'purity-one-chow')).toBe(false);
  });

  it('keeps the existing Thirteen Unique Wonders chain and BMJA treatments intact', () => {
    expect(currentTruthIndex.treatmentById('outside-the-box@0.1:thirteen-unique-wonders')?.record).toMatchObject({
      treatmentId: 'outside-the-box@0.1:thirteen-unique-wonders',
      profile,
      subjectId: 'pattern.thirteen-orphans',
      runtimeState: { kind: 'executable', ref: { kind: 'binding', id: 'thirteen-unique-wonders' } },
      evidenceClaimIds: ['evidence.pattern.thirteen-orphans.outside-the-box', 'evidence.pattern.thirteen-orphans.classical-membership-audit'],
    });
    expect(currentTruthCorpus.treatments.filter(({ recordId }) => recordId === 'outside-the-box@0.1:thirteen-unique-wonders')).toHaveLength(1);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'bmja', version: '1.0' })).toHaveLength(18);
    expect(currentTruthCorpus.treatments).toHaveLength(64);
    expect(new Set(currentTruthCorpus.treatments.filter(({ lifecycle }) => lifecycle === 'current').map(({ recordId }) => recordId)).size).toBe(64);
  });
});
