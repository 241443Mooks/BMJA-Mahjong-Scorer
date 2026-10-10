// @vitest-environment happy-dom
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { HandScorer } from './App';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';
import { RulesProfilePicker } from './game/RulesProfilePicker';
import { createGame } from './game/game';
import { createHandScorerContext } from './game/hand-scorer-handoff';
import { GameScorer } from './game/GameScorer';
import { saveGameRecoveryV2, type PersistedCurrentRoundV2 } from './game/persistence';
import { PREFERRED_RULES_PROFILE_STORAGE_KEY } from './game/preferred-rules-profile';
import { BMJA_PROFILE_REF } from './game/ruleset';

const mcrProfile = { id: 'mcr-wmo-2006', version: '0.1' };

describe('C1 shared standalone scorer workspace', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());

  it('keeps mobile picker grids, tile actions and internal tile strips shrinkable', () => {
    const html = renderToStaticMarkup(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html).toMatch(/data-testid="working-picker" class="min-w-0 /);
    expect(html).toContain('grid min-w-0 grid-cols-2 gap-2');
    expect(html).toContain('flex flex-wrap items-center justify-between gap-2');
    expect(html).toMatch(/class="mt-3 min-w-0 max-w-full [^"]*" data-testid="mobile-tile-picker"/);
    expect(html).toContain('flex gap-2 overflow-x-auto pb-1');
  });

  it('renders the original visual hand workspace and MCR evidence/result surfaces for MCR', () => {
    const html = renderToStaticMarkup(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={mcrProfile} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html).toContain('data-testid="working-picker"');
    expect(html).toContain('data-testid="hand-so-far"');
    expect(html).toContain('data-testid="button-layout-special"');
    expect(html).toContain('data-testid="mcr-evidence-controls"');
    expect(html).toContain('data-testid="mcr-score-result"');
    expect(html).not.toContain('data-testid="button-apply-score-mobile"');
    expect(html).toContain('data-testid="mcr-win-source"');
    expect(html).toContain('data-testid="mcr-seat-wind"');
    expect(html).toContain('data-testid="mcr-prevailing-wind"');
    expect(html).not.toMatch(/\bdouble(s)?\b|table limit|fishing/i);
    const handPicker = renderToStaticMarkup(<RulesProfilePicker surface="hand" prompt="Hand rules" selectedProfile={mcrProfile} onSelect={vi.fn()} />);
    const gamePicker = renderToStaticMarkup(<RulesProfilePicker surface="game" prompt="Game rules" selectedProfile={{ id: 'bmja', version: '1.0' }} onSelect={vi.fn()} />);
    expect(handPicker.match(/data-testid="rules-card-/g)).toHaveLength(5);
    expect(handPicker).toContain('rules-card-mcr');
    expect(gamePicker.match(/data-testid="rules-card-/g)).toHaveLength(5);
    expect(gamePicker).toContain('rules-card-mcr');
  });

  it('places MCR hand entry first and keeps the collapsed picker and supporting material below the task header', () => {
    const html = renderToStaticMarkup(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={mcrProfile} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html).toContain('<h1 data-testid="hand-scorer-title"');
    expect(html).toContain('Score a hand with confidence.');
    expect(html).toContain('Change rules');
    expect(html).toContain('data-testid="standalone-rules-row"');
    expect(html).toMatch(/data-testid="standalone-rules-row"[^>]*>.*?data-testid="active-rules".*?Change rules/s);
    expect(html).toContain('data-testid="mobile-tile-progress"');
    expect(html).toMatch(/data-testid="tile-entry-shell" class="[^"]*rounded-none border-0 bg-transparent p-0 shadow-none/);
    expect(html).toMatch(/class="[^"]*hidden sm:flex[^"]*"[^>]*>.*?Arrange the tiles/s);
    expect(html).toMatch(/data-testid="completed-groups-empty-state" class="[^"]*hidden sm:block/);
    expect(html).not.toContain('data-testid="detected-patterns"');
    expect(html).not.toContain('data-testid="rules-profile-picker"');
    const order = ['hand-scorer-title', 'active-rules', 'button-load-example', 'working-picker', 'hand-so-far', 'bonus-tiles', 'mcr-evidence-controls', 'mobile-live-result', 'mcr-score-result', 'calculator-supporting-info'];
    const positions = order.map((testId) => html.indexOf(`data-testid="${testId}"`));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));

    expect(html.indexOf('Understand settlement')).toBe(-1);
    expect(html.indexOf('About this calculator / How scoring works')).toBeGreaterThan(positions[9]);
    expect(html).not.toContain('data-testid="mobile-hand-context"');
    expect(html).toContain('data-testid="bonus-tile-strip"');
    const flowerStrip = html.match(/<div data-testid="flower-tile-strip"[^>]*>([\s\S]*?)<\/div>/)?.[0] ?? '';
    const seasonStrip = html.match(/<div data-testid="season-tile-strip"[^>]*>([\s\S]*?)<\/div>/)?.[0] ?? '';
    expect(flowerStrip).toContain('overflow-x-auto');
    expect(seasonStrip).toContain('overflow-x-auto');
    expect(flowerStrip.match(/data-testid="button-flower-/g)).toHaveLength(4);
    expect(seasonStrip.match(/data-testid="button-season-/g)).toHaveLength(4);
  });

  it('opens Classical standalone on a compact task header with supporting links after the scorer', () => {
    const html = renderToStaticMarkup(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('Score a hand with confidence.');
    expect(html).toContain('Rules:');
    expect(html).toContain('Change rules');
    expect(html).not.toContain('New hand · ready to enter');
    expect(html.indexOf('Arrange the tiles')).toBeGreaterThan(html.indexOf('Change rules'));
    const workingPicker = html.slice(html.indexOf('data-testid="working-picker"'), html.indexOf('data-testid="hand-so-far"'));
    expect(workingPicker).toContain('data-testid="mobile-tile-progress"');
    const openingHeader = html.slice(html.indexOf('data-testid="hand-scorer-title"'), html.indexOf('Arrange the tiles'));
    expect(openingHeader).not.toContain('Leave hand and go home');
    expect(openingHeader).not.toContain('Enter your tiles visually');
    expect(openingHeader).not.toContain('Need to see who pays whom');
    expect(html.indexOf('About this calculator / How scoring works')).toBeGreaterThan(html.indexOf('button-apply-score-mobile'));
    expect(html).toContain('Understand settlement');
    expect(html).toContain('track a full game');
    expect(html).toContain('Leave hand and go home');
    expect(html).toContain('data-testid="remaining-tile-preview"');
    expect(html).toContain('flex-wrap justify-end gap-x-1 gap-y-1');
    expect(html).toMatch(/data-testid="completed-groups-empty-state" class="[^"]*hidden sm:block/);
  });

  it('uses the existing game context for a compact title and collapsed hand details', () => {
    const game = createGame([{ id: 'A', name: 'Anna' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }, { id: 'D', name: 'D' }], { A: 'east', B: 'south', C: 'west', D: 'north' }, undefined, 'full-game', BMJA_PROFILE_REF);
    const context = createHandScorerContext(game, 'A', null);
    const renderContext = (playerName: string) => renderToStaticMarkup(<HandScorer context={{ ...context, playerName }} onClose={vi.fn()} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />);
    const named = renderContext('Anna');
    expect(named).toContain('Score Anna’s hand with confidence.');
    expect(named).toContain('Anna’s Tiles');
    expect(named).not.toContain('What are you entering?');
    expect(named).toContain('Anna’s current score');
    expect(named).toMatch(/<details data-testid="hand-details"[^>]*><summary[^>]*>Hand details<\/summary>/);
    expect(named).toContain('Seat wind:</strong> east');
    expect(named).toContain('Prevailing wind:</strong> east');
    expect(named).toContain('active game');
    expect(named).toContain('Inherited ruleset:');
    expect(named).not.toContain('data-testid="button-load-example"');
    expect(named).toContain('Back to game without applying a score');
    expect(named).toContain('data-testid="button-clear-hand"');
    expect(named).not.toContain('data-testid="mobile-hand-context"');

    const unnamed = renderContext('   ');
    expect(unnamed).toContain('Score this hand with confidence.');
    expect(unnamed).toContain('Name not provided');
    expect(unnamed).toContain('Arrange the tiles');

    const namedWinner = renderToStaticMarkup(<HandScorer context={{ ...context, playerName: 'Anna', isWinner: true }} onClose={vi.fn()} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(namedWinner).toContain('How did Anna win?');
    const unnamedWinner = renderToStaticMarkup(<HandScorer context={{ ...context, playerName: '   ', isWinner: true }} onClose={vi.fn()} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(unnamedWinner).toContain('How did this hand win?');

    const standalone = renderToStaticMarkup(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(standalone).toContain('Score a hand with confidence.');
    expect(standalone).toContain('data-testid="button-load-example"');
    expect(standalone).not.toContain('data-testid="hand-details"');
  });

  it('opens Hand details and keeps Clear and return-to-game actions working', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const game = createGame([{ id: 'A', name: 'Anna' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }, { id: 'D', name: 'D' }], { A: 'east', B: 'south', C: 'west', D: 'north' }, undefined, 'full-game', BMJA_PROFILE_REF);
    const context = createHandScorerContext(game, 'A', null);
    const onClose = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);
    try {
      await act(async () => root.render(<HandScorer context={context} onClose={onClose} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
      const details = container.querySelector<HTMLDetailsElement>('[data-testid="hand-details"]')!;
      expect(details.open).toBe(false);
      await act(async () => details.querySelector('summary')!.click());
      expect(details.open).toBe(true);
      expect(details.textContent).toContain('Rules: British / BMJA-style.');
      await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="button-clear-hand"]')!.click());
      expect(onClose).not.toHaveBeenCalled();
      await act(async () => [...container.querySelectorAll('button')].find((button) => button.textContent?.includes('Back to game without applying a score'))!.click());
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledWith();
    } finally {
      await act(async () => root.unmount());
      container.remove();
      vi.unstubAllGlobals();
    }
  });

  it('locks table-owned MCR context while preserving editable scorer evidence', () => {
    const game = createGame([{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }, { id: 'D', name: 'D' }], { A: 'east', B: 'south', C: 'west', D: 'north' }, undefined, 'full-game', mcrProfile);
    const context = createHandScorerContext(game, 'B', { type: 'mcr-win', winnerId: 'B', winSource: 'discard' });
    const html = renderToStaticMarkup(<HandScorer context={context} onClose={vi.fn()} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html).not.toContain('data-testid="mcr-win-source"');
    expect(html).not.toContain('data-testid="mcr-seat-wind"');
    expect(html).not.toContain('data-testid="mcr-prevailing-wind"');
    expect(html).toContain('data-testid="mcr-locked-table-context"');
    expect(html).toContain('data-testid="hand-details"');
    expect(html).not.toContain('data-testid="mobile-hand-context"');
    expect(html).toContain('Discard'); expect(html).toContain('south'); expect(html).toContain('east');
    expect(html).toContain('data-testid="mcr-win-event"');
    expect(html).toContain('Last visible copy');
    expect(html).not.toContain('button-apply-mcr-score');
  });

  it('renders a bounded internal MCR table with no manual score inputs or Classical settlement copy', () => {
    const game = createGame([{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }, { id: 'D', name: 'D' }], { A: 'east', B: 'south', C: 'west', D: 'north' }, undefined, 'full-game', mcrProfile);
    const data = new Map<string, string>();
    const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) };
    const currentRound: PersistedCurrentRoundV2 = { grammar: 'pattern-accumulator', draft: { scores: {}, scoreRecords: {} } };
    saveGameRecoveryV2(storage, game, currentRound);
    data.set(PREFERRED_RULES_PROFILE_STORAGE_KEY, JSON.stringify(BMJA_PROFILE_REF));
    vi.stubGlobal('window', { localStorage: storage });
    try {
      const html = renderToStaticMarkup(<GameScorer initialRulesProfile={BMJA_PROFILE_REF} initialRulesProfileIsExplicit={false} onOpenHandScorer={vi.fn()} onClearReturnedScore={vi.fn()} />);
      expect(html).toContain('data-testid="mcr-outcome-win"');
      expect(html).toContain('data-testid="mcr-outcome-draw"');
      expect(html).toContain('MCR / WMO 2006');
      expect(data.get(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(BMJA_PROFILE_REF));
      expect(html).not.toContain('data-testid="input-score-');
      expect(html).not.toContain('Who pays whom');
      expect(html).not.toContain('Round settlement');
      expect(html).not.toContain('Records this settlement');
    } finally { vi.unstubAllGlobals(); }
  });
});
