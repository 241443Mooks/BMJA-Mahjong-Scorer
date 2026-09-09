import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronDown,
  FileText,
  Gamepad2,
  HelpCircle,
  History,
  Layers3,
  Scale,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import {
  ResponsiveScreenshot,
  type ResponsiveScreenshotProps,
} from '../components/ResponsiveInstruction';
import { SiteHeader } from '../components/SiteHeader';
import { ReturnToGame } from '../components/ReturnToGame';
import { phaseOneHelpInstructions } from './helpPhase1Instructions';

type HowItWorksStep = {
  number: string;
  title: string;
  text: string;
  Icon: LucideIcon;
  screenshot: ResponsiveScreenshotProps;
};

const steps: HowItWorksStep[] = [
  {
    number: '01', title: 'Give the scorer the context',
    text: 'Tell it what matters for this hand or game: who is East, the player Wind, the prevailing Wind, whether the hand won and any winning circumstance the rules actually need.',
    Icon: Gamepad2, screenshot: phaseOneHelpInstructions['start-game'],
  },
  {
    number: '02', title: 'Enter what you know',
    text: 'Build a complete hand, enter only the scoring evidence from an unfinished losing hand, or simply type a numeric score if you already know it.',
    Icon: Layers3, screenshot: phaseOneHelpInstructions['ordinary-hand'],
  },
  {
    number: '03', title: 'It calculates what the evidence supports',
    text: 'The scoring engine applies the supported British Mahjong rules to the information you entered. Missing evidence stays missing rather than being guessed.',
    Icon: Calculator, screenshot: phaseOneHelpInstructions.disagreement,
  },
  {
    number: '04', title: 'It shows the reasoning',
    text: 'Points, doubles, detected patterns, special hands and fishing are surfaced where the evidence supports them, so the total is not just a black-box number.',
    Icon: Sparkles, screenshot: phaseOneHelpInstructions.disagreement,
  },
  {
    number: '05', title: 'The game settles the table',
    text: 'In a full game, confirmed scores become player-to-player settlement transactions, including East doubling where applicable, and update the running balances.',
    Icon: Scale, screenshot: phaseOneHelpInstructions.settlement,
  },
  {
    number: '06', title: 'The same history becomes the record',
    text: 'Confirmed hands build one canonical ledger as you play. At any point, that same ledger can be printed or saved as either a compact summary or a full detailed record.',
    Icon: FileText, screenshot: phaseOneHelpInstructions['save-game'],
  },
];

const evidenceModes = [
  ['Complete', 'Enter the whole hand when you want the scorer to check whole-hand patterns, special hands and fishing where supported.'],
  ['Partial', 'For a losing hand, enter only the scoring sets, pairs and bonus tiles you know. The scorer calculates those without pretending the unseen tiles are known.'],
  ['Manual', 'Already know the number? Type it directly. It can still be used in the game, while remaining clearly distinct from a scorer-built hand.'],
] as const;

const trustPoints = [
  'Unknown facts stay unknown. The scorer withholds unsupported bonuses instead of guessing.',
  'A partial hand is treated as partial evidence, not a complete reconstruction.',
  'Manual scores remain valid without being presented as scorer-verified tile evidence.',
  'The same structured game history drives settlement, the ledger and the printable record.',
] as const;

export function HowItWorksPage() {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8 lg:py-14">
        <ReturnToGame />
        <article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]">
          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
            <div className="mb-4 flex items-center gap-3"><div className="fine-rule w-10" /><span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">How it works</span></div>
            <h1 className="max-w-[820px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">Tell the scorer what you know. It works out what it safely can.</h1>
            <p className="mt-5 max-w-[760px] text-[15px] leading-7 text-[#596b65]">Mahjong Reference is designed around evidence rather than guesswork. You give its British / BMJA-style scorer the hand and game context you actually have; it calculates the supported score, explains the reasoning, and carries confirmed results into settlement and the game record.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="/game" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">Score a game <ArrowRight size={14} /></a>
              <a href="/hand" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 py-2.5 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">Score a hand <ArrowRight size={14} /></a>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="mb-7 max-w-[720px]">
              <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#ae6249]">The flow</div>
              <h2 className="mt-2 font-serif text-[32px] leading-tight text-[#284d45]">Context → Evidence → Score → Explain → Settle → Record</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#66746e]">The product follows one connected path rather than treating the hand scorer, settlement and game history as separate systems.</p>
            </div>
            <ol className="grid gap-3 md:grid-cols-2">
              {steps.map(({ number, title, text, Icon, screenshot }) => (
                <li key={number} className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#efe8da] text-[#477562]"><Icon size={18} strokeWidth={1.8} /></div>
                    <div><div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#ae6249]">{number}</div><h3 className="mt-1 font-serif text-[23px] leading-tight text-[#284d45]">{title}</h3><p className="mt-2 text-[12px] leading-6 text-[#66746e]">{text}</p></div>
                  </div>
                  <details className="group mt-4 border-t border-[#e2d9c7] pt-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-1 py-1 text-[11px] font-semibold text-[#477562] transition hover:text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                      <span>See it in the scorer</span>
                      <ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="mt-3 overflow-hidden rounded-lg border border-[#d8ceb8] bg-[#eee8dc] p-2">
                      <ResponsiveScreenshot {...screenshot} />
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
              <div><div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#477562]" /><h2 className="font-serif text-[30px] leading-tight text-[#284d45]">Complete, partial or manual — all are valid</h2></div><p className="mt-3 text-[13px] leading-6 text-[#596b65]">A real table does not always have four perfectly reconstructed hands. The scorer is designed around that reality rather than forcing everybody through the same amount of data entry.</p></div>
              <div className="space-y-3">{evidenceModes.map(([title, text]) => <div key={title} className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5"><div className="font-serif text-[22px] text-[#284d45]">{title}</div><p className="mt-1.5 text-[12px] leading-6 text-[#66746e]">{text}</p></div>)}</div>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] bg-[#284d45] px-5 py-9 text-[#f8f4e9] sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
              <div><div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#d7a287]">Trust principle</div><h2 className="mt-2 font-serif text-[32px] leading-tight">Unknown means unknown.</h2><p className="mt-3 text-[13px] leading-6 text-[#c8d4cf]">Some British Mahjong rules depend on details that are easy to forget — such as which tile completed Mah Jong or whether a rare event actually happened. If the evidence is not known, the scorer does not manufacture it.</p></div>
              <ul className="space-y-3">{trustPoints.map((point) => <li key={point} className="flex gap-3 rounded-lg border border-[#55756c] bg-[#31594f] px-4 py-3 text-[12px] leading-6 text-[#e8eee9]"><ShieldCheck size={16} className="mt-1 shrink-0 text-[#d7a287]" /><span>{point}</span></li>)}</ul>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
              <div className="rounded-xl border border-[#d8ceb8] bg-[#f5eadb] p-5 sm:p-6"><div className="flex items-center gap-3"><History size={18} className="text-[#ae6249]" /><h2 className="font-serif text-[25px] text-[#284d45]">The game survives ordinary browser accidents</h2></div><p className="mt-3 text-[12px] leading-6 text-[#596b65]">An in-progress game is saved locally in the same browser so a refresh, closed tab or browser restart does not casually wipe the table. This is local recovery, not an account or cloud-sync system.</p></div>
              <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6"><div className="flex items-center gap-3"><FileText size={18} className="text-[#477562]" /><h2 className="font-serif text-[25px] text-[#284d45]">The ledger is the record</h2></div><p className="mt-3 text-[12px] leading-6 text-[#66746e]">The app does not build a second version of the game afterwards. The confirmed ledger used during play becomes the printable record: choose a compact Game summary or a Full game record with the detailed evidence that was actually captured.</p></div>
            </div>
          </section>

          <section className="px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-4 md:grid-cols-3">
              <a href="/guide" className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 transition hover:-translate-y-0.5 hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"><BookOpen size={18} className="text-[#477562]" /><h3 className="mt-4 font-serif text-[22px] text-[#284d45]">Learn the scoring</h3><p className="mt-2 text-[11px] leading-5 text-[#66746e]">Use the beginner guide if you want the rules explained progressively.</p></a>
              <a href="/special-hands" className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 transition hover:-translate-y-0.5 hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"><Sparkles size={18} className="text-[#ae6249]" /><h3 className="mt-4 font-serif text-[22px] text-[#284d45]">Browse special hands</h3><p className="mt-2 text-[11px] leading-5 text-[#66746e]">See the supported special-hand catalogue and visual examples.</p></a>
              <a href="/about" className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 transition hover:-translate-y-0.5 hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"><HelpCircle size={18} className="text-[#477562]" /><h3 className="mt-4 font-serif text-[22px] text-[#284d45]">Rules and trust</h3><p className="mt-2 text-[11px] leading-5 text-[#66746e]">Read about the project, rule sources, independence and local-data approach.</p></a>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
