import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { PUBLIC_RULES_DESCRIPTORS, publicRulesEditionLabel, type RulesDescriptor } from '../game/rules-presentation';
import { clearPreferredRulesProfile, readPreferredRulesProfile, setPreferredRulesProfile } from '../game/preferred-rules-profile';
import { resolveSpecialHandsTarget } from './special-hands-atlas';

export type ReaderRules = { ready: boolean; selected: RulesDescriptor | null; saved: RulesDescriptor | null; explicit: boolean; invalid: boolean; anchor: string; pageProfile?: RulesDescriptor };
const pending: ReaderRules = { ready: false, selected: null, saved: null, explicit: false, invalid: false, anchor: '' };
const ReaderContext = createContext<ReaderRules | undefined>(undefined);
const eventName = 'mahjong-reference:preferred-rules-changed';
const exact = (profile: { id: string; version: string } | null) => PUBLIC_RULES_DESCRIPTORS.find((item) => item.profile.id === profile?.id && item.profile.version === profile.version) ?? null;

function snapshot() {
  const saved = readPreferredRulesProfile();
  return JSON.stringify([window.location.search, window.location.hash, saved]);
}
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(eventName, callback);
  window.addEventListener('popstate', callback);
  window.addEventListener('hashchange', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(eventName, callback);
    window.removeEventListener('popstate', callback);
    window.removeEventListener('hashchange', callback);
  };
}
export function resolveReaderRules(search: string, hash: string, saved: ReaderRules['saved'], specialHands = false): ReaderRules {
  const query = new URLSearchParams(search);
  const requested = query.get('rules');
  const target = specialHands ? resolveSpecialHandsTarget(hash.replace(/^#/, '')) : undefined;
  const slug = target?.profileSlug ?? requested;
  const explicit = slug !== null && slug !== undefined;
  const selected = explicit ? PUBLIC_RULES_DESCRIPTORS.find((item) => item.slug === slug) ?? null : saved;
  return { ready: true, saved, selected, explicit, invalid: explicit && slug !== 'all' && !selected, anchor: hash.replace(/^#/, '') };
}
const pendingSnapshot = () => 'pending';
const noSubscription = () => () => {};
function useBrowserReaderRules(specialHands: boolean, enabled = true): ReaderRules {
  const value = useSyncExternalStore(enabled ? subscribe : noSubscription, enabled ? snapshot : pendingSnapshot, pendingSnapshot);
  if (value === 'pending') return pending;
  const [search, hash, saved] = JSON.parse(value);
  return resolveReaderRules(search, hash, exact(saved), specialHands);
}
export function ReaderRulesProvider({ children, specialHands = false, pageProfile }: { children: ReactNode; specialHands?: boolean; pageProfile?: RulesDescriptor }) {
  const value = useBrowserReaderRules(specialHands);
  return <ReaderContext.Provider value={pageProfile ? { ...value, selected: pageProfile, explicit: true, invalid: false, pageProfile } : value}>{children}</ReaderContext.Provider>;
}
export function useReaderRules(specialHands = false): ReaderRules {
  const provided = useContext(ReaderContext);
  const fallback = useBrowserReaderRules(specialHands, !provided);
  return provided ?? fallback;
}
export function browseReaderRules(slug: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('rules', slug);
  url.hash = '';
  window.history.replaceState(null, '', url);
  window.dispatchEvent(new Event('popstate'));
}
export function readerHref(path: string, selected: RulesDescriptor | null) {
  return `${path}?rules=${selected?.slug ?? 'all'}`;
}
export function ReaderRulesControl() {
  const { ready, saved, selected, explicit, invalid, pageProfile } = useReaderRules();
  if (!ready) return <p role="status" className="py-3 text-sm">Loading your rules…</p>;
  return <aside aria-label="Reading rules" className="my-4 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 border-y border-[#cbd8d0] py-3 text-sm text-[#284d45]">
    <span>My rules: {saved ? publicRulesEditionLabel(saved) : 'None selected'}</span>
    <details><summary className="min-h-11 cursor-pointer py-2 font-semibold underline focus-visible:outline focus-visible:outline-2">Change rules</summary>
      <label className="block py-2">Remember rules for learning and reference
        <select aria-label="My rules" value={saved?.slug ?? 'all'} onChange={(event) => {
          const descriptor = PUBLIC_RULES_DESCRIPTORS.find(({ slug }) => slug === event.target.value);
          if (descriptor) setPreferredRulesProfile(descriptor.profile); else clearPreferredRulesProfile();
        }} className="mt-2 block min-h-11 max-w-full rounded border border-[#b8cdbf] bg-white px-2">
          <option value="all">No default</option>{PUBLIC_RULES_DESCRIPTORS.map((item) => <option key={item.slug} value={item.slug}>{publicRulesEditionLabel(item)}</option>)}
        </select>
      </label>
      {explicit && <a className="inline-block py-2 underline" href={pageProfile ? saved ? `/rules/${saved.slug}` : '/rules' : typeof window === 'undefined' ? '?' : window.location.pathname}>Read using My rules</a>}
    </details>
    <a className="py-2 underline" href={pageProfile ? '/rules' : '?rules=all'}>Explore all rules</a>
    {explicit && <span className="basis-full">Reading: {selected ? publicRulesEditionLabel(selected) : 'All rules'}. This page choice does not change My rules.</span>}
    {invalid && <p role="status" className="basis-full">That rules profile is unavailable. Choose a current profile; no replacement has been assumed.</p>}
  </aside>;
}
