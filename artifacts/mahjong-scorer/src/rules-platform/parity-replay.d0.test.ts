import { describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import { BMJA_PROFILE_REF, resolveRulesProfile } from '../game/ruleset';
import { compileRulesRuntime } from './classical-runtime';
import { currentPlayableResolverEnvironment } from './current-profiles';
import { platformScoreInput } from './parity-harness.test-support';
import { resolvePlayableProfile } from './resolver';
import type { ExecutableRegistryIdentity, ResolvedProfileArtifact, RulesProfileRef } from './types';

type ReplayPin = Readonly<{
  profile: RulesProfileRef;
  rulesFingerprint: string;
  executableDependencies: readonly ExecutableRegistryIdentity[];
}>;

const pinFor = (artifact: ResolvedProfileArtifact): ReplayPin => ({
  profile: { id: artifact.profile.identity.id, version: artifact.profile.identity.version },
  rulesFingerprint: artifact.rulesFingerprint,
  executableDependencies: artifact.executableDependencies.map(({ id, semanticRevision }) => ({ id, semanticRevision })),
});

/** Test-only replay procedure: seal exact resolver output before compiling it. */
const replayPinned = async (pin: ReplayPin) => {
  const artifact = await resolvePlayableProfile(pin.profile, currentPlayableResolverEnvironment);
  if (artifact.profile.identity.id !== pin.profile.id || artifact.profile.identity.version !== pin.profile.version) {
    throw new Error('REPLAY_PIN_PROFILE_MISMATCH');
  }
  if (artifact.rulesFingerprint !== pin.rulesFingerprint) throw new Error('REPLAY_PIN_FINGERPRINT_MISMATCH');
  if (JSON.stringify(artifact.executableDependencies) !== JSON.stringify(pin.executableDependencies)) {
    throw new Error('REPLAY_PIN_EXECUTABLE_DEPENDENCIES_MISMATCH');
  }
  return compileRulesRuntime(artifact);
};

const ordinaryInput = {
  hand: {
    sets: [
      set('red', 'pung', dragon('red')), set('two', 'pung', suited('bamboo', 2)),
      set('three', 'pung', suited('bamboo', 3)), set('four', 'pung', suited('bamboo', 4)),
      set('pair', 'pair', wind('east')),
    ], bonusTiles: [], isWinner: true, winningMethod: 'wall' as const,
  }, playerWind: 'east' as const, prevailingWind: 'east' as const,
};
const legacy = resolveRulesProfile(BMJA_PROFILE_REF);

describe('bmja@1.0 D0 sealed replay pin and audit closure', () => {
  it('rules-platform/current-profiles.ts exact artifact pin — replays only the identical sealed profile', async () => {
    const artifact = await resolvePlayableProfile(BMJA_PROFILE_REF, currentPlayableResolverEnvironment);
    const pin = pinFor(artifact);
    const replayed = await replayPinned(pin);
    expect(replayed.artifact).toEqual(artifact);
    expect(pin.executableDependencies).toEqual([...pin.executableDependencies].sort((a, b) =>
      a.id.localeCompare(b.id) || a.semanticRevision - b.semanticRevision,
    ));
    expect(pin.executableDependencies).toEqual(expect.arrayContaining([
      { id: 'classical.bindings.bmja-current', semanticRevision: 2 },
      { id: 'validation.classical-current', semanticRevision: 2 },
    ]));
  });

  it('rules-platform/current-profiles.ts unavailable version — fails without a latest-profile fallback', async () => {
    const pin = pinFor(await resolvePlayableProfile(BMJA_PROFILE_REF, currentPlayableResolverEnvironment));
    await expect(replayPinned({ ...pin, profile: { ...pin.profile, version: '9.9' } }))
      .rejects.toThrow('PROFILE_UNRESOLVED');
  });

  it.each([
    ['changed fingerprint', (pin: ReplayPin): ReplayPin => ({ ...pin, rulesFingerprint: `${pin.rulesFingerprint}-mutated` }), 'REPLAY_PIN_FINGERPRINT_MISMATCH'],
    ['changed executable semantic revision', (pin: ReplayPin): ReplayPin => ({ ...pin, executableDependencies: pin.executableDependencies.map((dependency) => dependency.id === 'classical.bindings.bmja-current' ? { ...dependency, semanticRevision: dependency.semanticRevision + 1 } : dependency) }), 'REPLAY_PIN_EXECUTABLE_DEPENDENCIES_MISMATCH'],
    ['changed executable dependency set', (pin: ReplayPin): ReplayPin => ({ ...pin, executableDependencies: pin.executableDependencies.filter(({ id }) => id !== 'validation.classical-current') }), 'REPLAY_PIN_EXECUTABLE_DEPENDENCIES_MISMATCH'],
  ])('rules-platform/current-profiles.ts %s — replay fails closed', async (_name, mutate, reason) => {
    const pin = pinFor(await resolvePlayableProfile(BMJA_PROFILE_REF, currentPlayableResolverEnvironment));
    await expect(replayPinned(mutate(pin))).rejects.toThrow(reason);
  });

  it('certified BMJA parity fixture — resolve, compile, evaluation trace and reason IDs are deterministic', async () => {
    const [firstArtifact, secondArtifact] = await Promise.all([
      resolvePlayableProfile(BMJA_PROFILE_REF, currentPlayableResolverEnvironment),
      resolvePlayableProfile(BMJA_PROFILE_REF, currentPlayableResolverEnvironment),
    ]);
    const [first, second] = [compileRulesRuntime(firstArtifact), compileRulesRuntime(secondArtifact)];
    expect(pinFor(firstArtifact)).toEqual(pinFor(secondArtifact));
    expect(first.scoreHand(platformScoreInput(legacy, ordinaryInput)))
      .toEqual(second.scoreHand(platformScoreInput(legacy, ordinaryInput)));
    const scored = first.scoreHand(platformScoreInput(legacy, ordinaryInput));
    const invalid = first.scoreHand(platformScoreInput(legacy, {
      ...ordinaryInput, hand: { ...ordinaryInput.hand, sets: [set('pair', 'pair', wind('east'))] },
    }));
    expect(scored).toMatchObject({ legal: true, disposition: { kind: 'scored' } });
    expect(invalid).toMatchObject({ legal: false, disposition: { kind: 'invalid' } });
    expect(first.evaluateGameEnd({ gameLength: 'one-round', previousPrevailingWind: 'north', progression: { prevailingWindAdvanced: true } }).reasonId)
      .toBe('game-end.classical-east-cycle.one-round-complete');
  });
});
