import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes, getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import type { McrScoreContext, McrScoringInput } from '../rules-platform/mcr-scoring-input';
import type { HandScoreResult } from '../rules-platform/types';
import { confirmHand, createGame, replayGame, undoLastHand } from './game';
import type { GamePlayer, GameState, McrAcceptedScoreRecord, McrRoundInput, PlayerAmounts, RulesProfileRef, SeatAssignments } from './types';
import { GAME_SNAPSHOT_STORAGE_KEY, loadGameRecoveryCore, loadInProgressGameRecoveryCore, saveGameRecoveryV2, type PersistedCurrentRoundV2 } from './persistence';

const ref: RulesProfileRef = { id: 'mcr-wmo-2006', version: '0.1' };
const fingerprint = '8044ee6ee883192bae97e83a67380f6c0bff999179df93229fc9daa4308a7ace';
const players: GamePlayer[] = ['A', 'B', 'C', 'D'].map((id) => ({ id, name: id }));
const seats: SeatAssignments = { A: 'east', B: 'south', C: 'west', D: 'north' };
const zeros: PlayerAmounts = { A: 0, B: 0, C: 0, D: 0 };
const draw: McrRoundInput = { mcrOutcome: { type: 'mcr-draw' }, scores: { ...zeros } };
const sevenPairs: McrScoringInput = {
  evidence: { fixedGroups: [], freeTiles: [
    ...([['characters',1],['characters',1],['characters',2],['characters',2],['dots',3],['dots',3],['dots',4],['dots',4],['bamboo',5],['bamboo',5],['bamboo',6],['bamboo',6]] as const).map(([suit, rank]) => ({ face: { family: 'suit' as const, suit, rank } })),
    { face: { family: 'wind', wind: 'east' } }, { face: { family: 'wind', wind: 'east' } },
  ], winningTile: { face: { family: 'wind', wind: 'east' } }, flowerCount: 0 },
  context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false },
};
const accepted = (playerId = 'A', winSource: 'discard' | 'self-draw' = 'discard', context: Partial<McrScoreContext> = {}) : McrAcceptedScoreRecord => {
  const compiled = getCurrentCompiledRulesRuntime(ref);
  if (compiled.grammar !== 'pattern-accumulator') throw new Error('Expected pattern-accumulator runtime');
  const input: McrScoringInput = { ...sevenPairs, context: { ...sevenPairs.context, ...context, winSource } };
  const result: Extract<HandScoreResult, { grammar: 'pattern-accumulator' }> = compiled.runtime.scoreHand(input);
  return { source: 'mcr-detailed-scorer', playerId, rulesProfile: { ...ref }, rulesFingerprint: fingerprint, hand: { sets: [], looseTiles: [], bonusTiles: [], isWinner: true }, input, result, finalScore: result.result.total };
};
const win = (record: McrAcceptedScoreRecord, winSource: 'discard' | 'self-draw', discarderId?: string): McrRoundInput => ({
  mcrOutcome: { type: 'mcr-win', winnerId: record.playerId, winSource, ...(winSource === 'discard' ? { discarderId } : {}) },
  scores: { ...zeros, [record.playerId]: record.finalScore }, scoreRecords: { [record.playerId]: record },
});
const memoryStorage = () => {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key), values };
};
const save = (storage: ReturnType<typeof memoryStorage>, game: GameState, currentRound: PersistedCurrentRoundV2 = { grammar: 'pattern-accumulator', draft: { scores: {}, scoreRecords: {} } }) => saveGameRecoveryV2(storage, game, currentRound);
const load = (storage: ReturnType<typeof memoryStorage>) => loadGameRecoveryCore(storage);
const rotatedGame = () => confirmHand(createGame(players, seats, undefined, 'full-game', ref), draw);
const activeWin = (record: McrAcceptedScoreRecord, scoreRecords: Record<string, McrAcceptedScoreRecord> = { [record.playerId]: record }) => ({
  grammar: 'pattern-accumulator' as const,
  outcomeType: 'win' as const,
  winnerId: record.playerId,
  winSource: record.input.context.winSource,
  draft: { scores: { [record.playerId]: record.finalScore }, scoreRecords },
});
const rescorePersistedRecord = (snapshot: any, owner: string, contextField: 'seatWind' | 'prevailingWind', wind: 'east' | 'south' | 'west' | 'north') => {
  const record = snapshot.currentRound.draft.scoreRecords[owner];
  record.input.context[contextField] = wind;
  const compiled = getCurrentCompiledRulesRuntime(ref);
  if (compiled.grammar !== 'pattern-accumulator') throw new Error('Expected pattern-accumulator runtime');
  record.result = compiled.runtime.scoreHand(record.input);
  record.finalScore = record.result.result.total;
  snapshot.currentRound.draft.scores[owner] = record.finalScore;
};

beforeAll(() => initialiseCurrentRulesRuntimes());

describe('C2B MCR persistence/recovery v2', () => {
  it('round-trips discard, self-draw, and draw inputs exactly with the existing storage key', () => {
    for (const [input, expectedOutcome] of [
      [win(accepted('A', 'discard'), 'discard', 'B'), { type: 'mcr-win', winnerId: 'A', winSource: 'discard', discarderId: 'B' }],
      [win(accepted('A', 'self-draw'), 'self-draw'), { type: 'mcr-win', winnerId: 'A', winSource: 'self-draw' }],
      [draw, { type: 'mcr-draw' }],
    ] as const) {
      const storage = memoryStorage();
      const game = confirmHand(createGame(players, seats, undefined, 'full-game', ref), input);
      save(storage, game);
      const envelope = JSON.parse(storage.values.get(GAME_SNAPSHOT_STORAGE_KEY)!);
      expect(envelope.version).toBe(2);
      expect([...storage.values.keys()]).toEqual([GAME_SNAPSHOT_STORAGE_KEY]);
      expect(envelope.game.rounds[0].input.mcrOutcome).toEqual(expectedOutcome);
      expect(envelope.game.rounds[0].input).toEqual(game.handHistory[0]!.mcrReplay);
      expect(envelope.game.setup).toEqual(game.setup);
      expect(envelope.game.setup).not.toHaveProperty('tableLimit');
      expect(load(storage)?.game).toEqual(game);
    }
  });

  it('replays multiple MCR hands with exact balances, seats, winds, history and runtime fingerprint, then supports immediate undo', () => {
    const setupGame = createGame(players, seats, undefined, 'full-game', ref);
    const rounds = [win(accepted('A', 'discard'), 'discard', 'B'), draw, win(accepted('C', 'self-draw'), 'self-draw')];
    const complete = rounds.reduce((game, round) => confirmHand(game, round), setupGame);
    const storage = memoryStorage();
    save(storage, complete);
    const recovered = load(storage)!.game;
    expect(recovered).toEqual(complete);
    expect(recovered.runtimeFingerprint).toBe(fingerprint);
    expect(recovered.handHistory.map((hand) => hand.mcrReplay)).toEqual(complete.handHistory.map((hand) => hand.mcrReplay));
    expect(undoLastHand(recovered)).toEqual(replayGame(setupGame.setup, rounds.slice(0, -1)));
  });

  it('restores active routing, exact accepted record, and partial drafts without inventing routing facts', () => {
    const storage = memoryStorage();
    const game = createGame(players, seats, undefined, 'full-game', ref);
    const record = accepted('A', 'discard');
    const active = { grammar: 'pattern-accumulator' as const, outcomeType: 'win' as const, winnerId: 'A', winSource: 'discard' as const, discarderId: 'B', draft: { scores: { A: record.finalScore }, scoreRecords: { A: record } } };
    save(storage, game, active);
    expect(load(storage)?.currentRound).toEqual(active);
    const partial = { grammar: 'pattern-accumulator' as const, draft: { scores: { C: 7 }, scoreRecords: {} } };
    save(storage, game, partial);
    expect(load(storage)?.currentRound).toEqual(partial);
    const routedPartial = { grammar: 'pattern-accumulator' as const, outcomeType: 'win' as const, winSource: 'discard' as const, discarderId: 'B', draft: { scores: {}, scoreRecords: {} } };
    save(storage, game, routedPartial);
    expect(load(storage)?.currentRound).toEqual(routedPartial);
  });

  it('loads a valid C2B MCR recovery through the in-progress generic shell seam unchanged', () => {
    const storage = memoryStorage();
    const game = createGame(players, seats, undefined, 'full-game', ref);
    const currentRound = { grammar: 'pattern-accumulator' as const, draft: { scores: { C: 7 }, scoreRecords: {} } };
    save(storage, game, currentRound);
    const recovered = loadInProgressGameRecoveryCore(storage);
    expect(recovered?.game).toEqual(game);
    expect(recovered?.currentRound).toEqual(currentRound);
    expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).not.toBeNull();
  });

  it('validates active trusted winds against the post-replay table state', () => {
    const game = rotatedGame();
    expect(game.seats.A).toBe('north');
    const record = accepted('A', 'self-draw', { seatWind: game.seats.A, prevailingWind: game.prevailingWind });
    const storage = memoryStorage();
    save(storage, game, activeWin(record));
    expect(load(storage)?.game).toEqual(game);
    expect(load(storage)?.currentRound).toEqual(activeWin(record));
  });

  it('clears active records with a re-scored but wrong current seatWind', () => {
    const game = rotatedGame();
    const record = accepted('A', 'self-draw', { seatWind: game.seats.A, prevailingWind: game.prevailingWind });
    const storage = memoryStorage(); save(storage, game, activeWin(record));
    const snapshot = JSON.parse(storage.values.get(GAME_SNAPSHOT_STORAGE_KEY)!);
    rescorePersistedRecord(snapshot, 'A', 'seatWind', 'south');
    storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
    expect(load(storage)).toBeNull(); expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it('clears active records with a re-scored but wrong current prevailingWind', () => {
    const game = rotatedGame();
    const record = accepted('A', 'self-draw', { seatWind: game.seats.A, prevailingWind: game.prevailingWind });
    const storage = memoryStorage(); save(storage, game, activeWin(record));
    const snapshot = JSON.parse(storage.values.get(GAME_SNAPSHOT_STORAGE_KEY)!);
    rescorePersistedRecord(snapshot, 'A', 'prevailingWind', 'south');
    storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
    expect(load(storage)).toBeNull(); expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it('rejects active accepted records stored under a different player key', () => {
    const game = rotatedGame();
    const record = accepted('A', 'self-draw');
    const currentRound = { grammar: 'pattern-accumulator' as const, winSource: 'self-draw' as const, draft: { scores: { A: record.finalScore }, scoreRecords: { B: record } } };
    const storage = memoryStorage(); save(storage, game, currentRound);
    expect(load(storage)).toBeNull(); expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it('rejects an otherwise-valid partial accepted record owned by a non-participant', () => {
    const game = rotatedGame();
    const record = accepted('X', 'self-draw');
    const currentRound = { grammar: 'pattern-accumulator' as const, draft: { scores: {}, scoreRecords: { X: record } } };
    const storage = memoryStorage(); save(storage, game, currentRound);
    expect(game.players.map(({ id }) => id)).not.toContain('X');
    expect(load(storage)).toBeNull(); expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it('rejects more than one accepted MCR record in an active draft', () => {
    const game = rotatedGame();
    const first = accepted('A', 'self-draw');
    const second = accepted('C', 'discard');
    const currentRound = { grammar: 'pattern-accumulator' as const, draft: { scores: { A: first.finalScore, C: second.finalScore }, scoreRecords: { A: first, C: second } } };
    const storage = memoryStorage(); save(storage, game, currentRound);
    expect(load(storage)).toBeNull(); expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it('fails closed on game and accepted-record fingerprint/profile/version tampering', () => {
    const record = accepted('A', 'discard');
    const game = confirmHand(createGame(players, seats, undefined, 'full-game', ref), win(record, 'discard', 'B'));
    const mutations = [
      (s: any) => { s.game.runtimeFingerprint = 'drift'; },
      (s: any) => { s.game.rounds[0].input.scoreRecords.A.rulesFingerprint = 'drift'; },
      (s: any) => { s.game.rounds[0].input.scoreRecords.A.rulesProfile.id = 'bmja'; },
      (s: any) => { s.game.rounds[0].input.scoreRecords.A.rulesProfile.version = '9.9'; },
    ];
    for (const mutate of mutations) {
      const storage = memoryStorage(); save(storage, game);
      const snapshot = JSON.parse(storage.values.get(GAME_SNAPSHOT_STORAGE_KEY)!); mutate(snapshot); storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
      expect(load(storage)).toBeNull(); expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
    }
  });

  it('fails closed on malformed input, runtime-inconsistent result, owner/routing mismatch, and trusted table-context contradiction', () => {
    const record = accepted('A', 'discard');
    const game = confirmHand(createGame(players, seats, undefined, 'full-game', ref), win(record, 'discard', 'B'));
    const mutations = [
      (s: any) => { s.game.rounds[0].input.scoreRecords.A.input.evidence.flowerCount = 99; },
      (s: any) => { s.game.rounds[0].input.scoreRecords.A.result.result.total += 1; },
      (s: any) => { s.game.rounds[0].input.scoreRecords.A.playerId = 'B'; },
      (s: any) => { s.game.rounds[0].input.scoreRecords.A.input.context.winSource = 'self-draw'; },
    ];
    for (const mutate of mutations) {
      const storage = memoryStorage(); save(storage, game);
      const snapshot = JSON.parse(storage.values.get(GAME_SNAPSHOT_STORAGE_KEY)!); mutate(snapshot); storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
      expect(load(storage)).toBeNull(); expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
    }
    const validGame = confirmHand(createGame(players, seats, undefined, 'full-game', ref), win(accepted('A', 'discard'), 'discard', 'B'));
    const storage = memoryStorage(); save(storage, validGame);
    const snapshot = JSON.parse(storage.values.get(GAME_SNAPSHOT_STORAGE_KEY)!);
    const persisted = snapshot.game.rounds[0].input.scoreRecords.A;
    persisted.input.context.seatWind = 'south';
    persisted.input.context.prevailingWind = 'east';
    const compiled = getCurrentCompiledRulesRuntime(ref);
    if (compiled.grammar !== 'pattern-accumulator') throw new Error('Expected pattern-accumulator runtime');
    persisted.result = compiled.runtime.scoreHand(persisted.input);
    persisted.finalScore = persisted.result.result.total;
    snapshot.game.rounds[0].input.scores.A = persisted.finalScore;
    storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
    expect(load(storage)).toBeNull(); expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });

  it('rejects a draw draft carrying winner facts and an unsupported snapshot version', () => {
    const storage = memoryStorage();
    save(storage, createGame(players, seats, undefined, 'full-game', ref), { grammar: 'pattern-accumulator', outcomeType: 'draw', winnerId: 'A', draft: { scores: {}, scoreRecords: {} } });
    expect(load(storage)).toBeNull(); expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
    storage.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify({ version: 3 }));
    expect(load(storage)).toBeNull(); expect(storage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBeNull();
  });
});
