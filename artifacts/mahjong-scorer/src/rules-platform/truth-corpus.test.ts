import { describe, expect, it } from 'vitest';
import { createTruthIndex, currentTruthCorpus, currentTruthIndex, currentTruthValidationEnvironment, projectSourceRegister, truthImpactForSource } from '../rules-knowledge/truth';
import { MCR_2006_FAN_BINDINGS, detectMcr2006Fans } from './mcr-detectors';
import type { McrScoringInput } from './mcr-scoring-input';

describe('current typed truth corpus', () => {
  it('indexes exact source, subject, claim, and profile treatment identities', () => {
    const subjectId = 'pattern.thirteen-orphans';
    expect(currentTruthIndex.subjectById(subjectId)?.record.kind).toBe('pattern');
    expect(currentTruthIndex.claimsForSubject(subjectId)).toHaveLength(6);
    const buzzardClaims = currentTruthIndex.claimsForSource('buzzard-2000-classical').map(({ record }) => record);
    expect(buzzardClaims).toHaveLength(56);
    expect(buzzardClaims.every(({ supportsProfile }) => supportsProfile?.id === 'buzzard-2000' && supportsProfile.version === '0.1')).toBe(true);
    expect(currentTruthIndex.claimById('evidence.pattern.thirteen-orphans.outside-the-box')?.record.locator).toEqual({
      kind: 'club-material',
      title: 'Outside the Box Mahjong guide supplied by Rachel',
      version: 'September 2026',
      section: '13 Unique Wonders',
      page: '12–14',
    });
    expect(currentTruthIndex.treatmentsForSubject(subjectId).map(({ record }) => record.treatmentId)).toEqual([
      'bmja@1.0:thirteen-unique-wonders',
      'buzzard-2000@0.1:thirteen-unique-wonders',
      'mcr-wmo-2006@0.1:thirteen-orphans',
      'outside-the-box@0.1:thirteen-unique-wonders',
      'western-tm@0.1:thirteen-unique-wonders',
    ]);
    expect(currentTruthIndex.treatmentsForProfile({ id: 'western-tm', version: '0.2' })).toEqual([]);
    expect(currentTruthIndex.claimsSupportingProfile({ id: 'outside-the-box', version: '0.1' })).toHaveLength(85);
  });

  it('joins the MCR truth records to the exact pattern-accumulator bindings and detector', () => {
    const profile = { id: 'mcr-wmo-2006', version: '0.1' } as const;
    const mcrTreatment = currentTruthIndex.treatmentById('mcr-wmo-2006@0.1:thirteen-orphans')!.record;
    expect(mcrTreatment).toMatchObject({ profile, subjectId: 'pattern.thirteen-orphans', runtimeState: { kind: 'executable', ref: { kind: 'binding', id: 'mcr2006.fan.thirteen-orphans' } } });
    expect(currentTruthIndex.subjectById('pattern.thirteen-orphans')?.record.kind).toBe('pattern');
    expect(currentTruthIndex.claimById('evidence.pattern.thirteen-orphans.mcr-wmo-2006')?.record).toMatchObject({
      sourceId: 'source.mcr-ema-green-book-2006', supportsProfile: profile,
      locator: { kind: 'publication', section: '§3.8.1 #7; Appendix 1 #7' },
    });
    const bindingId = 'mcr2006.fan.thirteen-orphans';
    expect(MCR_2006_FAN_BINDINGS.some(({ id }) => id === bindingId)).toBe(true);
    expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, { kind: 'policy', id: 'interaction.mcr-2006-non-combination' })).toBe(true);
    expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, { kind: 'policy', id: 'qualification.mcr-8-before-flowers' })).toBe(true);
    expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, { kind: 'policy', id: 'interaction.not-configured' })).toBe(false);

    const t = (s: 'characters' | 'bamboo' | 'dots', rank: number) => ({ face: { family: 'suit' as const, suit: s, rank } });
    const w = (wind: 'east' | 'south' | 'west' | 'north') => ({ face: { family: 'wind' as const, wind } });
    const d = (dragon: 'red' | 'green' | 'white') => ({ face: { family: 'dragon' as const, dragon } });
    const fixture: McrScoringInput = {
      evidence: { fixedGroups: [], freeTiles: [t('characters', 1), t('characters', 9), t('bamboo', 1), t('bamboo', 9), t('dots', 1), t('dots', 9), w('east'), w('south'), w('west'), w('north'), d('red'), d('green'), d('white'), t('characters', 1)], winningTile: t('characters', 1), flowerCount: 0 },
      context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false },
    };
    expect(detectMcr2006Fans(fixture).candidates.some((candidate) => candidate.bindingId === bindingId)).toBe(true);
  });

  it('follows source impact through claims to only the supported treatments', () => {
    expect(currentTruthIndex.treatmentsDependingOnSource('buzzard-2000-classical').map(({ record }) => record.treatmentId).sort()).toEqual([
      'buzzard-2000@0.1:all-winds-and-dragons',
      'buzzard-2000@0.1:buzzard-three-dragons-winner',
      'buzzard-2000@0.1:earths-blessing',
      'buzzard-2000@0.1:east-thirteenth-consecutive-mahjong',
      'buzzard-2000@0.1:heads-and-tails',
      'buzzard-2000@0.1:heavens-blessing',
      'buzzard-2000@0.1:one-suit-nine-gates-any-completion',
      'buzzard-2000@0.1:rule.buzzard-2000.all-chows-nonscoring-pair-double',
      'buzzard-2000@0.1:rule.buzzard-2000.complete-flower-season-set-double',
      'buzzard-2000@0.1:rule.buzzard-2000.dangerous-discard-liability-suppresses-pairwise-settlement',
      'buzzard-2000@0.1:rule.buzzard-2000.false-mahjong-exposure-penalty',
      'buzzard-2000@0.1:rule.buzzard-2000.flower-season-set-own-tile-cumulative-doubles',
      'buzzard-2000@0.1:rule.buzzard-2000.incomplete-wind-dragon-limit-settles-as-nonwinner',
      'buzzard-2000@0.1:rule.buzzard-2000.incorrect-tile-count-settlement',
      'buzzard-2000@0.1:rule.buzzard-2000.last-wall-additive-bonus',
      'buzzard-2000@0.1:rule.buzzard-2000.loose-tile-additive-bonus',
      'buzzard-2000@0.1:rule.buzzard-2000.multiple-chows-permitted',
      'buzzard-2000@0.1:rule.buzzard-2000.no-chows-additive-bonus',
      'buzzard-2000@0.1:rule.buzzard-2000.only-possible-winning-tile-bonus',
      'buzzard-2000@0.1:rule.buzzard-2000.ordinary-table-limit',
      'buzzard-2000@0.1:rule.buzzard-2000.pure-one-suit-winner-three-doubles',
      'buzzard-2000@0.1:rule.buzzard-2000.scoreless-hand-bonus',
      'buzzard-2000@0.1:rule.buzzard-2000.self-draw-winner-bonus',
      'buzzard-2000@0.1:rule.buzzard-2000.standing-hand-winner-bonus',
      'buzzard-2000@0.1:rule.classical.all-majors-with-honours-double',
      'buzzard-2000@0.1:rule.classical.all-players-serve-and-lose-east-before-prevailing-advances',
      'buzzard-2000@0.1:rule.classical.chow-base-scoring',
      'buzzard-2000@0.1:rule.classical.dragon-set-double',
      'buzzard-2000@0.1:rule.classical.draw-retains-east',
      'buzzard-2000@0.1:rule.classical.east-payment-doubles',
      'buzzard-2000@0.1:rule.classical.east-retained-after-east-win',
      'buzzard-2000@0.1:rule.classical.exposed-concealed-set-meaning',
      'buzzard-2000@0.1:rule.classical.flower-season-base-scoring',
      'buzzard-2000@0.1:rule.classical.full-game-four-prevailing-wind-rounds',
      'buzzard-2000@0.1:rule.classical.kong-base-scoring',
      'buzzard-2000@0.1:rule.classical.kong-physical-four-structural-one-set',
      'buzzard-2000@0.1:rule.classical.loser-pays-winner-score',
      'buzzard-2000@0.1:rule.classical.mahjong-winner-bonus',
      'buzzard-2000@0.1:rule.classical.non-east-win-rotates-seats',
      'buzzard-2000@0.1:rule.classical.nonwinners-settle-pairwise-score-differences',
      'buzzard-2000@0.1:rule.classical.one-suit-with-honours-double',
      'buzzard-2000@0.1:rule.classical.ordinary-nonwinning-structural-count',
      'buzzard-2000@0.1:rule.classical.ordinary-winning-four-sets-and-pair',
      'buzzard-2000@0.1:rule.classical.ordinary-winning-structural-count',
      'buzzard-2000@0.1:rule.classical.own-flower-season-double',
      'buzzard-2000@0.1:rule.classical.own-wind-set-double',
      'buzzard-2000@0.1:rule.classical.prevailing-wind-set-double',
      'buzzard-2000@0.1:rule.classical.prevailing-winds-east-south-west-north',
      'buzzard-2000@0.1:rule.classical.pung-base-scoring',
      'buzzard-2000@0.1:rule.classical.qualifying-honour-pair-scoring',
      'buzzard-2000@0.1:rule.classical.win-last-wall-double',
      'buzzard-2000@0.1:rule.classical.win-loose-tile-double',
      'buzzard-2000@0.1:rule.classical.win-robbing-kong-double',
      'buzzard-2000@0.1:rule.classical.winner-no-chows-double',
      'buzzard-2000@0.1:thirteen-unique-wonders',
      'buzzard-2000@0.1:three-winds-and-fourth-wind-pair',
    ]);
    expect(currentTruthIndex.treatmentsDependingOnSource('classical-atlas-concept-audit-v1')).toHaveLength(4);
    expect(currentTruthIndex.treatmentsDependingOnSource('source.mcr-ema-green-book-2006').map(({ record }) => record.treatmentId)).toEqual([
      'mcr-wmo-2006@0.1:eight-point-qualification',
      'mcr-wmo-2006@0.1:non-combination',
      'mcr-wmo-2006@0.1:thirteen-orphans',
    ]);
    expect(currentTruthIndex.treatmentsDependingOnSource('source.mcr-ema-green-book-2006', { id: 'mcr-wmo-2006', version: '0.1' })).toHaveLength(3);
    expect(currentTruthIndex.treatmentsDependingOnSource('source.mcr-ema-green-book-2006', { id: 'mcr-wmo-2006', version: '0.2' })).toEqual([]);
    expect(currentTruthIndex.treatmentsDependingOnSource('classical-atlas-concept-audit-v1', { id: 'western-tm', version: '0.1' }).map(({ record }) => record.treatmentId)).toEqual([
      'western-tm@0.1:thirteen-unique-wonders',
    ]);
    expect(currentTruthIndex.treatmentsDependingOnSource('classical-atlas-concept-audit-v1', { id: 'western-tm', version: '0.2' })).toEqual([]);
    const impact = truthImpactForSource(currentTruthIndex, 'buzzard-2000-classical', [
      { treatmentId: 'western-tm@0.1:thirteen-unique-wonders', projectionId: 'atlas:shared-entry' },
      { treatmentId: 'buzzard-2000@0.1:thirteen-unique-wonders', projectionId: 'atlas:thirteen-unique-wonders' },
    ]);
    expect(impact.claimIds).toContain('evidence.pattern.thirteen-orphans.buzzard-2000');
    expect(impact.subjects).toHaveLength(56);
    expect(impact.subjects.find(({ subjectId }) => subjectId === 'pattern.thirteen-orphans')).toEqual({ subjectId: 'pattern.thirteen-orphans', treatmentIds: ['buzzard-2000@0.1:thirteen-unique-wonders'] });
    expect(impact.treatments).toHaveLength(56);
    expect(impact.projections).toEqual([{ treatmentId: 'buzzard-2000@0.1:thirteen-unique-wonders', projectionId: 'atlas:thirteen-unique-wonders' }]);
    expect(impact).toMatchObject({
      treatments: expect.arrayContaining([{ treatmentId: 'buzzard-2000@0.1:thirteen-unique-wonders', profile: { id: 'buzzard-2000', version: '0.1' }, runtimeState: { kind: 'executable', ref: { kind: 'binding', id: 'thirteen-unique-wonders' } } }]),
    });
    expect(currentTruthIndex.claimsByStatus('secondary-only')).toHaveLength(1);
    expect(currentTruthIndex.unresolvedClaims()).toEqual([]);
    const unresolvedStatuses = ['needs-primary-source', 'needs-club-confirmation', 'conflict'] as const;
    const unresolvedClaims = unresolvedStatuses.map((status) => {
      const base = currentTruthCorpus.claims[0];
      return { ...base, recordId: `fixture.${status}`, record: { ...base.record, claimId: `fixture.${status}`, status } };
    });
    const withUnresolved = createTruthIndex({ ...currentTruthCorpus, claims: [...currentTruthCorpus.claims, ...unresolvedClaims] }, currentTruthValidationEnvironment);
    expect(withUnresolved.unresolvedClaims().map(({ record }) => record.status)).toEqual([
      'conflict', 'needs-club-confirmation', 'needs-primary-source',
    ]);
  });

  it('projects the migrated source subset deterministically for human review', () => {
    const first = projectSourceRegister(currentTruthCorpus);
    expect(first).toContain('| buzzard-2000-classical |');
    expect(first).toContain('| classical-atlas-concept-audit-v1 |');
    expect(first).toBe(projectSourceRegister({ ...currentTruthCorpus, sources: [...currentTruthCorpus.sources].reverse() }));
    const reordered = createTruthIndex({
      ...currentTruthCorpus,
      sources: [...currentTruthCorpus.sources].reverse(),
      claims: [...currentTruthCorpus.claims].reverse(),
      treatments: [...currentTruthCorpus.treatments].reverse(),
    }, currentTruthValidationEnvironment);
    expect(reordered.treatmentsDependingOnSource('classical-atlas-concept-audit-v1').map(({ record }) => record.treatmentId))
      .toEqual(currentTruthIndex.treatmentsDependingOnSource('classical-atlas-concept-audit-v1').map(({ record }) => record.treatmentId));
  });

});
