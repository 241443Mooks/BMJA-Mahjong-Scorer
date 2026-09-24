import { beforeAll, describe, expect, it } from 'vitest';
import { BMJA_PROFILE_REF } from '../game/ruleset';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { scoreHand } from '../scoring';
import { specialHandExampleById, exampleHandScorerContext } from './special-hand-examples';
import { scoringExamples, resolveScoringExampleReferences } from './scoring-examples';
import { resolveSpecialHandTreatment, specialHandTreatmentsForProfile } from '../rules-knowledge/special-hand-treatments';

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
