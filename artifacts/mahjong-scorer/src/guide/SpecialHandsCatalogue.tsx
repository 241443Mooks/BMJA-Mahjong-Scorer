import { ChevronRight, CircleHelp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SiteHeader } from '../components/SiteHeader';
import { ReturnToGame } from '../components/ReturnToGame';
import { SPECIAL_HAND_ANCHORS } from './special-hand-references';
import { exampleVisualTiles, specialHandExampleById, specialHandExampleHref } from './special-hand-examples';
import { BMJA_PROFILE_REF } from '../game/ruleset';
import { descriptorForRulesProfile } from '../game/rules-presentation';
import { readPreferredRulesProfile } from '../game/preferred-rules-profile';
import { CLASSICAL_ATLAS_PROFILES, SPECIAL_HANDS_ATLAS, atlasBrowseRecords, atlasScoreLabel, searchSpecialHandsAtlas, type SpecialHandsAtlasRecord } from './special-hands-atlas';

import { TileStrip, type TileAssetKey, type TileDefinition } from './MahjongTileGallery';

type SpecialCardData = {
  id: keyof typeof SPECIAL_HAND_ANCHORS;
  treatmentId?: string;
  entry: string;
  detection: string;
  tiles?: TileDefinition[];
  visualNote?: string;
  detail?: string;
  /** Event cards teach the winning circumstances with their timeline, not a generic final hand. */
  visualPolicy?: 'tile-example' | 'event-timeline';
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
    entry: 'Standard sets',
    detection: 'Detected automatically from your tiles and sets',
    tiles: combine(repeat(pin(1), 3), repeat(pin(3), 3), repeat(pin(6), 3), repeat(pin(9), 3), repeat(pin(5), 2)),
    visualNote: 'One possible all-Circles example.',
  },
  {
    id: 'all-pair-honours',
    entry: 'Standard sets · seven pairs',
    detection: 'Detected automatically from your tiles',
    tiles: combine(repeat(sou(1), 2), repeat(pin(9), 2), repeat(man(1), 2), repeat(east, 2), repeat(south, 2), repeat(red, 2), repeat(green, 2)),
    visualNote: 'Seven major-tile pairs. This is different from Heads and Tails.',
  },
  {
    id: 'all-winds-and-dragons',
    entry: 'Standard sets',
    detection: 'Detected automatically from your tiles',
    tiles: combine(repeat(east, 3), repeat(south, 3), repeat(west, 3), repeat(north, 3), repeat(red, 2)),
  },
  {
    id: 'heads-and-tails',
    entry: 'Standard sets',
    detection: 'Detected automatically from your tiles',
    tiles: combine(repeat(sou(1), 3), repeat(pin(9), 3), repeat(man(1), 3), repeat(sou(9), 3), repeat(man(9), 2)),
    visualNote: 'Four Pungs/Kongs plus a pair, all terminals.',
  },
  {
    id: 'fourfold-plenty',
    entry: 'Standard sets',
    detection: 'Detected automatically from your sets',
    tiles: combine(repeat(pin(2), 4), repeat(sou(4), 4), repeat(red, 4), repeat(east, 4), repeat(man(7), 2)),
    visualNote: 'The extra physical tiles are the fourth tiles in each Kong.',
  },
  {
    id: 'three-great-scholars',
    entry: 'Standard sets',
    detection: 'Detected automatically from your tiles',
    tiles: combine(repeat(red, 3), repeat(green, 3), repeat(white, 3), repeat(east, 3), repeat(pin(5), 2)),
  },
  {
    id: 'four-blessings',
    entry: 'Standard sets',
    detection: 'Detected automatically from your tiles',
    tiles: combine(repeat(east, 3), repeat(south, 3), repeat(west, 3), repeat(north, 3), repeat(green, 2)),
  },
  {
    id: 'buried-treasure',
    entry: 'Standard sets',
    detection: 'Automatic; the winning tile can matter',
    tiles: combine(repeat(pin(2), 3), repeat(pin(4), 3), repeat(pin(6), 3), repeat(pin(8), 3), repeat(pin(5), 2)),
    visualNote: 'The tile row shows the pattern; the sets must also satisfy the concealed-hand rule.',
    detail: 'If the final tile was claimed, the scorer may ask which tile completed Mah Jong so it can check the narrow permitted final-set exception.',
  },
  {
    id: 'imperial-jade',
    entry: 'Standard sets',
    detection: 'Detected automatically from your tiles',
    tiles: combine(repeat(green, 3), repeat(sou(2), 3), repeat(sou(3), 3), repeat(sou(6), 3), repeat(sou(8), 2)),
    visualNote: 'One possible grouped green-tile hand.',
  },
];

const irregularSpecials: SpecialCardData[] = [
  {
    id: 'knitting',
    entry: 'My hand doesn’t fit normal sets',
    detection: 'Detected automatically from your tiles',
    tiles: [sou(1), pin(1), man(2), sou(2), pin(3), man(3), sou(4), pin(4), man(5), sou(5), pin(6), man(6), sou(7), pin(7)],
    visualNote: 'Read the tiles as seven cross-suit same-number pairs.',
  },
  {
    id: 'triple-knitting',
    entry: 'My hand doesn’t fit normal sets',
    detection: 'Detected automatically from your tiles',
    tiles: [sou(2), man(2), pin(2), sou(4), man(4), pin(4), sou(6), man(6), pin(6), sou(8), man(8), pin(8), sou(5), pin(5)],
    visualNote: 'Four three-suit number groups, then one same-number pair.',
  },
  {
    id: 'thirteen-unique-wonders',
    entry: 'My hand doesn’t fit normal sets',
    detection: 'Detected automatically from your tiles',
    tiles: [sou(1), sou(9), pin(1), pin(9), man(1), man(9), east, south, west, north, red, green, white, east],
    visualNote: 'Six suited terminals + four Winds + three Dragons + one duplicate.',
  },
  {
    id: 'gates-of-heaven',
    entry: 'My hand doesn’t fit normal sets',
    detection: 'Automatic; the winning tile can matter',
    tiles: [pin(1), pin(1), pin(1), pin(2), pin(3), pin(4), pin(5), pin(5), pin(6), pin(7), pin(8), pin(9), pin(9), pin(9)],
    visualNote: 'Here the duplicated middle tile is 5 Circles.',
    detail: 'If the hand was completed from a discard, the scorer uses the winning-tile selection to check the permitted terminal-Pung exception.',
  },
  {
    id: 'wriggling-snake',
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

const legacyIdForPattern = (patternId: string): keyof typeof SPECIAL_HAND_ANCHORS | undefined => {
  if (patternId === 'gathering-plum-blossom') return 'gathering-the-plum-blossom-from-the-roof';
  if (patternId === 'plucking-moon') return 'plucking-the-moon-from-the-bottom-of-the-sea';
  return patternId in SPECIAL_HAND_ANCHORS ? patternId as keyof typeof SPECIAL_HAND_ANCHORS : undefined;
};

const bmjaEditorial = new Map<string, SpecialCardData>([
  ...normalSetSpecials.map((hand) => [hand.id, hand] as const),
  ...irregularSpecials.map((hand) => [hand.id, hand] as const),
  ['heavens-blessing', { id: 'heavens-blessing', entry: 'Normal winner flow', detection: 'Detected automatically from “Mah Jong in original deal”', visualPolicy: 'event-timeline' }],
  ['earths-blessing', { id: 'earths-blessing', entry: 'Normal winner flow · from discard', detection: 'The scorer may ask one short factual question', detail: 'Only when the circumstances make it possible, the scorer asks: “Was this East’s very first discard?” If you are not sure, it scores conservatively.', visualPolicy: 'event-timeline' }],
  ['gathering-plum-blossom', { id: 'gathering-the-plum-blossom-from-the-roof', treatmentId: 'gathering-plum-blossom', entry: 'Normal winner flow · replacement tile', detection: 'Detected automatically from how you won + winning tile', visualPolicy: 'event-timeline' }],
  ['plucking-moon', { id: 'plucking-the-moon-from-the-bottom-of-the-sea', treatmentId: 'plucking-moon', entry: 'Normal winner flow · last wall tile', detection: 'Detected automatically from how you won + winning tile', visualPolicy: 'event-timeline' }],
  ['twofold-fortune', { id: 'twofold-fortune', entry: 'Normal winner flow · replacement tile', detection: 'The scorer may ask one short factual question', detail: 'The final hand can show that two Kongs exist, but it cannot reconstruct the exact replacement sequence. “I’m not sure” therefore scores conservatively.', visualPolicy: 'event-timeline' }],
]);

function EditorialDetails({ hand, name }: { hand: SpecialCardData; name: string }) {
  const example = specialHandExampleById(hand.id);
  const visualTiles = hand.visualPolicy === 'event-timeline'
    ? undefined
    : example ? exampleVisualTiles(example) : hand.tiles;
  const timelines: Record<string, { steps: string[]; tile?: TileDefinition }> = {
    'heavens-blessing': { steps: ["East’s original deal", 'Already complete', 'Mah Jong'] },
    'earths-blessing': { steps: ["East’s first discard", 'Another player claims it', 'Mah Jong'] },
    'gathering-plum-blossom': { steps: ['Replacement draw', '5 Circles', 'Mah Jong'], tile: pin(5) },
    'plucking-moon': { steps: ['Last tile in live wall', '1 Circles', 'Mah Jong'], tile: pin(1) },
    'twofold-fortune': { steps: ['Kong', 'Replacement tile', 'Second Kong', 'Replacement tile', 'Mah Jong'] },
  };
  return <details className="mt-3 rounded-lg border border-[#dfd5c2] bg-[#fdfbf5] p-3">
    <summary className="cursor-pointer text-[12px] font-semibold text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">British examples and teaching</summary>
      {visualTiles && (
        <div className="mt-5">
          <TileStrip tiles={visualTiles} ariaLabel={`${name} example: ${visualTiles.map((tile) => tile.label).join(', ')}`} />
          {hand.visualNote && <p className="mt-1 text-[10px] leading-4 text-[#8c8a7f]">{hand.visualNote}</p>}
        </div>
      )}
      {timelines[hand.treatmentId ?? hand.id] && <div className="mt-4"><EventTimeline {...timelines[hand.treatmentId ?? hand.id]} /></div>}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
      {example && <a href={specialHandExampleHref(example.id)} className="mt-4 inline-flex min-h-10 items-center rounded-md border border-[#b8cdbf] bg-[#edf3ed] px-3 text-[11px] font-semibold text-[#284d45] transition hover:border-[#477562] hover:bg-[#dceade] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Try this hand in the scorer <ChevronRight className="ml-1" size={14} aria-hidden="true" /></a>}
  </details>;
}

function AtlasRecord({ record }: { record: SpecialHandsAtlasRecord }) {
  const hand = record.identity.profile.id === BMJA_PROFILE_REF.id ? bmjaEditorial.get(record.identity.patternId) : undefined;
  const anchorId = record.identity.profile.id === BMJA_PROFILE_REF.id ? legacyIdForPattern(record.identity.patternId) : undefined;
  return <article id={anchorId ? SPECIAL_HAND_ANCHORS[anchorId] : undefined} className="scroll-mt-24 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <h2 className="font-serif text-[21px] leading-tight text-[#284d45]">{record.name}</h2>
      <span className="rounded-md bg-[#edf3ed] px-2 py-1 text-[11px] font-semibold text-[#284d45]">{record.profileTitle} · {record.identity.profile.version}</span>
    </div>
    <p className="mt-2 text-[13px] leading-6 text-[#596b65]">{record.description}</p>
    <p className="mt-3 text-[12px] font-semibold text-[#284d45]">Scoring: {atlasScoreLabel(record)}</p>
    {hand && <EditorialDetails hand={hand} name={record.name} />}
  </article>;
}

export function SpecialHandsCatalogue() {
  const [preferred] = useState(() => readPreferredRulesProfile());
  const preferredClassical = preferred && CLASSICAL_ATLAS_PROFILES.some(({ id, version }) => id === preferred.id && version === preferred.version) ? preferred : null;
  const [myRules, setMyRules] = useState(Boolean(preferredClassical));
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const filteredRecords = useMemo(() => {
    const scoped = atlasBrowseRecords(
      SPECIAL_HANDS_ATLAS,
      preferredClassical,
      myRules ? 'my-rules' : 'all-rules',
      profileFilter === 'all' ? null : CLASSICAL_ATLAS_PROFILES.find(({ id, version }) => `${id}@${version}` === profileFilter) ?? null,
    );
    return searchSpecialHandsAtlas(scoped, query);
  }, [myRules, preferredClassical, profileFilter, query]);

  useEffect(() => {
    const anchor = window.location.hash.slice(1);
    if (!anchor) return;
    setMyRules(false);
    setProfileFilter('all');
    setQuery('');
    requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: 'start' }));
  }, []);

  const mcrPreference = preferred?.id === 'mcr-wmo-2006' && preferred.version === '0.1';

  return (
    <div className="mahjong-shell">
      <SiteHeader />

      <main className="mx-auto max-w-[1180px] px-5 py-8 lg:px-8 lg:py-12">
        <ReturnToGame />
        <section className="rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] px-5 py-9 shadow-[var(--shadow-sm)] sm:px-8 sm:py-11 lg:px-10">
          <div className="mb-4 flex items-center gap-3"><div className="fine-rule w-10" /><span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Special Hands Atlas</span></div>
          <h1 className="max-w-[800px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">Find a special hand.</h1>
          <p className="mt-5 max-w-[760px] text-[15px] leading-7 text-[#596b65]">Search the current executable special-hand treatments for four Classical rules profiles. Each result names the exact profile and version that owns it.</p>
          <p className="mt-3 text-[12px] leading-6 text-[#66746e]">British examples and teaching remain available within relevant results. For worked British scoring examples, <a href="/scoring-examples" className="font-semibold underline decoration-[#ae6249] underline-offset-4">visit the scoring guide</a>.</p>
          {mcrPreference && <p role="status" className="mt-4 rounded-lg bg-[#edf3ed] p-3 text-[12px] leading-5 text-[#284d45]">Your remembered rules are MCR. This Atlas currently covers supported Classical profiles; browse All rules to see them.</p>}
          {preferred && !preferredClassical && !mcrPreference && <p role="status" className="mt-4 rounded-lg bg-[#edf3ed] p-3 text-[12px] leading-5 text-[#284d45]">Your remembered profile has no Classical special-hand catalogue. Browse All rules to explore the supported Classical profiles.</p>}
          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Atlas browse mode">
            {preferredClassical && <button type="button" aria-pressed={myRules} onClick={() => { setMyRules(true); setProfileFilter('all'); }} className="min-h-10 rounded-lg border px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">My rules</button>}
            <button type="button" aria-pressed={!myRules} onClick={() => setMyRules(false)} className="min-h-10 rounded-lg border px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">All rules</button>
          </div>
          {myRules && preferredClassical && <p className="mt-3 text-sm font-semibold text-[#284d45]">My rules: {descriptorForRulesProfile(preferredClassical).title} · profile version {preferredClassical.version}</p>}
          {!myRules && <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by exact rules profile">
            <button type="button" aria-pressed={profileFilter === 'all'} onClick={() => setProfileFilter('all')} className="min-h-10 rounded-lg border px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">All profiles</button>
            {CLASSICAL_ATLAS_PROFILES.map((profile) => {
              const descriptor = descriptorForRulesProfile(profile);
              const key = `${profile.id}@${profile.version}`;
              return <button key={key} type="button" aria-pressed={profileFilter === key} onClick={() => setProfileFilter(key)} className="min-h-10 rounded-lg border px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{descriptor.compactLabel}</button>;
            })}
          </div>}
          <label className="mt-5 block text-sm font-semibold text-[#284d45]" htmlFor="special-hands-search">Search special hands</label>
          <div className="mt-2 flex flex-wrap gap-2">
            <input id="special-hands-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, rules profile or description" className="min-h-12 min-w-0 flex-1 rounded-lg border border-[#b8cdbf] bg-white px-4 text-base text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]" />
            {(query || profileFilter !== 'all') && <button type="button" onClick={() => { setQuery(''); setProfileFilter('all'); setMyRules(false); }} className="min-h-12 rounded-lg border border-[#b8cdbf] px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Clear search and filters</button>}
          </div>
          <p className="mt-3 text-sm text-[#596b65]" aria-live="polite">{filteredRecords.length} {filteredRecords.length === 1 ? 'result' : 'results'}</p>
          <div className="mt-3 flex gap-3 rounded-xl bg-[#284d45] p-4 text-[#f8f4e9]"><CircleHelp size={18} className="mt-1 shrink-0 text-[#d7a287]" /><p className="text-[12px] leading-6 text-[#d8e3df]">A shared pattern ID does not make treatments equivalent. Read each result with its exact profile and version.</p></div>
        </section>

        <section className="py-6" aria-label="Atlas results">
          {filteredRecords.length ? <div className="space-y-3">{filteredRecords.map((record) => <AtlasRecord key={record.referenceId} record={record} />)}</div> : <div className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-6 text-center"><h2 className="font-serif text-2xl text-[#284d45]">No matching treatments</h2><p className="mt-2 text-sm text-[#596b65]">Try a different search or clear the search and profile filter.</p><button type="button" onClick={() => { setQuery(''); setProfileFilter('all'); setMyRules(false); }} className="mt-4 min-h-10 rounded-lg border border-[#b8cdbf] px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Show all treatments</button></div>}
        </section>

        <section className="mb-8 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5" id="purity">
          <div className="font-mono text-[9px] uppercase tracking-[.2em] text-[#ae6249]">British authored guidance</div>
          <h2 className="mt-2 font-serif text-2xl text-[#284d45]">Purity</h2>
          <p className="mt-2 text-sm leading-6 text-[#596b65]">One numbered suit only, using Pungs and/or Kongs plus a pair. No Winds, Dragons or Chow. In British scoring this authored guide describes three doubles; Purity is not an executable fixed special-hand treatment in this Atlas.</p>
          <div className="mt-4 max-w-max"><TileStrip tiles={normalSetSpecials[0].tiles!} ariaLabel="Purity example using Circles" /></div>
          <p className="mt-2 text-xs text-[#66746e]">One possible all-Circles example; scoring depends on the British doubles model.</p>
        </section>

        <section className="pb-12 pt-4">
          <div className="rounded-xl bg-[#284d45] p-6 text-[#f8f4e9] sm:p-7">
            <div className="font-mono text-[9px] uppercase tracking-[.2em] text-[#d7a287]">The important bit</div>
            <h2 className="mt-2 font-serif text-[28px]">Rules belong to profiles.</h2>
            <p className="mt-3 max-w-[700px] text-[12px] leading-6 text-[#c8d8d1]">These are profile-specific reference entries. Consult the rules in use at your table when you need to understand a treatment.</p>
            <a href="/hand" className="mt-4 inline-flex min-h-10 items-center rounded-md border border-[#6e8d84] px-3 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#31594f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3d8c7]">Try a special hand in the hand scorer</a>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 border-t border-[#d8ceb8] px-5 py-5 lg:px-8">
        <div className="space-y-1 text-[10px] leading-4 text-[#8c8a7f]">
          <p>Independent Mahjong learner reference · British teaching material is labelled where included.</p>
          <p>Mahjong tile artwork: xhokir/riichi-mahjong-tiles, based on FluffyStuff/riichi-mahjong-tiles, used under CC BY 4.0.</p>
        </div>
        <div className="flex gap-4"><a href="/guide" className="text-[11px] font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4">Beginner guide</a><a href="/" className="text-[11px] font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4">Return to scorer</a></div>
      </footer>
    </div>
  );
}
