import type { EvidenceClaim, ProfileTreatment, RuntimeTreatmentRef, SourceRecord } from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';
import { BMJA_BONUS_TILE_SCORING, describeBonusTileScoring, type BonusTileScoringContract } from '../../scoring/rules';
import type { TruthCorpus } from './records';
import { currentTruthCorpus } from './current';
import { flowerSeasonRuntimeRefBySubject, isClassicalScoringRule } from './classical-scoring-runtime';
import { readGovernedFacts } from './read-contract';

const profile = { id: 'bmja', version: '1.0' } as const;
type SubjectId = keyof typeof flowerSeasonRuntimeRefBySubject;

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
        fixtures: readonly string[];
      }[];
    };

/** Flower/Season demonstration rendered from the same profile-scoped fact contract used by other surfaces. */
export const explainBritishFlowersAndSeasons = (
  requestedProfile: RulesProfileRef = profile,
  corpus: TruthCorpus = currentTruthCorpus,
  contract: BonusTileScoringContract = BMJA_BONUS_TILE_SCORING,
): BritishFlowersSeasonsExplanation => {
  if (requestedProfile.id !== profile.id || requestedProfile.version !== profile.version) return { available: false };
  const facts = readGovernedFacts(requestedProfile, corpus);
  const resolved = (Object.keys(flowerSeasonRuntimeRefBySubject) as SubjectId[]).map((subjectId) => {
    const fact = facts.find((candidate) => candidate.subject.id === subjectId);
    if (!fact || fact.projection !== 'source-claim' || fact.sourceState === 'unknown' || fact.sourceState === 'conflict') return undefined;
    if (fact.claims.length !== 1 || !fact.claims[0]?.source || !fact.treatment) return undefined;
    if (fact.runtime.mappingState !== 'complete' || fact.runtime.ref?.kind !== 'rule') return undefined;
    const expected = flowerSeasonRuntimeRefBySubject[subjectId];
    if (fact.runtime.ref.id !== expected.id || !isClassicalScoringRule(requestedProfile, fact.runtime.ref.id)) return undefined;
    return { subjectId, fact };
  });
  if (resolved.some((fact) => fact === undefined)) return { available: false };
  const complete = resolved as { subjectId: SubjectId; fact: NonNullable<(typeof facts)[number]> }[];
  const description = describeBonusTileScoring(contract);

  return {
    available: true,
    profile: { id: requestedProfile.id, version: requestedProfile.version },
    title: 'Flowers and Seasons',
    summary: description.summary,
    sourceFacts: complete.map(({ fact }) => {
      const claim = fact.claims[0]!;
      return {
        claim: { recordId: claim.recordId, recordVersion: claim.recordVersion, reviewStatus: claim.status, text: claim.text },
        source: claim.source!,
      };
    }),
    scorerBehaviour: [description.behavior.ordinary, description.behavior.fixedSpecial, description.behavior.fishing],
    technical: complete.map(({ subjectId, fact }) => ({
      subjectId,
      treatment: {
        recordId: fact.treatment!.recordId,
        recordVersion: fact.treatment!.recordVersion,
        runtimeState: fact.treatment!.state,
      },
        mapping: { state: 'connected', ruleRef: fact.runtime.ref! },
      fixtures: fact.runtime.fixturePaths,
    })),
  };
};
