import { describe, expect, it } from 'vitest';
import { scoreHand, set, suited, validateHand, wind, type GameContext, type MahjongHand } from '../scoring';
import { bmjaSpecialHandBindings } from '../scoring/special-hands';
import { progressBmjaGame } from '../game/progression';
import { settleBmjaRound } from '../game/settlement';
import type { GamePlayer, ProgressionState, SeatAssignments } from '../game/types';
import { compileBmjaRuntime } from './classical-runtime';
import { currentPlayableResolverEnvironment } from './current-profiles';
import { resolvePlayableProfile } from './resolver';

const context: GameContext = { playerWind: 'south', prevailingWind: 'east', limit: 1000, handMode: 'normal' };
const ordinary: MahjongHand = {
  sets: [
    set('one', 'pung', suited('bamboo', 2)), set('two', 'pung', suited('characters', 4)),
    set('three', 'pung', suited('circles', 6)), set('four', 'chow', suited('bamboo', 3)),
    set('pair', 'pair', wind('east')),
  ], bonusTiles: [], isWinner: true,
};
const special: MahjongHand = {
  sets: [],
  looseTiles: [
    suited('bamboo', 1), suited('bamboo', 9), suited('characters', 1), suited('characters', 9),
    suited('circles', 1), suited('circles', 9), wind('east'), wind('south'), wind('west'), wind('north'),
    { family: 'dragon', dragon: 'red' }, { family: 'dragon', dragon: 'green' }, { family: 'dragon', dragon: 'white' }, wind('east'),
  ], bonusTiles: [], isWinner: true,
};
const players: GamePlayer[] = ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id }));
const seats: SeatAssignments = { a: 'east', b: 'south', c: 'west', d: 'north' };
const progression: ProgressionState = { seats, prevailingWind: 'east', eastCycleStartPlayerId: 'a' };

const bmjaArtifact = () => resolvePlayableProfile({ id: 'bmja', version: '1.0' }, currentPlayableResolverEnvironment);
const breakdown = (result: ReturnType<ReturnType<typeof compileBmjaRuntime>['scoreHand']>) =>
  (result.result as unknown as { breakdown: ReturnType<typeof scoreHand> }).breakdown;

describe('BMJA compiled current runtime', () => {
  it('preserves ordinary and special legacy scoring through the sealed artifact', async () => {
    const runtime = compileBmjaRuntime(await bmjaArtifact());
    expect(breakdown(runtime.scoreHand({ evidence: ordinary, context }))).toEqual(scoreHand(ordinary, context, bmjaSpecialHandBindings));
    expect(breakdown(runtime.scoreHand({ evidence: special, context }))).toEqual(scoreHand(special, context, bmjaSpecialHandBindings));
    expect(runtime.scoreHand({ evidence: special, context }).matchedCanonicalPatternIds).toContain('thirteen-unique-wonders');
  });

  it('preserves validation and current Classical table/hand-mode adapters', async () => {
    const runtime = compileBmjaRuntime(await bmjaArtifact());
    const invalid = { ...ordinary, sets: [set('pair', 'pair', wind('east'))] };
    expect(runtime.validateHand({ evidence: invalid, context })).toEqual(validateHand(invalid, context));
    const round = { outcome: { type: 'win' as const, winnerId: 'b' }, scores: { a: 100, b: 200, c: 300, d: 400 } };
    expect(runtime.settleRound({ players, seats, round }).map(({ from, to, amount }) => ({ from, to, amount }))).toEqual(
      settleBmjaRound(players, seats, round).transactions.map(({ fromPlayerId, toPlayerId, amount }) => ({ from: fromPlayerId, to: toPlayerId, amount })),
    );
    const outcome = { type: 'win' as const, winnerId: 'c' };
    const directProgression = progressBmjaGame(players, progression, outcome);
    const adaptedProgression = runtime.progressGame({ players, current: progression, outcome });
    expect(adaptedProgression.nextState).toEqual({
      seats: directProgression.seats,
      prevailingWind: directProgression.prevailingWind,
      eastCycleStartPlayerId: directProgression.eastCycleStartPlayerId,
    });
    expect(adaptedProgression.metadata).toMatchObject({
      seatsRotated: directProgression.seatsRotated,
      prevailingWindAdvanced: directProgression.prevailingWindAdvanced,
    });
    expect(runtime.evaluateGameEnd({ gameLength: 'one-round', previousPrevailingWind: 'east', progression: { prevailingWindAdvanced: true } })).toMatchObject({ complete: true });
    expect(runtime.nextHandMode({})).toBe('normal');
  });

  it('retains authoritative disposition and deterministic audit identity without treating partial as missing evidence', async () => {
    const artifact = await bmjaArtifact(); const runtime = compileBmjaRuntime(artifact);
    const scored = runtime.scoreHand({ evidence: ordinary, context });
    expect(scored).toMatchObject({ legal: true, disposition: { kind: 'scored' }, profile: { id: 'bmja', version: '1.0' }, rulesFingerprint: artifact.rulesFingerprint });
    expect(scored.decisionTrace).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'classical-runtime.validation', metadata: expect.objectContaining({ rulesFingerprint: artifact.rulesFingerprint, executableDependencies: artifact.executableDependencies.map(({ id, semanticRevision }) => `${id}@${semanticRevision}`) }) }),
      expect.objectContaining({ id: 'classical-runtime.scoring', identities: { ruleId: 'classical.scorer.current@1', bindingId: 'classical.bindings.bmja-current@1', policyId: 'classical.policy.bmja-current@1' } }),
    ]));
    const invalid = runtime.scoreHand({ evidence: { ...ordinary, sets: [set('pair', 'pair', wind('east'))] }, context });
    expect(invalid).toMatchObject({ legal: false, disposition: { kind: 'invalid' } });
    const partial = { ...ordinary, isWinner: false, remainingTiles: [suited('bamboo', 1)] };
    expect(runtime.scoreHand({ evidence: partial, context }).disposition.kind).not.toBe('needs-evidence');
  });

  it('fails explicitly rather than falling back from a mismatched sealed revision', async () => {
    const artifact = await bmjaArtifact();
    const mismatched = { ...artifact, executableDependencies: artifact.executableDependencies.map((dependency) =>
      dependency.id === 'validation.classical-current' ? { ...dependency, semanticRevision: 2 } : dependency,
    ) };
    expect(() => compileBmjaRuntime(mismatched)).toThrow('Unknown current validation implementation: validation.classical-current@2');
  });

  it('fails closed when a mutated selected profile ref leaves the old dependency present', async () => {
    const artifact = await bmjaArtifact();
    const mutated = {
      ...artifact,
      profile: {
        ...artifact.profile,
        settlement: { ...artifact.profile.settlement, id: 'settlement.mutated' },
      },
    };
    expect(artifact.executableDependencies.some(({ id }) => id === 'settlement.classical-pairwise')).toBe(true);
    expect(() => compileBmjaRuntime(mutated)).toThrow('RUNTIME_DEPENDENCY_UNAVAILABLE:settlement.mutated');
  });

  it('returns a JSON-safe payload without optional undefined values', async () => {
    const runtime = compileBmjaRuntime(await bmjaArtifact());
    const result = runtime.scoreHand({ evidence: ordinary, context }).result;
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
    expect(JSON.stringify(result)).not.toContain('undefined');
  });
});
