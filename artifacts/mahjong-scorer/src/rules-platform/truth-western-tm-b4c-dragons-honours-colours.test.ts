import { describe, expect, it } from 'vitest';
import { westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment } from '../rules-knowledge/truth';
import { westernTmB4aSpecialHandTreatments } from '../rules-knowledge/truth/treatments/western-tm-b4a-special-hands';
import { westernTmB4bSpecialHandTreatments } from '../rules-knowledge/truth/treatments/western-tm-b4b-pairs-winds';
import { westernTmB4cSpecialHandClaims } from '../rules-knowledge/truth/claims/western-tm-b4c-dragons-honours-colours';
import { westernTmB4cBindingIds, westernTmB4cSpecialHandSubjects } from '../rules-knowledge/truth/subjects/western-tm-b4c-dragons-honours-colours';
import { westernTmB4cSpecialHandTreatments } from '../rules-knowledge/truth/treatments/western-tm-b4c-dragons-honours-colours';

const expectedBindingIds = [
  'all-winds-and-dragons',
  'east-wind-meld-white-dragon-pair-three-suit-nonterminal-melds',
  'green-and-white-dragon-melds-with-green-bamboo',
  'green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow',
  'green-dragon-pung-white-dragon-pair-three-circle-melds',
  'green-dragon-pung-with-bamboo-melds',
  'green-dragon-pung-with-blue-circle-melds',
  'heads-and-tails',
  'one-suit-odd-melds',
  'own-wind-meld-with-dragon-pair-and-three-suit-chows',
  'parallel-suit-rank-melds-with-honours',
  'red-and-green-dragon-melds-with-bamboo',
  'red-and-green-dragon-pungs-with-three-suits',
  'red-and-white-dragon-melds-with-red-bamboo',
  'red-dragon-meld-with-red-bamboo-melds',
  'red-dragon-pung-with-character-melds',
  'red-dragon-pung-with-even-character-melds',
  'red-white-dragon-pungs-with-seven-tile-character-or-circle-run-pair',
  'three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair',
  'three-great-scholars',
  'two-odd-suits-and-one-even-suit',
  'two-ranks-doubled-across-two-suits-with-honour-pair',
  'white-dragon-meld-red-dragon-pair-three-suit-nonterminal-melds',
  'white-dragon-meld-with-even-circle-melds',
  'white-dragon-pung-with-circle-melds',
  'white-dragon-pung-with-odd-character-melds',
] as const;

const deferredBindingIds = [
  'purity-one-chow',
] as const;

describe('Issue #440B4C Western T&M Dragons, Honours and Suit-colour truth', () => {
  it('pins exactly the 26 frozen B4C subjects to Western-local identities', () => {
    expect(westernTmB4cBindingIds).toHaveLength(26);
    expect([...westernTmB4cBindingIds].sort()).toEqual([...expectedBindingIds].sort());
    expect(westernTmB4cSpecialHandSubjects).toHaveLength(26);
    expect(westernTmB4cSpecialHandSubjects.map(({ record }) => record.id).sort()).toEqual(
      expectedBindingIds.map((id) => `pattern.western-tm.${id}`).sort(),
    );
    expect(westernTmB4cSpecialHandSubjects.every(({ record }) => record.kind === 'pattern' && record.id.startsWith('pattern.western-tm.'))).toBe(true);
  });

  it('uses 1997 Companion evidence with exact page locators and preserves source distinctions', () => {
    expect(westernTmB4cSpecialHandClaims).toHaveLength(26);
    expect(westernTmB4cSpecialHandClaims.map(({ record }) => record.subjectId).sort()).toEqual(
      expectedBindingIds.map((id) => `pattern.western-tm.${id}`).sort(),
    );
    for (const { record } of westernTmB4cSpecialHandClaims) {
      expect(record.sourceId).toBe('tm-companion');
      expect(record.supportsProfile).toEqual({ id: 'western-tm', version: '0.1' });
      expect(record.status).toBe('verified');
      expect(record.locator).toMatchObject({
        kind: 'publication',
        title: 'Thompson & Maloney, The Mah Jong Player’s Companion',
        year: 1997,
      });
      expect(record.locator.kind === 'publication' && (record.locator.page?.length ?? 0) > 0).toBe(true);
    }
    const claims = new Map(westernTmB4cSpecialHandClaims.map(({ record }) => [record.subjectId, record.claim]));
    expect(claims.get('pattern.western-tm.green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow')).toContain('at most one meld is a Chow');
    expect(claims.get('pattern.western-tm.green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow')).toContain('Bamboo 234');
    expect(claims.get('pattern.western-tm.green-and-white-dragon-melds-with-green-bamboo')).toContain('2, 3, 4, 6, and 8');
    expect(claims.get('pattern.western-tm.red-and-white-dragon-melds-with-red-bamboo')).toContain('1, 5, 7, and 9');
    expect(claims.get('pattern.western-tm.red-white-dragon-pungs-with-seven-tile-character-or-circle-run-pair')).toContain('Pungs specifically');
    expect(claims.get('pattern.western-tm.red-white-dragon-pungs-with-seven-tile-character-or-circle-run-pair')).toContain('one rank duplicated');
    expect(claims.get('pattern.western-tm.own-wind-meld-with-dragon-pair-and-three-suit-chows')).toContain('player’s own Wind');
    expect(claims.get('pattern.western-tm.own-wind-meld-with-dragon-pair-and-three-suit-chows')).not.toContain('prevailing Wind');
    expect(claims.get('pattern.western-tm.red-and-green-dragon-pungs-with-three-suits')).toContain('three suited groups are all Pungs');
    for (const id of [
      'red-dragon-pung-with-character-melds', 'red-dragon-pung-with-even-character-melds',
      'green-dragon-pung-with-bamboo-melds', 'green-dragon-pung-with-blue-circle-melds',
      'white-dragon-pung-with-circle-melds', 'white-dragon-pung-with-odd-character-melds',
      'green-dragon-pung-white-dragon-pair-three-circle-melds',
    ]) {
      expect(claims.get(`pattern.western-tm.${id}`)).toContain('Pung specifically');
    }
  });

  it('targets exact current Western executable bindings without treatment score or qualification fields', () => {
    expect(westernTmB4cSpecialHandTreatments).toHaveLength(26);
    const bindingIds = new Set(westernTmSpecialHandBindings.map(({ patternId }) => patternId));
    for (const versionedTreatment of westernTmB4cSpecialHandTreatments) {
      const { record } = versionedTreatment;
      const ref = record.runtimeState.kind === 'executable' ? record.runtimeState.ref : undefined;
      expect(record.profile).toEqual({ id: 'western-tm', version: '0.1' });
      expect(ref).toEqual({ kind: 'binding', id: record.treatmentId.split(':')[1] });
      expect(ref?.kind === 'binding' && bindingIds.has(ref.id)).toBe(true);
      expect(ref && currentTruthValidationEnvironment.runtimeTreatmentExists(record.profile, ref)).toBe(true);
      expect(record.subjectId).toBe(`pattern.western-tm.${ref?.kind === 'binding' ? ref.id : ''}`);
      expect(record.evidenceClaimIds).toEqual([`evidence.pattern.western-tm.${ref?.kind === 'binding' ? ref.id : ''}`]);
      expect(Object.keys(record).sort()).toEqual(['evidenceClaimIds', 'profile', 'runtimeState', 'subjectId', 'treatmentId']);
    }
  });

  it('preserves earlier cohorts, B4D, and the one treatment-deferred calculation', () => {
    const profile = { id: 'western-tm', version: '0.1' } as const;
    const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const treatmentIds = new Set(treatments.map(({ treatmentId }) => treatmentId));
    expect(westernTmB4aSpecialHandTreatments).toHaveLength(34);
    expect(westernTmB4bSpecialHandTreatments).toHaveLength(21);
    for (const { record } of [...westernTmB4aSpecialHandTreatments, ...westernTmB4bSpecialHandTreatments]) {
      expect(treatmentIds.has(record.treatmentId)).toBe(true);
      expect(treatments.find(({ treatmentId }) => treatmentId === record.treatmentId)).toEqual(record);
    }
    expect(treatments.find(({ treatmentId }) => treatmentId === 'western-tm@0.1:thirteen-unique-wonders')).toEqual({
      treatmentId: 'western-tm@0.1:thirteen-unique-wonders',
      profile,
      subjectId: 'pattern.thirteen-orphans',
      runtimeState: { kind: 'executable', ref: { kind: 'binding', id: 'thirteen-unique-wonders' } },
      evidenceClaimIds: ['evidence.pattern.thirteen-orphans.western-tm', 'evidence.pattern.thirteen-orphans.classical-membership-audit'],
    });
    const treatedIds = new Set(treatments.flatMap(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? [runtimeState.ref.id] : []));
    const untreated = westernTmSpecialHandBindings.map(({ patternId }) => patternId).filter((id) => !treatedIds.has(id));
    expect(untreated.sort()).toEqual([...deferredBindingIds].sort());
    expect(currentTruthCorpus.treatments.filter(({ record }) => record.profile.id === 'western-tm')).toHaveLength(84);
  });
});
