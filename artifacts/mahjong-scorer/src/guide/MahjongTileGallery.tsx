export type TileAssetKey =
  | 'Man1' | 'Man2' | 'Man3' | 'Man4' | 'Man5' | 'Man6' | 'Man7' | 'Man8' | 'Man9'
  | 'Pin1' | 'Pin2' | 'Pin3' | 'Pin4' | 'Pin5' | 'Pin6' | 'Pin7' | 'Pin8' | 'Pin9'
  | 'Sou1' | 'Sou2' | 'Sou3' | 'Sou4' | 'Sou5' | 'Sou6' | 'Sou7' | 'Sou8' | 'Sou9'
  | 'Ton' | 'Nan' | 'Shaa' | 'Pei'
  | 'Chun' | 'Hatsu' | 'Haku'
  | 'Flower1' | 'Flower2' | 'Flower3' | 'Flower4'
  | 'Season1' | 'Season2' | 'Season3' | 'Season4';

export type TileDefinition = {
  asset: TileAssetKey;
  label: string;
};

const tileAssets: Record<TileAssetKey, string> = {
  Man1: new URL('../assets/riichi-mahjong-tiles/Regular/Man1.svg', import.meta.url).href,
  Man2: new URL('../assets/riichi-mahjong-tiles/Regular/Man2.svg', import.meta.url).href,
  Man3: new URL('../assets/riichi-mahjong-tiles/Regular/Man3.svg', import.meta.url).href,
  Man4: new URL('../assets/riichi-mahjong-tiles/Regular/Man4.svg', import.meta.url).href,
  Man5: new URL('../assets/riichi-mahjong-tiles/Regular/Man5.svg', import.meta.url).href,
  Man6: new URL('../assets/riichi-mahjong-tiles/Regular/Man6.svg', import.meta.url).href,
  Man7: new URL('../assets/riichi-mahjong-tiles/Regular/Man7.svg', import.meta.url).href,
  Man8: new URL('../assets/riichi-mahjong-tiles/Regular/Man8.svg', import.meta.url).href,
  Man9: new URL('../assets/riichi-mahjong-tiles/Regular/Man9.svg', import.meta.url).href,
  Pin1: new URL('../assets/riichi-mahjong-tiles/Regular/Pin1.svg', import.meta.url).href,
  Pin2: new URL('../assets/riichi-mahjong-tiles/Regular/Pin2.svg', import.meta.url).href,
  Pin3: new URL('../assets/riichi-mahjong-tiles/Regular/Pin3.svg', import.meta.url).href,
  Pin4: new URL('../assets/riichi-mahjong-tiles/Regular/Pin4.svg', import.meta.url).href,
  Pin5: new URL('../assets/riichi-mahjong-tiles/Regular/Pin5.svg', import.meta.url).href,
  Pin6: new URL('../assets/riichi-mahjong-tiles/Regular/Pin6.svg', import.meta.url).href,
  Pin7: new URL('../assets/riichi-mahjong-tiles/Regular/Pin7.svg', import.meta.url).href,
  Pin8: new URL('../assets/riichi-mahjong-tiles/Regular/Pin8.svg', import.meta.url).href,
  Pin9: new URL('../assets/riichi-mahjong-tiles/Regular/Pin9.svg', import.meta.url).href,
  Sou1: new URL('../assets/riichi-mahjong-tiles/Regular/Sou1.svg', import.meta.url).href,
  Sou2: new URL('../assets/riichi-mahjong-tiles/Regular/Sou2.svg', import.meta.url).href,
  Sou3: new URL('../assets/riichi-mahjong-tiles/Regular/Sou3.svg', import.meta.url).href,
  Sou4: new URL('../assets/riichi-mahjong-tiles/Regular/Sou4.svg', import.meta.url).href,
  Sou5: new URL('../assets/riichi-mahjong-tiles/Regular/Sou5.svg', import.meta.url).href,
  Sou6: new URL('../assets/riichi-mahjong-tiles/Regular/Sou6.svg', import.meta.url).href,
  Sou7: new URL('../assets/riichi-mahjong-tiles/Regular/Sou7.svg', import.meta.url).href,
  Sou8: new URL('../assets/riichi-mahjong-tiles/Regular/Sou8.svg', import.meta.url).href,
  Sou9: new URL('../assets/riichi-mahjong-tiles/Regular/Sou9.svg', import.meta.url).href,
  Ton: new URL('../assets/riichi-mahjong-tiles/Regular/Ton.svg', import.meta.url).href,
  Nan: new URL('../assets/riichi-mahjong-tiles/Regular/Nan.svg', import.meta.url).href,
  Shaa: new URL('../assets/riichi-mahjong-tiles/Regular/Shaa.svg', import.meta.url).href,
  Pei: new URL('../assets/riichi-mahjong-tiles/Regular/Pei.svg', import.meta.url).href,
  Chun: new URL('../assets/riichi-mahjong-tiles/Regular/Chun.svg', import.meta.url).href,
  Hatsu: new URL('../assets/riichi-mahjong-tiles/Regular/Hatsu.svg', import.meta.url).href,
  Haku: new URL('../assets/riichi-mahjong-tiles/Regular/Haku.svg', import.meta.url).href,
  Flower1: new URL('../assets/riichi-mahjong-tiles/Regular/Flower1.svg', import.meta.url).href,
  Flower2: new URL('../assets/riichi-mahjong-tiles/Regular/Flower2.svg', import.meta.url).href,
  Flower3: new URL('../assets/riichi-mahjong-tiles/Regular/Flower3.svg', import.meta.url).href,
  Flower4: new URL('../assets/riichi-mahjong-tiles/Regular/Flower4.svg', import.meta.url).href,
  Season1: new URL('../assets/riichi-mahjong-tiles/Regular/Season1.svg', import.meta.url).href,
  Season2: new URL('../assets/riichi-mahjong-tiles/Regular/Season2.svg', import.meta.url).href,
  Season3: new URL('../assets/riichi-mahjong-tiles/Regular/Season3.svg', import.meta.url).href,
  Season4: new URL('../assets/riichi-mahjong-tiles/Regular/Season4.svg', import.meta.url).href,
};

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
        src={tileAssets[tile.asset]}
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
            src={tileAssets[tile.asset]}
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
