import Man1 from '../assets/riichi-mahjong-tiles/Regular/Man1.svg?url';
import Man2 from '../assets/riichi-mahjong-tiles/Regular/Man2.svg?url';
import Man3 from '../assets/riichi-mahjong-tiles/Regular/Man3.svg?url';
import Man4 from '../assets/riichi-mahjong-tiles/Regular/Man4.svg?url';
import Man5 from '../assets/riichi-mahjong-tiles/Regular/Man5.svg?url';
import Man6 from '../assets/riichi-mahjong-tiles/Regular/Man6.svg?url';
import Man7 from '../assets/riichi-mahjong-tiles/Regular/Man7.svg?url';
import Man8 from '../assets/riichi-mahjong-tiles/Regular/Man8.svg?url';
import Man9 from '../assets/riichi-mahjong-tiles/Regular/Man9.svg?url';
import Pin1 from '../assets/riichi-mahjong-tiles/Regular/Pin1.svg?url';
import Pin2 from '../assets/riichi-mahjong-tiles/Regular/Pin2.svg?url';
import Pin3 from '../assets/riichi-mahjong-tiles/Regular/Pin3.svg?url';
import Pin4 from '../assets/riichi-mahjong-tiles/Regular/Pin4.svg?url';
import Pin5 from '../assets/riichi-mahjong-tiles/Regular/Pin5.svg?url';
import Pin6 from '../assets/riichi-mahjong-tiles/Regular/Pin6.svg?url';
import Pin7 from '../assets/riichi-mahjong-tiles/Regular/Pin7.svg?url';
import Pin8 from '../assets/riichi-mahjong-tiles/Regular/Pin8.svg?url';
import Pin9 from '../assets/riichi-mahjong-tiles/Regular/Pin9.svg?url';
import Sou1 from '../assets/riichi-mahjong-tiles/Regular/Sou1.svg?url';
import Sou2 from '../assets/riichi-mahjong-tiles/Regular/Sou2.svg?url';
import Sou3 from '../assets/riichi-mahjong-tiles/Regular/Sou3.svg?url';
import Sou4 from '../assets/riichi-mahjong-tiles/Regular/Sou4.svg?url';
import Sou5 from '../assets/riichi-mahjong-tiles/Regular/Sou5.svg?url';
import Sou6 from '../assets/riichi-mahjong-tiles/Regular/Sou6.svg?url';
import Sou7 from '../assets/riichi-mahjong-tiles/Regular/Sou7.svg?url';
import Sou8 from '../assets/riichi-mahjong-tiles/Regular/Sou8.svg?url';
import Sou9 from '../assets/riichi-mahjong-tiles/Regular/Sou9.svg?url';
import Ton from '../assets/riichi-mahjong-tiles/Regular/Ton.svg?url';
import Nan from '../assets/riichi-mahjong-tiles/Regular/Nan.svg?url';
import Shaa from '../assets/riichi-mahjong-tiles/Regular/Shaa.svg?url';
import Pei from '../assets/riichi-mahjong-tiles/Regular/Pei.svg?url';
import Chun from '../assets/riichi-mahjong-tiles/Regular/Chun.svg?url';
import Hatsu from '../assets/riichi-mahjong-tiles/Regular/Hatsu.svg?url';
import Haku from '../assets/riichi-mahjong-tiles/Regular/Haku.svg?url';
import Flower1 from '../assets/riichi-mahjong-tiles/Regular/Flower1.svg?url';
import Flower2 from '../assets/riichi-mahjong-tiles/Regular/Flower2.svg?url';
import Flower3 from '../assets/riichi-mahjong-tiles/Regular/Flower3.svg?url';
import Flower4 from '../assets/riichi-mahjong-tiles/Regular/Flower4.svg?url';
import Season1 from '../assets/riichi-mahjong-tiles/Regular/Season1.svg?url';
import Season2 from '../assets/riichi-mahjong-tiles/Regular/Season2.svg?url';
import Season3 from '../assets/riichi-mahjong-tiles/Regular/Season3.svg?url';
import Season4 from '../assets/riichi-mahjong-tiles/Regular/Season4.svg?url';
import type { BonusTile, PlayingTile, Wind } from '../scoring';

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

export type BonusTileDefinition = TileDefinition & {
  family: BonusTile['family'];
  number: BonusTile['number'];
  name: string;
  wind: Wind;
};

const tileAssets: Record<TileAssetKey, string> = {
  Man1,
  Man2,
  Man3,
  Man4,
  Man5,
  Man6,
  Man7,
  Man8,
  Man9,
  Pin1,
  Pin2,
  Pin3,
  Pin4,
  Pin5,
  Pin6,
  Pin7,
  Pin8,
  Pin9,
  Sou1,
  Sou2,
  Sou3,
  Sou4,
  Sou5,
  Sou6,
  Sou7,
  Sou8,
  Sou9,
  Ton,
  Nan,
  Shaa,
  Pei,
  Chun,
  Hatsu,
  Haku,
  Flower1,
  Flower2,
  Flower3,
  Flower4,
  Season1,
  Season2,
  Season3,
  Season4,
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

export const BONUS_TILE_DEFINITIONS: readonly BonusTileDefinition[] = [
  { family: 'flower', number: 1, name: 'Plum', wind: 'east', asset: 'Flower1', label: 'Flower 1, Plum, East' },
  { family: 'flower', number: 2, name: 'Orchid', wind: 'south', asset: 'Flower2', label: 'Flower 2, Orchid, South' },
  { family: 'flower', number: 3, name: 'Chrysanthemum', wind: 'west', asset: 'Flower3', label: 'Flower 3, Chrysanthemum, West' },
  { family: 'flower', number: 4, name: 'Bamboo', wind: 'north', asset: 'Flower4', label: 'Flower 4, Bamboo, North' },
  { family: 'season', number: 1, name: 'Spring', wind: 'east', asset: 'Season1', label: 'Season 1, Spring, East' },
  { family: 'season', number: 2, name: 'Summer', wind: 'south', asset: 'Season2', label: 'Season 2, Summer, South' },
  { family: 'season', number: 3, name: 'Autumn', wind: 'west', asset: 'Season3', label: 'Season 3, Autumn, West' },
  { family: 'season', number: 4, name: 'Winter', wind: 'north', asset: 'Season4', label: 'Season 4, Winter, North' },
];

export const bonusTileDefinition = (
  family: BonusTile['family'],
  number: BonusTile['number'],
): BonusTileDefinition => {
  const definition = BONUS_TILE_DEFINITIONS.find(
    (tile) => tile.family === family && tile.number === number,
  );
  if (!definition) throw new Error(`Unknown bonus tile: ${family} ${number}`);
  return definition;
};
