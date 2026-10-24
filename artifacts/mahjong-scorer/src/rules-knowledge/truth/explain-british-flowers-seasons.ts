import type { EvidenceClaim, ProfileTreatment, RuntimeTreatmentRef, SemanticSubject, SourceRecord, VersionedTruthRecord } from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';
import { BMJA_BONUS_TILE_SCORING, describeBonusTileScoring, type BonusTileScoringContract } from '../../scoring/rules';
import { currentTruthCorpus } from './current';
import type { TruthCorpus } from './records';
import { formatSourceLocator } from './explain-runtime-treatment';
import { flowerSeasonRuntimeRefBySubject, isClassicalScoringRule } from './classical-scoring-runtime';

const profile = { id: 'bmja', version: '1.0' } as const;
type SubjectId = keyof typeof flowerSeasonRuntimeRefBySubject;
type ResolvedFact = {
  subject: VersionedTruthRecord<SemanticSubject>;
  claim: VersionedTruthRecord<EvidenceClaim>;
  treatment: VersionedTruthRecord<ProfileTreatment>;
  source: VersionedTruthRecord<SourceRecord>;
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
        claim: { recordId: string; recordVersion: number; reviewStatus: EvidenceClaim['status']; text: string };
        source: {
          recordId: string;
          recordVersion: number;
          sourceId: string;
          citation: string;
          authority: SourceRecord['authority'];
          locator: { label: string; url?: string };
        };
      }[];
      scorerBehaviour: readonly string[];
      technical: readonly {
        subjectId: string;
        treatment: { recordId: string; recordVersion: number; runtimeState: ProfileTreatment['runtimeState'] };
        mapping: { state: 'connected'; ruleRef: RuntimeTreatmentRef };
        fixture: { file: string; cases: readonly string[] };
      }[];
    };

const current = <T>(records: readonly VersionedTruthRecord<T>[]) => records
  .filter(({ lifecycle }) => lifecycle === 'current');

const exactlyOne = <T>(items: readonly T[]): T | undefined => items.length === 1 ? items[0] : undefined;

const resolveFact = (
  corpus: TruthCorpus,
  requestedProfile: RulesProfileRef,
  subjectId: SubjectId,
): ResolvedFact | undefined => {
  if (requestedProfile.id !== profile.id || requestedProfile.version !== profile.version) return undefined;
  const subject = exactlyOne(current(corpus.subjects).filter(({ record }) => record.id === subjectId));
  const treatment = exactlyOne(current(corpus.treatments).filter(({ record }) =>
    record.subjectId === subjectId
    && record.profile.id === requestedProfile.id
    && record.profile.version === requestedProfile.version));
  if (!subject || !treatment || treatment.record.runtimeState.kind !== 'executable') return undefined;

  const expected = flowerSeasonRuntimeRefBySubject[subjectId];
  const runtime = treatment.record.runtimeState.ref;
  if (runtime.kind !== expected.kind || runtime.id !== expected.id || !isClassicalScoringRule(requestedProfile, runtime.id)) return undefined;

  const claim = exactlyOne(current(corpus.claims).filter(({ record }) =>
    treatment.record.evidenceClaimIds.includes(record.claimId)
    && record.subjectId === subjectId
    && record.supportsProfile?.id === requestedProfile.id
    && record.supportsProfile.version === requestedProfile.version
    && (record.status === 'verified' || record.status === 'verified-club')));
  if (!claim) return undefined;
  const source = exactlyOne(current(corpus.sources).filter(({ record }) =>
    record.sourceId === claim.record.sourceId
    && record.authorityForProfileIds.includes(requestedProfile.id)));
  if (!source) return undefined;
  return { subject, claim, treatment, source, runtime };
};

/** Read-only, fail-closed proof projection for the three BMJA Flower/Season claims. */
export const explainBritishFlowersAndSeasons = (
  requestedProfile: RulesProfileRef = profile,
  corpus: TruthCorpus = currentTruthCorpus,
  contract: BonusTileScoringContract = BMJA_BONUS_TILE_SCORING,
): BritishFlowersSeasonsExplanation => {
  const subjectIds = Object.keys(flowerSeasonRuntimeRefBySubject) as SubjectId[];
  const facts = subjectIds.map((subjectId) => resolveFact(corpus, requestedProfile, subjectId));
  if (facts.some((fact) => fact === undefined)) return { available: false };
  const resolved = facts as ResolvedFact[];
  const description = describeBonusTileScoring(contract);

  return {
    available: true,
    profile: { id: requestedProfile.id, version: requestedProfile.version },
    title: 'Flowers and Seasons',
    summary: description.summary,
    sourceFacts: resolved.map(({ claim, source }) => ({
      claim: {
        recordId: claim.record.claimId,
        recordVersion: claim.recordVersion,
        reviewStatus: claim.record.status,
        text: claim.record.claim,
      },
      source: {
        recordId: source.record.sourceId,
        recordVersion: source.recordVersion,
        sourceId: source.record.sourceId,
        citation: source.record.citation,
        authority: source.record.authority,
        locator: {
          label: formatSourceLocator(claim.record.locator),
          ...(claim.record.locator.kind === 'url' ? { url: claim.record.locator.url } : {}),
        },
      },
    })),
    scorerBehaviour: [description.behavior.ordinary, description.behavior.fixedSpecial, description.behavior.fishing],
    technical: resolved.map(({ subject, treatment, runtime }) => ({
      subjectId: subject.record.id,
      treatment: {
        recordId: treatment.record.treatmentId,
        recordVersion: treatment.recordVersion,
        runtimeState: treatment.record.runtimeState,
      },
      mapping: { state: 'connected', ruleRef: runtime },
      fixture: {
        file: 'src/rules-platform/truth-british-flowers-seasons.test.ts',
        cases: ['keeps the linked scorer behaviour in ordinary, fixed-special and fishing calculations'],
      },
    })),
  };
};
