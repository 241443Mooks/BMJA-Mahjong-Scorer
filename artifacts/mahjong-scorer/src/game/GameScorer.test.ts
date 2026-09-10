import { describe, expect, it } from 'vitest';
import { confirmHand, createBmjaGame } from './game';
import { previewRoundSettlement } from './GameScorer';
import { BMJA_PROFILE_REF, resolveRulesProfile } from './ruleset';

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
});
