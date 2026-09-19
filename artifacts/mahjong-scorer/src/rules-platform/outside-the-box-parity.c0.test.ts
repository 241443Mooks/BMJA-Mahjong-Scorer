import { describe, expect, it } from 'vitest';
import { bonus, dragon, set, suited, wind, type MahjongHand } from '../scoring';
import { confirmHand, createBmjaGame } from '../game/game';
import { OUTSIDE_THE_BOX_PROFILE_REF } from '../game/ruleset';
import type { GamePlayer, HandScoreInput, ProgressionState, SeatAssignments } from '../game/types';
import {
  aggregateTransactionEffects,
  createParityHarness,
  jsonNormalise,
  platformScoreInput,
  projectSettlementTransactions,
  runtimeBreakdown,
} from './parity-harness.test-support';

// Curated source fixtures: outside-the-box-scoring/goulash/incidents/readiness and outside-the-box-strategies tests.
const players: GamePlayer[] = ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id }));
const seats: SeatAssignments = { east: 'east', south: 'south', west: 'west', north: 'north' };
const scores = { east: 100, south: 30, west: 20, north: 10 };
const progression: ProgressionState = { seats: { east: 'east', south: 'south', west: 'west', north: 'north' }, prevailingWind: 'east', eastCycleStartPlayerId: 'east' };
const context = { playerWind: 'east' as const, prevailingWind: 'east' as const };
const hand = (sets: MahjongHand['sets'], bonusTiles: MahjongHand['bonusTiles'] = []): MahjongHand => ({ sets, bonusTiles, isWinner: true, winningMethod: 'wall' });
const harness = createParityHarness(OUTSIDE_THE_BOX_PROFILE_REF);

const ordinary = hand([
  set('r', 'pung', dragon('red')), set('g', 'pung', dragon('green')), set('c', 'pung', suited('circles', 4)),
  set('d', 'chow', suited('characters', 2)), set('pair', 'pair', dragon('white')),
]);
const buriedTreasure = hand([
  set('a', 'pung', suited('bamboo', 2)), set('b', 'pung', suited('bamboo', 3)), set('c', 'pung', suited('bamboo', 4)),
  set('d', 'pung', wind('east')), set('pair', 'pair', suited('bamboo', 5)),
], [bonus('flower', 1)]);
const purity = hand([
  set('a', 'pung', suited('characters', 2)), set('b', 'pung', suited('characters', 3)), set('c', 'pung', suited('characters', 4)),
  set('d', 'kong', suited('characters', 6)), set('pair', 'pair', suited('characters', 8)),
]);
const goulash: MahjongHand = {
  sets: [
    set('a', 'pung', suited('bamboo', 2)), { ...set('b', 'kong', wind('east')), blankTileIds: ['blank-east-1', 'blank-east-2'] },
    set('c', 'pung', suited('characters', 4)), set('d', 'pung', suited('circles', 6)), set('pair', 'pair', suited('bamboo', 8)),
  ], bonusTiles: [], isWinner: true,
};

describe('outside-the-box@0.1 C0 curated migration matrix', () => {
  const scoreParity = async (input: HandScoreInput) => {
    const { legacy, runtime } = await harness;
    expect(jsonNormalise(runtimeBreakdown(legacy, runtime, input))).toEqual(jsonNormalise(legacy.scoreHand(input)));
  };

  it('game/outside-the-box-scoring.test.ts ordinary policy and low cap — full breakdown parity', async () => {
    const input = { hand: ordinary, ...context, limit: 100 };
    await scoreParity(input);
    const { legacy } = await harness;
    expect(legacy.scoreHand(input)).toMatchObject({ finalScore: 100, limitApplied: true });
  });

  it('game/outside-the-box-readiness.test.ts fixed special plus bonus above ordinary limit — full breakdown parity', async () => {
    const input = { hand: buriedTreasure, ...context, limit: 1000 };
    await scoreParity(input);
    const { legacy } = await harness;
    expect(legacy.scoreHand(input)).toMatchObject({ finalScore: 1008, uncappedScore: 1008, limitApplied: false });
  });

  it('game/outside-the-box-scoring.test.ts provenance-sensitive pair completion and Purity — full breakdown parity', async () => {
    const input = { hand: { ...purity, winningTileProvenance: { tile: suited('characters', 8), target: { type: 'grouped-set' as const, setId: 'pair' } } }, ...context };
    await scoreParity(input);
    const { legacy } = await harness;
    expect(legacy.scoreHand(input).calculationComponents).toContainEqual(expect.objectContaining({ id: 'purity-playing-tiles', base: 52, subtotal: 416 }));
  });

  it('game/outside-the-box-goulash.test.ts blank Goulash scoring/validation and draw-to-Goulash/win-to-normal — parity', async () => {
    const input = { hand: goulash, ...context, handMode: 'goulash' as const };
    const { legacy, runtime } = await harness;
    await scoreParity(input);
    expect(runtime.validateHand(platformScoreInput(legacy, input))).toEqual(legacy.scoreHand(input).validationErrors);
    expect(runtime.nextHandMode({ current: 'normal', outcome: { type: 'draw' } })).toBe(legacy.nextHandMode('normal', { type: 'draw' }));
    expect(runtime.nextHandMode({ current: 'goulash', outcome: { type: 'win', winnerId: 'east' } })).toBe(legacy.nextHandMode('goulash', { type: 'win', winnerId: 'east' }));
  });

  it('game/outside-the-box-incidents.test.ts incorrect-hand preparation normalisation — exact pre-settlement parity', async () => {
    const round = { outcome: { type: 'win' as const, winnerId: 'east' }, scores, scoreRecords: { south: { source: 'manual' as const, finalScore: 30 } }, incidents: [{ type: 'incorrect-hand' as const, playerId: 'south', condition: 'too-many' as const }] };
    const { legacy, runtime } = await harness;
    expect(runtime.prepareRound!({ players, seats, round })).toEqual(legacy.prepareRound!(players, seats, round));
  });

  it.each([
    ['ordinary settlement', { outcome: { type: 'win' as const, winnerId: 'south' }, scores }],
    ['false-name Mah Jong liability', { outcome: { type: 'win' as const, winnerId: 'east' }, scores, incidents: [{ type: 'false-discard-name' as const, discarderId: 'south', claimantId: 'east', result: 'mah-jong' as const }] }],
    ['Cannon liability', { outcome: { type: 'win' as const, winnerId: 'south' }, scores, incidents: [{ type: 'cannon' as const, liablePlayerId: 'east', danger: 'one-suit' as const, noChoiceAccepted: false }] }],
    ['accepted No Choice restores ordinary settlement', { outcome: { type: 'win' as const, winnerId: 'south' }, scores, incidents: [{ type: 'cannon' as const, liablePlayerId: 'east', noChoiceAccepted: true }] }],
    ['exposed false Mah Jong penalty', { outcome: { type: 'draw' as const }, scores: { east: 0, south: 0, west: 0, north: 0 }, incidents: [{ type: 'false-mah-jong' as const, declarerId: 'east', anyHandExposed: true }] }],
  ])('game/outside-the-box-incidents.test.ts %s — settlement transaction and balance parity', async (_name, round) => {
    const { legacy, runtime } = await harness;
    const direct = legacy.settleRound(players, seats, round); const platform = runtime.settleRound({ players, seats, round });
    expect(projectSettlementTransactions(platform)).toEqual(direct.transactions);
    expect(aggregateTransactionEffects(players.map(({ id }) => id), platform)).toEqual(direct.changes);
  });

  it('rules-platform/outside-the-box-strategies.test.ts ordinary false-name claimed recipient gap — fail-closed parity', async () => {
    const round = { outcome: { type: 'win' as const, winnerId: 'east' }, scores, incidents: [{ type: 'false-discard-name' as const, discarderId: 'south', claimantId: 'east', result: 'claimed' as const }] };
    const { legacy, runtime } = await harness;
    expect(() => legacy.settleRound(players, seats, round)).toThrow('recipient is not established');
    expect(() => runtime.settleRound({ players, seats, round })).toThrow('recipient is not established');
  });

  it('game/outside-the-box-readiness.test.ts representative progression and game completion — parity', async () => {
    const { legacy, runtime } = await harness;
    const outcome = { type: 'win' as const, winnerId: 'south' };
    const direct = legacy.progressGame(players, progression, outcome); const platform = runtime.progressGame({ players, current: progression, outcome });
    expect(platform.nextState).toEqual({ seats: direct.seats, prevailingWind: direct.prevailingWind, eastCycleStartPlayerId: direct.eastCycleStartPlayerId });
    let game = createBmjaGame(players, seats, undefined, 'one-round', OUTSIDE_THE_BOX_PROFILE_REF);
    const zeroes = { east: 0, south: 0, west: 0, north: 0 };
    for (let rotation = 0; rotation < 4; rotation += 1) {
      const winnerId = Object.entries(game.seats).find(([, seat]) => seat === 'south')?.[0];
      if (!winnerId) throw new Error('Expected a South player.');
      const previousPrevailingWind = game.prevailingWind;
      game = confirmHand(game, { outcome: { type: 'win', winnerId }, scores: zeroes });
      if (rotation === 3) expect(runtime.evaluateGameEnd({ gameLength: 'one-round', previousPrevailingWind, progression: { prevailingWindAdvanced: true } }))
        .toEqual({ complete: game.isComplete, reasonId: 'game-end.classical-east-cycle.one-round-complete' });
    }
    expect(game.isComplete).toBe(true);
  });

  it('rules-platform/current-profiles.test.ts exact OTB binding/policy/settlement/incident/hand-mode audit identity', async () => {
    const { legacy, runtime } = await harness;
    const scored = runtime.scoreHand(platformScoreInput(legacy, { hand: ordinary, ...context }));
    expect(scored.decisionTrace).toContainEqual(expect.objectContaining({ id: 'classical-runtime.scoring', identities: { ruleId: 'classical.scorer.current@1', bindingId: 'classical.bindings.outside-the-box-current@1', policyId: 'classical.policy.outside-the-box-current@1' } }));
    expect(runtime.artifact.executableDependencies.map(({ id, semanticRevision }) => `${id}@${semanticRevision}`)).toEqual(expect.arrayContaining([
      'settlement.outside-the-box-incidents@1', 'hand-mode.outside-the-box-goulash@1', 'incident.outside-the-box-round-preparation@1',
    ]));
  });
});
