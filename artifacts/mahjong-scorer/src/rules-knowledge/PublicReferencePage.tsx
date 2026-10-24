import { readerSurfaceLinks, sameReaderProfile } from '../guide/reader-content';
import { FLOWERS_REFERENCE_TOPIC, hasPublishedSpecialHands, availableReferenceTopics, learningTopicDestination, projectReferenceTopic, referenceTopic, referenceTopicEntry, referenceTopicProfiles, type ReferenceTopic } from './reference-topics';
import type { RulesDescriptor } from '../game/rules-presentation';
import { ReaderRulesControl, readerHref, useReaderRules } from '../guide/ReaderRulesContext';
import { atlasExampleProvesTreatment } from '../guide/atlas-scorer-handoff';
import { SPECIAL_HANDS_ATLAS, atlasExposureLabel, atlasScoreLabel, atlasExamplesForTreatment } from '../guide/special-hands-atlas';
import { AtlasExampleVisual } from '../guide/AtlasExampleVisual';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import { profileDimensionValue, projectProfileDimensions, rulesDimension } from '../rules-platform/profile-dimensions';
import { readGovernedFacts } from './truth/read-contract';
import { currentTruthIndex } from './truth';
import { projectPublicConcept } from './reference-publication';
import { unresolvedReferenceRelationships, type ReferenceConceptId } from './reference-crosswalk';
import { explainBritishFlowersAndSeasons } from './truth/explain-british-flowers-seasons';
import { BONUS_TILE_DEFINITIONS, tileAssetUrl } from '../tiles/MahjongTileArtwork';
import { BMJA_BONUS_TILE_SCORING } from '../scoring/rules';

export function EncyclopaediaHubPage() {
  const reader = useReaderRules();
  const selected = reader.ready ? reader.selected : null;
  const entries = availableReferenceTopics(selected);
  return <main className="mx-auto max-w-5xl px-5 py-10 text-[#253b35]">
    <nav aria-label="Breadcrumb" className="text-sm"><a className="underline" href="/">Mahjong Reference</a> / Encyclopaedia</nav>
    <header className="mt-5 border-b border-[#cbd8d0] pb-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#47695d]">Mahjong Encyclopaedia</p>
      <h1 className="mt-2 font-serif text-4xl text-[#284d45]">Mahjong concepts across rules</h1>
      <p className="mt-4 max-w-3xl text-lg">Find useful explanations, scoring guides and published hand treatments for the rules you play.</p>
      <p className="mt-3 max-w-3xl text-sm">This is a selection of published reading. Each article keeps its scoring and examples attached to the rules it describes.</p>
    </header>
    <ReaderRulesControl />
    <section className="mt-8" aria-labelledby="concept-list-heading">
      <h2 id="concept-list-heading" className="font-serif text-2xl text-[#284d45]">{selected ? `Reading for ${selected.compactLabel}` : 'Browse published articles across rules'}</h2>
      {entries.length ? <ul className="mt-4 grid gap-4 sm:grid-cols-2">{entries.map(({ topic, destination }) => <li key={topic.id} className="rounded-lg border border-[#cbd8d0] bg-white p-4">
        <h3 className="text-lg font-semibold"><a className="inline-block py-2 underline underline-offset-4" href={destination.href}>{topic.title}</a></h3>
        <p className="mt-2 text-sm">{destination.kind === 'guide' ? `Read the available explanation in the ${selected!.compactLabel} scoring guide.` : topic.summary}</p>
        {destination.kind === 'guide' && <p className="mt-2 text-sm font-semibold">Scoring guide</p>}
      </li>)}</ul> : <p className="mt-4">Start with <a className="underline" href={selected ? readerSurfaceLinks(selected).reference : '/rules'}>the rules reference</a>, or <a className="underline" href="?rules=all">explore published articles across all rules</a>.</p>}
    </section>
    {!selected && unresolvedReferenceRelationships().map(({ id }) => <p key={id} className="mt-6 text-sm">The relationship between Gates of Heaven and Nine Gates is unresolved; no equivalence is asserted.</p>)}
    {(!selected || hasPublishedSpecialHands(selected.profile)) && <p className="mt-8 text-sm">Browse the searchable <a className="font-semibold underline" href={readerHref('/special-hands', selected)}>Special Hands guide</a>.</p>}
  </main>;
}

function ArticleScopeNote({ topic, selected }: { topic: ReferenceTopic; selected: RulesDescriptor | null }) {
  if (!selected || projectReferenceTopic(topic, selected).publication === 'published') return null;
  const reading = referenceTopicProfiles(topic).map(({ compactLabel }) => compactLabel).join(', ');
  const coverage = projectReferenceTopic(topic, selected);
  const guideHref = coverage.destination?.kind === 'guide' ? coverage.destination.href : readerSurfaceLinks(selected).scoring;
  return <p className="my-4 text-sm leading-6">This published article describes {reading}. <a className="inline-block py-2 font-semibold underline" href={guideHref}>Continue with the {selected.compactLabel} scoring guide</a>.</p>;
}

/** Reader page and profile report consume the same exact-profile governed-fact explanation. */
export function FlowersAndSeasonsReferencePage() {
  const reader = useReaderRules();
  const topic = FLOWERS_REFERENCE_TOPIC;
  const articleProfile = topic.knowledge.article.profile;
  const explanation = explainBritishFlowersAndSeasons(articleProfile);
  if (!explanation.available) return <main className="mx-auto max-w-4xl px-5 py-12"><h1>Flowers and Seasons</h1><p>The source-to-scorer explanation is unavailable because one or more exact-profile evidence links need review.</p></main>;
  const winds = ['east', 'south', 'west', 'north'] as const;
  const windNames = { east: 'East', south: 'South', west: 'West', north: 'North' } as const;
  const publishedSource = explanation.sourceFacts[0]?.source;
  return <main className="mx-auto max-w-4xl px-5 py-10 text-[#253b35]">
    <nav aria-label="Breadcrumb" className="text-sm"><a className="underline" href="/encyclopaedia">Encyclopaedia</a> / <a className="underline" href="/rules/british">British Mahjong</a></nav>
    <header className="mt-5 border-b border-[#cbd8d0] pb-6"><p className="text-sm font-semibold uppercase tracking-wide text-[#47695d]">British Mahjong · BMJA 1.0</p><h1 className="mt-2 font-serif text-4xl text-[#284d45]">{explanation.title}</h1><p className="mt-4 max-w-3xl text-lg leading-8">Flowers and Seasons are bonus tiles. Each tile number matches a seat: 1 is East, 2 South, 3 West and 4 North.</p><p className="mt-3 max-w-3xl text-sm leading-6">{explanation.summary}</p></header>
    <ReaderRulesControl readingLabel={referenceTopicProfiles(topic).map(({ compactLabel }) => compactLabel).join(', ')} myRulesHref={readerHref('/encyclopaedia', reader.saved)} />
    <ArticleScopeNote topic={topic} selected={reader.selected} />
    <section className="mt-7" aria-labelledby="matching-tiles"><h2 id="matching-tiles" className="font-serif text-2xl text-[#284d45]">The eight bonus tiles</h2><p className="mt-2 text-sm leading-6">Find the tile number that matches your seat.</p><ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{winds.map((wind) => {
      const matchingTiles = BONUS_TILE_DEFINITIONS.filter((tile) => tile.wind === wind);
      return <li key={wind} className="rounded-lg border border-[#cbd8d0] bg-white p-3 text-center">
        <h3 className="mb-3 font-semibold text-[#284d45]">{windNames[wind]}</h3>
        <div className="flex justify-center gap-3">{matchingTiles.map((tile) => <figure key={tile.asset} className="min-w-0">
          <img src={tileAssetUrl(tile.asset)} alt={`${tile.family === 'flower' ? 'Flower' : 'Season'} ${tile.number}, ${tile.name}`} className="mx-auto h-16 w-12 rounded bg-[#fffdf7] object-contain shadow-sm sm:h-[72px] sm:w-[54px]" />
          <figcaption className="mt-1 text-xs leading-4">{tile.family === 'flower' ? 'Flower' : 'Season'} {tile.number}<br />{tile.name}</figcaption>
        </figure>)}</div>
      </li>;
    })}</ul></section>
    <section className="mt-8" aria-labelledby="flower-behaviour"><h2 id="flower-behaviour" className="font-serif text-2xl text-[#284d45]">How they are scored</h2><p className="mt-2 text-sm leading-6">A double multiplies the score it applies to by two.</p><ul className="mt-4 space-y-3">{explanation.scorerBehaviour.map((text, index) => <li className="rounded-lg border border-[#cbd8d0] bg-white p-4" key={index}><h3 className="font-semibold">{['Ordinary hands', 'Fixed special hands', 'Fishing'][index]}</h3><p className="mt-1 text-sm leading-6">{text}</p></li>)}</ul></section>
    <section className="mt-6 rounded-lg border border-[#cbd8d0] bg-[#f5f8f5] p-4" aria-labelledby="flower-example"><h2 id="flower-example" className="font-serif text-xl text-[#284d45]">A quick example</h2><p className="mt-2 text-sm leading-6">A South player’s Flower 2 (Orchid) adds {BMJA_BONUS_TILE_SCORING.pointsEach} points and gives {BMJA_BONUS_TILE_SCORING.ownTileDoubles} double. Four Seasons add {BMJA_BONUS_TILE_SCORING.pointsEach * BMJA_BONUS_TILE_SCORING.completeSetSize} points and give {BMJA_BONUS_TILE_SCORING.completeSetDoubles} doubles in total{BMJA_BONUS_TILE_SCORING.completeSetIncludesOwnTile ? '; Summer, the South-matching Season 2, is already included in those doubles.' : '; the matching Season 2 double is counted separately.'}</p></section>
    <section className="mt-8 rounded-lg border border-[#cbd8d0] bg-white p-4" aria-labelledby="flower-sources"><h2 id="flower-sources" className="font-serif text-xl text-[#284d45]">Where these rules come from</h2><p className="mt-2 text-sm leading-6">The published British rules set out the points for each Flower and Season, the matching-Wind double and the complete-set doubles. The calculator uses those points and doubles: in an ordinary hand they apply to the full hand score; for fixed special hands and Fishing, bonus points are kept separate and eligible doubles apply to that bonus score.</p>{publishedSource ? <p className="mt-3 text-sm">Published source: {publishedSource.citation} — {publishedSource.locator.url ? <a className="font-semibold underline underline-offset-2" href={publishedSource.locator.url} target="_blank" rel="noreferrer">{publishedSource.locator.label}</a> : publishedSource.locator.label}.</p> : null}<p className="mt-2 text-sm"><strong>Published-rule difference:</strong> the guide says bonus-tile doubles on fixed special hands apply only when the special hand is below 1,000 points. The calculator still shows eligible bonus doubles in the breakdown, then caps the total at 1,000. So a special hand already worth 1,000 can show bonus points in its breakdown without increasing the final score.</p></section>
  </main>;
}

export function PublicTreatmentCard({ treatmentId, presentation }: {
  treatmentId: string;
  presentation: { name: string; profile: string; scorerHref?: string; value: string; description: string; exposure?: string; winningMethod?: string };
}) {
  const sources = sourceDetails(treatmentId);
  return <li id={treatmentId} className="scroll-mt-24 rounded-lg border border-[#cbd8d0] bg-white p-4">
    <p className="text-sm font-semibold text-[#47695d]">{presentation.profile}</p>
    <h3 className="mt-1 text-lg font-semibold">{presentation.name}</h3>
    <p className="mt-2 text-sm">{presentation.description}</p>
    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
      <div><dt className="font-semibold">Score</dt><dd>{presentation.value}</dd></div>
      {presentation.exposure ? <div><dt className="font-semibold">Exposure</dt><dd>{presentation.exposure}</dd></div> : null}
      {presentation.winningMethod ? <div><dt className="font-semibold">Winning method</dt><dd>{presentation.winningMethod}</dd></div> : null}
    </dl>
    {presentation.scorerHref ? <a className="mt-3 inline-block underline" href={presentation.scorerHref}>Open this profile’s hand scorer</a> : null}
    <details className="mt-3">
      <summary className="cursor-pointer font-medium">Sources and checking</summary>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
        {sources.map(({ claim, citation, locator, status }, index) => <li key={`${treatmentId}:${index}`}>
          <span>{claim}</span> <span>{friendlySourceStatus(status)}; {citation}; {locator.label}</span>{locator.url ? <a className="ml-1 underline" href={locator.url} target="_blank" rel="noreferrer">Open source</a> : null}
        </li>)}
        {!sources.length ? <li>No linked source claim is available for this treatment.</li> : null}
      </ul>
    </details>
  </li>;
}

function friendlySourceStatus(status: string) {
  if (status === 'verified' || status === 'source-verified' || status === 'source-certified') return 'Checked against a published source';
  if (status === 'verified-club') return 'Checked against the club rules';
  if (status === 'source-provisional') return 'Source basis remains provisional';
  if (status === 'needs-primary-source') return 'A primary source is still needed';
  if (status === 'needs-club-confirmation') return 'Club confirmation is still needed';
  if (status === 'secondary-only') return 'Only a secondary source is linked';
  if (status === 'conflict' || status === 'source-conflict') return 'Sources conflict';
  if (status === 'source-unknown' || status === 'unknown') return 'Source is not established';
  if (status === 'not-applicable') return 'Not applicable';
  if (status === 'reviewed') return 'Reviewed';
  return 'Review status recorded';
}

function treatmentPresentation(treatment: { treatmentId: string; profile: { id: string; version: string } }) {
  const local = SPECIAL_HANDS_ATLAS.find(({ referenceId }) => referenceId === treatment.treatmentId);
  const descriptor = PUBLIC_RULES_DESCRIPTORS.find(({ profile }) =>
    profile.id === treatment.profile.id && profile.version === treatment.profile.version);
  if (!local || !descriptor) return undefined;
  return {
    name: local.name,
    profile: descriptor.compactLabel,
    scorerHref: descriptor.availability.handScorer ? `/hand?rules=${descriptor.slug}` : undefined,
    description: local.description,
    value: atlasScoreLabel(local),
    exposure: atlasExposureLabel(local),
    winningMethod: local.winningMethods?.map((method) => method.replaceAll('-', ' ')).join(' or '),
  };
}

function sourceDetails(treatmentId: string) {
  const treatment = currentTruthIndex.treatmentById(treatmentId)?.record;
  if (!treatment) return [];
  return readGovernedFacts(treatment.profile).find(({ subject }) => subject.id === treatment.subjectId)?.claims.map((claim) => ({
    claim: claim.text,
    status: claim.status,
    citation: claim.source?.citation ?? 'Source not connected',
    locator: claim.source?.locator ?? { label: 'Source locator unavailable' },
  })) ?? [];
}

export function PublicReferencePage({ conceptId }: { conceptId: ReferenceConceptId }) {
  const reader = useReaderRules();
  const concept = projectPublicConcept({ conceptId, presentTreatment: treatmentPresentation });
  if (!concept) return <main className="mx-auto max-w-4xl px-5 py-12"><h1>Reference unavailable</h1></main>;
  const topic = referenceTopic(conceptId);
  const entry = referenceTopicEntry(topic);
  const own = reader.selected ? concept.treatments.filter(({ profile }) => profile.id === reader.selected!.profile.id && profile.version === reader.selected!.profile.version) : [];
  const visible = own.length ? own : concept.treatments;
  const others = concept.treatments.filter((treatment) => !visible.includes(treatment));
  const relevantVariants = entry?.variants?.filter((variant) => !own.length || variant.treatmentReferenceIds?.some((id) => own.some(({ treatmentId }) => treatmentId === id)));
  const readingLabel = [...new Set(visible.map(({ presentation }) => presentation.profile))].join(', ');
  // An illustration is evidence about an exact treatment, never a generic picture
  // picked from a similarly named family (Imperial Jade and Snake have variants).
  const examples = entry ? [...new Map(visible.flatMap(({ treatmentId }) => atlasExamplesForTreatment(entry, treatmentId)
    .filter(({ id }) => atlasExampleProvesTreatment(id, treatmentId))).map((example) => [example.id, example])).values()] : [];
  return <main className="mx-auto max-w-4xl px-5 py-10 text-[#253b35]">
    <nav aria-label="Breadcrumb" className="text-sm"><a className="underline" href="/">Mahjong Reference</a> / <a className="underline" href={readerHref('/encyclopaedia', reader.selected)}>Encyclopaedia</a></nav>
    <header className="mt-5 border-b border-[#cbd8d0] pb-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#47695d]">Special hand</p>
      <h1 className="mt-2 font-serif text-4xl text-[#284d45]">{topic.title}</h1>
      <h2 className="mt-5 font-serif text-2xl">What it is</h2><p className="mt-3 text-lg">{topic.summary}</p>
    </header>
    <ReaderRulesControl readingLabel={readingLabel} myRulesHref={readerHref('/encyclopaedia', reader.saved)} />
    <ArticleScopeNote topic={topic} selected={reader.selected} />
    <>
      {visible.length > 0 && <section id="treatments" className="mt-8" aria-labelledby="treatments-heading">
        <h2 id="treatments-heading" className="font-serif text-2xl text-[#284d45]">{own.length ? 'How it works for these rules' : 'Published treatments across rules'}</h2>
        {own.length > 0 && <p className="mt-2 font-semibold">{reader.selected!.title}</p>}
        {visible.length ? <ul className="mt-4 grid gap-4">{visible.map(({ treatmentId, presentation }) => <PublicTreatmentCard key={treatmentId} treatmentId={treatmentId} presentation={presentation} />)}</ul> : null}
      </section>}
      {examples.length ? <section className="mt-8" aria-labelledby="example-heading"><h2 id="example-heading" className="mb-3 font-serif text-2xl text-[#284d45]">Tile examples</h2>{examples.map((example) => <AtlasExampleVisual key={example.id} example={example} />)}</section> : null}
      {!own.length && entry?.howItWorks?.length ? <section className="mt-8"><h2 className="font-serif text-2xl">How to make the hand</h2><p className="mt-2">An overview across the listed forms; check the exact treatment above.</p><ol className="mt-3 list-decimal space-y-2 pl-5">{entry.howItWorks.map((step) => <li key={step}>{step}</li>)}</ol></section> : null}
      <section className="mt-8" aria-labelledby="other-rules"><h2 id="other-rules" className="font-serif text-2xl">Other rules</h2>
        {reader.selected && others.length > 0 && <details className="mt-3"><summary className="cursor-pointer py-2 underline">Explore {others.length} other published treatments</summary><ul className="mt-3 grid gap-4">{others.map(({ treatmentId, presentation }) => <PublicTreatmentCard key={treatmentId} treatmentId={treatmentId} presentation={presentation} />)}</ul></details>}
        <p className="mt-3"><a className="inline-block py-2 underline" href="?rules=all">Explore all published rules</a></p>
        {relevantVariants?.length ? <details className="mt-3"><summary className="cursor-pointer py-2 font-semibold">How the forms differ</summary><p className="mt-2 text-sm">Related names do not always mean the same hand. These are cross-profile forms, not additional requirements for My rules.</p><ul className="mt-3 space-y-4">{relevantVariants.map((variant) => <li key={variant.id}><h3 className="font-semibold">{variant.label}</h3><p className="mt-1 text-sm">{variant.definition}</p><div className="mt-2 flex flex-wrap gap-3">{variant.treatmentReferenceIds?.flatMap((id) => { const record = SPECIAL_HANDS_ATLAS.find((item) => item.referenceId === id); return record?.href ? [<a key={id} className="py-2 text-sm underline" href={record.href}>Open {record.profileLabel} treatment in Special Hands</a>] : []; })}</div></li>)}</ul></details> : null}
      </section>
      <section className="mt-8"><h2 className="font-serif text-2xl">Sources</h2><p className="mt-2">Open “Sources and checking” on each treatment for its published source, locator and review status. Unreviewed or withheld treatments are not substituted from another profile.</p></section>
      {concept.relationships.length ? <section className="mt-8"><h2 className="font-serif text-2xl">Reviewed relationships</h2><ul className="mt-3 list-disc pl-5">{concept.relationships.map(({ id, kind }) => <li key={id}>{kind.replaceAll('-', ' ')}</li>)}</ul></section> : null}
    </>
  </main>;
}

export function PublicScoringConceptPage() {
  const reader = useReaderRules();
  const dimension = rulesDimension('scoring.grammar');
  const rows = referenceTopicProfiles(referenceTopic('dimension:scoring.grammar')).flatMap((descriptor) => {
    const profile = descriptor.profile;
    const values = projectProfileDimensions(getCurrentCompiledRulesRuntime(profile).artifact);
    const projected = profileDimensionValue(values, dimension.id);
    return projected ? [{ descriptor, projected }] : [];
  });
  return <main className="mx-auto max-w-4xl px-5 py-10 text-[#253b35]">
    <nav aria-label="Breadcrumb" className="text-sm"><a className="underline" href="/">Mahjong Reference</a> / <a className="underline" href="/encyclopaedia">Encyclopaedia</a></nav>
    <header id={dimension.id} className="mt-5 border-b border-[#cbd8d0] pb-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#47695d]">Scoring guide</p>
      <h1 className="mt-2 font-serif text-4xl text-[#284d45]">{dimension.label}</h1>
      <p className="mt-4 max-w-3xl">Classical profiles use points and doubles. MCR uses fan patterns, with an 8-point qualifying minimum before Flowers. Each profile keeps its own scoring rules and source status.</p>
    </header>
    <ReaderRulesControl />
    <section className="mt-8" aria-labelledby="profile-scoring-heading">
      <h2 id="profile-scoring-heading" className="font-serif text-2xl text-[#284d45]">How the listed rulesets score ordinary hands</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">{rows.filter(({ descriptor }) => !reader.ready || !reader.selected || sameReaderProfile(descriptor.profile, reader.selected.profile)).map(({ descriptor, projected }) => <li id={`profile-${descriptor.profile.id}-${descriptor.profile.version}`} key={`${descriptor.profile.id}@${descriptor.profile.version}`} className="scroll-mt-24 rounded-lg border border-[#cbd8d0] bg-white p-4">
        <p className="font-semibold">{descriptor.compactLabel}</p><p className="mt-1">{projected.playerAnswer ?? (projected.value.status === 'present' && projected.value.data === 'pattern-accumulator' ? 'Fan-pattern scoring; Flowers are added after qualification.' : 'Points and doubles; see the scoped scoring guide for source limits.')}</p>
        {descriptor.availability.handScorer ? <a className="mt-3 inline-block underline" href={`/hand?rules=${descriptor.slug}`}>Open this profile’s hand scorer</a> : null}
        <details className="mt-3"><summary className="cursor-pointer font-medium">Sources and checking</summary><p className="mt-2 text-sm">{friendlySourceStatus(projected.sourceStatus)}</p><ul className="mt-1 list-disc break-all pl-5 text-sm">{projected.provenanceIds.map((id) => <li key={id}>{id}</li>)}</ul></details>
      </li>)}</ul>
      {reader.selected && <p className="mt-4"><a className="inline-block py-2 font-semibold underline" href={learningTopicDestination(reader.selected, 'scoring.grammar') ?? readerSurfaceLinks(reader.selected).scoring}>Read the {reader.selected.compactLabel} scoring guide</a></p>}
      {reader.selected && <p className="mt-3"><a className="inline-block py-2 underline" href="?rules=all">Explore scoring across all rules</a></p>}
    </section>
  </main>;
}
