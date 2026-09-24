import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const interaction = vi.hoisted(() => ({ pickers: [] as Array<{ prompt: string; onSelect: (profile: { id: string; version: string }) => void }> }));
vi.mock('./game/RulesProfilePicker', () => ({
  ActiveRules: ({ profile }: { profile: { id: string; version: string } }) => <p data-testid="active-profile">{profile.id}@{profile.version}</p>,
  RulesProfilePicker: (props: { prompt: string; onSelect: (profile: { id: string; version: string }) => void }) => {
    interaction.pickers.push(props);
    return null;
  },
}));

import App, { HandScorer } from './App';
import { createGame } from './game/game';
import { createHandScorerContext } from './game/hand-scorer-handoff';
import { transitionStandaloneHandProfile } from './game/hand-scorer-profile-transition';
import { PREFERRED_RULES_PROFILE_STORAGE_KEY } from './game/preferred-rules-profile';
import { OUTSIDE_THE_BOX_PROFILE_REF } from './game/outside-the-box-catalogue';
import { WESTERN_TM_PROFILE_REF } from './game/western-tm-catalogue';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';
import { set, suited } from './scoring/tiles';

function installBrowser(search = '', storedProfile = WESTERN_TM_PROFILE_REF) {
  const values = new Map<string, string>([[PREFERRED_RULES_PROFILE_STORAGE_KEY, JSON.stringify(storedProfile)]]);
  const localStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
  vi.stubGlobal('window', { localStorage, location: { search } });
  return { localStorage, values };
}

const setupMarkup = () => renderToStaticMarkup(<App initialView="hand" standaloneHand />);

describe('preferred profile flow interactions', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());
  afterEach(() => {
    interaction.pickers.length = 0;
    vi.unstubAllGlobals();
  });

  it('stores a standalone hand picker choice while retaining the existing profile transition cleanup seam', () => {
    const { values } = installBrowser();
    setupMarkup();
    const handPicker = interaction.pickers.find(({ prompt }) => prompt === 'Which rules are you scoring?');
    expect(handPicker).toBeDefined();
    handPicker!.onSelect(OUTSIDE_THE_BOX_PROFILE_REF);
    expect(values.get(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(OUTSIDE_THE_BOX_PROFILE_REF));

    const transition = transitionStandaloneHandProfile({
      shared: { sets: [{ ...set('physical-pung', 'pung', suited('characters', 5), 'exposed'), blankTileIds: ['old-blank'] }], layoutMode: 'sets', looseTiles: [suited('circles', 8)], flowers: [], seasons: [], winningTileProvenance: undefined },
      classical: { handMode: 'goulash', ungroupedBlankTiles: [{ id: 'old-blank', location: 'loose', tileIndex: 0 }], standingHand: true, onlyPossibleWinningTile: true, eastThirteenthConsecutiveMahjong: true, originalCall: true, winningMethod: 'discard', winningEventEvidence: { type: 'discard', discardedBy: 'south', handDiscardOrdinal: 1 }, discardAnswer: 'yes', replacementAnswer: 'yes' },
      mcr: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false, seatWind: 'west', prevailingWind: 'south' },
      currentWinner: true, savedClassicalWinner: false, wasMcr: false, nextIsMcr: false, supportsGoulash: true,
    });
    expect(transition.shared.sets[0]).not.toHaveProperty('blankTileIds');
    expect(transition.shared.looseTiles).toEqual([suited('circles', 8)]);
    expect(transition.classical).toMatchObject({ handMode: 'goulash', ungroupedBlankTiles: [], standingHand: false, onlyPossibleWinningTile: false, eastThirteenthConsecutiveMahjong: false });
    expect(transition.mcr).toEqual({});
  });

  it('keeps worked examples on their explicit profile without rewriting a conflicting preference', () => {
    const { values } = installBrowser('?example=thirteen-wonders-fishing');
    const html = setupMarkup();
    expect(html).toContain('data-testid="active-profile">bmja@1.0');
    expect(interaction.pickers.some(({ prompt }) => prompt === 'Which rules are you scoring?')).toBe(false);
    expect(values.get(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(WESTERN_TM_PROFILE_REF));
  });

  it('stores a different profile selected in new-game setup through its RulesProfilePicker callback', () => {
    const { values } = installBrowser();
    setupMarkup();
    const gamePicker = interaction.pickers.find(({ prompt }) => prompt === 'What rules are we playing?');
    expect(gamePicker).toBeDefined();
    gamePicker!.onSelect(OUTSIDE_THE_BOX_PROFILE_REF);
    expect(values.get(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(OUTSIDE_THE_BOX_PROFILE_REF));
  });

  it('keeps an active-game scorer on its exact game profile and leaves the browser preference untouched', () => {
    const { values } = installBrowser();
    const game = createGame(
      [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }, { id: 'D', name: 'D' }],
      { A: 'east', B: 'south', C: 'west', D: 'north' }, undefined, 'full-game', OUTSIDE_THE_BOX_PROFILE_REF,
    );
    const context = createHandScorerContext(game, 'B', null);
    const html = renderToStaticMarkup(<HandScorer context={context} onClose={vi.fn()} standaloneHand={false} standaloneRulesProfile={WESTERN_TM_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html).toContain('data-testid="active-profile">outside-the-box@0.1');
    expect(values.get(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(WESTERN_TM_PROFILE_REF));
  });
});
