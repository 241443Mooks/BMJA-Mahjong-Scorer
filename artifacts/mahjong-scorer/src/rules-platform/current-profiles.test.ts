import { describe, expect, it } from 'vitest';
import { resolvePlayableProfile } from './resolver';
import {
  BMJA_CURRENT_PROFILE,
  currentPlayableResolverEnvironment,
  OUTSIDE_THE_BOX_CURRENT_PROFILE,
  WESTERN_TM_CURRENT_PROFILE,
} from './current-profiles';

const refs = [BMJA_CURRENT_PROFILE, WESTERN_TM_CURRENT_PROFILE, OUTSIDE_THE_BOX_CURRENT_PROFILE]
  .map(({ identity }) => ({ id: identity.id, version: identity.version }));

describe('current playable profile inventory', () => {
  it.each(refs)('seals %s@%s with no architecture-only functional dependency', async (ref) => {
    const first = await resolvePlayableProfile(ref, currentPlayableResolverEnvironment);
    const second = await resolvePlayableProfile(ref, currentPlayableResolverEnvironment);
    expect(first).toEqual(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(first.executableDependencies).toEqual([...first.executableDependencies].sort((a, b) => a.id.localeCompare(b.id)));
    expect(first.executableDependencies.every(({ semanticRevision }) => semanticRevision === 1)).toBe(true);
  });

  it('keeps current profile-local scoring and table selections exact', async () => {
    const artifacts = await Promise.all(refs.map((ref) => resolvePlayableProfile(ref, currentPlayableResolverEnvironment)));
    expect(artifacts.map(({ profile }) => profile.scoring.config)).toEqual([
      { configVersion: 1, scorerId: 'classical.scorer.current', bindingId: 'classical.bindings.bmja-current', policyId: 'classical.policy.bmja-current' },
      { configVersion: 1, scorerId: 'classical.scorer.current', bindingId: 'classical.bindings.western-tm-current', policyId: 'classical.policy.western-tm-current' },
      { configVersion: 1, scorerId: 'classical.scorer.current', bindingId: 'classical.bindings.outside-the-box-current', policyId: 'classical.policy.outside-the-box-current' },
    ]);
    expect(artifacts[2].profile).toMatchObject({
      settlement: { id: 'settlement.outside-the-box-incidents' },
      handMode: { id: 'hand-mode.outside-the-box-goulash' },
      incidents: [{ id: 'incident.outside-the-box-round-preparation' }],
    });
  });

  it('has the complete current executable dependency inventory', async () => {
    const artifacts = await Promise.all(refs.map((ref) => resolvePlayableProfile(ref, currentPlayableResolverEnvironment)));
    expect(artifacts.map(({ executableDependencies }) => executableDependencies.map(({ id, semanticRevision }) => `${id}@${semanticRevision}`))).toEqual([
      [
        'classical.bindings.bmja-current@1', 'classical.policy.bmja-current@1', 'classical.scorer.current@1',
        'evidence-policy.classical-current@1', 'evidence.classical-hand-v1@1', 'evidence.round-wind@1', 'evidence.seat-wind@1',
        'family.classical-western@1', 'game-end.classical-east-cycle@1', 'hand-mode.none@1', 'progression.classical-east-cycle@1',
        'seats.winds-4@1', 'settlement.classical-pairwise@1', 'shape.four-sets-pair@1', 'tiles.flowers-144@1', 'validation.classical-current@1',
      ],
      [
        'classical.bindings.western-tm-current@1', 'classical.policy.western-tm-current@1', 'classical.scorer.current@1',
        'evidence-policy.classical-current@1', 'evidence.classical-hand-v1@1', 'evidence.round-wind@1', 'evidence.seat-wind@1',
        'family.classical-western@1', 'game-end.classical-east-cycle@1', 'hand-mode.none@1', 'progression.classical-east-cycle@1',
        'seats.winds-4@1', 'settlement.classical-pairwise@1', 'shape.four-sets-pair@1', 'tiles.flowers-144@1', 'validation.classical-current@1',
      ],
      [
        'classical.bindings.outside-the-box-current@1', 'classical.policy.outside-the-box-current@1', 'classical.scorer.current@1',
        'evidence-policy.classical-current@1', 'evidence.classical-hand-v1@1', 'evidence.round-wind@1', 'evidence.seat-wind@1',
        'family.classical-western@1', 'game-end.classical-east-cycle@1', 'hand-mode.outside-the-box-goulash@1',
        'incident.outside-the-box-round-preparation@1', 'progression.classical-east-cycle@1', 'seats.winds-4@1',
        'settlement.outside-the-box-incidents@1', 'shape.four-sets-pair@1', 'tiles.flowers-144@1', 'validation.classical-current@1',
      ],
    ]);
  });
});
