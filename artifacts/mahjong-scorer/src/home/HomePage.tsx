import {
  ArrowRight,
  BookOpen,
  Calculator,
  CircleHelp,
  Coffee,
  Gamepad2,
  Info,
  Sparkles,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { useInProgressGameRecovery } from '../components/ReturnToGame';
import {
  clearGameRecovery,
  gameProgressSummary,
} from '../game';
import {
  PUBLIC_RULES_DESCRIPTORS,
  type PublicRulesSlug,
} from '../game/rules-presentation';

type HomeLink = {
  title: string;
  description: string;
  href: string;
  icon: typeof Calculator;
};

export const homeRulesStatusLabel = (slug: PublicRulesSlug) => {
  switch (slug) {
    case 'british':
      return 'Ready to use';
    case 'western':
      return 'Available — still being checked';
    case 'club':
      return 'Set up';
  }
};

const homeRulesSummary: Record<PublicRulesSlug, string> = {
  british: 'The established British / BMJA-style scoring and game rules.',
  western: 'Western scoring with Thompson & Maloney special hands. Some ordinary rules are still being checked.',
  club: 'A set of rules configured for one club, including its own special hands and Goulash.',
};

const homeRulesHref = (slug: PublicRulesSlug) =>
  slug === 'club' ? '/game/club' : `/rules/${slug}`;

export const homeLearningLinks: HomeLink[] = [
  {
    title: 'British gameplay basics',
    description: 'Learn the tiles, sets, claiming, Kongs, Winds and how a British game moves on.',
    href: '/gameplay-basics',
    icon: BookOpen,
  },
  {
    title: 'British scoring guide',
    description: 'Understand points, doubles, fishing and ordinary British scoring.',
    href: '/guide#ordinary-scoring',
    icon: Calculator,
  },
  {
    title: 'British special hands',
    description: 'Browse special hands, their values and example patterns.',
    href: '/special-hands',
    icon: Sparkles,
  },
  {
    title: 'How the Table Companion works',
    description: 'See how a hand becomes a score, who pays whom, the next hand and the game record.',
    href: '/how-it-works',
    icon: Gamepad2,
  },
];

function PrimaryAction({
  title,
  description,
  href,
  icon: Icon,
  dark = false,
}: HomeLink & { dark?: boolean }) {
  return (
    <a
      href={href}
      className={`group flex min-h-[190px] flex-col justify-between rounded-2xl border p-6 shadow-[var(--shadow-sm)] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2 sm:p-7 ${
        dark
          ? 'border-[#284d45] bg-[#284d45] text-[#f8f4e9] hover:-translate-y-0.5 hover:bg-[#23443d]'
          : 'border-[#cfc3aa] bg-[#fbf8ed] text-[#284d45] hover:-translate-y-0.5 hover:border-[#ae6249] hover:bg-[#fffaf0]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${dark ? 'bg-[#3b5e55] text-[#f3d8c7]' : 'bg-[#efe8da] text-[#ae6249]'}`}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
        <ArrowRight
          size={20}
          className={`mt-1 shrink-0 transition-transform group-hover:translate-x-1 ${dark ? 'text-[#d7a287]' : 'text-[#ae6249]'}`}
        />
      </div>
      <div className="mt-8">
        <h2 className="font-serif text-[30px] leading-tight">{title}</h2>
        <p className={`mt-2 max-w-[470px] text-[15px] leading-6 ${dark ? 'text-[#c8d8d1]' : 'text-[#66746e]'}`}>
          {description}
        </p>
      </div>
    </a>
  );
}

function LearningAction({ title, description, href, icon: Icon }: HomeLink) {
  return (
    <a
      href={href}
      className="group flex min-h-[126px] items-start gap-4 rounded-xl border border-[#ddd3bf] bg-[#fbf8ed] p-5 transition hover:border-[#c9b99d] hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#efe8da] text-[#477562]">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-[21px] leading-tight text-[#284d45]">{title}</h3>
          <ArrowRight size={15} className="shrink-0 text-[#ae6249] transition-transform group-hover:translate-x-1" />
        </div>
        <p className="mt-1.5 text-[14px] leading-6 text-[#6d746f]">{description}</p>
      </div>
    </a>
  );
}

export function HomePage() {
  const recovered = useInProgressGameRecovery();

  const startNewGame = () => {
    if (!recovered || typeof window === 'undefined') return;
    if (!window.confirm('Start a new game? Your current game will be replaced.')) {
      return;
    }
    clearGameRecovery(window.localStorage);
    window.location.assign('/game');
  };

  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8 lg:py-14">
        <section className="max-w-[760px]">
          <p className="mb-3 font-mono text-[12px] uppercase tracking-[.14em] text-[#ae6249]">Rules, scoring and play — made clear.</p>
          <h1 className="font-serif text-[clamp(38px,6vw,58px)] leading-[1.02] text-[#284d45]">
            Your Mahjong table companion.
          </h1>
          <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-[#66746e]">
            Score a hand, track the whole game, understand settlement and use the rules your table actually plays.
          </p>
          <p className="mt-4 inline-flex rounded-full border border-[#cfc3aa] bg-[#fbf8ed] px-4 py-2 text-[14px] font-semibold text-[#284d45]">Free · No signup required · Works in your browser</p>
          <p className="mt-3 max-w-[620px] text-[14px] leading-6 text-[#66746e]">
            If you refresh or close the browser, you can usually pick up your game again on this device. It is saved in this browser, not to an account.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Scoring actions">
          {recovered ? (
            <div className="rounded-2xl border border-[#284d45] bg-[#284d45] p-6 text-[#f8f4e9] shadow-[var(--shadow-sm)] sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3b5e55] text-[#f3d8c7]">
                <Gamepad2 size={20} strokeWidth={1.8} />
              </div>
              <div className="mt-8">
                <h2 className="font-serif text-[30px] leading-tight">Continue game</h2>
                <p className="mt-2 text-[15px] leading-6 text-[#c8d8d1]">
                  {gameProgressSummary(recovered.game)} · {recovered.game.players.length} players
                </p>
              </div>
              <a
                href="/game"
                className="mt-6 flex items-center justify-center gap-2 rounded-md bg-[#f3e8d4] px-4 py-3 text-[15px] font-bold text-[#284d45]"
              >
                Continue game <ArrowRight size={15} />
              </a>
              <button
                type="button"
                onClick={startNewGame}
                className="mt-3 w-full rounded-md px-4 py-2 text-[14px] font-semibold text-[#c8d8d1] underline decoration-[#55756c] underline-offset-4 hover:text-[#f8f4e9]"
              >
                Start a new game
              </button>
            </div>
          ) : (
            <PrimaryAction
              title="Track a game"
              description="Score each hand, follow Winds and game progression, calculate settlement and keep running totals."
              href="/game"
              icon={Gamepad2}
              dark
            />
          )}
          <PrimaryAction
            title="Score a hand"
            description="Enter tiles visually to work out one hand without starting a full game."
            href="/hand"
            icon={Calculator}
          />
        </section>

        <a
          href="/features"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-[15px] font-semibold text-[#284d45] underline decoration-[#ae6249] decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
        >
          See what the Table Companion can do <ArrowRight size={16} />
        </a>

        <section className="mt-11" aria-labelledby="home-rules-heading">
          <div className="mb-4 flex items-center gap-3">
            <h2 id="home-rules-heading" className="font-serif text-[28px] text-[#284d45]">Play by the rules your table uses</h2>
            <div className="fine-rule max-w-16 flex-1" />
          </div>
          <p className="mb-5 max-w-[720px] text-[14px] leading-6 text-[#66746e]">
            Choose the rules that match your table. Mahjong Reference keeps those rules with the game.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {PUBLIC_RULES_DESCRIPTORS.map((descriptor) => (
              <a
                key={descriptor.slug}
                href={homeRulesHref(descriptor.slug)}
                className="group flex min-h-[170px] flex-col justify-between rounded-xl border border-[#ddd3bf] bg-[#fbf8ed] p-5 transition hover:border-[#c9b99d] hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2"
              >
                <div>
                  <span className="inline-flex rounded-full border border-[#d8ceb8] bg-[#f5f1e6] px-2.5 py-1 text-[12px] font-semibold text-[#596b65]">
                    {homeRulesStatusLabel(descriptor.slug)}
                  </span>
                  <h3 className="mt-3 font-serif text-[22px] leading-tight text-[#284d45]">{descriptor.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[#66746e]">{homeRulesSummary[descriptor.slug]}</p>
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-[#284d45]">
                  {descriptor.slug === 'club' ? 'Use these rules' : 'Read these rules'}
                  <ArrowRight size={14} className="text-[#ae6249] transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            ))}
          </div>
          <a
            href="/rules"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-[14px] font-semibold text-[#596b65] underline decoration-[#ae6249] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
          >
            See all supported rules <ArrowRight size={14} />
          </a>
        </section>

        <section className="mt-11" aria-labelledby="home-learn-heading">
          <div className="mb-4 flex items-center gap-3">
            <h2 id="home-learn-heading" className="font-serif text-[28px] text-[#284d45]">Learn and understand</h2>
            <div className="fine-rule max-w-16 flex-1" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {homeLearningLinks.map((link) => (
              <LearningAction key={link.title} {...link} />
            ))}
          </div>
          <a
            href="/scoring-examples"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-[14px] font-semibold text-[#596b65] underline decoration-[#ae6249] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
          >
            Try British scoring examples <ArrowRight size={14} />
          </a>
        </section>

        <section className="mt-11 border-y border-[#ddd3bf] py-7" aria-labelledby="home-trust-heading">
          <div className="grid gap-6 md:grid-cols-2 md:gap-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[.16em] text-[#ae6249]">Trust</p>
              <h2 id="home-trust-heading" className="mt-2 font-serif text-[28px] leading-tight text-[#284d45]">One game. One record.</h2>
              <p className="mt-3 text-[14px] leading-6 text-[#66746e]">
                Confirmed hands, who pays whom, running totals, corrections and the copy you print or save all stay tied to the same game history.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-[22px] leading-tight text-[#284d45]">If Mahjong Reference does not know something, it will not guess.</h3>
              <p className="mt-3 text-[14px] leading-6 text-[#66746e]">
                Enter what you know. When information is missing, the scorer keeps that uncertainty visible instead of quietly making something up.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <a
            href="/about"
            className="group flex items-center gap-4 rounded-lg px-2 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#efe8da] text-[#7a7769]">
              <Info size={17} strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif text-[19px] text-[#284d45]">About this project</h2>
                <ArrowRight size={14} className="shrink-0 text-[#ae6249] transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-1 text-[14px] leading-6 text-[#7a7769]">
                How a hand scorer became a Table Companion, which sources it uses and why the project stays independent.
              </p>
            </div>
          </a>
        </section>

        <section className="mt-2 border-t border-[#e2d9c7] pt-2">
          <a
            href="https://buymeacoffee.com/sharronmo"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-4 rounded-lg px-2 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#efe8da] text-[#ae6249]">
              <Coffee size={17} strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif text-[19px] text-[#284d45]">Support the project</h2>
                <ArrowRight size={14} className="shrink-0 text-[#ae6249] transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-1 text-[14px] leading-6 text-[#7a7769]">
                Mahjong Reference is free to use. If it helps your table, you can optionally buy me a coffee.
              </p>
            </div>
          </a>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 border-t border-[#d8ceb8] px-5 py-5 lg:px-8">
        <p className="text-[13px] leading-5 text-[#8c8a7f]">Independent project · not an official BMJA publication.</p>
        <div className="flex items-center gap-2 text-[13px] text-[#8c8a7f]">
          <CircleHelp size={13} />
          <span>Scoring stays one tap away.</span>
        </div>
      </footer>
    </div>
  );
}
