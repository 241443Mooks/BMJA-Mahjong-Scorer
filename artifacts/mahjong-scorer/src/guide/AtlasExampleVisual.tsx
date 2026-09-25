import { dragon, expandedTiles, suited, wind, detectSpecialHands } from '../scoring';
import type { MahjongHand, PlayingTile } from '../scoring';
import { WESTERN_TM_PROFILE_REF, westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { specialHandExampleById } from './special-hand-examples';
import type { AtlasExample } from './special-hands-atlas';
import { tileAssetUrl, type TileAssetKey, type TileDefinition } from '../tiles/MahjongTileArtwork';

type ExampleGroup = { label: string; tiles: TileDefinition[]; style: 'meld' | 'pair' | 'loose' };
type AtlasVisual = { groups: ExampleGroup[]; loose: TileDefinition[]; note?: string };

const tileFromId = (id: string): TileDefinition => {
  const suit = /^(\d)-(bamboo|circles|characters)$/.exec(id);
  if (suit) {
    const prefix = suit[2] === 'bamboo' ? 'Sou' : suit[2] === 'circles' ? 'Pin' : 'Man';
    const family = suit[2] === 'bamboo' ? 'Bamboos' : suit[2] === 'circles' ? 'Circles' : 'Characters';
    return { asset: `${prefix}${suit[1]}` as TileAssetKey, label: `${suit[1]} ${family}` };
  }
  const honors: Record<string, TileDefinition> = {
    'east-wind': { asset: 'Ton', label: 'East Wind' }, 'south-wind': { asset: 'Nan', label: 'South Wind' },
    'west-wind': { asset: 'Shaa', label: 'West Wind' }, 'north-wind': { asset: 'Pei', label: 'North Wind' },
    'red-dragon': { asset: 'Chun', label: 'Red Dragon' }, 'green-dragon': { asset: 'Hatsu', label: 'Green Dragon' },
    'white-dragon': { asset: 'Haku', label: 'White Dragon' },
  };
  const tile = honors[id];
  if (!tile) throw new Error(`Unknown Atlas tile id: ${id}`);
  return tile;
};

const tileFromPlayingTile = (tile: PlayingTile): TileDefinition => {
  if (tile.family === 'suit') return tileFromId(`${tile.rank}-${tile.suit}`);
  if (tile.family === 'wind') return tileFromId(`${tile.wind}-wind`);
  return tileFromId(`${tile.dragon}-dragon`);
};

const candidateSets = (groups: Array<{ kind: 'pung' | 'kong' | 'pair'; tile: PlayingTile }>) => groups.map((group, index) => ({ id: `atlas-${index}`, kind: group.kind, tile: group.tile, visibility: 'concealed' as const }));

export function materializeAtlasGenerator(patternId: string): MahjongHand | undefined {
  const context = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000 };
  const accepts = (hand: MahjongHand) => detectSpecialHands(hand, context, westernTmSpecialHandBindings).some(({ id }) => id === patternId);
  if (patternId === 'golden-gates') {
    for (const suit of ['bamboo', 'circles', 'characters'] as const) for (const terminal of [1, 9] as const) for (const color of ['red', 'green', 'white'] as const) {
      const hand: MahjongHand = { sets: candidateSets([
        ...([2, 4, 6, 8] as const).map((rank) => ({ kind: 'pair' as const, tile: suited(suit, rank) })),
        { kind: 'pung', tile: suited(suit, terminal) }, { kind: 'pung', tile: dragon(color) },
      ]), bonusTiles: [], isWinner: true, winningMethod: 'wall' };
      if (accepts(hand)) return hand;
    }
  }
  if (patternId === 'two-to-eight-run-pair-with-terminal-meld-and-corresponding-dragon-meld') {
    for (const suit of ['bamboo', 'circles', 'characters'] as const) for (const terminal of [1, 9] as const) for (const color of ['red', 'green', 'white'] as const) {
      const duplicateRank = 5;
      const hand: MahjongHand = {
        sets: candidateSets([{ kind: 'pung', tile: suited(suit, terminal) }, { kind: 'pung', tile: dragon(color) }]),
        looseTiles: [...([2, 3, 4, 5, 6, 7, 8] as const).map((rank) => suited(suit, rank)), suited(suit, duplicateRank)],
        bonusTiles: [], isWinner: true, winningMethod: 'wall',
      };
      if (accepts(hand)) return hand;
    }
  }
  if (patternId === 'two-odd-suits-and-one-even-suit') {
    for (const evenSuit of ['bamboo', 'circles', 'characters'] as const) {
      const oddSuits = (['bamboo', 'circles', 'characters'] as const).filter((suit) => suit !== evenSuit);
      const hand: MahjongHand = {
        sets: [],
        looseTiles: [...oddSuits.flatMap((suit) => ([1, 3, 5, 7, 9] as const).map((rank) => suited(suit, rank))), ...([2, 4, 6, 8] as const).map((rank) => suited(evenSuit, rank))],
        bonusTiles: [], isWinner: true, winningMethod: 'wall',
      };
      if (accepts(hand)) return hand;
    }
  }
  if (patternId === 'parallel-suit-rank-melds-with-honours') {
    for (const rank of [2, 3, 4, 5, 6, 7, 8] as const) for (const honor of [wind('east'), wind('south'), wind('west'), wind('north'), dragon('red'), dragon('green'), dragon('white')]) {
      const hand: MahjongHand = {
        sets: candidateSets([
          { kind: 'pung', tile: suited('bamboo', rank) }, { kind: 'pung', tile: suited('circles', rank) },
          { kind: 'pung', tile: suited('characters', rank) }, { kind: 'pung', tile: honor },
          { kind: 'pair', tile: wind('east') },
        ]), bonusTiles: [], isWinner: true, winningMethod: 'wall',
      };
      if (accepts(hand)) return hand;
    }
  }
  return undefined;
}

const kindLabel = (kind: string) => kind === 'kong' ? 'Kong · four tiles' : kind === 'pung' ? 'Pung · three tiles' : kind === 'pair' ? 'Pair · two tiles' : kind === 'chow' ? 'Chow · three in a row' : kind;
const publicClubCopy = (value: string) => value.replaceAll('Outside the Box', 'Club - Bramhall 2026').replaceAll('outside-the-box', 'Club - Bramhall 2026');

function visualFor(example: AtlasExample): AtlasVisual | undefined {
  if (example.kind === 'event-sequence' || example.kind === 'tile-hand-generator') return undefined;
  if (example.source.type === 'existing-example' && example.source.id) {
    const runtimeExample = specialHandExampleById(example.source.id);
    if (!runtimeExample) return undefined;
    const groups = runtimeExample.hand.sets.map((set) => ({
      label: `${kindLabel(set.kind)}${set.visibility === 'exposed' ? ' · exposed' : ''}`,
      tiles: expandedTiles(set).map(tileFromPlayingTile),
      style: set.kind === 'pair' ? 'pair' as const : 'meld' as const,
    }));
    return { groups, loose: [...(runtimeExample.hand.looseTiles ?? []), ...(runtimeExample.hand.remainingTiles ?? [])].map(tileFromPlayingTile) };
  }
  const source = example.source;
  const groups: ExampleGroup[] = [];
  for (const group of source.groups ?? []) {
    const tiles = group.tiles ? group.tiles.map(tileFromId) : group.tile ? [tileFromId(group.tile), tileFromId(group.tile), tileFromId(group.tile)] : [];
    if (group.kind === 'kong' && group.tile) tiles.push(tileFromId(group.tile));
    groups.push({ label: kindLabel(group.kind), tiles, style: group.kind === 'pair' ? 'pair' : 'meld' });
  }
  for (const [index, pair] of (source.pairs ?? []).entries()) groups.push({ label: `Pair ${index + 1}`, tiles: [tileFromId(pair), tileFromId(pair)], style: 'pair' });
  for (const [index, segment] of (source.looseGroups ?? []).entries()) groups.push({ label: `Loose example segment ${index + 1}`, tiles: segment.map(tileFromId), style: 'loose' });
  return { groups, loose: (source.looseTiles ?? []).map(tileFromId) };
}

function TileRow({ tiles }: { tiles: TileDefinition[] }) {
  return <div className="flex flex-wrap items-start gap-1" aria-hidden="true">{tiles.map((tile, index) => <img key={`${tile.asset}-${index}`} src={tileAssetUrl(tile.asset)} alt="" loading="lazy" className="h-[52px] w-[38px] shrink-0 rounded bg-white p-0.5 object-contain shadow-sm sm:h-[62px] sm:w-[46px]" />)}</div>;
}

export function AtlasExampleVisual({ example, title }: { example: AtlasExample; title?: string }) {
  const generatedHandExample = example.kind === 'tile-hand-generator' ? materializeAtlasGenerator(example.source.patternId ?? '') : undefined;
  const generatedVisual: AtlasVisual | undefined = generatedHandExample ? {
    groups: generatedHandExample.sets.map((set) => ({ label: kindLabel(set.kind), tiles: expandedTiles(set).map(tileFromPlayingTile), style: set.kind === 'pair' ? 'pair' : 'meld' })),
    loose: [...(generatedHandExample.looseTiles ?? []), ...(generatedHandExample.remainingTiles ?? [])].map(tileFromPlayingTile),
  } : example.kind === 'tile-hand-generator' ? undefined : visualFor(example);

  return <figure className="mt-4 rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-3 sm:p-4">
    <figcaption className="font-semibold text-[#284d45]">{publicClubCopy(title ?? 'What it looks like')}</figcaption>
    <p className="mt-1 text-sm leading-5 text-[#596b65]">{publicClubCopy(example.visibleExplanation)}</p>
    {example.kind === 'event-sequence' && <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label={publicClubCopy(example.accessibleDescription)}>{(example.steps ?? []).map((step, index) => <li key={`${step}-${index}`} className="flex min-h-12 items-center gap-2 rounded-lg bg-[#efe8da] p-3 text-sm font-semibold text-[#284d45]"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#284d45] text-xs text-white">{index + 1}</span>{publicClubCopy(step)}</li>)}</ol>}
    {generatedVisual && <div className="mt-3 flex flex-wrap items-start gap-2" aria-label={publicClubCopy(example.accessibleDescription)}>{generatedVisual.groups.map((group, index) => <div key={`${group.label}-${index}`} className={`max-w-full rounded-lg border p-2 ${group.style === 'pair' ? 'border-[#b8cdbf] bg-[#edf3ed]' : 'border-[#dfd5c2] bg-white'}`}><div className="mb-1 text-xs font-semibold text-[#596b65]">{group.label}</div><TileRow tiles={group.tiles} /></div>)}{generatedVisual.loose.length > 0 && <div className="min-w-0 flex-1 rounded-lg border border-dashed border-[#ae6249] bg-white p-2"><div className="mb-1 text-xs font-semibold text-[#596b65]">Loose tiles · no meld boundary</div><TileRow tiles={generatedVisual.loose} /></div>}</div>}
    {example.kind === 'tile-hand-generator' && !generatedVisual && <p className="mt-3 rounded-lg bg-[#efe8da] p-3 text-sm text-[#284d45]">This example is generated from the exact current pattern predicate. A concrete arrangement is not available for this profile.</p>}
    {!generatedVisual && example.kind === 'tile-hand' && <p className="mt-3 rounded-lg bg-[#efe8da] p-3 text-sm text-[#284d45]">{publicClubCopy(example.accessibleDescription)}</p>}
    {generatedVisual && <p className="mt-3 text-sm leading-5 text-[#596b65]">{publicClubCopy(example.accessibleDescription)}</p>}
    {example.referenceNote && <p className="mt-3 text-sm leading-5 text-[#66746e]">{example.referenceNote}</p>}
  </figure>;
}
