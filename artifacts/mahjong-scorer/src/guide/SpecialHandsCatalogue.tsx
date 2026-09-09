import { ChevronRight, CircleHelp, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { SiteHeader } from '../components/SiteHeader';
import { ReturnToGame } from '../components/ReturnToGame';
import { SPECIAL_HAND_ANCHORS } from './special-hand-references';

import { TileStrip, type TileAssetKey, type TileDefinition } from './MahjongTileGallery';

type SpecialCardData = {
  id: keyof typeof SPECIAL_HAND_ANCHORS;
  name: string;
  description: string;
  winner: string;
  fishing?: string;
  entry: string;
  detection: string;
  tiles?: TileDefinition[];
  visualNote?: string;
  detail?: string;
};

const t = (asset: TileAssetKey, label: string): TileDefinition => ({ asset, label });
const repeat = (tile: TileDefinition, count: number) => Array.from({ length: count }, () => tile);
const combine = (...groups: TileDefinition[][]) => groups.flat();

const pin = (n: number) => t(`Pin${n}` as TileAssetKey, `${n} Circles`);
const sou = (n: number) => t(`Sou${n}` as TileAssetKey, `${n} Bamboos`);
const man = (n: number) => t(`Man${n}` as TileAssetKey, `${n} Characters`);
const east = t('Ton', 'East Wind');
const south = t('Nan', 'South Wind');
const west = t('Shaa', 'West Wind');
const north = t('Pei', 'North Wind');
const red = t('Chun', 'Red Dragon');
const green = t('Hatsu', 'Green Dragon');
const white = t('Haku', 'White Dragon');

const normalSetSpecials: SpecialCardData[] = [
  {
    id: 'purity',
    name: 'Purity',
    description: 'One numbered suit only, using Pungs and/or Kongs plus a pair. No Winds, Dragons or Chow.',
    winner: '3 doubles',
    fishing: '3 doubles',
    entry: 'Standard sets',
    detection: 'Detected automatically from your tiles and sets',
    tiles: combine(repeat(pin(1), 3), repeat(pin(3), 3), repeat(pin(6), 3), repeat(pin(9), 3), repeat(pin(5), 2)),
    visualNote: 'One possible all-Circles example.',
    detail: 'Purity is unusual because it is scored through doubles rather than as a fixed 500- or 1,000-point hand.',
  },
  {
    id: 'all-pair-honours',
    name: 'All Pair Honours',
    description: 'Seven pairs made only from major tiles: suited 1s and 9s, Winds and Dragons.',
    winner: '500',
    fishing: '200',
    entry: 'Standard sets · seven pairs',
    detection: 'Detected automatically from your tiles',
    tiles: combine(repeat(sou(1), 2), repeat(pin(9), 2), repeat(man(1), 2), repeat(east, 2), repeat(south, 2), repeat(red, 2), repeat(green, 2)),
    visualNote: 'Seven major-tile pairs. This is different from Heads and Tails.',
  },
  {
    id: 'all-winds-and-dragons',
    name: 'All Winds and Dragons',
    description: 'A complete hand made only from Winds and Dragons: four Pungs/Kongs and a pair.',
    winner: '1,000',
    fishing: '400 or intrinsic if greater',
    entry: 'Standard sets',
    detection: 'Detected automatically from your tiles',
    tiles: combine(repeat(east, 3), repeat(south, 3), repeat(west, 3), repeat(north, 3), repeat(red, 2)),
  },
  {
    id: 'heads-and-tails',
    name: 'Heads and Tails',
    description: 'A normal grouped hand made only from suited 1s and 9s. No Winds or Dragons.',
    winner: '1,000',
    fishing: '400',
    entry: 'Standard sets',
    detection: 'Detected automatically from your tiles',
    tiles: combine(repeat(sou(1), 3), repeat(pin(9), 3), repeat(man(1), 3), repeat(sou(9), 3), repeat(man(9), 2)),
    visualNote: 'Four Pungs/Kongs plus a pair, all terminals.',
  },
  {
    id: 'fourfold-plenty',
    name: 'Fourfold Plenty',
    description: 'Four Kongs and a pair.',
    winner: '1,000',
    fishing: '400',
    entry: 'Standard sets',
    detection: 'Detected automatically from your sets',
    tiles: combine(repeat(pin(2), 4), repeat(sou(4), 4), repeat(red, 4), repeat(east, 4), repeat(man(7), 2)),
    visualNote: 'The extra physical tiles are the fourth tiles in each Kong.',
  },
  {
    id: 'three-great-scholars',
    name: 'Three Great Scholars',
    description: 'Pungs or Kongs of all three Dragons, plus one more Pung/Kong and a pair.',
    winner: '1,000',
    fishing: '400 or intrinsic if greater',
    entry: 'Standard sets',
    detection: 'Detected automatically from your tiles',
    tiles: combine(repeat(red, 3), repeat(green, 3), repeat(white, 3), repeat(east, 3), repeat(pin(5), 2)),
  },
  {
    id: 'four-blessings',
    name: 'Four Blessings Hovering over the Door',
    description: 'Pungs or Kongs of all four Winds, plus a pair.',
    winner: '1,000',
    fishing: '400 or intrinsic if greater',
    entry: 'Standard sets',
    detection: 'Detected automatically from your tiles',
    tiles: combine(repeat(east, 3), repeat(south, 3), repeat(west, 3), repeat(north, 3), repeat(green, 2)),
  },
  {
    id: 'buried-treasure',
    name: 'Buried Treasure',
    description: 'A concealed hand of Pungs and a pair in one suit, with honours allowed. No Chow and no Kong.',
    winner: '1,000',
    fishing: '400',
    entry: 'Standard sets',
    detection: 'Automatic; the winning tile can matter',
    tiles: combine(repeat(pin(2), 3), repeat(pin(4), 3), repeat(pin(6), 3), repeat(pin(8), 3), repeat(pin(5), 2)),
    visualNote: 'The tile row shows the pattern; the sets must also satisfy the concealed-hand rule.',
    detail: 'If the final tile was claimed, the scorer may ask which tile completed Mah Jong so it can check the narrow permitted final-set exception.',
  },
  {
    id: 'imperial-jade',
    name: 'Imperial Jade',
    description: 'Only traditional green tiles: Green Dragon and Bamboo 2, 3, 4, 6 and 8.',
    winner: '1,000',
    fishing: '400',
    entry: 'Standard sets',
    detection: 'Detected automatically from your tiles',
    tiles: combine(repeat(green, 3), repeat(sou(2), 3), repeat(sou(3), 3), repeat(sou(6), 3), repeat(sou(8), 2)),
    visualNote: 'One possible grouped green-tile hand.',
  },
];

const irregularSpecials: SpecialCardData[] = [
  {
    id: 'knitting',
    name: 'Knitting',
    description: 'Seven pairs. Each pair uses the same number in two different suits.',
    winner: '500',
    fishing: '200',
    entry: 'My hand doesn’t fit normal sets',
    detection: 'Detected automatically from your tiles',
    tiles: [sou(1), pin(1), man(2), sou(2), pin(3), man(3), sou(4), pin(4), man(5), sou(5), pin(6), man(6), sou(7), pin(7)],
    visualNote: 'Read the tiles as seven cross-suit same-number pairs.',
  },
  {
    id: 'triple-knitting',
    name: 'Triple Knitting',
    description: 'Four same-number groups containing one tile from each suit, plus one cross-suit same-number pair.',
    winner: '500',
    fishing: '200',
    entry: 'My hand doesn’t fit normal sets',
    detection: 'Detected automatically from your tiles',
    tiles: [sou(2), man(2), pin(2), sou(4), man(4), pin(4), sou(6), man(6), pin(6), sou(8), man(8), pin(8), sou(5), pin(5)],
    visualNote: 'Four three-suit number groups, then one same-number pair.',
  },
  {
    id: 'thirteen-unique-wonders',
    name: 'Thirteen Unique Wonders',
    description: 'One of each of the 13 major/honour tile types, plus one duplicate to make the pair.',
    winner: '1,000',
    fishing: '400',
    entry: 'My hand doesn’t fit normal sets',
    detection: 'Detected automatically from your tiles',
    tiles: [sou(1), sou(9), pin(1), pin(9), man(1), man(9), east, south, west, north, red, green, white, east],
    visualNote: 'Six suited terminals + four Winds + three Dragons + one duplicate.',
  },
  {
    id: 'gates-of-heaven',
    name: 'Gates of Heaven',
    description: 'One suit: three 1s, three 9s, one each of 2–8, with one of 2–8 duplicated.',
    winner: '1,000',
    fishing: '400',
    entry: 'My hand doesn’t fit normal sets',
    detection: 'Automatic; the winning tile can matter',
    tiles: [pin(1), pin(1), pin(1), pin(2), pin(3), pin(4), pin(5), pin(5), pin(6), pin(7), pin(8), pin(9), pin(9), pin(9)],
    visualNote: 'Here the duplicated middle tile is 5 Circles.',
    detail: 'If the hand was completed from a discard, the scorer uses the winning-tile selection to check the permitted terminal-Pung exception.',
  },
  {
    id: 'wriggling-snake',
    name: 'Wriggling Snake',
    description: 'A pair of 1s, the sequence 2 through 9 in the same suit, plus one of each Wind.',
    winner: '1,000',
    fishing: '400',
    entry: 'My hand doesn’t fit normal sets',
    detection: 'Detected automatically from your tiles',
    tiles: [pin(1), pin(1), pin(2), pin(3), pin(4), pin(5), pin(6), pin(7), pin(8), pin(9), east, south, west, north],
  },
];

function EventTimeline({ steps, tile }: { steps: string[]; tile?: TileDefinition }) {
  return (
    <div className="mt-4 rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-semibold text-[#284d45]" role="img" aria-label={steps.join(' then ')}>
        {steps.map((step, index) => (
          <div key={`${step}-${index}`} className="contents">
            <span className="rounded-md bg-[#efe8da] px-3 py-2">{step}</span>
            {index < steps.length - 1 && <ChevronRight size={14} className="text-[#ae6249]" aria-hidden="true" />}
          </div>
        ))}
      </div>
      {tile && (
        <div className="mt-4 max-w-max">
          <TileStrip tiles={[tile]} ariaLabel={tile.label} compact={false} />
        </div>
      )}
    </div>
  );
}

function SpecialCard({ hand }: { hand: SpecialCardData }) {
  return (
    <article id={SPECIAL_HAND_ANCHORS[hand.id]} className="scroll-mt-6 rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 shadow-[var(--shadow-sm)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-[25px] leading-tight text-[#284d45]">{hand.name}</h3>
          <p className="mt-2 max-w-[760px] text-[13px] leading-6 text-[#596b65]">{hand.description}</p>
        </div>
        <div className="flex shrink-0 gap-2 text-center">
          <div className="rounded-lg bg-[#284d45] px-3 py-2 text-[#f8f4e9]">
            <div className="font-mono text-[8px] uppercase tracking-[.14em] text-[#c8d8d1]">Winner</div>
            <div className="mt-0.5 font-serif text-[18px]">{hand.winner}</div>
          </div>
          {hand.fishing && (
            <div className="rounded-lg border border-[#cfbfa4] bg-[#f5eadb] px-3 py-2 text-[#284d45]">
              <div className="font-mono text-[8px] uppercase tracking-[.14em] text-[#8c776d]">Fishing</div>
              <div className="mt-0.5 font-serif text-[16px]">{hand.fishing}</div>
            </div>
          )}
        </div>
      </div>

      {hand.tiles && (
        <div className="mt-5">
          <TileStrip tiles={hand.tiles} ariaLabel={`${hand.name} example: ${hand.tiles.map((tile) => tile.label).join(', ')}`} />
          {hand.visualNote && <p className="mt-1 text-[10px] leading-4 text-[#8c8a7f]">{hand.visualNote}</p>}
        </div>
      )}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-[#e0d7c6] bg-[#fdfbf5] p-3">
          <div className="font-mono text-[8px] uppercase tracking-[.15em] text-[#ae6249]">How to enter it</div>
          <div className="mt-1 text-[11px] font-semibold text-[#284d45]">{hand.entry}</div>
        </div>
        <div className="rounded-lg border border-[#b8cdbf] bg-[#edf3ed] p-3">
          <div className="font-mono text-[8px] uppercase tracking-[.15em] text-[#477562]">What the scorer does</div>
          <div className="mt-1 text-[11px] font-semibold text-[#284d45]">{hand.detection}</div>
        </div>
      </div>

      {hand.detail && (
        <details className="mt-4 rounded-lg border border-[#dfd5c2] bg-[#fdfbf5] p-3">
          <summary className="cursor-pointer text-[11px] font-semibold text-[#284d45]">Why might the scorer need more information?</summary>
          <p className="mt-2 text-[11px] leading-5 text-[#66746e]">{hand.detail}</p>
        </details>
      )}
    </article>
  );
}

function CatalogueSection({ id, eyebrow, title, intro, hands }: { id: string; eyebrow: string; title: string; intro: string; hands: SpecialCardData[] }) {
  return (
    <section id={id} className="scroll-mt-6 py-10 sm:py-12">
      <div className="mb-6">
        <div className="font-mono text-[9px] uppercase tracking-[.2em] text-[#ae6249]">{eyebrow}</div>
        <h2 className="mt-2 font-serif text-[32px] leading-tight text-[#284d45] sm:text-[38px]">{title}</h2>
        <p className="mt-3 max-w-[760px] text-[13px] leading-6 text-[#66746e]">{intro}</p>
      </div>
      <div className="space-y-4">{hands.map((hand) => <SpecialCard key={hand.name} hand={hand} />)}</div>
    </section>
  );
}

export function SpecialHandsCatalogue() {
  useEffect(() => {
    const anchor = window.location.hash.slice(1);
    if (!anchor) return;
    requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: 'start' }));
  }, []);

  return (
    <div className="mahjong-shell">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8 lg:py-12">
        <ReturnToGame />
        <section className="rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] px-5 py-9 shadow-[var(--shadow-sm)] sm:px-8 sm:py-11 lg:px-10">
          <div className="mb-4 flex items-center gap-3"><div className="fine-rule w-10" /><span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Visual catalogue</span></div>
          <h1 className="max-w-[800px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">Special hands, made visual.</h1>
          <p className="mt-5 max-w-[760px] text-[15px] leading-7 text-[#596b65]">You do not need to memorise these before you play. This page is here for the moment when the scorer recognises something unusual and you want to see what it means.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <a href="#normal-sets" className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-4 transition hover:bg-[#f5eadb]"><div className="font-serif text-[19px] text-[#284d45]">Built from normal sets</div><p className="mt-1 text-[11px] leading-5 text-[#6d746f]">Pungs, Kongs, pairs and familiar grouped hands.</p></a>
            <a href="#irregular" className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-4 transition hover:bg-[#f5eadb]"><div className="font-serif text-[19px] text-[#284d45]">Irregular patterns</div><p className="mt-1 text-[11px] leading-5 text-[#6d746f]">Hands that do not fit four ordinary sets and a pair.</p></a>
            <a href="#events" className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-4 transition hover:bg-[#f5eadb]"><div className="font-serif text-[19px] text-[#284d45]">How the hand was won</div><p className="mt-1 text-[11px] leading-5 text-[#6d746f]">Specials defined by the winning event rather than tile pattern alone.</p></a>
          </div>
          <div className="mt-6 flex gap-3 rounded-xl bg-[#284d45] p-5 text-[#f8f4e9]"><CircleHelp size={18} className="mt-1 shrink-0 text-[#d7a287]" /><p className="text-[12px] leading-6 text-[#d8e3df]">Each tile row is one clear example, not the only possible valid arrangement. The scorer still works from the hand you actually enter.</p></div>
          <p className="mt-5 text-[11px] leading-5 text-[#8c8a7f]">Independent learner catalogue · not an official BMJA publication.</p>
        </section>

        <CatalogueSection id="normal-sets" eyebrow="01" title="Specials built from normal sets" intro="These usually use the Standard sets builder. The pictures show the pattern that matters; exposed/concealed status and the exact winning tile can still matter for a small number of hands." hands={normalSetSpecials} />
        <CatalogueSection id="irregular" eyebrow="02" title="Irregular tile-pattern specials" intro="These are the hands where the ordinary four-sets-and-a-pair shape is the wrong mental model. Enter the individual tiles and let the scorer recognise the pattern." hands={irregularSpecials} />

        <section id="events" className="scroll-mt-6 py-10 sm:py-12">
          <div className="mb-6">
            <div className="font-mono text-[9px] uppercase tracking-[.2em] text-[#ae6249]">03</div>
            <h2 className="mt-2 font-serif text-[32px] leading-tight text-[#284d45] sm:text-[38px]">Specials based on how the hand was won</h2>
            <p className="mt-3 max-w-[760px] text-[13px] leading-6 text-[#66746e]">A final tile row cannot explain these. Small event timelines are more useful, and the scorer only asks an extra question when the event cannot be inferred safely.</p>
          </div>

          <div className="space-y-4">
            <SpecialCard hand={{ id: 'heavens-blessing', name: 'Heaven’s Blessing', description: 'East has Mah Jong immediately from the original dealt hand.', winner: '1,000', entry: 'Normal winner flow', detection: 'Detected automatically from “Mah Jong in original deal”' }} />
            <div className="-mt-2 mb-4"><EventTimeline steps={["East’s original deal", 'Already complete', 'Mah Jong']} /></div>

            <SpecialCard hand={{ id: 'earths-blessing', name: 'Earth’s Blessing', description: 'A non-East player goes Mah Jong using East’s very first discard.', winner: '1,000', entry: 'Normal winner flow · from discard', detection: 'The scorer may ask one short factual question', detail: 'Only when the circumstances make it possible, the scorer asks: “Was this East’s very first discard?” If you are not sure, it scores conservatively.' }} />
            <div className="-mt-2 mb-4"><EventTimeline steps={["East’s first discard", 'Another player claims it', 'Mah Jong']} /></div>

            <SpecialCard hand={{ id: 'gathering-the-plum-blossom-from-the-roof', name: 'Gathering the Plum Blossom from the Roof', description: 'Mah Jong is completed by drawing 5 Circles as a replacement tile.', winner: '1,000', entry: 'Normal winner flow · replacement tile', detection: 'Detected automatically from how you won + winning tile' }} />
            <div className="-mt-2 mb-4"><EventTimeline steps={['Replacement draw', '5 Circles', 'Mah Jong']} tile={pin(5)} /></div>

            <SpecialCard hand={{ id: 'plucking-the-moon-from-the-bottom-of-the-sea', name: 'Plucking the Moon from the Bottom of the Sea', description: 'Mah Jong is completed with 1 Circles drawn as the final tile from the live wall.', winner: '1,000', entry: 'Normal winner flow · last wall tile', detection: 'Detected automatically from how you won + winning tile' }} />
            <div className="-mt-2 mb-4"><EventTimeline steps={['Last tile in live wall', '1 Circles', 'Mah Jong']} tile={pin(1)} /></div>

            <SpecialCard hand={{ id: 'twofold-fortune', name: 'Twofold Fortune', description: 'A Kong is made, its replacement tile completes another Kong, and the next replacement tile completes Mah Jong.', winner: '1,000', entry: 'Normal winner flow · replacement tile', detection: 'The scorer may ask one short factual question', detail: 'The final hand can show that two Kongs exist, but it cannot reconstruct the exact replacement sequence. “I’m not sure” therefore scores conservatively.' }} />
            <div className="-mt-2"><EventTimeline steps={['Kong', 'Replacement tile', 'Second Kong', 'Replacement tile', 'Mah Jong']} /></div>
          </div>
        </section>

        <section className="pb-12 pt-4">
          <div className="rounded-xl bg-[#284d45] p-6 text-[#f8f4e9] sm:p-7">
            <div className="font-mono text-[9px] uppercase tracking-[.2em] text-[#d7a287]">The important bit</div>
            <h2 className="mt-2 font-serif text-[28px]">Recognition, not memorisation.</h2>
            <p className="mt-3 max-w-[700px] text-[12px] leading-6 text-[#c8d8d1]">Use this catalogue to understand a pattern after you encounter it. During play, enter the tiles and what happened; the scorer should do the recognition work for you.</p>
            <a href="/hand" className="mt-4 inline-flex min-h-10 items-center rounded-md border border-[#6e8d84] px-3 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#31594f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3d8c7]">Try a special hand in the hand scorer</a>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 border-t border-[#d8ceb8] px-5 py-5 lg:px-8">
        <div className="space-y-1 text-[10px] leading-4 text-[#8c8a7f]">
          <p>Independent British Mahjong learner catalogue · not an official BMJA publication.</p>
          <p>Mahjong tile artwork: xhokir/riichi-mahjong-tiles, based on FluffyStuff/riichi-mahjong-tiles, used under CC BY 4.0.</p>
        </div>
        <div className="flex gap-4"><a href="/guide" className="text-[11px] font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4">Beginner guide</a><a href="/" className="text-[11px] font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4">Return to scorer</a></div>
      </footer>
    </div>
  );
}
