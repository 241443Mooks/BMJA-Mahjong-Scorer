import { describe, expect, it } from 'vitest';
import {
  bmjaSpecialHandBindings,
  classifyEvidenceCompleteness,
  dragon,
  set,
  suited,
  validateHand,
  wind,
  type GameContext,
  type MahjongHand,
} from '../scoring';
import { OUTSIDE_THE_BOX_PROFILE_REF, outsideTheBoxSpecialHandBindings } from '../game/outside-the-box-catalogue';
import { WESTERN_TM_PROFILE_REF, westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { architectureSeedEntries } from './architecture-seeds';
import {
  BMJA_CLASSICAL_VALIDATION_PROFILE,
  CLASSICAL_CURRENT_VALIDATION,
  CLASSICAL_WESTERN_VALIDATION_FAMILY,
  classicalValidationRegistry,
  validateCurrentClassicalHand,
} from './classical-validation';
import { RegistryBank } from './registry';

const context: GameContext = {
  playerWind: 'south', prevailingWind: 'east', limit: 1000, handMode: 'normal',
};

const adapted = (
  hand: MahjongHand,
  profile = BMJA_CLASSICAL_VALIDATION_PROFILE,
  adaptedContext = context,
) => validateCurrentClassicalHand(
  CLASSICAL_CURRENT_VALIDATION,
  {
    family: CLASSICAL_WESTERN_VALIDATION_FAMILY,
    evidenceCodecId: 'classical.hand.v1',
    profile,
    input: { evidence: hand, context: adaptedContext },
  },
);

describe('current Classical validation adapter', () => {
  it.each([
    ['ordinary complete hand', {
      sets: [
        set('one', 'pung', suited('bamboo', 2)),
        set('two', 'pung', suited('characters', 4)),
        set('three', 'pung', dragon('red')),
        set('four', 'chow', suited('circles', 3)),
        set('pair', 'pair', wind('east')),
      ], bonusTiles: [], isWinner: true,
    }],
    ['maximum one Chow', {
      sets: [
        set('one', 'pung', suited('bamboo', 2)),
        set('two', 'pung', suited('characters', 4)),
        set('three', 'chow', suited('circles', 3)),
        set('four', 'chow', suited('bamboo', 4)),
        set('pair', 'pair', wind('east')),
      ], bonusTiles: [], isWinner: true,
    }],
    ['supported loose special layout', {
      sets: [],
      looseTiles: [
        suited('characters', 1), suited('bamboo', 1),
        suited('characters', 2), suited('bamboo', 2),
        suited('characters', 3), suited('circles', 3),
        suited('bamboo', 4), suited('circles', 4),
        suited('characters', 6), suited('bamboo', 6),
        suited('characters', 8), suited('circles', 8),
        suited('bamboo', 9), suited('circles', 9),
      ], bonusTiles: [], isWinner: true,
    }],
    ['one-away special fishing', {
      sets: [
        set('one', 'pair', wind('east')), set('two', 'pair', wind('south')),
        set('three', 'pair', dragon('red')), set('four', 'pair', suited('bamboo', 1)),
        set('five', 'pair', suited('circles', 9)), set('six', 'pair', suited('characters', 1)),
      ], remainingTiles: [dragon('green')], bonusTiles: [], isWinner: false,
    }],
    ['winning-tile provenance', {
      sets: [
        set('one', 'pung', suited('bamboo', 2)), set('two', 'pung', suited('characters', 4)),
        set('three', 'pung', dragon('red')), set('four', 'chow', suited('circles', 3)),
        set('pair', 'pair', wind('east')),
      ], bonusTiles: [], isWinner: true,
      winningTileProvenance: {
        tile: suited('bamboo', 1),
        target: { type: 'grouped-set', setId: 'stale' },
      },
    }],
  ] satisfies readonly [string, MahjongHand][])(
    'preserves direct BMJA output for %s', (_name, hand) => {
      expect(adapted(hand)).toEqual(validateHand(hand, context));
    },
  );

  it.each([
    ['winning structural count', {
      sets: [set('pair', 'pair', wind('east'))], bonusTiles: [], isWinner: true,
    }],
    ['unsupported irregular layout', {
      sets: [], looseTiles: Array.from({ length: 14 }, () => suited('bamboo', 1)), bonusTiles: [], isWinner: true,
    }],
    ['invalid fishing layout', {
      sets: [], looseTiles: Array.from({ length: 13 }, () => suited('bamboo', 1)), bonusTiles: [], isWinner: false,
    }],
    ['incompatible winning event', {
      sets: [
        set('one', 'pung', suited('bamboo', 2)), set('two', 'pung', suited('characters', 4)),
        set('three', 'pung', dragon('red')), set('four', 'chow', suited('circles', 3)),
        set('pair', 'pair', wind('east')),
      ], bonusTiles: [], isWinner: true, winningMethod: 'wall',
      winningEventEvidence: { type: 'discard', discardedBy: 'east', handDiscardOrdinal: 1 },
    }],
  ] satisfies readonly [string, MahjongHand][])(
    'preserves direct BMJA invalid output for %s', (_name, hand) => {
      expect(adapted(hand)).toEqual(validateHand(hand, context));
    },
  );

  it('preserves direct T&M special-layout validation with its code-owned catalogue', () => {
    const hand: MahjongHand = {
      sets: [],
      looseTiles: [
        suited('bamboo', 1), suited('bamboo', 2), suited('bamboo', 3), suited('bamboo', 4),
        suited('bamboo', 5), suited('bamboo', 6), suited('bamboo', 7), wind('east'), wind('south'),
        wind('west'), wind('north'), dragon('red'), dragon('red'), dragon('red'),
      ], bonusTiles: [], isWinner: true,
    };
    expect(adapted(hand, WESTERN_TM_PROFILE_REF)).toEqual(
      validateHand(hand, context, westernTmSpecialHandBindings),
    );
    expect(validateHand(hand, context, bmjaSpecialHandBindings)).not.toEqual([]);
  });

  it('preserves direct OTB Goulash validation with its code-owned catalogue', () => {
    const goulashContext: GameContext = { ...context, handMode: 'goulash' };
    const hand: MahjongHand = {
      sets: [
        { ...set('one', 'pung', suited('bamboo', 3)), blankTileIds: ['blank-bamboo'] },
        { ...set('two', 'kong', wind('east')), blankTileIds: ['blank-east-a', 'blank-east-b'] },
        set('three', 'pung', suited('characters', 5)), set('four', 'pung', suited('circles', 7)),
        set('pair', 'pair', suited('bamboo', 8)),
      ], bonusTiles: [], isWinner: true,
    };
    expect(adapted(hand, OUTSIDE_THE_BOX_PROFILE_REF, goulashContext)).toEqual(
      validateHand(hand, goulashContext, outsideTheBoxSpecialHandBindings),
    );
    expect(adapted({ ...hand, sets: [{ ...set('chow', 'chow', suited('bamboo', 1)) }] }, OUTSIDE_THE_BOX_PROFILE_REF, goulashContext)).toEqual(
      validateHand({ ...hand, sets: [{ ...set('chow', 'chow', suited('bamboo', 1)) }] }, goulashContext, outsideTheBoxSpecialHandBindings),
    );
    expect(adapted(hand, OUTSIDE_THE_BOX_PROFILE_REF)).toEqual(
      validateHand(hand, context, outsideTheBoxSpecialHandBindings),
    );
  });

  it('does not turn absent scoring facts into structural errors', () => {
    const hand: MahjongHand = {
      sets: [
        set('one', 'pung', suited('bamboo', 2)), set('two', 'pung', suited('characters', 4)),
        set('three', 'pung', dragon('red')), set('four', 'chow', suited('circles', 3)),
        set('pair', 'pair', wind('east')),
      ], bonusTiles: [], isWinner: true,
    };
    const errors = adapted(hand);
    expect(errors).toEqual([]);
    expect(classifyEvidenceCompleteness(hand, errors)).toBe('complete');
  });

  it('fails closed before legacy validation for incompatible selectors', () => {
    const malformedInput = { evidence: undefined as never, context };
    expect(() => validateCurrentClassicalHand(CLASSICAL_CURRENT_VALIDATION, {
      family: { ...CLASSICAL_WESTERN_VALIDATION_FAMILY, id: 'family.mcr' },
      evidenceCodecId: 'classical.hand.v1', profile: BMJA_CLASSICAL_VALIDATION_PROFILE, input: malformedInput,
    })).toThrow('Validation family is incompatible: family.mcr');
    expect(() => validateCurrentClassicalHand(CLASSICAL_CURRENT_VALIDATION, {
      family: CLASSICAL_WESTERN_VALIDATION_FAMILY,
      evidenceCodecId: 'mcr.hand.v1', profile: BMJA_CLASSICAL_VALIDATION_PROFILE, input: malformedInput,
    })).toThrow('Validation evidence codec is incompatible: mcr.hand.v1');
    expect(() => validateCurrentClassicalHand(
      { ...CLASSICAL_CURRENT_VALIDATION, semanticRevision: 3 },
      { family: CLASSICAL_WESTERN_VALIDATION_FAMILY, evidenceCodecId: 'classical.hand.v1', profile: BMJA_CLASSICAL_VALIDATION_PROFILE, input: malformedInput },
    )).toThrow('Unknown current validation implementation: validation.classical-current@3');
  });

  it('keeps future validation identities architecture-only and non-invocable', () => {
    const architecture = new RegistryBank(architectureSeedEntries);
    for (const id of [
      'validation.mcr-winning-shape', 'validation.riichi-winning-shape',
      'validation.taiwanese-five-sets-pair', 'validation.sanma-no-chii',
      'validation.target-catalogue-match',
    ] as const) {
      expect(() => architecture.requireExecutable('validation', id)).toThrow(`Registry entry is not executable: ${id}`);
      expect(() => validateCurrentClassicalHand(
        { id, semanticRevision: 1 },
        { family: CLASSICAL_WESTERN_VALIDATION_FAMILY, evidenceCodecId: 'classical.hand.v1', profile: BMJA_CLASSICAL_VALIDATION_PROFILE, input: { evidence: undefined as never, context } },
      )).toThrow(`Unknown registry ID: ${id}`);
    }
    expect(classicalValidationRegistry.requireExecutable('validation', CLASSICAL_CURRENT_VALIDATION.id).semanticRevision).toBe(2);
  });
});
