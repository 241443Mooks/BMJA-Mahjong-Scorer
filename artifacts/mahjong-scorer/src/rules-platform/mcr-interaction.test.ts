import { describe, expect, it } from 'vitest';
import { detectMcr2006Fans } from './mcr-detectors';
import { interactMcr2006NonCombination, MCR_2006_INTERACTION_POLICY_ID, MCR_2006_SOURCE_EXCLUSIONS } from './mcr-interaction';
import type { McrScoringInput } from './mcr-scoring-input';
import type { PatternAccumulatorCandidate } from './pattern-accumulator-runtime';

const tile = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => ({ face: { family: 'suit' as const, suit, rank } });
const wind = (value: 'east' | 'south' | 'west' | 'north') => ({ face: { family: 'wind' as const, wind: value } });
const dragon = (value: 'red' | 'green' | 'white') => ({ face: { family: 'dragon' as const, dragon: value } });
const chow = (suit: 'characters' | 'bamboo' | 'dots', start: number) => [tile(suit, start), tile(suit, start + 1), tile(suit, start + 2)];
const pung = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => [tile(suit, rank), tile(suit, rank), tile(suit, rank)];
const meldedChow = (suit: 'characters' | 'bamboo' | 'dots', start: number) => ({ kind: 'chow' as const, exposure: 'melded' as const, tiles: chow(suit, start) });
const meldedPung = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => ({ kind: 'pung' as const, exposure: 'melded' as const, tiles: pung(suit, rank) });
const kong = (suit: 'characters' | 'bamboo' | 'dots', rank: number, exposure: 'concealed' | 'melded') => ({ kind: 'kong' as const, exposure, tiles: [tile(suit, rank), tile(suit, rank), tile(suit, rank), tile(suit, rank)] });
const ordinary = (freeTiles: McrScoringInput['evidence']['freeTiles'], winningTile = freeTiles[freeTiles.length - 1]!): McrScoringInput => ({ evidence: { fixedGroups: [], freeTiles, winningTile, flowerCount: 0 }, context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false } });
const withFixed = (fixedGroups: McrScoringInput['evidence']['fixedGroups'], freeTiles: McrScoringInput['evidence']['freeTiles'], winningTile = freeTiles[freeTiles.length - 1]!): McrScoringInput => ({ evidence: { fixedGroups, freeTiles, winningTile, flowerCount: 0 }, context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false } });
const result = (input: McrScoringInput, candidates = detectMcr2006Fans(input).candidates) => interactMcr2006NonCombination(candidates, input);
const counted = (input: McrScoringInput, candidates?: readonly PatternAccumulatorCandidate[]) => result(input, candidates).alternatives.map((alternative) => ({ id: alternative.id, fans: alternative.counted.map((candidate) => candidate.bindingId), suppressed: alternative.suppressed.map((item) => ({ fan: item.candidate.bindingId, reason: item.reasonId })) }));
const one = (input: McrScoringInput, candidates?: readonly PatternAccumulatorCandidate[]) => { const alternatives = result(input, candidates).alternatives; expect(alternatives).toHaveLength(1); return alternatives[0]!; };
const containing = (input: McrScoringInput, fan: string, candidates?: readonly PatternAccumulatorCandidate[]) => result(input, candidates).alternatives.find((alternative) => alternative.counted.some((candidate) => candidate.bindingId === `mcr2006.fan.${fan}`))!;

describe('interaction.mcr-2006-non-combination', () => {
  it('MCR-F001 Non-Repeat: keeps the source combination and removes implied lower Chow/composition facts', () => {
    const input = withFixed([meldedChow('characters', 1)], [...chow('characters', 1), ...chow('characters', 1), ...chow('characters', 1), tile('characters', 4), tile('characters', 4)]);
    const alternative = containing(input, 'quadruple-chow');
    expect(alternative.counted.reduce((sum, candidate) => sum + candidate.value, 0)).toBe(86);
    expect(alternative.counted.map((candidate) => candidate.bindingId)).toEqual(expect.arrayContaining(['mcr2006.fan.quadruple-chow', 'mcr2006.fan.full-flush', 'mcr2006.fan.lower-four', 'mcr2006.fan.all-chows']));
    expect(alternative.suppressed.map((item) => item.candidate.bindingId)).toEqual(expect.arrayContaining(['mcr2006.fan.pure-triple-chow', 'mcr2006.fan.pure-double-chow', 'mcr2006.fan.tile-hog', 'mcr2006.fan.no-honors']));
  });

  it('MCR-F002 preserves Pure Terminal Chows as the only source-owned interaction result', () => {
    const input = withFixed([meldedChow('characters', 1)], [...chow('characters', 1), ...chow('characters', 7), ...chow('characters', 7), tile('characters', 5), tile('characters', 5)], tile('characters', 1));
    const alternative = containing(input, 'pure-terminal-chows');
    expect(alternative.counted.map((candidate) => candidate.bindingId)).toEqual(['mcr2006.fan.pure-terminal-chows']);
    expect(alternative.suppressed.map((item) => item.candidate.bindingId)).toEqual(expect.arrayContaining(['mcr2006.fan.full-flush', 'mcr2006.fan.all-chows', 'mcr2006.fan.pure-double-chow', 'mcr2006.fan.two-terminal-chows', 'mcr2006.fan.no-honors']));
  });

  it('MCR-F003 owns Seven Pairs only on its actual interpretation', () => {
    const input = ordinary([tile('characters', 1), tile('characters', 1), tile('characters', 2), tile('characters', 2), tile('dots', 3), tile('dots', 3), tile('dots', 4), tile('dots', 4), tile('bamboo', 5), tile('bamboo', 5), tile('bamboo', 6), tile('bamboo', 6), wind('east'), wind('east')]);
    const alternatives = counted(input);
    const sevenPairs = alternatives.find((alternative) => alternative.id === 'seven-pairs')!;
    expect(sevenPairs.fans).toContain('mcr2006.fan.seven-pairs');
    expect(sevenPairs.suppressed.map((item) => item.fan)).toContain('mcr2006.fan.concealed-hand');
    expect(sevenPairs.fans).not.toContain('mcr2006.fan.single-wait');
    for (const alternative of alternatives.filter((alternative) => alternative.id !== 'seven-pairs')) expect(alternative.fans).not.toContain('mcr2006.fan.seven-pairs');
  });

  it('MCR-F004 applies the Wind hierarchy but leaves All Honors', () => {
    const input = ordinary([...['east', 'south', 'west', 'north'].flatMap((value) => [wind(value as 'east' | 'south' | 'west' | 'north'), wind(value as 'east' | 'south' | 'west' | 'north'), wind(value as 'east' | 'south' | 'west' | 'north')]), dragon('red'), dragon('red')]);
    input.context.seatWind = 'east'; input.context.prevailingWind = 'south';
    const alternative = one(input);
    expect(alternative.counted.map((candidate) => candidate.bindingId)).toEqual(expect.arrayContaining(['mcr2006.fan.big-four-winds', 'mcr2006.fan.all-honors']));
    expect(alternative.suppressed.map((item) => item.candidate.bindingId)).toEqual(expect.arrayContaining(['mcr2006.fan.big-three-winds', 'mcr2006.fan.all-pungs', 'mcr2006.fan.prevalent-wind', 'mcr2006.fan.seat-wind', 'mcr2006.fan.pung-terminals-or-honors']));
  });

  it('MCR-F005 Account-Once keeps distinct Double Pung relationships', () => {
    const input = withFixed([meldedPung('characters', 1), meldedPung('dots', 1), meldedPung('characters', 9)], [...pung('bamboo', 9), tile('dots', 9), tile('dots', 9)]);
    const alternative = one(input);
    expect(alternative.counted.reduce((sum, candidate) => sum + candidate.value, 0)).toBe(68);
    expect(alternative.counted.filter((candidate) => candidate.bindingId === 'mcr2006.fan.double-pung')).toHaveLength(2);
  });

  it('keeps a source-independent concealed-Pung fan with All Terminals when the exposure supports it', () => {
    const input = ordinary([...pung('characters', 1), ...pung('dots', 1), ...pung('characters', 9), ...pung('bamboo', 9), tile('dots', 9), tile('dots', 9)]);
    const alternative = one(input);
    expect(alternative.counted.map((candidate) => candidate.bindingId)).toEqual(expect.arrayContaining(['mcr2006.fan.all-terminals', 'mcr2006.fan.four-concealed-pungs']));
    expect(alternative.suppressed.map((item) => item.candidate.bindingId)).not.toContain('mcr2006.fan.four-concealed-pungs');
  });

  it('MCR-F006 keeps the formal surprising source exclusions, with general Non-Repeat separately auditable', () => {
    const input = ordinary([...chow('characters', 1), ...chow('characters', 1), ...chow('characters', 1), ...chow('characters', 1), tile('characters', 4), tile('characters', 4)]);
    const detected = detectMcr2006Fans(input); const iid = detected.interpretations[0]!.id;
    const injected: PatternAccumulatorCandidate[] = [...detected.candidates, { id: 'mcr2006.fan.pure-shifted-pungs#' + iid + '#free:set:0:characters:1+free:set:1:characters:2+free:set:2:characters:3', bindingId: 'mcr2006.fan.pure-shifted-pungs', value: 24, interpretationId: iid }];
    const alternative = containing(input, 'quadruple-chow', injected);
    expect(alternative.suppressed.find((item) => item.candidate.bindingId === 'mcr2006.fan.pure-shifted-pungs')?.reasonId).toBe(`${MCR_2006_INTERACTION_POLICY_ID}.source-quadruple-chow-excludes-pure-shifted-pungs`);
  });

  it('Non-Repeat suppresses Double Pung mechanically included by Triple Pung', () => {
    const input = ordinary([...pung('characters', 3), ...pung('bamboo', 3), ...pung('dots', 3), ...chow('characters', 4), tile('dots', 7), tile('dots', 7)]);
    const alternative = one(input);
    expect(alternative.counted.filter((candidate) => candidate.bindingId === 'mcr2006.fan.double-pung')).toHaveLength(0);
    expect(alternative.suppressed.some((item) => item.reasonId.includes('non-repeat-triple-pung-implies-double-pung'))).toBe(true);
  });

  it('Non-Identical rejects a second same-fan relationship reusing a structural element', () => {
    const input = ordinary([...chow('characters', 1), ...chow('dots', 4), ...chow('bamboo', 7), ...chow('characters', 6), tile('dots', 5), tile('dots', 5)]); const iid = detectMcr2006Fans(input).interpretations[0]!.id;
    const candidate = (id: string, elements: string): PatternAccumulatorCandidate => ({ id: `mcr2006.fan.double-pung#${iid}#${elements}`, bindingId: 'mcr2006.fan.double-pung', value: 2, interpretationId: iid });
    const alternative = one(input, [candidate('first', 'fixed:a+fixed:b'), candidate('second', 'fixed:b+fixed:c')]);
    expect(alternative.counted).toHaveLength(1); expect(alternative.suppressed[0]?.reasonId).toContain('non-identical-double-pung-occurrence-reuse');
  });

  it('High-versus-Low chooses the higher mutually exclusive cross-binding use of the same elements', () => {
    const input = ordinary([...chow('characters', 1), ...chow('dots', 4), ...chow('bamboo', 7), ...chow('characters', 6), tile('dots', 5), tile('dots', 5)]); const iid = detectMcr2006Fans(input).interpretations[0]!.id;
    const candidate = (fan: string, value: number): PatternAccumulatorCandidate => ({ id: `mcr2006.fan.${fan}#${iid}#fixed:a+fixed:b+fixed:c`, bindingId: `mcr2006.fan.${fan}`, value, interpretationId: iid });
    const alternative = one(input, [candidate('pure-straight', 16), candidate('mixed-straight', 8)]);
    expect(alternative.counted.map((item) => item.bindingId)).toEqual(['mcr2006.fan.pure-straight']); expect(alternative.suppressed[0]?.reasonId).toContain('high-versus-low-pure-straight-over-mixed-straight');
  });

  it('Non-Separation rejects a cross-binding regrouping that reuses two physical sets', () => {
    const input = ordinary([...chow('characters', 1), ...chow('dots', 4), ...chow('bamboo', 7), ...chow('characters', 6), tile('dots', 5), tile('dots', 5)]); const iid = detectMcr2006Fans(input).interpretations[0]!.id;
    const candidate = (fan: string, value: number, elements: string): PatternAccumulatorCandidate => ({ id: `mcr2006.fan.${fan}#${iid}#${elements}`, bindingId: `mcr2006.fan.${fan}`, value, interpretationId: iid });
    const alternative = one(input, [candidate('pure-straight', 16, 'fixed:a+fixed:b+fixed:c'), candidate('mixed-straight', 8, 'fixed:b+fixed:c+fixed:d')]);
    expect(alternative.counted).toHaveLength(1); expect(alternative.suppressed[0]?.reasonId).toContain('non-separation-mixed-straight-structural-regrouping');
  });

  it('Account-Once permits one cross-binding reuse but rejects a third use of that element', () => {
    const input = ordinary([...chow('characters', 1), ...chow('dots', 4), ...chow('bamboo', 7), ...chow('characters', 6), tile('dots', 5), tile('dots', 5)]); const iid = detectMcr2006Fans(input).interpretations[0]!.id;
    const candidate = (fan: string, value: number, elements: string): PatternAccumulatorCandidate => ({ id: `mcr2006.fan.${fan}#${iid}#${elements}`, bindingId: `mcr2006.fan.${fan}`, value, interpretationId: iid });
    const alternative = one(input, [candidate('pure-straight', 16, 'fixed:a+fixed:b'), candidate('mixed-straight', 8, 'fixed:b+fixed:c'), candidate('pure-shifted-chows', 6, 'fixed:b+fixed:d')]);
    expect(alternative.counted.map((item) => item.bindingId)).toEqual(['mcr2006.fan.mixed-straight', 'mcr2006.fan.pure-straight']); expect(alternative.suppressed[0]?.reasonId).toContain('account-once-pure-shifted-chows-element-reused-twice');
  });

  it('source event, wait, and composition exclusions retain policy-owned reasons', () => {
    const input = ordinary([...chow('characters', 1), ...chow('dots', 4), ...chow('bamboo', 7), ...chow('characters', 6), tile('dots', 5), tile('dots', 5)]);
    const iid = detectMcr2006Fans(input).interpretations[0]!.id;
    const candidate = (fan: string, value: number, interpretationId = iid): PatternAccumulatorCandidate => ({ id: `mcr2006.fan.${fan}#${interpretationId}#test:${fan}`, bindingId: `mcr2006.fan.${fan}`, value, interpretationId });
    const supplied = ['last-tile-draw', 'self-drawn', 'robbing-the-kong', 'last-tile', 'melded-hand', 'single-wait', 'all-chows', 'no-honors'].map((fan) => candidate(fan, fan.includes('last') || fan === 'robbing-the-kong' ? 8 : fan === 'melded-hand' ? 6 : fan === 'all-chows' ? 2 : 1, fan.includes('last') || fan === 'self-drawn' ? 'context' : iid));
    const alternative = one(input, supplied);
    expect(alternative.suppressed.every((item) => item.reasonId.startsWith(`${MCR_2006_INTERACTION_POLICY_ID}.`))).toBe(true);
    expect(alternative.suppressed.map((item) => item.candidate.bindingId)).toEqual(expect.arrayContaining(['mcr2006.fan.self-drawn', 'mcr2006.fan.last-tile', 'mcr2006.fan.single-wait', 'mcr2006.fan.no-honors']));
  });

  it('is deterministic under candidate reordering and keeps branch suppressions branch-local', () => {
    const input = ordinary([...chow('characters', 1), ...chow('characters', 1), ...chow('characters', 1), ...chow('characters', 1), tile('characters', 4), tile('characters', 4)]);
    const detected = detectMcr2006Fans(input).candidates;
    expect(result(input, detected)).toEqual(result(input, [...detected].reverse()));
    expect(result(input, detected).alternatives.every((alternative) => alternative.suppressed.every((item) => item.candidate.interpretationId === alternative.id || item.candidate.interpretationId === 'hand' || item.candidate.interpretationId === 'context'))).toBe(true);
  });

  it('covers the explicit source table, including its formal fan 14/15 wording', () => {
    expect(MCR_2006_SOURCE_EXCLUSIONS).toEqual({
      'big-four-winds': ['big-three-winds', 'all-pungs', 'prevalent-wind', 'seat-wind', 'pung-terminals-or-honors'], 'big-three-dragons': ['two-dragon-pungs', 'dragon-pung'], 'nine-gates': ['full-flush', 'concealed-hand', 'pung-terminals-or-honors'], 'four-kongs': ['single-wait'],
      'seven-shifted-pairs': ['full-flush', 'concealed-hand', 'single-wait'], 'thirteen-orphans': ['all-types', 'concealed-hand', 'single-wait'], 'all-terminals': ['all-pungs', 'outside-hand', 'pung-terminals-or-honors', 'no-honors'], 'little-four-winds': ['big-three-winds', 'pung-terminals-or-honors'], 'little-three-dragons': ['dragon-pung', 'two-dragon-pungs'],
      'all-honors': ['all-pungs', 'outside-hand', 'pung-terminals-or-honors'], 'four-concealed-pungs': ['all-pungs', 'concealed-hand'], 'pure-terminal-chows': ['seven-pairs', 'full-flush', 'all-chows', 'pure-double-chow', 'two-terminal-chows', 'no-honors', 'one-voided-suit'], 'all-terminals-and-honors': ['all-pungs', 'pung-terminals-or-honors'],
      'seven-pairs': ['concealed-hand', 'single-wait'], 'greater-honors-knitted': ['all-types', 'concealed-hand'], 'all-even-pungs': ['all-pungs', 'all-simples'], 'full-flush': ['no-honors', 'one-voided-suit'], 'pure-triple-chow': ['pure-double-chow'], 'upper-tiles': ['no-honors'], 'middle-tiles': ['no-honors', 'all-simples'], 'lower-tiles': ['no-honors'],
      'three-suited-terminal-chows': ['pure-double-chow', 'two-terminal-chows', 'no-honors', 'all-chows'], 'all-fives': ['all-simples'], 'lesser-honors-knitted': ['all-types', 'concealed-hand'], 'upper-four': ['no-honors'], 'lower-four': ['no-honors'], 'reversible-tiles': ['one-voided-suit'], 'last-tile-draw': ['self-drawn'], 'robbing-the-kong': ['last-tile'], 'melded-hand': ['single-wait'], 'all-chows': ['no-honors'],
      'quadruple-chow': ['pure-shifted-pungs'], 'four-pure-shifted-pungs': ['pure-triple-chow'],
    });
  });

  it('preserves M/M, M/C, and C/C Kong arithmetic without an invented binding', () => {
    const input = (first: 'concealed' | 'melded', second: 'concealed' | 'melded'): McrScoringInput => ({ evidence: { fixedGroups: [kong('characters', 1, first), kong('dots', 2, second)], freeTiles: [...chow('bamboo', 3), ...pung('characters', 5), tile('dots', 7), tile('dots', 7)], winningTile: tile('dots', 7), flowerCount: 0 }, context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false } });
    const score = (value: McrScoringInput) => { const candidates = detectMcr2006Fans(value).candidates.filter((candidate) => ['mcr2006.fan.two-melded-kongs', 'mcr2006.fan.two-concealed-kongs', 'mcr2006.fan.melded-kong', 'mcr2006.fan.concealed-kong'].includes(candidate.bindingId!)); return one(value, candidates).counted.reduce((sum, candidate) => sum + candidate.value, 0); };
    expect(score(input('melded', 'melded'))).toBe(4); expect(score(input('melded', 'concealed'))).toBe(6); expect(score(input('concealed', 'concealed'))).toBe(8);
  });
});
