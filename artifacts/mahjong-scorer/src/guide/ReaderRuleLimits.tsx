import type { RulesProfileRef } from '../game/types';
import { buildTruthReconciliationReport } from '../rules-knowledge/truth/reconciliation-report';

/** Keep the existing exception queue visible without promoting claims to rules. */
export function ReaderRuleLimits({ profile }: { profile: RulesProfileRef }) {
  const report = buildTruthReconciliationReport(profile);
  if (!report.exceptions.length) return null;
  return <details className="my-5 border-l-2 border-[#ae6249] pl-4 text-sm leading-6 text-[#596b65]">
    <summary className="min-h-11 cursor-pointer py-2 font-semibold text-[#284d45]">Known limits and source questions</summary>
    <ul className="mt-2 list-disc space-y-3 pl-5">{report.exceptions.map((exception) => {
      const fact = report.coverage.find(({ factId }) => factId === exception.factId);
      return <li key={exception.id}>
        <p>{exception.ownerClass === 'truth-record' ? 'A sourced rule still needs a reviewed explanation for these rules.' : exception.impact}</p>
        {exception.ownerClass === 'truth-record' && fact?.claims.map((claim) => <p className="mt-1" key={claim.recordId}>Source wording awaiting review: {claim.text}</p>)}
      </li>;
    })}</ul>
  </details>;
}
