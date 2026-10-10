import { Coffee, ExternalLink } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';

const textLinkClass = 'font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 transition hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]';

function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} className={textLinkClass}>{children}</a>;
}

function ExternalTextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={textLinkClass}>
      {children}<ExternalLink className="ml-1 inline" size={12} aria-hidden="true" />
    </a>
  );
}

const sectionClass = 'max-w-[680px] pb-12 sm:pb-16';
const headingClass = 'font-serif text-[30px] leading-tight text-[#284d45] sm:text-[35px]';
const proseClass = 'mt-5 space-y-4 text-[16px] leading-7 text-[#596b65] sm:mt-6 sm:space-y-5 sm:text-[17px] sm:leading-8';

export function AboutPage() {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-[1100px] px-5 py-8 sm:py-12 lg:px-8 lg:py-16">
        <article className="mx-auto max-w-[860px]">
          <header className="pb-12 sm:pb-16">
            <h1 className="max-w-[760px] font-serif text-[clamp(39px,7vw,66px)] leading-[1.04] text-[#284d45]">Useful at the table. Quite a lot going on underneath.</h1>
            <div className="mt-7 max-w-[680px] space-y-4 text-[16px] leading-7 text-[#596b65] sm:mt-9 sm:space-y-5 sm:text-[17px] sm:leading-8">
              <p>Mahjong Reference is a table companion for scoring hands, tracking games and making sense of the rules your table actually plays.</p>
              <p>It is meant to feel simple when you are using it.</p>
              <p>The difficult bit can stay underneath.</p>
            </div>
          </header>

          <section className={sectionClass} aria-labelledby="different-rules-heading">
            <h2 id="different-rules-heading" className={headingClass}>Mahjong is slightly inconvenient</h2>
            <div className={proseClass}>
              <p>There is not one set of Mahjong rules. Different traditions score differently. Clubs have their own conventions. Similar-looking hands can mean different things. The same idea can have different names, and occasionally two perfectly respectable sources disagree.</p>
              <p>That makes a universal “Mahjong calculator” rather more interesting than it first appears.</p>
              <p>So Mahjong Reference does not try to squash everything into one giant set of switches. Where rules genuinely share something, the system can share it. Where they are different, they stay different.</p>
              <p>Use the rules your table actually plays, from the <TextLink href="/rules">profiles currently supported</TextLink>.</p>
            </div>
          </section>

          <section className={sectionClass} aria-labelledby="score-heading">
            <h2 id="score-heading" className={headingClass}>The score is only part of it</h2>
            <div className={proseClass}>
              <p>A hand has a rules context. It has evidence: the tiles, how the hand was won, the Winds, exposure and whatever else matters under those rules.</p>
              <p>Then there is the score. Then settlement: who actually pays whom. Then progression: who is East, what Wind comes next, whether the game continues.</p>
              <p>Those things are connected, but they are not the same thing.</p>
              <p>Keeping them separate makes the thing on screen simpler — and gives the system somewhere sensible to grow when another ruleset does something completely different.</p>
              <p>There is a short <TextLink href="/how-it-works">walkthrough of the table companion</TextLink> if you want to see it in use.</p>
            </div>
          </section>

          <section className={sectionClass} aria-labelledby="explain-heading">
            <h2 id="explain-heading" className={headingClass}>It should be able to explain itself</h2>
            <div className={proseClass}>
              <p>I don&apos;t particularly like software producing a number and expecting you to believe it.</p>
              <p>The longer-term idea behind Mahjong Reference is fairly simple: keep the rules, the source and the result connected.</p>
              <p>If the system knows something, it should be possible to see why. If two rulesets differ, that difference should survive. If a source is unclear, the software should not quietly make the uncertainty disappear.</p>
              <p>And if I have misunderstood something, I would much rather make that easy to find and correct than confidently bake it into everything else.</p>
              <p>There is considerably more machinery behind that idea than I expected. You can <TextLink href="/under-the-hood">look under the hood</TextLink> if that sort of thing interests you.</p>
            </div>
          </section>

          <section className={sectionClass} aria-labelledby="grow-heading">
            <h2 id="grow-heading" className={headingClass}>Built to grow without becoming a mess</h2>
            <div className={proseClass}>
              <p>The useful bit of having all this underneath is that Mahjong Reference does not have to remain the thing it is today.</p>
              <p>A new ruleset does not necessarily need a new app. A different scoring system does not have to pretend to be British Mahjong with different numbers. A reference page, worked example, comparison or future table tool should not need its own private copy of the rules.</p>
              <p>The aim is to establish things once, keep their context attached, and then use them wherever they are useful.</p>
              <p>That leaves quite a lot of room: more rules, different scoring systems, local ways of playing, better explanations, deeper reference material and things I have not thought of yet.</p>
              <p>Not everything is implemented, and not every kind of Mahjong will fit neatly into the same shape. That is rather the point.</p>
            </div>
          </section>

          <section className={sectionClass} aria-labelledby="started-heading">
            <h2 id="started-heading" className={headingClass}>How this started</h2>
            <div className={proseClass}>
              <p>I joined some friends for a game of Mahjong without our usual expert helper.</p>
              <p>Then we got to scoring.</p>
              <p>We could all do the maths. Remembering all the rules, exceptions and what happened next was the difficult bit. So I wondered whether I could make something that helped.</p>
              <p>I thought I was building a calculator. Apparently not.</p>
            </div>
          </section>

          <section className={sectionClass} aria-labelledby="learning-heading">
            <h2 id="learning-heading" className={headingClass}>Still learning</h2>
            <div className={proseClass}>
              <p>I am learning Mahjong as I build this.</p>
              <p>What I am quite good at is taking something complicated, pulling it apart until I understand how the pieces relate, and putting it back together in a way that is easier to use.</p>
              <p>Here, that means checking sources, keeping different rules separate, testing what the software actually does and leaving uncertainty visible when I cannot resolve it.</p>
              <p>There will be things to correct. The system should make that easier, not embarrassing.</p>
            </div>
          </section>

          <section className="max-w-[680px] pb-12 sm:pb-16" aria-labelledby="useful-heading">
            <h2 id="useful-heading" className={headingClass}>Use whatever bit is useful</h2>
            <nav aria-label="Explore Mahjong Reference" className="mt-5 text-[14px] leading-8 sm:mt-6 sm:text-[15px]">
              <TextLink href="/hand">Score a hand</TextLink><span aria-hidden="true" className="px-2 text-[#9b9a8d]">·</span>
              <TextLink href="/game">Track a game</TextLink><span aria-hidden="true" className="px-2 text-[#9b9a8d]">·</span>
              <TextLink href="/rules">Explore the rules</TextLink><span aria-hidden="true" className="px-2 text-[#9b9a8d]">·</span>
              <TextLink href="/how-it-works">See how it works</TextLink><span aria-hidden="true" className="px-2 text-[#9b9a8d]">·</span>
              <TextLink href="/under-the-hood">Look under the hood</TextLink><span aria-hidden="true" className="px-2 text-[#9b9a8d]">·</span>
              <TextLink href="/whats-new">See what’s new</TextLink>
            </nav>
          </section>

          <section className="border-t border-[#ddd3bf] pt-8 pb-8 sm:pt-10 sm:pb-10" aria-labelledby="practical-heading">
            <h2 id="practical-heading" className="font-serif text-[25px] leading-tight text-[#284d45]">A few practical details</h2>
            <div className="mt-4 max-w-[680px] space-y-4 text-[14px] leading-6 text-[#596b65] sm:text-[15px]">
              <p>Mahjong Reference is free to use in your browser and does not require an account. An in-progress game can be recovered from this browser on this device; it is saved locally rather than to an account. See the <TextLink href="/help#account">help and common questions</TextLink> for more about game recovery.</p>
              <p>I haven&apos;t got round to making a feedback or contact form for this yet. If you love it or hate it, tell your friends and one day I may find out.</p>
              <p>Tile illustrations use the Regular SVG set from <strong className="text-[#284d45]">xhokir/riichi-mahjong-tiles</strong>, based on <strong className="text-[#284d45]">FluffyStuff/riichi-mahjong-tiles</strong>, under the <ExternalTextLink href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International licence</ExternalTextLink>.</p>
              <p>If Mahjong Reference has helped, you can <a href="https://buymeacoffee.com/sharronmo" target="_blank" rel="noreferrer" className={textLinkClass}>support its continued development</a>. There is absolutely no requirement to do so.</p>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
