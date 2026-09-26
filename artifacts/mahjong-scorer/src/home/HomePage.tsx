import { ArrowRight, Calculator, Gamepad2 } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { useInProgressGameRecovery } from '../components/ReturnToGame';
import {
  clearGameRecovery,
  gameProgressSummary,
} from '../game';

type HomeLink = {
  title: string;
  description: string;
  href: string;
  icon: typeof Calculator;
};

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
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2" aria-label="Scoring actions">
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
              description="Score each hand, follow East and the Winds, see who pays whom and keep running totals."
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

        <section className="mt-6 max-w-[760px]" aria-label="About the Table Companion">
          <p className="max-w-[620px] text-[15px] leading-7 text-[#66746e]">
            Score a hand, track the whole game, see who pays whom and use the rules your table actually plays.
          </p>
          <p className="mt-4 inline-flex rounded-full border border-[#cfc3aa] bg-[#fbf8ed] px-4 py-2 text-[14px] font-semibold text-[#284d45]">Free · No signup required · Works in your browser</p>
          <p className="mt-3 max-w-[620px] text-[14px] leading-6 text-[#66746e]">
            If you refresh or close the browser, you can usually pick up your game again on this device. It is saved in this browser, not to an account.
          </p>
          <a
            href="/features"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-[15px] font-semibold text-[#284d45] underline decoration-[#ae6249] decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
          >
            See what the Table Companion can do <ArrowRight size={16} />
          </a>
        </section>

      </main>
    </div>
  );
}
