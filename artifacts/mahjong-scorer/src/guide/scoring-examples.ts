import { bonus, dragon, expandedTiles, set, suited, wind } from '../scoring';
import type { GameContext, MahjongHand, ScoreBreakdown, Wind } from '../scoring';
import type { HandScorerContext } from '../game';
import { bonusTileDefinition } from '../tiles/MahjongTileArtwork';
import { exampleHandScorerContext, exampleVisualTiles, specialHandExampleById } from './special-hand-examples';
import type { TileDefinition } from './MahjongTileGallery';

export type WorkedScoringExample = {
  id: string;
  title: string;
  purpose: string;
  hand: MahjongHand;
  context: GameContext;
  explanation: string;
  references: { label: string; href: string }[];
  expected: Pick<ScoreBreakdown, 'basePoints' | 'doubles' | 'finalScore' | 'evidenceCompleteness' | 'scoringMode'>;
  practice: boolean;
  returnHref: string;
};

const context = (playerWind: Wind = 'east', prevailingWind: Wind = 'east'): GameContext => ({ playerWind, prevailingWind, limit: 1000 });
const grouped = (sets: MahjongHand['sets'], extra: Partial<MahjongHand> = {}): MahjongHand => ({ sets, bonusTiles: [], isWinner: true, winningMethod: 'wall', ...extra });

/** One production catalogue feeds the page, completed scorer route, practice route and result assertions. */
export const scoringExamples: WorkedScoringExample[] = [
  {
    id: 'concealed-pung', title: 'A mixed hand: exposed and concealed sets',
    purpose: 'See how an exposed Dragon, concealed Pungs and a terminal build ordinary points and doubles.',
    hand: grouped([set('dragon', 'pung', dragon('red'), 'exposed'), set('chow-1', 'chow', suited('bamboo', 2), 'exposed'), set('minor', 'pung', suited('bamboo', 5)), set('terminal', 'pung', suited('bamboo', 9)), set('pair', 'pair', wind('south'))], { bonusTiles: [bonus('flower', 2)] }),
    context: context('south'), expected: { basePoints: 44, doubles: 3, finalScore: 352, evidenceCompleteness: 'complete', scoringMode: 'standard' }, practice: true,
    explanation: 'The Red Dragon Pung, concealed minor and terminal Pungs, own-Wind pair, Flower and self-draw all add points. The Dragon, own Flower and mixed one-suit pattern add three doubles.',
    references: [{ label: 'Ordinary scoring', href: '/guide#ordinary-scoring' }, { label: 'Doubles', href: '/guide#doubles' }], returnHref: '/scoring-examples#concealed-pung',
  },
  {
    id: 'concealed-kong-purity', title: 'Concealed Kong and Purity', purpose: 'Compare an exposed Pung with a concealed Kong, then see Purity and bonus tiles calculated as separate components.',
    hand: grouped([set('p1', 'pung', suited('characters', 2), 'exposed'), set('p2', 'pung', suited('characters', 3)), set('p3', 'pung', suited('characters', 6)), set('k1', 'kong', suited('characters', 9)), set('pair', 'pair', suited('characters', 5))], { bonusTiles: [bonus('flower', 1), bonus('season', 2)], winningMethod: 'discard' }),
    context: context(), expected: { basePoints: 70, doubles: 4, finalScore: 512, evidenceCompleteness: 'complete', scoringMode: 'special' }, practice: true,
    explanation: 'Purity gives three doubles to the playing-tile component. The Flower and Season are a separate component; the own Flower doubles only that eight-point bonus component.',
    references: [{ label: 'Doubles', href: '/guide#doubles' }, { label: 'Flowers and Seasons', href: '/gameplay-basics#bonus-tiles' }], returnHref: '/scoring-examples#concealed-kong-purity',
  },
  {
    id: 'own-wind-and-dragon', title: 'Own Wind, Dragon and bonus tile',
    purpose: 'Separate the Wind/Dragon point rules from the doubles they can create.',
    hand: grouped([set('red', 'pung', dragon('red'), 'exposed'), set('nine', 'pung', suited('circles', 9)), set('east-pair', 'pair', wind('east'))], { isWinner: false, bonusTiles: [bonus('flower', 1), bonus('season', 3)] }),
    context: context('east', 'south'), expected: { basePoints: 22, doubles: 2, finalScore: 88, evidenceCompleteness: 'partial', scoringMode: 'standard' }, practice: true,
    explanation: 'This is intentionally incomplete evidence: the scorer only claims the entered sets and bonus tiles. It does not infer a whole-hand pattern from the missing tiles.',
    references: [{ label: 'Winds and Dragons', href: '/guide#ordinary-scoring' }, { label: 'Flowers and Seasons', href: '/gameplay-basics#bonus-tiles' }], returnHref: '/scoring-examples#own-wind-and-dragon',
  },
  {
    id: 'partial-losing-hand', title: 'Partial losing hand', purpose: 'Learn the conservative treatment of a hand that is not finished.',
    hand: { sets: [set('bamboo-pung', 'pung', suited('bamboo', 2)), set('dragon-pung', 'pung', dragon('red'), 'exposed'), set('east-pair', 'pair', wind('east'))], bonusTiles: [], isWinner: false },
    context: context(), expected: { basePoints: 12, doubles: 1, finalScore: 24, evidenceCompleteness: 'partial', scoringMode: 'standard' }, practice: true,
    explanation: 'The entered Pungs score, but the scattered remaining tiles are not promoted into a Chow, fishing result or whole-hand double. Partial evidence stays partial.',
    references: [{ label: 'Scoring guide', href: '/guide#ordinary-scoring' }], returnHref: '/scoring-examples#partial-losing-hand',
  },
  {
    id: 'thirteen-wonders-fishing', title: 'Thirteen Unique Wonders fishing', purpose: 'See a thirteen-tile near-hand and the special fishing value it genuinely supports.',
    hand: { sets: [], looseTiles: [suited('bamboo', 1), suited('bamboo', 9), suited('characters', 1), suited('characters', 9), suited('circles', 1), suited('circles', 9), wind('east'), wind('south'), wind('west'), wind('north'), dragon('red'), dragon('green'), dragon('white')], bonusTiles: [bonus('flower', 4), bonus('season', 2)], isWinner: false, originalCall: false },
    context: context('north'), expected: { basePoints: 8, doubles: 1, finalScore: 416, evidenceCompleteness: 'complete', scoringMode: 'special' }, practice: true,
    explanation: 'The 400 fishing value is a special component. The two bonus tiles are a separate component, and only their own-Flower double applies to that component.',
    references: [{ label: 'Thirteen Unique Wonders', href: '/special-hands#thirteen-unique-wonders' }, { label: 'Fishing', href: '/guide#fishing' }], returnHref: '/scoring-examples#thirteen-wonders-fishing',
  },
  {
    id: 'all-pair-honours-bonus', title: 'Special hand with separately doubled bonus tiles', purpose: 'Show why a special hand’s fixed value is not doubled by a bonus-tile double.',
    hand: grouped([set('1', 'pair', wind('east')), set('2', 'pair', wind('south')), set('3', 'pair', suited('bamboo', 1)), set('4', 'pair', suited('characters', 9)), set('5', 'pair', dragon('red')), set('6', 'pair', dragon('green')), set('7', 'pair', dragon('white'))], { bonusTiles: [bonus('flower', 4), bonus('season', 2)] }),
    context: context('north'), expected: { basePoints: 8, doubles: 1, finalScore: 516, evidenceCompleteness: 'complete', scoringMode: 'special' }, practice: true,
    explanation: 'All Pair Honours contributes its fixed 500. The Flower and Season contribute 8, doubled to 16 by the own Flower—so the total is 516, not the special hand doubled.',
    references: [{ label: 'All Pair Honours', href: '/special-hands#all-pair-honours' }], returnHref: '/scoring-examples#all-pair-honours-bonus',
  },
];

export const scoringExampleById = (id: string | null | undefined) => scoringExamples.find((example) => example.id === id);
export const completedExampleHref = (id: string) => `/hand?example=${encodeURIComponent(id)}`;
export const practiceExampleHref = (id: string) => `/hand?practice=${encodeURIComponent(id)}`;
export const scoringExampleContext = (example: WorkedScoringExample): HandScorerContext => ({ playerId: 'worked-example', playerName: example.title, playerWind: example.context.playerWind, prevailingWind: example.context.prevailingWind, isWinner: example.hand.isWinner, limit: example.context.limit, detailedHand: { source: 'detailed-scorer', hand: example.hand, context: example.context, breakdown: { valid: false, evidenceCompleteness: 'invalid', validationErrors: [], pointRules: [], doubleRules: [], specialHands: [], basePoints: 0, doubles: 0, uncappedScore: 0, finalScore: 0, limitApplied: false, scoringMode: 'standard', calculationComponents: [] }, finalScore: 0 } });
export const scoringExampleTiles = (example: WorkedScoringExample): TileDefinition[] => exampleVisualTiles({ hand: example.hand });
export const scoringExampleBonusTiles = (example: WorkedScoringExample): TileDefinition[] => example.hand.bonusTiles.map((tile) => bonusTileDefinition(tile.family, tile.number));

export type ResolvedScorerExample = { id: string; name: string; hand: MahjongHand; context: HandScorerContext; returnHref: string; returnLabel: string; };
export const resolveScorerExample = (id: string | null | undefined): ResolvedScorerExample | undefined => {
  const worked = scoringExampleById(id);
  if (worked) return { id: worked.id, name: worked.title, hand: worked.hand, context: scoringExampleContext(worked), returnHref: worked.returnHref, returnLabel: 'Back to worked example' };
  const special = specialHandExampleById(id);
  if (special) {
    return { id: special.id, name: special.name, hand: special.hand, context: exampleHandScorerContext(special), returnHref: `/special-hands#${special.id}`, returnLabel: 'Back to Special hands' };
  }
  return undefined;
};

/** Practice has the same target/context but must never preload the learner's hand. */
export const initialHandForExampleMode = (example: ResolvedScorerExample | undefined, practice: boolean) => practice ? undefined : example?.hand;
export const handForScorerMode = (context: HandScorerContext | null, example: ResolvedScorerExample | undefined, practice: boolean) => example ? initialHandForExampleMode(example, practice) : context?.detailedHand?.hand;
