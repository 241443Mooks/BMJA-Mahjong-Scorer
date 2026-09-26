import { ArrowRight, BookOpen, CheckCircle2, CircleAlert, Compass, Gamepad2, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { SiteHeader } from '../components/SiteHeader';
import { descriptorForSlug, PUBLIC_RULES_DESCRIPTORS, type PublicRulesSlug, type RulesDescriptor } from '../game/rules-presentation';

const actionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[15px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2';
const secondaryActionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#b8c8c1] bg-white px-4 py-2.5 text-[15px] font-semibold text-[#284d45] transition hover:bg-[#f2f6f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2';

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

function PageFrame({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return <div className="mahjong-shell min-h-screen"><SiteHeader /><main className="mx-auto max-w-[1180px] px-5 py-9 lg:px-8 lg:py-14"><article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]"><section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-14"><div className="fine-rule mb-4 w-10" /><p className="font-mono text-[12px] font-semibold uppercase tracking-[.16em] text-[#ae6249]">{eyebrow}</p><h1 className="mt-3 max-w-[900px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">{title}</h1><p className="mt-5 max-w-[790px] text-[17px] leading-8 text-[#405650]">{intro}</p></section>{children}</article></main></div>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12"><h2 className="font-serif text-[30px] leading-tight text-[#284d45]">{title}</h2><div className="mt-4 max-w-[820px] text-[16px] leading-7 text-[#405650]">{children}</div></section>;
}

const pageCopy: Record<Exclude<PublicRulesSlug, 'club'>, { eyebrow: string; intro: string; identity: ReactNode; table: ReactNode; scoring: ReactNode; after: ReactNode; distinctive: ReactNode; provenance: ReactNode; links: readonly [string, string][] }> = {
  british: {
    eyebrow: 'Rules reference',
    intro: 'The stable British / BMJA-style profile used by Mahjong Reference. It gives your table a shared way to score a hand, settle it and continue the game.',
    identity: <>British / BMJA-style Mahjong is a standardised British profile within the wider Western/classical Mahjong tradition. Mahjong Reference uses the BMJA-approved British rules reference for this scorer; that is a source basis, not a claim of BMJA affiliation.</>,
    table: <>A normal winning hand is four sets and a pair, alongside defined special hands. Flowers and Seasons are scoring bonus tiles. Ordinary hands allow at most one Chow, and the profile includes fishing treatment, East/dealer effects and Goulash after a drawn hand.</>,
    scoring: <>Ordinary scoring starts with base points for qualifying sets, pairs and bonus tiles, then applies doubles. Defined special hands and fishing can instead have their own values. This is the scoring grammar; the detailed points tables stay in the British scoring guide.</>,
    after: <>The winner is paid for the winning hand. Losing hands can matter too: settlement compares them with one another, and East pays or receives double where the rules apply. The game tracker carries that settlement and Wind progression forward.</>,
    distinctive: <>British rules deliberately standardise a restricted special-hand catalogue and a one-Chow ordinary-hand limit. Clubs may agree variations, so check the table's own sheet when it differs from this profile.</>,
    provenance: <>The scorer baseline is verified against the BMJA-approved British rules reference, including its scoring, special-hands, settlement and Q&amp;A material. This page gives a practical overview; the guide and examples provide the detailed learning material.</>,
    links: [['Track a British game', '/game/british'], ['Score a hand', '/hand?rules=british'], ['British scoring guide', '/guide'], ['Special hands', '/special-hands'], ['Scoring examples', '/scoring-examples'], ['Compare Mahjong rules', '/mahjong-rules-compared']],
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
    table: <>Standing Hand is declared and locked at the physical table; this app records the resolved scoring fact, not later physical actions. Dead-hand/final-14, claim priority and Kong replacement or rob-Kong remain table procedures, not wall simulation or arbitration.</>,
    scoring: <>The scorer records existing winning-method evidence such as last-wall, Loose Tile and rob-Kong. The configured table limit is a table setting: 600 is the source-backed Buzzard default/example, not a universal Mahjong constant.</>,
    after: <>Dangerous discard is entered as an already-resolved table incident and liability, never inferred from discard history.</>,
    distinctive: <>Use the game tracker to record the established incident and incomplete-hand facts; it does not police physical play.</>,
    provenance: <>Copy follows the profile evidence record and stays deliberately concise.</>,
    links: [['Track a Buzzard game', '/game/buzzard'], ['Score a hand', '/hand?rules=buzzard']],
  },
  mcr: {
    eyebrow: 'Rules reference', intro: 'Mahjong Competition Rules / WMO 2006 profile 0.1 remains Provisional. Winning-hand scoring and Table Companion game tracking are available.',
    identity: <>This profile represents the Mahjong Competition Rules / WMO 2006 source context.</>,
    table: <>The scorer evaluates completed winning hands using fan. The Table Companion records resolved table and end-of-hand facts; it does not arbitrate physical play.</>,
    scoring: <>A hand must reach the 8-point qualifying minimum before Flowers. Flowers are added after qualification.</>,
    after: <>Accepted Basic Points drive settlement. The dealer passes after every completed hand, while seats and prevailing-wind progression are tracked under the MCR progression profile.</>,
    distinctive: <>This profile remains version 0.1 and Provisional. Table tracking records the table's resolved result rather than deciding what happened during physical play.</>,
    provenance: <>Source context: the existing 2006 MCR/EMA Green Book evidence record. This source context does not imply affiliation or endorsement.</>,
    links: [['Track an MCR game', '/game/mcr'], ['Score a hand', '/hand?rules=mcr'], ['About these rules', '/rules/mcr']],
  },
};

export function RulesProfilePage({ slug }: { slug: Exclude<PublicRulesSlug, 'club'> }) {
  const descriptor = descriptorForSlug(slug);
  const copy = pageCopy[slug];
  return <PageFrame eyebrow={copy.eyebrow} title={descriptor.title} intro={copy.intro}>
    <section className="px-5 py-7 sm:px-8 lg:px-12"><RulesSupportStatus descriptor={descriptor} /></section>
    <Section title="Identity and authority"><p>{copy.identity}</p></Section>
    <Section title="At the table"><p>{copy.table}</p></Section>
    <Section title="How scoring works"><p>{copy.scoring}</p></Section>
    <Section title="What happens after a hand"><p>{copy.after}</p></Section>
    <Section title="Distinctive mechanics"><p>{copy.distinctive}</p></Section>
    <Section title="Use these rules"><div className="flex flex-wrap gap-3">{copy.links.map(([label, href]) => <a key={href} href={href} className={href.startsWith('/game') ? actionClass : secondaryActionClass}>{label}<ArrowRight size={16} aria-hidden="true" /></a>)}</div></Section>
    <Section title="Sources and provenance"><div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6"><p><strong className="text-[#284d45]">Reference basis:</strong> {descriptor.support.authority}.</p><p className="mt-4">{copy.provenance}</p></div></Section>
  </PageFrame>;
}

export function RulesHubPage() {
  return <PageFrame eyebrow="Rules" title="Find the rules your table uses" intro="Mahjong rules vary. Start with the supported rules contexts Mahjong Reference can score today, then choose a scorer, a fuller reference page or a broad comparison.">
    <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12"><div className="grid gap-5 lg:grid-cols-3">{PUBLIC_RULES_DESCRIPTORS.filter(({ availability }) => availability.rulesReference).map((descriptor) => <article key={descriptor.slug} className="flex flex-col rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><h2 className="font-serif text-[27px] leading-tight text-[#284d45]">{descriptor.title}</h2>{descriptor.support.implementation === 'Provisional' ? <CircleAlert className="shrink-0 text-[#a65b3d]" aria-label="Provisional" /> : <CheckCircle2 className="shrink-0 text-[#477562]" aria-label="Available" />}</div><p className="mt-3 text-[16px] leading-7 text-[#405650]">{descriptor.description}</p><div className="mt-5"><RulesSupportStatus descriptor={descriptor} /></div><div className="mt-5 flex flex-wrap gap-3"><a href={`/rules/${descriptor.slug}`} className={secondaryActionClass}>About these rules <BookOpen size={16} /></a>{descriptor.availability.handScorer && <a href={`/hand?rules=${descriptor.slug}`} className={secondaryActionClass}>Score a hand <ArrowRight size={16} /></a>}{descriptor.availability.gameTracker && <a href={`/game/${descriptor.slug}`} className={actionClass}>Track a game <ArrowRight size={16} /></a>}</div></article>)}</div></section>
    <section className="px-5 py-9 sm:px-8 sm:py-11 lg:px-12"><div className="rounded-xl border border-[#cfbfa4] bg-[#f5eadb] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6"><div><div className="flex items-center gap-3 text-[#477562]"><Compass size={19} /><p className="font-mono text-[12px] font-semibold uppercase tracking-[.14em] text-[#ae6249]">Compare first</p></div><h2 className="mt-3 font-serif text-[29px] text-[#284d45]">Not sure which Mahjong rules you use?</h2><p className="mt-2 max-w-[680px] text-[16px] leading-7 text-[#405650]">See the broad differences between major Mahjong traditions without assuming they share one rulebook.</p></div><a href="/mahjong-rules-compared" className={`${actionClass} mt-5 shrink-0 sm:mt-0`}>Compare Mahjong rules <ArrowRight size={16} /></a></div></section>
  </PageFrame>;
}
