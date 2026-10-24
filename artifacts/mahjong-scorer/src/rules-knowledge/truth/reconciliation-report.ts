import { currentTruthCorpus } from './current';
import { readGovernedFacts, type GovernedFact } from './read-contract';

export type ActionableRulesException = {
  id: string;
  profile?: string;
  factId?: string;
  severity: 'review';
  impact: string;
  evidence: readonly string[];
  ownerClass: 'source-review' | 'runtime-mapping' | 'truth-record' | 'known-discrepancy';
  disposition: 'unresolved' | 'disclosed';
  assertion: string;
};

export type TruthReconciliationReport = {
  schemaVersion: 2;
  profile: { id: string; version: string };
  /** Coverage is an inventory. Its counts are not a completeness estimate. */
  coverage: readonly GovernedFact[];
  mechanisms: readonly { ref: string; factIds: readonly string[]; exactFixtureFactIds: readonly string[] }[];
  /** Only actionable contradictions/integrity defects and explicitly tracked unresolved decisions. */
  exceptions: readonly ActionableRulesException[];
};

export const governedProfileInventory = (): readonly { id: string; version: string }[] => {
  const profiles = new Map<string, { id: string; version: string }>();
  for (const { record } of [...currentTruthCorpus.claims, ...currentTruthCorpus.treatments]) {
    const profile = 'profile' in record ? record.profile : record.supportsProfile;
    if (profile) profiles.set(profileKey(profile), { id: profile.id, version: profile.version });
  }
  return [...profiles.values()].sort((a, b) => profileKey(a).localeCompare(profileKey(b)));
};

const profileKey = (profile: { id: string; version: string }) => `${profile.id}@${profile.version}`;
const sort = <T extends { factId: string }>(items: readonly T[]) => [...items].sort((a, b) => a.factId.localeCompare(b.factId));

/** Review decisions remain visible without turning every migration gap into a defect. */
const reviewedExceptions: readonly ActionableRulesException[] = [
  { id: 'C1-bmja-goulash', profile: 'bmja@1.0', factId: 'bmja@1.0:rule.classical.goulash-round-transition', severity: 'review', impact: 'Published BMJA follow-up is Goulash; the current scorer does not switch hand mode automatically.', evidence: ['#539 C1', 'rule.classical.goulash-round-transition'], ownerClass: 'known-discrepancy', disposition: 'disclosed', assertion: 'The player explanation and comparator disclose the source/runtime difference.' },
  { id: 'C3-rob-kong-validation', profile: 'bmja@1.0', severity: 'review', impact: 'Robbing-Kong eligibility validation remains unresolved.', evidence: ['#539 C3', 'src/rules-platform/reconciliation-report.test.ts'], ownerClass: 'known-discrepancy', disposition: 'unresolved', assertion: 'The regression assertion requires this unresolved item to remain reported until an exact BMJA eligibility fixture and owner link exist.' },
  { id: 'C6-blessing-chow-wording', profile: 'bmja@1.0', severity: 'review', impact: 'Published blessing/Chow wording has conflicting interpretations.', evidence: ['#539 C6', 'src/rules-platform/reconciliation-report.test.ts'], ownerClass: 'source-review', disposition: 'unresolved', assertion: 'The regression assertion requires the source conflict to remain visible until an adjudicated claim is recorded.' },
];

const exceptionFromFact = (fact: GovernedFact): ActionableRulesException[] => {
  const profile = profileKey(fact.profile);
  const exceptions: ActionableRulesException[] = [];
  if (fact.sourceState === 'conflict') exceptions.push({ id: `${fact.factId}:source-conflict`, profile, factId: fact.factId, severity: 'review', impact: 'Canonical evidence records conflicting source claims.', evidence: fact.claims.map(({ recordId }) => recordId), ownerClass: 'source-review', disposition: 'unresolved', assertion: 'Conflicting claims must remain explicit until source review resolves them.' });
  if (fact.treatment && fact.treatment.state.kind === 'executable' && fact.runtime.mappingState !== 'complete') exceptions.push({ id: `${fact.factId}:runtime-link`, profile, factId: fact.factId, severity: 'review', impact: 'An executable treatment has no verified link to its runtime owner.', evidence: [fact.treatment.recordId, `${fact.treatment.state.ref.kind}:${fact.treatment.state.ref.id}`], ownerClass: 'runtime-mapping', disposition: 'unresolved', assertion: 'The executable treatment must resolve to an explicit owner contract.' });
  if (fact.runtime.state === 'no-current-treatment' && fact.claims.length > 0) exceptions.push({ id: `${fact.factId}:missing-treatment`, profile, factId: fact.factId, severity: 'review', impact: 'A sourced claim has no exact-profile treatment record.', evidence: fact.claims.map(({ recordId }) => recordId), ownerClass: 'truth-record', disposition: 'unresolved', assertion: 'A claim should not imply scorer behaviour without an exact treatment.' });
  if (fact.runtime.state === 'ambiguous-current-treatment') exceptions.push({ id: `${fact.factId}:ambiguous-treatment`, profile, factId: fact.factId, severity: 'review', impact: 'More than one current treatment matches this exact profile and subject.', evidence: [fact.subject.id], ownerClass: 'truth-record', disposition: 'unresolved', assertion: 'The read contract must abstain until the treatment identity is unambiguous.' });
  return exceptions;
};

/** Deterministic projection of governed coverage and the small actionable exception queue. */
export function buildTruthReconciliationReport(profile: { id: string; version: string }): TruthReconciliationReport {
  const coverage = sort(readGovernedFacts(profile, currentTruthCorpus));
  const mechanismGroups = new Map<string, string[]>();
  for (const fact of coverage) if (fact.runtime.ref) {
    const ref = `${fact.runtime.ref.kind}:${fact.runtime.ref.id}`;
    mechanismGroups.set(ref, [...(mechanismGroups.get(ref) ?? []), fact.factId]);
  }
  const mechanisms = [...mechanismGroups].sort(([a], [b]) => a.localeCompare(b)).map(([ref, factIds]) => ({
    ref,
    factIds,
    exactFixtureFactIds: factIds.filter((factId) => coverage.find(({ factId: candidate }) => candidate === factId)?.runtime.conformance === 'exact-fact-fixture'),
  }));
  const key = profileKey(profile);
  const exceptions = [
    ...coverage.flatMap(exceptionFromFact),
    ...reviewedExceptions.filter((entry) => !entry.profile || entry.profile === key),
  ].sort((a, b) => a.id.localeCompare(b.id));
  return { schemaVersion: 2, profile: { ...profile }, coverage, mechanisms, exceptions };
}

export function renderTruthReconciliationMarkdown(report: TruthReconciliationReport): string {
  const lines = [
    `# Rules evidence reconciliation: ${profileKey(report.profile)}`,
    '',
    'Coverage lists known exact-profile facts and their evidence/runtime states. It is not a completeness estimate; unresolved or unmodelled states are not automatically defects.',
    '',
    '## Actionable exceptions',
    '',
  ];
  if (!report.exceptions.length) lines.push('No actionable exception is currently recorded.', '');
  else for (const exception of report.exceptions) lines.push(`- **${exception.id}** (${exception.disposition}; ${exception.ownerClass}): ${exception.impact} Evidence: ${exception.evidence.join(', ')}. Check: ${exception.assertion}`);
  lines.push('', '## Coverage inventory', '');
  lines.push('### Shared runtime mechanisms', '');
  if (report.mechanisms.length) for (const mechanism of report.mechanisms) lines.push(`- ${mechanism.ref} owns ${mechanism.factIds.length} linked fact(s): ${mechanism.factIds.join(', ')}. Exact fact fixtures: ${mechanism.exactFixtureFactIds.length}.`);
  else lines.push('No exact runtime owner links are recorded.', '');
  lines.push('');
  for (const fact of report.coverage) {
    const claims = fact.claims.length ? fact.claims.map((claim) => `${claim.recordId} v${claim.recordVersion} (${claim.status}${claim.source ? `; ${claim.source.citation}, ${claim.source.locator.label}` : '; source unavailable'})`).join('; ') : 'no current claim';
    lines.push(`### ${fact.subject.id}`, '', `- Subject record: v${fact.subject.recordVersion}`, `- Claims: ${claims}`, `- Treatment: ${fact.treatment ? `${fact.treatment.recordId} v${fact.treatment.recordVersion}` : 'missing'}`, `- Source state: ${fact.sourceState}`, `- Runtime: ${typeof fact.runtime.state === 'string' ? fact.runtime.state : fact.runtime.state.kind}; mapping ${fact.runtime.mappingState}; capability ${fact.runtime.capability}; conformance ${fact.runtime.conformance}`, `- Projection: ${fact.projection}`, '');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}
