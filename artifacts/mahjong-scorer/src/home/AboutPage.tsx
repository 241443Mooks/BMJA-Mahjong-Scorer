import { Coffee, ExternalLink, Palette } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';

const textLinkClass = 'font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 transition hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]';

function StoryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} className={textLinkClass}>{children}</a>;
}

function ExternalTextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={textLinkClass}>
      {children}<ExternalLink className="ml-1 inline" size={12} aria-hidden="true" />
    </a>
  );
}

export function AboutPage() {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-[1100px] px-5 py-8 sm:py-12 lg:px-8 lg:py-16">
        <article className="mx-auto max-w-[860px]">
          <header className="pb-12 sm:pb-16">
            <h1 className="max-w-[760px] font-serif text-[clamp(40px,7vw,68px)] leading-[1.02] text-[#284d45]">One question kept creating another.</h1>
            <div className="mt-8 max-w-[680px] space-y-4 text-[16px] leading-7 text-[#596b65] sm:mt-10 sm:space-y-5 sm:text-[17px] sm:leading-8">
              <p>In early September, I joined some friends for our first Mahjong game without an expert helper at the table.</p>
              <p>Then we got to scoring.</p>
              <p>We could all do the maths. The difficult bit was holding the rules, exceptions, patterns and sequence in mind.</p>
              <p>So I wondered whether I could make something that would help.</p>
              <p className="font-serif text-[23px] text-[#284d45] sm:text-[26px]">I thought I was building a calculator.</p>
            </div>
          </header>

          <section className="max-w-[680px] pb-12 sm:pb-16" aria-labelledby="what-if-heading">
            <h2 id="what-if-heading" className="font-serif text-[31px] leading-tight text-[#284d45] sm:text-[36px]">What if?</h2>
            <div className="mt-5 space-y-4 text-[16px] leading-7 text-[#596b65] sm:mt-6 sm:space-y-5 sm:text-[17px] sm:leading-8">
              <p>Could it explain the score as well as calculate it?</p>
              <p>Could it keep track of the whole game — settlement, progression and what happened along the way?</p>
              <p>Could it cope with the slightly inconvenient fact that Mahjong players do not all play the same Mahjong?</p>
              <p>Could it show where a rule came from, and leave the question open when the answer was not clear?</p>
              <p>That last question turned out to be quite a large one.</p>
            </div>
          </section>

          <section className="max-w-[680px] pb-12 sm:pb-16" aria-labelledby="bigger-heading">
            <h2 id="bigger-heading" className="font-serif text-[31px] leading-tight text-[#284d45] sm:text-[36px]">The question got bigger</h2>
            <div className="mt-5 space-y-4 text-[16px] leading-7 text-[#596b65] sm:mt-6 sm:space-y-5 sm:text-[17px] sm:leading-8">
              <p>I started looking at rule books, club guides, old documents and websites. The same ideas had different names. Rules changed between versions. Sources sometimes disagreed. Things I assumed would be easy to look up were occasionally surprisingly difficult to pin down.</p>
              <p>And I found that fascinating.</p>
              <p>Sometimes that becomes a calculator. Sometimes it becomes a rules page. Sometimes it just creates another question I hadn&apos;t realised existed.</p>
              <p>There is considerably more of the third category than I expected.</p>
              <p>The <StoryLink href="/rules">rules reference</StoryLink> shows the profiles currently supported and the sources behind them. The details of how that evidence connects to the software live <StoryLink href="/under-the-hood">under the hood</StoryLink>.</p>
            </div>
          </section>

          <section className="max-w-[680px] pb-12 sm:pb-16" aria-labelledby="somewhere-heading">
            <h2 id="somewhere-heading" className="font-serif text-[31px] leading-tight text-[#284d45] sm:text-[36px]">Somewhere along the way</h2>
            <div className="mt-5 space-y-4 text-[16px] leading-7 text-[#596b65] sm:mt-6 sm:space-y-5 sm:text-[17px] sm:leading-8">
              <p>The little scoring calculator became Mahjong Reference.</p>
              <p>It can score hands, explain scores, track a game and help you explore the rules available in the reference. The same questions that made the score useful — why, according to which rules, and based on what — kept turning up elsewhere.</p>
              <p>When explanations, examples and software each carry their own version of a rule, they can drift apart. I wanted to see if they could share what had been established, while keeping the source and any uncertainty attached.</p>
              <p>Apparently I find that extremely difficult to resist.</p>
            </div>
          </section>

          <section className="max-w-[680px] pb-12 sm:pb-16" aria-labelledby="learning-heading">
            <h2 id="learning-heading" className="font-serif text-[31px] leading-tight text-[#284d45] sm:text-[36px]">I&apos;m learning as I build it</h2>
            <div className="mt-5 space-y-4 text-[16px] leading-7 text-[#596b65] sm:mt-6 sm:space-y-5 sm:text-[17px] sm:leading-8">
              <p>What I can do is take something confusing, work through it carefully, and try to make it easier to use.</p>
              <p>That means checking sources, keeping different rulesets separate, recording uncertainty, and testing what the software does. I don&apos;t want it to become confident because I misunderstood something confidently.</p>
              <p>There is still plenty to learn. Corrections should be possible, and the reasoning behind them should be visible.</p>
            </div>
          </section>

          <section className="max-w-[680px] pb-12 sm:pb-16" aria-labelledby="now-heading">
            <h2 id="now-heading" className="font-serif text-[31px] leading-tight text-[#284d45] sm:text-[36px]">Where it is now</h2>
            <p className="mt-5 text-[16px] leading-7 text-[#596b65] sm:mt-6 sm:text-[17px] sm:leading-8">A scoring question grew into a way to play through a hand, keep track of a game, and follow the rules behind both. The next useful thing is usually another question.</p>
            <nav aria-label="Explore Mahjong Reference" className="mt-7 text-[14px] leading-7 sm:mt-8 sm:text-[15px]">
              <StoryLink href="/hand">Score a hand</StoryLink><span aria-hidden="true" className="px-2 text-[#9b9a8d]">·</span>
              <StoryLink href="/game">Track a game</StoryLink><span aria-hidden="true" className="px-2 text-[#9b9a8d]">·</span>
              <StoryLink href="/rules">Explore the rules</StoryLink><span aria-hidden="true" className="px-2 text-[#9b9a8d]">·</span>
              <StoryLink href="/under-the-hood">Under the hood</StoryLink>
            </nav>
          </section>

          <section className="border-t border-[#ddd3bf] pt-8 pb-8 sm:pt-10 sm:pb-10" aria-labelledby="practical-heading">
            <h2 id="practical-heading" className="font-serif text-[25px] leading-tight text-[#284d45]">A few practical details</h2>
            <div className="mt-4 max-w-[680px] space-y-4 text-[14px] leading-6 text-[#596b65] sm:text-[15px]">
              <p>An in-progress game can be recovered from this browser on this device; it is saved in the browser rather than to an account. See the <StoryLink href="/help#account">help and common questions</StoryLink> for more about current game recovery.</p>
              <p><Palette className="mr-1 inline text-[#477562]" size={15} aria-hidden="true" />Tile illustrations use the Regular SVG set from <strong className="text-[#284d45]">xhokir/riichi-mahjong-tiles</strong>, based on <strong className="text-[#284d45]">FluffyStuff/riichi-mahjong-tiles</strong>, under the <ExternalTextLink href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International licence</ExternalTextLink>.</p>
              <p><Coffee className="mr-1 inline text-[#ae6249]" size={15} aria-hidden="true" />If Mahjong Reference has helped, you can <a href="https://buymeacoffee.com/sharronmo" target="_blank" rel="noreferrer" className={textLinkClass}>support its continued development</a>. There is absolutely no requirement to do so.</p>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
