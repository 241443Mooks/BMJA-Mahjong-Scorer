import {
  ArrowRight,
  BookOpen,
  Calculator,
  Coffee,
  ExternalLink,
  Gamepad2,
  Github,
  Info,
  Palette,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';

type ActionLink = {
  title: string;
  description: string;
  href: string;
  icon: typeof Calculator;
};

const projectActions: ActionLink[] = [
  {
    title: 'Score a game',
    description: 'Track four players hand by hand, settle payments and keep running totals.',
    href: '/game',
    icon: Gamepad2,
  },
  {
    title: 'Score a hand',
    description: 'Build one hand in detail and see how its points, doubles and patterns are calculated.',
    href: '/hand',
    icon: Calculator,
  },
  {
    title: 'Learn as you go',
    description: 'Use the gameplay, scoring and special-hand guides alongside the table.',
    href: '/guide',
    icon: BookOpen,
  },
];

const beginnerPrinciples = [
  'Enter the tiles you can see instead of learning scoring categories first.',
  'Let the scorer detect patterns where the evidence is already present.',
  'Ask short follow-up questions only when the answer cannot safely be inferred.',
] as const;

function ProjectAction({ title, description, href, icon: Icon }: ActionLink) {
  return (
    <a
      href={href}
      className="group flex min-h-[148px] flex-col justify-between rounded-xl border border-[#ddd3bf] bg-[#fdfbf5] p-5 transition hover:-translate-y-0.5 hover:border-[#c9b99d] hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#efe8da] text-[#477562]">
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <ArrowRight size={15} className="mt-1 shrink-0 text-[#ae6249] transition-transform group-hover:translate-x-1" />
      </div>
      <div className="mt-6">
        <h3 className="font-serif text-[22px] leading-tight text-[#284d45]">{title}</h3>
        <p className="mt-1.5 text-[11px] leading-5 text-[#6d746f]">{description}</p>
      </div>
    </a>
  );
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
          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
            <div className="mb-4 flex items-center gap-3">
              <div className="fine-rule w-10" />
              <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Independent project</span>
            </div>
            <h1 className="max-w-[780px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">
              British Mahjong is easier to enjoy when the rules are easier to see.
            </h1>
            <p className="mt-5 max-w-[760px] text-[15px] leading-7 text-[#596b65]">
              British Mahjong Scorer is a small independent project built to make British Mahjong easier to
              <strong className="text-[#284d45]"> score, understand and learn while you play</strong>.
            </p>
            <p className="mt-4 max-w-[760px] text-[14px] leading-7 text-[#596b65]">
              The aim is not to turn the game into a screen, or to make players memorise a scoring engine. It is to take care of the awkward bookkeeping and surface the useful rule at the moment it matters.
            </p>

            <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#284d45] p-5 text-[#f8f4e9]">
              <Sparkles size={18} className="mt-1 shrink-0 text-[#d7a287]" />
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#d7a287]">Project principle</div>
                <p className="mt-1 font-serif text-[21px] leading-snug">Explain the game. Don’t make the player learn the scoring engine.</p>
              </div>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-7 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <Info size={17} className="text-[#ae6249]" />
                  <h2 className="font-serif text-[30px] leading-tight text-[#284d45]">Why this exists</h2>
                </div>
                <p className="text-[14px] leading-7 text-[#596b65]">
                  British Mahjong contains lots of individually manageable rules — Pungs and Kongs, concealed and exposed sets, Winds, Flowers, Seasons, doubles, special hands, fishing and settlement. The difficult part is remembering how they interact while four people are trying to play.
                </p>
              </div>

              <div className="rounded-xl border border-[#d8ceb8] bg-[#f5eadb] p-5 sm:p-6">
                <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#ae6249]">Three jobs</div>
                <ol className="mt-4 space-y-4">
                  {[
                    ['01', 'Score the hand accurately.'],
                    ['02', 'Explain why it scored that way.'],
                    ['03', 'Help newer players understand the game without requiring them to study everything first.'],
                  ].map(([number, text]) => (
                    <li key={number} className="flex gap-3">
                      <span className="mt-0.5 font-mono text-[10px] text-[#ae6249]">{number}</span>
                      <span className="text-[13px] leading-6 text-[#284d45]">{text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <h2 className="font-serif text-[30px] leading-tight text-[#284d45]">What you can do here</h2>
            <p className="mt-3 max-w-[720px] text-[13px] leading-6 text-[#66746e]">
              The scorer and the learning pages use the same underlying rules, so the explanation should match what happens at the table.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {projectActions.map((action) => (
                <ProjectAction key={action.title} {...action} />
              ))}
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-10">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <Scale size={18} className="text-[#ae6249]" />
                  <h2 className="font-serif text-[30px] leading-tight text-[#284d45]">Rules and sources</h2>
                </div>
                <p className="text-[13px] leading-6 text-[#596b65]">
                  The project uses British Mahjong / BMJA-style rules. The main public rules reference used during development is <ExternalTextLink href="https://mahjongbritishrules.wordpress.com/">Mah-Jong British Rules</ExternalTextLink>.
                </p>
                <p className="mt-3 text-[13px] leading-6 text-[#596b65]">
                  Implementation decisions and known ambiguities are also recorded in the project’s engineering rules reference rather than hidden inside the code.
                </p>
              </div>

              <div className="rounded-xl border border-[#c9b99d] bg-[#fdfbf5] p-5 sm:p-6">
                <div className="flex gap-3">
                  <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#477562]" />
                  <div>
                    <h3 className="font-serif text-[21px] text-[#284d45]">Independent, and deliberately transparent</h3>
                    <p className="mt-2 text-[12px] leading-6 text-[#66746e]">
                      British Mahjong Scorer is not an official British Mah-Jong Association product and does not claim BMJA endorsement. Where a rule is uncertain, the project should say so rather than quietly invent certainty.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
              <div>
                <h2 className="font-serif text-[30px] leading-tight text-[#284d45]">Designed for beginners too</h2>
                <p className="mt-3 text-[13px] leading-6 text-[#596b65]">
                  A lot of Mahjong material is easiest to use once you already know what you are looking for. This project takes the opposite approach.
                </p>
                <ul className="mt-5 space-y-3">
                  {beginnerPrinciples.map((principle) => (
                    <li key={principle} className="flex gap-3 text-[12px] leading-6 text-[#596b65]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ae6249]" />
                      <span>{principle}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6">
                <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#ae6249]">No account required</div>
                <p className="mt-3 text-[13px] leading-6 text-[#596b65]">
                  The scorer is designed as a lightweight browser-based tool and does not require an account to score a hand or game. The project favours simple browser-side features where they are sufficient rather than adding servers or databases without a clear reason.
                </p>
              </div>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-[#ddd3bf] bg-[#fdfbf5] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <Palette size={18} className="text-[#477562]" />
                  <h2 className="font-serif text-[24px] text-[#284d45]">Tile artwork</h2>
                </div>
                <p className="mt-3 text-[12px] leading-6 text-[#66746e]">
                  The tile illustrations come from the Regular SVG set from <strong className="text-[#284d45]">xhokir/riichi-mahjong-tiles</strong>, based on <strong className="text-[#284d45]">FluffyStuff/riichi-mahjong-tiles</strong>.
                </p>
                <p className="mt-3 text-[12px] leading-6 text-[#66746e]">
                  They are used under the <ExternalTextLink href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International licence</ExternalTextLink>.
                </p>
              </div>

              <div className="rounded-xl border border-[#ddd3bf] bg-[#fdfbf5] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <Github size={18} className="text-[#477562]" />
                  <h2 className="font-serif text-[24px] text-[#284d45]">Built in the open</h2>
                </div>
                <p className="mt-3 text-[12px] leading-6 text-[#66746e]">
                  Development takes place in the public GitHub repository. The project’s original software code is licensed under the MIT License; third-party artwork keeps its own licence.
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
                  <ExternalTextLink href="https://github.com/241443Mooks/BMJA-Mahjong-Scorer">View the GitHub repository</ExternalTextLink>
                  <ExternalTextLink href="https://mahjong.smooks.co.uk">Open the live site</ExternalTextLink>
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="rounded-xl border border-[#cfbfa4] bg-[#f5eadb] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6">
              <div className="max-w-[650px]">
                <div className="flex items-center gap-3">
                  <Coffee size={18} className="text-[#ae6249]" />
                  <h2 className="font-serif text-[25px] text-[#284d45]">Support the project</h2>
                </div>
                <p className="mt-2 text-[12px] leading-6 text-[#596b65]">
                  If the scorer has made a game easier to score, helped explain a rule or saved an argument over the table, you can support its continued development. There is no requirement to contribute.
                </p>
              </div>
              <a
                href="https://buymeacoffee.com/sharronmo"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2 sm:mt-0"
              >
                <Coffee size={15} /> Buy me a coffee
              </a>
            </div>

            <p className="mt-6 text-[10px] leading-5 text-[#8c8a7f]">
              The name British Mahjong Scorer describes the style of play this project supports. It does not imply ownership of British Mahjong, association with a governing body, or compatibility with every Mahjong ruleset.
            </p>
          </section>
        </article>
      </main>

      <footer className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 border-t border-[#d8ceb8] px-5 py-5 lg:px-8">
        <p className="text-[10px] leading-5 text-[#8c8a7f]">Independent project · not an official BMJA publication.</p>
        <a
          href="/"
          className="text-[10px] font-semibold text-[#66746e] underline decoration-[#c9b99d] underline-offset-4 hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
        >
          Back to British Mahjong Scorer
        </a>
      </footer>
    </div>
  );
}
