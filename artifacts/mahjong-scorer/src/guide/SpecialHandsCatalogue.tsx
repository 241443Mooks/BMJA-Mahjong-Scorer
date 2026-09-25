import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, X, Check } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { ReturnToGame } from '../components/ReturnToGame';
import { descriptorForRulesProfile, PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { readPreferredRulesProfile } from '../game/preferred-rules-profile';
import { atlasExampleProvesTreatment } from './atlas-scorer-handoff';
import { SPECIAL_HAND_ANCHORS } from './special-hand-references';
import { AtlasExampleVisual } from './AtlasExampleVisual';
import {
  ATLAS_EXAMPLE_BY_ID,
  ATLAS_FACET_DEFINITIONS,
  ATLAS_LEARNER_ENTRIES,
  ATLAS_UNRESOLVED_TREATMENTS,
  CLASSICAL_ATLAS_PROFILES,
  SPECIAL_HANDS_ATLAS,
  atlasScoreLabel,
  atlasExamplesForTreatment,
  atlasTreatmentsForEntry,
  clearAtlasSearchAndProfileFilter,
  filterAtlasEntriesByFacets,
  atlasEntriesForProfile,
  searchAtlasLearnerEntries,
  selectAtlasLeadExample,
  selectAtlasLeadExampleForTreatment,
  type AtlasExample,
  type AtlasLearnerEntry,
  type SpecialHandsAtlasRecord,
} from './special-hands-atlas';

const displayFacets = Object.entries(ATLAS_FACET_DEFINITIONS);
const publicClubCopy = (value: string) => value.replaceAll('Outside the Box', 'Club - Bramhall 2026').replaceAll('outside-the-box', 'Club - Bramhall 2026');
const facetName = (id: string) => id.replaceAll('-', ' ').replace(/\b\w/g, (char) => char.toLocaleUpperCase('en-GB'));
function treatmentAnchor(record: SpecialHandsAtlasRecord) {
  if (!record.href) return undefined;
  const raw = record.href.split('#')[1];
  return raw && raw in SPECIAL_HAND_ANCHORS ? SPECIAL_HAND_ANCHORS[raw as keyof typeof SPECIAL_HAND_ANCHORS] : raw;
}

function qualifierText(record: SpecialHandsAtlasRecord) {
  const facts: string[] = [];
  const exposure = record.exposurePolicy?.policy as { allowed?: boolean; exposedValue?: number; exposedFishingValue?: number; multiplier?: number } | undefined;
  if (exposure?.allowed === false) facts.push('Exposed Pung/Kong sets are not allowed.');
  else if (exposure?.allowed === true && exposure.exposedValue !== undefined) {
    facts.push(`With exposed sets: ${new Intl.NumberFormat('en-GB').format(exposure.exposedValue)} winner${exposure.exposedFishingValue === undefined ? '' : ` · ${new Intl.NumberFormat('en-GB').format(exposure.exposedFishingValue)} fishing`}.`);
  } else if (exposure?.allowed === true) facts.push('Exposed sets are allowed under this treatment.');
  else if (exposure?.multiplier !== undefined) facts.push(`Exposed sets multiply the score by ${exposure.multiplier}.`);
  if (record.winningMethods?.length) facts.push(`Winning method: ${record.winningMethods.join(' or ')}.`);
  return facts;
}

function treatmentChoiceLabel(entry: AtlasLearnerEntry, record: SpecialHandsAtlasRecord) {
  const variant = entry.variants?.find(({ treatmentReferenceIds }) => treatmentReferenceIds?.includes(record.referenceId));
  return publicClubCopy(variant?.label ?? record.name);
}

function SafeScorerAction({ record, examples }: { record: SpecialHandsAtlasRecord; examples: AtlasExample[] }) {
  const example = examples.find((item) => atlasExampleProvesTreatment(item.id, record.referenceId));
  if (!example) return null;
  const slug = PUBLIC_RULES_DESCRIPTORS.find(({ profile }) => profile.id === record.identity.profile.id && profile.version === record.identity.profile.version)?.slug;
  if (!slug) return null;
  const exampleQuery = `atlasExample=${encodeURIComponent(example.id)}`;
  return <a href={`/hand?${exampleQuery}&rules=${slug}&treatment=${encodeURIComponent(record.identity.patternId)}`} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#b8cdbf] bg-[#edf3ed] px-3 text-sm font-semibold text-[#284d45] hover:bg-[#dceade] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Try this hand in {record.profileLabel} scorer</a>;
}

function TreatmentDetails({
  record,
  examples,
  preferredProfile,
  compact = false,
}: {
  record: SpecialHandsAtlasRecord;
  examples: AtlasExample[];
  preferredProfile: { id: string; version: string } | null;
  compact?: boolean;
}) {
  const unresolved = ATLAS_UNRESOLVED_TREATMENTS.has(record.referenceId);
  return <details className="rounded-lg border border-[#dfd5c2] bg-white/70 p-3">
    <summary id={treatmentAnchor(record)} className="cursor-pointer rounded text-sm font-semibold text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
      <span>{publicClubCopy(record.name)}</span><span className="ml-2 text-xs font-normal text-[#596b65]">{publicClubCopy(record.profileLabel)} · {record.identity.profile.version} · {atlasScoreLabel(record)}</span>
      {preferredProfile?.id === record.identity.profile.id && preferredProfile.version === record.identity.profile.version && <span className="ml-2 rounded-full bg-[#284d45] px-2 py-1 text-[11px] font-semibold text-white">My rules</span>}
    </summary>
    <div className="mt-3 space-y-3 text-sm leading-6 text-[#596b65]">
      <p>{publicClubCopy(record.description)}</p>
      <p className="font-semibold text-[#284d45]">{atlasScoreLabel(record)}</p>
      {qualifierText(record).map((fact) => <p key={fact}>{fact}</p>)}
      {record.winningMethods?.length === 0 && <p>Winning method: any method accepted by this profile.</p>}
      {unresolved && <p className="rounded-lg border-l-4 border-[#ae6249] bg-[#f5f1e6] p-3">{examples.find((example) => example.referenceNote)?.referenceNote ?? 'The available reference does not give the full hand rule. The scorer follows the rules shown here.'}</p>}
      {examples.map((example) => <AtlasExampleVisual key={example.id} example={example} />)}
      {!compact && <SafeScorerAction record={record} examples={examples} />}
    </div>
  </details>;
}

function TreatmentQuickSummary({ record, examples, preferredProfile, displayName }: { record: SpecialHandsAtlasRecord; examples: AtlasExample[]; preferredProfile: { id: string; version: string } | null; displayName?: string }) {
  const anchorId = treatmentAnchor(record);
  const unresolved = ATLAS_UNRESOLVED_TREATMENTS.has(record.referenceId);
  return <section id={anchorId} className="scroll-mt-24 mt-4 rounded-xl border-2 border-[#284d45] bg-[#edf3ed] p-4" aria-label={`${publicClubCopy(record.profileTitle)} rules version`}>
    <div className="font-mono text-xs font-semibold uppercase tracking-[.14em] text-[#477562]">{preferredProfile?.id === record.identity.profile.id && preferredProfile.version === record.identity.profile.version ? 'Your rules' : 'Under these rules'} · {publicClubCopy(record.profileTitle)} {record.identity.profile.version}</div>
    <h3 className="mt-1 font-serif text-xl text-[#284d45]">{publicClubCopy(displayName ?? record.name)}</h3>
    <p className="mt-1 text-sm leading-6 text-[#284d45]">{publicClubCopy(record.description)}</p>
    <p className="mt-2 text-sm font-semibold text-[#284d45]">{atlasScoreLabel(record)}</p>
    {qualifierText(record).map((fact) => <p key={fact} className="mt-1 text-sm leading-6 text-[#596b65]">{fact}</p>)}
    {unresolved && <p className="mt-3 rounded-lg border-l-4 border-[#ae6249] bg-[#f5f1e6] p-3 text-sm leading-6 text-[#596b65]">{examples.find((example) => example.referenceNote)?.referenceNote ?? 'The available reference does not give the full hand rule. The scorer follows the rules shown here.'}</p>}
    <SafeScorerAction record={record} examples={examples} />
  </section>;
}

function EntryCard({
  entry,
  preferredProfile,
  myRules,
  explicitProfile,
  expanded,
  onExpandedChange,
}: {
  entry: AtlasLearnerEntry;
  preferredProfile: { id: string; version: string } | null;
  myRules: boolean;
  explicitProfile: string | null;
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
}) {
  const [localTreatment, setLocalTreatment] = useState<string | null>(null);
  const treatments = atlasTreatmentsForEntry(entry);
  const ownTreatment = preferredProfile && treatments.find(({ identity }) => identity.profile.id === preferredProfile.id && identity.profile.version === preferredProfile.version);
  const legacyTreatment = treatments.find((record) => !!record.href);
  const globallySelected = explicitProfile ? treatments.find(({ identity }) => `${identity.profile.id}@${identity.profile.version}` === explicitProfile) : undefined;
  const locallySelected = localTreatment ? treatments.find(({ referenceId }) => referenceId === localTreatment) : undefined;
  const localForScope = locallySelected && (!explicitProfile || `${locallySelected.identity.profile.id}@${locallySelected.identity.profile.version}` === explicitProfile) ? locallySelected : undefined;
  const prominentTreatment = localForScope ?? globallySelected ?? (myRules ? ownTreatment : undefined) ?? legacyTreatment ?? treatments[0];
  const prominentProfileKey = prominentTreatment ? `${prominentTreatment.identity.profile.id}@${prominentTreatment.identity.profile.version}` : null;
  const sameProfileTreatments = prominentProfileKey ? treatments.filter(({ identity }) => `${identity.profile.id}@${identity.profile.version}` === prominentProfileKey) : [];
  const leadExample = prominentTreatment ? selectAtlasLeadExampleForTreatment(entry, prominentTreatment.referenceId) : selectAtlasLeadExample(entry, myRules ? preferredProfile : null);
  const remainingTreatments = prominentTreatment ? treatments.filter(({ referenceId, identity }) => referenceId !== prominentTreatment.referenceId && (!explicitProfile || `${identity.profile.id}@${identity.profile.version}` === explicitProfile)) : treatments;
  const linkedEntries = (entry.relatedEntryIds ?? []).flatMap((id) => {
    const related = ATLAS_LEARNER_ENTRIES.find((item) => item.id === id);
    return related ? [related] : [];
  });

  return <article id={`atlas-entry-${entry.id}`} className="scroll-mt-24 rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] p-4 shadow-[var(--shadow-sm)] sm:p-5">
    <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-3">
      <div className="w-full min-w-0 flex-1 sm:w-auto">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-serif text-2xl leading-tight text-[#284d45]">{publicClubCopy(entry.displayName)}</h2>
          <span className="rounded-full bg-[#efe8da] px-2 py-1 text-xs font-semibold text-[#596b65]">{entry.state === 'reviewed-concept' ? 'Special hand group' : entry.state === 'reviewed-family-topic' ? 'Related hands' : entry.state === 'standalone-unresolved' ? 'Reference note' : 'Special hand'}</span>
        </div>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#284d45]">{publicClubCopy(entry.summary)}</p>
        <p className="mt-1 text-sm leading-6 text-[#596b65]">{publicClubCopy(entry.whatItIs)}</p>
      </div>
      <div className="flex w-full max-w-full flex-col items-start gap-2 sm:w-auto" role="group" aria-label={`Choose rules for ${publicClubCopy(entry.displayName)}`}>
        <div className="flex max-w-full flex-wrap gap-2">{[...new Map(treatments.map((record) => [`${record.identity.profile.id}@${record.identity.profile.version}`, record])).values()].filter((record) => !explicitProfile || `${record.identity.profile.id}@${record.identity.profile.version}` === explicitProfile).map((record) => { const selected = prominentProfileKey === `${record.identity.profile.id}@${record.identity.profile.version}`; const key = `${record.identity.profile.id}@${record.identity.profile.version}`; return <button key={key} type="button" aria-pressed={selected} onClick={() => setLocalTreatment(record.referenceId)} className={`inline-flex min-h-11 items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] ${selected ? 'border-[#284d45] bg-[#284d45] text-white ring-2 ring-[#284d45] ring-offset-1' : 'border-[#b8cdbf] bg-white text-[#284d45]'}`}><span>{record.profileLabel}</span>{selected && <Check size={14} aria-hidden="true" />}</button>; })}</div>
        {sameProfileTreatments.length > 1 && <label className="block max-w-full text-xs font-semibold text-[#284d45]">Hand name under these rules
          <select aria-label={`Hand name under these rules for ${publicClubCopy(entry.displayName)}`} value={prominentTreatment?.referenceId ?? ''} onChange={(event) => setLocalTreatment(event.target.value)} className="mt-1 block min-h-11 max-w-full rounded-md border border-[#b8cdbf] bg-white px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
            {sameProfileTreatments.map((record) => <option key={record.referenceId} value={record.referenceId}>{treatmentChoiceLabel(entry, record)}</option>)}
          </select>
        </label>}
      </div>
    </div>

    {leadExample && <AtlasExampleVisual example={leadExample.example} title={leadExample.variantLabel ? `Example variant: ${leadExample.variantLabel}` : undefined} />}
    {entry.facets?.length ? <ul className="mt-3 flex flex-wrap gap-2" aria-label="Hand features">{entry.facets.map((facet) => <li key={facet} className="rounded-full border border-[#b8cdbf] bg-[#edf3ed] px-2.5 py-1 text-xs font-medium text-[#284d45]">{facetName(facet)}</li>)}</ul> : null}

    {prominentTreatment && <TreatmentQuickSummary record={prominentTreatment} examples={atlasExamplesForTreatment(entry, prominentTreatment.referenceId)} preferredProfile={preferredProfile} displayName={treatmentChoiceLabel(entry, prominentTreatment)} />}
    {myRules && preferredProfile && !ownTreatment ? <p className="mt-4 rounded-xl border border-[#dfd5c2] bg-white/70 p-3 text-sm leading-6 text-[#596b65]">This hand is not listed under your remembered rules ({descriptorForRulesProfile(preferredProfile).title}). The general reference is still available here.</p> : null}

    <details open={expanded} onToggle={(event) => onExpandedChange(event.currentTarget.open)} className="mt-4 rounded-xl border border-[#dfd5c2] bg-white/55 p-3">
      <summary className="cursor-pointer flex min-h-10 items-center gap-2 font-semibold text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"><BookOpen size={18} aria-hidden="true" /> Learn more about {publicClubCopy(entry.displayName)}</summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <section><h3 className="font-serif text-lg text-[#284d45]">What it means</h3><p className="mt-1 text-sm leading-6 text-[#596b65]">{publicClubCopy(entry.whatItMeans)}</p></section>
        <section><h3 className="font-serif text-lg text-[#284d45]">Why it is special</h3><p className="mt-1 text-sm leading-6 text-[#596b65]">{publicClubCopy(entry.whySpecial)}</p></section>
      </div>
      {entry.howItWorks?.length ? <section className="mt-4"><h3 className="font-serif text-lg text-[#284d45]">How it works</h3><ol className="mt-2 list-inside list-decimal space-y-1 text-sm leading-6 text-[#596b65]">{entry.howItWorks.map((step) => <li key={step}>{publicClubCopy(step)}</li>)}</ol></section> : null}
      {entry.watchOutFor?.length ? <section className="mt-4"><h3 className="font-serif text-lg text-[#284d45]">Watch out for</h3><ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-6 text-[#596b65]">{entry.watchOutFor.map((note) => <li key={note}>{publicClubCopy(note)}</li>)}</ul></section> : null}
      {entry.referenceNote && <section className="mt-4 rounded-lg border-l-4 border-[#ae6249] bg-[#f5f1e6] p-3"><h3 className="font-serif text-lg text-[#284d45]">Reference note</h3><p className="mt-1 text-sm leading-6 text-[#596b65]">{publicClubCopy(entry.referenceNote)}</p></section>}
      {entry.localNames?.length ? <p className="mt-4 text-sm leading-6 text-[#596b65]"><strong>Also called:</strong> {publicClubCopy(entry.localNames.join(' · '))}</p> : null}
      {entry.variants?.length ? <section className="mt-4"><h3 className="font-serif text-lg text-[#284d45]">Related variants</h3><div className="mt-2 space-y-3">{entry.variants.map((variant) => {
        const variantExamples = (variant.exampleIds ?? []).flatMap((id) => { const example = ATLAS_EXAMPLE_BY_ID.get(id); return example ? [example] : []; });
        return <div key={variant.id} className="rounded-lg border border-[#dfd5c2] bg-[#fdfbf5] p-3"><h4 className="font-semibold text-[#284d45]">{publicClubCopy(variant.label)}</h4>{variant.definition && <p className="mt-1 text-sm leading-6 text-[#596b65]">{publicClubCopy(variant.definition)}</p>}{variantExamples.map((example) => <AtlasExampleVisual key={example.id} example={example} />)}</div>;
      })}</div></section> : null}
      {linkedEntries.length ? <section className="mt-4"><h3 className="font-serif text-lg text-[#284d45]">Related hands</h3><ul className="mt-2 flex flex-wrap gap-2">{linkedEntries.map((related) => <li key={related.id}><a className="inline-flex min-h-10 items-center rounded-full border border-[#b8cdbf] bg-white px-3 text-sm font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]" href={`#atlas-entry-${related.id}`}>{publicClubCopy(related.displayName)}</a></li>)}</ul></section> : null}
      {remainingTreatments.length > 0 && <section className="mt-4"><h3 className="mb-2 font-serif text-lg text-[#284d45]">{myRules && ownTreatment ? 'Other rules' : 'Scores under other rules'}</h3><div className="space-y-2">{remainingTreatments.map((record) => <TreatmentDetails key={record.referenceId} record={record} examples={atlasExamplesForTreatment(entry, record.referenceId)} preferredProfile={preferredProfile} />)}</div></section>}
      {entry.evidenceBindings?.length ? <details className="mt-4 rounded-lg border border-[#dfd5c2] p-3"><summary className="cursor-pointer text-sm font-semibold text-[#596b65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Sources</summary><ul className="mt-2 space-y-2 text-xs leading-5 text-[#66746e]">{[...new Set(atlasTreatmentsForEntry(entry).map((record) => `${record.profileTitle} — ${descriptorForRulesProfile(record.identity.profile).support.authority}`))].map((source) => <li key={source}>{source}</li>)}</ul></details> : null}
    </details>
  </article>;
}

export function SpecialHandsCatalogue() {
  const [preferred] = useState(() => readPreferredRulesProfile());
  const preferredClassical = preferred && CLASSICAL_ATLAS_PROFILES.some(({ id, version }) => id === preferred.id && version === preferred.version) ? preferred : null;
  const [myRules, setMyRules] = useState(Boolean(preferredClassical));
  const [profileFilter, setProfileFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedFacets, setSelectedFacets] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const profileForFilter = profileFilter === 'all' ? null : PUBLIC_RULES_DESCRIPTORS.find(({ slug }) => slug === profileFilter)?.profile ?? null;

  const entriesForScope = (scope: 'all' | 'my-rules' | { id: string; version: string }, facets: string[] = selectedFacets) => {
    const profile = scope === 'all' ? null : scope === 'my-rules' ? preferredClassical : scope;
    let entries = searchAtlasLearnerEntries(ATLAS_LEARNER_ENTRIES, query);
    if (profile) entries = atlasEntriesForProfile(entries, profile);
    return filterAtlasEntriesByFacets(entries, facets);
  };

  const results = useMemo(() => {
    return entriesForScope(myRules ? (preferredClassical ? 'my-rules' : 'all') : profileForFilter ?? 'all');
  }, [myRules, profileForFilter, query, selectedFacets]);

  useEffect(() => {
    if (expandedEntryId && !results.some(({ id }) => id === expandedEntryId)) setExpandedEntryId(null);
  }, [expandedEntryId, results]);

  const clearSearchAndFilter = () => {
    const cleared = clearAtlasSearchAndProfileFilter({ mode: myRules ? 'my-rules' : 'all-rules', query, profileFilter });
    setQuery(cleared.query);
    setProfileFilter(cleared.profileFilter);
    setSelectedFacets([]);
  };

  useEffect(() => {
    const anchor = window.location.hash.slice(1);
    if (!anchor) return;
    setMyRules(false);
    setProfileFilter('all');
    setQuery('');
    const entry = ATLAS_LEARNER_ENTRIES.find(({ id, treatmentReferenceIds }) => `atlas-entry-${id}` === anchor || treatmentReferenceIds.some((referenceId) => {
      const record = SPECIAL_HANDS_ATLAS.find((candidate) => candidate.referenceId === referenceId);
      return !!record?.href && treatmentAnchor(record) === anchor;
    }));
    if (entry) setExpandedEntryId(entry.id);
    requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: 'start' })));
  }, []);

  const mcrPreference = preferred?.id === 'mcr-wmo-2006' && preferred.version === '0.1';
  const showBmjaPurity = myRules ? preferredClassical?.id === 'bmja' : !profileForFilter || profileForFilter.id === 'bmja';

  return <div className="mahjong-shell">
    <SiteHeader />
    <main className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <ReturnToGame />
      <section className="rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] p-4 shadow-[var(--shadow-sm)] sm:p-8 lg:p-10">
        <div className="mb-2 flex items-center gap-3"><div className="fine-rule w-10" /><span className="font-mono text-xs uppercase tracking-[.18em] text-[#ae6249]">Special Hands Guide</span></div>
        <h1 className="max-w-[800px] font-serif text-[clamp(34px,6vw,58px)] leading-[.98] text-[#284d45]">Find a special hand.</h1>
        <p className="mt-2 max-w-[780px] text-sm leading-6 text-[#596b65]">Find, understand and compare special hands across different Mahjong rules.</p>
        {mcrPreference && <p role="status" className="mt-4 rounded-lg bg-[#edf3ed] p-3 text-sm leading-6 text-[#284d45]">Your remembered rules are MCR. This guide currently covers the supported Classical rules; choose All rules to browse them.</p>}
        {preferred && !preferredClassical && !mcrPreference && <p role="status" className="mt-4 rounded-lg bg-[#edf3ed] p-3 text-sm leading-6 text-[#284d45]">Your remembered rules do not have a special-hands list yet. Choose All rules to browse the supported Classical rules.</p>}
        <label className="sr-only" htmlFor="atlas-search">Search hand names and patterns</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#b8cdbf] bg-white px-3 focus-within:ring-2 focus-within:ring-[#ae6249]"><Search size={18} aria-hidden="true" className="shrink-0 text-[#596b65]" /><input id="atlas-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Unique Wonder, Imperial Jade or Seven Twins" className="min-h-11 min-w-0 flex-1 border-0 bg-transparent text-base text-[#284d45] outline-none" /></div>
          <select aria-label="Rules" value={myRules && preferredClassical ? 'my-rules' : profileFilter} onChange={(event) => { if (event.target.value === 'my-rules') { setMyRules(true); setProfileFilter('all'); } else { setMyRules(false); setProfileFilter(event.target.value); } }} className="min-h-12 min-w-0 flex-1 rounded-lg border border-[#b8cdbf] bg-white px-3 text-sm font-semibold text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
            <option value="all">Rules: All rules ({entriesForScope('all').length})</option>
            {preferredClassical && <option value="my-rules">My rules — {descriptorForRulesProfile(preferredClassical).compactLabel} ({entriesForScope('my-rules').length})</option>}
            {CLASSICAL_ATLAS_PROFILES.map((profile) => { const slug = PUBLIC_RULES_DESCRIPTORS.find(({ profile: candidate }) => candidate.id === profile.id && candidate.version === profile.version)!.slug; return <option key={slug} value={slug}>{descriptorForRulesProfile(profile).compactLabel} ({entriesForScope(profile).length})</option>; })}
          </select>
          <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)} className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#b8cdbf] bg-white px-3 text-sm font-semibold text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Filters{selectedFacets.length > 0 ? ` (${selectedFacets.length})` : ''}</button>
          {(query || profileFilter !== 'all' || selectedFacets.length > 0 || myRules) && <button type="button" onClick={clearSearchAndFilter} aria-label="Clear search and filters" className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#b8cdbf] px-3 text-sm font-semibold text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"><X size={16} aria-hidden="true" /><span className="sr-only">Clear filters</span></button>}
        </div>
        {filtersOpen && <section className="mt-4" aria-labelledby="atlas-facets-heading">
          <h2 id="atlas-facets-heading" className="text-sm font-semibold text-[#284d45]">More ways to find a hand</h2>
          <p className="mt-1 text-xs leading-5 text-[#66746e]">Facets overlap; entries matching several still count once.</p>
          <div className="mt-2 flex flex-wrap gap-2">{displayFacets.filter(([facet]) => ATLAS_LEARNER_ENTRIES.some((entry) => entry.facets?.includes(facet))).map(([facet, description]) => { const next = selectedFacets.includes(facet) ? selectedFacets : [...selectedFacets, facet]; const count = selectedFacets.includes(facet) ? results.length : entriesForScope(myRules && preferredClassical ? 'my-rules' : profileForFilter ?? 'all', next).length; return <button key={facet} type="button" aria-label={`${facetName(facet)}, ${count} matching hands`} aria-pressed={selectedFacets.includes(facet)} title={description} onClick={() => setSelectedFacets((current) => current.includes(facet) ? current.filter((item) => item !== facet) : [...current, facet])} className={`min-h-10 rounded-full border px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] ${selectedFacets.includes(facet) ? 'border-[#284d45] bg-[#284d45] text-white' : 'border-[#b8cdbf] bg-white text-[#284d45]'}`}>{facetName(facet)} ({count})</button>; })}</div>
        </section>
        }
        <p className="mt-4 text-sm text-[#596b65]" aria-live="polite">{results.length} {results.length === 1 ? 'hand' : 'hands'}</p>
      </section>

      <section className="py-5 sm:py-6" aria-label="Special hands">
        {results.length ? <div className="space-y-3">{results.map((entry) => <EntryCard key={entry.id} entry={entry} preferredProfile={preferredClassical} myRules={myRules} explicitProfile={!myRules && profileForFilter ? `${profileForFilter.id}@${profileForFilter.version}` : null} expanded={expandedEntryId === entry.id} onExpandedChange={(open) => setExpandedEntryId(open ? entry.id : (expandedEntryId === entry.id ? null : expandedEntryId))} />)}</div> : <div className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-6 text-center"><h2 className="font-serif text-2xl text-[#284d45]">No matching hands</h2><p className="mt-2 text-sm text-[#596b65]">Try another name or filter.</p><button type="button" onClick={clearSearchAndFilter} className="mt-4 min-h-11 rounded-lg border border-[#b8cdbf] px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Show all hands</button></div>}
      </section>

      {showBmjaPurity && <section className="mb-8 rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] p-4 sm:p-5" id="purity">
        <div className="font-mono text-xs uppercase tracking-[.16em] text-[#ae6249]">British scoring note</div>
        <h2 className="mt-2 font-serif text-2xl text-[#284d45]">Purity</h2>
        <p className="mt-2 text-sm leading-6 text-[#596b65]">One numbered suit only, using Pungs and/or Kongs plus a pair. No Winds, Dragons or Chow. In BMJA scoring, Purity is calculated as three doubles.</p>
        <p className="mt-2 text-sm leading-6 text-[#596b65]">Other rules may score Purity differently. Choose a rules version above to see how it works.</p>
      </section>}

      <footer className="border-t border-[#d8ceb8] py-5 text-sm leading-6 text-[#596b65]">
        <p>Each rules version keeps its own scoring and hand rules.</p>
        <p className="mt-1">For worked British scoring examples, <a href="/scoring-examples" className="font-semibold underline decoration-[#ae6249] underline-offset-4">visit the scoring guide</a>; to score a hand, <a href="/hand" className="font-semibold underline decoration-[#ae6249] underline-offset-4">open the hand scorer</a>.</p>
      </footer>
    </main>
  </div>;
}
