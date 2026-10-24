import { ATLAS_EXAMPLE_BY_ID, ATLAS_LEARNER_ENTRIES, SPECIAL_HANDS_ATLAS, atlasExposureLabel, atlasScoreLabel } from '../guide/special-hands-atlas';
import { AtlasExampleVisual } from '../guide/AtlasExampleVisual';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import { profileDimensionValue, projectProfileDimensions, rulesDimension } from '../rules-platform/profile-dimensions';
import { readGovernedFacts } from './truth/read-contract';
import { publicDimensionConcepts, projectPublicConcept, publicProfiles } from './reference-publication';
import { unresolvedReferenceRelationships, type ReferenceConceptId } from './reference-crosswalk';

export const PUBLIC_CONCEPT_ROUTES: Readonly<Record<string, ReferenceConceptId>> = Object.freeze({
  '/encyclopaedia/thirteen-orphans': 'pattern.thirteen-orphans',
  '/encyclopaedia/imperial-jade': 'pattern.bmja.imperial-jade',
  '/encyclopaedia/wriggling-snake': 'pattern.bmja.wriggling-snake',
});

const conceptLinks = Object.entries(PUBLIC_CONCEPT_ROUTES).map(([href, conceptId]) => ({ href, conceptId }));

export function EncyclopaediaHubPage() {
  return <main className="mx-auto max-w-5xl px-5 py-10 text-[#253b35]">
    <nav aria-label="Breadcrumb" className="text-sm"><a className="underline" href="/">Mahjong Reference</a> / Encyclopaedia</nav>
    <header className="mt-5 border-b border-[#cbd8d0] pb-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#47695d]">Mahjong Encyclopaedia</p>
      <h1 className="mt-2 font-serif text-4xl text-[#284d45]">Mahjong concepts across rules</h1>
      <p className="mt-4 max-w-3xl text-lg">Explore a small set of source-backed concepts and see how supported rules treat them. Names, requirements and scoring stay attached to their own profile.</p>
      <p className="mt-3 max-w-3xl text-sm">This is a growing reference, not a complete catalogue. Each entry links to the evidence and, where available, the matching hand scorer.</p>
    </header>
    <section className="mt-8" aria-labelledby="concept-list-heading">
      <h2 id="concept-list-heading" className="font-serif text-2xl text-[#284d45]">Browse concepts</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {conceptLinks.map(({ href, conceptId }) => <li key={conceptId} className="rounded-lg border border-[#cbd8d0] bg-white p-4">
          <h3 className="text-lg font-semibold"><a className="underline underline-offset-4" href={href}>{titleFor(conceptId)}</a></h3>
          <p className="mt-2 text-sm">{conceptId === 'pattern.thirteen-orphans' ? 'An irregular hand made from the thirteen terminal and honour tile types, plus one duplicate.' : conceptId === 'pattern.bmja.imperial-jade' ? 'A green-tile hand whose exact permitted groups depend on the profile.' : 'A profile-specific irregular hand built from one suit and the four Winds.'}</p>
        </li>)}
        <li className="rounded-lg border border-[#cbd8d0] bg-white p-4">
          <h3 className="text-lg font-semibold"><a className="underline underline-offset-4" href="/encyclopaedia/scoring-systems">Mahjong scoring systems</a></h3>
          <p className="mt-2 text-sm">See the scoring grammar each published profile uses, projected from shared rules dimensions.</p>
        </li>
      </ul>
    </section>
    <section className="mt-8 rounded-lg border border-[#cbd8d0] bg-[#f5f8f5] p-4" aria-labelledby="unresolved-heading">
      <h2 id="unresolved-heading" className="font-serif text-xl text-[#284d45]">Open questions</h2>
      {unresolvedReferenceRelationships().map(({ id }) => <p key={id} className="mt-2 text-sm">The relationship between Gates of Heaven and Nine Gates remains unresolved; no equivalence is asserted.</p>)}
    </section>
    <p className="mt-8 text-sm">Looking for the established searchable British and Western hand guide? Visit <a className="font-semibold underline" href="/special-hands">Special Hands</a>.</p>
  </main>;
}

export function PublicTreatmentCard({ treatmentId, presentation }: {
  treatmentId: string;
  presentation: { name: string; profile: string; scorerHref?: string; value: string; description: string; exposure?: string; winningMethod?: string };
}) {
  return <li id={treatmentId} className="scroll-mt-24 rounded-lg border border-[#cbd8d0] bg-white p-4">
    <p className="text-sm font-semibold text-[#47695d]">{presentation.profile}</p>
    <h3 className="mt-1 text-lg font-semibold">{presentation.name}</h3>
    <p className="mt-2 text-sm">{presentation.description}</p>
    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
      <div><dt className="font-semibold">Scoring treatment</dt><dd>{presentation.value}</dd></div>
      {presentation.exposure ? <div><dt className="font-semibold">Exposure</dt><dd>{presentation.exposure}</dd></div> : null}
      {presentation.winningMethod ? <div><dt className="font-semibold">Winning method</dt><dd>{presentation.winningMethod}</dd></div> : null}
    </dl>
    {presentation.scorerHref ? <a className="mt-3 inline-block underline" href={presentation.scorerHref}>Open this profile’s hand scorer</a> : null}
    <details className="mt-3">
      <summary className="cursor-pointer font-medium">Provenance</summary>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
        {sourceDetails(treatmentId).map(({ claim, citation, locator, status }, index) => <li key={`${treatmentId}:${index}`}>
          <span>{claim}</span> <span>{status}; {citation}; {locator.label}</span>{locator.url ? <a className="ml-1 underline" href={locator.url} target="_blank" rel="noreferrer">Open source</a> : null}
        </li>)}
      </ul>
    </details>
  </li>;
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
  const [profileId, version, ...subjectParts] = treatmentId.split(/[@:]/);
  const subjectId = subjectParts.join(':');
  if (!profileId || !version || !subjectId) return [];
  return readGovernedFacts({ id: profileId, version }).find(({ subject }) => subject.id === subjectId)?.claims.map((claim) => ({
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
      <p className="text-sm font-semibold uppercase tracking-wide text-[#47695d]">Mahjong concept</p>
      <h1 className="mt-2 font-serif text-4xl text-[#284d45]">{titleFor(conceptId)}</h1>
      {entry ? <p className="mt-4 max-w-3xl text-lg">{entry.summary}</p> : <p className="mt-4 max-w-3xl text-lg">{rulesDimension('scoring.grammar').label} describes how a rules profile represents and combines scoring values.</p>}
      {entry ? <p className="mt-3 max-w-3xl">{entry.whatItIs}</p> : null}
    </header>

    {example ? <section className="mt-8" aria-label="Hand example"><h2 className="mb-3 font-serif text-2xl text-[#284d45]">Example hand</h2><AtlasExampleVisual example={example} /></section> : null}

    {entry?.howItWorks?.length ? <section className="mt-8" aria-labelledby="requirements-heading">
      <h2 id="requirements-heading" className="font-serif text-2xl text-[#284d45]">What the hand needs</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">{entry.howItWorks.map((step) => <li key={step}>{step}</li>)}</ol>
      {entry.watchOutFor?.length ? <div className="mt-4 rounded-lg bg-[#f5f8f5] p-4"><h3 className="font-semibold">Check this carefully</h3><ul className="mt-2 list-disc space-y-1 pl-5">{entry.watchOutFor.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
    </section> : null}

    <section id="treatments" className="mt-8" aria-labelledby="treatments-heading">
      <h2 id="treatments-heading" className="font-serif text-2xl text-[#284d45]">Profile treatments</h2>
      {concept.treatments.length ? <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {concept.treatments.map(({ treatmentId, presentation }) => <PublicTreatmentCard key={treatmentId} treatmentId={treatmentId} presentation={presentation} />)}
      </ul> : <p className="mt-3">No profile treatments are currently published for this concept.</p>}
    </section>

    {entry?.localNames?.length ? <section className="mt-6" aria-labelledby="names-heading">
      <h2 id="names-heading" className="font-serif text-xl text-[#284d45]">Names used in the Special Hands guide</h2>
      <ul className="mt-2 flex flex-wrap gap-2">{entry.localNames.map((name) => <li key={name} className="rounded-full bg-[#edf3ed] px-3 py-1 text-sm">{name}</li>)}</ul>
    </section> : null}

    {entry?.variants?.length ? <section className="mt-8" aria-labelledby="forms-heading">
      <h2 id="forms-heading" className="font-serif text-2xl text-[#284d45]">Related profile forms</h2>
      <p className="mt-2 text-sm">The existing Special Hands guide groups these as a related family. That family view does not assert that the forms are equivalent; each requirement remains tied to its profile.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">{entry.variants.map((variant) => <li key={variant.id} className="rounded-lg border border-[#cbd8d0] bg-white p-4">
        <h3 className="font-semibold">{variant.label}</h3>
        {variant.definition ? <p className="mt-2 text-sm">{variant.definition}</p> : null}
        <p className="mt-2 text-xs text-[#596b65]">Relationship: {String(variant.relation ?? 'profile-specific').replaceAll('-', ' ')}</p>
        {variant.treatmentReferenceIds?.map((id) => SPECIAL_HANDS_ATLAS.find((record) => record.referenceId === id)?.href).filter((href, index, all): href is string => !!href && all.indexOf(href) === index).map((href) => <a key={href} className="mt-3 inline-block text-sm underline" href={href}>Open exact profile treatment in Special Hands</a>)}
      </li>)}</ul>
    </section> : null}

    {concept.relationships.length ? <section className="mt-8" aria-labelledby="relationships-heading">
      <h2 id="relationships-heading" className="font-serif text-2xl text-[#284d45]">Reviewed relationships</h2>
      <ul className="mt-3 list-disc pl-5">{concept.relationships.map(({ id, kind }) => <li key={id}>{kind.replaceAll('-', ' ')}</li>)}</ul>
    </section> : null}
  </main>;
}

export function PublicScoringConceptPage() {
  const concept = publicDimensionConcepts('scoring.grammar')[0];
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
      <p className="text-sm font-semibold uppercase tracking-wide text-[#47695d]">Broader rules concept</p>
      <h1 className="mt-2 font-serif text-4xl text-[#284d45]">{dimension.label}</h1>
      <p className="mt-4 max-w-3xl">Different profiles organize scoring in different ways. These values are projected from each resolved profile.</p>
      {concept ? <p className="mt-2 text-sm">Mapped from #406 dimension <code>{dimension.id}</code>.</p> : null}
    </header>
    <section className="mt-8" aria-labelledby="profile-scoring-heading">
      <h2 id="profile-scoring-heading" className="font-serif text-2xl text-[#284d45]">Published profile treatments</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">{rows.map(({ descriptor, projected }) => <li id={`profile-${descriptor.profile.id}-${descriptor.profile.version}`} key={`${descriptor.profile.id}@${descriptor.profile.version}`} className="scroll-mt-24 rounded-lg border border-[#cbd8d0] bg-white p-4">
        <p className="font-semibold">{descriptor.compactLabel}</p><p className="mt-1">{projected.displayValue}</p>
        {descriptor.availability.handScorer ? <a className="mt-3 inline-block underline" href={`/hand?rules=${descriptor.slug}`}>Open this profile’s hand scorer</a> : null}
        <details className="mt-3"><summary className="cursor-pointer font-medium">Provenance</summary><p className="mt-2 text-sm">{projected.sourceStatus}</p><ul className="mt-1 list-disc pl-5 text-sm">{projected.provenanceIds.map((id) => <li key={id}>{id}</li>)}</ul></details>
      </li>)}</ul>
    </section>
  </main>;
}
