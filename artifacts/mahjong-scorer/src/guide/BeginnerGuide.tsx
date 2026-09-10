import { useEffect } from 'react';
import { BookOpen, ChevronRight, CircleHelp, Sparkles } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { ReturnToGame } from '../components/ReturnToGame';
import { SetExamples, TileGallery } from './MahjongTileGallery';
import { BONUS_TILE_DEFINITIONS, tileAssetUrl } from '../tiles/MahjongTileArtwork';

const sections = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'hand-shape', label: 'What makes a hand?' },
  { id: 'tiles', label: 'The tiles' },
  { id: 'matching-bonus-tiles', label: 'Matching Flowers and Seasons' },
  { id: 'tile-count', label: '13 tiles and the winning tile' },
  { id: 'visibility', label: 'Exposed and concealed' },
  { id: 'ordinary-scoring', label: 'How scoring works' },
  { id: 'doubles', label: 'What is a double?' },
  { id: 'fishing', label: 'What does fishing mean?' },
  { id: 'special-hands', label: 'Special hands' },
  { id: 'settling-up', label: 'Settling up' },
  { id: 'glossary', label: 'Glossary' },
] as const;

const glossary = [
  ['Chow', 'Three consecutive numbered tiles in the same suit.'],
  ['Pung', 'Three identical tiles.'],
  ['Kong', 'Four identical tiles.'],
  ['Pair', 'Two identical tiles.'],
  ['Concealed', 'A set completed entirely from tiles you drew yourself.'],
  ['Exposed', 'A set completed by claiming another player’s discard.'],
  ['Honours', 'The four Winds and three Dragons.'],
  ['Major tile', 'A 1, a 9, a Wind or a Dragon.'],
  ['Minor tile', 'A suited tile from 2 to 8.'],
  ['Fishing', 'Needing exactly one tile to go Mah Jong.'],
  ['Mah Jong', 'A completed winning hand.'],
  ['Prevailing Wind', 'The Wind of the current round.'],
  ['Own Wind', 'Your current seat Wind.'],
  ['Loose / replacement tile', 'A replacement tile drawn after a Kong or bonus tile.'],
  ['Original Call', 'A separate BMJA scoring condition. It is not simply another name for fishing.'],
] as const;

function GuideSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 border-b border-[#ddd3bf] py-9 last:border-0 sm:py-11">
      <div className="mb-5 flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">{number}</span>
        <div className="fine-rule w-8" />
      </div>
      <h2 className="font-serif text-[30px] leading-tight text-[#284d45] sm:text-[34px]">{title}</h2>
      <div className="mt-5 space-y-4 text-[14px] leading-7 text-[#596b65]">{children}</div>
    </section>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-[#cfbfa4] bg-[#f5eadb] p-5 text-[#284d45] shadow-[var(--shadow-sm)]">
      <div className="flex gap-3">
        <CircleHelp size={18} className="mt-1 shrink-0 text-[#ae6249]" />
        <div className="text-[13px] leading-6">{children}</div>
      </div>
    </div>
  );
}

export function BeginnerGuide({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const revealHashTarget = () => {
      const rawHash = window.location.hash.slice(1);
      if (!rawHash) return;

      const target = document.getElementById(decodeURIComponent(rawHash));
      if (!target) return;

      const containingDetails = target.closest('details');
      if (containingDetails) containingDetails.open = true;

      window.requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'start' });
      });
    };

    revealHashTarget();
    window.addEventListener('hashchange', revealHashTarget);
    return () => window.removeEventListener('hashchange', revealHashTarget);
  }, []);

  return (
    <div className="mahjong-shell">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8 lg:py-12">
        <ReturnToGame />
        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-5 lg:self-start">
            <div className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-4 shadow-[var(--shadow-sm)]">
              <div className="mb-3 font-mono text-[9px] uppercase tracking-[.2em] text-[#ae6249]">On this page</div>
              <nav aria-label="Beginner guide sections" className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2 text-[11px] font-semibold text-[#66746e] transition hover:bg-[#efe8da] hover:text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
                  >
                    {section.label}
                    <ChevronRight size={13} className="shrink-0 text-[#ae6249]" />
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="min-w-0 rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] px-5 shadow-[var(--shadow-sm)] sm:px-8 lg:px-10">
            <section className="border-b border-[#ddd3bf] py-9 sm:py-11">
              <div className="mb-4 flex items-center gap-3">
                <div className="fine-rule w-10" />
                <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Practical guide</span>
              </div>
              <h1 className="max-w-[720px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">British Mahjong without the rulebook overwhelm.</h1>
              <p className="mt-5 max-w-[720px] text-[15px] leading-7 text-[#596b65]">
                This guide explains enough to understand what the scorer is asking you and why. You do not need to memorise the scoring engine before you can play.
              </p>
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#284d45] p-5 text-[#f8f4e9]">
                <Sparkles size={18} className="mt-1 shrink-0 text-[#d7a287]" />
                <div>
                  <div className="font-serif text-[18px]">Start with your actual tiles.</div>
                  <p className="mt-1 text-[12px] leading-5 text-[#c8d8d1]">The scorer can classify major and minor tiles, apply the arithmetic and detect many special patterns for you.</p>
                </div>
              </div>
              <a href="/hand" className="mt-5 inline-flex min-h-10 items-center rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 text-[12px] font-semibold text-[#284d45] transition hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Try this in the British Mahjong hand calculator</a>
              <p className="mt-5 text-[11px] leading-5 text-[#8c8a7f]">This is an independent learner guide. It is not an official BMJA publication.</p>
            </section>

            <GuideSection id="getting-started" number="01" title="Getting started">
              <p>British Mahjong can look complicated because scoring combines the tiles in your hand, how they were grouped, how you won, and sometimes what happened during play.</p>
              <p>You do not need to memorise all of that. Enter what you can see and what you know happened; the scorer handles the detailed arithmetic and only asks extra questions when the answer cannot be inferred.</p>
            </GuideSection>

            <GuideSection id="hand-shape" number="02" title="What makes a Mahjong hand?">
              <p>A normal Mahjong hand is made from <strong className="text-[#284d45]">four sets and a pair</strong>.</p>
              <SetExamples />
              <p>Under British rules, a normal hand can contain <strong className="text-[#284d45]">no more than one Chow</strong>. Some named special hands use different patterns; the scorer checks those separately.</p>
            </GuideSection>

            <GuideSection id="tiles" number="03" title="The tiles">
              <p>There are three numbered suits: <strong className="text-[#284d45]">Bamboos, Characters and Circles</strong>. Each runs from 1 to 9.</p>
              <p>There are also four Winds — East, South, West and North — and three Dragons — Red, Green and White. Winds and Dragons together are called <strong className="text-[#284d45]">honours</strong>.</p>
              <TileGallery />
              <div className="overflow-x-auto rounded-lg border border-[#dfd5c2] bg-[#fdfbf5]">
                <table className="w-full min-w-[420px] text-left text-[12px]">
                  <thead className="border-b border-[#dfd5c2] font-mono text-[9px] uppercase tracking-[.14em] text-[#8c8a7f]">
                    <tr><th className="px-4 py-3">Tile</th><th className="px-4 py-3">British scoring class</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e0d1] text-[#596b65]">
                    <tr><td className="px-4 py-3">2–8 of a numbered suit</td><td className="px-4 py-3">Minor</td></tr>
                    <tr><td className="px-4 py-3">1s and 9s</td><td className="px-4 py-3">Major</td></tr>
                    <tr><td className="px-4 py-3">Winds and Dragons</td><td className="px-4 py-3">Major · honours</td></tr>
                  </tbody>
                </table>
              </div>
              <p>Flowers and Seasons are bonus tiles. They are put aside when drawn and replaced, so they do not form part of the normal playing-hand count.</p>
              <Callout>You do not need to decide whether a tile is major, minor or an honour. The scorer does that automatically.</Callout>
            </GuideSection>

            <GuideSection id="tile-count" number="04" title="Your 13 tiles and the winning tile">
              <p>During normal play, the underlying hand structure contains <strong className="text-[#284d45]">13 playing tiles</strong>. When you go Mah Jong, the winning tile remains in the hand, giving a 14-tile completed structure.</p>
              <p>A Kong contains four identical tiles rather than three. Because a replacement tile is drawn after declaring a Kong, a hand with one or more Kongs can physically contain more than 13 or 14 playing tiles while still having the correct structure.</p>
              <p>If you have not won, enter completed groups as sets and put every other playing tile under <strong className="text-[#284d45]">Remaining tiles</strong>. They can be singles, pairs or unfinished runs; you do not need to force them into a fishing shape.</p>
              <p>Flowers and Seasons are excluded from that structural total because each is set aside and replaced.</p>
              <Callout>If a tile count looks wrong, check that Flowers and Seasons are entered as bonus tiles and that any four-of-a-kind group is entered as a Kong rather than a Pung.</Callout>
            </GuideSection>

            <GuideSection id="matching-bonus-tiles" number="05" title="Matching Flowers and Seasons">
              <p>In British Mahjong, every Flower and Season belongs to one Wind. If the tile matches <strong className="text-[#284d45]">your own seat Wind</strong>, it gives an extra double.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(['east', 'south', 'west', 'north'] as const).map((wind) => {
                  const tiles = BONUS_TILE_DEFINITIONS.filter((tile) => tile.wind === wind);
                  return (
                    <div key={wind} className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-4">
                      <h3 className="font-serif text-[19px] capitalize text-[#284d45]">{wind}</h3>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.12em] text-[#ae6249]">Matches {wind.charAt(0).toUpperCase() + wind.slice(1)}</p>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {tiles.map((tile) => (
                          <figure key={tile.asset} className="flex items-center gap-2">
                            <img src={tileAssetUrl(tile.asset)} alt={tile.label} loading="lazy" className="h-[68px] w-[51px] rounded-[5px] bg-[#fffdf7] object-contain shadow-[0_2px_6px_rgba(48,57,49,.12)]" />
                            <figcaption className="text-[11px] leading-4 text-[#596b65]"><strong className="block text-[#284d45]">{tile.name}</strong>{tile.family === 'flower' ? 'Flower' : 'Season'} {tile.number}</figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Callout>
                <p id="rule-own-bonus-double" className="scroll-mt-24">Your matching Flower and matching Season each give <strong>1 double</strong>.</p>
                <p id="rule-bonus-bouquet-double" className="mt-2 scroll-mt-24">This uses your <strong>seat Wind</strong>, not the prevailing Wind. All four Flowers, or all four Seasons, give <strong>two doubles in total</strong> for that complete set.</p>
              </Callout>
            </GuideSection>

            <GuideSection id="visibility" number="06" title="Exposed and concealed sets">
              <p>A set is <strong className="text-[#284d45]">concealed</strong> if you made it entirely from tiles you drew yourself.</p>
              <p>A set is <strong className="text-[#284d45]">exposed</strong> if you claimed another player’s discard to complete it.</p>
              <p>Concealed Pungs and Kongs normally score more than exposed ones, which is why the scorer asks which applies. When the final winning tile creates a special exception, the app asks which tile completed Mah Jong rather than expecting you to know the rule.</p>
            </GuideSection>

            <GuideSection id="ordinary-scoring" number="07" title="How ordinary scoring works">
              <p>British Mahjong scoring happens in stages. First the hand receives basic points, then any doubles are applied, and finally the normal table limit is applied.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['1', 'Basic points', 'Pungs, Kongs, qualifying pairs, bonus tiles and winning points.'],
                  ['2', 'Doubles', 'Each qualifying double multiplies the relevant score by two.'],
                  ['3', 'Limit', 'The normal limit is usually 1,000 points.'],
                ].map(([step, title, description]) => (
                  <div key={step} className="rounded-lg border border-[#dfd5c2] bg-[#fdfbf5] p-4">
                    <div className="font-mono text-[9px] uppercase tracking-[.15em] text-[#ae6249]">Step {step}</div>
                    <div className="mt-1 font-serif text-[19px] text-[#284d45]">{title}</div>
                    <p className="mt-1 text-[11px] leading-5 text-[#6d746f]">{description}</p>
                  </div>
                ))}
              </div>
              <details className="rounded-lg border border-[#dfd5c2] bg-[#fdfbf5] p-4">
                <summary className="cursor-pointer text-[12px] font-semibold text-[#284d45]">Show basic set values</summary>
                <div className="mt-4 space-y-4 text-[12px]">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[430px] text-left">
                      <thead className="font-mono text-[9px] uppercase tracking-[.12em] text-[#8c8a7f]"><tr><th className="pb-2">Set</th><th className="pb-2">Tile</th><th className="pb-2">Exposed</th><th className="pb-2">Concealed</th></tr></thead>
                      <tbody className="divide-y divide-[#e8e0d1]">
                        <tr id="rule-pung-minor" className="scroll-mt-24"><td className="py-2">Pung</td><td>Minor</td><td>2</td><td>4</td></tr>
                        <tr id="rule-pung-major" className="scroll-mt-24"><td className="py-2">Pung</td><td>Major</td><td>4</td><td>8</td></tr>
                        <tr id="rule-kong-minor" className="scroll-mt-24"><td className="py-2">Kong</td><td>Minor</td><td>8</td><td>16</td></tr>
                        <tr id="rule-kong-major" className="scroll-mt-24"><td className="py-2">Kong</td><td>Major</td><td>16</td><td>32</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Chow: 0 points</li>
                    <li id="rule-dragon-pair" className="scroll-mt-24">Dragon pair: 2 points</li>
                    <li id="rule-own-wind-pair" className="scroll-mt-24">Own Wind pair: 2 points</li>
                    <li id="rule-prevailing-wind-pair" className="scroll-mt-24">Prevailing Wind pair: 2 points</li>
                    <li id="rule-bonus-tile-points" className="scroll-mt-24">Each Flower or Season: 4 points</li>
                    <li id="rule-mahjong-points" className="scroll-mt-24">Mah Jong: 20 points</li>
                    <li id="rule-live-wall-win" className="scroll-mt-24">Winning from the live wall: 2 additional points</li>
                  </ul>
                </div>
              </details>
            </GuideSection>

            <GuideSection id="doubles" number="07" title="What is a double?">
              <p>A <strong className="text-[#284d45]">double</strong> means the relevant score is multiplied by two.</p>
              <div className="flex flex-wrap gap-2 font-mono text-[11px] font-semibold text-[#284d45]">
                <span className="rounded-md bg-[#efe8da] px-3 py-2">1 double = ×2</span>
                <span className="rounded-md bg-[#efe8da] px-3 py-2">2 doubles = ×4</span>
                <span className="rounded-md bg-[#efe8da] px-3 py-2">3 doubles = ×8</span>
              </div>
              <p>Examples include some Dragon or Wind sets, having no Chows, using one suit with honours, a fully concealed winning hand, or particular ways of going Mah Jong.</p>
              <p>The useful thing for a beginner is not memorising the whole list. The scorer checks the conditions you enter and explains the doubles that actually applied to your hand.</p>
            </GuideSection>

            <GuideSection id="fishing" number="08" title="What does fishing mean?">
              <p><strong className="text-[#284d45]">Fishing</strong> means your hand needs exactly one more tile to go Mah Jong. You may also hear this described as calling.</p>
              <p>Some special hands receive a score even when you were fishing for them when another player went Mah Jong. You do not need to identify the special yourself; enter the tiles you hold and the scorer can look for valid completing tiles.</p>
              <Callout><strong>Fishing is not the same as Original Call.</strong> They are separate scoring concepts and the app treats them separately.</Callout>
            </GuideSection>

            <GuideSection id="special-hands" number="09" title="Special hands">
              <p>British Mahjong includes named special hands that do not use ordinary scoring in the usual way.</p>
              <p>Some are unusual tile patterns — such as Thirteen Unique Wonders, Knitting, Triple Knitting, Gates of Heaven and Wriggling Snake. Others depend on the circumstances of the win.</p>
              <p>The scorer detects these where it can. If it needs information that cannot be seen from the tiles, it asks a short factual question about what happened rather than asking you to identify the special by name.</p>
              <a href="/special-hands" className="block rounded-xl border border-[#b8cdbf] bg-[#edf3ed] p-5 transition hover:bg-[#e3eee6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-serif text-[19px] text-[#284d45]"><Sparkles size={16} className="text-[#477562]" /> Browse the visual special-hand catalogue</div>
                    <p className="mt-2 text-[12px] leading-5 text-[#66746e]">See every supported special with tile examples, values, fishing scores and simple event timelines.</p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-[#477562]" />
                </div>
              </a>
            </GuideSection>

            <GuideSection id="settling-up" number="10" title="Settling up">
              <p>Scoring the four hands is only the first step. Players then settle between one another.</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>The winner is paid their score by each of the other three players.</li>
                <li>The three losing players also settle the differences between their own scores.</li>
                <li><strong className="text-[#284d45]">Payments involving East are doubled.</strong></li>
              </ul>
              <Callout>You do not need to calculate the transfers yourself. Enter the four hand scores and the game scorer applies the settlement rules for you.</Callout>
              <p>For a draw / wash-out, East remains East. The current project implementation makes no settlement transfers for that hand; this remains documented as a project interpretation while the rules reference is refined.</p>
            </GuideSection>

            <GuideSection id="glossary" number="11" title="Glossary">
              <div className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
                {glossary.map(([term, definition]) => (
                  <div key={term} className="border-b border-[#e5ddcd] py-3">
                    <div className="font-serif text-[17px] text-[#284d45]">{term}</div>
                    <p className="mt-1 text-[11px] leading-5 text-[#6d746f]">{definition}</p>
                  </div>
                ))}
              </div>
            </GuideSection>

            <section className="py-9 sm:py-11">
              <div className="rounded-xl bg-[#284d45] p-6 text-[#f8f4e9] sm:p-7">
                <div className="font-mono text-[9px] uppercase tracking-[.2em] text-[#d7a287]">The main idea</div>
                <h2 className="mt-2 font-serif text-[28px]">You do not need to learn the scoring engine to use it.</h2>
                <p className="mt-3 max-w-[650px] text-[12px] leading-6 text-[#c8d8d1]">Use the scorer as the working tool and this guide as the explanation layer. When a score result teaches you something useful, that is the right moment to learn it.</p>
              </div>
            </section>
          </article>
        </div>
      </main>

      <footer className="mx-auto max-w-[1180px] border-t border-[#d8ceb8] px-5 py-5 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-[#8c8a7f]">Independent British Mahjong learner guide · not an official BMJA publication.</p>
          <button type="button" onClick={onClose} className="text-[11px] font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4">Return to scorer</button>
        </div>
        <p className="mt-3 max-w-[820px] text-[9px] leading-4 text-[#9a978c]">
          Mahjong tile artwork from{' '}
          <a className="underline underline-offset-2" href="https://github.com/xhokir/riichi-mahjong-tiles" target="_blank" rel="noreferrer">xhokir/riichi-mahjong-tiles</a>, based on FluffyStuff/riichi-mahjong-tiles, used under{' '}
          <a className="underline underline-offset-2" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>.
        </p>
      </footer>
    </div>
  );
}
