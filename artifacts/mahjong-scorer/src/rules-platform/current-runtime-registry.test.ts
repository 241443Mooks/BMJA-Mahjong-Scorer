import { describe, expect, it } from 'vitest';
import { currentPlayableProfiles } from './current-profiles';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { MCR_WMO_2006_PROFILE } from './mcr-profile';
import {
  getCurrentCompiledRulesRuntime,
  getCurrentRulesRuntime,
  initialiseCurrentRulesRuntimes,
} from './current-runtime-registry';
import type { McrScoringInput } from './mcr-scoring-input';
import type { FourWindAlwaysPassState } from './four-wind-always-pass-strategies';

const tile = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => ({ face: { family: 'suit' as const, suit, rank } });
const wind = (value: 'east' | 'south' | 'west' | 'north') => ({ face: { family: 'wind' as const, wind: value } });
const sevenPairs: McrScoringInput = {
  evidence: { fixedGroups: [], freeTiles: [tile('characters', 1), tile('characters', 1), tile('characters', 2), tile('characters', 2), tile('dots', 3), tile('dots', 3), tile('dots', 4), tile('dots', 4), tile('bamboo', 5), tile('bamboo', 5), tile('bamboo', 6), tile('bamboo', 6), wind('east'), wind('east')], winningTile: wind('east'), flowerCount: 0 },
  context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false },
};

const currentRefs = currentPlayableProfiles.map(({ identity }) => ({
  id: identity.id,
  version: identity.version,
}));

describe('current runtime registry', () => {
  it('fails explicitly before application bootstrap has completed', () => {
    expect(() => getCurrentRulesRuntime(currentRefs[0]!))
      .toThrow('CURRENT_RULES_RUNTIMES_NOT_INITIALISED');
  });

  it('initialises and retrieves every exact current profile artifact', async () => {
    await initialiseCurrentRulesRuntimes();
    expect(currentRefs).toHaveLength(4);
    for (const ref of currentRefs) {
      const runtime = getCurrentRulesRuntime(ref);
      expect(runtime.artifact.profile.identity).toMatchObject(ref);
      expect(runtime.artifact.rulesFingerprint).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it('bootstraps five sealed artifacts while exposing MCR only in the standalone public inventory', async () => {
    await initialiseCurrentRulesRuntimes();
    expect(currentPlayableProfiles.map(({ identity }) => identity.id)).toEqual(['bmja', 'western-tm', 'outside-the-box', 'buzzard-2000']);
    expect(PUBLIC_RULES_DESCRIPTORS).toHaveLength(5);
    expect(PUBLIC_RULES_DESCRIPTORS.some(({ profile }) => profile.id === MCR_WMO_2006_PROFILE.identity.id)).toBe(true);
    const compiled = getCurrentCompiledRulesRuntime({ id: 'mcr-wmo-2006', version: '0.1' });
    expect(compiled.grammar).toBe('pattern-accumulator');
    expect(compiled.artifact.profile.identity).toMatchObject({ id: 'mcr-wmo-2006', version: '0.1' });
    expect(compiled.artifact.rulesFingerprint).toBe('8044ee6ee883192bae97e83a67380f6c0bff999179df93229fc9daa4308a7ace');
    expect(compiled.artifact.executableDependencies).toHaveLength(17);
    if (compiled.grammar !== 'pattern-accumulator') throw new Error('Expected MCR runtime');
    const runtime = compiled.runtime;
    expect(runtime.requiredEvidence()).toEqual(['evidence.resolved-win-event', 'evidence.winning-method']);
    expect(runtime.validateHand(sevenPairs)).toEqual({ valid: true });
    const score = runtime.scoreHand(sevenPairs);
    expect(score).toMatchObject({ grammar: 'pattern-accumulator', legal: true, disposition: { kind: 'scored' }, result: { unit: 'points', total: 24 } });
    const transactions = runtime.settleRound({ participants: ['east', 'south', 'west', 'north'], round: { outcome: { kind: 'mcr-win', payload: { winnerId: 'east', winSource: 'discard', discarderId: 'south' } }, acceptedScores: [{ playerId: 'east', score }] } });
    expect(transactions).toEqual([
      { from: 'south', to: 'east', amount: 32, reasonId: 'settlement.mcr-2006.discarder-payment', metadata: { basicPoints: 24, fixedComponent: 8, winSource: 'discard', payerRole: 'discarder' } },
      { from: 'west', to: 'east', amount: 8, reasonId: 'settlement.mcr-2006.other-player-base-payment', metadata: { basicPoints: 24, fixedComponent: 8, winSource: 'discard', payerRole: 'other-player' } },
      { from: 'north', to: 'east', amount: 8, reasonId: 'settlement.mcr-2006.other-player-base-payment', metadata: { basicPoints: 24, fixedComponent: 8, winSource: 'discard', payerRole: 'other-player' } },
    ]);
    const participants = ['p1', 'p2', 'p3', 'p4'];
    const ordinary = runtime.progressGame({ participants, current: { seats: { p1: 'east', p2: 'south', p3: 'west', p4: 'north' }, prevailingWind: 'east', dealerCycleStartPlayerId: 'p1' }, round: { outcome: { kind: 'mcr-draw', payload: {} }, acceptedScores: [] } });
    expect(ordinary.metadata).toMatchObject({ seatsRotated: true, dealerCycleCompleted: false });
    expect(ordinary.nextState.seats).toEqual({ p1: 'north', p2: 'east', p3: 'south', p4: 'west' });
    const northState: FourWindAlwaysPassState = { seats: { p1: 'east', p2: 'south', p3: 'west', p4: 'north' }, prevailingWind: 'north', dealerCycleStartPlayerId: 'p2' };
    const terminal = runtime.progressGame({ participants, current: northState, round: { outcome: { kind: 'mcr-draw', payload: {} }, acceptedScores: [] } });
    expect(runtime.evaluateGameEnd({ participants, previous: northState, progression: terminal })).toEqual({ complete: true, reasonId: 'game-end.four-round-always-pass.four-rounds-complete' });
  });

  it('is safe for repeated and concurrent bootstrap calls', async () => {
    await Promise.all(Array.from({ length: 4 }, () => initialiseCurrentRulesRuntimes()));
    expect(getCurrentRulesRuntime(currentRefs[0]!)).toBe(getCurrentRulesRuntime(currentRefs[0]!));
  });

  it('rejects an unknown exact version rather than selecting a fallback', () => {
    expect(() => getCurrentRulesRuntime({ id: currentRefs[0]!.id, version: '9.9' }))
      .toThrow(`CURRENT_RULES_RUNTIME_UNAVAILABLE:${currentRefs[0]!.id}@9.9`);
  });
});
