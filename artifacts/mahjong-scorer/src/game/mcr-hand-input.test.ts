import { beforeAll, describe, expect, it } from 'vitest';
import { bonus, dragon, set, suited, wind } from '../scoring/tiles';
import type { MahjongHand } from '../scoring/types';
import { initialiseCurrentRulesRuntimes, getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import { MCR_2006_FAN_BINDINGS } from '../rules-platform/mcr-detectors';
import { toMcrScoringInput, hasMcrWinningTileOccurrence } from './mcr-hand-input';
import { presentMcrScore } from './mcr-score-presentation';

const ref = { id: 'mcr-wmo-2006', version: '0.1' };
const known = { winSource: 'discard' as const, resolvedWinEvent: 'none' as const, lastVisibleCopy: false };
const circle = (rank: 1|2|3|4|5|6|7|8|9) => suited('circles', rank);
const pair = (id: string, tile: ReturnType<typeof wind>) => set(id, 'pair', tile);
const ordinary: MahjongHand = {
  sets: [set('open-chow', 'chow', suited('characters', 1), 'exposed'), set('free-c1', 'chow', suited('characters', 1)), set('free-c2', 'chow', suited('characters', 1)), set('free-c3', 'chow', suited('characters', 1)), set('winning-pair', 'pair', suited('characters', 4))],
  bonusTiles: [], isWinner: true, winningTileProvenance: { tile: suited('characters', 4), target: { type: 'grouped-set', setId: 'winning-pair' } },
};
const sevenPairs: MahjongHand = {
  sets: [], looseTiles: [suited('characters',1),suited('characters',1),suited('characters',2),suited('characters',2),circle(3),circle(3),circle(4),circle(4),suited('bamboo',5),suited('bamboo',5),suited('bamboo',6),suited('bamboo',6),wind('east'),wind('east')],
  bonusTiles: [], isWinner: true, winningTileProvenance: { tile: wind('east'), target: { type: 'loose-layout' } },
};

describe('C1 MCR physical entry adapter and result presenter', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());

  it('maps circles to dots and classifies fixed versus flattened physical groups', () => {
    const hand: MahjongHand = { sets: [set('melded', 'pung', circle(5), 'exposed'), set('kong', 'kong', wind('north')), set('closed', 'chow', suited('bamboo', 2)), pair('pair', wind('east')), set('target', 'pung', dragon('red'), 'exposed')], looseTiles: [circle(8)], bonusTiles: [], isWinner: true, winningTileProvenance: { tile: dragon('red'), target: { type: 'grouped-set', setId: 'target' } } };
    const result = toMcrScoringInput(hand, known); expect(result.kind).toBe('ready'); if (result.kind !== 'ready') return;
    expect(result.input.evidence.fixedGroups.map(({ kind, exposure }) => [kind, exposure])).toEqual([['pung','melded'],['kong','concealed']]);
    expect(result.input.evidence.freeTiles.filter(({ face }) => face.family === 'suit').map(({ face }) => face.family === 'suit' ? face.suit : '')).toContain('dots');
    expect(result.input.evidence.freeTiles).toHaveLength(1 + 3 + 2 + 3);
    expect(hasMcrWinningTileOccurrence(result.input)).toBe(true);
  });

  it('counts all four Flowers and four Seasons as eight canonical bonus tiles', () => {
    const hand: MahjongHand = { sets: [], looseTiles: [suited('characters',1)], bonusTiles: [...[1,2,3,4].map((n) => bonus('flower', n as 1|2|3|4)), ...[1,2,3,4].map((n) => bonus('season', n as 1|2|3|4))], isWinner: true, winningTileProvenance: { tile: suited('characters',1), target: { type: 'loose-layout' } } };
    const result = toMcrScoringInput(hand, known); expect(result.kind).toBe('ready'); if (result.kind === 'ready') expect(result.input.evidence.flowerCount).toBe(8);
  });

  it('sends an existing source-pinned ordinary golden through adapter and C0 runtime', () => {
    const adapted = toMcrScoringInput(ordinary, known); expect(adapted.kind).toBe('ready'); if (adapted.kind !== 'ready') return;
    const compiled = getCurrentCompiledRulesRuntime(ref); if (compiled.grammar !== 'pattern-accumulator') throw new Error('MCR compiled grammar expected');
    const result = compiled.runtime.scoreHand(adapted.input);
    expect(result).toMatchObject({ disposition: { kind: 'scored' }, result: { total: 86 } });
  });

  it('preserves seat and prevailing wind as unknown until runtime evidence asks for them', () => {
    const hand: MahjongHand = { sets: [set('east','pung',wind('east'),'exposed'),set('south','pung',wind('south'),'exposed'),set('west','pung',wind('west'),'exposed'),set('north','pung',wind('north')) ,set('pair','pair', { family: 'dragon', dragon: 'red' })], bonusTiles: [], isWinner: true, winningTileProvenance: { tile: wind('north'), target: { type: 'grouped-set', setId: 'north' } } };
    const adapted = toMcrScoringInput(hand, known); if (adapted.kind !== 'ready') throw new Error('Expected adapted hand');
    expect(adapted.input.context.seatWind).toBeUndefined(); expect(adapted.input.context.prevailingWind).toBeUndefined();
    const compiled = getCurrentCompiledRulesRuntime(ref); if (compiled.grammar !== 'pattern-accumulator') throw new Error('MCR compiled grammar expected');
    const view = presentMcrScore(compiled.runtime.scoreHand(adapted.input));
    expect(view.kind).toBe('needs-evidence');
    if (view.kind === 'needs-evidence') expect(view.prompts.map(({ id }) => id)).toEqual(expect.arrayContaining(['evidence.seat-wind', 'evidence.round-wind']));
  });

  it('scores Seven Pairs at 24 through the same public adapter and C0 runtime', () => {
    const adapted = toMcrScoringInput(sevenPairs, known); expect(adapted.kind).toBe('ready'); if (adapted.kind !== 'ready') return;
    const compiled = getCurrentCompiledRulesRuntime(ref); if (compiled.grammar !== 'pattern-accumulator') throw new Error('MCR compiled grammar expected');
    expect(compiled.runtime.scoreHand(adapted.input)).toMatchObject({ disposition: { kind: 'scored' }, result: { total: 24 } });
  });

  it('keeps an unanswered last-visible-copy as needs-evidence with an actionable prompt', () => {
    const adapted = toMcrScoringInput(ordinary, { winSource: 'discard', resolvedWinEvent: 'none' }); if (adapted.kind !== 'ready') throw new Error('Expected adapted hand');
    const compiled = getCurrentCompiledRulesRuntime(ref); if (compiled.grammar !== 'pattern-accumulator') throw new Error('MCR compiled grammar expected');
    const view = presentMcrScore(compiled.runtime.scoreHand(adapted.input));
    expect(view).toMatchObject({ kind: 'needs-evidence', prompts: [{ id: 'evidence.last-visible-copy' }] });
  });

  it('preserves sub-eight plus Flowers as not-qualifying with no Flower rescue', () => {
    const hand: MahjongHand = { sets: [set('a','pung',suited('characters',2),'exposed'),set('b','pung',circle(5),'exposed'),set('c','pung',suited('bamboo',8),'exposed'),set('d','pung',suited('characters',4)),set('pair','pair',wind('west'))], bonusTiles: [bonus('flower',1),bonus('season',1)], isWinner: true, winningTileProvenance: { tile: suited('characters',4), target: { type: 'grouped-set', setId: 'd' } } };
    const adapted = toMcrScoringInput(hand, { ...known, winSource: 'self-draw' }); if (adapted.kind !== 'ready') throw new Error('Expected adapted hand');
    const compiled = getCurrentCompiledRulesRuntime(ref); if (compiled.grammar !== 'pattern-accumulator') throw new Error('MCR compiled grammar expected');
    const result = compiled.runtime.scoreHand(adapted.input); expect(presentMcrScore(result)).toMatchObject({ kind: 'not-qualifying', belowMinimum: true, flowersCannotRescue: true });
    expect(result.result.total).toBe(0);
    expect(adapted.input.evidence.flowerCount).toBe(2);
  });

  it('resolves fan names and source from the canonical binding catalogue', () => {
    const adapted = toMcrScoringInput(sevenPairs, known); if (adapted.kind !== 'ready') throw new Error('Expected adapted hand');
    const compiled = getCurrentCompiledRulesRuntime(ref); if (compiled.grammar !== 'pattern-accumulator') throw new Error('MCR compiled grammar expected');
    const view = presentMcrScore(compiled.runtime.scoreHand(adapted.input)); if (view.kind !== 'scored') throw new Error('Expected scored view');
    expect(view.counted).toContainEqual(expect.objectContaining({ name: MCR_2006_FAN_BINDINGS.find(({ id }) => id === 'mcr2006.fan.seven-pairs')!.name, value: 24 }));
    expect(JSON.stringify(view)).not.toMatch(/doubles|table limit|base points/i);
  });

  it('presents suppressed fan with binding names, canonical reason IDs, and source locators', () => {
    const adapted = toMcrScoringInput(ordinary, known); if (adapted.kind !== 'ready') throw new Error('Expected adapted hand');
    const compiled = getCurrentCompiledRulesRuntime(ref); if (compiled.grammar !== 'pattern-accumulator') throw new Error('MCR compiled grammar expected');
    const view = presentMcrScore(compiled.runtime.scoreHand(adapted.input)); if (view.kind !== 'scored') throw new Error('Expected scored view');
    expect(view.suppressed.length).toBeGreaterThan(0);
    for (const fan of view.suppressed) {
      const binding = MCR_2006_FAN_BINDINGS.find(({ name }) => name === fan.name);
      expect(binding?.sourceLocator).toBe(fan.sourceLocator);
      expect(fan.reasonId).not.toBe('unknown');
    }
  });
});
