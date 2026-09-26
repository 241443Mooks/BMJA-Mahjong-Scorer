import { Coffee, ExternalLink, Palette } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';

function ExternalTextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 transition hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
    >
      {children}
      <ExternalLink size={12} />
    </a>
  );
}

export function AboutPage() {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8 lg:py-14">
        <article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]">
          <header className="border-b border-[#ddd3bf] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
            <div className="mb-4 flex items-center gap-3">
              <div className="fine-rule w-10" />
              <span className="font-mono text-[11px] uppercase tracking-[.2em] text-[#ae6249]">Independent project</span>
            </div>
            <h1 className="max-w-[820px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">
              About Mahjong Reference
            </h1>
            <div className="mt-7 max-w-[760px] space-y-5 text-[16px] leading-8 text-[#596b65]">
              <p>In early September 2026, I joined some friends for our first Mahjong game without an expert helper at the table.</p>
              <p>Then we got to scoring.</p>
              <p>None of us could prove that I&apos;d absolutely won, despite me forgetting the names of tiles, suits, groups and concepts constantly.</p>
              <p>So I wondered whether I could make something that would help.</p>
              <p>I thought I was building a calculator.</p>
              <p className="font-serif text-[30px] font-semibold leading-tight text-[#ae6249]">One question kept creating another.</p>
            </div>
          </header>

          <section className="border-b border-[#ddd3bf] px-5 py-10 sm:px-8 sm:py-12 lg:px-12" aria-labelledby="questions-heading">
            <div className="max-w-[760px]">
              <h2 id="questions-heading" className="font-serif text-[34px] leading-tight text-[#284d45]">What if?</h2>
              <div className="mt-6 space-y-5 text-[15px] leading-7 text-[#596b65]">
                <p>Could it explain the score as well as calculate it?</p>
                <p>Could it keep track of a whole game?</p>
                <p>Could it remember who pays whom, which Wind comes next and what needs carrying forward?</p>
                <p>Could it cope with the slightly inconvenient fact that Mahjong players do not all play the same Mahjong?</p>
                <p>Could it show where a rule came from, where versions differ, and where the answer is not completely clear?</p>
                <p>That last question turned out to be quite a large one.</p>
                <p>I started looking at rule books, club guides, old documents and websites. The same ideas had different names. Rules changed between versions. Sources sometimes disagreed. Things I assumed would be easy to look up were occasionally surprisingly difficult to pin down.</p>
                <p>And I found that fascinating.</p>
                <p>Somewhere along the way, the little scoring calculator became Mahjong Reference.</p>
              </div>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
            <div className="max-w-[760px] space-y-5 text-[15px] leading-7 text-[#596b65]">
              <h2 className="font-serif text-[34px] leading-tight text-[#284d45]">I&apos;m learning as I build it</h2>
              <p>I&apos;m not a Mahjong expert. I&apos;m learning as I build this.</p>
              <p>What I can do is take something confusing, work through it carefully, and try to make it easier to use.</p>
              <p>So that is what I&apos;ve been doing here: checking sources, keeping different rules separate, recording uncertainty rather than filling the gaps, and turning what I learn into something useful at the table.</p>
              <p>Sometimes that becomes a calculator. Sometimes it becomes a rules page. Sometimes it just creates another question I hadn&apos;t realised existed.</p>
              <p>There is considerably more of the third category than I expected.</p>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
            <div className="max-w-[760px] space-y-5 text-[15px] leading-7 text-[#596b65]">
              <h2 className="font-serif text-[34px] leading-tight text-[#284d45]">Where this might go</h2>
              <p>I don&apos;t really know yet.</p>
              <p>Right now, Mahjong Reference can help score hands, explain scores, track a game and explore different rules.</p>
              <p>I have plenty of ideas about where it could go next, but I&apos;m deliberately treating them as ideas rather than destiny.</p>
              <p>The useful test is whether real Mahjong players actually find any of this helpful.</p>
              <p>So for now I&apos;m building, checking, learning, correcting things and seeing which questions are worth following.</p>
              <p>If it helps someone else at their table, brilliant.</p>
              <p>If it leads me to another question, that seems to be how this whole thing works.</p>
            </div>
          </section>

          <section className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
            <div className="max-w-[760px]">
              <h2 className="font-serif text-[29px] leading-tight text-[#284d45]">A few practical things</h2>
              <div className="mt-5 space-y-5 text-[14px] leading-6 text-[#596b65]">
                <section>
                  <h3 className="font-semibold text-[#284d45]">Independent project</h3>
                  <p className="mt-1">Mahjong Reference is an independent project. It is not backed by, sponsored by or affiliated with a Mahjong association, society or commercial organisation. It exists because I got curious and kept going.</p>
                  <p className="mt-2">Where I use published rules or other people&apos;s work, I try to make the source and relationship clear. That does not imply endorsement in either direction. In particular, <strong className="text-[#284d45]">Mahjong Reference is not an official British Mah-Jong Association product and does not claim BMJA endorsement.</strong></p>
                </section>
                <section>
                  <h3 className="font-semibold text-[#284d45]">Rules and sources</h3>
                  <p className="mt-1">The <a href="/rules" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Rules area</a> shows the profiles currently supported, their boundaries and the sources used. Support and confidence vary between rulesets. I would rather say something is not yet known than invent certainty to fill the gap.</p>
                </section>
                <section>
                  <h3 className="font-semibold text-[#284d45]">No account required</h3>
                  <p className="mt-1">Ordinary scoring and game tracking happen in your browser. In-progress recovery is stored locally on your device rather than in a Mahjong Reference account.</p>
                </section>
                <section>
                  <h3 className="font-semibold text-[#284d45]">Licensing</h3>
                  <p className="mt-1">The project&apos;s original software code is licensed under the MIT License. Third-party material keeps its own licence.</p>
                </section>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <section className="rounded-xl border border-[#ddd3bf] bg-[#fdfbf5] p-5">
                  <div className="flex items-center gap-3">
                    <Palette size={18} className="text-[#477562]" />
                    <h3 className="font-serif text-[21px] text-[#284d45]">Tile artwork</h3>
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-[#596b65]">Tile illustrations use the Regular SVG set from <strong className="text-[#284d45]">xhokir/riichi-mahjong-tiles</strong>, based on <strong className="text-[#284d45]">FluffyStuff/riichi-mahjong-tiles</strong>, under the <ExternalTextLink href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International licence</ExternalTextLink>.</p>
                </section>
                <section className="rounded-xl border border-[#ddd3bf] bg-[#fdfbf5] p-5">
                  <div className="flex items-center gap-3">
                    <Coffee size={18} className="text-[#ae6249]" />
                    <h3 className="font-serif text-[21px] text-[#284d45]">Support the project</h3>
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-[#596b65]">If Mahjong Reference has helped you understand a rule, score a hand or avoid an argument around the table, you can support its continued development. There is absolutely no requirement to do so.</p>
                  <a href="https://buymeacoffee.com/sharronmo" target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[14px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                    <Coffee size={15} /> Buy me a coffee
                  </a>
                </section>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
