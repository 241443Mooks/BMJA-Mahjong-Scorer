import { useEffect, useMemo, useState } from 'react';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { MCR_WMO_2006_PROFILE, mcrProfileResolverEnvironment } from '../rules-platform/mcr-profile';
import { resolvePlayableProfile } from '../rules-platform/resolver';
import { currentPlayableResolverEnvironment, currentPlayableProfiles } from '../rules-platform/current-profiles';
import { projectProfileDimensions, RULES_DIMENSIONS, CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE, type ProfileDimensionValue, type RulesDimensionGroup } from '../rules-platform/profile-dimensions';
import type { RulesProfileRef } from '../rules-platform/types';

const profiles: { ref: RulesProfileRef; name: string; slug?: string; mcr?: boolean; status?: string }[] = [
  ...[...currentPlayableProfiles.map(({ identity }) => ({ id: identity.id, version: identity.version })), { id: MCR_WMO_2006_PROFILE.identity.id, version: MCR_WMO_2006_PROFILE.identity.version }].map((ref) => {
    const descriptor = PUBLIC_RULES_DESCRIPTORS.find(({ profile }) => profile.id === ref.id && profile.version === ref.version);
    return { ref, name: descriptor?.compactLabel ?? `${ref.id} ${ref.version}`, slug: descriptor?.slug, status: descriptor?.status, mcr: ref.id === MCR_WMO_2006_PROFILE.identity.id };
  }),
];
const groupNames: Record<RulesDimensionGroup, string> = {
  'identity-table-tiles': 'Identity, table & tiles', 'hand-play': 'Hand & play', 'ready-declarations': 'Ready & declarations',
  scoring: 'Scoring', 'settlement-incidents': 'Settlement & incidents', 'draws-progression': 'Draws & progression',
};

type ComparisonState = 'different' | 'same' | 'needs-checking';
const hasValue = (cell: ProfileDimensionValue) =>
  Boolean(cell.comparisonKey) || ((cell.value.status === 'present' || cell.value.status === 'absent') &&
    cell.runtimeSupport !== 'not-modelled' && cell.runtimeSupport !== 'not-applicable');
export const comparisonState = (a: ProfileDimensionValue, b: ProfileDimensionValue): ComparisonState => {
  if (!hasValue(a) || !hasValue(b)) return 'needs-checking';
  if (a.comparisonKey && b.comparisonKey) return a.comparisonKey === b.comparisonKey ? 'same' : 'different';
  if (Boolean(a.comparisonKey) !== Boolean(b.comparisonKey)) return 'needs-checking';
  const leftMeaning = a.comparisonKey ?? JSON.stringify(a.value);
  const rightMeaning = b.comparisonKey ?? JSON.stringify(b.value);
  return leftMeaning === rightMeaning ? 'same' : 'different';
};
/** Semantic keys compare rules; uncertain evidence is kept separate from the answer. */
export const comparisonValuesDiffer = (a: ProfileDimensionValue, b: ProfileDimensionValue) => comparisonState(a, b) === 'different';
const readableValue = (value: ProfileDimensionValue, profileName: string): string => {
  if (value.playerAnswer) return value.playerAnswer;
  if (value.value.status === 'absent') return 'This rule is absent from this profile.';
  if (value.value.status !== 'present') return 'No answer available for this comparison.';
  if (value.dimensionId === 'profile.identity') return `${profileName} ${value.profile.version}`;
  const data = value.value.data;
  if (typeof data === 'number' && value.dimensionId === 'scoring.limit-cap') return `${data.toLocaleString()} points`;
  if (typeof data === 'number' && value.dimensionId === 'table.player-count') return `${data} players`;
  if (typeof data !== 'string') return 'A profile-specific rule value';
  const labels: Record<string, string> = {
    'classical-points-doubles': 'Points and doubles', 'pattern-accumulator': 'Pattern scoring',
    'hand-mode.none': 'Normal hand after a draw', 'hand-mode.outside-the-box-goulash': 'Goulash after a draw',
    'progression.classical-east-cycle': 'East stays after an East win or draw; seats rotate after other wins',
    'game-end.classical-east-cycle': 'Ends after the prevailing-wind cycle', 'settlement.classical-pairwise': 'Winner payments and losing-player score differences',
    'settlement.outside-the-box-incidents': 'Classical settlement with Bramhall-specific incident rules',
    'seats.winds-4': 'East, South, West and North seats', 'shape.four-sets-pair': 'Four sets and a pair',
    'tiles.flowers-144': '144 tiles, including Flowers and Seasons',
  };
  return labels[data] ?? (/^[a-z][a-z0-9-]*\.[a-z0-9.-]+$/.test(data) ? 'A profile-specific rule value' : data);
};

export function ExactProfileComparator() {
  const [values, setValues] = useState<Record<string, readonly ProfileDimensionValue[]>>({});
  const [left, setLeft] = useState('bmja@1.0');
  const [right, setRight] = useState('outside-the-box@0.1');
  const [differencesOnly, setDifferencesOnly] = useState(true);
  useEffect(() => {
    let live = true;
    Promise.all(profiles.map(async ({ ref, mcr }) => {
      const artifact = await resolvePlayableProfile(ref, mcr ? mcrProfileResolverEnvironment : currentPlayableResolverEnvironment);
      return [`${ref.id}@${ref.version}`, projectProfileDimensions(artifact, CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE)] as const;
    })).then((entries) => { if (live) setValues(Object.fromEntries(entries)); });
    return () => { live = false; };
  }, []);
  const l = values[left], r = values[right];
  const selectedLeft = profiles.find(({ ref }) => `${ref.id}@${ref.version}` === left)!;
  const selectedRight = profiles.find(({ ref }) => `${ref.id}@${ref.version}` === right)!;
  const rows = useMemo(() => l && r ? RULES_DIMENSIONS.filter(({ id }) => id !== 'profile.identity' && id !== 'profile.authority-status').map((definition) => {
    const a = l.find((value) => value.dimensionId === definition.id)!;
    const b = r.find((value) => value.dimensionId === definition.id)!;
    return { definition, a, b, state: comparisonState(a, b) };
  }) : [], [l, r]);
  const differentRows = rows.filter(({ state }) => state === 'different');
  const sameRows = rows.filter(({ state }) => state === 'same');
  const checkingRows = rows.filter(({ state }) => state === 'needs-checking');

  const groupedRows = (items: typeof rows) => Object.entries(groupNames).map(([group, title]) => {
    const groupRows = items.filter(({ definition }) => definition.group === group);
    return groupRows.length ? <section key={group} aria-label={title}><h4 className="mb-2 font-serif text-lg text-[#284d45]">{title}</h4><div className="mb-2 grid grid-cols-2 gap-3 text-[11px] font-semibold leading-4 text-[#596b65]"><p>{selectedLeft.name} · {selectedLeft.ref.version}</p><p>{selectedRight.name} · {selectedRight.ref.version}</p></div><div className="space-y-3">{groupRows.map(row)}</div></section> : null;
  });

  const row = (item: typeof rows[number]) => {
    const { definition, a, b } = item;
    const leftText = readableValue(a, selectedLeft.name);
    const rightText = readableValue(b, selectedRight.name);
    const qualification = (cell: ProfileDimensionValue) => cell.playerQualification ??
      (cell.sourceStatus === 'source-unknown' || cell.sourceStatus === 'source-provisional'
        ? 'Check your table’s agreed rules; local play may vary.'
        : undefined);
    const leftQualification = qualification(a);
    const rightQualification = qualification(b);
    return <article key={definition.id} className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4 sm:p-5">
      <h4 className="font-serif text-lg leading-snug text-[#284d45]">{definition.label}</h4>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#596b65]">First profile</p><p className="mt-1 break-words text-sm leading-6 text-[#284d45]">{leftText}</p>{leftQualification && <p className="mt-1 text-xs leading-5 text-[#7a5a42]">{leftQualification}</p>}</div>
        <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#596b65]">Second profile</p><p className="mt-1 break-words text-sm leading-6 text-[#284d45]">{rightText}</p>{rightQualification && <p className="mt-1 text-xs leading-5 text-[#7a5a42]">{rightQualification}</p>}</div>
      </div>
      {definition.id === 'scoring.special-catalogue' && <a href="/special-hands" className="mt-2 inline-block min-h-11 content-center text-sm font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Browse special hands</a>}
      {definition.id === 'scoring.special-catalogue' && <p className="mt-2 text-xs leading-5 text-[#596b65]">These totals count different things—named hands, scoring entries or limit hands—so they are not a like-for-like count.</p>}
      <details className="mt-3 border-t border-[#e5dccb] pt-2 text-xs text-[#596b65]"><summary className="min-h-11 cursor-pointer py-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Evidence & app support</summary>
        <div className="space-y-2 pb-2 leading-5">
          <p>{selectedLeft.name}: source evidence {a.sourceStatus.replaceAll('-', ' ')}; app support {a.runtimeSupport.replaceAll('-', ' ')}.{a.caveat ? ` ${a.caveat}` : ''}</p>
          <p>{selectedRight.name}: source evidence {b.sourceStatus.replaceAll('-', ' ')}; app support {b.runtimeSupport.replaceAll('-', ' ')}.{b.caveat ? ` ${b.caveat}` : ''}</p>
          {[...a.provenanceIds, ...b.provenanceIds].some((id) => id.includes('CLASSICAL_COMPARATOR_AUDIT_V1')) && <p>Evidence reference: Classical comparator audit v1.</p>}
        </div>
      </details>
    </article>;
  };

  return <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12" aria-labelledby="exact-profile-title">
    <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">Compare playable rules</div>
    <h2 id="exact-profile-title" className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">What changes at the table?</h2>
    <p className="mt-3 max-w-[780px] text-[13px] leading-6 text-[#596b65]">See what changes at the table. Local rules may vary; a short note appears where that affects what you can rely on.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {[{ value: left, set: setLeft, label: 'First exact profile' }, { value: right, set: setRight, label: 'Second exact profile' }].map((control) => <label key={control.label} className="grid gap-2 text-[12px] font-semibold text-[#284d45]">{control.label}<select aria-label={control.label} value={control.value} onChange={(event) => control.set(event.target.value)} className="min-h-11 w-full rounded-lg border border-[#b8c8c1] bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{profiles.map(({ ref, name }) => <option key={`${ref.id}@${ref.version}`} value={`${ref.id}@${ref.version}`}>{name} · {ref.version}</option>)}</select></label>)}
    </div>
    <div className="mt-3 grid gap-2 text-xs leading-5 text-[#596b65] sm:grid-cols-2"><p>{selectedLeft.name}: profile status {selectedLeft.status ?? 'not stated'} · version {selectedLeft.ref.version}</p><p>{selectedRight.name}: profile status {selectedRight.status ?? 'not stated'} · version {selectedRight.ref.version}</p></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#efe8da] p-3 text-[12px] text-[#405650]">
      <span>{selectedLeft.name} {selectedLeft.ref.version} vs {selectedRight.name} {selectedRight.ref.version}</span>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold"><input type="checkbox" aria-label="Differences only" checked={differencesOnly} onChange={(event) => setDifferencesOnly(event.target.checked)} className="h-4 w-4 accent-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"/>Differences only</label>
      <a className="min-h-11 content-center rounded border border-[#b8c8c1] bg-white px-3 font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]" href="/rules">Explore rules profiles</a>
    </div>
    {!l || !r ? <p className="mt-5 text-sm text-[#596b65]" role="status">Loading resolved profiles…</p> : <div className="mt-6 space-y-7">
      <section aria-labelledby="differences-heading"><h3 id="differences-heading" className="mb-3 font-serif text-2xl text-[#284d45]">What differs?</h3>{differentRows.length ? <div className="space-y-5">{groupedRows(differentRows)}</div> : <p className="rounded-lg bg-[#efe8da] p-4 text-sm leading-6 text-[#405650]">No differences are established in the rules shown here.</p>}</section>
      {!differencesOnly && sameRows.length > 0 && <section aria-labelledby="same-heading"><h3 id="same-heading" className="mb-3 font-serif text-2xl text-[#284d45]">Same in both</h3><div className="space-y-5">{groupedRows(sameRows)}</div></section>}
      {checkingRows.length > 0 && <details className="rounded-lg border border-[#d8ceb8] bg-[#fbf8ed] p-4"><summary className="min-h-11 cursor-pointer font-serif text-xl text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Other rules and qualifications ({checkingRows.length})</summary><p className="mb-3 mt-2 text-sm leading-6 text-[#596b65]">These topics do not have comparable answers for both versions. An incomplete comparison does not mean a rule is absent.</p><ul className="space-y-3 text-sm leading-6">{checkingRows.map(({ definition, a, b }) => <li key={definition.id}><strong>{definition.label}</strong><p>{selectedLeft.name}: {a.playerAnswer ?? (a.value.status === 'unknown' ? 'No answer is available.' : readableValue(a, selectedLeft.name))}</p><p>{selectedRight.name}: {b.playerAnswer ?? (b.value.status === 'unknown' ? 'No answer is available.' : readableValue(b, selectedRight.name))}</p></li>)}</ul></details>}
    </div>}
  </section>;
}
