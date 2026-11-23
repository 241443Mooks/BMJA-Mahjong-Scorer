import { describe, expect, it } from 'vitest';
import { bonus, scoreHand, set, suited, wind } from '../scoring';
import { BMJA_BONUS_TILE_SCORING, bonusTileSubtotal, scoreBonusDoubles, scoreBonusTiles } from '../scoring/rules';
import type { MahjongHand } from '../scoring';
import { currentTruthCorpus } from '../rules-knowledge/truth/current';
import { explainBritishFlowersAndSeasons } from '../rules-knowledge/truth/explain-british-flowers-seasons';
import { currentTruthValidationEnvironment } from '../rules-knowledge/truth/current-validation-environment';
import type { TruthCorpus } from '../rules-knowledge/truth/records';

const profile = { id: 'bmja', version: '1.0' } as const;
const subjectIds = [
  'rule.classical.flower-season-base-scoring',
  'rule.classical.own-flower-season-double',
  'rule.classical.complete-flower-season-set-double',
];

type MutableCorpus = {
  sources: [...TruthCorpus['sources']];
  subjects: [...TruthCorpus['subjects']];
  claims: [...TruthCorpus['claims']];
  treatments: [...TruthCorpus['treatments']];
};

const altered = (change: (copy: MutableCorpus) => void): TruthCorpus => {
  const copy: MutableCorpus = {
    sources: [...currentTruthCorpus.sources],
    subjects: [...currentTruthCorpus.subjects],
    claims: [...currentTruthCorpus.claims],
    treatments: [...currentTruthCorpus.treatments],
  };
  change(copy);
  return copy;
};

describe('British Flowers and Seasons source-to-scorer proof', () => {
  it('projects the three published claims, exact BMJA treatment, runtime owners and friendly explanation', () => {
    const explanation = explainBritishFlowersAndSeasons();
    expect(explanation).toMatchObject({
      available: true,
      profile,
      title: 'Flowers and Seasons',
      summary: expect.stringContaining('Each Flower or Season adds 4 points.'),
      sourceFacts: [
        { claim: { recordId: `evidence.${subjectIds[0]}.bmja`, recordVersion: 1, reviewStatus: 'verified', text: 'Each Flower or Season scores 4 points.' }, source: { recordId: 'bmja-scoring', recordVersion: 1, sourceId: 'bmja-scoring', citation: 'British Mahjong Association, Working out the scores', authority: 'governing', locator: { url: 'https://mahjongbritishrules.wordpress.com/scoring/working-out-the-scores/', label: 'Flowers and Seasons' } } },
        { claim: { recordId: `evidence.${subjectIds[1]}.bmja`, recordVersion: 1, reviewStatus: 'verified', text: 'Having the player’s own Flower or own Season doubles the score.' }, source: { recordId: 'bmja-scoring', recordVersion: 1, sourceId: 'bmja-scoring', locator: { label: 'Doubling for all players — own Flower and own Season' } } },
        { claim: { recordId: `evidence.${subjectIds[2]}.bmja`, recordVersion: 1, reviewStatus: 'verified', text: 'A complete set of Flowers or of Seasons doubles twice, including the corresponding own-tile double.' }, source: { recordId: 'bmja-scoring', recordVersion: 1, sourceId: 'bmja-scoring', locator: { label: 'Doubling for all players — complete Flowers and complete Seasons' } } },
      ],
      scorerBehaviour: [
        expect.stringContaining('ordinary hand'),
        expect.stringContaining('fixed special hand'),
        expect.stringContaining('Fishing means'),
      ],
      technical: [
        { subjectId: subjectIds[0], treatment: { recordId: `bmja@1.0:${subjectIds[0]}`, recordVersion: 1, runtimeState: { kind: 'executable', ref: { kind: 'rule', id: 'scoring.scoreBonusTiles' } } }, mapping: { state: 'connected', ruleRef: { kind: 'rule', id: 'scoring.scoreBonusTiles' } }, fixtures: ['src/rules-platform/truth-british-flowers-seasons.test.ts'] },
        { subjectId: subjectIds[1], treatment: { recordId: `bmja@1.0:${subjectIds[1]}`, recordVersion: 1, runtimeState: { kind: 'executable', ref: { kind: 'rule', id: 'scoring.scoreBonusDoubles' } } }, mapping: { state: 'connected', ruleRef: { kind: 'rule', id: 'scoring.scoreBonusDoubles' } }, fixtures: ['src/rules-platform/truth-british-flowers-seasons.test.ts'] },
        { subjectId: subjectIds[2], treatment: { recordId: `bmja@1.0:${subjectIds[2]}`, recordVersion: 1, runtimeState: { kind: 'executable', ref: { kind: 'rule', id: 'scoring.scoreBonusDoubles' } } }, mapping: { state: 'connected', ruleRef: { kind: 'rule', id: 'scoring.scoreBonusDoubles' } }, fixtures: ['src/rules-platform/truth-british-flowers-seasons.test.ts'] },
      ],
    });
    if (explanation.available) {
      expect(explanation.scorerBehaviour[1]).toContain('Flower and Season points are added separately');
      expect(explanation.technical.map(({ subjectId }) => subjectId)).toEqual(subjectIds);
      expect(explanation.technical.map(({ mapping }) => mapping.ruleRef.id)).toEqual([
        'scoring.scoreBonusTiles', 'scoring.scoreBonusDoubles', 'scoring.scoreBonusDoubles',
      ]);
      expect(new Set(explanation.technical.map(({ treatment }) => treatment.recordId)).size).toBe(3);
      expect(explanation.technical.every(({ fixtures }) => fixtures.includes('src/rules-platform/truth-british-flowers-seasons.test.ts'))).toBe(true);
    }
    for (const subjectId of subjectIds) {
      const treatment = currentTruthCorpus.treatments.find(({ record }) =>
        record.treatmentId === `bmja@1.0:${subjectId}`)?.record;
      expect(treatment?.runtimeState.kind).toBe('executable');
      if (treatment?.runtimeState.kind === 'executable') {
        expect(currentTruthValidationEnvironment.runtimeTreatmentExists(profile, treatment.runtimeState.ref)).toBe(true);
      }
    }
  });

  it('fails closed for another profile, missing or ambiguous claims, unsupported claims and absent or wrong runtime mappings', () => {
    expect(explainBritishFlowersAndSeasons({ id: 'bmja', version: '0.9' }).available).toBe(false);
    expect(explainBritishFlowersAndSeasons({ id: 'outside-the-box', version: '0.1' }).available).toBe(false);

    const claimId = 'evidence.rule.classical.flower-season-base-scoring.bmja';
    expect(explainBritishFlowersAndSeasons(profile, altered((copy) => {
      copy.claims = copy.claims.filter(({ record }) => record.claimId !== claimId);
    })).available).toBe(false);
    expect(explainBritishFlowersAndSeasons(profile, altered((copy) => {
      const claim = copy.claims.find(({ record }) => record.claimId === claimId)!;
      copy.claims = [...copy.claims, claim];
    })).available).toBe(false);
    expect(explainBritishFlowersAndSeasons(profile, altered((copy) => {
      const index = copy.claims.findIndex(({ record }) => record.claimId === claimId);
      const entry = copy.claims[index]!;
      copy.claims[index] = { ...entry, record: { ...entry.record, status: 'conflict' } };
    })).available).toBe(false);
    expect(explainBritishFlowersAndSeasons(profile, altered((copy) => {
      const index = copy.treatments.findIndex(({ record }) => record.treatmentId === `bmja@1.0:${subjectIds[0]}`);
      const entry = copy.treatments[index]!;
      copy.treatments[index] = { ...entry, record: { ...entry.record, runtimeState: { kind: 'migration-incomplete' } } };
    })).available).toBe(false);
    expect(explainBritishFlowersAndSeasons(profile, altered((copy) => {
      const index = copy.treatments.findIndex(({ record }) => record.treatmentId === `bmja@1.0:${subjectIds[0]}`);
      const entry = copy.treatments[index]!;
      copy.treatments[index] = { ...entry, record: { ...entry.record, runtimeState: { kind: 'executable', ref: { kind: 'rule', id: 'scoreSomethingNamedSimilarly' } } } };
    })).available).toBe(false);
  });

  it('keeps the linked scorer behaviour in ordinary, fixed-special and fishing calculations', () => {
    const ordinary: MahjongHand = {
      sets: [
        set('c1', 'chow', suited('bamboo', 1)),
        set('p1', 'pung', suited('bamboo', 5)), set('p2', 'pung', suited('characters', 6)),
        set('p3', 'pung', suited('circles', 7)),
        set('pair', 'pair', wind('south')),
      ],
      bonusTiles: [1, 2, 3, 4].map((number) => bonus('flower', number as 1 | 2 | 3 | 4)),
      isWinner: true,
    };
    const standard = scoreHand(ordinary);
    expect(standard.scoringMode).toBe('standard');
    expect(standard.valid).toBe(true);
    expect(standard.validationErrors).toEqual([]);
    expect(standard.pointRules.filter(({ id }) => id.startsWith('bonus-flower-')).map(({ amount }) => amount)).toEqual([4, 4, 4, 4]);
    expect(standard.doubleRules).toContainEqual(expect.objectContaining({ id: 'flower-bouquet', amount: 2 }));
    expect(standard.calculationComponents[0]).toMatchObject({ id: 'standard-hand', doubles: 2 });

    const fixedSpecial: MahjongHand = {
      sets: [
        set('e', 'pair', wind('east')), set('s', 'pair', wind('south')),
        set('b', 'pair', suited('bamboo', 1)), set('c', 'pair', suited('characters', 9)),
        set('r', 'pair', { family: 'dragon', dragon: 'red' }), set('g', 'pair', { family: 'dragon', dragon: 'green' }),
        set('w', 'pair', { family: 'dragon', dragon: 'white' }),
      ],
      bonusTiles: [bonus('season', 1)],
      isWinner: true,
    };
    const special = scoreHand(fixedSpecial);
    expect(special.scoringMode).toBe('special');
    expect(special.calculationComponents).toContainEqual(expect.objectContaining({ id: 'special-bonus-tiles', base: 4, doubles: 1, subtotal: 8 }));

    const fishing: MahjongHand = {
      sets: [],
      looseTiles: [
        suited('bamboo', 1), suited('bamboo', 9), suited('characters', 1), suited('characters', 9),
        suited('circles', 1), suited('circles', 9), wind('east'), wind('south'), wind('west'), wind('north'),
        { family: 'dragon', dragon: 'red' }, { family: 'dragon', dragon: 'green' }, { family: 'dragon', dragon: 'white' },
      ],
      bonusTiles: [bonus('flower', 4), bonus('season', 2)],
      isWinner: false,
      originalCall: false,
    };
    const calling = scoreHand(fishing, { playerWind: 'north', prevailingWind: 'east', limit: 1000 });
    expect(calling.specialFishing?.id).toBe('thirteen-unique-wonders');
    expect(calling.calculationComponents).toContainEqual(expect.objectContaining({ id: 'fishing-special-bonus-tiles', base: 8, doubles: 1, subtotal: 16 }));
  });

  it('derives prose and executed bonus values from the same scoring-owner contract', () => {
    const changed = {
      ...BMJA_BONUS_TILE_SCORING,
      pointsEach: 5,
      ownTileDoubles: 2,
      completeSetDoubles: 3,
      completeSetIncludesOwnTile: false,
      modes: {
        ...BMJA_BONUS_TILE_SCORING.modes,
        fixedSpecial: { ...BMJA_BONUS_TILE_SCORING.modes.fixedSpecial, doubles: 'none' as const, finalDiscardDoubles: 0 },
        fishing: { ...BMJA_BONUS_TILE_SCORING.modes.fishing, doubles: 'none' as const },
      },
    };
    const completeFlowers: MahjongHand = {
      sets: [], bonusTiles: [1, 2, 3, 4].map((number) => bonus('flower', number as 1 | 2 | 3 | 4)), isWinner: false,
    };
    const executedPoints = scoreBonusTiles(completeFlowers, changed).map(({ amount }) => amount);
    const executedDoubles = scoreBonusDoubles(completeFlowers, { playerWind: 'east', prevailingWind: 'east', limit: 1000 }, changed);
    const explanation = explainBritishFlowersAndSeasons(profile, currentTruthCorpus, changed);

    expect(executedPoints).toEqual([5, 5, 5, 5]);
    expect(executedDoubles.map(({ amount }) => amount)).toEqual([3, 2]);
    expect(explanation.available).toBe(true);
    if (explanation.available) {
      expect(explanation.summary).toContain('Each Flower or Season adds 5 points.');
      expect(explanation.summary).toContain('3 doubles, with the matching-tile double counted separately');
      expect(explanation.scorerBehaviour[1]).toContain('no doubles are applied to those bonus points');
      expect(explanation.scorerBehaviour[1]).toContain('A final discard adds 0 bonus doubles');
      expect(explanation.scorerBehaviour[2]).toContain('no doubles are applied to those bonus points');
    }
    expect(bonusTileSubtotal(20, 2, changed.modes.fixedSpecial.doubles)).toBe(20);
    expect(bonusTileSubtotal(20, 2, changed.modes.fishing.doubles)).toBe(20);
  });
});
