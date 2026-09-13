import { describe, expect, it } from 'vitest';
import { confirmHand, createBmjaGame } from './game';
import { getRoundSettlementPreview, previewRoundSettlement } from './GameScorer';
import { BMJA_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, resolveRulesProfile } from './ruleset';

describe('game settlement preview', () => {
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
