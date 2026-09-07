import type { ReactNode } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Sparkles,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { tileAssetUrl, type TileAssetKey } from '../tiles/MahjongTileArtwork';

const sections = [
  { id: 'winds', label: 'Everyone has a Wind' },
  { id: 'deal', label: 'The deal' },
  { id: 'turn', label: 'The rhythm of a turn' },
  { id: 'sets', label: 'Pung, Kong and Chow' },
  { id: 'claims', label: 'Claiming a discard' },
  { id: 'visibility', label: 'Concealed and exposed' },
  { id: 'bonus-tiles', label: 'Flowers and Seasons' },
  { id: 'kong-box', label: 'The Kong box' },
  { id: 'hand-end', label: 'How a hand ends' },
  { id: 'drawn-hand', label: 'If nobody wins' },
  { id: 'wind-rotation', label: 'How the Winds move' },
  { id: 'prevailing-wind', label: 'Seat vs prevailing Wind' },
  { id: 'remember', label: 'Five things to remember' },
] as const;

type VisualTile = {
  asset: TileAssetKey;
  label: string;
};

const winds: Array<{ name: string; asset: TileAssetKey; bonus: string }> = [
  { name: 'East', asset: 'Ton', bonus: 'Flower 1 · Season 1' },
  { name: 'South', asset: 'Nan', bonus: 'Flower 2 · Season 2' },
  { name: 'West', asset: 'Shaa', bonus: 'Flower 3 · Season 3' },
  { name: 'North', asset: 'Pei', bonus: 'Flower 4 · Season 4' },
];

const ordinaryHand: Array<{ name: string; tiles: VisualTile[] }> = [
  {
    name: 'Pung',
    tiles: [
      { asset: 'Pin7', label: '7 Circles' },
      { asset: 'Pin7', label: '7 Circles' },
      { asset: 'Pin7', label: '7 Circles' },
    ],
  },
  {
    name: 'Pung',
    tiles: [
      { asset: 'Ton', label: 'East Wind' },
      { asset: 'Ton', label: 'East Wind' },
      { asset: 'Ton', label: 'East Wind' },
    ],
  },
  {
    name: 'Chow',
    tiles: [
      { asset: 'Sou3', label: '3 Bamboo' },
      { asset: 'Sou4', label: '4 Bamboo' },
      { asset: 'Sou5', label: '5 Bamboo' },
    ],
  },
  {
    name: 'Pung',
    tiles: [
      { asset: 'Chun', label: 'Red Dragon' },
      { asset: 'Chun', label: 'Red Dragon' },
      { asset: 'Chun', label: 'Red Dragon' },
    ],
  },
  {
    name: 'Pair',
    tiles: [
      { asset: 'Man1', label: '1 Character' },
      { asset: 'Man1', label: '1 Character' },
    ],
  },
];

const flowerNames = [
  { number: 1, flower: 'Plum', season: 'Spring', wind: 'East' },
  { number: 2, flower: 'Orchid', season: 'Summer', wind: 'South' },
  { number: 3, flower: 'Chrysanthemum', season: 'Autumn', wind: 'West' },
  { number: 4, flower: 'Bamboo', season: 'Winter', wind: 'North' },
] as const;

function Tile({ asset, label, compact = false }: VisualTile & { compact?: boolean }) {
  return (
    <figure className="shrink-0 text-center">
      <img
        src={tileAssetUrl(asset)}
        alt={label}
        loading="lazy"
        className={`mx-auto rounded-[6px] bg-[#fffdf7] object-contain shadow-[0_2px_6px_rgba(48,57,49,.12)] ${
          compact ? 'h-[54px] w-[41px]' : 'h-[70px] w-[53px]'
        }`}
      />
    </figure>
  );
}

function TileGroup({ name, tiles }: { name: string; tiles: VisualTile[] }) {
  return (
    <div className="rounded-lg border border-[#dfd5c2] bg-[#fdfbf5] p-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tiles.map((tile, index) => (
          <Tile key={`${name}-${tile.asset}-${index}`} {...tile} compact />
        ))}
      </div>
      <div className="mt-2 font-mono text-[9px] uppercase tracking-[.14em] text-[#ae6249]">{name}</div>
    </div>
  );
}

function GuideSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
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

function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-[#cfbfa4] bg-[#f5eadb] p-5 text-[#284d45] shadow-[var(--shadow-sm)]">
      <div className="flex gap-3">
        <CircleHelp size={18} className="mt-1 shrink-0 text-[#ae6249]" />
        <div className="text-[13px] leading-6">{children}</div>
      </div>
    </div>
  );
}

function ProcessStrip({ steps }: { steps: string[] }) {
  return (
    <div className="my-6 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
      {steps.map((step, index) => (
        <div key={step} className="contents">
          <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] px-4 py-4 text-center font-serif text-[20px] text-[#284d45]">
            {step}
          </div>
          {index < steps.length - 1 && (
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="mx-auto rotate-90 text-[#ae6249] sm:rotate-0"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function GameplayBasics() {
  return (
    <div className="mahjong-shell">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-5 lg:self-start">
            <div className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-4 shadow-[var(--shadow-sm)]">
              <div className="mb-3 font-mono text-[9px] uppercase tracking-[.2em] text-[#ae6249]">On this page</div>
              <nav aria-label="Gameplay basics sections" className="space-y-1">
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
                <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Your first game</span>
              </div>
              <h1 className="max-w-[760px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">
                A first game of British Mahjong, step by step.
              </h1>
              <p className="mt-5 max-w-[740px] text-[15px] leading-7 text-[#596b65]">
                British Mahjong is played by building a hand while taking one tile and discarding one tile in turn. You do not need to know all the scoring rules before you begin.
              </p>
              <a
                href="/mahjong-rules-compared"
                className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 transition hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
              >
                Not sure which Mahjong rules you play? Compare British, Hong Kong, Riichi, MCR and American Mahjong <ArrowRight size={13} />
              </a>

              <div className="mt-7 rounded-xl bg-[#284d45] p-5 text-[#f8f4e9]">
                <div className="flex items-start gap-3">
                  <Sparkles size={18} className="mt-1 shrink-0 text-[#d7a287]" />
                  <div>
                    <div className="font-serif text-[20px]">Four sets + one pair = Mah Jong</div>
                    <p className="mt-1 text-[12px] leading-5 text-[#c8d8d1]">
                      Start by learning the rhythm: draw, decide, discard, and recognise when another player’s discard can help you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {ordinaryHand.map((group, index) => (
                  <TileGroup key={`${group.name}-${index}`} {...group} />
                ))}
              </div>
              <p className="mt-4 text-[11px] leading-5 text-[#8c8a7f]">One ordinary completed hand. Special hands can use different patterns.</p>
            </section>

            <GuideSection id="winds" number="01" title="Everyone has a Wind">
              <p>At a four-player table, each player has a <strong className="text-[#284d45]">seat Wind</strong>: East, South, West or North. These are player roles that move as the game progresses.</p>
              <p><strong className="text-[#284d45]">East is special.</strong> East starts the hand and receives one extra tile in the deal so that they can make the first discard.</p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {winds.map((item) => (
                  <div key={item.name} className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-4 text-center">
                    <Tile asset={item.asset} label={`${item.name} Wind`} />
                    <div className="mt-3 font-serif text-[20px] text-[#284d45]">{item.name}</div>
                    <div className="mt-1 text-[10px] leading-5 text-[#7a7769]">{item.bonus}</div>
                  </div>
                ))}
              </div>
              <Callout>Play moves anti-clockwise through these player positions. Your seat Wind can also affect scoring and determines your matching Flower and Season.</Callout>
            </GuideSection>

            <GuideSection id="deal" number="02" title="The deal">
              <p>At the start of a hand, <strong className="text-[#284d45]">East receives 14 playing tiles</strong>. South, West and North receive <strong className="text-[#284d45]">13 each</strong>.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#d8ceb8] bg-[#f5eadb] p-5 text-center">
                  <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#ae6249]">East</div>
                  <div className="mt-2 font-serif text-[29px] text-[#284d45]">14 → discard → 13</div>
                </div>
                <div className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-5 text-center">
                  <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#7a7769]">South · West · North</div>
                  <div className="mt-2 font-serif text-[29px] text-[#284d45]">13</div>
                </div>
              </div>
              <p>Flowers and Seasons are bonus tiles, not part of the normal 13-tile playing hand. If one is dealt to you, lay it face-up and take a replacement tile from the <strong className="text-[#284d45]">Kong box</strong>.</p>
              <Callout>During ordinary play, counting your playing tiles in groups of three should normally leave one tile over. Declared Kongs add an extra physical tile, so the visible count can be higher without the hand being wrong.</Callout>
            </GuideSection>

            <GuideSection id="turn" number="03" title="The rhythm of a turn">
              <p>Most turns follow the same three steps. You can discard the tile you just drew, or keep it and discard something else.</p>
              <ProcessStrip steps={['Draw', 'Decide', 'Discard']} />
              <p>A discarded tile is normally finished with immediately. It only comes back into play if somebody is allowed to claim it straight away.</p>
            </GuideSection>

            <GuideSection id="sets" number="04" title="The three ordinary kinds of set">
              <div className="grid gap-5">
                <div className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-5">
                  <h3 className="font-serif text-[24px] text-[#284d45]">Pung</h3>
                  <p className="mt-2 text-[13px] leading-6">Three identical tiles. Pungs are one of the most common building blocks of a British Mahjong hand.</p>
                  <div className="mt-4"><TileGroup name="Pung" tiles={[{ asset: 'Pin7', label: '7 Circles' }, { asset: 'Pin7', label: '7 Circles' }, { asset: 'Pin7', label: '7 Circles' }]} /></div>
                </div>
                <div className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-5">
                  <h3 className="font-serif text-[24px] text-[#284d45]">Kong</h3>
                  <p className="mt-2 text-[13px] leading-6">Four identical tiles. A Kong still fills just one set position, so declaring it means taking a replacement tile from the Kong box.</p>
                  <div className="mt-4"><TileGroup name="Kong" tiles={[{ asset: 'Chun', label: 'Red Dragon' }, { asset: 'Chun', label: 'Red Dragon' }, { asset: 'Chun', label: 'Red Dragon' }, { asset: 'Chun', label: 'Red Dragon' }]} /></div>
                </div>
                <div className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-5">
                  <h3 className="font-serif text-[24px] text-[#284d45]">Chow</h3>
                  <p className="mt-2 text-[13px] leading-6">Three consecutive numbered tiles from the same suit. Under the ordinary British rules used by this scorer, a normal hand may contain no more than one Chow.</p>
                  <div className="mt-4"><TileGroup name="Chow" tiles={[{ asset: 'Sou3', label: '3 Bamboo' }, { asset: 'Sou4', label: '4 Bamboo' }, { asset: 'Sou5', label: '5 Bamboo' }]} /></div>
                </div>
              </div>
              <Callout>Most sets you enter in the scorer will be Pungs. Chows are more restricted, and Kongs are less common.</Callout>
            </GuideSection>

            <GuideSection id="claims" number="05" title="Claiming another player’s discard">
              <p>If another player discards exactly the tile you need, you may sometimes claim it immediately.</p>
              <div className="space-y-3">
                {[
                  ['Pung', 'If the discard completes three identical tiles, call “Pung!”, lay the set face-up, then discard a tile.'],
                  ['Kong', 'If the discard completes four identical tiles, call “Kong!”, lay it out, take a Kong-box replacement, then continue your turn.'],
                  ['Chow', 'You may normally claim a discard for a Chow only when you are the next player due to play.'],
                  ['Mah Jong', 'If the discard completes your winning hand, declare “Mah Jong!”. There is no discard after the winning tile.'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-lg border border-[#dfd5c2] bg-[#fdfbf5] p-4">
                    <div className="font-serif text-[20px] text-[#284d45]">{title}</div>
                    <p className="mt-1 text-[12px] leading-6">{text}</p>
                  </div>
                ))}
              </div>
              <div className="my-6 rounded-xl bg-[#284d45] p-5 text-[#f8f4e9]">
                <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#d7a287]">Quick decision</div>
                <div className="mt-3 space-y-2 text-[12px] leading-5 text-[#dbe5e1]">
                  <p>Discard completes your Pung or Kong? <strong className="text-white">Claim it.</strong></p>
                  <p>Discard completes your Chow and you are next? <strong className="text-white">Claim it.</strong></p>
                  <p>Discard completes Mah Jong? <strong className="text-white">Declare Mah Jong.</strong></p>
                  <p>Otherwise? <strong className="text-white">Leave it.</strong></p>
                </div>
              </div>
              <details className="rounded-lg border border-[#dfd5c2] bg-[#fdfbf5] p-4">
                <summary className="cursor-pointer text-[12px] font-semibold text-[#284d45]">What if two people want the same discard?</summary>
                <p className="mt-3 text-[12px] leading-6">Mah Jong takes precedence over an ordinary set claim. If more than one player can declare Mah Jong from the same discard, precedence follows the normal anti-clockwise order from the discarder.</p>
              </details>
            </GuideSection>

            <GuideSection id="visibility" number="06" title="Concealed and exposed sets">
              <p>A set is <strong className="text-[#284d45]">concealed</strong> when you make it from your original tiles and tiles you draw yourself. A set is <strong className="text-[#284d45]">exposed</strong> when you claim another player’s discard to complete it and lay it face-up.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-4">
                  <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#477562]">Concealed Pung</div>
                  <div className="mt-3 opacity-75"><TileGroup name="Kept in your hand" tiles={[{ asset: 'Man9', label: '9 Characters' }, { asset: 'Man9', label: '9 Characters' }, { asset: 'Man9', label: '9 Characters' }]} /></div>
                </div>
                <div className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-4">
                  <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#ae6249]">Exposed Pung</div>
                  <div className="mt-3"><TileGroup name="Laid face-up" tiles={[{ asset: 'Man9', label: '9 Characters' }, { asset: 'Man9', label: '9 Characters' }, { asset: 'Man9', label: '9 Characters' }]} /></div>
                </div>
              </div>
              <Callout>The scorer keeps track of this because it affects points. You only need to say whether the set was exposed or concealed.</Callout>
            </GuideSection>

            <GuideSection id="bonus-tiles" number="07" title="Flowers and Seasons interrupt the normal draw">
              <p>Flowers and Seasons are bonus tiles. They do not stay in your playing hand. Lay them face-up and take a replacement tile from the Kong box. If the replacement is another bonus tile, repeat the process.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#cfbfa4] bg-[#f5eadb] p-5">
                  <div className="flex gap-3">
                    <Tile asset="Flower2" label="Flower 2 — Orchid" />
                    <div>
                      <div className="font-serif text-[21px] text-[#284d45]">Flower 2 — Orchid</div>
                      <div className="mt-1 text-[11px] text-[#7a7769]">Matches South</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#cfd9d4] bg-[#edf2ee] p-5">
                  <div className="flex gap-3">
                    <Tile asset="Season2" label="Season 2 — Summer" />
                    <div>
                      <div className="font-serif text-[21px] text-[#284d45]">Season 2 — Summer</div>
                      <div className="mt-1 text-[11px] text-[#7a7769]">Matches South</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-4">
                <div className="flex min-w-[620px] gap-5">
                  {flowerNames.map((item) => (
                    <div key={item.number} className="flex min-w-[135px] items-center gap-2">
                      <Tile asset={`Flower${item.number}` as TileAssetKey} label={`Flower ${item.number} — ${item.flower}`} compact />
                      <div className="text-[10px] leading-5 text-[#66746e]">
                        <strong className="text-[#284d45]">{item.wind}</strong><br />{item.flower} · {item.season}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <a href="/guide#tiles" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                Why do Flowers and Seasons match Winds? <ArrowRight size={13} />
              </a>
            </GuideSection>

            <GuideSection id="kong-box" number="08" title="What is the Kong box?">
              <p>The <strong className="text-[#284d45]">Kong box</strong> is a small reserved group of tiles at the end of the wall. It supplies replacement tiles after a Flower, Season or declared Kong.</p>
              <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 text-center">
                  <div className="font-serif text-[24px] text-[#284d45]">Live wall</div>
                  <p className="mt-1 text-[11px] text-[#7a7769]">Normal turn-by-turn draws</p>
                  <div className="mx-auto mt-4 h-3 max-w-[420px] rounded-sm bg-[#cfc3aa]" />
                </div>
                <div className="rounded-xl border border-[#ae6249] bg-[#f5eadb] p-5 text-center">
                  <div className="font-serif text-[24px] text-[#284d45]">Kong box</div>
                  <p className="mt-1 text-[11px] text-[#7a7769]">Replacement tiles only</p>
                  <div className="mx-auto mt-4 h-3 max-w-[150px] rounded-sm bg-[#ae6249]" />
                </div>
              </div>
            </GuideSection>

            <GuideSection id="hand-end" number="09" title="How a hand ends">
              <p>A hand usually ends when somebody declares <strong className="text-[#284d45]">Mah Jong</strong>. For an ordinary hand, that normally means four sets and a pair.</p>
              <ProcessStrip steps={['4 sets + pair', 'Mah Jong', 'Score the table']} />
              <ol className="list-decimal space-y-1 pl-5">
                <li>Play stops.</li>
                <li>All players lay out their hands.</li>
                <li>The winner is scored first.</li>
                <li>The other hands are scored.</li>
                <li>Payments are settled.</li>
              </ol>
              <p>The scorer can handle those calculations for you.</p>
            </GuideSection>

            <GuideSection id="drawn-hand" number="10" title="What if nobody wins?">
              <p>If the live wall runs out before anyone declares Mah Jong, the hand is drawn. A hand can also be drawn if a replacement tile is required but the Kong box is empty.</p>
              <Callout>For a first game, that is enough to know. The British-rules goulash is a separate continuation with extra rules and is deliberately kept out of this beginner flow.</Callout>
            </GuideSection>

            <GuideSection id="wind-rotation" number="11" title="How the Winds move between hands">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-5">
                  <div className="font-serif text-[21px] text-[#284d45]">If East wins</div>
                  <p className="mt-2 text-[12px] leading-6">East stays East. The seat Winds do not move.</p>
                </div>
                <div className="rounded-xl border border-[#cfbfa4] bg-[#f5eadb] p-5">
                  <div className="font-serif text-[21px] text-[#284d45]">If another player wins</div>
                  <p className="mt-2 text-[12px] leading-6">South becomes East, West becomes South, North becomes West, and East becomes North.</p>
                </div>
                <div className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-5">
                  <div className="font-serif text-[21px] text-[#284d45]">If the hand is drawn</div>
                  <p className="mt-2 text-[12px] leading-6">East stays East.</p>
                </div>
              </div>
              <div className="my-6 flex items-center justify-between gap-2 overflow-x-auto rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4">
                {winds.map((item, index) => (
                  <div key={item.name} className="flex shrink-0 items-center gap-2">
                    <div className="text-center">
                      <Tile asset={item.asset} label={`${item.name} Wind`} compact />
                      <div className="mt-1 text-[9px] font-semibold text-[#284d45]">{item.name}</div>
                    </div>
                    {index < winds.length - 1 && <ArrowRight size={14} aria-hidden="true" className="text-[#ae6249]" />}
                  </div>
                ))}
              </div>
              <Callout><strong>You do not become East simply because you won.</strong> East moves to the player who was South when the previous East does not win.</Callout>
            </GuideSection>

            <GuideSection id="prevailing-wind" number="12" title="Seat Wind and prevailing Wind are different">
              <p>Your <strong className="text-[#284d45]">seat Wind</strong> identifies your current player position. The <strong className="text-[#284d45]">prevailing Wind</strong> applies to the whole table and changes more slowly.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#ae6249] bg-[#f5eadb] p-5">
                  <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#ae6249]">Your seat Wind</div>
                  <div className="mt-2 flex items-center gap-3"><Tile asset="Nan" label="South Wind" compact /><span className="font-serif text-[25px] text-[#284d45]">South</span></div>
                </div>
                <div className="rounded-xl border border-[#cfd9d4] bg-[#edf2ee] p-5">
                  <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#477562]">Prevailing Wind</div>
                  <div className="mt-2 flex items-center gap-3"><Tile asset="Ton" label="East Wind" compact /><span className="font-serif text-[25px] text-[#284d45]">East</span></div>
                </div>
              </div>
              <p>They can be the same, but they are not the same thing. East always starts the hand regardless of the prevailing Wind. The game scorer tracks both for you.</p>
            </GuideSection>

            <GuideSection id="remember" number="13" title="The five things to remember for your first game">
              <div className="rounded-xl bg-[#284d45] p-5 text-[#f8f4e9] sm:p-6">
                <ol className="space-y-4">
                  {[
                    'Build four sets and a pair.',
                    'On your turn: draw one, discard one.',
                    'Pungs and Kongs are matching tiles; a Chow is a three-tile run.',
                    'Flowers, Seasons and Kongs get replacement tiles from the Kong box.',
                    'East starts, and East stays East if East wins.',
                  ].map((text, index) => (
                    <li key={text} className="flex gap-3">
                      <span className="font-mono text-[10px] text-[#d7a287]">0{index + 1}</span>
                      <span className="text-[13px] leading-6 text-[#e4ece8]">{text}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 border-t border-[#49675f] pt-5 font-serif text-[20px] leading-snug">That is enough to start playing. The scorer can help with the parts that are harder to remember.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a href="/game" className="group rounded-xl border border-[#284d45] bg-[#284d45] p-5 text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                  <div className="font-serif text-[22px]">Score a game</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[#c8d8d1]">Run a four-player table <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></div>
                </a>
                <a href="/hand" className="group rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 transition hover:border-[#ae6249] hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                  <div className="font-serif text-[22px] text-[#284d45]">Score a hand</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[#66746e]">Calculate one hand <ArrowRight size={13} className="text-[#ae6249] transition-transform group-hover:translate-x-1" /></div>
                </a>
                <a href="/guide#ordinary-scoring" className="group rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 transition hover:border-[#ae6249] hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                  <div className="font-serif text-[22px] text-[#284d45]">Scoring basics</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[#66746e]">Points, doubles and settlement <ArrowRight size={13} className="text-[#ae6249] transition-transform group-hover:translate-x-1" /></div>
                </a>
                <a href="/special-hands" className="group rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 transition hover:border-[#ae6249] hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                  <div className="font-serif text-[22px] text-[#284d45]">Special hands</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[#66746e]">Browse the visual catalogue <ArrowRight size={13} className="text-[#ae6249] transition-transform group-hover:translate-x-1" /></div>
                </a>
              </div>

              <details className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-5">
                <summary className="cursor-pointer font-serif text-[19px] text-[#284d45]">Setting up a physical table</summary>
                <div className="mt-4 space-y-2 text-[12px] leading-6 text-[#596b65]">
                  <p>Shuffle all tiles face-down, build four walls, determine the seat Winds and prevailing Wind, break the wall using the table’s dice procedure, reserve the Kong box, and deal 14 tiles to East and 13 to the other players.</p>
                  <p>Replace any dealt Flowers and Seasons before East makes the first discard. The exact wall-breaking procedure is best followed from the full British-rules source rather than compressed into this first-game guide.</p>
                </div>
              </details>
            </GuideSection>
          </article>
        </div>
      </main>

      <footer className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 border-t border-[#d8ceb8] px-5 py-5 lg:px-8">
        <p className="text-[10px] leading-5 text-[#8c8a7f]">Independent learner guide · not an official BMJA publication.</p>
        <a href="/" className="text-[10px] font-semibold text-[#66746e] underline decoration-[#c9b99d] underline-offset-4 hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Back to British Mahjong Scorer</a>
      </footer>
    </div>
  );
}
