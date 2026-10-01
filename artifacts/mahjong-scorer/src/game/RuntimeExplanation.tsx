import { explainRuntimeTreatment } from '../rules-knowledge/truth';
import type { RulesProfileRef } from './types';

export function RuntimeExplanationDisclosure({
  profile,
  bindingId,
  title,
  rulesetLabel,
  summary = 'Why it counted',
  dark = false,
}: {
  profile: RulesProfileRef;
  bindingId: string;
  title: string;
  rulesetLabel: string;
  summary?: string;
  dark?: boolean;
}) {
  const explanation = explainRuntimeTreatment({ profile, ref: { kind: 'binding', id: bindingId } });
  if (!explanation.available) return null;
  const text = dark ? 'text-[#b4c4bd]' : 'text-[#66746e]';
  const heading = dark ? 'text-[#f8f4e9]' : 'text-[#284d45]';
  return <details data-testid="runtime-explanation" className={`mt-3 rounded-md border ${dark ? 'border-[#45665d] bg-[#1f3f38]' : 'border-[#d8ceb8] bg-[#f5f1e6]'} p-3 text-left text-xs leading-5`}>
    <summary className={`min-h-11 cursor-pointer rounded-sm py-2 font-semibold ${heading} underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ae6249]`}>
      {summary}
    </summary>
    <div className="mt-2 border-t border-[#d8ceb8]/60 pt-3">
      <h3 className={`font-serif text-base ${heading}`}>{title}</h3>
      <p className={`mt-1 ${text}`}>Recognised under {rulesetLabel} rules.</p>
      <h4 className={`mt-2 font-semibold ${heading}`}>Why it counts</h4>
      <p className={dark ? 'text-[#d7e1dc]' : 'text-[#465a52]'}>{explanation.ruleBasis}</p>
      <details className={`mt-2 rounded border ${dark ? 'border-[#45665d] bg-[#284d45]' : 'border-[#e2d9c7] bg-[#fbf8ed]'} px-3`}>
        <summary className={`min-h-11 cursor-pointer py-2 font-semibold ${heading} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ae6249]`}>Source</summary>
        <ul className={`space-y-2 pb-3 ${text}`}>
          {explanation.sources.map((source, index) => <li key={`${source.citation}-${index}`}>
            <p className={`font-medium ${heading}`}>{source.citation}</p>
            <p>{source.locator.label}</p>
            {source.locator.url && <a className={`mt-1 inline-block min-h-11 py-2 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ae6249] ${heading}`} href={source.locator.url} target="_blank" rel="noreferrer">Open source</a>}
          </li>)}
        </ul>
      </details>
    </div>
  </details>;
}
