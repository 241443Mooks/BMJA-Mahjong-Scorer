import { captureProductEvent } from '../lib/analytics';
import { descriptorForRulesProfile, publicRulesDescriptorsNewestFirst, publicRulesEditionLabel, PUBLIC_RULES_DESCRIPTORS } from './rules-presentation';
import type { RulesProfileRef } from './types';

/** Non-selectable layout fixture: production choices follow descriptor availability for each surface. */
export const RULES_PROFILE_PICKER_SCALABILITY_FIXTURE = Object.freeze([
  ...PUBLIC_RULES_DESCRIPTORS.map(({ compactLabel, status }) => ({ compactLabel, status })),
  { compactLabel: 'Representative future profile A', status: 'Not publicly selectable' },
  { compactLabel: 'Representative future profile B', status: 'Not publicly selectable' },
]);

const sameProfile = (left: RulesProfileRef, right: RulesProfileRef) => left.id === right.id && left.version === right.version;
export const descriptorsForPickerSurface = (surface: 'hand' | 'game') => publicRulesDescriptorsNewestFirst().filter(({ availability }) => surface === 'hand' ? availability.handScorer : availability.gameTracker);

export const rulesCardStatus = (descriptor: ReturnType<typeof descriptorForRulesProfile>) =>
  descriptor.support.implementation === 'Stable'
    ? 'Stable scorer'
    : descriptor.support.implementation === 'Provisional'
      ? 'Provisional scorer'
      : 'Configured profile';

type CompactChoice = {
  key: string;
  label: string;
  status: string;
  selected: boolean;
  profile?: RulesProfileRef;
};

function CompactRulesChoiceList({ prompt, choices, onSelect, disabled = false }: {
  prompt: string;
  choices: readonly CompactChoice[];
  onSelect?: (profile: RulesProfileRef) => void;
  disabled?: boolean;
}) {
  return <fieldset className="grid gap-2" aria-label={prompt}>
    <legend className="sr-only">{prompt}</legend>
    {choices.map((choice) => <label key={choice.key} data-testid={`rules-card-${choice.key}`} className={`flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 text-left ${disabled ? 'cursor-default' : 'cursor-pointer'} transition focus-within:outline-none focus-within:ring-2 focus-within:ring-[#ae6249] ${choice.selected ? 'border-[#ae6249] bg-[#fff4e8] ring-1 ring-[#ae6249]/30' : 'border-[#d8ceb8] bg-[#fdfbf5] hover:border-[#ae6249]/60'}`}>
      <input type="radio" name={disabled ? 'rules-profile-fixture' : 'rules-profile'} checked={choice.selected} disabled={disabled} onChange={() => choice.profile && onSelect?.(choice.profile)} className="h-4 w-4 accent-[#ae6249]" />
      <span className="min-w-0"><span className="block text-[13px] font-bold text-[#284d45]">{choice.label}{choice.selected ? ' — selected' : ''}</span><span className="block text-[11px] leading-4 text-[#66746e]">{choice.status}</span></span>
    </label>)}
  </fieldset>;
}

export function ActiveRules({ profile, inherited = false, locked = false }: { profile: RulesProfileRef; inherited?: boolean; locked?: boolean }) {
  const descriptor = descriptorForRulesProfile(profile);
  return <p data-testid="active-rules" className="mt-3 text-[13px] leading-6 text-[#284d45]"><strong>Rules: {descriptor.title}.</strong>{inherited ? ' Inherited from this game.' : locked ? ' Fixed for this game.' : ''}</p>;
}

export function RulesProfilePicker({ prompt, selectedProfile, onSelect, surface = 'game' }: { prompt: string; selectedProfile: RulesProfileRef; onSelect: (profile: RulesProfileRef) => void; surface?: 'hand' | 'game' }) {
  const selected = descriptorForRulesProfile(selectedProfile);
  const choices: readonly CompactChoice[] = descriptorsForPickerSurface(surface).map((descriptor) => ({
    key: descriptor.slug,
    label: publicRulesEditionLabel(descriptor),
    status: rulesCardStatus(descriptor),
    selected: sameProfile(descriptor.profile, selectedProfile),
    profile: descriptor.profile,
  }));
  return <section data-testid="rules-profile-picker" className="mb-6 border-y border-[#d8ceb8] py-5">
    <h2 className="font-serif text-[24px] text-[#284d45]">{prompt}</h2>
    <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(260px,1fr)]">
      <CompactRulesChoiceList prompt={prompt} choices={choices} onSelect={(profile) => {
        if (!sameProfile(profile, selectedProfile)) {
          captureProductEvent('ruleset_selected', { ruleset: descriptorForRulesProfile(profile).slug });
        }
        onSelect(profile);
      }} />
    <div data-testid="rules-at-a-glance" className="rounded-lg border border-[#b8cdbf] bg-[#edf3ed] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[.16em] text-[#477562]">Rules at a glance</div>
        <a href="/rules" className="text-[11px] font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Rules reference</a>
      </div>
      <h3 className="mt-1 font-serif text-[20px] text-[#284d45]">{selected.title}</h3>
      <p className="mt-1 text-[12px] leading-5 text-[#66746e]">{selected.status}</p>
      <p className="mt-2 text-[11px] leading-4 text-[#66746e]">Profile version: {selected.profile.version} · Source: {selected.support.source}</p>
      <ul className="mt-3 space-y-1 text-[12px] leading-5 text-[#284d45]">{selected.atAGlance.map((fact) => <li key={fact}>• {fact}</li>)}</ul>
    </div></div>
  </section>;
}

/** Development-only visual fixture; its representative profiles are deliberately disabled. */
export function RulesProfilePickerScalabilityFixture() {
  const choices: readonly CompactChoice[] = RULES_PROFILE_PICKER_SCALABILITY_FIXTURE.map((choice, index) => ({
    key: `fixture-${index + 1}`,
    label: choice.compactLabel,
    status: choice.status,
    selected: index === 0,
  }));
  return <main className="mx-auto max-w-[720px] p-5" data-testid="rules-profile-picker-scalability-fixture">
    <h1 className="font-serif text-[28px] text-[#284d45]">Rules picker scalability fixture</h1>
    <p className="mt-2 text-[13px] text-[#66746e]">Six representative rows exercise the production compact choice component. Future profiles are not selectable.</p>
    <section className="mt-5 border-y border-[#d8ceb8] py-5">
      <CompactRulesChoiceList prompt="Representative rules profiles" choices={choices} disabled />
    </section>
  </main>;
}
