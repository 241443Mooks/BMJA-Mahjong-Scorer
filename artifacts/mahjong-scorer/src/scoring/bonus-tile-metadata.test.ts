import { describe, expect, it } from 'vitest';
import {
  BONUS_TILE_DEFINITIONS,
  bonusTileDefinition,
} from '../tiles/MahjongTileArtwork';

describe('bonus tile metadata', () => {
  it('defines every Flower and Season with its BMJA name and seat-Wind association', () => {
    expect(BONUS_TILE_DEFINITIONS.map(({ family, number, name, wind }) => ({ family, number, name, wind }))).toEqual([
      { family: 'flower', number: 1, name: 'Plum', wind: 'east' },
      { family: 'flower', number: 2, name: 'Orchid', wind: 'south' },
      { family: 'flower', number: 3, name: 'Chrysanthemum', wind: 'west' },
      { family: 'flower', number: 4, name: 'Bamboo', wind: 'north' },
      { family: 'season', number: 1, name: 'Spring', wind: 'east' },
      { family: 'season', number: 2, name: 'Summer', wind: 'south' },
      { family: 'season', number: 3, name: 'Autumn', wind: 'west' },
      { family: 'season', number: 4, name: 'Winter', wind: 'north' },
    ]);
  });

  it('uses the metadata for accessible bonus-tile labels', () => {
    expect(bonusTileDefinition('flower', 2).label).toBe('Flower 2, Orchid, South');
    expect(bonusTileDefinition('season', 3).label).toBe('Season 3, Autumn, West');
  });
});
