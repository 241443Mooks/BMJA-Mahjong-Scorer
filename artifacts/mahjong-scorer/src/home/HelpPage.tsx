import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calculator,
  CircleHelp,
  FileDown,
  Gamepad2,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';

type HelpItem = {
  id: string;
  question: string;
  answer: string;
  detail?: string;
};

type HelpGroup = {
  title: string;
  description: string;
  icon: typeof CircleHelp;
  items: HelpItem[];
};

const groups: HelpGroup[] = [
  {
    title: 'Playing a game',
    description: 'Set up the table, enter scores, understand settlement and correct mistakes.',
    icon: Gamepad2,
    items: [
      {
        id: 'start-game',
        question: 'How do I start a complete game?',
        answer: 'Open Score a game, enter the four players, then score each hand as you play.',
        detail: 'Each player can use the detailed hand scorer or simply type a numeric score. Confirmed hands are added to the ledger, which drives settlement, running balances and the final game record.',
      },
      {
        id: 'mix-score-entry',
        question: 'Do all four players have to use the detailed scorer?',
        answer: 'No. Manual and detailed scores can coexist in the same hand.',
        detail: 'One player can enter every tile, another can enter only scoring parts of a losing hand, and another can type the number they already know. The ledger keeps those evidence differences visible.',
      },
      {
        id: 'manual-score',
        question: 'I already know the score. Do I need to build the hand?',
        answer: 'No. Enter the numeric score directly.',
        detail: 'It can be used for settlement and game progression, but the record will not pretend that the hand was reconstructed or verified from tiles.',
      },
      {
        id: 'settlement',
        question: 'How does settlement work?',
        answer: 'The game calculates player-to-player payments from the confirmed hand scores and game context.',
        detail: 'Where East affects a payment, the scorer applies the relevant doubling. The ledger retains the actual transactions so you can see who paid whom rather than only a net change.',
      },
      {
        id: 'correct-hand',
        question: 'I made a mistake in a confirmed hand. Do I have to restart?',
        answer: 'No. Use the game correction or undo flow.',
        detail: 'Running balances and progression derive from confirmed history, so use the supported correction path rather than trying to adjust displayed totals independently.',
      },
    ],
  },
  {
    title: 'Scoring a hand',
    description: 'Enter ordinary, winning, losing and partially known hands without learning notation first.',
    icon: Calculator,
    items: [
      {
        id: 'ordinary-hand',
        question: 'How do I enter an ordinary hand?',
        answer: 'Use the visual set builder for Pungs, Chows, Kongs and pairs.',
        detail: 'Mark exposed or concealed where relevant. For losing hands, add ordinary loose tiles under Remaining tiles. Flowers and Seasons have their own controls.',
      },
      {
        id: 'partial-losing-hand',
        question: 'What if I only know part of a losing hand?',
        answer: 'Enter the scoring sets, pair and bonus tiles you know. You can stop there.',
        detail: 'Partial evidence is valid. The scorer calculates directly evidenced components and withholds whole-hand conclusions that unseen tiles could change.',
      },
      {
        id: 'remaining-tiles',
        question: 'What are Remaining tiles?',
        answer: 'They are the ordinary loose tiles in an unfinished losing hand that are not part of a completed group.',
        detail: 'They can be unrelated leftovers or incomplete shapes. You do not have to force them into one fake incomplete set.',
      },
      {
        id: 'kong-count',
        question: 'Why does a Kong make the physical tile count look too high?',
        answer: 'A Kong contains four physical tiles but occupies one structural group slot.',
        detail: 'The scorer understands that distinction, so a valid Kong should not make the hand invalid simply because there is an extra physical tile.',
      },
      {
        id: 'invalid-hand',
        question: 'Why does the scorer say my hand is invalid?',
        answer: 'Check for impossible structure rather than merely incomplete evidence.',
        detail: 'Examples include too many structural tiles or more than four copies of the same ordinary playing tile. A partial losing hand, by contrast, is valid incomplete evidence.',
      },
    ],
  },
  {
    title: 'Winning and special situations',
    description: 'Handle winning-tile questions, irregular layouts, special hands and fishing.',
    icon: Sparkles,
    items: [
      {
        id: 'winning-tile',
        question: 'Why does the scorer ask which tile completed Mah Jong?',
        answer: 'Some rules depend on the actual winning tile, not only the final 14-tile layout.',
        detail: 'When it matters, select the tile that completed Mah Jong from the entered hand. The scorer can retain the tile and, where relevant, the set or pair it completed.',
      },
      {
        id: 'winning-tile-unknown',
        question: 'What if I do not know which tile completed Mah Jong?',
        answer: 'Use I’m not sure where the option is available.',
        detail: 'The scorer still calculates what it can, but it will not apply winning-tile-sensitive exceptions it cannot prove. That conservative behaviour is intentional.',
      },
      {
        id: 'special-layout',
        question: 'My hand does not fit normal Pungs, Chows, Kongs and pairs.',
        answer: 'Use the Special layout route.',
        detail: 'Some supported special hands use irregular layouts. Enter those tiles directly; you do not need to know the special hand name before choosing this route.',
      },
      {
        id: 'special-name',
        question: 'Do I need to know the name of the special hand first?',
        answer: 'Usually, no.',
        detail: 'Where the entered evidence is sufficient, the scorer detects supported special-hand patterns from the tiles and context. The Special hands page remains available as a separate reference catalogue.',
      },
      {
        id: 'special-fishing',
        question: 'What if I think I am fishing for a special hand?',
        answer: 'Enter the complete non-winning tile evidence and let the scorer check supported one-tile-away patterns.',
        detail: 'Fishing analysis needs complete evidence because unseen tiles could change the answer. The scorer can surface possible completing tiles and handle overlapping supported matches.',
      },
      {
        id: 'event-unknown',
        question: 'What if I do not know whether a rare event-based special happened?',
        answer: 'Use I’m not sure where provided.',
        detail: 'The scorer omits an unsupported event special rather than assuming the favourable answer. It should ask only when that event fact can actually affect the score.',
      },
    ],
  },
  {
    title: 'Recovery and saving',
    description: 'Recover an in-progress game and save the confirmed record without an account.',
    icon: FileDown,
    items: [
      {
        id: 'refresh-game',
        question: 'What happens if I refresh during a game?',
        answer: 'The in-progress game should recover from the local saved snapshot in the same browser.',
        detail: 'The same applies after an ordinary tab or browser closure, provided the browser still has the compatible locally stored game data.',
      },
      {
        id: 'other-device',
        question: 'Can I continue the game on another device?',
        answer: 'Not with the current recovery model.',
        detail: 'Saved game recovery is local to the browser and device. There is no account-based cloud sync or cross-device game history in the current product.',
      },
      {
        id: 'save-game',
        question: 'How do I save the game record?',
        answer: 'Use Print / Save game and your browser’s print flow.',
        detail: 'Most browsers provide Save as PDF as a print destination. The current product does not generate a separate hosted report or custom PDF file.',
      },
      {
        id: 'full-v-summary',
        question: 'What is the difference between Full game record and Game summary?',
        answer: 'Full includes the detailed confirmed evidence that was actually captured. Summary keeps the result compact.',
        detail: 'Summary focuses on standings, hand-by-hand results, score changes and running totals. Full can expose detailed hand cards, tiles and scoring evidence where those records exist.',
      },
      {
        id: 'print-in-progress',
        question: 'Can I print before the game is finished?',
        answer: 'Yes. The printout can represent the confirmed history and current standings so far.',
        detail: 'It should not falsely present in-progress standings as final completed-game results.',
      },
    ],
  },
  {
    title: 'Rules, trust and privacy',
    description: 'Understand what the scorer knows, what it does not infer and where your data lives.',
    icon: ShieldCheck,
    items: [
      {
        id: 'disagreement',
        question: 'What if the scorer and our table disagree?',
        answer: 'Inspect the scoring breakdown and compare the relevant rule.',
        detail: 'Possible causes include different house rules, a different Mahjong variant, missing or incorrect entered evidence, a project interpretation, or an implementation defect.',
      },
      {
        id: 'ruleset',
        question: 'Does this support every form of Mahjong?',
        answer: 'No. It is built around the British rules implemented by this project.',
        detail: 'It is not intended to be a universal Mahjong rules engine or to cover every house rule.',
      },
      {
        id: 'account',
        question: 'Do I need an account?',
        answer: 'No. You can score a hand or complete game without signing in.',
        detail: 'Current game recovery uses local browser storage rather than an account or backend game database.',
      },
      {
        id: 'unknown-means-unknown',
        question: 'Why does the scorer sometimes refuse to infer a bonus or pattern?',
        answer: 'Because missing evidence stays unknown.',
        detail: 'If a rule depends on a fact you have not entered, the scorer calculates only what can be supported, asks a short question when necessary, or leaves the uncertain result out.',
      },
    ],
  },
];

function HelpCard({ item }: { item: HelpItem }) {
  return (
    <article id={item.id} className="scroll-mt-24 rounded-xl border border-[#ddd3bf] bg-[#fdfbf5] p-5 sm:p-6">
      <h3 className="font-serif text-[22px] leading-tight text-[#284d45]">{item.question}</h3>
      <p className="mt-2 text-[13px] font-semibold leading-6 text-[#477562]">{item.answer}</p>
      {item.detail && <p className="mt-2 text-[12px] leading-6 text-[#66746e]">{item.detail}</p>}
    </article>
  );
}

export function HelpPage() {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();

  const visibleGroups = useMemo(() => {
    if (!normalized) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          `${item.question} ${item.answer} ${item.detail ?? ''}`.toLowerCase().includes(normalized),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [normalized]);

  const resultCount = visibleGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8 lg:py-14">
        <section className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]">
          <div className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
            <div className="mb-4 flex items-center gap-3">
              <div className="fine-rule w-10" />
              <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Help</span>
            </div>
            <h1 className="max-w-[800px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">
              Find the thing you need without reading a manual.
            </h1>
            <p className="mt-5 max-w-[760px] text-[15px] leading-7 text-[#596b65]">
              Search a question or browse by task. The answers start with what you can do now, then explain the evidence boundary only where it matters.
            </p>

            <label className="mt-7 flex max-w-[680px] items-center gap-3 rounded-xl border border-[#cfc3aa] bg-[#fdfbf5] px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#ae6249]">
              <Search size={18} className="shrink-0 text-[#ae6249]" />
              <span className="sr-only">Search help</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try “partial hand”, “winning tile”, “save game”…"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#284d45] outline-none placeholder:text-[#8a8779]"
              />
            </label>
            {normalized && (
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[.14em] text-[#7a7769]">
                {resultCount} {resultCount === 1 ? 'answer' : 'answers'} found
              </p>
            )}
          </div>

          {!normalized && (
            <div className="border-b border-[#ddd3bf] px-5 py-7 sm:px-8 lg:px-12">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {groups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <a
                      key={group.title}
                      href={`#${group.items[0].id}`}
                      className="group rounded-xl border border-[#ddd3bf] bg-[#fdfbf5] p-4 transition hover:-translate-y-0.5 hover:border-[#c9b99d] hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
                    >
                      <Icon size={18} className="text-[#477562]" />
                      <div className="mt-3 font-serif text-[18px] leading-tight text-[#284d45]">{group.title}</div>
                      <div className="mt-1 text-[10px] leading-4 text-[#7a7769]">{group.items.length} answers</div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className="px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            {visibleGroups.length ? (
              <div className="space-y-11">
                {visibleGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <section key={group.title}>
                      <div className="mb-5 flex items-start gap-3">
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#efe8da] text-[#477562]">
                          <Icon size={17} />
                        </div>
                        <div>
                          <h2 className="font-serif text-[30px] leading-tight text-[#284d45]">{group.title}</h2>
                          <p className="mt-1 max-w-[700px] text-[12px] leading-6 text-[#66746e]">{group.description}</p>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {group.items.map((item) => <HelpCard key={item.id} item={item} />)}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-[#d8ceb8] bg-[#f5eadb] p-6 text-center">
                <AlertTriangle size={21} className="mx-auto text-[#ae6249]" />
                <h2 className="mt-3 font-serif text-[24px] text-[#284d45]">No matching help answer yet</h2>
                <p className="mx-auto mt-2 max-w-[560px] text-[12px] leading-6 text-[#66746e]">
                  Try a shorter phrase such as “partial”, “Kong”, “settlement” or “save”. You can also use the scoring guide and special-hand catalogue below.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <h2 className="font-serif text-[28px] text-[#284d45]">Need the rules rather than the app help?</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ['/guide', BookOpen, 'Scoring guide', 'Learn points, doubles and scoring progressively.'],
                ['/special-hands', Sparkles, 'Special hands', 'Browse the supported visual special-hand catalogue.'],
                ['/how-it-works', CircleHelp, 'How it works', 'See how evidence, scoring, settlement and the ledger fit together.'],
              ].map(([href, Icon, title, description]) => {
                const LinkIcon = Icon as typeof BookOpen;
                return (
                  <a key={href as string} href={href as string} className="group flex items-center justify-between gap-4 rounded-xl border border-[#ddd3bf] bg-[#fdfbf5] p-5 transition hover:border-[#c9b99d] hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                    <div className="flex gap-3">
                      <LinkIcon size={18} className="mt-1 shrink-0 text-[#477562]" />
                      <div>
                        <div className="font-serif text-[20px] text-[#284d45]">{title as string}</div>
                        <div className="mt-1 text-[10px] leading-5 text-[#7a7769]">{description as string}</div>
                      </div>
                    </div>
                    <ArrowRight size={15} className="shrink-0 text-[#ae6249] transition-transform group-hover:translate-x-1" />
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
