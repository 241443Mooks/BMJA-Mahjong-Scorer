import { beforeAll, describe, expect, it } from 'vitest';
import { BMJA_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, WESTERN_TM_PROFILE_REF } from '../game/ruleset';
import { BUZZARD_2000_PROFILE_REF, buzzard2000SpecialHandBindings } from '../game/buzzard-2000';
import { outsideTheBoxSpecialHandBindings } from '../game/outside-the-box-catalogue';
import { westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { scoreHand } from '../scoring';
import { specialHandExampleById, exampleHandScorerContext } from './special-hand-examples';
import { scoringExamples, resolveScoringExampleReferences } from './scoring-examples';
import { resolveSpecialHandTreatment, specialHandTreatmentsForProfile } from '../rules-knowledge/special-hand-treatments';
import { specialHandBindingsForCurrentClassicalProfile } from '../rules-knowledge/current-classical-special-hand-bindings';
import { bmjaSpecialHandBindings } from '../scoring/special-hands';

beforeAll(() => initialiseCurrentRulesRuntimes());

describe('profile-local special-hand treatments', () => {
  it('resolves exact BMJA profile/version and pattern identity to binding facts and stable anchors', () => {
    const treatment = resolveSpecialHandTreatment(BMJA_PROFILE_REF, 'all-pair-honours');
    expect(treatment).toMatchObject({
      identity: { profile: BMJA_PROFILE_REF, patternId: 'all-pair-honours' },
      referenceId: 'bmja@1.0:all-pair-honours',
      name: 'All pair honours',
      scoreModel: 'fixed',
      winnerValue: 500,
      fishingValue: 200,
      href: '/special-hands#all-pair-honours',
    });
    expect(resolveSpecialHandTreatment(BMJA_PROFILE_REF, 'three-great-scholars')?.fishingUsesIntrinsicFloor).toBe(true);
    expect(specialHandTreatmentsForProfile(BMJA_PROFILE_REF).every((item) => item.href && item.winnerValue !== undefined)).toBe(true);
    expect(resolveSpecialHandTreatment({ ...BMJA_PROFILE_REF, version: '2.0' }, 'all-pair-honours')).toBeUndefined();
    expect(resolveSpecialHandTreatment(BMJA_PROFILE_REF, 'All Pair Honours')).toBeUndefined();
    expect(specialHandTreatmentsForProfile({ id: 'unknown', version: '1.0' })).toEqual([]);
  });

  it('resolves both worked-example labels and links through treatment references', () => {
    const wonders = scoringExamples.find((example) => example.id === 'thirteen-wonders-fishing')!;
    const honours = scoringExamples.find((example) => example.id === 'all-pair-honours-bonus')!;
    expect(wonders.references.some((reference) => !('treatment' in reference) && reference.href === '/special-hands#thirteen-unique-wonders')).toBe(false);
    expect(resolveScoringExampleReferences(wonders)).toContainEqual({ label: 'Thirteen unique wonders', href: '/special-hands#thirteen-unique-wonders' });
    expect(resolveScoringExampleReferences(honours)).toContainEqual({ label: 'All pair honours', href: '/special-hands#all-pair-honours' });
  });

  it('resolves Western treatments from Western bindings without borrowing BMJA identity or anchors', () => {
    const treatment = resolveSpecialHandTreatment(WESTERN_TM_PROFILE_REF, 'all-pair-honours');
    expect(treatment).toMatchObject({
      identity: { profile: WESTERN_TM_PROFILE_REF, patternId: 'all-pair-honours' },
      referenceId: 'western-tm@0.1:all-pair-honours',
      name: 'All Pair Honours',
      scoreModel: 'fixed',
      winnerValue: 1000,
      fishingValue: 400,
    });
    expect(treatment?.href).toBeUndefined();
    expect(resolveSpecialHandTreatment(BMJA_PROFILE_REF, 'seven-pairs-all-from-wall')).toBeUndefined();
    expect(resolveSpecialHandTreatment(WESTERN_TM_PROFILE_REF, 'seven-pairs-all-from-wall')).toMatchObject({
      referenceId: 'western-tm@0.1:seven-pairs-all-from-wall',
      name: 'Seven Twins',
      winningMethods: ['wall', 'last-wall-tile'],
    });
    expect(resolveSpecialHandTreatment(WESTERN_TM_PROFILE_REF, 'wind-pair-with-three-suit-rank-one-melds')?.exposurePolicy).toEqual({
      scoreModel: 'fixed',
      policy: { allowed: true, exposedValue: 500, exposedFishingValue: 200 },
    });
    expect(resolveSpecialHandTreatment(WESTERN_TM_PROFILE_REF, 'purity-one-chow')).toMatchObject({
      scoreModel: 'calculated',
      exposurePolicy: {
        scoreModel: 'calculated',
        policy: { multiplier: 0.5, triggerSetKinds: ['pung', 'kong'], forbiddenSetKinds: ['chow'] },
      },
    });
  });

  it('projects Club fixed exposure policy and Buzzard configured limits without numeric values', () => {
    expect(resolveSpecialHandTreatment(OUTSIDE_THE_BOX_PROFILE_REF, 'buried-treasure')).toMatchObject({
      identity: { profile: OUTSIDE_THE_BOX_PROFILE_REF, patternId: 'buried-treasure' },
      referenceId: 'outside-the-box@0.1:buried-treasure',
      scoreModel: 'fixed',
      winnerValue: 1000,
      exposurePolicy: { scoreModel: 'fixed', policy: { allowed: false } },
    });
    expect(resolveSpecialHandTreatment(BUZZARD_2000_PROFILE_REF, 'all-winds-and-dragons')).toMatchObject({
      identity: { profile: BUZZARD_2000_PROFILE_REF, patternId: 'all-winds-and-dragons' },
      referenceId: 'buzzard-2000@0.1:all-winds-and-dragons',
      scoreModel: 'configured-limit',
    });
    const buzzard = resolveSpecialHandTreatment(BUZZARD_2000_PROFILE_REF, 'all-winds-and-dragons');
    expect(buzzard).not.toHaveProperty('winnerValue');
    expect(buzzard).not.toHaveProperty('fishingValue');
    expect(resolveSpecialHandTreatment(OUTSIDE_THE_BOX_PROFILE_REF, 'club-three-great-scholars')).toMatchObject({
      referenceId: 'outside-the-box@0.1:club-three-great-scholars',
      name: 'Three Great Scholars',
      winnerValue: 1000,
      fishingValue: 400,
      exposurePolicy: { scoreModel: 'fixed', policy: { allowed: true } },
    });
    expect(resolveSpecialHandTreatment(BUZZARD_2000_PROFILE_REF, 'buzzard-three-dragons-winner')).toMatchObject({
      referenceId: 'buzzard-2000@0.1:buzzard-three-dragons-winner',
      name: 'Three Dragons',
      scoreModel: 'configured-limit',
    });
  });

  it('keeps Knitting and Triple Knitting scores and Club exposure profile-local', () => {
    for (const patternId of ['knitting', 'triple-knitting']) {
      expect(resolveSpecialHandTreatment(BMJA_PROFILE_REF, patternId)).toMatchObject({
        referenceId: `bmja@1.0:${patternId}`,
        scoreModel: 'fixed',
        winnerValue: 500,
        fishingValue: 200,
      });
    }
    expect(resolveSpecialHandTreatment(WESTERN_TM_PROFILE_REF, 'two-suit-knitting')).toMatchObject({
      referenceId: 'western-tm@0.1:two-suit-knitting',
      name: 'Knitting',
      scoreModel: 'fixed',
      winnerValue: 500,
      fishingValue: 200,
    });
    expect(resolveSpecialHandTreatment(WESTERN_TM_PROFILE_REF, 'three-suit-knitting-with-pair')).toMatchObject({
      referenceId: 'western-tm@0.1:three-suit-knitting-with-pair',
      name: 'Triple Knitting',
      scoreModel: 'fixed',
      winnerValue: 500,
      fishingValue: 200,
    });
    for (const patternId of ['knitting', 'triple-knitting']) {
      expect(resolveSpecialHandTreatment(OUTSIDE_THE_BOX_PROFILE_REF, patternId)).toMatchObject({
        referenceId: `outside-the-box@0.1:${patternId}`,
        scoreModel: 'fixed',
        winnerValue: 500,
        fishingValue: 200,
        exposurePolicy: { scoreModel: 'fixed', policy: { allowed: false } },
      });
    }
  });

  it('fails closed for non-current profiles and returns the authoritative binding arrays unchanged', () => {
    expect(specialHandTreatmentsForProfile({ id: 'western-tm', version: '0.2' })).toEqual([]);
    expect(specialHandTreatmentsForProfile({ id: 'mcr-wmo-2006', version: '0.1' })).toEqual([]);
    expect(specialHandBindingsForCurrentClassicalProfile(BMJA_PROFILE_REF)).toBe(bmjaSpecialHandBindings);
    expect(specialHandBindingsForCurrentClassicalProfile(WESTERN_TM_PROFILE_REF)).toBe(westernTmSpecialHandBindings);
    expect(specialHandBindingsForCurrentClassicalProfile(OUTSIDE_THE_BOX_PROFILE_REF)).toBe(outsideTheBoxSpecialHandBindings);
    expect(specialHandBindingsForCurrentClassicalProfile(BUZZARD_2000_PROFILE_REF)).toBe(buzzard2000SpecialHandBindings);
  });

  it('resolves a real scorer-produced result to the same treatment identity', () => {
    const example = specialHandExampleById('all-pair-honours')!;
    const context = exampleHandScorerContext(example).detailedHand!.context;
    const result = scoreHand(example.hand, context).specialHands.find((item) => item.matched && item.id === 'all-pair-honours')!;
    expect(result.scoreModel).toBe('fixed');
    if (result.scoreModel !== 'fixed') throw new Error('Expected the scorer to produce a fixed-value special hand.');
    const treatment = resolveSpecialHandTreatment(BMJA_PROFILE_REF, result.id);
    expect(treatment).toMatchObject({ identity: { profile: BMJA_PROFILE_REF, patternId: result.id }, name: result.name, winnerValue: result.value, href: '/special-hands#all-pair-honours' });
  });
});
