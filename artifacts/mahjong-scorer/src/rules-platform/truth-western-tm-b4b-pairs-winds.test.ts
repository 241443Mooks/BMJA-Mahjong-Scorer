import { describe, expect, it } from 'vitest';
import { westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment } from '../rules-knowledge/truth';
import { westernTmB4aSpecialHandTreatments } from '../rules-knowledge/truth/treatments/western-tm-b4a-special-hands';
import { westernTmB4bSpecialHandClaims } from '../rules-knowledge/truth/claims/western-tm-b4b-pairs-winds';
import { westernTmB4bSpecialHandSubjects, westernTmB4bBindingIds } from '../rules-knowledge/truth/subjects/western-tm-b4b-pairs-winds';
import { westernTmB4bSpecialHandTreatments } from '../rules-knowledge/truth/treatments/western-tm-b4b-pairs-winds';

const expectedBindingIds = [
  'all-pair-honours',
  'four-blessings',
  'wind-pair-with-three-suit-chows',
  'wind-pair-with-three-suit-one-two-three-chows',
  'wind-pair-with-three-suit-seven-eight-nine-chows',
  'dragonette',
  'windfall',
  'all-pair-ruby-jade',
  'four-bamboo-one-and-five-green-bamboo-pairs',
  'seven-pairs-one-suit',
  'seven-pairs-one-suit-with-honours',
  'dragon-pair-with-five-suited-pairs',
  'golden-gates',
  'all-pair-green-dragon-and-bamboo',
  'four-wind-pairs-with-two-dragon-melds',
  'wind-pair-with-three-suit-rank-one-melds',
  'wind-pair-with-three-suit-rank-nine-melds',
  'wind-pair-with-one-meld-in-each-suit',
  'wind-pair-with-three-suit-rank-three-melds',
  'wind-pair-with-three-suit-rank-seven-melds',
  'four-chows-three-suits-with-own-wind-pair',
] as const;

const expectedB4cBindingIds = [
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

describe('Issue #440B4B Western T&M Pairs and Winds truth', () => {
  it('migrates exactly the selected eligible bindings as Western-local subjects', () => {
    expect(westernTmB4bBindingIds).toHaveLength(21);
    expect([...westernTmB4bBindingIds].sort()).toEqual([...expectedBindingIds].sort());
    expect(westernTmB4bSpecialHandSubjects).toHaveLength(21);
    expect(westernTmB4bSpecialHandSubjects.map(({ record }) => record.id).sort()).toEqual(
      expectedBindingIds.map((id) => `pattern.western-tm.${id}`).sort(),
    );
    expect(westernTmB4bSpecialHandSubjects.every(({ record }) => record.kind === 'pattern' && record.id.startsWith('pattern.western-tm.'))).toBe(true);
  });

  it('uses only Companion evidence with precise 1997 publication locators', () => {
    expect(westernTmB4bSpecialHandClaims).toHaveLength(21);
    expect(westernTmB4bSpecialHandClaims.map(({ record }) => record.subjectId).sort()).toEqual(
      expectedBindingIds.map((id) => `pattern.western-tm.${id}`).sort(),
    );
    for (const { record } of westernTmB4bSpecialHandClaims) {
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
    const claims = new Map(westernTmB4bSpecialHandClaims.map(({ record }) => [record.subjectId, record.claim]));
    expect(claims.get('pattern.western-tm.wind-pair-with-three-suit-chows')).toContain('three distinct singles');
    expect(claims.get('pattern.western-tm.wind-pair-with-three-suit-one-two-three-chows')).toContain('123 Chows in all three suits');
    expect(claims.get('pattern.western-tm.wind-pair-with-three-suit-seven-eight-nine-chows')).toContain('789 Chows in all three suits');
    expect(claims.get('pattern.western-tm.wind-pair-with-one-meld-in-each-suit')).toContain('remain concealed');
    expect(claims.get('pattern.western-tm.four-chows-three-suits-with-own-wind-pair')).toContain('player’s own Wind');
    for (const id of ['wind-pair-with-three-suit-rank-one-melds', 'wind-pair-with-three-suit-rank-nine-melds', 'wind-pair-with-three-suit-rank-three-melds', 'wind-pair-with-three-suit-rank-seven-melds']) {
      expect(claims.get(`pattern.western-tm.${id}`)).toContain('one Wind pair and three distinct Wind singles');
    }
  });

  it('targets exact executable Western bindings without copying scores or treatment qualifications', () => {
    expect(westernTmB4bSpecialHandTreatments).toHaveLength(21);
    const bindingIds = new Set(westernTmSpecialHandBindings.map(({ patternId }) => patternId));
    for (const versionedTreatment of westernTmB4bSpecialHandTreatments) {
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

  it('preserves Unique Wonder and B4A, leaves deferred rows untreated, and identifies every remaining eligible row as B4C', () => {
    const profile = { id: 'western-tm', version: '0.1' } as const;
    const treatments = currentTruthIndex.treatmentsForProfile(profile).map(({ record }) => record);
    const treatmentIds = new Set(treatments.map(({ treatmentId }) => treatmentId));
    expect(westernTmB4aSpecialHandTreatments).toHaveLength(34);
    for (const { record } of westernTmB4aSpecialHandTreatments) {
      expect(treatmentIds.has(record.treatmentId)).toBe(true);
      expect(treatments.find(({ treatmentId }) => treatmentId === record.treatmentId)).toEqual(record);
    }
    const uniqueWonder = treatments.find(({ treatmentId }) => treatmentId === 'western-tm@0.1:thirteen-unique-wonders');
    expect(uniqueWonder).toEqual({
      treatmentId: 'western-tm@0.1:thirteen-unique-wonders',
      profile,
      subjectId: 'pattern.thirteen-orphans',
      runtimeState: { kind: 'executable', ref: { kind: 'binding', id: 'thirteen-unique-wonders' } },
      evidenceClaimIds: ['evidence.pattern.thirteen-orphans.western-tm', 'evidence.pattern.thirteen-orphans.classical-membership-audit'],
    });
    const deferred = ['purity-one-chow', 'honours-and-one-suit-terminals-pung-kong-hand', 'one-suit-with-honours-mostly-pung-kong-hand'];
    const treatedBindingIds = new Set(treatments.flatMap(({ runtimeState }) => runtimeState.kind === 'executable' && runtimeState.ref.kind === 'binding' ? [runtimeState.ref.id] : []));
    expect(deferred.some((id) => treatedBindingIds.has(id))).toBe(false);
    const eligibleUntreated = westernTmSpecialHandBindings
      .map(({ patternId }) => patternId)
      .filter((id) => !treatedBindingIds.has(id) && !deferred.includes(id));
    expect(eligibleUntreated.sort()).toEqual([...expectedB4cBindingIds].sort());
    expect(treatments).toHaveLength(56);
    expect(currentTruthCorpus.treatments.filter(({ record }) => record.profile.id === 'western-tm')).toHaveLength(56);
  });
});
