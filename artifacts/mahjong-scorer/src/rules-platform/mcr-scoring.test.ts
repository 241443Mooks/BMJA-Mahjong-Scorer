import { describe, expect, it } from 'vitest';
import { compileMcr2006HandScorer, finalizeMcrZeroFanBranches, MCR_2006_SCORING_IDENTITIES, selectMcrHighestLawfulAlternative } from './mcr-scoring';
import { detectMcr2006Fans, MCR_2006_FAN_BINDINGS } from './mcr-detectors';
import { interactMcr2006NonCombination, MCR_2006_INTERACTION_POLICY_ID, MCR_2006_SOURCE_EXCLUSIONS } from './mcr-interaction';
import { currentPlayableProfiles, currentPlayableRegistry } from './current-profiles';
import { categoryForId } from './registry';
import type { McrScoringInput } from './mcr-scoring-input';
import type { ResolvedProfileArtifact } from './types';

const tile = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => ({ face: { family: 'suit' as const, suit, rank } });
const wind = (value: 'east' | 'south' | 'west' | 'north') => ({ face: { family: 'wind' as const, wind: value } });
const pung = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => [tile(suit, rank), tile(suit, rank), tile(suit, rank)];
const meldedPung = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => ({ kind: 'pung' as const, exposure: 'melded' as const, tiles: pung(suit, rank) });
const meldedKong = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => ({ kind: 'kong' as const, exposure: 'melded' as const, tiles: [tile(suit, rank), tile(suit, rank), tile(suit, rank), tile(suit, rank)] });
const chow = (suit: 'characters' | 'bamboo' | 'dots', start: number) => [tile(suit, start), tile(suit, start + 1), tile(suit, start + 2)];
const meldedChow = (suit: 'characters' | 'bamboo' | 'dots', start: number) => ({ kind: 'chow' as const, exposure: 'melded' as const, tiles: chow(suit, start) });
const meldedWindPung = (value: 'east' | 'south' | 'west' | 'north') => ({ kind: 'pung' as const, exposure: 'melded' as const, tiles: [wind(value), wind(value), wind(value)] });
const q001 = (): McrScoringInput => ({ evidence: { fixedGroups: [meldedPung('characters', 2), meldedPung('dots', 5), meldedPung('bamboo', 8)], freeTiles: [...pung('characters', 4), wind('west'), wind('west')], winningTile: tile('characters', 4), flowerCount: 2 }, context: { winSource: 'self-draw', resolvedWinEvent: 'none', lastVisibleCopy: false } });
const q002 = (): McrScoringInput => ({ evidence: { fixedGroups: [meldedKong('characters', 2), meldedPung('dots', 5), meldedPung('bamboo', 8)], freeTiles: [...pung('characters', 4), wind('west'), wind('west')], winningTile: tile('characters', 4), flowerCount: 2 }, context: { winSource: 'self-draw', resolvedWinEvent: 'none', lastVisibleCopy: false } });
const q003 = (): McrScoringInput => ({ evidence: { fixedGroups: [{ kind: 'chow', exposure: 'melded', tiles: [tile('characters', 1), tile('characters', 2), tile('characters', 3)] }], freeTiles: [tile('characters', 6), tile('characters', 7), tile('characters', 8), tile('dots', 3), tile('dots', 4), tile('dots', 5), tile('bamboo', 7), tile('bamboo', 8), tile('bamboo', 9), wind('west'), wind('west')], winningTile: tile('characters', 6), flowerCount: 0 }, context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false } });
const artifact = (): ResolvedProfileArtifact => {
  const identities = Object.values(MCR_2006_SCORING_IDENTITIES);
  return { profile: { schemaVersion: 1, identity: { id: 'mcr-scoring-proof', version: '0.0.1', status: 'provisional', familyId: 'family.mcr', grammar: 'pattern-accumulator' }, table: { playerCount: 4, seatModelId: 'seats.winds-4' }, tileSet: { presetId: 'tiles.flowers-144', options: {} }, handShape: { presetId: 'shape.four-sets-pair', options: {} }, validation: { handShapePolicyId: 'validation.mcr-winning-shape', policyIds: [] }, scoring: { grammar: 'pattern-accumulator', config: { configVersion: 1, unit: 'points', patternCatalogueId: identities[0]!.id, interactionPolicyId: identities[2]!.id, qualificationPolicyId: identities[4]!.id, interpretationPolicyId: identities[3]!.id, postQualificationBonusPolicyId: identities[5]!.id, conversionPolicyId: identities[6]!.id } }, evidence: { policyIds: [identities[1]!.id], alwaysRequired: [] }, settlement: { id: 'settlement.mcr-2006', params: {} }, progression: { id: 'progression.always-pass', params: {} }, gameEnd: { id: 'game-end.four-round-always-pass', params: {} }, provenance: {} }, rulesFingerprint: 'mcr-scoring-proof', executableDependencies: identities.map(({ id, semanticRevision }) => ({ id, semanticRevision })) } as ResolvedProfileArtifact;
};
const score = (input: McrScoringInput) => compileMcr2006HandScorer(artifact())(input);
const details = (result: ReturnType<ReturnType<typeof compileMcr2006HandScorer>>) => (result.result as unknown as { total: number; details: { candidatePatterns: readonly { bindingId?: string; id: string; value: number; sourceLocator?: string; interpretationId?: string }[]; countedPatterns: readonly { bindingId?: string; id: string; value: number; sourceLocator?: string; interpretationId?: string }[]; suppressedPatterns: readonly { bindingId?: string; id: string; reasonId: string; sourceLocator?: string }[]; selectedInterpretationId: string; qualifyingSubtotal: number; postQualificationBonus: number; provenance?: { kind: string; executableDependencies: readonly string[] } } }).details;
const candidateFans = (input: McrScoringInput) => detectMcr2006Fans(input).candidates.map(({ bindingId }) => bindingId).sort();
const fanIds = (items: readonly { bindingId?: string }[]) => items.map(({ bindingId }) => bindingId).sort();

const f001 = (): McrScoringInput => ({ evidence: { fixedGroups: [meldedChow('characters', 1)], freeTiles: [...chow('characters', 1), ...chow('characters', 1), ...chow('characters', 1), tile('characters', 4), tile('characters', 4)], winningTile: tile('characters', 4), flowerCount: 0 }, context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false } });
const f002 = (): McrScoringInput => ({ evidence: { fixedGroups: [meldedChow('characters', 1)], freeTiles: [...chow('characters', 1), ...chow('characters', 7), ...chow('characters', 7), tile('characters', 5), tile('characters', 5)], winningTile: tile('characters', 1), flowerCount: 0 }, context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false } });
const f003 = (): McrScoringInput => ({ evidence: { fixedGroups: [], freeTiles: [tile('characters', 1), tile('characters', 1), tile('characters', 2), tile('characters', 2), tile('dots', 3), tile('dots', 3), tile('dots', 4), tile('dots', 4), tile('bamboo', 5), tile('bamboo', 5), tile('bamboo', 6), tile('bamboo', 6), wind('east'), wind('east')], winningTile: wind('east'), flowerCount: 0 }, context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false } });
const f004 = (): McrScoringInput => ({ evidence: { fixedGroups: [meldedWindPung('east'), meldedWindPung('south'), meldedWindPung('west')], freeTiles: [wind('north'), wind('north'), wind('north'), { face: { family: 'dragon', dragon: 'red' } }, { face: { family: 'dragon', dragon: 'red' } }], winningTile: wind('north'), flowerCount: 0 }, context: { seatWind: 'east', prevailingWind: 'south', winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false } });
const f005 = (): McrScoringInput => ({ evidence: { fixedGroups: [meldedPung('characters', 1), meldedPung('dots', 1), meldedPung('bamboo', 9), meldedPung('characters', 9)], freeTiles: [tile('dots', 9), tile('dots', 9)], winningTile: tile('dots', 9), flowerCount: 0 }, context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false } });

describe('MCR A1c Pass 2 scoring closure', () => {
  it('MCR-F001 closes Quadruple Chow at 86 through the canonical scorer', () => {
    const result = score(f001()); const audit = details(result);
    expect(result.disposition).toEqual({ kind: 'scored' }); expect((result.result as { total: number }).total).toBe(86);
    expect(fanIds(audit.countedPatterns)).toEqual(['mcr2006.fan.all-chows', 'mcr2006.fan.full-flush', 'mcr2006.fan.lower-four', 'mcr2006.fan.quadruple-chow'].sort());
    for (const fan of ['pure-triple-chow', 'pure-double-chow', 'tile-hog', 'no-honors', 'one-voided-suit']) expect(fanIds(audit.countedPatterns)).not.toContain(`mcr2006.fan.${fan}`);
    for (const fan of ['pure-triple-chow', 'pure-double-chow', 'tile-hog']) expect(audit.suppressedPatterns.some(({ bindingId, reasonId }) => bindingId === `mcr2006.fan.${fan}` && reasonId.startsWith(`${MCR_2006_INTERACTION_POLICY_ID}.`))).toBe(true);
    expect(audit.selectedInterpretationId).toBeTruthy(); expect(audit.qualifyingSubtotal).toBe(86);
  });

  it('MCR-F002 closes Pure Terminal Chows at exactly 64 through the canonical scorer', () => {
    const result = score(f002()); const audit = details(result);
    expect(result.disposition).toEqual({ kind: 'scored' }); expect((result.result as { total: number }).total).toBe(64); expect(audit.qualifyingSubtotal).toBe(64);
    expect(fanIds(audit.countedPatterns)).toEqual(['mcr2006.fan.pure-terminal-chows']);
    for (const fan of ['seven-pairs', 'full-flush', 'all-chows', 'pure-double-chow', 'two-terminal-chows', 'no-honors', 'one-voided-suit']) expect(fanIds(audit.countedPatterns)).not.toContain(`mcr2006.fan.${fan}`);
    for (const fan of ['full-flush', 'all-chows', 'pure-double-chow', 'two-terminal-chows']) expect(audit.suppressedPatterns.some(({ bindingId }) => bindingId === `mcr2006.fan.${fan}`)).toBe(true);
  });

  it('MCR-F003 scores Seven Pairs on discard without Concealed Hand or Single Wait', () => {
    const input = f003(); const result = score(input); const audit = details(result);
    expect(result.disposition).toEqual({ kind: 'scored' }); expect((result.result as { total: number }).total).toBe(24);
    expect(fanIds(audit.countedPatterns)).toContain('mcr2006.fan.seven-pairs');
    expect(fanIds(audit.countedPatterns)).not.toContain('mcr2006.fan.concealed-hand'); expect(fanIds(audit.countedPatterns)).not.toContain('mcr2006.fan.single-wait');
  });

  it('MCR-F004 closes the corrected Big Four Winds fixture at 152 without suppressing unrelated fan', () => {
    const result = score(f004()); const audit = details(result);
    expect(result.disposition).toEqual({ kind: 'scored' }); expect((result.result as { total: number }).total).toBe(152); expect(audit.qualifyingSubtotal).toBe(152);
    expect(fanIds(audit.countedPatterns)).toEqual(['mcr2006.fan.all-honors', 'mcr2006.fan.big-four-winds'].sort());
    for (const fan of ['big-three-winds', 'all-pungs', 'prevalent-wind', 'seat-wind', 'pung-terminals-or-honors', 'all-terminals-and-honors']) expect(audit.suppressedPatterns.some(({ bindingId }) => bindingId === `mcr2006.fan.${fan}`)).toBe(true);
    expect(audit.suppressedPatterns.find(({ bindingId }) => bindingId === 'mcr2006.fan.all-terminals-and-honors')?.reasonId).toContain('non-repeat');
  });

  it('MCR-F005 retains both independently lawful Double Pung occurrences at 68', () => {
    const result = score(f005()); const audit = details(result); const doubles = audit.countedPatterns.filter(({ bindingId }) => bindingId === 'mcr2006.fan.double-pung');
    expect(result.disposition).toEqual({ kind: 'scored' }); expect((result.result as { total: number }).total).toBe(68); expect(audit.qualifyingSubtotal).toBe(68);
    expect(doubles).toHaveLength(2);
    expect(doubles.map(({ id }) => id)).toEqual([
      'mcr2006.fan.double-pung#ordinary:pair:dots:9,dots:9:free|pung:bamboo:9,bamboo:9,bamboo:9:melded|pung:characters:1,characters:1,characters:1:melded|pung:characters:9,characters:9,characters:9:melded|pung:dots:1,dots:1,dots:1:melded#fixed:pung:melded:bamboo:9,bamboo:9,bamboo:9:0+fixed:pung:melded:characters:9,characters:9,characters:9:0',
      'mcr2006.fan.double-pung#ordinary:pair:dots:9,dots:9:free|pung:bamboo:9,bamboo:9,bamboo:9:melded|pung:characters:1,characters:1,characters:1:melded|pung:characters:9,characters:9,characters:9:melded|pung:dots:1,dots:1,dots:1:melded#fixed:pung:melded:characters:1,characters:1,characters:1:0+fixed:pung:melded:dots:1,dots:1,dots:1:0',
    ]);
    expect(new Set(doubles.map(({ id }) => id)).size).toBe(2); expect(doubles.every(({ sourceLocator }) => sourceLocator?.includes('§3.8.1'))).toBe(true);
    expect(audit.countedPatterns.filter(({ bindingId }) => bindingId === 'mcr2006.fan.all-terminals')).toHaveLength(1);
  });

  it('MCR-F006 pins the formal source matrix separately from principle-derived reasons', () => {
    expect(MCR_2006_INTERACTION_POLICY_ID).toBe('interaction.mcr-2006-non-combination');
    expect(MCR_2006_SOURCE_EXCLUSIONS['quadruple-chow']).toContain('pure-shifted-pungs');
    expect(MCR_2006_SOURCE_EXCLUSIONS['four-pure-shifted-pungs']).toContain('pure-triple-chow');
    expect(MCR_2006_SOURCE_EXCLUSIONS['quadruple-chow']).not.toContain('pure-triple-chow');
    const provenance = details(score(q002())).provenance!;
    expect(provenance.executableDependencies).toContain('interaction.mcr-2006-non-combination@1');
    expect(provenance.executableDependencies).not.toContain('interaction.mcr-2006-non-combination-a0-proof@1');
  });

  it('scores corrected Q001 and Q002 before Flowers and keeps their exact fan sets', () => {
    const rejected = score(q001());
    expect(rejected.disposition).toMatchObject({ kind: 'not-qualifying', reasonId: 'qualification.mcr-8-before-flowers' });
    expect((rejected.result as { total: number }).total).toBe(0);
    expect(details(rejected)).toMatchObject({ qualifyingSubtotal: 7, postQualificationBonus: 0 });
    expect(rejected.decisionTrace.some(({ id }) => id === 'bonus:post-qualification')).toBe(false);
    expect(details(rejected).countedPatterns.map(({ id }) => id.split('#')[0]).sort()).toEqual(['mcr2006.fan.all-pungs', 'mcr2006.fan.self-drawn']);
    expect(candidateFans(q001())).not.toContain('mcr2006.fan.chicken-hand');

    const accepted = score(q002());
    expect(accepted.disposition).toEqual({ kind: 'scored' });
    expect((accepted.result as { total: number }).total).toBe(10);
    expect(details(accepted)).toMatchObject({ qualifyingSubtotal: 8, postQualificationBonus: 2 });
    expect(details(accepted).countedPatterns.map(({ bindingId }) => bindingId).sort()).toEqual(['mcr2006.fan.all-pungs', 'mcr2006.fan.melded-kong', 'mcr2006.fan.self-drawn']);
    expect(details(accepted).countedPatterns.every(({ sourceLocator }) => sourceLocator?.includes('§3.8.1'))).toBe(true);
    expect(accepted.decisionTrace.find(({ kind, identities }) => kind === 'count' && identities.bindingId === 'mcr2006.fan.all-pungs')).toMatchObject({ identities: { bindingId: 'mcr2006.fan.all-pungs' }, metadata: { sourceLocator: expect.stringContaining('§3.8.1') } });
  });

  it('finalizes the neutral Q003 zero-fan branch as Chicken Hand 8', () => {
    const input = q003();
    expect(candidateFans(input)).not.toContain('mcr2006.fan.chicken-hand');
    const result = score(input);
    expect(result.disposition).toEqual({ kind: 'scored' });
    expect((result.result as { total: number }).total).toBe(8);
    expect(details(result)).toMatchObject({ qualifyingSubtotal: 8, postQualificationBonus: 0 });
    const chickenBinding = MCR_2006_FAN_BINDINGS.find(({ id }) => id === 'mcr2006.fan.chicken-hand')!;
    expect(details(result).candidatePatterns.some(({ bindingId }) => bindingId === chickenBinding.id)).toBe(false);
    expect(details(result).countedPatterns).toEqual([{ id: expect.stringMatching(/^mcr2006\.fan\.chicken-hand#/), value: chickenBinding.value, bindingId: chickenBinding.id, sourceLocator: chickenBinding.sourceLocator }]);
    expect(result.decisionTrace.find(({ kind, identities }) => kind === 'count' && identities.bindingId === chickenBinding.id)).toMatchObject({ metadata: { sourceLocator: chickenBinding.sourceLocator } });
  });

  it('finalizes each lawful branch independently before highest-lawful selection', () => {
    const zeroAndFour = finalizeMcrZeroFanBranches({ alternatives: [
      { id: 'branch-a', counted: [], suppressed: [] },
      { id: 'branch-b', counted: [{ id: 'ordinary-four', value: 4, interpretationId: 'branch-b' }], suppressed: [] },
    ] });
    expect(zeroAndFour.alternatives[0]!.counted.map(({ bindingId, value }) => [bindingId, value])).toEqual([['mcr2006.fan.chicken-hand', 8]]);
    expect(zeroAndFour.alternatives[1]!.counted).toEqual([{ id: 'ordinary-four', value: 4, interpretationId: 'branch-b' }]);
    expect(selectMcrHighestLawfulAlternative(zeroAndFour)).toBe('branch-a');

    const allZero = finalizeMcrZeroFanBranches({ alternatives: [{ id: 'zero-a', counted: [], suppressed: [] }, { id: 'zero-b', counted: [], suppressed: [] }] });
    expect(allZero.alternatives.map(({ counted }) => counted.map(({ bindingId }) => bindingId))).toEqual([['mcr2006.fan.chicken-hand'], ['mcr2006.fan.chicken-hand']]);
    const suppressedToZero = finalizeMcrZeroFanBranches({ alternatives: [{ id: 'suppressed-zero', counted: [], suppressed: [{ candidate: { id: 'ordinary-suppressed', value: 2, interpretationId: 'suppressed-zero' }, reasonId: 'lawful-suppression' }] }] });
    expect(suppressedToZero.alternatives[0]!.counted[0]).toMatchObject({ bindingId: 'mcr2006.fan.chicken-hand', value: 8 });
    const ordinaryEight = finalizeMcrZeroFanBranches({ alternatives: [{ id: 'ordinary-eight', counted: [{ id: 'ordinary-eight-fan', value: 8, interpretationId: 'ordinary-eight' }], suppressed: [] }] });
    expect(ordinaryEight.alternatives[0]!.counted).toHaveLength(1);
    expect(finalizeMcrZeroFanBranches({ alternatives: [] }).alternatives).toEqual([]);
  });

  it('applies Chicken only to lawful zero, rejects no lawful branch, and preserves 1–7 and 8+ boundaries', () => {
    expect((score(q003()).result as { total: number }).total).toBe(8);
    const malformedShape = q003();
    const noInterpretation = { ...malformedShape, evidence: { ...malformedShape.evidence, freeTiles: malformedShape.evidence.freeTiles.map((item) => item.face.family === 'suit' && item.face.suit === 'dots' && item.face.rank === 3 ? { face: { family: 'dragon' as const, dragon: 'red' as const } } : item) } };
    expect(score(noInterpretation).disposition).toEqual({ kind: 'invalid', reasonId: 'pattern-accumulator.no-lawful-alternative' });
    const below = score(q001());
    expect(below.disposition.kind).toBe('not-qualifying');
    expect(details(below).countedPatterns.some(({ id }) => id.startsWith('mcr2006.fan.chicken-hand#'))).toBe(false);
    const above = score(q002());
    expect(above.disposition.kind).toBe('scored');
    expect(details(above).countedPatterns.some(({ id }) => id.startsWith('mcr2006.fan.chicken-hand#'))).toBe(false);
  });

  it('MCR-E001 counts Last Tile Draw and suppresses Self-Drawn with source audit', () => {
    const input = q003(); input.context.winSource = 'self-draw'; input.context.resolvedWinEvent = 'last-wall-draw';
    const result = score(input);
    expect((result.result as { total: number }).total).toBe(8);
    expect(details(result).countedPatterns.map(({ id }) => id.split('#')[0])).toEqual(['mcr2006.fan.last-tile-draw']);
    expect(details(result).suppressedPatterns).toContainEqual(expect.objectContaining({ id: expect.stringContaining('mcr2006.fan.self-drawn'), reasonId: expect.stringContaining('last-tile-draw-excludes-self-drawn') }));
  });

  it('MCR-E005 changes only visible-copy evidence and adds exactly four points', () => {
    const knownFalse = q002(); knownFalse.evidence.flowerCount = 0;
    const knownTrue: McrScoringInput = { evidence: { ...knownFalse.evidence }, context: { ...knownFalse.context, lastVisibleCopy: true } };
    const before = score(knownFalse); const after = score(knownTrue);
    expect(details(before).countedPatterns.some(({ bindingId }) => bindingId === 'mcr2006.fan.last-tile')).toBe(false);
    expect(details(after).countedPatterns).toContainEqual(expect.objectContaining({ bindingId: 'mcr2006.fan.last-tile', value: 4 }));
    expect((after.result as { total: number }).total - (before.result as { total: number }).total).toBe(4);
  });

  it('MCR-X001 fails closed on unknown material evidence and malformed event context', () => {
    const unknown = q002(); delete unknown.context.lastVisibleCopy;
    const missing = score(unknown);
    expect(missing.disposition).toMatchObject({ kind: 'needs-evidence' });
    expect((missing.disposition as { missingEvidenceIds?: readonly string[] }).missingEvidenceIds).toContain('evidence.last-visible-copy');
    const knownFalse = q002(); knownFalse.context.lastVisibleCopy = false;
    expect(score(knownFalse).disposition.kind).not.toBe('needs-evidence'); expect(details(score(knownFalse)).candidatePatterns.some(({ bindingId }) => bindingId === 'mcr2006.fan.last-tile')).toBe(false);
    const malformed = q002(); (malformed.context as unknown as { resolvedWinEvent: string }).resolvedWinEvent = 'mystery';
    expect(score(malformed).disposition).toEqual({ kind: 'invalid', reasonId: 'mcr.context.invalid-win-event' });
    const contradictory = q002(); contradictory.context.resolvedWinEvent = 'rob-kong';
    expect(score(contradictory).disposition).toEqual({ kind: 'invalid', reasonId: 'mcr.context.contradictory-win-event' });
    const materialWind = f004(); delete materialWind.context.seatWind; delete materialWind.context.prevailingWind;
    expect(score(materialWind).disposition).toMatchObject({ kind: 'needs-evidence', missingEvidenceIds: expect.arrayContaining(['evidence.seat-wind', 'evidence.round-wind']) });
    const irrelevantWind = q003();
    expect(score(irrelevantWind).disposition.kind).not.toBe('needs-evidence');
    const unresolvedEvent = q002(); delete (unresolvedEvent.context as Partial<McrScoringInput['context']>).resolvedWinEvent;
    expect(score(unresolvedEvent).disposition).toEqual({ kind: 'invalid', reasonId: 'mcr.context.invalid-win-event' });
  });

  it('MCR-X002 through X004 keep scoring evidence-owned and independent of table procedures', () => {
    const input = q003();
    const result = score(input); expect(result.disposition).toEqual({ kind: 'scored' });
    expect(details(result).countedPatterns.some(({ bindingId }) => bindingId?.includes('penalty'))).toBe(false);
    const forged = { ...input, fanNames: ['Big Four Winds'], candidatePatterns: [{ bindingId: 'mcr2006.fan.big-four-winds', value: 88 }] } as unknown as McrScoringInput;
    expect((score(forged).result as { total: number }).total).toBe((result.result as { total: number }).total);
    expect(details(score(forged)).countedPatterns.some(({ bindingId }) => bindingId === 'mcr2006.fan.big-four-winds')).toBe(false);
    expect(input.context).not.toHaveProperty('wallPosition'); expect(input.context).not.toHaveProperty('claimTimestamps');
    expect(input.context).not.toHaveProperty('discardHistory'); expect(input.context).not.toHaveProperty('announcementHistory'); expect(input.context).not.toHaveProperty('umpireLogs');
  });

  it('MCR-E006 retains detector-backed waits and competing-completion rejection through the final scorer', () => {
    const fixed = [
      { kind: 'chow' as const, exposure: 'melded' as const, tiles: [tile('dots', 1), tile('dots', 2), tile('dots', 3)] },
      meldedPung('bamboo', 5), meldedWindPung('east'),
    ];
    const mkWait = (freeTiles: McrScoringInput['evidence']['freeTiles'], winningTile: McrScoringInput['evidence']['winningTile']): McrScoringInput => ({ evidence: { fixedGroups: fixed, freeTiles, winningTile, flowerCount: 0 }, context: { seatWind: 'east', prevailingWind: 'south', winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false } });
    const cases = [
      ['edge-wait', mkWait([tile('characters', 1), tile('characters', 2), tile('characters', 3), tile('dots', 7), tile('dots', 7)], tile('characters', 3))],
      ['closed-wait', mkWait([tile('characters', 2), tile('characters', 3), tile('characters', 4), tile('dots', 7), tile('dots', 7)], tile('characters', 3))],
      ['single-wait', { evidence: { fixedGroups: [meldedChow('characters', 1), meldedChow('dots', 4), meldedChow('bamboo', 7), meldedWindPung('east')], freeTiles: [tile('dots', 7), tile('dots', 7)], winningTile: tile('dots', 7), flowerCount: 0 }, context: { seatWind: 'east' as const, prevailingWind: 'south' as const, winSource: 'discard' as const, resolvedWinEvent: 'none' as const, lastVisibleCopy: false } }],
    ] as const;
    for (const [fan, input] of cases) {
      const result = score(input); expect(result.disposition).not.toMatchObject({ kind: 'invalid' }); const audit = details(result); const candidate = audit.candidatePatterns.find(({ bindingId }) => bindingId === `mcr2006.fan.${fan}`)!;
      expect(candidate).toMatchObject({ bindingId: `mcr2006.fan.${fan}`, sourceLocator: expect.stringContaining('§3.8.1') });
      expect(audit.selectedInterpretationId).toBe(candidate.id.split('#')[1]);
      const counted = audit.countedPatterns.find(({ id }) => id === candidate.id);
      const suppressed = audit.suppressedPatterns.find(({ id }) => id === candidate.id);
      if (counted) expect(counted).toMatchObject({ bindingId: candidate.bindingId, sourceLocator: candidate.sourceLocator });
      else expect(suppressed).toMatchObject({ bindingId: candidate.bindingId, sourceLocator: candidate.sourceLocator, reasonId: `${MCR_2006_INTERACTION_POLICY_ID}.source-melded-hand-excludes-single-wait` });
      expect(audit.qualifyingSubtotal).toBeGreaterThanOrEqual(counted ? candidate.value : 0);
    }
    const competing = mkWait([tile('characters', 1), tile('characters', 2), tile('characters', 3), tile('dots', 7), tile('dots', 7)], tile('characters', 1));
    const negative = score(competing); const negativeAudit = details(negative);
    expect(negativeAudit.candidatePatterns.some(({ bindingId }) => ['mcr2006.fan.edge-wait', 'mcr2006.fan.closed-wait', 'mcr2006.fan.single-wait'].includes(bindingId ?? ''))).toBe(false);
    expect(negativeAudit.countedPatterns.some(({ bindingId }) => ['mcr2006.fan.edge-wait', 'mcr2006.fan.closed-wait', 'mcr2006.fan.single-wait'].includes(bindingId ?? ''))).toBe(false);
  });

  it('MCR-E002/E003/E004 closes Flower replacement, Kong replacement, and Robbing Kong through the scorer', () => {
    const replacement = q003(); replacement.context.winSource = 'self-draw'; replacement.context.resolvedWinEvent = 'kong-replacement';
    const kongResult = score(replacement);
    expect(details(kongResult).countedPatterns.map(({ bindingId }) => bindingId)).toEqual(['mcr2006.fan.out-with-replacement-tile']);
    expect(details(kongResult).suppressedPatterns).toContainEqual(expect.objectContaining({ bindingId: 'mcr2006.fan.self-drawn', sourceLocator: expect.stringContaining('§3.8.1'), reasonId: expect.stringContaining('non-repeat-out-with-replacement-tile-implies-self-drawn') }));
    expect(kongResult.decisionTrace.find(({ kind, identities }) => kind === 'suppress' && identities.bindingId === 'mcr2006.fan.self-drawn')).toMatchObject({ identities: { bindingId: 'mcr2006.fan.self-drawn' }, metadata: { sourceLocator: expect.stringContaining('§3.8.1') } });

    const flower = q003(); flower.context.winSource = 'self-draw'; flower.context.resolvedWinEvent = 'flower-replacement';
    const flowerResult = score(flower);
    expect(details(flowerResult).countedPatterns.map(({ bindingId }) => bindingId)).toContain('mcr2006.fan.self-drawn');
    expect(details(flowerResult).candidatePatterns.some(({ bindingId }) => bindingId === 'mcr2006.fan.out-with-replacement-tile')).toBe(false);

    const rob = q003(); rob.context.winSource = 'discard'; rob.context.resolvedWinEvent = 'rob-kong'; rob.context.lastVisibleCopy = true;
    const robResult = score(rob);
    expect(details(robResult).countedPatterns.map(({ bindingId }) => bindingId)).toContain('mcr2006.fan.robbing-the-kong');
    expect(details(robResult).suppressedPatterns).toContainEqual(expect.objectContaining({ bindingId: 'mcr2006.fan.last-tile', reasonId: expect.stringContaining('robbing-the-kong-excludes-last-tile') }));
  });

  it('selects the real highest lawful decomposition and resolves equal totals deterministically', () => {
    const ambiguous: McrScoringInput = { evidence: { fixedGroups: [], freeTiles: [...pung('characters', 1), ...pung('characters', 2), ...pung('characters', 3), ...pung('characters', 4), tile('characters', 5), tile('characters', 5)], winningTile: tile('characters', 5), flowerCount: 0 }, context: { winSource: 'self-draw', resolvedWinEvent: 'none', lastVisibleCopy: false } };
    const detected = detectMcr2006Fans(ambiguous);
    const alternatives = interactMcr2006NonCombination(detected.candidates, ambiguous).alternatives;
    expect(alternatives.every((branch) => branch.counted.some(({ bindingId }) => bindingId === 'mcr2006.fan.self-drawn') || branch.suppressed.some(({ candidate }) => candidate.bindingId === 'mcr2006.fan.self-drawn'))).toBe(true);
    const totals = alternatives.map((branch) => ({ id: branch.id, total: branch.counted.reduce((sum, item) => sum + item.value, 0) }));
    expect(totals.length).toBeGreaterThan(1);
    const maximum = Math.max(...totals.map(({ total }) => total));
    const tied = totals.filter(({ total }) => total === maximum).map(({ id }) => id).sort();
    const result = score(ambiguous);
    expect(details(result).selectedInterpretationId).toBe(tied[0]);
    expect(details(result).qualifyingSubtotal).toBe(maximum);
    const selectedOrdinary = alternatives.find(({ id }) => id === details(result).selectedInterpretationId)!;
    expect(details(result).suppressedPatterns.map(({ id, reasonId }) => [id, reasonId])).toEqual(selectedOrdinary.suppressed.map(({ candidate, reasonId }) => [candidate.id, reasonId]));
    expect(tied.length).toBeGreaterThan(0);
    expect(result.decisionTrace.filter((entry) => entry.kind === 'suppress').every((entry) => entry.identities.reasonId?.startsWith('interaction.mcr-2006-non-combination.'))).toBe(true);
    expect(result.decisionTrace.filter((entry) => entry.kind === 'suppress').map(({ id }) => id).sort()).toEqual(details(result).suppressedPatterns.map(({ id }) => `suppressed:${id}`).sort());
    expect(result.decisionTrace.filter((entry) => entry.kind === 'count').map(({ id }) => id).sort()).toEqual(details(result).countedPatterns.map(({ id }) => `counted:${id}`).sort());
    expect(selectMcrHighestLawfulAlternative({ alternatives: [
      { id: 'ordinary:z', counted: [{ id: 'z', value: 8, interpretationId: 'ordinary:z' }], suppressed: [] },
      { id: 'ordinary:a', counted: [{ id: 'a', value: 8, interpretationId: 'ordinary:a' }], suppressed: [] },
    ] })).toBe('ordinary:a');
  });

  it('dispatches canonical @1 identities, preserves source metadata, and never returns proof identities', () => {
    const result = score(q002()); const audit = details(result);
    expect(audit.provenance).toMatchObject({ kind: 'mcr-2006-scoring', executableDependencies: expect.arrayContaining(Object.values(MCR_2006_SCORING_IDENTITIES).map(({ id }) => `${id}@1`)) });
    expect(audit.provenance!.executableDependencies.some((id) => id.includes('a0-proof'))).toBe(false);
    expect(audit.candidatePatterns.every(({ id }) => !id.includes('a0-proof'))).toBe(true);
    expect(audit.candidatePatterns.find(({ bindingId }) => bindingId === 'mcr2006.fan.all-pungs')).toMatchObject({ bindingId: 'mcr2006.fan.all-pungs', id: expect.stringContaining('mcr2006.fan.all-pungs#'), sourceLocator: expect.stringContaining('§3.8.1') });
    expect(MCR_2006_SCORING_IDENTITIES.interpretation).toEqual({ id: 'interpretation.max-lawful-profile', semanticRevision: 1 });
    expect(Object.values(MCR_2006_SCORING_IDENTITIES).every(({ id, semanticRevision }) => currentPlayableRegistry.get(categoryForId(id), id).status === 'executable' && currentPlayableRegistry.get(categoryForId(id), id).semanticRevision === semanticRevision)).toBe(true);
    expect(currentPlayableProfiles.some(({ identity }) => identity.id === 'mcr-wmo-2006')).toBe(false);
    const bad = artifact(); bad.executableDependencies = bad.executableDependencies.map((item) => item.id === 'interpretation.max-lawful-profile' ? { ...item, semanticRevision: 2 } : item);
    expect(() => compileMcr2006HandScorer(bad)).toThrow('IMPLEMENTATION_UNAVAILABLE');
  });
});
