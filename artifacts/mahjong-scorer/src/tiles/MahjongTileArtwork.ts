import type { BonusTile, PlayingTile } from '../scoring';

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

export const tileAssetUrl = (asset: TileAssetKey) => tileAssets[asset];

const windAssets = {
  east: 'Ton',
  south: 'Nan',
  west: 'Shaa',
  north: 'Pei',
} as const;

const dragonAssets = {
  red: 'Chun',
  green: 'Hatsu',
  white: 'Haku',
} as const;

const suitAssets = {
  characters: 'Man',
  circles: 'Pin',
  bamboo: 'Sou',
} as const;

const suitLabels = {
  characters: 'Characters',
  circles: 'Circles',
  bamboo: 'Bamboo',
} as const;

export const playingTileDefinition = (tile: PlayingTile): TileDefinition => {
  if (tile.family === 'suit') {
    return {
      asset: `${suitAssets[tile.suit]}${tile.rank}` as TileAssetKey,
      label: `${tile.rank} ${suitLabels[tile.suit]}`,
    };
  }

  if (tile.family === 'wind') {
    return {
      asset: windAssets[tile.wind],
      label: `${tile.wind.charAt(0).toUpperCase()}${tile.wind.slice(1)} Wind`,
    };
  }

  return {
    asset: dragonAssets[tile.dragon],
    label: `${tile.dragon.charAt(0).toUpperCase()}${tile.dragon.slice(1)} Dragon`,
  };
};

export const bonusTileDefinition = (
  family: BonusTile['family'],
  number: BonusTile['number'],
): TileDefinition => ({
  asset: `${family === 'flower' ? 'Flower' : 'Season'}${number}` as TileAssetKey,
  label: `${family === 'flower' ? 'Flower' : 'Season'} ${number}`,
});
