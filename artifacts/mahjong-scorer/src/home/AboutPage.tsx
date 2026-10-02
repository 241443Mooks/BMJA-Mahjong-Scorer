import { ArrowRight, Coffee, ExternalLink, Palette } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';

const storyLinkClass = 'font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 transition hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]';

function StoryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} className={storyLinkClass}>{children}</a>;
}

function ExternalTextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 transition hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
    >
      {children}
      <ExternalLink size={12} aria-hidden="true" />
    </a>
  );
}

function StoryStep({ number, question, children, next }: {
  number: string;
  question: string;
  children: React.ReactNode;
  next?: string;
}) {
  return (
    <section className="relative border-l border-[#c9b99d] pb-9 pl-5 last:border-l-transparent last:pb-0 sm:pl-8" aria-labelledby={`story-${number}`}>
      <span aria-hidden="true" className="absolute -left-[13px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-[#c9b99d] bg-[#fbf8ed] font-mono text-[9px] text-[#ae6249]">{number}</span>
      <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#ae6249]">Question {number}</div>
      <h2 id={`story-${number}`} className="mt-2 max-w-[760px] font-serif text-[27px] leading-tight text-[#284d45] sm:text-[32px]">{question}</h2>
      <div className="mt-4 max-w-[760px] space-y-3 text-[14px] leading-7 text-[#596b65] sm:text-[15px]">{children}</div>
      {next && <p className="mt-4 max-w-[760px] border-l-2 border-[#d7a287] pl-3 font-serif text-[17px] leading-6 text-[#ae6249]">That left me wondering: {next}</p>}
    </section>
  );
}

function NextLinks() {
  const links = [
    ['Score a hand', '/hand'],
    ['Track a game', '/game'],
    ['Explore the rules', '/rules'],
    ['Compare Mahjong rules', '/mahjong-rules-compared'],
    ['Work through scoring examples', '/scoring-examples'],
    ['See how the Table Companion works', '/how-it-works'],
    ['Look under the hood', '/under-the-hood'],
  ];
  return (
    <nav aria-label="Explore Mahjong Reference" className="mt-5 flex flex-wrap gap-2">
      {links.map(([label, href]) => <a key={href} href={href} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#c9b99d] bg-[#fdfbf5] px-4 py-2 text-[12px] font-semibold text-[#284d45] transition hover:border-[#ae6249] hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{label}<ArrowRight size={13} aria-hidden="true" /></a>)}
    </nav>
  );
}

export function AboutPage() {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8 lg:py-14">
        <article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]">
          <header className="border-b border-[#ddd3bf] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
            <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">A question, and then another</div>
            <h1 className="mt-3 max-w-[820px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">I&apos;m SMooks, I made this.</h1>
            <div className="mt-7 max-w-[760px] space-y-4 text-[15px] leading-7 text-[#596b65] sm:text-[16px] sm:leading-8">
              <p>I followed a question about Mahjong rather further than expected.</p>
              <p>Our first game without an expert helper reached the scoring stage. Eventually somebody won, but I could not prove that I had definitely won. We could all do the maths; holding the rules, exceptions, patterns and sequence in mind was the hard part.</p>
              <p className="font-serif text-[24px] font-semibold leading-tight text-[#ae6249] sm:text-[28px]">Could I build something that worked it out for us?</p>
              <p>Here&apos;s where that question led.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-[13px]"><StoryLink href="/hand">Try the hand scorer</StoryLink><StoryLink href="/how-it-works">See the Table Companion walkthrough</StoryLink></div>
          </header>

          <div className="px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
            <div className="max-w-[840px]">
              <StoryStep number="01" question="What is this hand worth — and why?" next="could I carry the answer forward through a whole game?">
                <p><strong className="font-serif text-[18px] text-[#ae6249]">I thought I was making a calculator. That escalated.</strong> A number on its own was not much help: I wanted to see which rules contributed to it, and how the hand had been read.</p>
                <p>That meant building an explanation alongside the score. You can <StoryLink href="/hand">score a hand</StoryLink> or follow the reasoning through <StoryLink href="/scoring-examples">worked scoring examples</StoryLink>.</p>
              </StoryStep>

              <StoryStep number="02" question="What happens after the hand?" next="what if the next table uses different rules?">
                <p>A hand ends with more than a score. Who pays whom? Does East stay East? Which Wind comes next? What should still be there when the game is reopened?</p>
                <p>The tool grew into a table companion that connects <strong className="text-[#284d45]">rules → evidence → score → settlement → progression → record</strong>. <StoryLink href="/game">Track a game</StoryLink>, or <StoryLink href="/how-it-works">see how those parts fit together</StoryLink>.</p>
              </StoryStep>

              <StoryStep number="03" question="What if another table plays differently?" next="where did each rule come from, and what if sources disagree?">
                <p>Familiar tiles do not mean one universal rules model. Published rulesets, club variations, book-based Western games and long-standing table traditions can ask different things of a scorer.</p>
                <p>I wanted to represent those differences without quietly picking one as the “real” Mahjong. The <StoryLink href="/rules">rules reference</StoryLink> shows the profiles currently supported; <StoryLink href="/mahjong-rules-compared">the comparison</StoryLink> helps make the differences visible.</p>
              </StoryStep>

              <StoryStep number="04" question="Could I keep the uncertainty attached?" next="could the software remember why it believed something?">
                <p>Looking across books, association rules, websites, old documents, club guides and editions, I found different names, changing rules and sources that did not always agree. Sometimes the answer was hard to pin down.</p>
                <p>I did not want to fill those gaps with confident guesses. Source, version, interpretation and unresolved questions became part of the work. <StoryLink href="/rules">Explore the rules and their source status</StoryLink>.</p>
              </StoryStep>

              <StoryStep number="05" question="What if people and software could share the same knowledge?" next="could the same knowledge support play, learning and comparison?">
                <p>When code, explanations, examples and comparisons each keep their own copy of a rule, those copies can drift. The direction I am exploring is to establish what is known once, keep where it came from, and reuse it.</p>
                <p>The page you read should be a view of that knowledge, not another hidden rules database. That question led to structured concepts for hands, patterns, scoring conditions, profiles, sources, relationships and things still unresolved. For the architecture and evidence behind that direction, <StoryLink href="/under-the-hood">look under the hood</StoryLink>.</p>
              </StoryStep>

              <StoryStep number="06" question="What if your table mostly follows a profile, but changes a few things?">
                <p>Some variation may be local; some changes the scoring grammar itself. Not every difference fits a checkbox, and not all of this is solved. Some parts work, some are taking shape, and some are still questions waiting to be investigated.</p>
                <p>Every time I think I have reached the edge of the problem, another question appears just behind it. Apparently I find that extremely difficult to resist.</p>
              </StoryStep>
            </div>
          </div>

          <section className="border-t border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12" aria-labelledby="learning-heading">
            <div className="max-w-[780px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">Still learning, still building</div>
              <h2 id="learning-heading" className="mt-2 font-serif text-[31px] leading-tight text-[#284d45] sm:text-[36px]">I don&apos;t want the software to become confident because I misunderstood something confidently.</h2>
              <div className="mt-4 space-y-3 text-[14px] leading-7 text-[#596b65] sm:text-[15px]">
                <p>I did not begin as a Mahjong authority; I am learning as I build. That makes it especially important to check sources, keep versions and traditions distinct, test concrete behaviour, and leave uncertainty visible when I cannot settle a question.</p>
                <p>I hope people with deeper experience of a particular tradition will spot what I have missed and help correct it. The work should make that correction possible to inspect.</p>
              </div>
            </div>
          </section>

          <section className="border-t border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12" aria-labelledby="now-heading">
            <div className="max-w-[780px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">Where the question has led</div>
              <h2 id="now-heading" className="mt-2 font-serif text-[33px] leading-tight text-[#284d45] sm:text-[38px]">So what is Mahjong Reference now?</h2>
              <p className="mt-4 text-[15px] leading-7 text-[#596b65]">A growing rules-aware scoring, learning and table system built on structured Mahjong knowledge.</p>
              <NextLinks />
              <p className="mt-7 max-w-[700px] font-serif text-[20px] leading-8 text-[#ae6249]">Take fragmented human knowledge. Structure it without losing its differences. Keep the evidence attached. Make it understandable to people, and make the parts that can be executable usable by machines. Then see what useful things can be built on top.</p>
              <p className="mt-4 font-serif text-[23px] text-[#284d45]">I don&apos;t know yet how far that question leads. That is rather the point.</p>
            </div>
          </section>

          <section className="border-t border-[#ddd3bf] px-5 py-8 sm:px-8 sm:py-10 lg:px-12" aria-labelledby="practical-heading">
            <div className="max-w-[780px]">
              <h2 id="practical-heading" className="font-serif text-[27px] leading-tight text-[#284d45]">A few practical details</h2>
              <p className="mt-3 text-[14px] leading-6 text-[#596b65]">An in-progress game can be recovered from this browser on this device; it is saved in the browser rather than to an account. See the <StoryLink href="/help#account">help and common questions</StoryLink> for more about current game recovery.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <section className="rounded-xl border border-[#ddd3bf] bg-[#fdfbf5] p-5">
                  <div className="flex items-center gap-3"><Palette size={18} className="text-[#477562]" aria-hidden="true" /><h3 className="font-serif text-[21px] text-[#284d45]">Tile artwork</h3></div>
                  <p className="mt-3 text-[13px] leading-6 text-[#596b65]">Tile illustrations use the Regular SVG set from <strong className="text-[#284d45]">xhokir/riichi-mahjong-tiles</strong>, based on <strong className="text-[#284d45]">FluffyStuff/riichi-mahjong-tiles</strong>, under the <ExternalTextLink href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International licence</ExternalTextLink>.</p>
                </section>
                <section className="rounded-xl border border-[#ddd3bf] bg-[#fdfbf5] p-5">
                  <div className="flex items-center gap-3"><Coffee size={18} className="text-[#ae6249]" aria-hidden="true" /><h3 className="font-serif text-[21px] text-[#284d45]">Support the project</h3></div>
                  <p className="mt-3 text-[13px] leading-6 text-[#596b65]">If Mahjong Reference has helped you understand a rule, score a hand or avoid an argument around the table, you can support its continued development. There is absolutely no requirement to do so.</p>
                  <a href="https://buymeacoffee.com/sharronmo" target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[14px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2"><Coffee size={15} aria-hidden="true" /> Buy me a coffee</a>
                </section>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
