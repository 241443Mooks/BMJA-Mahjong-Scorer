import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { confirmHand, createBmjaGame, replayGame, undoLastHand } from './game';
import { OUTSIDE_THE_BOX_PROFILE_REF } from './ruleset';
import { previewRoundSettlement } from './GameScorer';

beforeAll(() => initialiseCurrentRulesRuntimes());

const players = ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id }));
const seats = { east: 'east', south: 'south', west: 'west', north: 'north' } as const;
const scores = { east: 100, south: 30, west: 20, north: 10 };
const game = () => createBmjaGame(players, seats, undefined, 'full-game', OUTSIDE_THE_BOX_PROFILE_REF);

describe('Outside the Box round incidents', () => {
  it('normalises a too-many score and preserves it through replay and undo', () => {
    const first = confirmHand(game(), { outcome: { type: 'win', winnerId: 'east' }, scores, scoreRecords: { south: { source: 'manual', finalScore: 30 } }, incidents: [{ type: 'incorrect-hand', playerId: 'south', condition: 'too-many' }] });
    expect(first.handHistory[0].scores.south).toBe(0);
    expect(first.handHistory[0].scoreRecords.south).toBeDefined(); // canonical manual zero record
    expect(first.handHistory[0].incidents).toHaveLength(1);
    expect(replayGame(first.setup, first.handHistory.map(({ outcome, scores: savedScores, scoreRecords, incidents }) => ({ outcome, scores: savedScores, scoreRecords, incidents }))).balances).toEqual(first.balances);
    expect(undoLastHand(first).handHistory).toEqual([]);
  });

  it('rejects ineligible winners and unsupported-profile incidents', () => {
    expect(() => confirmHand(game(), { outcome: { type: 'win', winnerId: 'east' }, scores, incidents: [{ type: 'wrong-tile-claim', playerId: 'east', correctedBeforeNextDraw: false }] })).toThrow(/ineligible/);
    expect(() => confirmHand(createBmjaGame(players, seats), { outcome: { type: 'draw' }, scores: { east: 0, south: 0, west: 0, north: 0 }, incidents: [{ type: 'cannon', liablePlayerId: 'south', noChoiceAccepted: false }] })).toThrow(/does not support/);
  });

  it('collapses false-name Mah Jong and cannon liability using actual winner shares', () => {
    const falseName = confirmHand(game(), { outcome: { type: 'win', winnerId: 'east' }, scores, incidents: [{ type: 'false-discard-name', discarderId: 'south', claimantId: 'east', result: 'mah-jong' }] }).handHistory[0].settlement;
    expect(falseName.transactions).toEqual([expect.objectContaining({ fromPlayerId: 'south', toPlayerId: 'east', amount: 600, reason: 'false-name-mah-jong-liability', eastMultiplier: 1 })]);
    const cannon = confirmHand(game(), { outcome: { type: 'win', winnerId: 'south' }, scores, incidents: [{ type: 'cannon', liablePlayerId: 'east', danger: 'one-suit', noChoiceAccepted: false }] }).handHistory[0].settlement;
    expect(cannon.transactions).toEqual([expect.objectContaining({ fromPlayerId: 'east', toPlayerId: 'south', amount: 120, reason: 'cannon-liability' })]);
  });

  it('restores ordinary settlement for accepted No choice and adds exposed false-Mah-Jong payments', () => {
    const ordinary = previewRoundSettlement(game(), { type: 'win', winnerId: 'south' }, scores);
    const noChoice = previewRoundSettlement(game(), { type: 'win', winnerId: 'south' }, scores, [{ type: 'cannon', liablePlayerId: 'east', noChoiceAccepted: true }]);
    expect(noChoice).toEqual(ordinary);
    const draw = confirmHand(game(), { outcome: { type: 'draw' }, scores: { east: 0, south: 0, west: 0, north: 0 }, incidents: [{ type: 'false-mah-jong', declarerId: 'east', anyHandExposed: true }] });
    expect(draw.handHistory[0].settlement.transactions.filter((transaction) => transaction.reason === 'false-mah-jong-penalty')).toHaveLength(3);
    expect(draw.balances.east).toBe(-1500);
  });

  it('validates Cannon as an event even when No choice is accepted', () => {
    expect(() => confirmHand(game(), { outcome: { type: 'draw' }, scores: { east: 0, south: 0, west: 0, north: 0 }, incidents: [{ type: 'cannon', liablePlayerId: 'south', noChoiceAccepted: true }] })).toThrow(/Cannon requires a winning hand/);
    expect(() => confirmHand(game(), { outcome: { type: 'win', winnerId: 'east' }, scores, incidents: [{ type: 'cannon', liablePlayerId: 'east', noChoiceAccepted: true }] })).toThrow(/must not be the winner/);
    const confirmed = confirmHand(game(), { outcome: { type: 'win', winnerId: 'south' }, scores, incidents: [{ type: 'cannon', liablePlayerId: 'east', noChoiceAccepted: true }] });
    expect(confirmed.handHistory[0].incidents).toEqual([{ type: 'cannon', liablePlayerId: 'east', noChoiceAccepted: true }]);
    expect(confirmed.handHistory[0].settlement).toEqual(previewRoundSettlement(game(), { type: 'win', winnerId: 'south' }, scores));
  });

  it('retains lawful non-winner scores while enforcing eligibility and override conflicts', () => {
    const tooFew = confirmHand(game(), { outcome: { type: 'win', winnerId: 'east' }, scores, incidents: [{ type: 'incorrect-hand', playerId: 'south', condition: 'too-few' }] });
    expect(tooFew.handHistory[0].scores.south).toBe(30);
    expect(() => confirmHand(game(), { outcome: { type: 'win', winnerId: 'south' }, scores, incidents: [{ type: 'incorrect-hand', playerId: 'south', condition: 'too-few' }] })).toThrow(/ineligible/);
    const timely = confirmHand(game(), { outcome: { type: 'win', winnerId: 'east' }, scores, incidents: [{ type: 'wrong-tile-claim', playerId: 'south', correctedBeforeNextDraw: true }] });
    expect(timely.handHistory[0].scores.south).toBe(30);
    expect(() => confirmHand(game(), { outcome: { type: 'win', winnerId: 'east' }, scores, incidents: [{ type: 'cannon', liablePlayerId: 'south', noChoiceAccepted: false }, { type: 'false-discard-name', discarderId: 'west', claimantId: 'east', result: 'mah-jong' }] })).toThrow(/Only one active/);
  });

  it('keeps no-exposure false Mah Jong and timely wrong claims non-penalising', () => {
    const noExposure = confirmHand(game(), { outcome: { type: 'draw' }, scores: { east: 0, south: 0, west: 0, north: 0 }, incidents: [{ type: 'false-mah-jong', declarerId: 'east', anyHandExposed: false }] });
    expect(noExposure.handHistory[0].settlement.transactions).toEqual([]);
    expect(noExposure.currentHandMode).toBe('goulash');
  });
});
