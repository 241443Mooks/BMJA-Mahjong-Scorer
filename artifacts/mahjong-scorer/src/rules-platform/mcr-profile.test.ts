import { describe, expect, it } from 'vitest';
import { resolvePlayableProfile } from './resolver';
import { currentPlayableProfiles, currentPlayableResolverEnvironment } from './current-profiles';
import { MCR_FAMILY, MCR_WMO_2006_PROFILE, mcrProfileResolverEnvironment, mcrProfileResolverRegistry } from './mcr-profile';
import { resolveMcrWinningInterpretations } from './mcr-detectors';
import { validateMcrWinningShape } from './mcr-validation';
import type { McrScoringInput } from './mcr-scoring-input';

const expectedDependencies = [
  'catalogue.pattern.mcr-wmo-2006@1', 'conversion.identity@1', 'evidence-policy.mcr-wmo-2006@1',
  'evidence.resolved-win-event@1', 'evidence.winning-method@1', 'family.mcr@1',
  'game-end.four-round-always-pass@1', 'interaction.mcr-2006-non-combination@1',
  'interpretation.max-lawful-profile@1', 'post-qualification-bonus.mcr-flowers@1',
  'progression.always-pass@1', 'qualification.mcr-8-before-flowers@1', 'seats.winds-4@1',
  'settlement.mcr-2006@1', 'shape.four-sets-pair@1', 'tiles.flowers-144@1',
  'validation.mcr-winning-shape@1',
];
const isDeepFrozen = (value: unknown): boolean => !value || typeof value !== 'object' ||
  (Object.isFrozen(value) && Object.values(value as Record<string, unknown>).every(isDeepFrozen));
const t = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => ({ face: { family: 'suit' as const, suit, rank } });
const winningInput = (): McrScoringInput => ({
  evidence: { fixedGroups: [], freeTiles: [t('characters',1),t('characters',2),t('characters',3),t('dots',4),t('dots',5),t('dots',6),t('bamboo',7),t('bamboo',8),t('bamboo',9),t('characters',7),t('characters',7),t('characters',7),t('dots',5),t('dots',5)], winningTile: t('dots',5), flowerCount: 0 },
  context: { winSource: 'self-draw', resolvedWinEvent: 'none', lastVisibleCopy: false },
});

describe('non-public executable MCR profile closure', () => {
  it('seals the canonical root through the normal resolver with the exact dependency set', async () => {
    const ref = { id: 'mcr-wmo-2006', version: '0.1' };
    const first = await resolvePlayableProfile(ref, mcrProfileResolverEnvironment);
    const second = await resolvePlayableProfile(ref, mcrProfileResolverEnvironment);
    expect(first).toEqual(second);
    expect(isDeepFrozen(first)).toBe(true);
    expect(isDeepFrozen(first.profile)).toBe(true);
    expect(first.rulesFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(first.executableDependencies.map(({ id, semanticRevision }) => `${id}@${semanticRevision}`)).toEqual(expectedDependencies);
    expect(first.profile.provenance.sources).toEqual(['source.mcr-ema-green-book-2006']);
    expect(first.executableDependencies.some(({ id }) => id.startsWith('source.'))).toBe(false);
    expect(first.profile).toMatchObject({
      identity: { id: 'mcr-wmo-2006', version: '0.1', status: 'provisional', familyId: 'family.mcr', grammar: 'pattern-accumulator' },
      validation: { handShapePolicyId: 'validation.mcr-winning-shape', policyIds: [] },
      evidence: { policyIds: ['evidence-policy.mcr-wmo-2006'], alwaysRequired: ['evidence.resolved-win-event', 'evidence.winning-method'] },
      handShape: { presetId: 'shape.four-sets-pair', options: {} },
    });
    expect(first.rulesFingerprint).toBe('8044ee6ee883192bae97e83a67380f6c0bff999179df93229fc9daa4308a7ace');
  });

  it('keeps conditional evidence executable without making it always required', async () => {
    const artifact = await resolvePlayableProfile({ id: 'mcr-wmo-2006', version: '0.1' }, mcrProfileResolverEnvironment);
    for (const id of ['evidence.last-visible-copy', 'evidence.flower-count', 'evidence.seat-wind', 'evidence.round-wind']) {
      expect(mcrProfileResolverRegistry.requireExecutable('evidence', id).semanticRevision).toBe(1);
      expect(artifact.profile.evidence.alwaysRequired).not.toContain(id);
      expect(artifact.executableDependencies.some((dependency) => dependency.id === id)).toBe(false);
    }
  });

  it('uses A1 physical validation and interpretation resolution without scoring policy', () => {
    const valid = winningInput();
    expect(validateMcrWinningShape(valid)).toEqual({ valid: true });
    expect(resolveMcrWinningInterpretations(valid).length).toBeGreaterThan(0);
    const invalid = winningInput();
    invalid.evidence.freeTiles = [t('characters',1),t('characters',2),t('characters',3),t('dots',4),t('dots',5),t('dots',6),t('bamboo',7),t('bamboo',8),t('bamboo',9),t('characters',7),t('characters',7),t('characters',7),t('dots',5),t('characters',9)];
    invalid.evidence.winningTile = t('characters',9);
    expect(validateMcrWinningShape(invalid)).toEqual({ valid: false, reasonId: 'validation.mcr-winning-shape.no-lawful-winning-interpretation' });
  });

  it('leaves public profile activation at the existing four profiles', async () => {
    expect(currentPlayableProfiles.map(({ identity }) => identity.id)).toEqual(['bmja', 'western-tm', 'outside-the-box', 'buzzard-2000']);
    const artifacts = await Promise.all(currentPlayableProfiles.map(({ identity }) => resolvePlayableProfile({ id: identity.id, version: identity.version }, currentPlayableResolverEnvironment)));
    expect(artifacts).toHaveLength(4);
    expect(artifacts.every(({ profile }) => profile.identity.id !== MCR_WMO_2006_PROFILE.identity.id)).toBe(true);
    expect(MCR_FAMILY.allowedGrammars).toEqual(['pattern-accumulator']);
    expect(MCR_FAMILY.allowedTileSetIds).toEqual(['tiles.flowers-144']);
    expect(MCR_FAMILY.allowedSeatModelIds).toEqual(['seats.winds-4']);
  });
});
