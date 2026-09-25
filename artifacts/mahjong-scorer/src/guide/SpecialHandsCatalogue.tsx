import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CircleHelp, Search, X } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { ReturnToGame } from '../components/ReturnToGame';
import { descriptorForRulesProfile } from '../game/rules-presentation';
import { readPreferredRulesProfile } from '../game/preferred-rules-profile';
import { specialHandExampleHref, specialHandExampleProvesBmjaTreatment } from './special-hand-examples';
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
  atlasTreatmentsForEntry,
  clearAtlasSearchAndProfileFilter,
  filterAtlasEntriesByFacets,
  searchAtlasLearnerEntries,
  type AtlasExample,
  type AtlasLearnerEntry,
  type SpecialHandsAtlasRecord,
} from './special-hands-atlas';

const displayFacets = Object.entries(ATLAS_FACET_DEFINITIONS);
const facetName = (id: string) => id.replaceAll('-', ' ').replace(/\b\w/g, (char) => char.toLocaleUpperCase('en-GB'));
const examplesForEntry = (entry: AtlasLearnerEntry) => {
  const ids = [...(entry.exampleIds ?? []), ...(entry.variants ?? []).flatMap((variant) => variant.exampleIds ?? [])];
  return [...new Set(ids)].flatMap((id) => {
    const example = ATLAS_EXAMPLE_BY_ID.get(id);
    return example ? [example] : [];
  });
};
const examplesForTreatment = (entry: AtlasLearnerEntry, record: SpecialHandsAtlasRecord) => {
  const matchingVariants = (entry.variants ?? []).filter((variant) => variant.treatmentReferenceIds?.includes(record.referenceId));
  const ids = matchingVariants.length
    ? matchingVariants.flatMap((variant) => variant.exampleIds ?? [])
    : entry.exampleIds ?? [];
  return [...new Set(ids)].flatMap((id) => { const example = ATLAS_EXAMPLE_BY_ID.get(id); return example ? [example] : []; });
};

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
  else if (exposure?.multiplier !== undefined) facts.push(`Calculated exposure treatment: multiplier ${exposure.multiplier}.`);
  if (record.winningMethods?.length) facts.push(`Winning method: ${record.winningMethods.join(' or ')}.`);
  return facts;
}

function SafeScorerAction({ record, examples }: { record: SpecialHandsAtlasRecord; examples: AtlasExample[] }) {
  const example = examples.find((item) => item.source.type === 'existing-example' && item.source.id &&
    specialHandExampleProvesBmjaTreatment(item.source.id, record.referenceId));
  if (!example || !example.source.id) return null;
  return <a href={specialHandExampleHref(example.source.id as Parameters<typeof specialHandExampleHref>[0])} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#b8cdbf] bg-[#edf3ed] px-3 text-sm font-semibold text-[#284d45] hover:bg-[#dceade] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Try this hand in the scorer</a>;
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
  const localTeaching = record.referenceId;
  const unresolved = ATLAS_UNRESOLVED_TREATMENTS.has(record.referenceId);
  return <details className="rounded-lg border border-[#dfd5c2] bg-white/70 p-3">
    <summary className="cursor-pointer rounded text-sm font-semibold text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
      <span>{record.name}</span><span className="ml-2 text-xs font-normal text-[#596b65]">{record.profileLabel} · {record.identity.profile.version} · {atlasScoreLabel(record)}</span>
      {preferredProfile?.id === record.identity.profile.id && preferredProfile.version === record.identity.profile.version && <span className="ml-2 rounded-full bg-[#284d45] px-2 py-1 text-[11px] font-semibold text-white">My rules</span>}
    </summary>
    <div className="mt-3 space-y-3 text-sm leading-6 text-[#596b65]">
      <p>{record.description}</p>
      <p className="font-semibold text-[#284d45]">{atlasScoreLabel(record)}</p>
      {qualifierText(record).map((fact) => <p key={fact}>{fact}</p>)}
      {record.winningMethods?.length === 0 && <p>Winning method: any method accepted by this profile.</p>}
      {unresolved && <p className="rounded-lg border-l-4 border-[#ae6249] bg-[#f5f1e6] p-3">{examples.find((example) => example.referenceNote)?.referenceNote ?? 'The available reference does not establish this treatment’s exact qualification. It remains listed under its own profile and the scorer follows the current executable treatment.'}</p>}
      {examples.map((example) => <AtlasExampleVisual key={example.id} example={example} />)}
      {!compact && <SafeScorerAction record={record} examples={examples} />}
      <span className="sr-only">Exact treatment identity: {localTeaching}</span>
    </div>
  </details>;
}

function TreatmentQuickSummary({ record, examples, preferredProfile }: { record: SpecialHandsAtlasRecord; examples: AtlasExample[]; preferredProfile: { id: string; version: string } | null }) {
  const anchorId = treatmentAnchor(record);
  const unresolved = ATLAS_UNRESOLVED_TREATMENTS.has(record.referenceId);
  return <section id={anchorId} className="scroll-mt-24 mt-4 rounded-xl border-2 border-[#284d45] bg-[#edf3ed] p-4" aria-label={`${record.profileTitle} exact treatment`}>
    <div className="font-mono text-xs font-semibold uppercase tracking-[.14em] text-[#477562]">{preferredProfile?.id === record.identity.profile.id && preferredProfile.version === record.identity.profile.version ? 'Your rules' : 'Exact BMJA treatment'} · {record.profileTitle} {record.identity.profile.version}</div>
    <h3 className="mt-1 font-serif text-xl text-[#284d45]">{record.name}</h3>
    <p className="mt-1 text-sm leading-6 text-[#284d45]">{record.description}</p>
    <p className="mt-2 text-sm font-semibold text-[#284d45]">{atlasScoreLabel(record)}</p>
    {qualifierText(record).map((fact) => <p key={fact} className="mt-1 text-sm leading-6 text-[#596b65]">{fact}</p>)}
    {unresolved && <p className="mt-3 rounded-lg border-l-4 border-[#ae6249] bg-[#f5f1e6] p-3 text-sm leading-6 text-[#596b65]">{examples.find((example) => example.referenceNote)?.referenceNote ?? 'The available reference does not establish this treatment’s exact qualification. The scorer follows the current executable treatment.'}</p>}
    <SafeScorerAction record={record} examples={examples} />
  </section>;
}

function EntryCard({
  entry,
  preferredProfile,
  myRules,
}: {
  entry: AtlasLearnerEntry;
  preferredProfile: { id: string; version: string } | null;
  myRules: boolean;
}) {
  const treatments = atlasTreatmentsForEntry(entry);
  const allExamples = examplesForEntry(entry);
  const teaserExample = allExamples[0];
  const teaserVariant = teaserExample && entry.variants?.find((variant) => variant.exampleIds?.includes(teaserExample.id));
  const ownTreatment = preferredProfile && treatments.find(({ identity }) => identity.profile.id === preferredProfile.id && identity.profile.version === preferredProfile.version);
  const legacyTreatment = treatments.find((record) => !!record.href);
  const prominentTreatment = myRules && ownTreatment ? ownTreatment : legacyTreatment;
  const remainingTreatments = prominentTreatment ? treatments.filter(({ referenceId }) => referenceId !== prominentTreatment.referenceId) : treatments;
  const linkedEntries = (entry.relatedEntryIds ?? []).flatMap((id) => {
    const related = ATLAS_LEARNER_ENTRIES.find((item) => item.id === id);
    return related ? [related] : [];
  });

  return <article id={`atlas-entry-${entry.id}`} className="scroll-mt-24 rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] p-4 shadow-[var(--shadow-sm)] sm:p-5">
    <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-3">
      <div className="w-full min-w-0 flex-1 sm:w-auto">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-serif text-2xl leading-tight text-[#284d45]">{entry.displayName}</h2>
          <span className="rounded-full bg-[#efe8da] px-2 py-1 text-xs font-semibold text-[#596b65]">{entry.state === 'reviewed-concept' ? 'Shared concept' : entry.state === 'reviewed-family-topic' ? 'Related variants' : entry.state === 'standalone-unresolved' ? 'Reference note' : 'Exact treatment'}</span>
        </div>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#284d45]">{entry.summary}</p>
        <p className="mt-1 text-sm leading-6 text-[#596b65]">{entry.whatItIs}</p>
      </div>
      <div className="flex w-full max-w-full flex-wrap gap-2 sm:w-auto" aria-label="Profiles with an exact treatment in this entry">
        {[...new Map(treatments.map((record) => [`${record.identity.profile.id}@${record.identity.profile.version}`, record])).values()].map((record) => <span key={record.referenceId} className="rounded-md border border-[#b8cdbf] bg-white px-2 py-1 text-xs font-semibold text-[#284d45]">{record.profileLabel}</span>)}
      </div>
    </div>

    {teaserExample && <AtlasExampleVisual example={teaserExample} title={teaserVariant ? `Example variant: ${teaserVariant.label}` : undefined} />}
    {entry.facets?.length ? <ul className="mt-3 flex flex-wrap gap-2" aria-label="Structural facets">{entry.facets.map((facet) => <li key={facet} className="rounded-full border border-[#b8cdbf] bg-[#edf3ed] px-2.5 py-1 text-xs font-medium text-[#284d45]">{facetName(facet)}</li>)}</ul> : null}

    {prominentTreatment && <TreatmentQuickSummary record={prominentTreatment} examples={allExamples.filter((example) => example.source.type === 'existing-example')} preferredProfile={preferredProfile} />}
    {myRules && preferredProfile && !ownTreatment ? <p className="mt-4 rounded-xl border border-[#dfd5c2] bg-white/70 p-3 text-sm leading-6 text-[#596b65]">This entry has no exact treatment in your remembered rules ({descriptorForRulesProfile(preferredProfile).title}). The general reference is still available here.</p> : null}

    <details className="mt-4 rounded-xl border border-[#dfd5c2] bg-white/55 p-3">
      <summary className="cursor-pointer flex min-h-10 items-center gap-2 font-semibold text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"><BookOpen size={18} aria-hidden="true" /> Learn more about {entry.displayName}</summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <section><h3 className="font-serif text-lg text-[#284d45]">What it means</h3><p className="mt-1 text-sm leading-6 text-[#596b65]">{entry.whatItMeans}</p></section>
        <section><h3 className="font-serif text-lg text-[#284d45]">Why it qualifies</h3><p className="mt-1 text-sm leading-6 text-[#596b65]">{entry.whySpecial}</p></section>
      </div>
      {entry.howItWorks?.length ? <section className="mt-4"><h3 className="font-serif text-lg text-[#284d45]">How it works</h3><ol className="mt-2 list-inside list-decimal space-y-1 text-sm leading-6 text-[#596b65]">{entry.howItWorks.map((step) => <li key={step}>{step}</li>)}</ol></section> : null}
      {entry.watchOutFor?.length ? <section className="mt-4"><h3 className="font-serif text-lg text-[#284d45]">Watch out for</h3><ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-6 text-[#596b65]">{entry.watchOutFor.map((note) => <li key={note}>{note}</li>)}</ul></section> : null}
      {entry.referenceNote && <section className="mt-4 rounded-lg border-l-4 border-[#ae6249] bg-[#f5f1e6] p-3"><h3 className="font-serif text-lg text-[#284d45]">Reference note</h3><p className="mt-1 text-sm leading-6 text-[#596b65]">{entry.referenceNote}</p></section>}
      {entry.localNames?.length ? <p className="mt-4 text-sm leading-6 text-[#596b65]"><strong>Also called:</strong> {entry.localNames.join(' · ')}</p> : null}
      {entry.variants?.length ? <section className="mt-4"><h3 className="font-serif text-lg text-[#284d45]">Related variants</h3><div className="mt-2 space-y-3">{entry.variants.map((variant) => {
        const variantExamples = (variant.exampleIds ?? []).flatMap((id) => { const example = ATLAS_EXAMPLE_BY_ID.get(id); return example ? [example] : []; });
        return <div key={variant.id} className="rounded-lg border border-[#dfd5c2] bg-[#fdfbf5] p-3"><h4 className="font-semibold text-[#284d45]">{variant.label}</h4>{variant.definition && <p className="mt-1 text-sm leading-6 text-[#596b65]">{variant.definition}</p>}{variantExamples.map((example) => <AtlasExampleVisual key={example.id} example={example} />)}</div>;
      })}</div></section> : null}
      {linkedEntries.length ? <section className="mt-4"><h3 className="font-serif text-lg text-[#284d45]">Related hands</h3><ul className="mt-2 flex flex-wrap gap-2">{linkedEntries.map((related) => <li key={related.id}><a className="inline-flex min-h-10 items-center rounded-full border border-[#b8cdbf] bg-white px-3 text-sm font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]" href={`#atlas-entry-${related.id}`}>{related.displayName}</a></li>)}</ul></section> : null}
      {remainingTreatments.length > 0 && <section className="mt-4"><h3 className="mb-2 font-serif text-lg text-[#284d45]">{myRules && ownTreatment ? 'Other rules' : 'How each exact treatment scores'}</h3><div className="space-y-2">{remainingTreatments.map((record) => <TreatmentDetails key={record.referenceId} record={record} examples={examplesForTreatment(entry, record)} preferredProfile={preferredProfile} />)}</div></section>}
      {entry.evidenceBindings?.length ? <details className="mt-4 rounded-lg border border-[#dfd5c2] p-3"><summary className="cursor-pointer text-sm font-semibold text-[#596b65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Sources and evidence</summary><ul className="mt-2 space-y-2 text-xs leading-5 text-[#66746e]">{entry.evidenceBindings.map((binding, index) => <li key={`${binding.path}-${binding.locator}-${index}`}><span className="font-semibold">{binding.status} · {binding.supports.join(', ')}</span><br />{binding.path} · {binding.locator}</li>)}</ul></details> : null}
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
  const profileForFilter = profileFilter === 'all' ? null : CLASSICAL_ATLAS_PROFILES.find(({ id, version }) => `${id}@${version}` === profileFilter) ?? null;

  const results = useMemo(() => {
    let entries = searchAtlasLearnerEntries(ATLAS_LEARNER_ENTRIES, query);
    if (!myRules && profileForFilter) {
      const refs = new Set(SPECIAL_HANDS_ATLAS.filter((record) => record.identity.profile.id === profileForFilter.id && record.identity.profile.version === profileForFilter.version).map(({ referenceId }) => referenceId));
      entries = entries.filter((entry) => entry.treatmentReferenceIds.some((referenceId) => refs.has(referenceId)));
    }
    return filterAtlasEntriesByFacets(entries, selectedFacets);
  }, [myRules, profileForFilter, query, selectedFacets]);

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
    requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: 'start' }));
  }, []);

  const mcrPreference = preferred?.id === 'mcr-wmo-2006' && preferred.version === '0.1';

  return <div className="mahjong-shell">
    <SiteHeader />
    <main className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <ReturnToGame />
      <section className="rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] p-4 shadow-[var(--shadow-sm)] sm:p-8 lg:p-10">
        <div className="mb-3 flex items-center gap-3"><div className="fine-rule w-10" /><span className="font-mono text-xs uppercase tracking-[.18em] text-[#ae6249]">Special Hands Atlas · 146 treatments</span></div>
        <h1 className="max-w-[800px] font-serif text-[clamp(36px,6vw,62px)] leading-[.98] text-[#284d45]">Find a special hand.</h1>
        <p className="mt-4 max-w-[780px] text-base leading-7 text-[#596b65]">Start with the shared idea where the evidence supports it, then see exactly how your rules treat the hand.</p>
        <p className="mt-2 max-w-[780px] text-sm leading-6 text-[#66746e]">Recognise the pattern at a glance; open a result to learn more. Score, exposure and winning details always come from the exact rules treatment.</p>
        {mcrPreference && <p role="status" className="mt-4 rounded-lg bg-[#edf3ed] p-3 text-sm leading-6 text-[#284d45]">Your remembered rules are MCR. This Atlas currently covers supported Classical profiles; choose All rules to browse them.</p>}
        {preferred && !preferredClassical && !mcrPreference && <p role="status" className="mt-4 rounded-lg bg-[#edf3ed] p-3 text-sm leading-6 text-[#284d45]">Your remembered profile has no Classical special-hand catalogue. Choose All rules to browse the supported Classical profiles.</p>}
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Atlas browse mode">
          {preferredClassical && <button type="button" aria-pressed={myRules} onClick={() => { setMyRules(true); setProfileFilter('all'); }} className="min-h-11 rounded-lg border border-[#b8cdbf] px-4 text-sm font-semibold text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">My rules</button>}
          <button type="button" aria-pressed={!myRules} onClick={() => setMyRules(false)} className="min-h-11 rounded-lg border border-[#b8cdbf] px-4 text-sm font-semibold text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">All rules</button>
        </div>
        {myRules && preferredClassical && <p className="mt-3 text-sm font-semibold text-[#284d45]">Priority: {descriptorForRulesProfile(preferredClassical).title} · {preferredClassical.version}. Browsing this Atlas will not change your saved preference.</p>}
        {!myRules && <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by exact rules profile">
          <button type="button" aria-pressed={profileFilter === 'all'} onClick={() => setProfileFilter('all')} className="min-h-10 rounded-lg border border-[#b8cdbf] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">All profiles</button>
          {CLASSICAL_ATLAS_PROFILES.map((profile) => { const descriptor = descriptorForRulesProfile(profile); const key = `${profile.id}@${profile.version}`; return <button key={key} type="button" aria-pressed={profileFilter === key} onClick={() => setProfileFilter(key)} className="min-h-10 rounded-lg border border-[#b8cdbf] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{descriptor.compactLabel}</button>; })}
        </div>}
        <label className="mt-5 block text-sm font-semibold text-[#284d45]" htmlFor="atlas-search">Search names, aliases, exact treatment or pattern</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <div className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#b8cdbf] bg-white px-3 focus-within:ring-2 focus-within:ring-[#ae6249]"><Search size={18} aria-hidden="true" className="shrink-0 text-[#596b65]" /><input id="atlas-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Unique Wonder, Imperial Jade or a treatment ID" className="min-h-11 min-w-0 flex-1 border-0 bg-transparent text-base text-[#284d45] outline-none" /></div>
          {(query || profileFilter !== 'all' || selectedFacets.length > 0) && <button type="button" onClick={clearSearchAndFilter} className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#b8cdbf] px-3 text-sm font-semibold text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Clear filters <X size={16} aria-hidden="true" /></button>}
        </div>
        <section className="mt-5" aria-labelledby="atlas-facets-heading">
          <h2 id="atlas-facets-heading" className="text-sm font-semibold text-[#284d45]">Browse overlapping facets</h2>
          <p className="mt-1 text-xs leading-5 text-[#66746e]">Choose any facet; a learner entry appears only once even when it matches several.</p>
          <div className="mt-2 flex flex-wrap gap-2">{displayFacets.filter(([facet]) => ATLAS_LEARNER_ENTRIES.some((entry) => entry.facets?.includes(facet))).map(([facet, description]) => <button key={facet} type="button" aria-pressed={selectedFacets.includes(facet)} title={description} onClick={() => setSelectedFacets((current) => current.includes(facet) ? current.filter((item) => item !== facet) : [...current, facet])} className={`min-h-10 rounded-full border px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] ${selectedFacets.includes(facet) ? 'border-[#284d45] bg-[#284d45] text-white' : 'border-[#b8cdbf] bg-white text-[#284d45]'}`}>{facetName(facet)}</button>)}</div>
        </section>
        <p className="mt-4 text-sm text-[#596b65]" aria-live="polite">{results.length} {results.length === 1 ? 'learner entry' : 'learner entries'} · all 146 exact treatments remain searchable</p>
        <div className="mt-3 flex gap-3 rounded-xl bg-[#284d45] p-3 text-[#f8f4e9] sm:p-4"><CircleHelp size={20} className="mt-0.5 shrink-0 text-[#d7a287]" aria-hidden="true" /><p className="text-sm leading-6 text-[#d8e3df]">A shared learner explanation does not replace profile rules. Open an exact treatment to see its name, score model and restrictions.</p></div>
      </section>

      <section className="py-5 sm:py-6" aria-label="Atlas learner entries">
        {results.length ? <div className="space-y-3">{results.map((entry) => <EntryCard key={entry.id} entry={entry} preferredProfile={preferredClassical} myRules={myRules} />)}</div> : <div className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-6 text-center"><h2 className="font-serif text-2xl text-[#284d45]">No matching learner entries</h2><p className="mt-2 text-sm text-[#596b65]">Try a local name, treatment ID or a different facet.</p><button type="button" onClick={clearSearchAndFilter} className="mt-4 min-h-11 rounded-lg border border-[#b8cdbf] px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Show all entries</button></div>}
      </section>

      <section className="mb-8 rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] p-4 sm:p-5" id="purity">
        <div className="font-mono text-xs uppercase tracking-[.16em] text-[#ae6249]">Calculated British guidance</div>
        <h2 className="mt-2 font-serif text-2xl text-[#284d45]">Purity</h2>
        <p className="mt-2 text-sm leading-6 text-[#596b65]">One numbered suit only, using Pungs and/or Kongs plus a pair. No Winds, Dragons or Chow. In BMJA scoring, Purity is calculated as three doubles; it is not one of the 18 fixed BMJA Atlas treatments.</p>
        <p className="mt-2 text-sm leading-6 text-[#596b65]">Other profiles may describe calculated Purity differently. Open an exact profile treatment above to see its own rule.</p>
      </section>

      <footer className="border-t border-[#d8ceb8] py-5 text-sm leading-6 text-[#596b65]">
        <p>Independent Mahjong learner reference. Profile and version identify each exact treatment.</p>
        <p className="mt-1">For worked British scoring examples, <a href="/scoring-examples" className="font-semibold underline decoration-[#ae6249] underline-offset-4">visit the scoring guide</a>; to score a hand, <a href="/hand" className="font-semibold underline decoration-[#ae6249] underline-offset-4">open the hand scorer</a>.</p>
      </footer>
    </main>
  </div>;
}
