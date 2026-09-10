import { dragon, expandedTiles, suited, wind } from '../scoring';
import type { MahjongHand, PlayingTile, Wind, WinningMethod } from '../scoring';
import type { HandScorerExampleContext } from '../game';
import { SPECIAL_HAND_ANCHORS } from './special-hand-references';
import type { TileAssetKey, TileDefinition } from './MahjongTileGallery';

type Group = NonNullable<MahjongHand['sets']>[number];
const set = (id: string, kind: Group['kind'], tile: PlayingTile, visibility: Group['visibility'] = 'concealed'): Group => ({ id, kind, tile, visibility });
const p = (suit: 'bamboo' | 'characters' | 'circles', rank: 1|2|3|4|5|6|7|8|9) => suited(suit, rank);
const genericSets = () => [set('example-1', 'chow', p('bamboo', 1)), set('example-2', 'pung', p('circles', 9)), set('example-3', 'pung', p('characters', 7)), set('example-4', 'pung', wind('east')), set('example-5', 'pair', dragon('red'))];
const eventSets = (winningTile: PlayingTile) => [set('example-1', 'chow', p('bamboo', 1)), set('example-2', 'pung', p('characters', 7)), set('example-3', 'pung', wind('east')), set('example-4', 'pung', dragon('red')), set('example-5', 'pair', winningTile)];
const grouped = (sets: Group[], extra: Partial<MahjongHand> = {}): MahjongHand => ({ sets, bonusTiles: [], isWinner: true, winningMethod: 'wall', ...extra });
const irregular = (looseTiles: PlayingTile[], extra: Partial<MahjongHand> = {}): MahjongHand => ({ sets: [], looseTiles, bonusTiles: [], isWinner: true, winningMethod: 'wall', ...extra });

export type SpecialHandExample = {
  id: keyof typeof SPECIAL_HAND_ANCHORS;
  name: string;
  hand: MahjongHand;
  playerWind?: Wind;
  /** Undefined means the normal scorer must ask the factual event question. */
  eventFollowUp?: string;
};

const examples: SpecialHandExample[] = [
  { id: 'purity', name: 'Purity', hand: grouped([set('example-1','pung',p('circles',1), 'exposed'),set('example-2','pung',p('circles',3)),set('example-3','pung',p('circles',6)),set('example-4','pung',p('circles',9)),set('example-5','pair',p('circles',5))]) },
  { id: 'all-pair-honours', name: 'All Pair Honours', hand: grouped([set('example-1','pair',p('bamboo',1)),set('example-2','pair',p('circles',9)),set('example-3','pair',p('characters',1)),set('example-4','pair',wind('east')),set('example-5','pair',wind('south')),set('example-6','pair',dragon('red')),set('example-7','pair',dragon('green'))]) },
  { id: 'all-winds-and-dragons', name: 'All Winds and Dragons', hand: grouped([set('example-1','pung',wind('east')),set('example-2','pung',wind('south')),set('example-3','pung',wind('west')),set('example-4','pung',wind('north')),set('example-5','pair',dragon('red'))]) },
  { id: 'heads-and-tails', name: 'Heads and Tails', hand: grouped([set('example-1','pung',p('bamboo',1)),set('example-2','pung',p('circles',9)),set('example-3','pung',p('characters',1)),set('example-4','pung',p('bamboo',9)),set('example-5','pair',p('characters',9))]) },
  { id: 'fourfold-plenty', name: 'Fourfold Plenty', hand: grouped([set('example-1','kong',p('circles',2)),set('example-2','kong',p('bamboo',4)),set('example-3','kong',dragon('red')),set('example-4','kong',wind('east')),set('example-5','pair',p('characters',7))]) },
  { id: 'three-great-scholars', name: 'Three Great Scholars', hand: grouped([set('example-1','pung',dragon('red')),set('example-2','pung',dragon('green')),set('example-3','pung',dragon('white')),set('example-4','pung',wind('east')),set('example-5','pair',p('circles',5))]) },
  { id: 'four-blessings', name: 'Four Blessings Hovering over the Door', hand: grouped([set('example-1','pung',wind('east')),set('example-2','pung',wind('south')),set('example-3','pung',wind('west')),set('example-4','pung',wind('north')),set('example-5','pair',dragon('green'))]) },
  { id: 'buried-treasure', name: 'Buried Treasure', hand: grouped([set('example-1','pung',p('circles',2)),set('example-2','pung',p('circles',4)),set('example-3','pung',p('circles',6)),set('example-4','pung',p('circles',8)),set('example-5','pair',p('circles',5))]) },
  { id: 'imperial-jade', name: 'Imperial Jade', hand: grouped([set('example-1','pung',dragon('green')),set('example-2','pung',p('bamboo',2)),set('example-3','pung',p('bamboo',3)),set('example-4','pung',p('bamboo',6)),set('example-5','pair',p('bamboo',8))]) },
  { id: 'knitting', name: 'Knitting', hand: irregular([p('bamboo',1),p('circles',1),p('characters',2),p('bamboo',2),p('circles',3),p('characters',3),p('bamboo',4),p('circles',4),p('characters',5),p('bamboo',5),p('circles',6),p('characters',6),p('bamboo',7),p('circles',7)]) },
  { id: 'triple-knitting', name: 'Triple Knitting', hand: irregular([p('bamboo',2),p('characters',2),p('circles',2),p('bamboo',4),p('characters',4),p('circles',4),p('bamboo',6),p('characters',6),p('circles',6),p('bamboo',8),p('characters',8),p('circles',8),p('bamboo',5),p('circles',5)]) },
  { id: 'thirteen-unique-wonders', name: 'Thirteen Unique Wonders', hand: irregular([p('bamboo',1),p('bamboo',9),p('circles',1),p('circles',9),p('characters',1),p('characters',9),wind('east'),wind('south'),wind('west'),wind('north'),dragon('red'),dragon('green'),dragon('white'),wind('east')]) },
  { id: 'gates-of-heaven', name: 'Gates of Heaven', hand: irregular([p('circles',1),p('circles',1),p('circles',1),p('circles',2),p('circles',3),p('circles',4),p('circles',5),p('circles',5),p('circles',6),p('circles',7),p('circles',8),p('circles',9),p('circles',9),p('circles',9)]) },
  { id: 'wriggling-snake', name: 'Wriggling Snake', hand: irregular([p('circles',1),p('circles',1),p('circles',2),p('circles',3),p('circles',4),p('circles',5),p('circles',6),p('circles',7),p('circles',8),p('circles',9),wind('east'),wind('south'),wind('west'),wind('north')]) },
  { id: 'heavens-blessing', name: 'Heaven’s Blessing', hand: grouped(genericSets(), { winningMethod: 'initial-deal' }) },
  { id: 'earths-blessing', name: 'Earth’s Blessing', playerWind: 'south', hand: grouped(genericSets(), { winningMethod: 'discard', winningEventEvidence: { type: 'discard', discardedBy: 'east', handDiscardOrdinal: 1 } }) },
  { id: 'gathering-the-plum-blossom-from-the-roof', name: 'Gathering the Plum Blossom from the Roof', hand: grouped(eventSets(p('circles', 5)), { winningMethod: 'loose-tile' }), eventFollowUp: 'Choose the winning 5 Circles to confirm the replacement draw.' },
  { id: 'plucking-the-moon-from-the-bottom-of-the-sea', name: 'Plucking the Moon from the Bottom of the Sea', hand: grouped(eventSets(p('circles', 1)), { winningMethod: 'last-wall-tile' }), eventFollowUp: 'Choose the winning 1 Circles to confirm the final live-wall draw.' },
  { id: 'twofold-fortune', name: 'Twofold Fortune', hand: grouped([set('example-1','kong',p('circles',2)),set('example-2','kong',p('bamboo',4)),set('example-3','pung',dragon('red')),set('example-4','pung',wind('east')),set('example-5','pair',p('characters',7))], { winningMethod: 'loose-tile', winningEventEvidence: { type: 'replacement-chain', kongDeclarations: 2 } }) },
];

export const specialHandExamples = examples;
export const specialHandExampleById = (id: string | null | undefined) => examples.find((example) => example.id === id);
export const specialHandExampleHref = (id: SpecialHandExample['id']) => `/hand?example=${id}`;
export const exampleVisualTiles = ({ hand }: Pick<SpecialHandExample, 'hand'>): TileDefinition[] => {
  const tiles = [...hand.sets.flatMap(expandedTiles), ...(hand.looseTiles ?? []), ...(hand.remainingTiles ?? [])];
  return tiles.map((tile) => {
    if (tile.family === 'suit') {
      const prefix = tile.suit === 'circles' ? 'Pin' : tile.suit === 'bamboo' ? 'Sou' : 'Man';
      const suit = tile.suit === 'circles' ? 'Circles' : tile.suit === 'bamboo' ? 'Bamboos' : 'Characters';
      return { asset: `${prefix}${tile.rank}` as TileAssetKey, label: `${tile.rank} ${suit}` };
    }
    if (tile.family === 'wind') return { asset: ({ east: 'Ton', south: 'Nan', west: 'Shaa', north: 'Pei' }[tile.wind]) as TileAssetKey, label: `${tile.wind[0].toUpperCase()}${tile.wind.slice(1)} Wind` };
    return { asset: ({ red: 'Chun', green: 'Hatsu', white: 'Haku' }[tile.dragon]) as TileAssetKey, label: `${tile.dragon[0].toUpperCase()}${tile.dragon.slice(1)} Dragon` };
  });
};
export const exampleHandScorerContext = (example: SpecialHandExample): HandScorerExampleContext => ({ playerId: 'catalogue-example', playerName: example.name, playerWind: example.playerWind ?? 'east', prevailingWind: 'east', isWinner: true, limit: 1000, detailedHand: { source: 'detailed-scorer', hand: example.hand, context: { playerWind: example.playerWind ?? 'east', prevailingWind: 'east', limit: 1000 }, breakdown: { valid: false, evidenceCompleteness: 'invalid', validationErrors: [], pointRules: [], doubleRules: [], specialHands: [], basePoints: 0, doubles: 0, uncappedScore: 0, finalScore: 0, limitApplied: false, scoringMode: 'standard', calculationComponents: [] }, finalScore: 0 } });
