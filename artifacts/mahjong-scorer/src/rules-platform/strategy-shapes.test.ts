import { describe, expect, it } from 'vitest';
import {
  architectureSeedEntries,
  type ExplainedProgressionResult,
  type GameEndResult,
  type ResolvedRoundOutcome,
  type ResolvedStrategyState,
  type RoundResolution,
  type SettlementTransaction,
} from './index';

type McrAcceptedScore = { playerId: string; points: number; flowerPoints: number };
type RiichiAcceptedScore = { winnerId: string; han: number; fu: number };

const mcrResolution: RoundResolution<ResolvedRoundOutcome, McrAcceptedScore> = {
  outcome: { kind: 'mcr-win', payload: { winnerId: 'north', winningMethod: 'discard' } },
  acceptedScores: [{ playerId: 'north', points: 16, flowerPoints: 2 }],
  roundEvidence: { flowerCount: 2, winningTileProvenance: 'discard' },
};

const riichiMultiWinnerResolution: RoundResolution<ResolvedRoundOutcome, RiichiAcceptedScore> = {
  outcome: { kind: 'riichi-ron', payload: { discarderId: 'east' } },
  acceptedScores: [
    { winnerId: 'south', han: 3, fu: 40 },
    { winnerId: 'west', han: 2, fu: 30 },
  ],
};

const riichiExhaustiveDraw: RoundResolution<ResolvedRoundOutcome, RiichiAcceptedScore> = {
  outcome: {
    kind: 'riichi-exhaustive-draw',
    payload: {
      tenpaiPlayerIds: ['east', 'south'],
      notenPlayerIds: ['west', 'north'],
    },
  },
  acceptedScores: [],
  roundEvidence: { wallExhausted: true, tenpaiCount: 2, notenCount: 2 },
};

const threePlayerState: ResolvedStrategyState = {
  kind: 'riichi-sanma.strategy-state',
  payload: {
    seats: { east: 'east', south: 'south', west: 'west' },
    dealerPlayerId: 'east',
    round: 1,
  },
};

type FutureProgressionState = {
  activePlayerId: string;
  dealerRetains: boolean;
  roundIndex: number;
};

const futureProgression: ExplainedProgressionResult<FutureProgressionState> = {
  nextState: { activePlayerId: 'south', dealerRetains: false, roundIndex: 7 },
  reasonId: 'progression.future-family.dealer-passed',
  metadata: { trigger: 'non-dealer-win', previousDealerId: 'east' },
};

describe('#234 neutral strategy shape closure', () => {
  it('represents an MCR accepted round without British settlement fields', () => {
    const neutralTransaction: SettlementTransaction = {
      from: 'player.east', to: 'player.north', amount: 16, reasonId: 'settlement.mcr.payment',
    };

    expect(mcrResolution.acceptedScores).toHaveLength(1);
    expect(mcrResolution.outcome.payload).toMatchObject({ winnerId: 'north', winningMethod: 'discard' });
    expect(neutralTransaction).not.toHaveProperty('eastMultiplier');
    expect(neutralTransaction).not.toHaveProperty('baseAmount');
    expect(neutralTransaction).not.toHaveProperty('reason');
  });

  it('keeps Riichi multiple winners as independently accepted scores', () => {
    const [first, second] = riichiMultiWinnerResolution.acceptedScores;

    expect(riichiMultiWinnerResolution.outcome.kind).toBe('riichi-ron');
    expect(riichiMultiWinnerResolution.acceptedScores).toHaveLength(2);
    expect(first.winnerId).not.toBe(second.winnerId);
    expect(new Set(riichiMultiWinnerResolution.acceptedScores.map((score) => score.winnerId))).toEqual(
      new Set(['south', 'west']),
    );
  });

  it('represents a bounded exhaustive draw with no fabricated winner', () => {
    const payload = riichiExhaustiveDraw.outcome.payload;
    const tenpai = payload.tenpaiPlayerIds as string[];
    const noten = payload.notenPlayerIds as string[];

    expect(riichiExhaustiveDraw.outcome.kind).toBe('riichi-exhaustive-draw');
    expect(riichiExhaustiveDraw.acceptedScores).toEqual([]);
    expect(tenpai).toHaveLength(2);
    expect(noten).toHaveLength(2);
    expect(tenpai.length + noten.length).toBeLessThanOrEqual(4);
    expect(new Set([...tenpai, ...noten]).size).toBe(4);
    expect(payload).not.toHaveProperty('winnerId');
  });

  it('allows a non-player ledger party without player-only fields', () => {
    const potTransaction: SettlementTransaction = {
      from: 'ledger.pot.riichi-honba', to: 'player.south', amount: 300, reasonId: 'settlement.riichi.honba-payout',
      metadata: { handNumber: 7 },
    };

    expect(potTransaction.from).toBe('ledger.pot.riichi-honba');
    expect(potTransaction.to).toBe('player.south');
    expect(potTransaction).not.toHaveProperty('eastMultiplier');
  });

  it('keeps game-end finalisation separate from ordinary settlement', () => {
    const ordinarySettlement: SettlementTransaction = {
      from: 'player.east', to: 'player.south', amount: 1000, reasonId: 'settlement.riichi.ron',
    };
    const gameEnd: GameEndResult = {
      complete: true,
      reasonId: 'game-end.riichi.final-target-reached',
      finalisation: {
        transactions: [{ from: 'ledger.oka', to: 'player.south', amount: 20000, reasonId: 'game-end.riichi.oka' }],
        payload: { finalRanking: ['south', 'east', 'west', 'north'] },
      },
    };

    expect(ordinarySettlement.reasonId).toBe('settlement.riichi.ron');
    expect(gameEnd.finalisation?.transactions).toHaveLength(1);
    expect(gameEnd.finalisation?.transactions?.[0]).not.toEqual(ordinarySettlement);
    expect(gameEnd.finalisation?.payload).toEqual({ finalRanking: ['south', 'east', 'west', 'north'] });
  });

  it('represents a three-player strategy state without North or legacy wind state', () => {
    const seats = threePlayerState.payload.seats as Record<string, string>;

    expect(Object.keys(seats).sort()).toEqual(['east', 'south', 'west']);
    expect(Object.values(seats)).not.toContain('north');
    expect(threePlayerState.payload).not.toHaveProperty('prevailingWind');
    expect(threePlayerState.payload).not.toHaveProperty('eastCycleStartPlayerId');
  });

  it('keeps future progression explanation generic and future seeds non-executable', () => {
    const nextState = futureProgression.nextState as Record<string, unknown>;
    const futureSeeds = architectureSeedEntries.filter((entry) => [
      'settlement.mcr-2006',
      'settlement.riichi-ema-2025-four-player',
      'progression.riichi-ema-2025-renchan',
      'game-end.riichi-ema-2025',
    ].includes(entry.id));

    expect(futureProgression.reasonId).toBe('progression.future-family.dealer-passed');
    expect(futureProgression.metadata).toEqual({ trigger: 'non-dealer-win', previousDealerId: 'east' });
    expect(nextState).not.toHaveProperty('prevailingWind');
    expect(nextState).not.toHaveProperty('eastCycleStartPlayerId');
    expect(futureSeeds).toHaveLength(4);
    expect(futureSeeds.every((entry) => entry.status === 'architecture-only')).toBe(true);
  });
});
