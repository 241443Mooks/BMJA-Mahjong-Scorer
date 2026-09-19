import { describe, expect, it } from 'vitest';
import { bonus, dragon, scoreHand, set, suited, validateHand, wind, type GameContext, type MahjongHand } from '../scoring';
import { bmjaSpecialHandBindings } from '../scoring/special-hands';
import { westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { BMJA_RULESET, WESTERN_TM_RULESET } from '../game/ruleset';
import { progressBmjaGame } from '../game/progression';
import { settleBmjaRound } from '../game/settlement';
import type { GamePlayer, ProgressionState, SeatAssignments } from '../game/types';
import { compileRulesRuntime } from './classical-runtime';
import { currentPlayableResolverEnvironment } from './current-profiles';
import { resolvePlayableProfile } from './resolver';
import type { ResolvedProfileArtifact } from './types';

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
const westernTmArtifact = () => resolvePlayableProfile({ id: 'western-tm', version: '0.1' }, currentPlayableResolverEnvironment);
const breakdown = (result: ReturnType<ReturnType<typeof compileRulesRuntime>['scoreHand']>) =>
  (result.result as unknown as { breakdown: ReturnType<typeof scoreHand> }).breakdown;

describe('BMJA compiled current runtime', () => {
  it('preserves ordinary and special legacy scoring through the sealed artifact', async () => {
    const runtime = compileRulesRuntime(await bmjaArtifact());
    expect(breakdown(runtime.scoreHand({ evidence: ordinary, context }))).toEqual(scoreHand(ordinary, context, bmjaSpecialHandBindings));
    expect(breakdown(runtime.scoreHand({ evidence: special, context }))).toEqual(scoreHand(special, context, bmjaSpecialHandBindings));
    expect(runtime.scoreHand({ evidence: special, context }).matchedCanonicalPatternIds).toContain('thirteen-unique-wonders');
  });

  it('preserves validation and current Classical table/hand-mode adapters', async () => {
    const runtime = compileRulesRuntime(await bmjaArtifact());
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
    const artifact = await bmjaArtifact(); const runtime = compileRulesRuntime(artifact);
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
    expect(() => compileRulesRuntime(mismatched)).toThrow('Unknown current validation implementation: validation.classical-current@2');
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
    expect(() => compileRulesRuntime(mutated)).toThrow('RUNTIME_DEPENDENCY_UNAVAILABLE:settlement.mutated');
  });

  it('returns a JSON-safe payload without optional undefined values', async () => {
    const runtime = compileRulesRuntime(await bmjaArtifact());
    const result = runtime.scoreHand({ evidence: ordinary, context }).result;
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
    expect(JSON.stringify(result)).not.toContain('undefined');
  });
});

// These are the authoritative Run-2A fixtures from game/western-tm-profile.test.ts.
const threeGreatScholars: MahjongHand = {
  sets: [
    set('red', 'pung', dragon('red')), set('green', 'pung', dragon('green')),
    set('white', 'pung', dragon('white')), set('other', 'pung', suited('circles', 4)),
    set('pair', 'pair', suited('bamboo', 2)),
  ], bonusTiles: [], isWinner: true,
};
const threeGreatScholarsFishing: MahjongHand = {
  sets: [
    set('red', 'pung', dragon('red')), set('green', 'pung', dragon('green')),
    set('other', 'pung', suited('circles', 4)), set('pair', 'pair', suited('bamboo', 2)),
  ], remainingTiles: [dragon('white'), dragon('white')], bonusTiles: [], isWinner: false,
};
const westernOrdinary: MahjongHand = {
  sets: [
    set('red', 'pung', dragon('red'), 'exposed'), set('chow', 'chow', suited('bamboo', 2), 'exposed'),
    set('minor', 'pung', suited('bamboo', 5)), set('terminal', 'pung', suited('bamboo', 9)),
    set('pair', 'pair', wind('south')),
  ], bonusTiles: [bonus('flower', 2)], isWinner: true, winningMethod: 'wall',
};

describe('T&M compiled current runtime', () => {
  const westernContext: GameContext = { ...context, playerWind: 'east' };

  it('selects the authoritative profile-local Three Great Scholars binding and fishing values', async () => {
    const runtime = compileRulesRuntime(await westernTmArtifact());
    expect(breakdown(runtime.scoreHand({ evidence: threeGreatScholars, context: westernContext }))).toEqual(
      scoreHand(threeGreatScholars, westernContext, westernTmSpecialHandBindings),
    );
    expect(breakdown(runtime.scoreHand({ evidence: threeGreatScholars, context: westernContext })).finalScore).toBe(1500);
    expect(BMJA_RULESET.scoreHand({ hand: threeGreatScholars, playerWind: 'east', prevailingWind: 'east' }).finalScore).toBe(1000);
    expect(breakdown(runtime.scoreHand({ evidence: threeGreatScholarsFishing, context: westernContext })).finalScore).toBe(600);
    expect(BMJA_RULESET.scoreHand({ hand: threeGreatScholarsFishing, playerWind: 'east', prevailingWind: 'east' })).toMatchObject({ finalScore: 400, specialFishing: { fishingValue: 400 } });
    expect(WESTERN_TM_RULESET.scoreHand({ hand: threeGreatScholarsFishing, playerWind: 'east', prevailingWind: 'east' })).toMatchObject({ finalScore: 600, specialFishing: { fishingValue: 600 } });
  });

  it('preserves ordinary shared scoring, selected T&M validation, and shared table strategies', async () => {
    const runtime = compileRulesRuntime(await westernTmArtifact());
    const western = breakdown(runtime.scoreHand({ evidence: westernOrdinary, context }));
    const bmja = scoreHand(westernOrdinary, context, bmjaSpecialHandBindings);
    expect(western).toMatchObject({ basePoints: bmja.basePoints, doubles: bmja.doubles, calculationComponents: bmja.calculationComponents, finalScore: bmja.finalScore });
    expect(runtime.validateHand({ evidence: threeGreatScholars, context: westernContext })).toEqual(
      validateHand(threeGreatScholars, westernContext, westernTmSpecialHandBindings),
    );
    expect(runtime.nextHandMode({})).toBe('normal');
    const round = { outcome: { type: 'win' as const, winnerId: 'b' }, scores: { a: 100, b: 200, c: 300, d: 400 } };
    expect(runtime.settleRound({ players, seats, round }).map(({ from, to, amount }) => ({ from, to, amount }))).toEqual(
      settleBmjaRound(players, seats, round).transactions.map(({ fromPlayerId, toPlayerId, amount }) => ({ from: fromPlayerId, to: toPlayerId, amount })),
    );
    const directProgression = progressBmjaGame(players, progression, { type: 'win', winnerId: 'c' });
    const adaptedProgression = runtime.progressGame({ players, current: progression, outcome: { type: 'win', winnerId: 'c' } });
    expect(adaptedProgression.nextState).toEqual({
      seats: directProgression.seats,
      prevailingWind: directProgression.prevailingWind,
      eastCycleStartPlayerId: directProgression.eastCycleStartPlayerId,
    });
    expect(adaptedProgression.metadata).toMatchObject({
      seatsRotated: directProgression.seatsRotated,
      prevailingWindAdvanced: directProgression.prevailingWindAdvanced,
    });
  });

  it('retains only the T&M binding and policy identities in its trace', async () => {
    const runtime = compileRulesRuntime(await westernTmArtifact());
    expect(runtime.scoreHand({ evidence: threeGreatScholars, context: westernContext }).decisionTrace).toContainEqual(
      expect.objectContaining({ id: 'classical-runtime.scoring', identities: { ruleId: 'classical.scorer.current@1', bindingId: 'classical.bindings.western-tm-current@1', policyId: 'classical.policy.western-tm-current@1' } }),
    );
  });

  it('fails closed for an unimplemented selected scorer/binding/policy tuple', async () => {
    const artifact = await westernTmArtifact();
    const unimplemented = {
      ...artifact,
      profile: { ...artifact.profile, scoring: { ...artifact.profile.scoring, config: { ...artifact.profile.scoring.config, bindingId: 'classical.bindings.bmja-current' } } },
      executableDependencies: artifact.executableDependencies.map((dependency) =>
        dependency.id === 'classical.bindings.western-tm-current'
          ? { ...dependency, id: 'classical.bindings.bmja-current' } : dependency,
      ),
    } as ResolvedProfileArtifact;
    expect(() => compileRulesRuntime(unimplemented)).toThrow(
      'RUNTIME_SCORING_IMPLEMENTATION_UNAVAILABLE:classical.scorer.current@1|classical.bindings.bmja-current@1|classical.policy.western-tm-current@1',
    );
  });
});
