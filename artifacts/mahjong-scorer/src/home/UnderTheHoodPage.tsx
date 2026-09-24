import {
  ArrowRight,
  BookOpen,
  Calculator,
  FileCheck2,
  GitBranch,
  Layers3,
  Scale,
  SearchCheck,
  ShieldCheck,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { ReturnToGame } from '../components/ReturnToGame';

type Principle = {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
};

const principles: Principle[] = [
  {
    icon: BookOpen,
    title: 'Start with an identified source',
    text: 'Mahjong Reference does not treat Mahjong as one universal rulebook. Each supported rules profile has its own source basis, scope and implementation status.',
  },
  {
    icon: GitBranch,
    title: 'Keep the exact rules context',
    text: 'A rules profile and version stay attached to the hand or game that uses them. A recovered game should not silently become a different ruleset later.',
  },
  {
    icon: SearchCheck,
    title: 'Use the evidence the table actually supplied',
    text: 'Tiles, sets, the winning tile, game context and resolved table facts can all matter. Missing evidence stays missing rather than being filled in with a convenient assumption.',
  },
  {
    icon: Calculator,
    title: 'Calculate the score first',
    text: 'The scorer applies the selected profile to the evidence it has and produces the hand result and explanation it can support.',
  },
  {
    icon: Scale,
    title: 'Settle the table separately',
    text: 'A hand score is not automatically the same thing as who pays whom. Settlement belongs to the selected profile and consumes the accepted hand result.',
  },
  {
    icon: Layers3,
    title: 'Progress the game separately again',
    text: 'Dealer, East, prevailing Wind, rounds and game-end rules are not universal Mahjong constants. Progression is handled by the rules profile rather than hidden in the scorer.',
  },
];

export function UnderTheHoodPage() {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8 lg:py-14">
        <ReturnToGame />
        <article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]">
          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
            <div className="mb-4 flex items-center gap-3">
              <div className="fine-rule w-10" />
              <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Under the hood</span>
            </div>
            <h1 className="max-w-[860px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">
              How Mahjong Reference knows what it knows.
            </h1>
            <p className="mt-5 max-w-[780px] text-[16px] leading-7 text-[#596b65]">
              The useful answer is not just a number. It is knowing which rules were used, what evidence was available, how the score was reached, what happened to the table afterwards and whether every part of the record still tells the same story.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/rules" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#284d45] px-4 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                See supported rules <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a href="/how-it-works" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                See the product walkthrough <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[760px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">The reasoning chain</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">Rules → evidence → score → settlement → progression → record.</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">
                Keeping these stages separate matters. Different Mahjong traditions can share familiar-looking tiles and hand shapes while disagreeing about qualification, value, payment, dealer behaviour or how the game moves on.
              </p>
            </div>
            <ol className="mt-7 grid gap-3 md:grid-cols-2">
              {principles.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#efe8da] text-[#477562]">
                      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#ae6249]">0{index + 1}</div>
                      <h3 className="mt-1 font-serif text-[22px] leading-tight text-[#284d45]">{title}</h3>
                      <p className="mt-2 text-[12px] leading-6 text-[#66746e]">{text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6">
                <ShieldCheck size={20} className="text-[#477562]" aria-hidden="true" />
                <h2 className="mt-4 font-serif text-[28px] leading-tight text-[#284d45]">Unknown means unknown.</h2>
                <p className="mt-3 text-[13px] leading-6 text-[#596b65]">
                  If a result depends on a fact you have not supplied, Mahjong Reference should ask when necessary, calculate only what the evidence supports, or leave the uncertain conclusion out. It should not silently invent the favourable answer.
                </p>
              </div>
              <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6">
                <FileCheck2 size={20} className="text-[#477562]" aria-hidden="true" />
                <h2 className="mt-4 font-serif text-[28px] leading-tight text-[#284d45]">One recorded state, one story.</h2>
                <p className="mt-3 text-[13px] leading-6 text-[#596b65]">
                  Confirmed hand evidence and results feed the same game history used for settlement, running totals, progression, recovery and the record you print or save. Those surfaces should agree because they are not separate retellings of the game.
                </p>
              </div>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[780px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">Sources and provenance</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">Sources are evidence, not decoration.</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">
                Supported profiles are tied to identified rulebooks, books or evidence records. Their source status is visible because not every profile has the same maturity: some are stable, some are deliberately provisional, and a source basis never implies affiliation or endorsement by an author or rules body.
              </p>
              <p className="mt-4 text-[13px] leading-6 text-[#596b65]">
                The next provenance work is to turn those references into reusable source records: title, author or issuing body, edition or version, which profile uses the source, what it contributes, and appropriate links. Retail links, where useful, will remain optional metadata on the source record rather than part of the rules authority.
              </p>
              <a href="/rules" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                See current rules provenance <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
          </section>

          <section className="px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="rounded-xl bg-[#284d45] p-5 text-[#f8f4e9] sm:p-7">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#d7a287]">One source of truth</div>
              <h2 className="mt-2 max-w-[760px] font-serif text-[32px] leading-tight">Establish what is true once. Reuse it everywhere.</h2>
              <p className="mt-3 max-w-[800px] text-[13px] leading-6 text-[#c8d5d0]">
                The long-term direction is for the rules engine, calculator explanations, examples, comparisons and learning/reference pages to consume the same versioned, source-linked rule treatments. Facts should be shared; teaching can still be written for humans around those facts.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/help" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#f3e8d4] px-4 text-[11px] font-semibold text-[#284d45] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a287]">
                  Open User Guide <ArrowRight size={14} aria-hidden="true" />
                </a>
                <a href="/features" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#55756c] px-4 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#355950] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a287]">
                  See product features <ArrowRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
