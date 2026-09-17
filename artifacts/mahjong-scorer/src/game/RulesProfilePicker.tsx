import { captureProductEvent } from '../lib/analytics';
import { descriptorForRulesProfile, PUBLIC_RULES_DESCRIPTORS } from './rules-presentation';
import type { RulesProfileRef } from './types';

const sameProfile = (left: RulesProfileRef, right: RulesProfileRef) => left.id === right.id && left.version === right.version;

export const rulesCardStatus = (descriptor: ReturnType<typeof descriptorForRulesProfile>) =>
  descriptor.support.implementation === 'Stable'
    ? 'Stable scorer'
    : descriptor.support.implementation === 'Provisional'
      ? 'Provisional scorer'
      : 'Configured profile';

export function ActiveRules({ profile, inherited = false, locked = false }: { profile: RulesProfileRef; inherited?: boolean; locked?: boolean }) {
  const descriptor = descriptorForRulesProfile(profile);
  return <p data-testid="active-rules" className="mt-3 text-[13px] leading-6 text-[#284d45]"><strong>Rules: {descriptor.title}.</strong>{inherited ? ' Inherited from this game.' : locked ? ' Fixed for this game.' : ''}</p>;
}

export function RulesProfilePicker({ prompt, selectedProfile, onSelect }: { prompt: string; selectedProfile: RulesProfileRef; onSelect: (profile: RulesProfileRef) => void }) {
  const selected = descriptorForRulesProfile(selectedProfile);
  return <section data-testid="rules-profile-picker" className="mb-6 border-y border-[#d8ceb8] py-5">
    <h2 className="font-serif text-[24px] text-[#284d45]">{prompt}</h2>
    <div className="mt-3 grid gap-2 sm:grid-cols-3">
      {PUBLIC_RULES_DESCRIPTORS.map((descriptor) => {
        const isSelected = sameProfile(descriptor.profile, selectedProfile);
        return <button key={descriptor.slug} type="button" data-testid={`rules-card-${descriptor.slug}`} aria-pressed={isSelected} onClick={() => {
          if (!isSelected) captureProductEvent('ruleset_selected', { ruleset: descriptor.slug });
          onSelect(descriptor.profile);
        }} className={`min-h-24 rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] ${isSelected ? 'border-[#ae6249] bg-[#fff4e8] ring-1 ring-[#ae6249]/30' : 'border-[#d8ceb8] bg-[#fdfbf5] hover:border-[#ae6249]/60'}`}>
          <span className="block text-[13px] font-bold text-[#284d45]">{descriptor.title}</span>
          <span className="mt-1 block text-[11px] leading-4 text-[#66746e]">{rulesCardStatus(descriptor)}</span>
        </button>;
      })}
    </div>
    <div data-testid="rules-at-a-glance" className="mt-4 rounded-lg border border-[#b8cdbf] bg-[#edf3ed] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[.16em] text-[#477562]">Rules at a glance</div>
        <a href="/rules" className="text-[11px] font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Rules reference</a>
      </div>
      <h3 className="mt-1 font-serif text-[20px] text-[#284d45]">{selected.title}</h3>
      <p className="mt-1 text-[12px] leading-5 text-[#66746e]">{selected.status}</p>
      <ul className="mt-3 space-y-1 text-[12px] leading-5 text-[#284d45]">{selected.atAGlance.map((fact) => <li key={fact}>• {fact}</li>)}</ul>
    </div>
  </section>;
}
