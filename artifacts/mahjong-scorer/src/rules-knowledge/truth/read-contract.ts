import type {
  EvidenceClaim,
  ProfileTreatment,
  RuntimeTreatmentRef,
  SemanticSubject,
  SourceRecord,
  VersionedTruthRecord,
} from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';
import { currentTruthValidationEnvironment } from './current-validation-environment';
import { currentTruthCorpus } from './current';
import type { TruthCorpus } from './records';
import { formatSourceLocator } from './explain-runtime-treatment';

export type GovernedFactClaim = {
  recordId: string;
  recordVersion: number;
  status: EvidenceClaim['status'];
  text: string;
  source?: {
    recordId: string;
    recordVersion: number;
    sourceId: string;
    citation: string;
    authority: SourceRecord['authority'];
    locator: { label: string; url?: string };
  };
};

export type GovernedFact = {
  factId: string;
  profile: RulesProfileRef;
  subject: { id: string; kind: SemanticSubject['kind']; recordVersion: number };
  treatment?: {
    recordId: string;
    recordVersion: number;
    state: ProfileTreatment['runtimeState'];
  };
  claims: readonly GovernedFactClaim[];
  sourceState: 'verified' | 'verified-club' | 'provisional' | 'conflict' | 'unknown' | 'multiple-claims';
  runtime: {
    state: ProfileTreatment['runtimeState'] | 'no-current-treatment' | 'ambiguous-current-treatment';
    mappingState: 'complete' | 'incomplete' | 'ambiguous' | 'unavailable';
    capability: 'executable' | 'not-modelled' | 'unknown' | 'not-applicable' | 'absent-by-rule' | 'not-established';
    ref?: RuntimeTreatmentRef;
    conformance: 'exact-fact-fixture' | 'representative-mechanism-fixture' | 'not-established';
    fixturePaths: readonly string[];
  };
  projection: 'source-claim' | 'not-projectable';
};

const exact = (left: RulesProfileRef, right: RulesProfileRef) => left.id === right.id && left.version === right.version;
const current = <T>(records: readonly VersionedTruthRecord<T>[]) => records.filter(({ lifecycle }) => lifecycle === 'current');
const sorted = <T>(items: T[], id: (value: T) => string) => items.sort((a, b) => id(a).localeCompare(id(b)));
const one = <T>(items: readonly T[]) => items.length === 1 ? items[0] : undefined;

/** Mechanism-level fixtures are deliberately not represented as proof of every individual rule. */
export const RUNTIME_MECHANISM_FIXTURES: Readonly<Record<RuntimeTreatmentRef['kind'], readonly string[]>> = Object.freeze({
  rule: ['src/scoring/rules.test.ts', 'src/rules-platform/truth-british-flowers-seasons.test.ts'],
  binding: ['src/scoring/special-hands.test.ts', 'src/scoring/golden-fixtures.test.ts'],
  'hand-mode': ['src/rules-platform/outside-the-box-strategies.test.ts'],
  policy: ['src/rules-platform/mcr-scoring.test.ts'],
});

export const EXACT_FACT_FIXTURES: Readonly<Record<string, readonly string[]>> = Object.freeze({
  'bmja@1.0:rule.classical.flower-season-base-scoring': ['src/rules-platform/truth-british-flowers-seasons.test.ts'],
  'bmja@1.0:rule.classical.own-flower-season-double': ['src/rules-platform/truth-british-flowers-seasons.test.ts'],
  'bmja@1.0:rule.classical.complete-flower-season-set-double': ['src/rules-platform/truth-british-flowers-seasons.test.ts'],
  'bmja@1.0:rule.classical.normal-hand-at-most-one-chow': ['src/rules-platform/truth-classical-hand-validation-440c3a.test.ts'],
  'outside-the-box@0.1:rule.otb.goulash-round-transition': ['src/rules-platform/outside-the-box-strategies.test.ts'],
});

const evidenceProjection = (
  claim: VersionedTruthRecord<EvidenceClaim>,
  source: VersionedTruthRecord<SourceRecord> | undefined,
): GovernedFactClaim => ({
  recordId: claim.record.claimId,
  recordVersion: claim.recordVersion,
  status: claim.record.status,
  text: claim.record.claim,
  ...(source ? { source: {
    recordId: source.record.sourceId,
    recordVersion: source.recordVersion,
    sourceId: source.record.sourceId,
    citation: source.record.citation,
    authority: source.record.authority,
    locator: {
      label: formatSourceLocator(claim.record.locator),
      ...(claim.record.locator.kind === 'url' ? { url: claim.record.locator.url } : {}),
    },
  } } : {}),
});

const sourceState = (claims: readonly GovernedFactClaim[]): GovernedFact['sourceState'] => {
  if (claims.some(({ status }) => status === 'conflict')) return 'conflict';
  if (claims.length > 1) return 'multiple-claims';
  if (claims.length === 0 || claims.some(({ source }) => source === undefined)) return 'unknown';
  if (claims.some(({ status }) => status === 'needs-primary-source' || status === 'needs-club-confirmation' || status === 'secondary-only')) return 'provisional';
  return claims.every(({ status }) => status === 'verified') ? 'verified' : 'verified-club';
};

const runtimeFor = (
  treatment: VersionedTruthRecord<ProfileTreatment> | undefined,
  ambiguous: boolean,
  profile: RulesProfileRef,
  subjectId: string,
) => {
  if (ambiguous) return {
    state: 'ambiguous-current-treatment' as const,
    mappingState: 'ambiguous' as const,
    capability: 'not-established' as const,
    conformance: 'not-established' as const,
    fixturePaths: [],
  };
  if (!treatment) return {
    state: 'no-current-treatment' as const,
    mappingState: 'unavailable' as const,
    capability: 'not-established' as const,
    conformance: 'not-established' as const,
    fixturePaths: [],
  };
  const state = treatment.record.runtimeState;
  if (state.kind !== 'executable') return {
    state,
    mappingState: state.kind === 'migration-incomplete' ? 'incomplete' as const : 'complete' as const,
    capability: state.kind === 'present-not-modelled' ? 'not-modelled' as const
      : state.kind === 'unknown' ? 'unknown' as const
        : state.kind === 'not-applicable' ? 'not-applicable' as const
          : state.kind === 'absent-by-rule' ? 'absent-by-rule' as const : 'not-established' as const,
    conformance: 'not-established' as const,
    fixturePaths: [],
  };
  const connected = currentTruthValidationEnvironment.runtimeTreatmentExists(profile, state.ref);
  const factId = `${profile.id}@${profile.version}:${subjectId}`;
  const exactFixtures = EXACT_FACT_FIXTURES[factId] ?? [];
  const fixturePaths = connected ? [...new Set([...exactFixtures, ...RUNTIME_MECHANISM_FIXTURES[state.ref.kind]])] : [];
  return {
    state,
    mappingState: connected ? 'complete' as const : 'incomplete' as const,
    capability: 'executable' as const,
    ref: state.ref,
    conformance: connected && exactFixtures.length > 0 ? 'exact-fact-fixture' as const
      : connected && fixturePaths.length > 0 ? 'representative-mechanism-fixture' as const : 'not-established' as const,
    fixturePaths,
  };
};

/**
 * Shared read-only contract for profile reports, comparison and concept pages.
 * It joins existing versioned claims/treatments; it owns no rule values or scoring logic.
 */
export const readGovernedFacts = (
  profile: RulesProfileRef,
  corpus: TruthCorpus = currentTruthCorpus,
): readonly GovernedFact[] => {
  const subjects = sorted(current(corpus.subjects), (entry) => entry.record.id);
  const treatments = current(corpus.treatments).filter(({ record }) => exact(record.profile, profile));
  return subjects.flatMap((subject) => {
    const matchingTreatments = treatments.filter(({ record }) => record.subjectId === subject.record.id);
    if (matchingTreatments.length === 0 && !current(corpus.claims).some(({ record }) =>
      record.subjectId === subject.record.id && record.supportsProfile && exact(record.supportsProfile, profile))) return [];
    const treatment = one(matchingTreatments);
    const linkedClaimIds = new Set(treatment?.record.evidenceClaimIds ?? []);
    const claimEntries = sorted(current(corpus.claims).filter(({ record }) =>
      record.subjectId === subject.record.id
      && record.supportsProfile !== undefined
      && exact(record.supportsProfile, profile)
      && (linkedClaimIds.has(record.claimId) || matchingTreatments.length === 0)),
    (entry) => entry.record.claimId);
    const claims = claimEntries.map((entry) => {
      const source = one(current(corpus.sources).filter(({ record }) => record.sourceId === entry.record.sourceId));
      const authorizedSource = source && source.record.authorityForProfileIds.includes(profile.id) ? source : undefined;
      return evidenceProjection(entry, authorizedSource);
    });
    const runtime = runtimeFor(treatment, matchingTreatments.length > 1, profile, subject.record.id);
    const projectable = claims.length === 1 && claims[0]?.source !== undefined
      && (claims[0].status === 'verified' || claims[0].status === 'verified-club')
      && runtime.state !== 'ambiguous-current-treatment';
    return [{
      factId: `${profile.id}@${profile.version}:${subject.record.id}`,
      profile: { id: profile.id, version: profile.version },
      subject: { id: subject.record.id, kind: subject.record.kind, recordVersion: subject.recordVersion },
      ...(treatment ? { treatment: {
        recordId: treatment.record.treatmentId,
        recordVersion: treatment.recordVersion,
        state: treatment.record.runtimeState,
      } } : {}),
      claims,
      sourceState: sourceState(claims),
      runtime,
      projection: projectable ? 'source-claim' as const : 'not-projectable' as const,
    }];
  });
};

export const governedFactForSubject = (facts: readonly GovernedFact[], subjectId: string) =>
  one(facts.filter(({ subject }) => subject.id === subjectId));
