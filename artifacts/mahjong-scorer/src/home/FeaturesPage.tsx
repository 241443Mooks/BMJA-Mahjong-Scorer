import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Gamepad2,
  History,
  Printer,
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

const features: FeatureCardProps[] = [
  {
    icon: Calculator,
    title: 'Score a hand',
    text: 'Enter tiles for a calculated result, or record a score already agreed at the table. See the scoring details the entered hand supports.',
  },
  {
    icon: Gamepad2,
    title: 'Run the whole game',
    text: 'Track four players through each hand, with payments, net changes, running totals, East and prevailing Wind kept together.',
  },
  {
    icon: CheckCircle2,
    title: 'Keep the rules with play',
    text: 'Choose from supported rules profiles and keep the table’s rules context attached to its scores and game record.',
  },
  {
    icon: History,
    title: 'Review and recover',
    text: 'Look back at recorded hands and settlement, correct a result, or resume a compatible game saved on the same device.',
  },
  {
    icon: Printer,
    title: 'Keep a clear record',
    text: 'Print or save a compact summary or a full game record, with scoring detail where it was recorded.',
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
              <strong className="font-semibold text-[#284d45]">Mahjong Reference is a free, browser-based Table Companion for supported Mahjong rules profiles.</strong>{' '}
              Score a hand or keep the table moving from its first deal to the final record.
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#66746e]">Free · no account required</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/game" className="inline-flex items-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                Track a game <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a href="/hand" className="inline-flex items-center gap-2 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 py-2.5 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                Score a hand <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
          </section>

          <section className="px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[720px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">At the table</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">Useful from the score to the final result</h2>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
            </div>
          </section>

          <section className="border-t border-[#ddd3bf] px-5 py-8 sm:px-8 lg:px-12">
            <nav aria-label="Explore more" className="flex flex-wrap gap-x-6 gap-y-3 text-[12px]">
              <a href="/how-it-works" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4">See how it works</a>
              <a href="/help" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4">Open the User Guide</a>
              <a href="/rules" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4">Explore supported rules</a>
              <a href="/under-the-hood" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4">How it is built</a>
            </nav>
          </section>
        </article>
      </main>
    </div>
  );
}
