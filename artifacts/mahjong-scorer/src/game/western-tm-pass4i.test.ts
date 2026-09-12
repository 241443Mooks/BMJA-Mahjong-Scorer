import { describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import type { MahjongHand, PlayingTile, SuitTile } from '../scoring';
import { detectSpecialFishing } from '../scoring/fishing';
import { canonicalSpecialHandPatterns } from '../scoring/special-hands';
import { BMJA_RULESET, WESTERN_TM_RULESET } from './ruleset';
import { westernTmSpecialHandBindings } from './western-tm-catalogue';

const p = (id: string, tile: PlayingTile) => set(id, 'pung', tile);
const k = (id: string, tile: PlayingTile) => set(id, 'kong', tile);
const q = (id: string, tile: PlayingTile) => set(id, 'pair', tile);
const c = (id: string, suit: SuitTile['suit'], rank: 1 | 2 | 3 | 4 | 5 | 6 | 7) => set(id, 'chow', suited(suit, rank));
const score = (hand: MahjongHand) => WESTERN_TM_RULESET.scoreHand({ hand, playerWind: 'east', prevailingWind: 'east' });
const detector = (id: string) => canonicalSpecialHandPatterns.find((pattern) => pattern.id === id)!;
const fishing = (hand: MahjongHand, id: string) => detectSpecialFishing(hand, westernTmSpecialHandBindings).find((match) => match.id === id);

const sunrise: MahjongHand = { sets: [p('east', wind('east')), p('bamboo', suited('bamboo', 2)), k('characters', suited('characters', 5)), p('circles', suited('circles', 8)), q('pair', dragon('white'))], bonusTiles: [], isWinner: true };
const sunset: MahjongHand = { sets: [p('white', dragon('white')), p('bamboo', suited('bamboo', 2)), k('characters', suited('characters', 5)), p('circles', suited('circles', 8)), q('pair', dragon('red'))], bonusTiles: [], isWinner: true };
const allHonour: MahjongHand = { sets: [p('east', wind('east')), p('south', wind('south')), p('red', dragon('red')), p('nine', suited('bamboo', 9)), q('pair', dragon('white'))], bonusTiles: [], isWinner: true };
const ordinary: MahjongHand = { sets: [p('two', suited('bamboo', 2)), p('five', suited('bamboo', 5)), p('eight', suited('bamboo', 8)), c('chow', 'bamboo', 3), q('pair', wind('east'))], bonusTiles: [], isWinner: true };
const ordinaryPurity: MahjongHand = { sets: [p('two', suited('bamboo', 2)), p('five', suited('bamboo', 5)), p('eight', suited('bamboo', 8)), c('chow', 'bamboo', 3), q('pair', suited('bamboo', 7))], bonusTiles: [], isWinner: true };

describe('western-tm@0.1 Pass 4I calculated and half-exposure catalogue wave', () => {
  it('binds exactly the four Western-only catalogue entries', () => {
    const ids = ['east-wind-meld-white-dragon-pair-three-suit-nonterminal-melds', 'white-dragon-meld-red-dragon-pair-three-suit-nonterminal-melds', 'honours-and-one-suit-terminals-pung-kong-hand', 'one-suit-with-honours-mostly-pung-kong-hand'] as const;
    expect(ids.map((id) => westernTmSpecialHandBindings.find((binding) => binding.patternId === id))).toEqual([
      expect.objectContaining({ name: 'Sunrise', value: 1000, fishingValue: 400, exposure: { allowed: true, exposedValue: 500, exposedFishingValue: 200 } }),
      expect.objectContaining({ name: 'Sunset', value: 1000, fishingValue: 400, exposure: { allowed: true, exposedValue: 500, exposedFishingValue: 200 } }),
      expect.objectContaining({ name: 'All Honour Hand', scoreModel: { kind: 'calculated', exposure: { multiplier: 0.5, triggerSetKinds: ['pung', 'kong'] } } }),
      expect.objectContaining({ name: 'Ordinary Mah Jong', scoreModel: { kind: 'calculated', exposure: { multiplier: 0.5, triggerSetKinds: ['pung', 'kong'], forbiddenSetKinds: ['chow'] } } }),
    ]);
    expect(ids.every((id) => !BMJA_RULESET.scoreHand({ hand: id.includes('east-wind') ? sunrise : ordinary, playerWind: 'east', prevailingWind: 'east' }).specialHands.some((match) => match.id === id))).toBe(true);
  });

  it('recognises Sunrise and Sunset exactly, with one-dot winning and fishing halves', () => {
    expect(detector('east-wind-meld-white-dragon-pair-three-suit-nonterminal-melds').detect(sunrise)).toBe(true);
    expect(detector('white-dragon-meld-red-dragon-pair-three-suit-nonterminal-melds').detect(sunset)).toBe(true);
    expect(detector('east-wind-meld-white-dragon-pair-three-suit-nonterminal-melds').detect({ ...sunrise, sets: [...sunrise.sets.slice(0, 3), p('circles', suited('circles', 9)), sunrise.sets[4]!] })).toBe(false);
    expect(detector('white-dragon-meld-red-dragon-pair-three-suit-nonterminal-melds').detect({ ...sunset, sets: [c('bad', 'bamboo', 2), ...sunset.sets.slice(1)] })).toBe(false);
    for (const [id, hand] of [['east-wind-meld-white-dragon-pair-three-suit-nonterminal-melds', sunrise], ['white-dragon-meld-red-dragon-pair-three-suit-nonterminal-melds', sunset]] as const) {
      expect(score(hand).specialHands).toContainEqual(expect.objectContaining({ id, value: 1000, matched: true }));
      const exposed = { ...hand, sets: hand.sets.map((group) => group.id === 'bamboo' ? { ...group, visibility: 'exposed' as const } : group) };
      expect(score(exposed).specialHands).toContainEqual(expect.objectContaining({ id, value: 500, matched: true }));
      const near = { ...hand, isWinner: false, sets: hand.sets.filter((group) => group.kind !== 'pair'), remainingTiles: [hand.sets.find((group) => group.kind === 'pair')!.tile] };
      expect(fishing(near, id)?.fishingValue).toBe(400);
      expect(fishing({ ...near, sets: near.sets.map((group) => group.id === 'bamboo' ? { ...group, visibility: 'exposed' as const } : group) }, id)?.fishingValue).toBe(200);
    }
  });

  it('calculates All Honour Hand once and lets fixed All Winds and Dragons win overlap precedence', () => {
    const concealed = score(allHonour);
    const exposed = score({ ...allHonour, sets: allHonour.sets.map((group) => group.id === 'east' ? { ...group, visibility: 'exposed' as const } : group) });
    expect(concealed.specialHands).toContainEqual(expect.objectContaining({ id: 'honours-and-one-suit-terminals-pung-kong-hand', scoreModel: 'calculated', matched: true }));
    const exposedOrdinary = exposed.calculationComponents.find((component) => component.id === 'standard-hand')!.subtotal;
    expect(exposed.uncappedScore).toBe(exposedOrdinary * 0.5);
    expect(exposed.calculationComponents.filter((component) => component.id === 'calculated-special-exposure-adjustment')).toHaveLength(1);
    const allHonours = { ...allHonour, sets: [p('east', wind('east')), p('south', wind('south')), p('red', dragon('red')), p('green', dragon('green')), q('pair', dragon('white'))] };
    const overlap = score(allHonours);
    expect(overlap.specialHands).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'honours-and-one-suit-terminals-pung-kong-hand', matched: true }), expect.objectContaining({ id: 'all-winds-and-dragons', value: 1000, matched: true })]));
    expect(overlap.calculationComponents.filter((component) => component.id.startsWith('special-'))).toEqual([expect.objectContaining({ subtotal: 1000 })]);
    expect(overlap.calculationComponents.some((component) => component.id === 'calculated-special-exposure-adjustment')).toBe(false);
  });

  it('calculates Ordinary Mah Jong once, halves only represented Pungs/Kongs, and rejects an exposed Chow', () => {
    const concealed = score(ordinary);
    const pungExposed = score({ ...ordinary, sets: ordinary.sets.map((group) => group.id === 'two' ? { ...group, visibility: 'exposed' as const } : group) });
    const chowExposed = score({ ...ordinary, sets: ordinary.sets.map((group) => group.id === 'chow' ? { ...group, visibility: 'exposed' as const } : group) });
    expect(concealed.specialHands).toContainEqual(expect.objectContaining({ id: 'one-suit-with-honours-mostly-pung-kong-hand', scoreModel: 'calculated', matched: true }));
    const exposedOrdinary = pungExposed.calculationComponents.find((component) => component.id === 'standard-hand')!.subtotal;
    expect(pungExposed.finalScore).toBe(exposedOrdinary * 0.5);
    expect(pungExposed.calculationComponents.filter((component) => component.id === 'calculated-special-exposure-adjustment')).toHaveLength(1);
    expect(chowExposed.specialHands).toContainEqual(expect.objectContaining({ id: 'one-suit-with-honours-mostly-pung-kong-hand', matched: false }));
    const overlap = score(ordinaryPurity);
    expect(overlap.specialHands).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'purity-one-chow', scoreModel: 'calculated', matched: true }),
      expect.objectContaining({ id: 'one-suit-with-honours-mostly-pung-kong-hand', scoreModel: 'calculated', matched: true }),
    ]));
    expect(overlap.calculationComponents.filter((component) => component.id === 'calculated-special-exposure-adjustment')).toHaveLength(0);
    expect(pungExposed.calculationComponents.filter((component) => component.id === 'calculated-special-exposure-adjustment')).toHaveLength(1);
  });
});
