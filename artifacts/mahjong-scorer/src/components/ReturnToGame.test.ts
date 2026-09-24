import { beforeAll, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { ReturnToGame } from './ReturnToGame';
import { confirmHand, createBmjaGame, createGame } from '../game/game';
import { GAME_SNAPSHOT_STORAGE_KEY, recoverableGameForReturn, saveGameRecovery, saveGameRecoveryV2 } from '../game/persistence';
import { BMJA_PROFILE_REF } from '../game/ruleset';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import type { GamePlayer } from '../game/types';

const players: GamePlayer[] = ['A', 'B', 'C', 'D'].map((id) => ({ id, name: id }));
const seats = { A: 'east' as const, B: 'south' as const, C: 'west' as const, D: 'north' as const };
const storage = () => {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) };
};

describe('ReturnToGame public profile routing', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());

  it('recovers MCR v2 to its explicit public game route', () => {
    const saved = storage();
    const game = createGame(players, seats, undefined, 'full-game', { id: 'mcr-wmo-2006', version: '0.1' });
    saveGameRecoveryV2(saved, game, { grammar: 'pattern-accumulator', draft: { scores: {}, scoreRecords: {} } });
    vi.stubGlobal('window', { localStorage: saved });
    try {
      expect(recoverableGameForReturn(saved)?.game.setup.rulesProfile).toEqual({ id: 'mcr-wmo-2006', version: '0.1' });
      expect(renderToStaticMarkup(createElement(ReturnToGame))).toContain('href="/game/mcr"');
    } finally { vi.unstubAllGlobals(); }
  });

  it('routes a current Classical save to British and normalises a legacy v1 save', () => {
    const saved = storage();
    const game = createBmjaGame(players, seats, undefined, 'full-game', BMJA_PROFILE_REF);
    saveGameRecovery(saved, game, 'draw', 'A', { scores: {}, scoreRecords: {} });
    vi.stubGlobal('window', { localStorage: saved });
    try { expect(renderToStaticMarkup(createElement(ReturnToGame))).toContain('href="/game/british"'); }
    finally { vi.unstubAllGlobals(); }

    const legacy = JSON.parse(saved.getItem(GAME_SNAPSHOT_STORAGE_KEY)!);
    legacy.version = 1;
    legacy.game.rounds = legacy.game.rounds.map((round: { input: unknown }) => round.input);
    legacy.currentRound = { outcomeType: 'draw', winnerId: 'A', draft: { scores: {}, scoreRecords: {} } };
    saved.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(legacy));
    const recovered = recoverableGameForReturn(saved);
    expect(recovered?.game.setup.rulesProfile).toEqual(BMJA_PROFILE_REF);
    expect(recovered?.game.isComplete).toBe(false);
  });

  it('does not expose a return action for invalid or complete snapshots', () => {
    const saved = storage();
    const game = createBmjaGame(players, seats, undefined, 'full-game', BMJA_PROFILE_REF);
    saveGameRecovery(saved, game, 'draw', 'A', { scores: {}, scoreRecords: {} });
    const invalid = JSON.parse(saved.getItem(GAME_SNAPSHOT_STORAGE_KEY)!);
    invalid.game.runtimeFingerprint = 'tampered';
    saved.setItem(GAME_SNAPSHOT_STORAGE_KEY, JSON.stringify(invalid));
    vi.stubGlobal('window', { localStorage: saved });
    try { expect(renderToStaticMarkup(createElement(ReturnToGame))).toBe(''); }
    finally { vi.unstubAllGlobals(); }
    expect(recoverableGameForReturn(saved)).toBeNull();

    let complete = createBmjaGame(players, seats, undefined, 'full-game', BMJA_PROFILE_REF);
    for (let hand = 0; hand < 16; hand += 1) {
      const south = Object.entries(complete.seats).find(([, wind]) => wind === 'south')![0];
      complete = confirmHand(complete, { outcome: { type: 'win', winnerId: south }, scores: { A: 0, B: 0, C: 0, D: 0 } });
    }
    expect(complete.isComplete).toBe(true);
    saveGameRecovery(saved, complete, 'draw', 'A', { scores: {}, scoreRecords: {} });
    vi.stubGlobal('window', { localStorage: saved });
    try { expect(renderToStaticMarkup(createElement(ReturnToGame))).toBe(''); }
    finally { vi.unstubAllGlobals(); }
    expect(recoverableGameForReturn(saved)).toBeNull();
  });
});
