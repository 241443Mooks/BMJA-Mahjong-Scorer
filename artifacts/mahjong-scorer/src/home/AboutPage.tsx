import {
  ArrowRight,
  BookOpen,
  Calculator,
  Coffee,
  ExternalLink,
  Gamepad2,
  Github,
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
    title: 'Track a game',
    description: 'Stay with four players from the first hand through settlement, totals, East, Winds and the final record.',
    href: '/game',
    icon: Gamepad2,
  },
  {
    title: 'Score a hand',
    description: 'Build one hand in detail and see the points, doubles and patterns that support its score.',
    href: '/hand',
    icon: Calculator,
  },
  {
    title: 'Learn British Mahjong',
    description: 'Use the British gameplay, scoring and special-hand guides alongside the table.',
    href: '/gameplay-basics',
    icon: BookOpen,
  },
];

const journeySteps = [
  {
    number: '01',
    title: 'Start with the hand',
    text: 'The first problem was small: work out what a British Mahjong hand is worth without having to keep the whole scoring table in your head.',
  },
  {
    number: '02',
    title: 'A number needs a reason',
    text: 'A score is much more useful when you can see why it changed — which points, doubles or special-hand rules actually applied.',
  },
  {
    number: '03',
    title: 'But the hand is not finished yet',
    text: 'Once the score is known, the table still needs to settle it. Who pays whom is a different question from what each hand is worth.',
  },
  {
    number: '04',
    title: 'Settlement changes the game',
    text: 'Payments change the running totals. East matters. The prevailing Wind matters. What happens next depends on what just happened.',
  },
  {
    number: '05',
    title: 'So the tool has to stay with the table',
    text: 'The next hand starts from the state left by the last one. Scoring isolated hands was no longer enough; the useful unit had become the whole game.',
  },
  {
    number: '06',
    title: 'Corrections and records need one story',
    text: 'Undo, recovery, history and Print / Save should all describe the same confirmed game, not reconstruct different versions of it afterwards.',
  },
  {
    number: '07',
    title: 'The rules have to stay attached too',
    text: 'Different tables play differently. British, Western and club rules cannot be treated as cosmetic switches, so the rules used by a game stay with that game.',
  },
] as const;

function ProjectAction({ title, description, href, icon: Icon }: ActionLink) {
  return (
    <a
      href={href}
      className="group flex min-h-[154px] flex-col justify-between rounded-xl border border-[#ddd3bf] bg-[#fdfbf5] p-5 transition hover:-translate-y-0.5 hover:border-[#c9b99d] hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#efe8da] text-[#477562]">
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <ArrowRight size={15} className="mt-1 shrink-0 text-[#ae6249] transition-transform group-hover:translate-x-1" />
      </div>
      <div className="mt-6">
        <h3 className="font-serif text-[22px] leading-tight text-[#284d45]">{title}</h3>
        <p className="mt-2 text-[14px] leading-6 text-[#596b65]">{description}</p>
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
              <span className="font-mono text-[11px] uppercase tracking-[.2em] text-[#ae6249]">Independent project</span>
            </div>
            <h1 className="max-w-[820px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">
              Mahjong Reference did not start as a Table Companion.
            </h1>
            <p className="mt-5 max-w-[760px] text-[17px] leading-8 text-[#596b65]">
              It started with a much smaller question: <strong className="text-[#284d45]">what is this hand worth?</strong>
            </p>
            <p className="mt-4 max-w-[760px] text-[15px] leading-7 text-[#596b65]">
              Trying to answer that properly kept uncovering the next thing the table needed. A score needed an explanation. A scored hand needed settlement. Settlement changed the game. The next hand depended on that changed state. And, eventually, the rules themselves had to stay attached to the game.
            </p>

            <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#284d45] p-5 text-[#f8f4e9] sm:p-6">
              <Sparkles size={18} className="mt-1 shrink-0 text-[#d7a287]" />
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[.18em] text-[#d7a287]">What it became</div>
                <p className="mt-1 font-serif text-[24px] leading-snug">Your Mahjong table companion.</p>
                <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-[#dbe6e1]">
                  The aim is to be the quiet fifth person at the table: keep track of what matters, explain it when it helps, and otherwise let the four players get on with playing.
                </p>
              </div>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[760px]">
              <div className="font-mono text-[11px] uppercase tracking-[.18em] text-[#ae6249]">The development journey</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">One question kept leading to the next</h2>
              <p className="mt-3 text-[15px] leading-7 text-[#596b65]">
                This was not a grand architecture planned from the beginning. Each step appeared because the previous answer was not quite enough at a real Mahjong table.
              </p>
            </div>

            <ol className="mt-7 grid gap-3 md:grid-cols-2">
              {journeySteps.map((step) => (
                <li key={step.number} className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6">
                  <div className="font-mono text-[11px] uppercase tracking-[.16em] text-[#ae6249]">{step.number}</div>
                  <h3 className="mt-2 font-serif text-[23px] leading-tight text-[#284d45]">{step.title}</h3>
                  <p className="mt-3 text-[14px] leading-6 text-[#596b65]">{step.text}</p>
                </li>
              ))}
            </ol>

            <div className="mt-5 rounded-xl border border-[#cfbfa4] bg-[#f5eadb] p-5 sm:p-6">
              <p className="font-serif text-[27px] leading-snug text-[#284d45]">That is how a hand scorer became a Table Companion.</p>
              <p className="mt-3 max-w-[760px] text-[14px] leading-6 text-[#596b65]">
                The whole game, not just the hand, is now the thing Mahjong Reference is trying to make easier to understand and easier to keep moving.
              </p>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <h2 className="font-serif text-[32px] leading-tight text-[#284d45]">What you can do here now</h2>
            <p className="mt-3 max-w-[780px] text-[15px] leading-7 text-[#596b65]">
              The <a href="/rules" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4">rules hub</a> is the live source for current profiles and their support status. The learning library is still explicitly British Mahjong material.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {projectActions.map((action) => (
                <ProjectAction key={action.title} {...action} />
              ))}
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <Scale size={18} className="text-[#ae6249]" />
                  <h2 className="font-serif text-[30px] leading-tight text-[#284d45]">Rules should be clear about what they know</h2>
                </div>
                <p className="text-[14px] leading-7 text-[#596b65]">
                  The <a href="/rules" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 transition hover:text-[#ae6249]">rules hub</a> shows current profiles, support boundaries and sources. Rules support and confidence vary by profile, and a game keeps the rules selected for that table. The learning library remains explicitly British Mahjong material.
                </p>
                <p className="mt-3 text-[14px] leading-7 text-[#596b65]">
                  The main public British reference used during development is <ExternalTextLink href="https://mahjongbritishrules.wordpress.com/">Mah-Jong British Rules</ExternalTextLink>. Where evidence is incomplete or something is genuinely unknown, Mahjong Reference should say so rather than quietly invent certainty.
                </p>
                <a
                  href="/mahjong-rules-compared"
                  className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 transition hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
                >
                  Compare Mahjong rules <ArrowRight size={14} />
                </a>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-[#c9b99d] bg-[#fdfbf5] p-5 sm:p-6">
                  <div className="flex gap-3">
                    <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#477562]" />
                    <div>
                      <h3 className="font-serif text-[22px] text-[#284d45]">Independent</h3>
                      <p className="mt-2 text-[14px] leading-6 text-[#596b65]">
                        Mahjong Reference is not an official British Mah-Jong Association product and does not claim BMJA endorsement.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#c9b99d] bg-[#fdfbf5] p-5 sm:p-6">
                  <div className="font-mono text-[11px] uppercase tracking-[.18em] text-[#ae6249]">No account required</div>
                  <p className="mt-3 text-[14px] leading-6 text-[#596b65]">
                    Ordinary scoring and game tracking work in the browser. In-progress recovery is local to this browser on this device; it is not an account or cloud-sync service.
                  </p>
                </div>
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
                <p className="mt-3 text-[14px] leading-6 text-[#596b65]">
                  The tile illustrations come from the Regular SVG set from <strong className="text-[#284d45]">xhokir/riichi-mahjong-tiles</strong>, based on <strong className="text-[#284d45]">FluffyStuff/riichi-mahjong-tiles</strong>.
                </p>
                <p className="mt-3 text-[14px] leading-6 text-[#596b65]">
                  They are used under the <ExternalTextLink href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International licence</ExternalTextLink>.
                </p>
              </div>

              <div className="rounded-xl border border-[#ddd3bf] bg-[#fdfbf5] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <Github size={18} className="text-[#477562]" />
                  <h2 className="font-serif text-[24px] text-[#284d45]">Built in the open</h2>
                </div>
                <p className="mt-3 text-[14px] leading-6 text-[#596b65]">
                  Development takes place in the public GitHub repository. The project’s original software code is licensed under the MIT License; third-party artwork keeps its own licence.
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-[14px]">
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
                <p className="mt-2 text-[14px] leading-6 text-[#596b65]">
                  If Mahjong Reference has made a game easier to score, helped explain a rule or saved an argument over the table, you can support its continued development. There is no requirement to contribute.
                </p>
              </div>
              <a
                href="https://buymeacoffee.com/sharronmo"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[14px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2 sm:mt-0"
              >
                <Coffee size={15} /> Buy me a coffee
              </a>
            </div>

            <p className="mt-6 text-[12px] leading-5 text-[#77796f]">
              Mahjong Reference is the site identity. It does not imply ownership of British Mahjong, association with a governing body, or compatibility with every Mahjong ruleset.
            </p>
          </section>
        </article>
      </main>

      <footer className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 border-t border-[#d8ceb8] px-5 py-5 lg:px-8">
        <p className="text-[12px] leading-5 text-[#77796f]">Independent project · not an official BMJA publication.</p>
        <a
          href="/"
          className="text-[12px] font-semibold text-[#596b65] underline decoration-[#c9b99d] underline-offset-4 hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
        >
          Back to Mahjong Reference
        </a>
      </footer>
    </div>
  );
}
