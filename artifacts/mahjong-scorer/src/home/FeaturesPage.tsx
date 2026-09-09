import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Gamepad2,
  History,
  Layers3,
  Printer,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';

type FeatureCardProps = {
  icon: typeof Gamepad2;
  title: string;
  text: string;
};

function FeatureCard({ icon: Icon, title, text }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#efe8da] text-[#477562]">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <h3 className="mt-5 font-serif text-[22px] leading-tight text-[#284d45]">{title}</h3>
      <p className="mt-2 text-[12px] leading-6 text-[#66746e]">{text}</p>
    </div>
  );
}

const gameFeatures: FeatureCardProps[] = [
  {
    icon: Gamepad2,
    title: 'Score the whole table',
    text: 'Track four players, seat Winds, East, prevailing Wind, wins, draws, running balances and final standings in one game view.',
  },
  {
    icon: Calculator,
    title: 'Manual or calculated scores',
    text: 'Use detailed tile scoring for the players who want it and ordinary numeric entry for everyone else. Both can coexist in the same hand.',
  },
  {
    icon: Layers3,
    title: 'Automatic settlement',
    text: 'The scorer turns confirmed hand scores into player-to-player settlement, including East effects where applicable, instead of leaving the table to reconstruct the arithmetic.',
  },
  {
    icon: History,
    title: 'A ledger that grows with the game',
    text: 'Every confirmed hand becomes part of the canonical history, including scores, changes, running totals and detailed evidence where it was actually captured.',
  },
];

const handFeatures: FeatureCardProps[] = [
  {
    icon: ClipboardList,
    title: 'Visual hand entry',
    text: 'Build Pungs, Kongs, Chows and pairs with visual tiles, then add Flowers, Seasons, Remaining tiles or an irregular special layout when needed.',
  },
  {
    icon: Sparkles,
    title: 'Patterns surfaced when they matter',
    text: 'The scorer shows relevant point, double and pattern explanations from the entered evidence instead of making you search a giant catalogue while playing.',
  },
  {
    icon: CheckCircle2,
    title: 'Partial losing hands are valid',
    text: 'Enter only the scoring parts you know. The scorer calculates what those entries prove and waits for complete evidence before making whole-hand deductions.',
  },
  {
    icon: ShieldCheck,
    title: 'Unknown stays unknown',
    text: 'If you do not know the winning tile or a rare event fact, the scorer can remain conservative instead of forcing a guess or inventing a favourable interpretation.',
  },
];

const recordFeatures: FeatureCardProps[] = [
  {
    icon: RefreshCcw,
    title: 'Recover an in-progress game',
    text: 'A compatible game can recover locally after an ordinary refresh, accidental tab closure or browser restart on the same browser and device.',
  },
  {
    icon: Printer,
    title: 'Print or save the game record',
    text: 'Choose a compact Game summary or a Full game record with detailed evidence where available, then use the browser print flow or Save as PDF.',
  },
  {
    icon: BookOpen,
    title: 'Learning sits beside scoring',
    text: 'Gameplay basics, beginner scoring and the special-hand catalogue are separate from the live table flow but use the same rule model and visual language.',
  },
];

export function FeaturesPage() {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8 lg:py-14">
        <article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]">
          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
            <div className="mb-4 flex items-center gap-3">
              <div className="fine-rule w-10" />
              <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Features</span>
            </div>
            <h1 className="max-w-[820px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">
              Free British Mahjong scoring calculator.
            </h1>
            <p className="mt-5 max-w-[760px] text-[15px] leading-7 text-[#596b65]">
              <strong className="font-semibold text-[#284d45]">A free, dedicated, browser-based scoring calculator built specifically for British Mahjong.</strong> Enter a hand visually and Mahjong Reference automatically calculates supported points, doubles, special hands and fishing — or score and settle a complete four-player game.
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#66746e]">Dedicated to British rules. Automatic scoring. Full-game settlement.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/game" className="inline-flex items-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                Score a game <ArrowRight size={14} />
              </a>
              <a href="/hand" className="inline-flex items-center gap-2 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 py-2.5 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                Score a hand <ArrowRight size={14} />
              </a>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[720px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">01 / score a complete game</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">From the first hand to the final standings</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">The aim is to replace the awkward arithmetic and bookkeeping, not the table itself.</p>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-2">
              {gameFeatures.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[760px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">02 / score the hand you actually have</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">Complete, unfinished or only partly known</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">A player should not have to reconstruct irrelevant tiles or know a special-hand name before the scorer can help.</p>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-2">
              {handFeatures.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
            </div>

            <div className="mt-6 rounded-xl bg-[#284d45] p-5 text-[#f8f4e9] sm:p-6">
              <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#d7a287]">Product rule</div>
              <p className="mt-2 font-serif text-[24px] leading-snug">Enter what you know. The scorer works out what it safely can.</p>
              <p className="mt-3 max-w-[760px] text-[12px] leading-6 text-[#c8d5d0]">Complete evidence unlocks deeper whole-hand and fishing analysis. Partial evidence remains useful. Missing facts are not silently invented.</p>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[740px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">03 / keep the record</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">The history you use during play becomes the record you keep</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">There is no second report engine inventing the game afterwards. Confirmed history, stored settlement and captured hand evidence remain tied together.</p>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {recordFeatures.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-10">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">Built for the table</div>
                <h2 className="mt-2 font-serif text-[30px] leading-tight text-[#284d45]">Beginner-first without removing the depth</h2>
                <p className="mt-3 text-[13px] leading-6 text-[#596b65]">The live scorer tries to surface the useful rule at the moment it matters. Deeper explanations stay available in the learning and Help material rather than crowding the scoring flow.</p>
              </div>
              <ul className="space-y-3 rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6">
                {[
                  'Built specifically around the British rules used by this project.',
                  'No account required for ordinary scoring and learning.',
                  'Manual and detailed scoring can coexist at the same table.',
                  'Supported special patterns are detected from evidence where possible.',
                  'The scorer explains relevant reasoning instead of returning only a number.',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-[12px] leading-6 text-[#596b65]">
                    <CheckCircle2 size={15} className="mt-1 shrink-0 text-[#477562]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="rounded-xl border border-[#cfbfa4] bg-[#f5eadb] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6">
              <div className="max-w-[650px]">
                <h2 className="font-serif text-[27px] text-[#284d45]">Want the reasoning, not just the feature list?</h2>
                <p className="mt-2 text-[12px] leading-6 text-[#596b65]">See how the scorer moves from context to evidence to calculation, explanation, settlement and record.</p>
              </div>
              <a href="/how-it-works" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2 sm:mt-0">
                How it works <ArrowRight size={14} />
              </a>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
