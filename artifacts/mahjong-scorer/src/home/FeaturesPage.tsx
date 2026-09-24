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

const wholeGameFeatures: FeatureCardProps[] = [
  {
    icon: Gamepad2,
    title: 'Start with the hand',
    text: 'Enter a hand visually when you have the detail, or use an ordinary numeric score when that is what the table knows.',
  },
  {
    icon: Calculator,
    title: 'Settle what happened',
    text: 'Turn confirmed scores into player-to-player settlement, including East effects where the selected profile applies them.',
  },
  {
    icon: Layers3,
    title: 'Carry the table forward',
    text: 'See net changes and running totals, then advance East, the prevailing Wind and the next table state before the next hand.',
  },
];

const evidenceFeatures: FeatureCardProps[] = [
  {
    icon: ClipboardList,
    title: 'Evidence can be complete',
    text: 'With a complete detailed hand, the scorer can show the recognised points, doubles and patterns behind a calculated result.',
  },
  {
    icon: CheckCircle2,
    title: 'Evidence can be partial',
    text: 'For a losing hand, enter only the scoring parts you know. The scorer uses what those entries prove without whole-hand deductions that need missing tiles.',
  },
  {
    icon: ShieldCheck,
    title: 'Evidence can stay unknown',
    text: 'A manual numeric score remains manual, and an unknown winning tile or rare event fact stays unknown rather than being guessed.',
  },
];

const recordFeatures: FeatureCardProps[] = [
  {
    icon: History,
    title: 'One connected history',
    text: 'Confirmed hands, settlement transactions, net changes and running totals all come from the same game history used at the table.',
  },
  {
    icon: RefreshCcw,
    title: 'Correct and recover',
    text: 'Undo a correction when needed, or recover a compatible in-progress game locally after an ordinary refresh, tab closure or browser restart on the same device.',
  },
  {
    icon: Printer,
    title: 'Keep the final record',
    text: 'Print a compact Game summary or Full game record with detailed evidence where available, or use the browser flow to Save as PDF.',
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
              The whole game, not just the hand.
            </h1>
            <p className="mt-5 max-w-[760px] text-[15px] leading-7 text-[#596b65]">
              <strong className="font-semibold text-[#284d45]">Mahjong Reference is a free, browser-based Table Companion for supported Mahjong rules profiles.</strong> It stays with the table from scoring a hand to seeing who pays whom, updating totals, advancing East and the Winds, and keeping the final record.
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#66746e]">Free · no account required</p>
            <p className="mt-3 max-w-[760px] text-[12px] leading-6 text-[#66746e]">British / BMJA-style support is stable. Western — Thompson &amp; Maloney is provisional while ordinary play, scoring, settlement and progression remain under source review. Club uses a configured local profile. Buzzard 2000 is source-specific, and MCR / WMO 2006 profile 0.1 remains provisional. <a href="/rules" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4">See supported rules</a>.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/game" className="inline-flex items-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                Track a game <ArrowRight size={14} />
              </a>
              <a href="/hand" className="inline-flex items-center gap-2 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 py-2.5 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                Score a hand <ArrowRight size={14} />
              </a>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[720px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">01 / the whole game, not just the hand</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">Stay with the table until the game is done</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">After a hand, the question is not only what it was worth. It is who pays whom, what changed in the totals, who is East, what Wind comes next and what the table does now.</p>
            </div>
            <ol className="mt-7 grid gap-2 text-center font-mono text-[10px] uppercase tracking-[.1em] text-[#477562] sm:grid-cols-3 lg:grid-cols-6">
              {['Score the hand', 'Settle the hand', 'Update totals', 'Advance East / Wind', 'Repeat', 'Final record'].map((step, index) => (
                <li key={step} className="rounded-lg border border-[#d8ceb8] bg-[#fdfbf5] px-3 py-3"><span className="mr-2 text-[#ae6249]">0{index + 1}</span>{step}</li>
              ))}
            </ol>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {wholeGameFeatures.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[760px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">02 / the rules stay attached to the game</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">Choose the rules context once, then keep it with the table</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">A supported rules context is chosen for a new game. Its exact profile and version stay with scoring, settlement, progression, recovery and the record, so a recovered game does not silently change its rules underneath the table.</p>
            </div>
            <div className="mt-6 rounded-xl bg-[#284d45] p-5 text-[#f8f4e9] sm:p-6">
              <p className="font-serif text-[24px] leading-snug">The rules are part of the game, not a calculator switch.</p>
              <p className="mt-3 max-w-[760px] text-[12px] leading-6 text-[#c8d5d0]">The five selectable profiles do not all have the same maturity or source boundary. Mahjong Reference keeps those distinctions visible rather than presenting one generic Mahjong ruleset. Detailed provenance belongs in <a href="/rules" className="font-semibold underline decoration-[#d7a287] underline-offset-4">the rules reference</a>.</p>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[740px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">03 / explain what can be proved; do not guess</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">Useful at the table, honest about the evidence</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">The scorer explains what it recognised from the entered evidence. It does not pretend that a partial hand is complete, or that a number entered by the table was calculated from tiles.</p>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {evidenceFeatures.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[740px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">04 / the record is the game that was actually played</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">Keep one story from first hand to final standings</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">If somebody asks why a total changed by 96, the underlying hand and settlement history are retained with it. The printable record is not reconstructed afterwards from a mysterious final balance.</p>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {recordFeatures.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
            </div>
            <p className="mt-6 text-[12px] leading-6 text-[#596b65]"><BookOpen size={15} className="mr-2 inline align-text-bottom text-[#477562]" />British gameplay basics, scoring and the special-hand catalogue sit alongside the table companion as explicitly British-specific learning material while profile-aware learning is expanded.</p>
          </section>

          <section className="px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="rounded-xl border border-[#cfbfa4] bg-[#f5eadb] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6">
              <div className="max-w-[650px]">
                <h2 className="font-serif text-[27px] text-[#284d45]">Want the reasoning, not just the feature list?</h2>
                <p className="mt-2 text-[12px] leading-6 text-[#596b65]">See where the rules come from, what evidence the scorer uses, why scoring is separate from settlement and progression, and how the record stays consistent.</p>
              </div>
              <a href="/under-the-hood" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2 sm:mt-0">
                Under the hood <ArrowRight size={14} />
              </a>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
