import {
  tileAssetUrl,
  type TileAssetKey,
  type TileDefinition,
} from '../tiles/MahjongTileArtwork';

export type { TileAssetKey, TileDefinition } from '../tiles/MahjongTileArtwork';

const numberedGroup = (prefix: 'Man' | 'Pin' | 'Sou', family: string): TileDefinition[] =>
  Array.from({ length: 9 }, (_, index) => ({
    asset: `${prefix}${index + 1}` as TileAssetKey,
    label: `${index + 1} ${family}`,
  }));

const characters = numberedGroup('Man', 'Characters');
const circles = numberedGroup('Pin', 'Circles');
const bamboos = numberedGroup('Sou', 'Bamboos');
const winds: TileDefinition[] = [
  { asset: 'Ton', label: 'East Wind' },
  { asset: 'Nan', label: 'South Wind' },
  { asset: 'Shaa', label: 'West Wind' },
  { asset: 'Pei', label: 'North Wind' },
];
const dragons: TileDefinition[] = [
  { asset: 'Chun', label: 'Red Dragon' },
  { asset: 'Hatsu', label: 'Green Dragon' },
  { asset: 'Haku', label: 'White Dragon' },
];
const flowers: TileDefinition[] = Array.from({ length: 4 }, (_, index) => ({
  asset: `Flower${index + 1}` as TileAssetKey,
  label: `Flower ${index + 1}`,
}));
const seasons: TileDefinition[] = Array.from({ length: 4 }, (_, index) => ({
  asset: `Season${index + 1}` as TileAssetKey,
  label: `Season ${index + 1}`,
}));

function TileArt({ tile, compact = false }: { tile: TileDefinition; compact?: boolean }) {
  return (
    <figure className="shrink-0 text-center">
      <img
        src={tileAssetUrl(tile.asset)}
        alt={tile.label}
        loading="lazy"
        className={`${compact ? 'h-[68px] w-[51px]' : 'h-[84px] w-[63px]'} rounded-[5px] bg-[#fffdf7] object-contain shadow-[0_2px_6px_rgba(48,57,49,.12)]`}
      />
      <figcaption className={`${compact ? 'max-w-[51px] text-[8px]' : 'max-w-[63px] text-[9px]'} mt-1.5 leading-3 text-[#7a7769]`}>
        {tile.label}
      </figcaption>
    </figure>
  );
}

export function TileStrip({
  tiles,
  ariaLabel,
  compact = true,
}: {
  tiles: TileDefinition[];
  ariaLabel?: string;
  compact?: boolean;
}) {
  const description = ariaLabel ?? tiles.map((tile) => tile.label).join(', ');
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-1.5" role="img" aria-label={description}>
        {tiles.map((tile, index) => (
          <img
            key={`${tile.asset}-${index}`}
            src={tileAssetUrl(tile.asset)}
            alt=""
            loading="lazy"
            className={`${compact ? 'h-[68px] w-[51px]' : 'h-[84px] w-[63px]'} rounded-[5px] bg-[#fffdf7] object-contain shadow-[0_2px_6px_rgba(48,57,49,.12)]`}
          />
        ))}
      </div>
    </div>
  );
}

function TileGroup({ title, tiles }: { title: string; tiles: TileDefinition[] }) {
  return (
    <section className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-4">
      <h3 className="mb-3 font-mono text-[9px] font-semibold uppercase tracking-[.15em] text-[#8c8a7f]">{title}</h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-2.5">
          {tiles.map((tile) => <TileArt key={tile.asset} tile={tile} />)}
        </div>
      </div>
    </section>
  );
}

function Example({ title, note, tiles }: { title: string; note: string; tiles: TileDefinition[] }) {
  return (
    <div className="rounded-xl border border-[#dfd5c2] bg-[#fdfbf5] p-4">
      <div className="font-serif text-[19px] text-[#284d45]">{title}</div>
      <p className="mt-1 text-[11px] leading-5 text-[#6d746f]">{note}</p>
      <div className="mt-3">
        <TileStrip tiles={tiles} ariaLabel={`${title}: ${tiles.map((tile) => tile.label).join(', ')}`} />
      </div>
    </div>
  );
}

export function SetExamples() {
  const nineCircles: TileDefinition = { asset: 'Pin9', label: '9 Circles' };
  const redDragon: TileDefinition = { asset: 'Chun', label: 'Red Dragon' };
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Example title="Pung" note="Three identical tiles" tiles={[nineCircles, nineCircles, nineCircles]} />
      <Example title="Kong" note="Four identical tiles" tiles={[redDragon, redDragon, redDragon, redDragon]} />
      <Example title="Chow" note="Three consecutive tiles in one suit" tiles={[bamboos[2], bamboos[3], bamboos[4]]} />
    </div>
  );
}

export function TileGallery() {
  return (
    <div className="my-6 space-y-3" aria-label="British Mahjong tile families">
      <TileGroup title="Characters · 1–9" tiles={characters} />
      <TileGroup title="Circles · 1–9" tiles={circles} />
      <TileGroup title="Bamboos · 1–9" tiles={bamboos} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TileGroup title="Winds" tiles={winds} />
        <TileGroup title="Dragons" tiles={dragons} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TileGroup title="Flowers · bonus tiles" tiles={flowers} />
        <TileGroup title="Seasons · bonus tiles" tiles={seasons} />
      </div>
    </div>
  );
}
