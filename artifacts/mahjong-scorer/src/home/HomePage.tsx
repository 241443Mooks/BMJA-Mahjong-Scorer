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
import { useState } from 'react';
import { SiteHeader } from '../components/SiteHeader';
import {
  clearGameRecovery,
  gameProgressSummary,
  loadInProgressGameRecovery,
} from '../game';

type HomeLink = {
  title: string;
  description: string;
  href: string;
  icon: typeof Calculator;
};

const learningLinks: HomeLink[] = [
  {
    title: 'Gameplay basics',
    description: 'Learn the tiles, sets, claiming, Kongs, Winds and how a game progresses.',
    href: '/gameplay-basics',
    icon: BookOpen,
  },
  {
    title: 'Scoring basics',
    description: 'Understand points, doubles, fishing and how players settle after each hand.',
    href: '/guide#ordinary-scoring',
    icon: Calculator,
  },
  {
    title: 'Special hands',
    description: 'Browse special hands, their values, example patterns and how the scorer recognises them.',
    href: '/special-hands',
    icon: Sparkles,
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
        <p className={`mt-2 max-w-[470px] text-[13px] leading-6 ${dark ? 'text-[#c8d8d1]' : 'text-[#66746e]'}`}>
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
        <p className="mt-1.5 text-[11px] leading-5 text-[#6d746f]">{description}</p>
      </div>
    </a>
  );
}

export function HomePage() {
  const [recovered] = useState(() =>
    typeof window === 'undefined'
      ? null
      : loadInProgressGameRecovery(window.localStorage),
  );

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
          <h1 className="font-serif text-[clamp(38px,6vw,58px)] leading-[1.02] text-[#284d45]">
            British Mahjong scoring, made easier to calculate and learn
          </h1>
          <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-[#66746e]">
            British Mahjong Scorer is a free, browser-based British Mahjong scoring calculator. Use visual tile entry to score an individual hand or a full four-player game, then learn the rules as you play.
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
                <p className="mt-2 text-[13px] leading-6 text-[#c8d8d1]">
                  {gameProgressSummary(recovered.game)} · {recovered.game.players.length} players
                </p>
              </div>
              <a
                href="/game"
                className="mt-6 flex items-center justify-center gap-2 rounded-md bg-[#f3e8d4] px-4 py-3 text-[12px] font-bold text-[#284d45]"
              >
                Continue game <ArrowRight size={15} />
              </a>
              <button
                type="button"
                onClick={startNewGame}
                className="mt-3 w-full rounded-md px-4 py-2 text-[11px] font-semibold text-[#c8d8d1] underline decoration-[#55756c] underline-offset-4 hover:text-[#f8f4e9]"
              >
                Start a new game
              </button>
            </div>
          ) : (
            <PrimaryAction
              title="Score a game"
              description="Start a four-player game, score each hand, settle payments and keep running totals."
              href="/game"
              icon={Gamepad2}
              dark
            />
          )}
          <PrimaryAction
            title="Score a hand"
            description="Work out the score for one hand without starting a full game."
            href="/hand"
            icon={Calculator}
          />
        </section>

        <section className="mt-11">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-serif text-[25px] text-[#284d45]">Learn British Mahjong</h2>
            <div className="fine-rule max-w-16 flex-1" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {learningLinks.map((link) => (
              <LearningAction key={link.title} {...link} />
            ))}
          </div>
        </section>

        <section className="mt-8 border-t border-[#ddd3bf] pt-6">
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
              <p className="mt-1 text-[11px] leading-5 text-[#7a7769]">
                How the scorer was built, which rules sources it uses, and how to support the project.
              </p>
            </div>
          </a>
        </section>

        <section className="mt-8">
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
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 border-t border-[#d8ceb8] px-5 py-5 lg:px-8">
        <p className="text-[10px] leading-5 text-[#8c8a7f]">Independent project · not an official BMJA publication.</p>
        <div className="flex items-center gap-2 text-[10px] text-[#8c8a7f]">
          <CircleHelp size={13} />
          <span>Scoring stays one tap away.</span>
        </div>
      </footer>
    </div>
  );
}
