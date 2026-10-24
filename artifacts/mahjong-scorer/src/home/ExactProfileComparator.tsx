import { useMemo, useState } from 'react';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import type { RulesDescriptor } from '../game/rules-presentation';
import { projectProfileDimensions, RULES_DIMENSIONS, CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE, type ProfileDimensionValue, type RulesDimensionGroup, type RulesDimensionId } from '../rules-platform/profile-dimensions';
import type { RulesProfileRef } from '../rules-platform/types';

export const comparatorProfiles = (registry: readonly RulesDescriptor[] = PUBLIC_RULES_DESCRIPTORS) => registry.map((descriptor) => ({ ref: descriptor.profile, name: descriptor.compactLabel, slug: descriptor.slug, status: descriptor.status }));
const compareGroups = [
  { title: 'Tiles and hands', groups: ['identity-table-tiles', 'hand-play'] as const },
  { title: 'Scoring and special hands', groups: ['ready-declarations', 'scoring'] as const },
  { title: 'Payments and what happens next', groups: ['settlement-incidents', 'draws-progression'] as const },
];

type ComparisonState = 'different' | 'same' | 'needs-checking';
type ComparisonRow = {
  definition: typeof RULES_DIMENSIONS[number];
  a: ProfileDimensionValue;
  b: ProfileDimensionValue;
  state: ComparisonState;
};
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
export const comparisonGroupRows = (
  differentRows: readonly ComparisonRow[],
  sameRows: readonly ComparisonRow[],
  includeSame: boolean,
) => compareGroups.map(({ title, groups }) => {
  const belongsToGroup = ({ definition }: ComparisonRow) => (groups as readonly RulesDimensionGroup[]).includes(definition.group);
  const differences = differentRows.filter(belongsToGroup);
  const same = sameRows.filter(belongsToGroup);
  return { title, differences, same, rows: [...differences, ...(includeSame ? same : [])] };
}).filter(({ rows }) => rows.length > 0);
const chooserStatus = (status?: string) => {
  if (!status) return undefined;
  if (status.toLowerCase().includes('ordinary play is still under source review')) return 'Provisional ordinary rules';
  if (status.toLowerCase().includes('provisional, source-backed')) return 'Provisional · source-backed';
  if (status.toLowerCase().includes('provisional')) return 'Provisional';
  if (status.toLowerCase().includes('club')) return 'Club profile';
  return status;
};
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

export function ExactProfileComparator({ registry = PUBLIC_RULES_DESCRIPTORS }: { registry?: readonly RulesDescriptor[] } = {}) {
  const profiles = useMemo(() => comparatorProfiles(registry), [registry]);
  const values = useMemo(() => Object.fromEntries(profiles.map(({ ref }) => [`${ref.id}@${ref.version}`, projectProfileDimensions(getCurrentCompiledRulesRuntime(ref).artifact, CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE)])), [profiles]);
  const [left, setLeft] = useState('bmja@1.0');
  const [right, setRight] = useState('outside-the-box@0.1');
  const [differencesOnly, setDifferencesOnly] = useState(true);
  const l = values[left], r = values[right];
  const selectedLeft = profiles.find(({ ref }) => `${ref.id}@${ref.version}` === left)!;
  const selectedRight = profiles.find(({ ref }) => `${ref.id}@${ref.version}` === right)!;
  const rows = useMemo<ComparisonRow[]>(() => l && r ? RULES_DIMENSIONS.filter(({ id }) => id !== 'profile.identity' && id !== 'profile.authority-status').map((definition) => {
    const a = l.find((value) => value.dimensionId === definition.id)!;
    const b = r.find((value) => value.dimensionId === definition.id)!;
    return { definition, a, b, state: comparisonState(a, b) };
  }) : [], [l, r]);
  const differentRows = rows.filter(({ state }) => state === 'different');
  const sameRows = rows.filter(({ state }) => state === 'same');
  const checkingRows = rows.filter(({ state }) => state === 'needs-checking');

  const groupedRows = () => comparisonGroupRows(differentRows, sameRows, !differencesOnly).map(({ title, differences, same, rows: groupRows }) => {
    return <details key={title} className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4 sm:p-5">
      <summary className="min-h-11 cursor-pointer font-serif text-xl text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{title}<span className="ml-2 font-sans text-xs text-[#596b65]">({differences.length} differences{!differencesOnly && same.length ? `, ${same.length} same` : ''})</span></summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><p className="min-w-0 text-xs font-semibold leading-5 text-[#405650]">{selectedLeft.name} · {selectedLeft.ref.version}{selectedLeft.slug && <> · <a className="underline underline-offset-2" href={`/rules/${selectedLeft.slug}`}>rules detail</a></>}</p><p className="min-w-0 text-xs font-semibold leading-5 text-[#405650]">{selectedRight.name} · {selectedRight.ref.version}{selectedRight.slug && <> · <a className="underline underline-offset-2" href={`/rules/${selectedRight.slug}`}>rules detail</a></>}</p></div>
      <div className="mt-3 space-y-3">{groupRows.map(row)}</div>
    </details>;
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
    return <article key={definition.id} className="rounded-lg border border-[#e5dccb] bg-white p-4">
      <h4 className="font-semibold leading-6 text-[#284d45]">{definition.label}</h4>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <div className="min-w-0"><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#596b65] sm:sr-only">{selectedLeft.name}</p><p className="break-words text-sm leading-6 text-[#284d45]">{leftText}</p>{leftQualification && <p className="mt-1 text-xs leading-5 text-[#7a5a42]">{leftQualification}</p>}</div>
        <div className="min-w-0"><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#596b65] sm:sr-only">{selectedRight.name}</p><p className="break-words text-sm leading-6 text-[#284d45]">{rightText}</p>{rightQualification && <p className="mt-1 text-xs leading-5 text-[#7a5a42]">{rightQualification}</p>}</div>
      </div>
      {definition.id === 'scoring.special-catalogue' && <a href="/special-hands" className="mt-2 inline-block min-h-11 content-center text-sm font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Browse special hands</a>}
      {definition.id === 'scoring.special-catalogue' && <p className="mt-2 text-xs leading-5 text-[#596b65]">These totals count different things—named hands, scoring entries or limit hands—so they are not a like-for-like count.</p>}
    </article>;
  };

  const featuredRows = differentRows.filter(({ a, b }) =>
    ['source-verified', 'verified-club'].includes(a.sourceStatus) && ['source-verified', 'verified-club'].includes(b.sourceStatus))
    .sort((leftRow, rightRow) => {
      const priority = { low: 0, medium: 1, high: 2, 'very-high': 3 };
      return priority[rightRow.definition.diagnosticValue] - priority[leftRow.definition.diagnosticValue] || leftRow.definition.order - rightRow.definition.order;
    }).slice(0, 3);
  const sameProfileSelected = left === right;

  return <section className="border-b border-[#ddd3bf] px-5 py-7 sm:px-8 sm:py-9 lg:px-12" aria-labelledby="exact-profile-title">
    <h2 id="exact-profile-title" className="font-serif text-[28px] leading-tight text-[#284d45] sm:text-[32px]">Compare two supported rulesets</h2>
    <p className="mt-2 max-w-[780px] text-sm leading-6 text-[#596b65]">The comparison uses the published profile and evidence available here. Local table rules and provisional source details can affect what is established.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {[{ value: left, set: setLeft, label: 'First ruleset' }, { value: right, set: setRight, label: 'Second ruleset' }].map((control) => <label key={control.label} className="grid gap-2 text-[12px] font-semibold text-[#284d45]">{control.label}<select aria-label={control.label} value={control.value} onChange={(event) => control.set(event.target.value)} className="min-h-11 w-full rounded-lg border border-[#b8c8c1] bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{profiles.map(({ ref, name, status }) => <option key={`${ref.id}@${ref.version}`} value={`${ref.id}@${ref.version}`}>{name} · {ref.version}{chooserStatus(status) ? ` · ${chooserStatus(status)}` : ''}</option>)}</select></label>)}
    </div>
    <div className="mt-3 grid gap-2 text-xs leading-5 text-[#596b65] sm:grid-cols-2"><p>{selectedLeft.name}: profile status {selectedLeft.status ?? 'not stated'} · version {selectedLeft.ref.version}</p><p>{selectedRight.name}: profile status {selectedRight.status ?? 'not stated'} · version {selectedRight.ref.version}</p></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#efe8da] p-3 text-[12px] text-[#405650]">
      <span className="font-semibold">{selectedLeft.name} vs {selectedRight.name}</span>
      <label className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold"><input type="checkbox" aria-label="Show the same rules too" checked={!differencesOnly} onChange={(event) => setDifferencesOnly(!event.target.checked)} className="h-4 w-4 accent-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"/>Show the same rules too</label>
      <a className="min-h-11 content-center font-semibold underline decoration-[#ae6249] underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]" href="/rules">Explore rules profiles</a>
    </div>
    {!l || !r ? <p className="mt-5 text-sm text-[#596b65]" role="status">Loading resolved profiles…</p> : <div className="mt-6 space-y-7">
      {featuredRows.length > 0 && <section aria-labelledby="biggest-differences-title"><h3 id="biggest-differences-title" className="mb-3 font-serif text-2xl text-[#284d45]">Largest established differences</h3><div className="grid gap-3 md:grid-cols-3">{featuredRows.map(({ definition, a, b }) => <article key={definition.id} className="rounded-xl border border-[#d8ceb8] bg-white p-4"><h4 className="font-semibold leading-5 text-[#284d45]">{definition.label}</h4><p className="mt-3 text-sm leading-5 text-[#596b65]"><strong className="text-[#284d45]">{selectedLeft.name}:</strong> {readableValue(a, selectedLeft.name)}</p><p className="mt-2 text-sm leading-5 text-[#596b65]"><strong className="text-[#284d45]">{selectedRight.name}:</strong> {readableValue(b, selectedRight.name)}</p></article>)}</div></section>}
      <section aria-labelledby="details-title"><h3 id="details-title" className="mb-3 font-serif text-2xl text-[#284d45]">Explore the details</h3>{comparisonGroupRows(differentRows, sameRows, !differencesOnly).length ? <div className="space-y-3">{groupedRows()}</div> : <p className="rounded-lg bg-[#efe8da] p-4 text-sm leading-6 text-[#405650]">{sameProfileSelected ? `Both selectors show ${selectedLeft.name} ${selectedLeft.ref.version}, so there are no cross-profile differences to show. Turn on “Show the same rules too” to inspect its established answers; topics without comparable answers remain under “Still to check”.` : 'No differences are established for this pair in the available comparison. That does not mean the rules are the same; see “Still to check” for topics without comparable answers.'}</p>}</section>
      {checkingRows.length > 0 && <details className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-4"><summary className="min-h-11 cursor-pointer font-serif text-xl text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Still to check ({checkingRows.length})</summary><p className="mb-3 mt-2 text-sm leading-6 text-[#596b65]">These topics do not have comparable answers for both versions. An incomplete comparison does not mean a rule is absent.</p><ul className="space-y-3 text-sm leading-6">{checkingRows.map(({ definition, a, b }) => <li key={definition.id}><strong>{definition.label}</strong><p>{selectedLeft.name}: {a.playerAnswer ?? (a.value.status === 'unknown' ? 'No answer is available.' : readableValue(a, selectedLeft.name))}</p><p>{selectedRight.name}: {b.playerAnswer ?? (b.value.status === 'unknown' ? 'No answer is available.' : readableValue(b, selectedRight.name))}</p></li>)}</ul></details>}
      <details className="rounded-xl border border-[#d8ceb8] bg-white p-4"><summary className="min-h-11 cursor-pointer font-serif text-lg text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Read the rules being compared</summary><ul className="mt-2 space-y-2 text-sm leading-6">{[selectedLeft, ...(left === right ? [] : [selectedRight])].map((profile) => <li key={`${profile.ref.id}@${profile.ref.version}`}><a className="font-semibold text-[#284d45] underline underline-offset-2" href={profile.slug ? `/rules/${profile.slug}` : '/rules'}>{profile.name} · {profile.ref.version}</a></li>)}</ul></details>
    </div>}
  </section>;
}
