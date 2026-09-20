import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { confirmHand, createBmjaGame } from './game';
import { gameRecordRulesLabel, gameWorkspaceStage, getRoundSettlementPreview, previewRoundSettlement, recoveredGameConflictsWithRoute, selectProfileScoreResult, settlementPreviewPresentation, shouldKeepScoreEntryOpen, shouldShowBritishSetupHelper, shouldShowEditCurrentHandSummary } from './GameScorer';
import { BMJA_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, resolveRulesProfile, WESTERN_TM_PROFILE_REF } from './ruleset';
import { BUZZARD_2000_PROFILE_REF } from './buzzard-2000';
import type { PlayerAmounts, PlayerScoreRecords } from './types';

beforeAll(() => initialiseCurrentRulesRuntimes());

describe('game settlement preview', () => {
  it('keeps a selected non-winner profile result, forced score, and score record as one transition', () => {
    const records = { east: { source: 'manual', finalScore: 100 }, south: { source: 'detailed-scorer', finalScore: 30 } } as unknown as PlayerScoreRecords;
    const first = selectProfileScoreResult({ east: 100, south: 30 }, records, {}, 'south', 'buzzard.incomplete-four-wind-limit', 725);
    expect(first).toEqual({ profileScoreResults: { south: { resultId: 'buzzard.incomplete-four-wind-limit' } }, scores: { east: 100, south: 725 }, scoreRecords: { east: { source: 'manual', finalScore: 100 } } });
    const moved = selectProfileScoreResult(first.scores, first.scoreRecords, first.profileScoreResults, 'west', 'buzzard.incomplete-three-dragon-limit', 725);
    expect(moved).toEqual({ profileScoreResults: { west: { resultId: 'buzzard.incomplete-three-dragon-limit' } }, scores: { east: 100, west: 725 }, scoreRecords: { east: { source: 'manual', finalScore: 100 } } });
    expect(selectProfileScoreResult(moved.scores, moved.scoreRecords, moved.profileScoreResults, '', '', 725)).toEqual({ profileScoreResults: {}, scores: { east: 100 }, scoreRecords: { east: { source: 'manual', finalScore: 100 } } });
  });

  it('clears profile-result-owned score state before a competing incident replaces it', () => {
    const result = selectProfileScoreResult(
      { east: 100, south: 30, west: 20 },
      { east: { source: 'manual', finalScore: 100 }, south: { source: 'manual', finalScore: 30 }, west: { source: 'manual', finalScore: 20 } },
      {}, 'south', 'buzzard.incomplete-four-wind-limit', 725,
    );
    const dangerousDiscard = selectProfileScoreResult(result.scores, result.scoreRecords, result.profileScoreResults, '', '', 725);
    expect(dangerousDiscard).toEqual({ profileScoreResults: {}, scores: { east: 100, west: 20 }, scoreRecords: { east: { source: 'manual', finalScore: 100 }, west: { source: 'manual', finalScore: 20 } } });
  });
  it('only presents the British setup helper for the British profile', () => {
    expect(shouldShowBritishSetupHelper(BMJA_PROFILE_REF)).toBe(true);
    expect(shouldShowBritishSetupHelper(WESTERN_TM_PROFILE_REF)).toBe(false);
    expect(shouldShowBritishSetupHelper(OUTSIDE_THE_BOX_PROFILE_REF)).toBe(false);
  });

  it('uses a truthful human-facing rules label and exact version in printable records', () => {
    expect(gameRecordRulesLabel(OUTSIDE_THE_BOX_PROFILE_REF)).toBe('Club rules · Profile version: 0.1');
    expect(gameRecordRulesLabel(BMJA_PROFILE_REF)).toBe('British / BMJA-style · Profile version: 1.0');
    expect(gameRecordRulesLabel(WESTERN_TM_PROFILE_REF)).toBe('Western — Thompson & Maloney · Profile version: 0.1');
  });

  it('uses the persisted resolved profile and matches confirmation', () => {
    const game = createBmjaGame(
      [
        { id: 'bill', name: 'Bill' },
        { id: 'rod', name: 'Rod' },
        { id: 'ben', name: 'Ben' },
        { id: 'jack', name: 'Jack' },
      ],
      { bill: 'south', rod: 'east', ben: 'west', jack: 'north' },
    );
    const outcome = { type: 'win' as const, winnerId: 'rod' };
    const scores = { bill: 100, rod: 200, ben: 300, jack: 400 };

    const preview = previewRoundSettlement(game, outcome, scores);
    const resolved = resolveRulesProfile(game.setup.rulesProfile).settleRound(
      game.players,
      game.seats,
      { outcome, scores },
    );
    const confirmed = confirmHand(game, { outcome, scores });

    expect(game.setup.rulesProfile).toEqual(BMJA_PROFILE_REF);
    expect(preview).toEqual(resolved);
    expect(confirmed.handHistory[0].settlement).toEqual(preview);
  });

  it('creates games with the exact selected profile/version rather than defaulting to BMJA', () => {
    const players = ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id }));
    const seats = { east: 'east', south: 'south', west: 'west', north: 'north' } as const;
    expect(createBmjaGame(players, seats, undefined, 'full-game', WESTERN_TM_PROFILE_REF).setup.rulesProfile).toEqual(WESTERN_TM_PROFILE_REF);
    expect(createBmjaGame(players, seats, undefined, 'full-game', OUTSIDE_THE_BOX_PROFILE_REF).setup.rulesProfile).toEqual(OUTSIDE_THE_BOX_PROFILE_REF);
    expect(createBmjaGame(players, seats, undefined, 'full-game', BUZZARD_2000_PROFILE_REF, 725).setup).toMatchObject({ rulesProfile: BUZZARD_2000_PROFILE_REF, tableLimit: 725 });
  });

  it('previews the Buzzard exceptional evidence through the same round supplied to confirmation', () => {
    const players = ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id }));
    const game = createBmjaGame(players, { east: 'east', south: 'south', west: 'west', north: 'north' }, undefined, 'full-game', BUZZARD_2000_PROFILE_REF, 600);
    const outcome = { type: 'win' as const, winnerId: 'east' };
    const scores = { east: 100, south: 30, west: 20, north: 10 };
    const dangerous = [{ type: 'buzzard-dangerous-discard' as const, liablePlayerId: 'south', reason: 'one-suit' as const }];
    const preview = previewRoundSettlement(game, outcome, scores, [], dangerous);
    expect(confirmHand(game, { outcome, scores, buzzardIncidents: dangerous }).handHistory[0].settlement).toEqual(preview);
    const incompleteDraft = selectProfileScoreResult(scores, { south: { source: 'manual', finalScore: 30 } }, {}, 'south', 'buzzard.incomplete-four-wind-limit', 600);
    const incomplete = previewRoundSettlement(game, outcome, incompleteDraft.scores, [], [], incompleteDraft.profileScoreResults);
    expect(incomplete.zeroSum).toBe(true);
    expect(confirmHand(game, { outcome, scores: incompleteDraft.scores as PlayerAmounts, scoreRecords: incompleteDraft.scoreRecords, profileScoreResults: incompleteDraft.profileScoreResults }).handHistory[0].settlement).toEqual(incomplete);
  });

  it('keeps recovered profile provenance when a rules-specific route asks for another profile', () => {
    const players = ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id }));
    const seats = { east: 'east', south: 'south', west: 'west', north: 'north' } as const;
    const british = createBmjaGame(players, seats, undefined, 'full-game', BMJA_PROFILE_REF);
    expect(recoveredGameConflictsWithRoute(british, WESTERN_TM_PROFILE_REF)).toBe(true);
    expect(british.setup.rulesProfile).toEqual(BMJA_PROFILE_REF);
    expect(recoveredGameConflictsWithRoute(british, BMJA_PROFILE_REF)).toBe(false);
  });

  it('retains a domain incident error for live preview until the incident is corrected', () => {
    const game = createBmjaGame(
      ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id })),
      { east: 'east', south: 'south', west: 'west', north: 'north' },
      undefined,
      'full-game',
      OUTSIDE_THE_BOX_PROFILE_REF,
    );
    const outcome = { type: 'win' as const, winnerId: 'east' };
    const scores = { east: 100, south: 0, west: 0, north: 0 };
    const incidents = [{ type: 'cannon' as const, liablePlayerId: 'east', noChoiceAccepted: true }];
    const invalid = getRoundSettlementPreview(game, outcome, scores, incidents);

    expect(invalid.settlement).toBeNull();
    expect(invalid.error).toBe('Cannon liable player must not be the winner.');
    expect(() => previewRoundSettlement(game, outcome, scores, incidents)).toThrow(invalid.error!);
    expect(() => confirmHand(game, { outcome, scores, incidents })).toThrow(invalid.error!);

    const corrected = getRoundSettlementPreview(game, outcome, scores, []);
    expect(corrected.error).toBeNull();
    expect(corrected.settlement).not.toBeNull();
  });

  it('only presents payment transactions when a winning hand has all four scores', () => {
    const game = createBmjaGame(
      ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id })),
      { east: 'east', south: 'south', west: 'west', north: 'north' },
    );
    const winning = { type: 'win' as const, winnerId: 'south' };

    expect(settlementPreviewPresentation(game, winning, { east: 56, south: 60 })).toBe('awaiting-scores');
    expect(settlementPreviewPresentation(game, winning, { east: 56, south: 60, west: 40, north: 44 })).toBe('transactions');
    expect(settlementPreviewPresentation(game, { type: 'draw' }, {})).toBe('no-payments');
  });

  it('keeps manual score entry structurally stable until settlement is deliberately reviewed', () => {
    expect(shouldKeepScoreEntryOpen('entry', false)).toBe(true);
    expect(shouldKeepScoreEntryOpen('settlement', true)).toBe(true);
    expect(shouldKeepScoreEntryOpen('settlement', false)).toBe(false);
    expect(shouldShowEditCurrentHandSummary('settlement', true)).toBe(false);
    expect(shouldShowEditCurrentHandSummary('settlement', false)).toBe(true);
  });

  it('uses a deliberate settlement-review boundary instead of changing context on score input', () => {
    const game = createBmjaGame(
      ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id })),
      { east: 'east', south: 'south', west: 'west', north: 'north' },
    );
    expect(gameWorkspaceStage(game, 'awaiting-scores', false)).toBe('entry');
    expect(gameWorkspaceStage(game, 'transactions', false)).toBe('entry');
    expect(gameWorkspaceStage(game, 'transactions', true)).toBe('settlement');
    expect(gameWorkspaceStage(game, 'no-payments', true)).toBe('settlement');

    expect(gameWorkspaceStage({ ...game, isComplete: true }, 'awaiting-scores', false)).toBe('complete');
  });
});
