import { descriptorForRulesProfile, PUBLIC_RULES_DESCRIPTORS } from './rules-presentation';
import type { RulesProfileRef } from './types';

/** Non-selectable layout fixture: production always uses the four public descriptors. */
export const RULES_PROFILE_PICKER_SCALABILITY_FIXTURE = Object.freeze([
  ...PUBLIC_RULES_DESCRIPTORS.map(({ compactLabel, status }) => ({ compactLabel, status })),
  { compactLabel: 'Representative future profile A', status: 'Not publicly selectable' },
  { compactLabel: 'Representative future profile B', status: 'Not publicly selectable' },
]);

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
    <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(260px,1fr)]">
      <fieldset className="grid gap-2" aria-label={prompt}><legend className="sr-only">{prompt}</legend>{PUBLIC_RULES_DESCRIPTORS.map((descriptor) => {
        const isSelected = sameProfile(descriptor.profile, selectedProfile);
        return <label key={descriptor.slug} data-testid={`rules-card-${descriptor.slug}`} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition focus-within:outline-none focus-within:ring-2 focus-within:ring-[#ae6249] ${isSelected ? 'border-[#ae6249] bg-[#fff4e8] ring-1 ring-[#ae6249]/30' : 'border-[#d8ceb8] bg-[#fdfbf5] hover:border-[#ae6249]/60'}`}>
          <input type="radio" name="rules-profile" checked={isSelected} onChange={() => onSelect(descriptor.profile)} className="h-4 w-4 accent-[#ae6249]" />
          <span className="min-w-0"><span className="block text-[13px] font-bold text-[#284d45]">{descriptor.compactLabel}{isSelected ? ' — selected' : ''}</span><span className="block text-[11px] leading-4 text-[#66746e]">{rulesCardStatus(descriptor)}</span></span>
        </label>;
      })}</fieldset>
    <div data-testid="rules-at-a-glance" className="rounded-lg border border-[#b8cdbf] bg-[#edf3ed] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[.16em] text-[#477562]">Rules at a glance</div>
        <a href="/rules" className="text-[11px] font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Rules reference</a>
      </div>
      <h3 className="mt-1 font-serif text-[20px] text-[#284d45]">{selected.title}</h3>
      <p className="mt-1 text-[12px] leading-5 text-[#66746e]">{selected.status}</p>
      <ul className="mt-3 space-y-1 text-[12px] leading-5 text-[#284d45]">{selected.atAGlance.map((fact) => <li key={fact}>• {fact}</li>)}</ul>
    </div></div>
  </section>;
}
