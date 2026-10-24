import type { RulesDimensionId } from './profile-dimensions';

/** Component links say only that the listed subjects support part of a broad dimension. */
export const GOVERNED_DIMENSION_LINKS: Readonly<Partial<Record<RulesDimensionId, Readonly<Record<string, { coverage: 'component'; subjectIds: readonly string[] }>>>>> = Object.freeze({
  'scoring.ordinary-base': {
    'bmja@1.0': { coverage: 'component', subjectIds: ['rule.classical.flower-season-base-scoring'] },
    'outside-the-box@0.1': { coverage: 'component', subjectIds: ['rule.classical.flower-season-base-scoring'] },
    'buzzard-2000@0.1': { coverage: 'component', subjectIds: ['rule.classical.flower-season-base-scoring'] },
  },
  'scoring.multiplier-bonus-policy': {
    'bmja@1.0': { coverage: 'component', subjectIds: ['rule.classical.own-flower-season-double', 'rule.classical.complete-flower-season-set-double'] },
    'outside-the-box@0.1': { coverage: 'component', subjectIds: ['rule.classical.own-flower-season-double', 'rule.classical.complete-flower-season-set-double'] },
    'buzzard-2000@0.1': { coverage: 'component', subjectIds: ['rule.classical.own-flower-season-double', 'rule.buzzard-2000.complete-flower-season-set-double'] },
  },
  'round.draw-follow-up': {
    'bmja@1.0': { coverage: 'component', subjectIds: ['rule.classical.goulash-round-transition'] },
    'outside-the-box@0.1': { coverage: 'component', subjectIds: ['rule.otb.goulash-round-transition'] },
  },
  'round.draw-settlement': {
    'bmja@1.0': { coverage: 'component', subjectIds: ['rule.classical.draw-has-no-settlement'] },
    'outside-the-box@0.1': { coverage: 'component', subjectIds: ['rule.classical.draw-has-no-settlement'] },
  },
  'play.ordinary-chow-policy': {
    'bmja@1.0': { coverage: 'component', subjectIds: ['rule.classical.normal-hand-at-most-one-chow'] },
  },
});

export const governedDimensionLinksFor = (dimension: RulesDimensionId, profile: { id: string; version: string }) =>
  GOVERNED_DIMENSION_LINKS[dimension]?.[`${profile.id}@${profile.version}`];
