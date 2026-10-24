import type { EvidenceClaim, ProfileTreatment, RuntimeTreatmentRef, SemanticSubject, SourceRecord, VersionedTruthRecord } from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';
import { currentTruthCorpus } from './current';
import type { TruthCorpus } from './records';
import { formatSourceLocator } from './explain-runtime-treatment';
import { isClassicalScoringRule } from './classical-scoring-runtime';

const profile = { id: 'bmja', version: '1.0' } as const;
const runtimeRuleBySubject = {
  'rule.classical.flower-season-base-scoring': 'scoring.scoreBonusTiles',
  'rule.classical.own-flower-season-double': 'scoring.scoreBonusDoubles',
  'rule.classical.complete-flower-season-set-double': 'scoring.scoreBonusDoubles',
} as const;

type ResolvedFact = {
  subject: SemanticSubject;
  claim: EvidenceClaim;
  treatment: ProfileTreatment;
  source: SourceRecord;
  runtime: RuntimeTreatmentRef;
};

export type BritishFlowersSeasonsExplanation =
  | { available: false }
  | {
      available: true;
      profile: RulesProfileRef;
      title: string;
      summary: string;
      sourceFacts: readonly {
        claim: string;
        citation: string;
        locator: { label: string; url?: string };
      }[];
      scorerBehaviour: readonly string[];
      technical: readonly { subjectId: string; runtimeRule: string }[];
    };

const currentRecords = <T>(records: readonly VersionedTruthRecord<T>[]) => records
  .filter(({ lifecycle }) => lifecycle === 'current')
  .map(({ record }) => record);

const exactlyOne = <T>(items: readonly T[]): T | undefined => items.length === 1 ? items[0] : undefined;

const resolveFact = (
  corpus: TruthCorpus,
  requestedProfile: RulesProfileRef,
  subjectId: keyof typeof runtimeRuleBySubject,
): ResolvedFact | undefined => {
  if (requestedProfile.id !== profile.id || requestedProfile.version !== profile.version) return undefined;
  const subjects = currentRecords(corpus.subjects).filter((subject) => subject.id === subjectId);
  const subject = exactlyOne(subjects);
  const treatments = currentRecords(corpus.treatments).filter((treatment) =>
    treatment.subjectId === subjectId
    && treatment.profile.id === requestedProfile.id
    && treatment.profile.version === requestedProfile.version);
  const treatment = exactlyOne(treatments);
  if (!subject || !treatment || treatment.runtimeState.kind !== 'executable') return undefined;

  const expectedRule = runtimeRuleBySubject[subjectId];
  const runtime = treatment.runtimeState.ref;
  if (runtime.kind !== 'rule' || runtime.id !== expectedRule || !isClassicalScoringRule(requestedProfile, runtime.id)) return undefined;

  const claims = currentRecords(corpus.claims).filter((claim) =>
    treatment.evidenceClaimIds.includes(claim.claimId)
    && claim.subjectId === subjectId
    && claim.supportsProfile?.id === requestedProfile.id
    && claim.supportsProfile.version === requestedProfile.version
    && (claim.status === 'verified' || claim.status === 'verified-club'));
  const claim = exactlyOne(claims);
  if (!claim) return undefined;
  const sources = currentRecords(corpus.sources).filter((source) =>
    source.sourceId === claim.sourceId
    && source.authorityForProfileIds.includes(requestedProfile.id));
  const source = exactlyOne(sources);
  if (!source) return undefined;
  return { subject, claim, treatment, source, runtime };
};

/** Read-only, fail-closed proof projection for the three BMJA Flower/Season claims. */
export const explainBritishFlowersAndSeasons = (
  requestedProfile: RulesProfileRef = profile,
  corpus: TruthCorpus = currentTruthCorpus,
): BritishFlowersSeasonsExplanation => {
  const facts = (Object.keys(runtimeRuleBySubject) as (keyof typeof runtimeRuleBySubject)[])
    .map((subjectId) => resolveFact(corpus, requestedProfile, subjectId));
  if (facts.some((fact) => fact === undefined)) return { available: false };

  const resolved = facts as ResolvedFact[];
  return {
    available: true,
    profile: { id: requestedProfile.id, version: requestedProfile.version },
    title: 'Flowers and Seasons',
    summary: 'Each Flower or Season adds 4 points. Your matching Flower or Season gives one double. A complete set gives two doubles in total, including that matching-tile double.',
    sourceFacts: resolved.map(({ claim, source }) => ({
      claim: claim.claim,
      citation: source.citation,
      locator: {
        label: formatSourceLocator(claim.locator),
        ...(claim.locator.kind === 'url' ? { url: claim.locator.url } : {}),
      },
    })),
    scorerBehaviour: [
      'For an ordinary hand, bonus points are included in the basic score and ordinary doubles apply to that score.',
      'For a fixed special hand, its fixed value stays separate; eligible Flower and Season doubles apply only to bonus-tile points. The scorer also applies the published final-discard bonus to those points.',
      'While fishing, the scorer keeps bonus points and eligible own-tile or complete-set doubles with the fishing result; the existing scorer chooses the fishing value.',
    ],
    technical: resolved.map(({ subject, runtime }) => ({ subjectId: subject.id, runtimeRule: runtime.id })),
  };
};
