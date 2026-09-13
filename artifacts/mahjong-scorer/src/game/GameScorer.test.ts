import { describe, expect, it } from 'vitest';
import { confirmHand, createBmjaGame } from './game';
import { gameRecordRulesLabel, getRoundSettlementPreview, previewRoundSettlement, recoveredGameConflictsWithRoute } from './GameScorer';
import { BMJA_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, resolveRulesProfile, WESTERN_TM_PROFILE_REF } from './ruleset';

describe('game settlement preview', () => {
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
});
