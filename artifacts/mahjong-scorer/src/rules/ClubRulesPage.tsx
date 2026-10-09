import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { SiteHeader } from '../components/SiteHeader';
import { descriptorForSlug } from '../game/rules-presentation';
import { RulesSupportStatus } from './RulesReference';

const actionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[15px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2';
const secondaryActionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#b8c8c1] bg-white px-4 py-2.5 text-[15px] font-semibold text-[#284d45] transition hover:bg-[#f2f6f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12"><h2 className="font-serif text-[30px] leading-tight text-[#284d45]">{title}</h2><div className="mt-4 max-w-[820px] text-[16px] leading-7 text-[#405650]">{children}</div></section>;
}

export function ClubRulesPage() {
  const descriptor = descriptorForSlug('club');
  return <div className="mahjong-shell min-h-screen">
    <SiteHeader />
    <main className="mx-auto max-w-[1180px] px-5 py-9 lg:px-8 lg:py-14">
      <article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]">
        <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="fine-rule mb-4 w-10" />
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[.16em] text-[#ae6249]">Rules reference</p>
          <h1 className="mt-3 max-w-[900px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">{descriptor.title}</h1>
          <p className="mt-5 max-w-[790px] text-[17px] leading-8 text-[#405650]">A configured local club profile with its own special hands, Goulash treatment and table incidents. It describes this table configuration, not a universal set of club Mahjong rules.</p>
        </section>
        <section className="px-5 py-7 sm:px-8 lg:px-12"><RulesSupportStatus descriptor={descriptor} /></section>
        <Section title="Identity and authority"><p>This is a named local configuration in Mahjong Reference. It should not be read as authority for other clubs, Western Mahjong generally, or British / BMJA-style play. Where another table uses different house rules, that table needs its own explicit amendments or profile.</p></Section>
        <Section title="At the table"><p>The profile carries the club-specific special-hand catalogue and supports a Goulash hand after a draw. It also records table-resolved incidents and liability where those facts affect settlement. Mahjong Reference records those decisions; it does not attempt to referee physical play after the event.</p></Section>
        <Section title="How scoring works"><p>The scorer uses this configured profile rather than silently falling back to the British profile. Special-hand recognition and other profile-owned treatments remain attached to the exact Club rules profile and version used by the hand or game.</p></Section>
        <Section title="What happens after a hand"><p>The game tracker uses the same configured profile for settlement and progression, including the profile’s Goulash behaviour after a draw. The resulting settlement, next-hand state and recorded history stay tied to that profile.</p></Section>
        <Section title="Distinctive mechanics"><p>The public descriptor currently records a club-specific special-hand catalogue, Goulash with physical blank tiles after draws, and table incidents/liability that are entered as resolved facts. These are local configuration choices, not claims about all Mahjong clubs.</p></Section>
        <Section title="Penalties and incidents">
          <p>These are Club-specific table rules. Mahjong Reference records the incident once the table has decided what happened; it does not reconstruct or referee the play itself.</p>
          <div id="penalties" className="mt-5 grid gap-3 sm:grid-cols-2">
            <article id="incorrect-hand" className="scroll-mt-24 rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4">
              <h3 className="font-serif text-[22px] text-[#284d45]">Incorrect hand</h3>
              <p className="mt-2 text-[13px] leading-6">A wrong tile count means the player cannot Mah Jong. Too few tiles may keep a score; too many tiles score zero.</p>
            </article>
            <article id="false-discard-name" className="scroll-mt-24 rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4">
              <h3 className="font-serif text-[22px] text-[#284d45]">False discard name</h3>
              <p className="mt-2 text-[13px] leading-6">If a wrongly named discard causes Mah Jong, the discarder covers the winner’s three loser shares and no other settlement is made.</p>
            </article>
            <article id="false-mah-jong" className="scroll-mt-24 rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4">
              <h3 className="font-serif text-[22px] text-[#284d45]">False Mah Jong</h3>
              <p className="mt-2 text-[13px] leading-6">No exposed hand means no penalty. After exposure, the declarer pays each other player half the table limit.</p>
            </article>
            <article id="wrong-tile-claim" className="scroll-mt-24 rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4">
              <h3 className="font-serif text-[22px] text-[#284d45]">Wrong tile claim</h3>
              <p className="mt-2 text-[13px] leading-6">Correct it before the next draw and there is no penalty. Otherwise, that player cannot Mah Jong.</p>
            </article>
            <article id="cannon" className="scroll-mt-24 rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4 sm:col-span-2">
              <h3 className="font-serif text-[22px] text-[#284d45]">Cannon</h3>
              <p className="mt-2 text-[13px] leading-6"><strong>A Cannon happens when you discard a tile that is already visibly dangerous and it completes another player’s special Mah Jong.</strong></p>
              <p className="mt-2 text-[13px] leading-6">When Cannon applies, the cannoner covers all winner-payment shares and the normal loser-to-loser settlement is suppressed.</p>
              <p className="mt-2 text-[13px] leading-6"><strong>No choice!</strong> cancels Cannon liability when the table accepts it, so ordinary settlement applies instead.</p>
            </article>
          </div>
        </Section>
        <Section title="Use these rules"><div className="flex flex-wrap gap-3"><a href="/game/club" className={actionClass}>Track a Club rules game <ArrowRight size={16} aria-hidden="true" /></a><a href={`/hand?rules=${descriptor.slug}`} className={secondaryActionClass}>Score a hand <ArrowRight size={16} aria-hidden="true" /></a><a href="/rules" className={secondaryActionClass}>All supported rules <ArrowRight size={16} aria-hidden="true" /></a></div></Section>
        <Section title="Sources and provenance"><div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6"><p><strong className="text-[#284d45]">Reference basis:</strong> {descriptor.support.authority}.</p><p className="mt-4">Mahjong Reference treats this as a configured local profile. Its source status is kept separate from the published British, Thompson &amp; Maloney, Buzzard and MCR source traditions, so local house rules are not presented as though they were universal published rules.</p></div></Section>
      </article>
    </main>
  </div>;
}
