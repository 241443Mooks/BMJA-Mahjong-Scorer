import { ATLAS_EXAMPLE_BY_ID, ATLAS_LEARNER_ENTRIES, SPECIAL_HANDS_ATLAS, atlasExposureLabel, atlasScoreLabel } from '../guide/special-hands-atlas';
import { AtlasExampleVisual } from '../guide/AtlasExampleVisual';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import { profileDimensionValue, projectProfileDimensions, rulesDimension } from '../rules-platform/profile-dimensions';
import { readGovernedFacts } from './truth/read-contract';
import { currentTruthIndex } from './truth';
import { projectPublicConcept, publicProfiles } from './reference-publication';
import { unresolvedReferenceRelationships, type ReferenceConceptId } from './reference-crosswalk';
import { explainBritishFlowersAndSeasons } from './truth/explain-british-flowers-seasons';
import { BONUS_TILE_DEFINITIONS, tileAssetUrl } from '../tiles/MahjongTileArtwork';
import { BMJA_BONUS_TILE_SCORING } from '../scoring/rules';

export const PUBLIC_CONCEPT_ROUTES: Readonly<Record<string, ReferenceConceptId>> = Object.freeze({
  '/encyclopaedia/thirteen-orphans': 'pattern.thirteen-orphans',
  '/encyclopaedia/imperial-jade': 'pattern.bmja.imperial-jade',
  '/encyclopaedia/wriggling-snake': 'pattern.bmja.wriggling-snake',
});

const conceptLinks = Object.entries(PUBLIC_CONCEPT_ROUTES).map(([href, conceptId]) => ({ href, conceptId }));

const conceptSummaries: Readonly<Record<string, string>> = {
  'pattern.thirteen-orphans': 'A special hand using every terminal and honour tile type, with one tile repeated.',
  'pattern.bmja.imperial-jade': 'A green-tile hand whose permitted groups vary by ruleset.',
  'pattern.bmja.wriggling-snake': 'A special hand built from one suit and all four Winds; the repeated tile can vary by ruleset.',
};

export function EncyclopaediaHubPage() {
  return <main className="mx-auto max-w-5xl px-5 py-10 text-[#253b35]">
    <nav aria-label="Breadcrumb" className="text-sm"><a className="underline" href="/">Mahjong Reference</a> / Encyclopaedia</nav>
    <header className="mt-5 border-b border-[#cbd8d0] pb-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#47695d]">Mahjong Encyclopaedia</p>
      <h1 className="mt-2 font-serif text-4xl text-[#284d45]">Mahjong concepts across rules</h1>
      <p className="mt-4 max-w-3xl text-lg">Learn how these Mahjong hands and scoring ideas work, and how the named rulesets treat them.</p>
      <p className="mt-3 max-w-3xl text-sm">This is a selection of existing entries, not a complete catalogue. Each page keeps its examples and scoring attached to the ruleset they describe.</p>
    </header>
    <section className="mt-8" aria-labelledby="concept-list-heading">
      <h2 id="concept-list-heading" className="font-serif text-2xl text-[#284d45]">Browse the entries</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        <li className="rounded-lg border border-[#cbd8d0] bg-white p-4">
          <h3 className="text-lg font-semibold"><a className="underline underline-offset-4" href="/encyclopaedia/flowers-and-seasons">Flowers and Seasons</a></h3>
          <p className="mt-2 text-sm">How the eight bonus tiles match the Winds and add points and doubles in British Mahjong.</p>
        </li>
        {conceptLinks.map(({ href, conceptId }) => <li key={conceptId} className="rounded-lg border border-[#cbd8d0] bg-white p-4">
          <h3 className="text-lg font-semibold"><a className="underline underline-offset-4" href={href}>{titleFor(conceptId)}</a></h3>
          <p className="mt-2 text-sm">{conceptSummaries[conceptId]}</p>
        </li>)}
        <li className="rounded-lg border border-[#cbd8d0] bg-white p-4">
          <h3 className="text-lg font-semibold"><a className="underline underline-offset-4" href="/encyclopaedia/scoring-systems">Mahjong scoring systems</a></h3>
          <p className="mt-2 text-sm">A plain-language guide to how the listed rulesets build an ordinary hand’s score.</p>
        </li>
      </ul>
    </section>
    {unresolvedReferenceRelationships().map(({ id }) => <p key={id} className="mt-6 text-sm">The relationship between Gates of Heaven and Nine Gates is unresolved; no equivalence is asserted.</p>)}
    <p className="mt-8 text-sm">Looking for the established searchable British and Western hand guide? Visit <a className="font-semibold underline" href="/special-hands">Special Hands</a>.</p>
  </main>;
}

/** Reader page and profile report consume the same exact-profile governed-fact explanation. */
export function FlowersAndSeasonsReferencePage() {
  const explanation = explainBritishFlowersAndSeasons({ id: 'bmja', version: '1.0' });
  if (!explanation.available) return <main className="mx-auto max-w-4xl px-5 py-12"><h1>Flowers and Seasons</h1><p>The source-to-scorer explanation is unavailable because one or more exact-profile evidence links need review.</p></main>;
  const winds = ['east', 'south', 'west', 'north'] as const;
  const windNames = { east: 'East', south: 'South', west: 'West', north: 'North' } as const;
  const publishedSource = explanation.sourceFacts[0]?.source;
  return <main className="mx-auto max-w-4xl px-5 py-10 text-[#253b35]">
    <nav aria-label="Breadcrumb" className="text-sm"><a className="underline" href="/encyclopaedia">Encyclopaedia</a> / <a className="underline" href="/rules/british">British Mahjong</a></nav>
    <header className="mt-5 border-b border-[#cbd8d0] pb-6"><p className="text-sm font-semibold uppercase tracking-wide text-[#47695d]">British Mahjong · BMJA 1.0</p><h1 className="mt-2 font-serif text-4xl text-[#284d45]">{explanation.title}</h1><p className="mt-4 max-w-3xl text-lg leading-8">Flowers and Seasons are bonus tiles. Each tile number matches a seat: 1 is East, 2 South, 3 West and 4 North.</p><p className="mt-3 max-w-3xl text-sm leading-6">{explanation.summary}</p></header>
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

const editorialEntries: Readonly<Record<string, string>> = {
  'pattern.thirteen-orphans': 'thirteen-unique-wonders',
  'pattern.bmja.imperial-jade': 'imperial-jade',
  'pattern.bmja.wriggling-snake': 'wriggling-snake-family',
};

const titleFor = (conceptId: string) => editorialEntries[conceptId]
  ? ATLAS_LEARNER_ENTRIES.find(({ id }) => id === editorialEntries[conceptId])?.displayName ?? conceptId
  : conceptId;

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
  const concept = projectPublicConcept({ conceptId, presentTreatment: treatmentPresentation });
  if (!concept) return <main className="mx-auto max-w-4xl px-5 py-12"><h1>Reference unavailable</h1></main>;
  const entryId = editorialEntries[conceptId];
  const entry = entryId ? ATLAS_LEARNER_ENTRIES.find(({ id }) => id === entryId) : undefined;
  const example = entry?.exampleIds?.map((id) => ATLAS_EXAMPLE_BY_ID.get(id)).find((candidate) => candidate !== undefined);

  return <main className="mx-auto max-w-4xl px-5 py-10 text-[#253b35]">
    <nav aria-label="Breadcrumb" className="text-sm"><a className="underline" href="/">Mahjong Reference</a> / <a className="underline" href="/encyclopaedia">Encyclopaedia</a></nav>
    <header className="mt-5 border-b border-[#cbd8d0] pb-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#47695d]">Special hand</p>
      <h1 className="mt-2 font-serif text-4xl text-[#284d45]">{titleFor(conceptId)}</h1>
      {entry ? <p className="mt-4 max-w-3xl text-lg">{entry.whatItIs}</p> : <p className="mt-4 max-w-3xl text-lg">{rulesDimension('scoring.grammar').label} is the way a ruleset counts and combines points when scoring a hand.</p>}
      {entry?.whatItMeans ? <p className="mt-3 max-w-3xl">{entry.whatItMeans}</p> : null}
    </header>

    {example ? <section className="mt-8" aria-labelledby="example-heading"><h2 id="example-heading" className="mb-3 font-serif text-2xl text-[#284d45]">What it looks like</h2><AtlasExampleVisual example={example} /></section> : null}

    {entry?.howItWorks?.length ? <section className="mt-8" aria-labelledby="requirements-heading">
      <h2 id="requirements-heading" className="font-serif text-2xl text-[#284d45]">How to make the hand</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">{entry.howItWorks.map((step) => <li key={step}>{step}</li>)}</ol>
      {entry.watchOutFor?.length ? <div className="mt-4 rounded-lg bg-[#f5f8f5] p-4"><h3 className="font-semibold">Check this carefully</h3><ul className="mt-2 list-disc space-y-1 pl-5">{entry.watchOutFor.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
    </section> : null}

    {entry?.variants?.length ? <section className="mt-8" aria-labelledby="forms-heading">
      <h2 id="forms-heading" className="font-serif text-2xl text-[#284d45]">How the forms differ</h2>
      <p className="mt-2 text-sm">Related names do not always mean the same hand. Each form stays tied to its own rules.</p>
      <ul className="mt-4 grid gap-4">{entry.variants.map((variant) => {
        const variantExamples = variant.exampleIds?.map((id) => ATLAS_EXAMPLE_BY_ID.get(id)).filter((candidate) => candidate !== undefined) ?? [];
        return <li key={variant.id} className="rounded-lg border border-[#cbd8d0] bg-white p-4">
          <h3 className="font-semibold">{variant.label}</h3>
          {variant.definition ? <p className="mt-2 text-sm leading-6">{variant.definition}</p> : null}
          {variantExamples.map((variantExample) => <div key={variantExample.id} className="mt-4"><AtlasExampleVisual example={variantExample} /></div>)}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">{variant.treatmentReferenceIds?.map((id) => SPECIAL_HANDS_ATLAS.find((record) => record.referenceId === id)).filter((record, index, all): record is NonNullable<typeof record> => !!record?.href && all.findIndex((candidate) => candidate?.href === record.href) === index).map((record) => <a key={record.href} className="text-sm underline" href={record.href}>Open {record.profileLabel} treatment in Special Hands</a>)}</div>
        </li>;
      })}</ul>
    </section> : null}

    <section id="treatments" className="mt-8" aria-labelledby="treatments-heading">
      <h2 id="treatments-heading" className="font-serif text-2xl text-[#284d45]">How each ruleset scores it</h2>
      {concept.treatments.length ? <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {concept.treatments.map(({ treatmentId, presentation }) => <PublicTreatmentCard key={treatmentId} treatmentId={treatmentId} presentation={presentation} />)}
      </ul> : <p className="mt-3">No profile treatments are currently published for this concept.</p>}
    </section>

    {entry?.localNames?.length ? <section className="mt-6" aria-labelledby="names-heading">
      <h2 id="names-heading" className="font-serif text-xl text-[#284d45]">Names used in the Special Hands guide</h2>
      <ul className="mt-2 flex flex-wrap gap-2">{entry.localNames.map((name) => <li key={name} className="rounded-full bg-[#edf3ed] px-3 py-1 text-sm">{name}</li>)}</ul>
    </section> : null}

    {concept.relationships.length ? <section className="mt-8" aria-labelledby="relationships-heading">
      <h2 id="relationships-heading" className="font-serif text-2xl text-[#284d45]">Reviewed relationships</h2>
      <ul className="mt-3 list-disc pl-5">{concept.relationships.map(({ id, kind }) => <li key={id}>{kind.replaceAll('-', ' ')}</li>)}</ul>
    </section> : null}
  </main>;
}

export function PublicScoringConceptPage() {
  const dimension = rulesDimension('scoring.grammar');
  const rows = publicProfiles().flatMap((profile) => {
    const descriptor = PUBLIC_RULES_DESCRIPTORS.find(({ profile: candidate }) => candidate.id === profile.id && candidate.version === profile.version);
    if (!descriptor) return [];
    const values = projectProfileDimensions(getCurrentCompiledRulesRuntime(profile).artifact);
    const projected = profileDimensionValue(values, dimension.id);
    return projected ? [{ descriptor, projected }] : [];
  });
  return <main className="mx-auto max-w-4xl px-5 py-10 text-[#253b35]">
    <nav aria-label="Breadcrumb" className="text-sm"><a className="underline" href="/">Mahjong Reference</a> / <a className="underline" href="/encyclopaedia">Encyclopaedia</a></nav>
    <header id={dimension.id} className="mt-5 border-b border-[#cbd8d0] pb-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#47695d]">Scoring guide</p>
      <h1 className="mt-2 font-serif text-4xl text-[#284d45]">{dimension.label}</h1>
      <p className="mt-4 max-w-3xl">A ruleset first awards points for the hand, then applies any doubles that hand qualifies for. Each profile has its own rules for which hands score and when doubles apply.</p>
    </header>
    <section className="mt-8" aria-labelledby="profile-scoring-heading">
      <h2 id="profile-scoring-heading" className="font-serif text-2xl text-[#284d45]">How the listed rulesets score ordinary hands</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">{rows.map(({ descriptor, projected }) => <li id={`profile-${descriptor.profile.id}-${descriptor.profile.version}`} key={`${descriptor.profile.id}@${descriptor.profile.version}`} className="scroll-mt-24 rounded-lg border border-[#cbd8d0] bg-white p-4">
        <p className="font-semibold">{descriptor.compactLabel}</p><p className="mt-1">{projected.displayValue}</p>
        {descriptor.availability.handScorer ? <a className="mt-3 inline-block underline" href={`/hand?rules=${descriptor.slug}`}>Open this profile’s hand scorer</a> : null}
        <details className="mt-3"><summary className="cursor-pointer font-medium">Sources and checking</summary><p className="mt-2 text-sm">{friendlySourceStatus(projected.sourceStatus)}</p><ul className="mt-1 list-disc break-all pl-5 text-sm">{projected.provenanceIds.map((id) => <li key={id}>{id}</li>)}</ul></details>
      </li>)}</ul>
    </section>
  </main>;
}
