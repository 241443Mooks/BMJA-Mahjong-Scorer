import { beforeAll, describe, expect, it } from 'vitest';
import { dragon, set, suited, wind, type HandSet, type PlayingTile } from '../scoring';
import { BMJA_PROFILE_REF } from '../game/ruleset';
import { WESTERN_TM_PROFILE_REF } from '../game/western-tm-catalogue';
import { OUTSIDE_THE_BOX_PROFILE_REF } from '../game/outside-the-box-catalogue';
import { BUZZARD_2000_PROFILE_REF } from '../game/buzzard-2000';
import { MCR_WMO_2006_PROFILE } from './mcr-profile';
import { initialiseCurrentRulesRuntimes } from './current-runtime-registry';
import { interpretClassicalHand, projectClassicalInterpretation, type ClassicalInterpretationInput } from './classical-interpretation';

const context = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000 };
const baseInput = (extra: Partial<ClassicalInterpretationInput> = {}): ClassicalInterpretationInput => ({
  profile: BMJA_PROFILE_REF,
  explicitSets: [],
  unresolvedTiles: [],
  bonusTiles: [],
  isWinner: true,
  context,
  handMode: 'normal',
  ...extra,
});
const pung = (id: string, tile: PlayingTile) => set(id, 'pung', tile);
const explicitWinner = (): HandSet[] => [
  pung('east', wind('east')),
  pung('south', wind('south')),
  pung('west', wind('west')),
  pung('red', dragon('red')),
  set('pair', 'pair', suited('bamboo', 9)),
];
const unresolvedWinnerTiles = (): PlayingTile[] => [
  ...Array.from({ length: 3 }, () => wind('east')),
  ...Array.from({ length: 3 }, () => wind('south')),
  ...Array.from({ length: 3 }, () => wind('west')),
  ...Array.from({ length: 3 }, () => dragon('red')),
  ...Array.from({ length: 2 }, () => suited('bamboo', 9)),
];

describe('pure Classical unresolved-tile interpretation', () => {
  beforeAll(async () => initialiseCurrentRulesRuntimes());

  it('keeps an all-explicit hand identity-equivalent with no inferred structure', () => {
    const explicitSets = explicitWinner();
    const result = interpretClassicalHand(baseInput({ explicitSets }));
    expect(result.profile).toEqual(BMJA_PROFILE_REF);
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]!.explicitSets).toEqual(explicitSets);
    expect(result.candidates[0]!.explicitSets[0]).toBe(explicitSets[0]);
    expect(result.candidates[0]!.inferredGroups).toEqual([]);
    expect(result.candidates[0]!.wholeHandComplete).toBe(true);
    expect(projectClassicalInterpretation(baseInput({ explicitSets }), result.candidates[0]!)).toEqual({ sets: explicitSets, bonusTiles: [], isWinner: true });
  });

  it('partitions only unresolved tiles in a mixed explicit and unresolved hand', () => {
    const explicit = pung('entered-east', wind('east'));
    const input = baseInput({ explicitSets: [explicit], unresolvedTiles: unresolvedWinnerTiles().slice(3) });
    const result = interpretClassicalHand(input);
    expect(result.candidates).toHaveLength(1);
    const candidate = result.candidates[0]!;
    expect(candidate.explicitSets).toEqual([explicit]);
    expect(candidate.explicitSets[0]).toBe(explicit);
    expect(candidate.inferredGroups).toHaveLength(4);
    expect(candidate.inferredGroups.flatMap(({ physicalTileIndexes }) => physicalTileIndexes).every((index) => index < input.unresolvedTiles.length)).toBe(true);
    expect(candidate.profile).toEqual(input.profile);
    const projection = projectClassicalInterpretation(input, candidate, candidate.lawfulVisibilityAssignments[0]);
    expect(projection.sets[0]).toBe(explicit);
  });

  it('finds a complete all-unresolved ordinary hand through the exact profile validator', () => {
    const result = interpretClassicalHand(baseInput({ unresolvedTiles: unresolvedWinnerTiles() }));
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates.every(({ profile, wholeHandComplete }) => profile.id === BMJA_PROFILE_REF.id && wholeHandComplete)).toBe(true);
  });

  it.each([
    ['BMJA', BMJA_PROFILE_REF],
    ['Club', OUTSIDE_THE_BOX_PROFILE_REF],
    ['Buzzard', BUZZARD_2000_PROFILE_REF],
    ['Western', WESTERN_TM_PROFILE_REF],
  ] as const)('smokes an ordinary hand through the exact %s profile runtime', (_name, profile) => {
    const result = interpretClassicalHand(baseInput({ profile, unresolvedTiles: unresolvedWinnerTiles() }));
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates.every(({ profile: candidateProfile }) =>
      candidateProfile.id === profile.id && candidateProfile.version === profile.version,
    )).toBe(true);
  });

  it('does not reinterpret or reuse explicit groups', () => {
    const explicit = set('authority-pung', 'pung', wind('east'), 'exposed');
    const input = baseInput({ explicitSets: [explicit], unresolvedTiles: unresolvedWinnerTiles().slice(3) });
    const result = interpretClassicalHand(input);
    expect(result.candidates.length).toBeGreaterThan(0);
    for (const candidate of result.candidates) {
      expect(candidate.explicitSets).toEqual([explicit]);
      expect(candidate.explicitSets[0]).toBe(explicit);
      expect(candidate.inferredGroups.every(({ id }) => id !== explicit.id)).toBe(true);
    }
  });

  it('returns every lawful decomposition in stable order without score ranking', () => {
    const repeatedRanks = [1, 2, 3].flatMap((rank) => Array.from({ length: 3 }, () => suited('bamboo', rank as 1 | 2 | 3)));
    const tiles = [
      ...repeatedRanks,
      ...Array.from({ length: 3 }, () => suited('circles', 4)),
      ...Array.from({ length: 2 }, () => suited('characters', 9)),
    ];
    const input = baseInput({ profile: BUZZARD_2000_PROFILE_REF, unresolvedTiles: tiles });
    const first = interpretClassicalHand(input).candidates;
    const second = interpretClassicalHand(input).candidates;
    expect(first.length).toBeGreaterThan(1);
    expect(first.every(({ profile }) => profile.id === BUZZARD_2000_PROFILE_REF.id && profile.version === BUZZARD_2000_PROFILE_REF.version)).toBe(true);
    expect(first.map(({ id }) => id)).toEqual([...first.map(({ id }) => id)].sort((a, b) => a.localeCompare(b)));
    expect(first.map(({ id }) => id)).toEqual(second.map(({ id }) => id));
  });

  it('represents a Kong as four physical tiles and three structural slots', () => {
    const tiles = [
      ...Array.from({ length: 4 }, () => wind('east')),
      ...Array.from({ length: 3 }, () => suited('bamboo', 1)),
      ...Array.from({ length: 3 }, () => suited('circles', 2)),
      ...Array.from({ length: 3 }, () => suited('characters', 3)),
      ...Array.from({ length: 2 }, () => dragon('white')),
    ];
    const result = interpretClassicalHand(baseInput({ unresolvedTiles: tiles }));
    const kong = result.candidates.flatMap(({ inferredGroups }) => inferredGroups).find(({ kind }) => kind === 'kong');
    expect(kong).toBeDefined();
    expect(kong).toMatchObject({ structuralSlots: 3 });
    expect(kong!.physicalTileIndexes).toHaveLength(4);
    expect(result.candidates.some(({ unresolvedFacts }) => unresolvedFacts.some(({ type, groupId, choices }) =>
      type === 'group-visibility' && groupId === kong!.id && choices.includes('exposed') && choices.includes('concealed'),
    ))).toBe(true);
  });

  it('keeps partial candidates available when Kongs make physical count exceed structural count', () => {
    const explicitSets = [
      set('east-kong', 'kong', wind('east'), 'exposed'),
      set('south-kong', 'kong', wind('south'), 'exposed'),
      set('west-kong', 'kong', wind('west'), 'exposed'),
    ];
    const input = baseInput({
      isWinner: false,
      explicitSets,
      unresolvedTiles: Array.from({ length: 2 }, () => dragon('white')),
    });
    const result = interpretClassicalHand(input);
    const candidate = result.candidates.find(({ inferredGroups }) => inferredGroups.some(({ kind }) => kind === 'pair'));
    expect(input.explicitSets.length * 4 + input.unresolvedTiles.length).toBeGreaterThanOrEqual(13);
    expect(candidate).toBeDefined();
    expect(candidate!.structuralTileCount).toBeLessThan(13);
  });

  it('offers a local Kong candidate for partial four-of-a-kind evidence without completing the hand', () => {
    const result = interpretClassicalHand(baseInput({
      isWinner: false,
      unresolvedTiles: Array.from({ length: 4 }, () => wind('east')),
    }));
    const kong = result.candidates.find(({ inferredGroups }) => inferredGroups.some(({ kind }) => kind === 'kong'));
    expect(kong).toBeDefined();
    expect(kong).toMatchObject({ wholeHandComplete: false, structuralTileCount: 3 });
    expect(kong!.unresolvedTileIndexes).toEqual([]);
    expect(result.candidates.every(({ wholeHandComplete, structuralTileCount }) => !wholeHandComplete && structuralTileCount < 13)).toBe(true);
  });

  it('keeps an unresolved Kong candidate when physical count reaches thirteen but structural count is twelve', () => {
    const explicitSets = [
      pung('explicit-bamboo-one', suited('bamboo', 1)),
      pung('explicit-circles-two', suited('circles', 2)),
      pung('explicit-characters-three', suited('characters', 3)),
    ];
    const input = baseInput({
      isWinner: false,
      explicitSets,
      unresolvedTiles: Array.from({ length: 4 }, () => wind('east')),
    });
    const result = interpretClassicalHand(input);
    const candidate = result.candidates.find(({ inferredGroups }) =>
      inferredGroups.length === 1 && inferredGroups[0]?.kind === 'kong',
    );

    expect(explicitSets.reduce((count, group) => count + (group.kind === 'pair' ? 2 : 3), 0)).toBe(9);
    expect(input.explicitSets.length * 3 + input.unresolvedTiles.length).toBe(13);
    expect(candidate).toBeDefined();
    expect(candidate).toMatchObject({ structuralTileCount: 12, wholeHandComplete: false });
    expect(candidate!.explicitSets).toEqual(explicitSets);
    expect(candidate!.inferredGroups).toHaveLength(1);
    expect(candidate!.inferredGroups[0]).toMatchObject({ kind: 'kong', structuralSlots: 3, physicalTileIndexes: [0, 1, 2, 3] });
    expect(candidate!.unresolvedTileIndexes).toEqual([]);
  });

  it('applies profile-specific Chow legality through the exact compiled runtime', () => {
    const tiles = [
      suited('bamboo', 1), suited('bamboo', 2), suited('bamboo', 3),
      suited('bamboo', 2), suited('bamboo', 3), suited('bamboo', 4),
      suited('bamboo', 3), suited('bamboo', 4), suited('bamboo', 5),
      suited('bamboo', 4), suited('bamboo', 5), suited('bamboo', 6),
      ...Array.from({ length: 2 }, () => suited('circles', 9)),
    ];
    const buzzard = interpretClassicalHand(baseInput({ profile: BUZZARD_2000_PROFILE_REF, unresolvedTiles: tiles }));
    const bmja = interpretClassicalHand(baseInput({ profile: BMJA_PROFILE_REF, unresolvedTiles: tiles }));
    expect(buzzard.candidates.some(({ inferredGroups }) => inferredGroups.filter(({ kind }) => kind === 'chow').length === 4)).toBe(true);
    expect(bmja.candidates.some(({ inferredGroups }) => inferredGroups.filter(({ kind }) => kind === 'chow').length === 4)).toBe(false);
  });

  it('rejects five physical copies through the selected profile validator', () => {
    const result = interpretClassicalHand(baseInput({
      isWinner: false,
      unresolvedTiles: Array.from({ length: 5 }, () => wind('east')),
    }));
    expect(result.candidates).toEqual([]);
    expect(result.rejected.some(({ validationErrors }) => validationErrors?.includes('A playing tile cannot appear more than four times.'))).toBe(true);
  });

  it('fails closed when a Goulash blank has not been placed into an explicit group', () => {
    const result = interpretClassicalHand(baseInput({
      profile: OUTSIDE_THE_BOX_PROFILE_REF,
      isWinner: false,
      handMode: 'goulash',
      context: { ...context, handMode: 'goulash' },
      unresolvedTiles: [suited('bamboo', 1)],
      ungroupedBlankTiles: [{ id: 'blank-1', location: 'remaining', tileIndex: 0 }],
    }));
    expect(result.candidates).toEqual([]);
    expect(result.rejected[0]?.code).toBe('needs-explicit-goulash-blank-placement');
  });

  it('delegates irregular special validation to the exact profile runtime', () => {
    const wonders = [
      suited('bamboo', 1), suited('bamboo', 9),
      suited('characters', 1), suited('characters', 9),
      suited('circles', 1), suited('circles', 9),
      wind('east'), wind('south'), wind('west'), wind('north'),
      dragon('red'), dragon('green'), dragon('white'), wind('east'),
    ];
    const result = interpretClassicalHand(baseInput({ unresolvedTiles: wonders }));
    expect(result.candidates.some(({ layout }) => layout === 'irregular')).toBe(true);
  });

  it('rejects pattern-accumulator profiles without invoking MCR interpretation', () => {
    const profile = { id: MCR_WMO_2006_PROFILE.identity.id, version: MCR_WMO_2006_PROFILE.identity.version };
    const result = interpretClassicalHand(baseInput({ profile }));
    expect(result.candidates).toEqual([]);
    expect(result.rejected[0]?.code).toBe('classical-runtime-required');
  });
});
