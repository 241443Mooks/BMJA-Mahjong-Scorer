import { currentTruthCorpus } from './current';
import { readGovernedFacts, type GovernedFact } from './read-contract';

export type ReconciliationException = {
  factId: string;
  kind: 'source-conflict' | 'multiple-source-claims' | 'source-unresolved' | 'treatment-missing' | 'treatment-ambiguous' | 'runtime-mapping-incomplete' | 'runtime-not-modelled' | 'conformance-not-established' | 'not-projected';
};

export type TruthReconciliationReport = {
  schemaVersion: 1;
  profile: { id: string; version: string };
  facts: readonly GovernedFact[];
  exceptions: readonly ReconciliationException[];
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

/** Deterministic audit projection over current canonical evidence and exact treatments. */
export function buildTruthReconciliationReport(profile: { id: string; version: string }): TruthReconciliationReport {
  const facts = sort(readGovernedFacts(profile, currentTruthCorpus));
  const exceptions = facts.flatMap((fact) => {
    const kinds: ReconciliationException['kind'][] = [];
    if (fact.sourceState === 'conflict') kinds.push('source-conflict');
    if (fact.sourceState === 'multiple-claims') kinds.push('multiple-source-claims');
    if (fact.sourceState === 'unknown' || fact.sourceState === 'provisional') kinds.push('source-unresolved');
    if (fact.runtime.state === 'no-current-treatment') kinds.push('treatment-missing');
    if (fact.runtime.state === 'ambiguous-current-treatment') kinds.push('treatment-ambiguous');
    if (fact.runtime.mappingState === 'incomplete') kinds.push('runtime-mapping-incomplete');
    if (fact.runtime.capability === 'not-modelled') kinds.push('runtime-not-modelled');
    if (fact.runtime.conformance === 'not-established') kinds.push('conformance-not-established');
    if (fact.projection === 'not-projectable') kinds.push('not-projected');
    return kinds.map((kind) => ({ factId: fact.factId, kind }));
  }).sort((a, b) => a.factId.localeCompare(b.factId) || a.kind.localeCompare(b.kind));
  return { schemaVersion: 1, profile: { ...profile }, facts, exceptions };
}

export function renderTruthReconciliationMarkdown(report: TruthReconciliationReport): string {
  const lines = [
    `# Rules evidence reconciliation: ${profileKey(report.profile)}`,
    '',
    'Generated from current versioned claims and exact-profile treatments. This report does not estimate corpus completeness.',
    '',
    '## Exceptions',
    '',
  ];
  if (!report.exceptions.length) lines.push('No exceptions were found in the current governed facts.', '');
  else for (const exception of report.exceptions) lines.push(`- \`${exception.factId}\` — ${exception.kind}`);
  lines.push('', '## Current facts', '');
  for (const fact of report.facts) {
    const claims = fact.claims.length ? fact.claims.map((claim) => `${claim.recordId} v${claim.recordVersion} (${claim.status})`).join('; ') : 'no current claim';
    lines.push(`### ${fact.subject.id}`, '', `- Subject record: v${fact.subject.recordVersion}`, `- Claims: ${claims}`, `- Treatment: ${fact.treatment ? `${fact.treatment.recordId} v${fact.treatment.recordVersion}` : 'missing'}`, `- Source state: ${fact.sourceState}`, `- Runtime: ${typeof fact.runtime.state === 'string' ? fact.runtime.state : fact.runtime.state.kind}; mapping ${fact.runtime.mappingState}; capability ${fact.runtime.capability}; conformance ${fact.runtime.conformance}`, `- Projection: ${fact.projection}`, '');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}
