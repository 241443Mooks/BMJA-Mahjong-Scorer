import { ArrowRight } from 'lucide-react';
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
  screenshot: ResponsiveScreenshotProps;
};

const scoreResultScreenshot: ResponsiveScreenshotProps = {
  images: {
    mobile: '/help/screenshots/hand-score-result-mobile.png',
    tablet: '/help/screenshots/hand-score-result-tablet.png',
    desktop: '/help/screenshots/hand-score-result-desktop.png',
  },
  alt: 'Calculated hand result showing the final score together with its points and doubles.',
};

const settlementPreviewScreenshot: ResponsiveScreenshotProps = {
  images: {
    mobile: '/help/screenshots/game-settlement-preview-mobile.png',
    tablet: '/help/screenshots/game-settlement-preview-tablet.png',
    desktop: '/help/screenshots/game-settlement-preview-desktop.png',
  },
  alt: 'Round settlement preview showing who pays whom and each player’s net change before the hand is recorded.',
};

const steps: HowItWorksStep[] = [
  {
    number: '01',
    title: 'Choose the table context',
    text: 'Start a game with its rules profile, length and four seats. Those choices stay with the game as you play.',
    screenshot: phaseOneHelpInstructions['start-game'],
  },
  {
    number: '02',
    title: 'Enter or record a hand',
    text: 'Enter tiles for a calculated score, or record the numeric score known at the table.',
    screenshot: phaseOneHelpInstructions['ordinary-hand'],
  },
  {
    number: '03',
    title: 'Review the score and explanation',
    text: 'See the result and, for a calculated score, the points, doubles and patterns recognised from the entered evidence.',
    screenshot: scoreResultScreenshot,
  },
  {
    number: '04',
    title: 'Settle the hand',
    text: 'For a game, review who pays whom and each player’s net change before recording the hand.',
    screenshot: settlementPreviewScreenshot,
  },
  {
    number: '05',
    title: 'Continue or keep the record',
    text: 'Recording updates totals, East and prevailing Wind for the next hand. Review the game history or print or save a record when you finish.',
    screenshot: phaseOneHelpInstructions['mix-score-entry'],
  },
];

export function HowItWorksPage() {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8 lg:py-14">
        <ReturnToGame />
        <article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]">
          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
            <div className="mb-4 flex items-center gap-3">
              <div className="fine-rule w-10" />
              <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">How it works</span>
            </div>
            <h1 className="max-w-[820px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">
              What happens at the table.
            </h1>
            <p className="mt-5 max-w-[760px] text-[16px] leading-7 text-[#596b65]">
              Choose a rules context, enter or record a hand, review the score, settle, then continue or keep the record.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="/game" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                Track a game <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a href="/hand" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 py-2.5 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                Score a hand <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a href="/help" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 py-2.5 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                Open User Guide <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
            <p className="mt-5 max-w-[760px] text-[11px] leading-5 text-[#7a7769]">
              The walkthrough below uses the British / BMJA-style example where rule-specific details are visible. The same Table Companion journey is used with the other supported rules.
            </p>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="mb-7 max-w-[720px]">
              <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#ae6249]">The table journey</div>
              <h2 className="mt-2 font-serif text-[32px] leading-tight text-[#284d45]">From context to next hand.</h2>
            </div>

            <ol className="space-y-5 sm:space-y-6">
              {steps.map(({ number, title, text, screenshot }) => (
                <li key={number} className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4 sm:p-6">
                  <div className="grid gap-5 md:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] md:items-center md:gap-7 lg:gap-9">
                    <div>
                      <div className="font-mono text-[10px] font-semibold uppercase tracking-[.18em] text-[#ae6249]">{number}</div>
                      <h3 className="mt-2 font-serif text-[27px] leading-tight text-[#284d45]">{title}</h3>
                      <p className="mt-3 text-[13px] leading-6 text-[#596b65]">{text}</p>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-[#d8ceb8] bg-[#eee8dc] p-2 sm:p-3">
                      <ResponsiveScreenshot {...screenshot} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="rounded-xl border border-[#d8ceb8] bg-[#f5eadb] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6">
              <div className="max-w-[650px]">
                <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#ae6249]">Need more detail?</div>
                <h2 className="mt-2 font-serif text-[28px] leading-tight text-[#284d45]">The User Guide picks up where this walkthrough stops.</h2>
                <p className="mt-2 text-[12px] leading-6 text-[#596b65]">
                  See the User Guide for step-by-step instructions and detailed help with using the scorer.
                </p>
              </div>
              <div className="mt-5 flex shrink-0 flex-col gap-2 sm:mt-0">
                <a href="/help" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#284d45] px-4 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                  Open User Guide <ArrowRight size={14} aria-hidden="true" />
                </a>
                <a href="/rules" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                  See supported rules <ArrowRight size={14} aria-hidden="true" />
                </a>
                <a href="/under-the-hood" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
                  Under the hood <ArrowRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
