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
              Hi. I’m SMooks. I accidentally built a Mahjong knowledge system.
            </h1>
            <div className="mt-7 max-w-[760px] space-y-5 text-[16px] leading-8 text-[#596b65]">
              <p>In early September 2026, I joined some friends for our first Mahjong game without an expert helper at the table, and it came to scoring.</p>
              <p>We could all do the maths.</p>
              <p>What we couldn't easily do was hold all of the rules, exceptions, scoring patterns and sequences in our heads while also trying to play the game.</p>
              <p>I'm fairly confident I won the game. None of us could prove it.</p>
              <p>So I wondered whether I could build something to help.</p>
              <p>I thought I was making a calculator.</p>
              <p className="font-serif text-[30px] font-semibold leading-tight text-[#ae6249]">That escalated.</p>
            </div>
          </header>

          <section className="border-b border-[#ddd3bf] px-5 py-10 sm:px-8 sm:py-12 lg:px-12" aria-labelledby="questions-heading">
            <div className="max-w-[760px]">
              <h2 id="questions-heading" className="font-serif text-[34px] leading-tight text-[#284d45]">One question kept creating another</h2>
              <div className="mt-6 space-y-5 text-[15px] leading-7 text-[#596b65]">
                <p>The first question was simple:</p>
                <p className="font-serif text-[23px] leading-snug text-[#284d45]">Can I work out what this hand is worth?</p>
                <p>Yes.</p>
                <p>But then:</p>
                <p>What if I don't just want the answer? What if I want to know why?</p>
                <p>Can I show which rules contributed to the score?</p>
                <p>Can I explain where each number came from?</p>
                <p>Can I make it possible for somebody who doesn't already know the rules to follow the reasoning?</p>
                <p>Yes.</p>
                <p>Then:</p>
                <p>What if the hand is only one part of the problem?</p>
                <p>What happens after somebody wins?</p>
                <p>Who pays whom?</p>
                <p>Does East stay East?</p>
                <p>Which Wind comes next?</p>
                <p>What needs to be remembered for the next hand?</p>
                <p>Can the system carry all of that forward rather than making the players do it separately?</p>
                <p>Yes.</p>
                <p>So the calculator started becoming a Table Companion.</p>
                <p>Then another question appeared:</p>
                <p>What if people don't all play the same rules?</p>
                <p>What if one group plays British Mahjong?</p>
                <p>What if another plays Western rules?</p>
                <p>What if a club follows a published ruleset but changes three things?</p>
                <p>What if somebody learned from a book written decades ago and has always played that way?</p>
                <p>Could the system understand the difference?</p>
                <p>Could it apply the right rules without pretending there is only one correct version of Mahjong?</p>
                <p>That question sent me somewhere much more interesting.</p>
                <p>What if the rules themselves are the real problem?</p>
                <p>What if the knowledge I need isn't neatly written down in one place?</p>
                <p>What if it lives across books, websites, old documents, club guides, translations, personal notes and people's memories?</p>
                <p>What if two credible sources disagree?</p>
                <p>What if the same term means slightly different things in different traditions?</p>
                <p>What if a rule changed over time?</p>
                <p>What if something everybody “knows” turns out to be surprisingly difficult to source?</p>
                <p>Could I collect all of that without losing where it came from?</p>
                <p>Could I distinguish a documented rule from somebody's interpretation of it?</p>
                <p>Could I record uncertainty rather than quietly filling in the gaps?</p>
                <p>Could I represent several versions of the same idea without forcing them into one artificial answer?</p>
                <p>And then:</p>
                <p>What if I could structure all of that knowledge?</p>
                <p>Not just store documents.</p>
                <p>Actually break the knowledge down into concepts, conditions, exceptions, relationships and rules.</p>
                <p>Could I make it searchable?</p>
                <p>Could I connect related ideas?</p>
                <p>Could somebody start with a question about one hand and follow the knowledge outward until they understood the wider rule?</p>
                <p>Could it become a learning resource as well as a calculator?</p>
                <p>And then the question that has probably kept me busiest:</p>
                <p>What if the same knowledge could be understood by both humans and machines?</p>
                <p>Could the human-readable explanation and the machine-readable rule come from the same underlying model?</p>
                <p>Could the calculator apply a rule and also explain exactly why it applied?</p>
                <p>Could a change to the underlying knowledge flow through to the reference material, the scorer and the Table Companion rather than being manually recreated in three different places?</p>
                <p>Could one structured body of knowledge support many different ways of using it?</p>
                <p>And, eventually:</p>
                <p>What if the system could understand how <strong className="text-[#284d45]">your</strong> table plays?</p>
                <p>Not just “choose British” or “choose Western”.</p>
                <p>What if you could say:</p>
                <blockquote className="border-l-2 border-[#cfa58f] pl-4 font-serif text-[20px] leading-snug text-[#284d45]">“We mostly play this version, but we use this rule, we don't use that one, and our club does this part differently.”</blockquote>
                <p>Could the system understand that too?</p>
                <p>I don't have all of those answers yet.</p>
                <p>Some of them are working. Some are taking shape. Some are still questions.</p>
                <p>But that sequence of <em>what if?</em> has become the project.</p>
                <p>Every time I think I've reached the edge of the problem, another question appears behind it.</p>
                <p>And apparently I find that extremely difficult to resist.</p>
              </div>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
            <div className="max-w-[760px] space-y-5 text-[15px] leading-7 text-[#596b65]">
              <h2 className="font-serif text-[34px] leading-tight text-[#284d45]">The rules became the interesting problem</h2>
              <p>Mahjong has been played for a long time, in a lot of places, by a lot of people.</p>
              <p>The knowledge isn't sitting neatly in one database waiting to be programmed. It lives in books, websites, old documents, club guides, translations, personal notes and people's memories.</p>
              <p>Terminology changes. Rules evolve. Credible sources disagree. Different groups deliberately play differently.</p>
              <p>That became fascinating to me.</p>
              <p>Could I structure that knowledge without flattening away the differences?</p>
              <p>Keep the evidence attached?</p>
              <p>Separate a sourced rule from an interpretation?</p>
              <p>Represent disagreement and uncertainty instead of quietly choosing whichever answer was convenient?</p>
              <p>And turn the result into something both people and software could use?</p>
              <p>That's now one of the central problems Mahjong Reference is trying to solve.</p>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
            <div className="max-w-[760px] space-y-5 text-[15px] leading-7 text-[#596b65]">
              <h2 className="font-serif text-[34px] leading-tight text-[#284d45]">One body of knowledge, used in different ways</h2>
              <p>This is where I am heading.</p>
              <p><strong className="text-[#284d45]">For people:</strong> a clear, searchable reference that helps someone understand the game, explore different rules and find out why something works the way it does.</p>
              <p><strong className="text-[#284d45]">For the scorer:</strong> machine-readable rules that can be applied consistently and explained, rather than relying on somebody remembering every condition and exception.</p>
              <p><strong className="text-[#284d45]">For the table:</strong> a companion that knows which rules this group is using and carries them through scoring, settlement and the game.</p>
              <p>Eventually, I would like it to understand the thing Mahjong players already do naturally:</p>
              <blockquote className="border-l-2 border-[#cfa58f] pl-4 font-serif text-[20px] leading-snug text-[#284d45]">“We mostly play this version, except we use this rule, and at our club we do this bit differently.”</blockquote>
              <p>That's considerably harder than building a calculator.</p>
              <p>Which is probably why I find it interesting.</p>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
            <div className="max-w-[760px] space-y-5 text-[15px] leading-7 text-[#596b65]">
              <h2 className="font-serif text-[34px] leading-tight text-[#284d45]">I am learning this as I build it</h2>
              <p>I didn't begin this project as a Mahjong expert.</p>
              <p>I don't want the software to become confident simply because I have misunderstood something confidently.</p>
              <p>So I've become slightly obsessed with sources, provenance, testing, contradictions, edge cases and making uncertainty visible.</p>
              <p>Where evidence is incomplete, I want Mahjong Reference to say so.</p>
              <p>Where rules differ, I want it to preserve the difference.</p>
              <p>And where I've got something wrong, I want to be able to trace it, correct it and make the system better.</p>
              <p>The next important part is putting what I've built in front of people who know far more about Mahjong than I do.</p>
              <p>I'm genuinely looking forward to seeing what survives contact with expertise.</p>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
            <div className="max-w-[760px] space-y-5 text-[15px] leading-7 text-[#596b65]">
              <h2 className="font-serif text-[34px] leading-tight text-[#284d45]">So what is Mahjong Reference?</h2>
              <p>Right now, Mahjong Reference is a rules-aware scoring, learning and table companion built on a growing structured model of Mahjong knowledge.</p>
              <p>You can score a hand, see why it scored that way, follow a game through settlement and Wind progression, and explore how different Mahjong rules treat the same ideas.</p>
              <p>The rules and reference side is growing alongside it.</p>
              <p>The longer-term idea is more ambitious:</p>
              <p className="font-serif text-[20px] leading-8 text-[#284d45]">Take fragmented human knowledge.<br />Structure it.<br />Keep the evidence attached.<br />Make it understandable to people.<br />Make it executable by machines.<br />Then build useful things on top of it.</p>
              <p>I don't yet know how far I will take it.</p>
              <p>For now, I'm following the questions and seeing where they lead.</p>
              <p>That seems to be how this whole thing got here in the first place.</p>
            </div>
          </section>

          <section className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
            <div className="max-w-[760px]">
              <h2 className="font-serif text-[29px] leading-tight text-[#284d45]">A few practical things</h2>
              <div className="mt-5 space-y-5 text-[14px] leading-6 text-[#596b65]">
                <section>
                  <h3 className="font-semibold text-[#284d45]">Independent project</h3>
                  <p className="mt-1">Mahjong Reference is genuinely independent. It isn't backed by a company, institution or Mahjong organisation. It isn't sponsored by, affiliated with or acting on behalf of a Mahjong society or association, and nobody commissioned me to build it. It started because I found a question interesting, and the side project became considerably more elaborate than expected.</p>
                  <p className="mt-2">Where I use published rules or other people's work, I try to make the source and relationship clear. That doesn't imply endorsement in either direction. In particular, <strong className="text-[#284d45]">Mahjong Reference is not an official British Mah-Jong Association product and does not claim BMJA endorsement.</strong></p>
                </section>
                <section>
                  <h3 className="font-semibold text-[#284d45]">Rules and sources</h3>
                  <p className="mt-1">The <a href="/rules" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Rules area</a> shows the profiles currently supported, their boundaries and the sources used. Support and confidence vary between rulesets. I would rather tell you that something isn't yet known than invent certainty to fill the gap.</p>
                </section>
                <section>
                  <h3 className="font-semibold text-[#284d45]">No account required</h3>
                  <p className="mt-1">Ordinary scoring and game tracking happen in your browser. In-progress recovery is stored locally on your device rather than in a Mahjong Reference account.</p>
                </section>
                <section>
                  <h3 className="font-semibold text-[#284d45]">Licensing</h3>
                  <p className="mt-1">The project's original software code is licensed under the MIT License. Third-party material keeps its own licence.</p>
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
