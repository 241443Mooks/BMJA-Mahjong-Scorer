import { ReaderRulesControl } from '../guide/ReaderRulesContext';
import { ArrowRight, CircleAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { SiteHeader } from '../components/SiteHeader';
import { descriptorForSlug, PUBLIC_RULES_DESCRIPTORS, type PublicRulesSlug, type RulesDescriptor } from '../game/rules-presentation';
import { clearPreferredRulesProfile, readPreferredRulesProfile, setPreferredRulesProfile } from '../game/preferred-rules-profile';
import { BritishSpecialHands, RulesetProfileDetails, RulesetProfileReport } from './RulesetProfileReport';
import { familiesBySupportedProfileCount, MAHJONG_FAMILIES, supportedProfilesForFamily } from '../home/mahjong-family-presentation';
import { MCR_READER_TEACHING, readerSurfaceLinks } from '../guide/reader-content';
import { specialHandTreatmentsForProfile } from '../rules-knowledge/special-hand-treatments';
import { readGovernedFacts } from '../rules-knowledge/truth/read-contract';
import { ATLAS_LEARNER_ENTRIES, atlasExamplesForTreatment, ATLAS_TREATMENT_OWNERSHIP } from '../guide/special-hands-atlas';
import { AtlasExampleVisual } from '../guide/AtlasExampleVisual';
import { atlasExampleProvesTreatment } from '../guide/atlas-scorer-handoff';
import { MCR_WMO_2006_PROFILE } from '../rules-platform/mcr-profile';

const actionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[15px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2';
const secondaryActionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#b8c8c1] bg-white px-4 py-2.5 text-[15px] font-semibold text-[#284d45] transition hover:bg-[#f2f6f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2';

export function ProfileSpecialHands({ profile, slug }: { profile: RulesDescriptor['profile']; slug: PublicRulesSlug }) {
  const treatments = specialHandTreatmentsForProfile(profile);
  if (!treatments.length) return null;
  return <Section title="Special hands and patterns">
    <p>These entries come from this profile’s scorer treatments. Open an entry for its conditions and any reviewed tile example.</p>
    <details className="mt-4 rounded-xl border border-[#d8ceb8] bg-white p-4">
      <summary className="min-h-11 cursor-pointer font-semibold text-[#284d45]">Browse {treatments.length} profile-specific hands</summary>
      <ul className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">{treatments.map((treatment) => {
        const entryId = ATLAS_TREATMENT_OWNERSHIP[treatment.referenceId];
        const entry = ATLAS_LEARNER_ENTRIES.find((candidate) => candidate.id === entryId);
        const example = entry ? atlasExamplesForTreatment(entry, treatment.referenceId).find((candidate) => candidate.kind === 'tile-hand' && atlasExampleProvesTreatment(candidate.id, treatment.referenceId)) : undefined;
        const policy = treatment.exposurePolicy?.policy as { allowed?: boolean; exposedValue?: number; exposedFishingValue?: number; multiplier?: number } | undefined;
        const score = treatment.winnerValue === undefined ? 'Score follows the hand’s scoring rules.' : `${treatment.winnerValue.toLocaleString('en-GB')} points when complete${treatment.fishingValue === undefined ? '' : `; ${treatment.fishingValue.toLocaleString('en-GB')} when one tile from winning${treatment.fishingUsesIntrinsicFloor ? ' (or the hand value if higher)' : ''}`}.`;
        const href = treatment.href ?? (entry ? `/special-hands#treatment-${slug}-${treatment.identity.patternId}` : undefined);
        return <li key={treatment.referenceId} className="min-w-0 rounded-lg border border-[#e4dccd] bg-[#fdfbf5] p-3">
          <h3 className="font-serif text-xl text-[#284d45]">{treatment.name}</h3>
          <p className="mt-1 break-words text-sm leading-5">{treatment.description}</p>
          <p className="mt-2 text-sm font-semibold">{score}</p>
          <details className="mt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-[#284d45]">Conditions and example</summary>
            <div className="space-y-2 break-words text-sm leading-5">
              {policy?.allowed === false && <p>All sets must be concealed.</p>}
              {policy?.allowed === true && policy.exposedValue !== undefined && <p>With exposed sets: {policy.exposedValue.toLocaleString('en-GB')} points{policy.exposedFishingValue === undefined ? '' : `, or ${policy.exposedFishingValue.toLocaleString('en-GB')} when one tile from winning`}.</p>}
              {policy?.allowed === true && policy.exposedValue === undefined && <p>Exposed sets are allowed.</p>}
              {policy?.multiplier !== undefined && <p>Exposed sets multiply the score by {policy.multiplier}.</p>}
              {treatment.winningMethods?.length ? <p>Winning method: {treatment.winningMethods.join(' or ')}.</p> : null}
              {example ? <AtlasExampleVisual example={example} title={`${treatment.name} tile example`} /> : <p>No reviewed tile example is available for this hand.</p>}
              {href && <a className="inline-flex min-h-11 items-center font-semibold text-[#284d45] underline underline-offset-4" href={href}>Read about {treatment.name}</a>}
            </div>
          </details>
        </li>;
      })}</ul>
    </details>
  </Section>;
}

export function ProfileEvidenceDetails({ profile }: { profile: RulesDescriptor['profile'] }) {
  const facts = readGovernedFacts(profile);
  return <details className="mt-4 rounded-xl border border-[#d8ceb8] bg-white p-4 sm:p-5">
    <summary className="min-h-11 cursor-pointer font-semibold text-[#284d45]">Evidence and scorer links</summary>
    <p className="mt-3 text-sm leading-6">This optional record keeps source claims, scorer connections and their review states separate. It does not claim complete rule coverage.</p>
    <ul className="mt-3 space-y-3">{facts.map((fact) => <li key={fact.factId} className="min-w-0 border-t border-[#e4dccd] pt-3 text-sm leading-5">
      <p className="break-words font-semibold text-[#284d45]">{fact.subject.id} · {fact.sourceState} · {fact.runtime.mappingState}</p>
      <p>Treatment: {fact.treatment ? `${fact.treatment.recordId} v${fact.treatment.recordVersion}` : typeof fact.runtime.state === 'string' ? fact.runtime.state : fact.runtime.state.kind} · scorer: {fact.runtime.ref ? `${fact.runtime.ref.kind}:${fact.runtime.ref.id}` : fact.runtime.capability} · {fact.runtime.conformance}</p>
      {fact.claims.map((claim) => <div key={`${claim.recordId}:${claim.recordVersion}`} className="mt-2 break-words">
        <p>{claim.text}</p><p className="text-xs">Claim {claim.recordId} v{claim.recordVersion} · {claim.status}{claim.source ? ` · ${claim.source.citation} · ${claim.source.locator.label} · source ${claim.source.recordId} v${claim.source.recordVersion}` : ' · source link unavailable'}</p>
        {claim.source?.locator.url && <a className="text-xs font-semibold underline" href={claim.source.locator.url} target="_blank" rel="noreferrer">Open source</a>}
      </div>)}
      {fact.runtime.fixturePaths.map((path) => <p key={path} className="break-all text-xs">Fixture: {path}</p>)}
    </li>)}</ul>
  </details>;
}

function McrPlayersAndTiles() {
  if (MCR_WMO_2006_PROFILE.kind !== 'root') return null;
  const { table, tileSet } = MCR_WMO_2006_PROFILE.definition;
  if (!table || Array.isArray(table) || typeof table !== 'object' || !tileSet || Array.isArray(tileSet) || typeof tileSet !== 'object') return null;
  if (typeof table.playerCount !== 'number' || typeof table.seatModelId !== 'string' || typeof tileSet.presetId !== 'string') return null;
  const seats = table.seatModelId === 'seats.winds-4' ? 'East, South, West and North' : 'Seat order not translated';
  const tiles = tileSet.presetId === 'tiles.flowers-144' ? '144 tiles, including Flowers and Seasons' : 'Tile set not translated';
  return <Section title="Players and tiles"><dl className="grid gap-3 sm:grid-cols-3">
    <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4"><dt className="text-[13px] font-semibold text-[#536860]">Players</dt><dd className="mt-2 text-[18px] font-semibold text-[#284d45]">{table.playerCount} players</dd><dd className="mt-2 text-[12px] leading-5 text-[#536860]">Configured in the MCR scorer</dd></div>
    <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4"><dt className="text-[13px] font-semibold text-[#536860]">Seats</dt><dd className="mt-2 text-[18px] font-semibold text-[#284d45]">{seats}</dd><dd className="mt-2 text-[12px] leading-5 text-[#536860]">Configured in the MCR scorer</dd></div>
    <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4"><dt className="text-[13px] font-semibold text-[#536860]">Main tile set</dt><dd className="mt-2 text-[18px] font-semibold leading-6 text-[#284d45]">{tiles}</dd><dd className="mt-2 text-[12px] leading-5 text-[#536860]">Configured in the MCR scorer</dd></div>
  </dl></Section>;
}

export function RulesSupportStatus({ descriptor }: { descriptor: RulesDescriptor }) {
  const provisional = descriptor.support.implementation === 'Provisional';
  return (
    <aside className={`rounded-xl border p-5 sm:p-6 ${provisional ? 'border-[#cfbfa4] bg-[#fff6e8]' : 'border-[#9fb8ad] bg-[#f2f6f3]'}`} aria-label={`${descriptor.title} support and source status`}>
      <div className="flex gap-3">
        {provisional ? <CircleAlert className="mt-0.5 shrink-0 text-[#a65b3d]" aria-hidden="true" /> : <ShieldCheck className="mt-0.5 shrink-0 text-[#477562]" aria-hidden="true" />}
        <div>
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[.14em] text-[#ae6249]">Mahjong Reference support</p>
          <dl className="mt-3 grid gap-3 text-[16px] leading-6 text-[#405650]">
            <div><dt className="font-semibold text-[#284d45]">Scorer</dt><dd>{descriptor.support.scorer}</dd></div>
            <div><dt className="font-semibold text-[#284d45]">Source status</dt><dd>{descriptor.support.source}</dd></div>
            <div><dt className="font-semibold text-[#284d45]">Implementation</dt><dd>{descriptor.support.implementation}</dd></div>
          </dl>
        </div>
      </div>
    </aside>
  );
}

function PageFrame({ eyebrow, title, intro, children, readerControl = true }: { eyebrow: string; title: string; intro: string; children: ReactNode; readerControl?: boolean }) {
  return <div className="mahjong-shell min-h-screen"><SiteHeader /><main className="mx-auto max-w-[1180px] px-5 py-9 lg:px-8 lg:py-14"><article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]"><section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-14"><div className="fine-rule mb-4 w-10" /><p className="font-mono text-[12px] font-semibold uppercase tracking-[.16em] text-[#ae6249]">{eyebrow}</p><h1 className="mt-3 max-w-[900px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">{title}</h1><p className="mt-5 max-w-[790px] text-[17px] leading-8 text-[#405650]">{intro}</p>{readerControl && <ReaderRulesControl />}</section>{children}</article></main></div>;
}

function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return <section id={id} className="scroll-mt-24 border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12"><h2 className="font-serif text-[30px] leading-tight text-[#284d45]">{title}</h2><div className="mt-4 max-w-[820px] text-[16px] leading-7 text-[#405650]">{children}</div></section>;
}

const pageCopy: Partial<Record<PublicRulesSlug, { eyebrow: string; intro: string; identity: ReactNode; table: ReactNode; scoring: ReactNode; after: ReactNode; distinctive: ReactNode; provenance: ReactNode; links: readonly [string, string][] }>> = {
  british: {
    eyebrow: 'Rules reference',
    intro: 'The stable British / BMJA-style profile used by Mahjong Reference. It gives your table a shared way to score a hand, settle it and continue the game.',
    identity: <>British / BMJA-style Mahjong is a standardised British profile within the wider Western/classical Mahjong tradition. Mahjong Reference uses the BMJA-approved British rules reference for this scorer; that is a source basis, not a claim of BMJA affiliation.</>,
    table: <>A normal winning hand is four sets and a pair, alongside defined special hands. Flowers and Seasons are scoring bonus tiles. Ordinary hands allow at most one Chow. The published rules describe Goulash after a drawn hand; this scorer does not switch to Goulash automatically.</>,
    scoring: <>Ordinary scoring starts with points for qualifying sets, pairs and bonus tiles, then applies doubles. Some special hands and hands that are one tile from winning have their own values. For the full points table, see the British scoring guide.</>,
    after: <>The winner is paid for the winning hand. Losing hands can matter too: settlement compares them with one another, and East pays or receives double where the rules apply. The game tracker carries that settlement and Wind progression forward.</>,
    distinctive: <>British rules deliberately standardise a restricted special-hand catalogue and a one-Chow ordinary-hand limit. Clubs may agree variations, so check the table's own sheet when it differs from this profile.</>,
    provenance: <>These rules are checked against the BMJA-approved British rules reference, including its scoring, special-hand, settlement and Q&amp;A material. This page gives a practical overview; the guide and examples provide the detailed learning material.</>,
    links: [['Track a British game', '/game/british'], ['Score a hand', '/hand?rules=british'], ['British scoring guide', '/guide?rules=british'], ['Special hands', '/special-hands?rules=british'], ['Scoring examples', '/scoring-examples'], ['Compare Mahjong rules', '/mahjong-rules-compared']],
  },
  western: {
    eyebrow: 'Rules reference',
    intro: 'The selectable Western — Thompson & Maloney profile in Mahjong Reference, with its Companion special-hand catalogue available now and its ordinary rules transparently marked provisional.',
    identity: <>Western Mahjong is not one universal worldwide ruleset. Mahjong Reference uses Thompson &amp; Maloney as the published Western reference basis for this profile. That does not mean every Western or Australian group plays it unchanged; named clubs can select hands and conventions locally.</>,
    table: <>This scorer currently supports a classical Western-style hand experience and the Companion's large special-hand catalogue. The intended ordinary-play authority is <em>The Game of Mah Jong Illustrated</em>, whose ordinary rules, settlement and progression still need direct source review before this profile can be called fully verified.</>,
    scoring: <>The Companion contributes a much larger special-hand tradition than the British restricted catalogue, including profile-specific values and fishing treatment. The implemented Companion catalogue is source-verified. Ordinary scoring behaviour remains provisional while the main rules source is audited, so this page does not present a complete Western points table as settled authority.</>,
    after: <>Use the Western game route to track and settle a supported game. The currently executable ordinary settlement and progression behaviour is deliberately under source review, so it must not be read as a final statement of every Thompson &amp; Maloney table procedure.</>,
    distinctive: <>The key current distinction is the source-certified Companion catalogue: 84 unique source hands are represented through 85 intentional profile bindings. A shared-looking hand can have a different Western value or exposure treatment, which is why the profile keeps its catalogue local.</>,
    provenance: <>The 1997 <em>Mah Jong Player's Companion</em> is the source-certified catalogue reference. <em>The Game of Mah Jong Illustrated</em> is the intended ordinary-rules source, but its executable domains have not yet all been checked. Until that work is complete, ordinary play remains provisional rather than fully verified.</>,
    links: [['Track a Western game', '/game/western'], ['Score a hand', '/hand?rules=western'], ['Compare Mahjong rules', '/mahjong-rules-compared']],
  },
  buzzard: {
    eyebrow: 'Rules reference', intro: 'British/Western Classical — Buzzard 2000 is a source-specific profile with a configurable table limit.',
    identity: <>This profile identifies Buzzard 2000 exactly; it is not a claim about all Classical or Western Mahjong.</>,
    table: <>The ordinary hand follows this profile’s classical hand rules. Buzzard also has ten named limit hands, including a Calling Nine Tile Hand. Calling is a waiting declaration; a completed Standing Hand adds 100 points. The table declares and locks Standing Hand physically, while the scorer records the resolved fact. Dead-hand/final-14, claim priority and Kong replacement or rob-Kong remain table procedures, not wall simulation or arbitration.</>,
    scoring: <>A completed Buzzard limit hand receives the configured table-limit treatment. The configured table limit belongs to the table: 600 is the source-backed Buzzard default/example, not a universal Mahjong constant. The scorer also records supported winning-method evidence such as last-wall, Loose Tile and rob-Kong. Buzzard uses Calling and Standing Hand; it does not use the British/T&M special-hand Fishing scores.</>,
    after: <>Dangerous discard is entered as an already-resolved table incident and liability, never inferred from discard history.</>,
    distinctive: <>Use the game tracker to record the established incident and incomplete-hand facts; it does not police physical play.</>,
    provenance: <>The Buzzard 2000 profile evidence keeps its own named hands, table limit and Standing Hand treatment separate from general British and Western rules.</>,
    links: [['Track a Buzzard game', '/game/buzzard'], ['Score a hand', '/hand?rules=buzzard']],
  },
  mcr: {
    eyebrow: 'Rules reference', intro: 'Mahjong Competition Rules / WMO 2006 profile 0.1 remains Provisional. Winning-hand scoring and Table Companion game tracking are available.',
    identity: <>This profile represents the Mahjong Competition Rules / WMO 2006 source context.</>,
    table: <>{MCR_READER_TEACHING[1].text}</>,
    scoring: <>A winning hand must first reach the 8-point minimum from qualifying fan patterns. Flowers are added only after that qualification. Settlement uses the accepted Basic Points; British points, doubles and Fishing do not apply here.</>,
    after: <>Accepted Basic Points drive settlement. The dealer passes after every completed hand, while seats and prevailing-wind progression are tracked under the MCR progression profile.</>,
    distinctive: <>This profile remains version 0.1 and Provisional. Table tracking records the table's resolved result rather than deciding what happened during physical play.</>,
    provenance: <>Source context: the existing 2006 MCR/EMA Green Book evidence record. This source context does not imply affiliation or endorsement.</>,
    links: [['Track an MCR game', '/game/mcr'], ['Score a hand', '/hand?rules=mcr'], ['About these rules', '/rules/mcr']],
  },
};

export function RulesProfilePage({ slug, descriptor = descriptorForSlug(slug) }: { slug: PublicRulesSlug; descriptor?: RulesDescriptor }) {
  const copy = pageCopy[slug];
  if (!copy) return <SharedRulesProfilePage descriptor={descriptor} />;
  if (slug === 'british') return <PageFrame eyebrow={copy.eyebrow} title={descriptor.title} intro="A practical guide to the British Mahjong rules used by this scorer. Check the hand, its score and what happens next; open the source details when you want to see how a rule was checked.">
    <RulesetProfileReport profile={descriptor.profile} />
    <Section title="How hands work"><p>{copy.table}</p></Section>
    <Section title="How scoring works"><p>{copy.scoring}</p><p className="mt-3"><a href="/guide?rules=british" className="font-semibold text-[#284d45] underline underline-offset-4">See the British scoring guide</a> or <a href="/scoring-examples" className="font-semibold text-[#284d45] underline underline-offset-4">worked scoring examples</a>.</p></Section>
    <BritishSpecialHands profile={descriptor.profile} />
    <Section id="settlement" title="What happens after a hand"><p>{copy.after}</p><p className="mt-3"><a href="/mahjong-settlement" className="font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4">See a worked settlement example</a>.</p></Section>
    <Section title="Where these rules come from"><div className="space-y-3"><p>{copy.provenance}</p><p>Robbing a Kong still needs eligibility validation, and the source wording about Blessing and Chow remains unresolved. These are open differences in the evidence, not new scoring decisions.</p><RulesetProfileDetails profile={descriptor.profile} /></div></Section>
    <Section title="Use these rules"><div className="flex flex-wrap gap-3">{copy.links.map(([label, href]) => <a key={href} href={href} className={href.startsWith('/game') ? actionClass : secondaryActionClass}>{label}<ArrowRight size={16} aria-hidden="true" /></a>)}</div></Section>
  </PageFrame>;
  return <PageFrame eyebrow={copy.eyebrow} title={descriptor.title} intro={copy.intro}>
    {slug === 'mcr' ? <McrPlayersAndTiles /> : <RulesetProfileReport profile={descriptor.profile} />}
    <Section title="How hands work"><p>{copy.table}</p></Section>
    <Section title="How scoring works"><p>{copy.scoring}</p></Section>
    <ProfileSpecialHands profile={descriptor.profile} slug={slug} />
    <Section id="settlement" title="What happens after a hand"><p>{copy.after}</p></Section>
    <Section title="Where these rules come from"><div className="space-y-3"><RulesSupportStatus descriptor={descriptor} /><p><strong>Reference basis:</strong> {descriptor.support.authority}.</p><p>{copy.identity}</p><p>{copy.provenance}</p><ProfileEvidenceDetails profile={descriptor.profile} /></div></Section>
    <Section title="Use these rules"><div className="flex flex-wrap gap-3">{copy.links.map(([label, href]) => <a key={href} href={href} className={href.startsWith('/game') ? actionClass : secondaryActionClass}>{label}<ArrowRight size={16} aria-hidden="true" /></a>)}</div></Section>
  </PageFrame>;
}

/** New profiles use this template until additional reviewed teaching is supplied. */
export function SharedRulesProfilePage({ descriptor }: { descriptor: RulesDescriptor }) {
  const links = readerSurfaceLinks(descriptor);
  return <PageFrame eyebrow="Rules reference" title={descriptor.title} intro={descriptor.description}>
    <RulesetProfileReport profile={descriptor.profile} />
    <Section title="Source and coverage"><RulesSupportStatus descriptor={descriptor} /><p>A complete physical-play lesson is not currently covered by the available reference. See the scoped guides for what has been established.</p></Section>
    <Section title="Learn with these rules"><div className="flex flex-wrap gap-4">{Object.entries(links).filter(([key]) => key !== 'reference').map(([key, href]) => <a className="underline" key={key} href={href}>{key === 'specialHands' ? 'Special Hands' : key === 'gameplay' ? 'Gameplay basics' : key === 'scoring' ? 'Scoring guide' : 'Encyclopaedia'}</a>)}</div></Section>
  </PageFrame>;
}

export function chooseRulesHubProfile(slug: PublicRulesSlug | null, storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>) {
  if (slug === null) {
    clearPreferredRulesProfile(storage);
    return null;
  }
  const profile = descriptorForSlug(slug).profile;
  setPreferredRulesProfile(profile, storage);
  return profile;
}

export function RulesHubPage({ registry = PUBLIC_RULES_DESCRIPTORS }: { registry?: readonly RulesDescriptor[] } = {}) {
  const [preferredProfile, setPreferredProfile] = useState(() => readPreferredRulesProfile());
  const selected = preferredProfile
    ? registry.find(({ profile }) => profile.id === preferredProfile.id && profile.version === preferredProfile.version)
    : undefined;
  const selectProfile = (slug: PublicRulesSlug | null) => {
    setPreferredProfile(chooseRulesHubProfile(slug));
  };
  const classicalFamily = MAHJONG_FAMILIES.find(({ id }) => id === 'classical-western')!;
  const selectedIsClassical = selected ? classicalFamily.supportedProfileSlugs.includes(selected.slug) : false;
  const learningLinks = selected ? [{ label: 'Gameplay basics', href: readerSurfaceLinks(selected).gameplay }, { label: 'Scoring guide', href: readerSurfaceLinks(selected).scoring }, { label: 'Encyclopaedia', href: readerSurfaceLinks(selected).encyclopaedia }] : [];
  const pickerGroups = [...MAHJONG_FAMILIES.map((family) => ({ name: family.name, profiles: registry.filter(({ slug }) => family.supportedProfileSlugs.includes(slug)) })), { name: 'Other supported rules', profiles: registry.filter(({ slug }) => !MAHJONG_FAMILIES.some((family) => family.supportedProfileSlugs.includes(slug))) }].filter(({ profiles }) => profiles.length);
  return <PageFrame readerControl={false} eyebrow="Rules" title="Find the Mahjong rules your table uses" intro="You do not need to know the rulebook name. Start with how your game works.">
    <section aria-labelledby="family-recognition" className="border-b border-[#ddd3bf] px-5 py-7 sm:px-8 sm:py-9 lg:px-12">
      <h2 id="family-recognition" className="font-serif text-[27px] leading-tight text-[#284d45]">What kind of Mahjong do you play?</h2>
      <ul className="mt-4 divide-y divide-[#e5dccb]">
        {familiesBySupportedProfileCount().map((family) => {
          const profiles = supportedProfilesForFamily(family);
          return <li key={family.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-5">
            <div><h3 className="font-semibold text-[#284d45]">{family.name}</h3><p className="mt-1 text-[14px] leading-6 text-[#596b65]">{family.clue}</p></div>
            <span className={`shrink-0 text-[12px] font-semibold ${profiles.length ? 'text-[#477562]' : 'text-[#7a7769]'}`}>{profiles.length ? `${profiles.length} supported profile${profiles.length === 1 ? '' : 's'} available` : 'Not currently supported'}</span>
          </li>;
        })}
      </ul>
    </section>
    <section aria-labelledby="exact-supported-rules" className="border-b border-[#ddd3bf] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
      <h2 id="exact-supported-rules" className="font-serif text-[27px] leading-tight text-[#284d45]">Exact rules available in Mahjong Reference</h2>
      <fieldset className="mt-4">
        <legend className="text-[14px] leading-6 text-[#596b65]">Choose an exact profile for My rules, or clear your default.</legend>
        <div className="mt-3 divide-y divide-[#e5dccb] rounded-lg border border-[#d8ceb8] bg-[#fdfbf5] px-4">
          <label className={`flex cursor-pointer items-center gap-3 py-3 text-[14px] ${selected ? 'text-[#405650]' : 'font-semibold text-[#284d45]'}`}>
            <input type="radio" name="my-rules-profile" value="all" checked={!selected} onChange={() => selectProfile(null)} className="h-4 w-4 accent-[#284d45]" />
            <span>All rules / No default</span>
            {!selected && <span className="ml-auto font-mono text-[10px] font-semibold uppercase tracking-wide text-[#477562]">Selected</span>}
          </label>
          {pickerGroups.map((family) => <fieldset key={family.name} className="py-2">
            <legend className="py-1 font-serif text-[18px] text-[#284d45]">{family.name}</legend>
            <div className="divide-y divide-[#e5dccb]">
              {family.profiles.map((descriptor) => {
                const isSelected = selected?.slug === descriptor.slug;
                return <label key={descriptor.slug} className={`flex cursor-pointer items-start gap-3 py-3 text-[14px] ${isSelected ? 'font-semibold text-[#284d45]' : 'text-[#405650]'}`}>
                  <input type="radio" name="my-rules-profile" value={descriptor.slug} checked={isSelected} onChange={() => selectProfile(descriptor.slug)} className="h-4 w-4 accent-[#284d45]" />
                  <span className="min-w-0 flex-1">
                    <span className="block">{descriptor.shortLabel} · {descriptor.editionYear}</span>
                    <span className="mt-1 block text-[12px] font-normal leading-5 text-[#596b65]">{descriptor.description}</span>
                  </span>
                  {descriptor.support.implementation !== 'Stable' && <span className="shrink-0 rounded-full border border-[#d8ceb8] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-wide text-[#7a6548]">{descriptor.support.implementation}</span>}
                  {isSelected && <span className="shrink-0 rounded-full bg-[#284d45] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white">My rules</span>}
                </label>;
              })}
            </div>
          </fieldset>)}
        </div>
      </fieldset>
      <section aria-labelledby="rules-context-actions" className="mt-5 rounded-lg border border-[#d8ceb8] bg-white p-4 sm:p-5">
        <h3 id="rules-context-actions" className="font-serif text-[21px] text-[#284d45]">{selected ? `Use ${selected.shortLabel} · ${selected.editionYear}` : 'Continue with all rules'}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={selected ? `/hand?rules=${selected.slug}` : '/hand'} className={actionClass}>Score a hand <ArrowRight size={16} /></a>
          <a href={selected ? `/game/${selected.slug}` : '/game'} className={secondaryActionClass}>Track a game <ArrowRight size={16} /></a>
          {selected && <a href={`/rules/${selected.slug}`} className={secondaryActionClass}>View these rules</a>}
          {(!selected || selectedIsClassical) && <a href={selected ? readerSurfaceLinks(selected).specialHands : '/special-hands'} className={secondaryActionClass}>Special Hands</a>}
        </div>
        {learningLinks.length > 0 && <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">{learningLinks.map(({ label, href }) => <li key={href}><a href={href} className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4">{label}</a></li>)}</ul>}
      </section>
    </section>
    <section className="px-5 py-7 sm:px-8 sm:py-9 lg:px-12"><div className="rounded-xl border border-[#cfbfa4] bg-[#f5eadb] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6"><div><h2 className="font-serif text-[25px] text-[#284d45]">Not seeing your rules?</h2><p className="mt-2 max-w-[680px] text-[15px] leading-6 text-[#405650]">Exact scorer profiles for Hong Kong, Riichi and American/NMJL-style Mahjong are not currently supported.</p></div><a href="/mahjong-rules-compared" className={`${actionClass} mt-4 shrink-0 sm:mt-0`}>Compare Mahjong rules <ArrowRight size={16} /></a></div></section>
  </PageFrame>;
}
