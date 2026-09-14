import { useMemo, useRef, useState, useEffect } from 'react';
import {
  ArrowRight,
  Calculator,
  Check,
  History,
  RotateCcw,
  Sparkles,
  Trophy,
  Undo2,
  X,
} from 'lucide-react';
import { HandRecord, settlementDescription } from './HandRecord';
import { incidentDescription } from './outside-the-box-incidents';
import { SiteHeader } from '../components/SiteHeader';
import {
  applyManualScore,
  applyHandScorerSession,
  confirmHand,
  createBmjaGame,
  createHandScorerContext,
  GAME_WINDS,
  reconcileDetailedHandsForOutcome,
  returnAppliedScoreToTable,
  undoLastHand,
  resolveRulesProfile,
  clearGameRecovery,
  loadInProgressGameRecovery,
  saveGameRecovery,
} from '.';
import { RulesProfilePicker } from './RulesProfilePicker';
import { descriptorForRulesProfile, isBritishRulesProfile } from './rules-presentation';
import { prepareFullPrintDisclosures, watchPrintLifecycle } from './print-disclosures';
import type {
  GameLength,
  GamePlayer,
  GameState,
  HandOutcome,
  HandScorerContext,
  HandScorerResult,
  PlayerAmounts,
  PlayerScoreRecords,
  RoundScoreDraft,
  RoundScoringDraft,
  RoundIncident,
  RulesProfileRef,
  SeatAssignments,
} from '.';
import type { Wind } from '../scoring';

type GameScorerProps = {
  onOpenHandScorer: (context?: HandScorerContext) => void;
  returnedScore?: HandScorerResult | null;
  onClearReturnedScore: () => void;
  initialRulesProfile: RulesProfileRef;
};

const windLabel = (wind: Wind) =>
  `${wind.charAt(0).toUpperCase()}${wind.slice(1)}`;

const formatChange = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}`;

const activeRulesCopy = (profile: RulesProfileRef) => descriptorForRulesProfile(profile).title;

export const gameRecordRulesLabel = (profile: GameState['setup']['rulesProfile']) =>
  `${activeRulesCopy(profile)} · Profile version: ${profile.version}`;

export const handCountLabel = (count: number) =>
  `${count} ${count === 1 ? 'hand' : 'hands'} played`;

export const printStandings = (game: GameState) =>
  game.isComplete
    ? [...game.players].sort((a, b) => game.balances[b.id] - game.balances[a.id])
    : game.players;

export const recoveredGameConflictsWithRoute = (game: GameState, routeProfile: RulesProfileRef) =>
  game.setup.rulesProfile.id !== routeProfile.id || game.setup.rulesProfile.version !== routeProfile.version;

export const shouldShowBritishSetupHelper = (profile: RulesProfileRef) =>
  isBritishRulesProfile(profile);

export const previewRoundSettlement = (
  game: GameState,
  outcome: HandOutcome,
  scores: RoundScoreDraft,
  incidents: RoundIncident[] = [],
) => {
  const fullScores = Object.fromEntries(
    game.players.map((player) => [player.id, scores[player.id] ?? 0]),
  ) as PlayerAmounts;
  const ruleset = resolveRulesProfile(game.setup.rulesProfile);
  if (!ruleset.prepareRound && incidents.length > 0) throw new Error(`${ruleset.name} does not support round incidents.`);
  const round = { outcome, scores: fullScores, incidents };
  const prepared = ruleset.prepareRound ? ruleset.prepareRound(game.players, game.seats, round) : round;
  return ruleset.settleRound(
    game.players,
    game.seats,
    prepared,
  );
};

export const getRoundSettlementPreview = (
  game: GameState,
  outcome: HandOutcome,
  scores: RoundScoreDraft,
  incidents: RoundIncident[] = [],
): { settlement: ReturnType<typeof previewRoundSettlement> | null; error: string | null } => {
  try {
    return { settlement: previewRoundSettlement(game, outcome, scores, incidents), error: null };
  } catch (caught) {
    return { settlement: null, error: caught instanceof Error ? caught.message : 'This round cannot be settled.' };
  }
};

export const settlementPreviewPresentation = (
  game: GameState,
  outcome: HandOutcome | null,
  scores: RoundScoreDraft,
) => {
  if (outcome?.type === 'draw') return 'no-payments' as const;
  return outcome?.type === 'win' && game.players.every((player) => scores[player.id] !== undefined)
    ? 'transactions' as const
    : 'awaiting-scores' as const;
};

export const gameWorkspaceStage = (
  game: GameState,
  presentation: ReturnType<typeof settlementPreviewPresentation>,
) => {
  if (game.isComplete) return 'complete' as const;
  return presentation === 'awaiting-scores' ? 'entry' as const : 'settlement' as const;
};

export function GameScorer({ onOpenHandScorer, returnedScore, onClearReturnedScore, initialRulesProfile }: GameScorerProps) {
  const [recovered, setRecovered] = useState(() =>
    typeof window === 'undefined'
      ? null
      : loadInProgressGameRecovery(window.localStorage),
  );
  const [names, setNames] = useState(['', '', '', '']);
  const [gameLength, setGameLength] = useState<GameLength>(recovered?.game.setup.gameLength ?? 'one-round');
  const [game, setGame] = useState<GameState | null>(recovered?.game ?? null);
  const [selectedRulesProfile, setSelectedRulesProfile] = useState<RulesProfileRef>(() => recovered?.game.setup.rulesProfile ?? initialRulesProfile);
  const [outcomeType, setOutcomeType] = useState<'win' | 'draw'>(recovered?.outcomeType ?? 'win');
  const [winnerId, setWinnerId] = useState(recovered?.winnerId ?? '');
  const [scores, setScores] = useState<RoundScoreDraft>(recovered?.draft.scores ?? {});
  const [scoreRecords, setScoreRecords] = useState<PlayerScoreRecords>(recovered?.draft.scoreRecords ?? {});
  const [incidents, setIncidents] = useState<RoundIncident[]>(recovered?.draft.incidents ?? []);
  const [error, setError] = useState('');
  const [printMode, setPrintMode] = useState<'summary' | 'full' | null>(null);
  const [editingHand, setEditingHand] = useState(false);
  const tableScoresRef = useRef<HTMLDetailsElement>(null);
  const tableToolsRef = useRef<HTMLDetailsElement>(null);
  const gameLedgerRef = useRef<HTMLDetailsElement>(null);
  const ledgerDetailsRefs = useRef(new Map<number, HTMLDetailsElement>());

  const currentEastId = game
    ? Object.entries(game.seats).find(([, seat]) => seat === 'east')?.[0]
    : undefined;
  const recoveredProfileConflictsWithRoute = !!recovered && recoveredGameConflictsWithRoute(recovered.game, initialRulesProfile);

  const outcome = useMemo<HandOutcome | null>(
    () =>
      game
        ? outcomeType === 'draw'
          ? { type: 'draw' }
          : winnerId
            ? { type: 'win', winnerId }
            : null
        : null,
    [game, outcomeType, winnerId],
  );

  useEffect(() => {
    if (!game || typeof window === 'undefined') return;
    if (game.isComplete) {
      clearGameRecovery(window.localStorage);
      return;
    }
    saveGameRecovery(
      window.localStorage,
      game,
      outcomeType,
      winnerId,
      { scores, scoreRecords, incidents },
    );
  }, [game, outcomeType, scoreRecords, scores, incidents, winnerId]);

  useEffect(() => {
    if (!printMode || typeof window === 'undefined') return;
    const restoreDisclosures = printMode === 'full'
      ? prepareFullPrintDisclosures([gameLedgerRef.current, ...ledgerDetailsRefs.current.values()])
      : null;
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      restoreDisclosures?.();
      setPrintMode(null);
      window.removeEventListener('afterprint', restore);
    };
    const stopWatchingPrint = watchPrintLifecycle(window, document, restore);
    window.requestAnimationFrame(() => {
      window.print();
    });
    return () => {
      stopWatchingPrint();
      restore();
    };
  }, [printMode]);

  useEffect(() => {
    if (returnedScore === undefined || !game || !outcome) return;

    try {
      const returned = applyHandScorerSession(
        game,
        { scores, scoreRecords },
        outcome,
        returnedScore,
      );
      setScores(returned.draft.scores);
      setScoreRecords(returned.draft.scoreRecords);
      setError('');
      returnAppliedScoreToTable(returnedScore, tableScoresRef.current);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'The detailed hand could not be applied.',
      );
    } finally {
      onClearReturnedScore();
    }
  }, [
    game,
    onClearReturnedScore,
    outcome,
    returnedScore,
    scoreRecords,
    scores,
  ]);

  const changeRoundOutcome = (nextOutcome: HandOutcome) => {
    if (!game) return;
    const currentDraft = { scores, scoreRecords };
    const reconciled = reconcileDetailedHandsForOutcome(
      game,
      currentDraft,
      nextOutcome,
    );
    const invalidated = game.players.some(
      (player) =>
        currentDraft.scores[player.id] !== undefined &&
        reconciled.scores[player.id] === undefined,
    );

    setScores(reconciled.scores);
    setScoreRecords(reconciled.scoreRecords);
    setOutcomeType(nextOutcome.type);
    if (nextOutcome.type === 'win') setWinnerId(nextOutcome.winnerId);
    setError(
      invalidated
        ? 'Winner changed. Recalculate the affected detailed hands before confirming.'
        : '',
    );
  };

  const preview = useMemo(() => {
    if (!game || !outcome) return { settlement: null, error: null };
    return getRoundSettlementPreview(game, outcome, scores, incidents);
  }, [game, outcome, scores, incidents]);
  const previewPresentation = game
    ? settlementPreviewPresentation(game, outcome, scores)
    : 'awaiting-scores';
  const workspaceStage = game ? gameWorkspaceStage(game, previewPresentation) : 'entry';

  useEffect(() => {
    if (workspaceStage !== 'entry') setEditingHand(false);
  }, [workspaceStage]);

  const startGame = () => {
    const trimmed = names.map((name) => name.trim());
    if (trimmed.some((name) => !name)) {
      setError('Enter a name for all four seats.');
      return;
    }
    if (new Set(trimmed.map((name) => name.toLowerCase())).size !== 4) {
      setError('Use a different name for each player.');
      return;
    }
    const players = GAME_WINDS.map((wind, index) => ({
      id: `player-${index + 1}`,
      name: trimmed[index],
    }));
    const seats = Object.fromEntries(
      players.map((player, index) => [player.id, GAME_WINDS[index]]),
    ) as SeatAssignments;
    if (typeof window !== 'undefined') clearGameRecovery(window.localStorage);
    setRecovered(null);
    const started = createBmjaGame(players, seats, undefined, gameLength, selectedRulesProfile);
    setGame(started);
    setScores({});
    setScoreRecords({});
    setIncidents([]);
    setEditingHand(false);
    setWinnerId(players[0].id);
    setError('');
  };

  const startOver = () => {
    if (typeof window !== 'undefined') clearGameRecovery(window.localStorage);
    setRecovered(null);
    setGame(null);
    setSelectedRulesProfile(initialRulesProfile);
    setScores({});
    setScoreRecords({});
    setIncidents([]);
    setWinnerId('');
    setOutcomeType('win');
    setEditingHand(false);
    setError('');
  };

  const resetRoundEntry = (nextGame: GameState) => {
    setScores({});
    setScoreRecords({});
    setIncidents([]);
    const east = Object.entries(nextGame.seats).find(
      ([, seat]) => seat === 'east',
    )?.[0];
    setWinnerId(east ?? nextGame.players[0].id);
    setOutcomeType('win');
  };

  const confirmRound = () => {
    if (!game || !outcome) {
      setError('Choose a winner and enter a score for every player.');
      return;
    }
    if (preview.error) {
      setError(preview.error);
      return;
    }
    const isScoresComplete = outcome.type === 'draw' || game.players.every(p => scores[p.id] !== undefined);
    if (!isScoresComplete) {
      setError('Enter a score for every player (use 0 if none).');
      return;
    }
    const fullScores = Object.fromEntries(game.players.map(p => [p.id, outcome.type === 'draw' ? 0 : scores[p.id] ?? 0])) as PlayerAmounts;
    try {
      const next = confirmHand(game, {
        outcome,
        scores: fullScores,
        scoreRecords: outcome.type === 'draw' ? {} : scoreRecords,
        incidents,
      });
      setGame(next);
      resetRoundEntry(next);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'This round cannot be confirmed.');
    }
  };

  const undo = () => {
    if (!game || game.handHistory.length === 0) return;
    const next = undoLastHand(game);
    setGame(next);
    resetRoundEntry(next);
  };

  const printGame = (mode: 'summary' | 'full') => setPrintMode(mode);

  if (!game) {
    return (
      <div className="mahjong-shell">
        <SiteHeader />

        <main className="mx-auto max-w-[900px] px-5 py-10 lg:px-8 lg:py-14">
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              <div className="fine-rule w-10" />
              <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">New game</span>
            </div>
            <h1 className="font-serif text-[clamp(38px,6vw,62px)] leading-none text-[#284d45]">
              Seat the table.
            </h1>
            <p className="mt-4 max-w-[620px] text-[16px] leading-7 text-[#66746e]">
              Enter players in their starting seats. Your game stays in this
              browser so you can continue after a refresh. <a href="/help#refresh-game" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">How recovery works</a>
            </p>
            {recovered && <div data-testid="recovered-game-conflict" className="mt-4 max-w-[620px] rounded-md border border-[#b8cdbf] bg-[#edf3ed] p-3 text-[14px] leading-6 text-[#284d45]"><strong>Saved game: {activeRulesCopy(recovered.game.setup.rulesProfile)}.</strong> Continue it safely; rules from this route do not change a saved game. Starting a new game below replaces this local recovery.</div>}
          </div>

          <section className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 shadow-[var(--shadow-sm)] sm:p-7">
            <RulesProfilePicker prompt="Which rules are you playing?" selectedProfile={selectedRulesProfile} onSelect={setSelectedRulesProfile} />
            {shouldShowBritishSetupHelper(selectedRulesProfile) ? <p className="mb-6 rounded-md bg-[#edf3ed] px-3 py-2 text-[14px] leading-6 text-[#284d45]">New to table setup? <a href="/gameplay-basics#wind-rotation" className="font-semibold underline decoration-[#ae6249] underline-offset-4">Starting Winds</a> set the first seats; <a href="/gameplay-basics#prevailing-wind" className="font-semibold underline decoration-[#ae6249] underline-offset-4">prevailing rounds</a> describe the game’s longer progress.</p> : null}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.15em] text-[#7a7769]">
                  Game length
                </span>
                <select
                  data-testid="select-game-length"
                  value={gameLength}
                  onChange={(e) => setGameLength(e.target.value as GameLength)}
                  className="w-full rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-3 text-[15px] font-semibold text-[#284d45] focus:ring-2 focus:ring-[#ae6249]"
                >
                  <option value="one-round">One Prevailing Round (East only)</option>
                  <option value="full-game">Full Game (East, South, West, North)</option>
                </select>
              </label>

              {GAME_WINDS.map((wind, index) => (
                <label key={wind} className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.15em] text-[#7a7769]">
                    Starting {windLabel(wind)}
                  </span>
                  <input
                    data-testid={`input-player-${wind}`}
                    value={names[index]}
                    onChange={(event) =>
                      setNames((current) =>
                        current.map((name, nameIndex) =>
                          nameIndex === index ? event.target.value : name,
                        ),
                      )
                    }
                    placeholder={`${windLabel(wind)} player`}
                    className="w-full rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-3 text-[15px] text-[#284d45] outline-none focus:ring-2 focus:ring-[#ae6249]"
                  />
                </label>
              ))}
            </div>
            {error && (
              <p className="mt-4 text-[12px] font-semibold text-[#9a4d3a]">
                {error}
              </p>
            )}
            <button
              type="button"
              data-testid="button-start-game"
              onClick={startGame}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-[#284d45] px-4 py-3 text-[12px] font-semibold text-[#f8f4e9]"
            >
              {recovered ? `Start a new ${descriptorForRulesProfile(selectedRulesProfile).compactLabel} game` : 'Start game'} <ArrowRight size={15} />
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={`mahjong-shell ${printMode === 'summary' ? 'print-summary' : ''}`}>
      <div className="screen-only sticky top-0 z-20 border-b border-[#d8ceb8] bg-[#f5f1e6]/95 backdrop-blur">
        <div className="mx-auto max-w-[1120px] px-4 py-2 sm:px-5 sm:py-3 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[.12em] text-[#ae6249] sm:text-[10px] sm:tracking-[.16em]">
                {game.isComplete ? 'Game complete' : `Hand ${game.handHistory.length + 1}`} · {windLabel(game.prevailingWind)} prevailing · {descriptorForRulesProfile(game.setup.rulesProfile).compactLabel}
              </div>
              <div className="font-serif text-[16px] font-bold leading-tight text-[#284d45] sm:text-[18px]">
                {game.players.find((player) => player.id === currentEastId)?.name} is East
                {game.currentHandMode === 'goulash' ? ' · Goulash hand' : ''}
              </div>
              {recovered && <p data-testid="recovered-game-conflict" className={`mt-0.5 text-[10px] font-semibold leading-4 sm:mt-1 sm:text-[11px] ${recoveredProfileConflictsWithRoute ? 'text-[#9a4d3a]' : 'text-[#477562]'}`}>
                {recoveredProfileConflictsWithRoute ? `Saved ${activeRulesCopy(game.setup.rulesProfile)} game; this route does not change its rules.` : 'Saved game recovered.'}
              </p>}
            </div>
            <details ref={tableToolsRef} className="table-tools relative">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-[#cfc3aa] bg-[#fbf8ed] px-2.5 py-1.5 text-[11px] font-semibold text-[#284d45] sm:px-3 sm:py-2">Table tools</summary>
              <div className="table-tools-panel fixed inset-x-3 top-3 z-30 flex max-h-[calc(100dvh-1.5rem)] flex-col gap-1 overflow-y-auto overscroll-contain rounded-lg border border-[#d8ceb8] bg-[#fbf8ed] p-2 shadow-[var(--shadow-md)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:max-h-[min(32rem,calc(100dvh-5rem))] sm:w-64">
                <div className="flex items-center justify-between border-b border-[#d8ceb8] px-1 pb-2 lg:hidden">
                  <span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#ae6249]">Table tools</span>
                  <button
                    type="button"
                    data-testid="button-close-table-tools"
                    aria-label="Close table tools"
                    onClick={() => {
                      if (!tableToolsRef.current) return;
                      tableToolsRef.current.open = false;
                      tableToolsRef.current.querySelector('summary')?.focus();
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold text-[#284d45] hover:bg-[#efe8da] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#284d45]"
                  >
                    <X size={15} aria-hidden="true" /> Close
                  </button>
                </div>
            <button
              type="button"
              data-testid="button-undo-hand"
              disabled={game.handHistory.length === 0}
              onClick={undo}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-[11px] font-semibold text-[#284d45] hover:bg-[#efe8da] disabled:opacity-40"
            >
              <Undo2 size={14} /> Undo last hand
            </button>
            <a href="/help#correct-hand" className="rounded-md px-3 py-2 text-[11px] font-semibold text-[#477562] underline decoration-[#cfc3aa] underline-offset-4 hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Help correcting a hand</a>
            <button
              type="button"
              data-testid="button-start-over"
              onClick={startOver}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-[11px] font-semibold text-[#284d45] hover:bg-[#efe8da]"
            >
              <RotateCcw size={14} /> {recoveredProfileConflictsWithRoute ? `Start a new ${descriptorForRulesProfile(initialRulesProfile).compactLabel} game` : 'Start over'}
            </button>
            <button
              type="button"
              onClick={() => onOpenHandScorer()}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-[11px] font-semibold text-[#284d45] hover:bg-[#efe8da]"
            >
              <Sparkles size={14} /> Detailed hand scorer
            </button>
                <a href="/rules" className="rounded-md px-3 py-2 text-[11px] font-semibold text-[#284d45] hover:bg-[#efe8da]">Rules reference</a>
                <a href="#game-ledger" className="rounded-md px-3 py-2 text-[11px] font-semibold text-[#284d45] hover:bg-[#efe8da]">History / confirmed ledger</a>
                <button type="button" data-testid="button-print-full" onClick={() => printGame('full')} className="rounded-md px-3 py-2 text-left text-[11px] font-semibold text-[#284d45] hover:bg-[#efe8da]">Print / Save full game record</button>
                <button type="button" data-testid="button-print-summary" onClick={() => printGame('summary')} className="rounded-md px-3 py-2 text-left text-[11px] font-semibold text-[#284d45] hover:bg-[#efe8da]">Print / Save game summary</button>
                <a href="/help#save-game" className="rounded-md px-3 py-2 text-[11px] font-semibold text-[#477562] underline decoration-[#cfc3aa] underline-offset-4 hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Saving / printing help</a>
              </div>
            </details>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 sm:mt-3 sm:gap-2 sm:grid-cols-4">
            {game.players.map((player) => <div key={player.id} className={`rounded-md border px-2 py-1 sm:px-3 sm:py-2 ${game.seats[player.id] === 'east' ? 'border-[#ae6249] bg-[#f5eadb]' : 'border-[#d8ceb8] bg-[#fbf8ed]'}`}>
              <div className="font-mono text-[7px] uppercase tracking-[.08em] text-[#ae6249] sm:text-[8px] sm:tracking-[.12em]">{windLabel(game.seats[player.id])}{game.seats[player.id] === 'east' ? ' · Dealer' : ''}</div>
              <div className="flex items-baseline justify-between gap-1 sm:gap-2"><span className="truncate font-serif text-[13px] leading-tight text-[#284d45] sm:text-[16px]">{player.name}</span><span className="font-mono text-[12px] font-bold text-[#284d45] sm:text-[14px]">{formatChange(game.balances[player.id])}</span></div>
            </div>)}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1120px] space-y-5 px-4 py-5 sm:px-5 lg:px-8">
        <div className="print-only game-print-heading">
          <h1>Mahjong Reference — {activeRulesCopy(game.setup.rulesProfile)} game record</h1>
          <p>{game.isComplete ? 'Game complete' : 'Game in progress'} · {handCountLabel(game.handHistory.length)}</p>
          <p>Rules: {gameRecordRulesLabel(game.setup.rulesProfile)}</p>
          <p>Generated {new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <section className="min-w-0">
          {!game.isComplete && <details ref={tableScoresRef} data-testid="section-table-scores" open={workspaceStage === 'entry' || editingHand} onToggle={(event) => {
            if (workspaceStage === 'settlement') setEditingHand(event.currentTarget.open);
          }} className="screen-only scroll-mt-4 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6">
            {workspaceStage === 'settlement' && <summary className="mb-5 cursor-pointer font-mono text-[10px] uppercase tracking-[.16em] text-[#ae6249]">Edit current hand</summary>}
            <div className="mb-5">
              <div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">
                Current hand
              </div>
              <h1 className="mt-1 font-serif text-[30px] text-[#284d45]">
                {game.isComplete ? 'Game complete' : 'Enter the table scores'}
              </h1>
              {game.isComplete ? (
                <p className="mt-2 text-[12px] text-[#7a7769]">
                  The final hand has been recorded. Undo the last hand to continue playing, or refresh to start a new game.
                </p>
              ) : (
                <p className="mt-2 max-w-[680px] text-[15px] leading-6 text-[#66746e]">
                  <strong>Hand score</strong> is what each player’s hand is worth. <strong>Settlement</strong> works out who pays whom under these rules; it is not the score you enter.
                </p>
              )}
            </div>

            {!game.isComplete && (
              <>
                <div className="mb-5 flex gap-2">
                  <button
                    type="button"
                    data-testid="button-outcome-win"
                    onClick={() =>
                      winnerId &&
                      changeRoundOutcome({ type: 'win', winnerId })
                    }
                    className={`rounded-md px-4 py-2 text-[11px] font-semibold ${
                      outcomeType === 'win'
                        ? 'bg-[#284d45] text-[#f8f4e9]'
                        : 'border border-[#d8ceb8] text-[#66746e]'
                    }`}
                  >
                    Mah Jong
                  </button>
                  <button
                    type="button"
                    data-testid="button-outcome-draw"
                    onClick={() => changeRoundOutcome({ type: 'draw' })}
                    className={`rounded-md px-4 py-2 text-[11px] font-semibold ${
                      outcomeType === 'draw'
                        ? 'bg-[#284d45] text-[#f8f4e9]'
                        : 'border border-[#d8ceb8] text-[#66746e]'
                    }`}
                  >
                    Draw / wash-out
                  </button>
                </div>

                {outcomeType === 'win' && (
                  <label className="mb-5 block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.15em] text-[#7a7769]">
                      Player who went Mah Jong
                    </span>
                    <select
                      data-testid="select-round-winner"
                      value={winnerId}
                      onChange={(event) =>
                        changeRoundOutcome({
                          type: 'win',
                          winnerId: event.target.value,
                        })
                      }
                      className="w-full rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-3 text-[13px] font-semibold text-[#284d45]"
                    >
                      {game.players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name} · {windLabel(game.seats[player.id])}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {outcomeType === 'draw' ? (
                  <p className="rounded-md bg-[#f7f1e3] px-3 py-3 text-[11px] leading-5 text-[#66746e]">A draw records no scores and no payments. East and the prevailing wind remain unchanged.</p>
                ) : <div className="grid gap-4 sm:grid-cols-2">
                  {game.players.map((player) => (
                    <label key={player.id} className="block">
                      <span className="mb-1.5 block text-[11px] font-semibold text-[#284d45]">
                           {player.name}{' '}
                        <span className="font-normal text-[#7a7769]">
                          ({windLabel(game.seats[player.id])})
                        </span>
                           {scoreRecords[player.id]?.source ===
                             'detailed-scorer' &&
                             scoreRecords[player.id]?.requiresRecalculation && (
                               <span className="ml-2 font-normal text-[#ae6249]">
                                 Winner changed — recalculate
                               </span>
                             )}
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={0}
                          step={1}
                           placeholder="Enter score"
                          data-testid={`input-score-${player.id}`}
                          value={scores[player.id] === undefined ? '' : scores[player.id]}
                           onChange={(event) => {
                             const value = event.target.value;
                             const next: RoundScoringDraft = applyManualScore(
                               game,
                               { scores, scoreRecords },
                               player.id,
                               value === '' ? null : Number(value),
                             );
                             setScores(next.scores);
                             setScoreRecords(next.scoreRecords);
                           }}
                          className="w-full min-w-0 rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-3 font-mono text-[16px] text-[#284d45] outline-none focus:ring-2 focus:ring-[#ae6249]"
                        />
                        <button
                          type="button"
                          data-testid={`button-calculate-${player.id}`}
                           onClick={() =>
                             onOpenHandScorer(
                               createHandScorerContext(
                                 game,
                                 player.id,
                                 outcome,
                                 scoreRecords[player.id],
                               ),
                             )
                           }
                           className="flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-[#cfc3aa] bg-[#e8e1d1] px-3 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#d8ceb8]"
                          aria-label={`Calculate score for ${player.name}`}
                        >
                           <Calculator size={15} />
                           Calculate
                        </button>
                      </div>
                    </label>
                  ))}
                </div>}
                {game.setup.rulesProfile.id === 'outside-the-box' && (
                  <section data-testid="section-round-incidents" className="mt-5 border-t border-[#d8ceb8] pt-5">
                    <div className="font-mono text-[10px] uppercase tracking-[.15em] text-[#ae6249]">Round incidents / penalties</div>
                    <p className="mt-1 text-[11px] text-[#7a7769]">No incidents unless the table records one. These are manual end-of-round evidence, not simulated play.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(['incorrect-hand', 'false-discard-name', 'false-mah-jong', 'wrong-tile-claim', 'cannon'] as const).map((type) => (
                        <button key={type} type="button" className="rounded border border-[#cfc3aa] px-2 py-1 text-[10px] text-[#284d45]" onClick={() => {
                          const first = game.players[0].id;
                          const second = game.players[1].id;
                          const incident: RoundIncident = type === 'incorrect-hand' ? { type, playerId: first, condition: 'too-few' }
                            : type === 'false-discard-name' ? { type, discarderId: first, claimantId: second, result: 'mah-jong' }
                            : type === 'false-mah-jong' ? { type, declarerId: first, anyHandExposed: false }
                            : type === 'wrong-tile-claim' ? { type, playerId: first, correctedBeforeNextDraw: true }
                            : { type, liablePlayerId: first, noChoiceAccepted: false };
                          setIncidents((current) => [...current, incident]);
                        }}>{type === 'false-discard-name' ? 'False discard name — caused Mah Jong' : type.replaceAll('-', ' ')}</button>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-[#7a7769]">Ordinary pickup penalty: 50 documented; recipient still awaiting source confirmation.</p>
                    {incidents.length > 0 && <div className="mt-3 space-y-2">
                      {incidents.map((incident, index) => <div key={index} className="flex flex-wrap items-center gap-2 rounded bg-[#f7f1e3] p-2 text-[10px] text-[#284d45]">
                        <span className="font-semibold">{incident.type.replaceAll('-', ' ')}</span>
                        <select value={'playerId' in incident ? incident.playerId : 'declarerId' in incident ? incident.declarerId : 'liablePlayerId' in incident ? incident.liablePlayerId : incident.discarderId} onChange={(event) => setIncidents((current) => current.map((item, itemIndex) => itemIndex !== index ? item : 'playerId' in item ? { ...item, playerId: event.target.value } : 'declarerId' in item ? { ...item, declarerId: event.target.value } : 'liablePlayerId' in item ? { ...item, liablePlayerId: event.target.value } : { ...item, discarderId: event.target.value }))}>{game.players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</select>
                        {incident.type === 'incorrect-hand' && <select value={incident.condition} onChange={(event) => setIncidents((current) => current.map((item, itemIndex) => itemIndex === index && item.type === 'incorrect-hand' ? { ...item, condition: event.target.value as 'too-few' | 'too-many' } : item))}><option value="too-few">too few</option><option value="too-many">too many</option></select>}
                        {incident.type === 'false-discard-name' && <><select value={incident.claimantId} onChange={(event) => setIncidents((current) => current.map((item, itemIndex) => itemIndex === index && item.type === 'false-discard-name' ? { ...item, claimantId: event.target.value } : item))}>{game.players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</select><span>caused Mah Jong</span></>}
                        {incident.type === 'false-mah-jong' && <label><input type="checkbox" checked={incident.anyHandExposed} onChange={(event) => setIncidents((current) => current.map((item, itemIndex) => itemIndex === index && item.type === 'false-mah-jong' ? { ...item, anyHandExposed: event.target.checked } : item))} /> hand exposed</label>}
                        {incident.type === 'wrong-tile-claim' && <label><input type="checkbox" checked={incident.correctedBeforeNextDraw} onChange={(event) => setIncidents((current) => current.map((item, itemIndex) => itemIndex === index && item.type === 'wrong-tile-claim' ? { ...item, correctedBeforeNextDraw: event.target.checked } : item))} /> corrected in time</label>}
                        {incident.type === 'cannon' && <label><input type="checkbox" checked={incident.noChoiceAccepted} onChange={(event) => setIncidents((current) => current.map((item, itemIndex) => itemIndex === index && item.type === 'cannon' ? { ...item, noChoiceAccepted: event.target.checked } : item))} /> No choice! accepted</label>}
                        <button type="button" onClick={() => setIncidents((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
                      </div>)}
                    </div>}
                  </section>
                )}
              </>
            )}
          </details>}

        </section>

        {workspaceStage !== 'entry' && <section data-testid="section-settlement-stage" className="screen-only overflow-hidden rounded-xl bg-[#284d45] text-[#f8f4e9] shadow-[var(--shadow-lg)]">
            <div className="border-b border-[#55756c] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#d7a287]">
                {game.isComplete ? 'Final Standings' : 'Round settlement'}
              </div>
              <div className="mt-2 font-serif text-[27px]">
                {game.isComplete ? 'Game Complete' : outcomeType === 'draw' ? 'No payments this hand' : 'Who pays whom'}
              </div>
              {!game.isComplete && <a href="/help#settlement" className="mt-2 inline-flex text-[11px] font-semibold text-[#e8eee9] underline decoration-[#d7a287] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a287]">How settlement works</a>}
            </div>

            {!game.isComplete ? (
              <div className="p-5">
                {previewPresentation === 'no-payments' ? <p className="rounded-md bg-[#355e54] px-3 py-3 text-[15px] leading-6 text-[#c8d8d1]">This draw has no payments. East and the prevailing Wind remain unchanged.</p> : <div className="space-y-2 rounded-md bg-[#355e54] p-3 text-[14px] leading-6 text-[#e5eee9]">
                  {previewPresentation === 'transactions' ? preview.settlement?.transactions.map((transaction, index) => <p key={`${transaction.fromPlayerId}-${transaction.toPlayerId}-${index}`}>{settlementDescription(transaction, game.players, currentEastId ?? '')}</p>) : <p>Enter complete hand scores to see who pays whom.</p>}
                </div>}
                <div className="mt-5"><div className="mb-2 font-mono text-[10px] uppercase tracking-[.16em] text-[#d7a287]">Net change</div><div className="space-y-3">
                  {game.players.map((player) => {
                    const change = preview.settlement?.changes[player.id] ?? 0;
                    return (
                      <div
                        key={player.id}
                        className="flex items-center justify-between border-b border-[#45665d] pb-3 last:border-0"
                      >
                        <div>
                          <div className="text-[12px] font-semibold">
                            {player.name}
                          </div>
                          <div className="font-mono text-[8px] uppercase tracking-wider text-[#b4c4bd]">
                            {windLabel(game.seats[player.id])}
                          </div>
                        </div>
                        <div
                          className={`font-mono text-[18px] font-bold ${
                            change > 0
                              ? 'text-[#b8d5c5]'
                              : change < 0
                                ? 'text-[#e6a48d]'
                                : 'text-[#b4c4bd]'
                          }`}
                        >
                          {formatChange(change)}
                        </div>
                      </div>
                    );
                  })}
                </div></div>
                <div className="mt-5 flex items-center gap-2 rounded-md bg-[#355e54] px-3 py-2 text-[10px] text-[#c8d8d1]">
                  <Check size={13} />
                  Changes total {preview.settlement?.zeroSum ? 'zero' : '—'}
                </div>
                {preview.error && (
                  <p data-testid="preview-domain-error" className="mt-3 rounded-md bg-[#6b3a36] px-3 py-2 text-[11px] font-semibold leading-5 text-[#ffe5db]">
                    {preview.error}
                  </p>
                )}
                {incidents.length > 0 && (
                  <div className="mt-3 rounded-md bg-[#355e54] px-3 py-2 text-[10px] leading-5 text-[#c8d8d1]">
                    {incidents.map((incident, index) => <div key={index}>{incidentDescription(incident, game.players)}</div>)}
                  </div>
                )}
                {error && (
                  <p className="mt-3 text-[11px] font-semibold text-[#e6a48d]">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  data-testid="button-confirm-hand"
                  onClick={confirmRound}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#f3e8d4] px-4 py-3 text-[12px] font-bold text-[#284d45]"
                >
                  Record hand and advance <ArrowRight size={15} />
                </button>
                <p className="mt-2 text-center text-[13px] leading-5 text-[#c8d8d1]">Records this settlement, updates totals, and advances East, Wind and hand state when the active rules require it.</p>
              </div>
            ) : (
              <div className="p-5">
                <p className="mb-3 text-center text-[11px] text-[#b4c4bd]">
                  {game.handHistory.length} hands played · Winner: {[...game.players].sort((a, b) => game.balances[b.id] - game.balances[a.id])[0]?.name}
                </p>
                <div className="flex justify-center py-6 text-[#b4c4bd]">
                  <Trophy size={48} className="opacity-50" />
                </div>
                <div className="space-y-3">
                  {[...game.players]
                    .sort((a, b) => game.balances[b.id] - game.balances[a.id])
                    .map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between border-b border-[#45665d] pb-3 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-[14px] font-bold text-[#d7a287]">{index + 1}</div>
                          <div>
                            <div className="text-[12px] font-semibold">{player.name}</div>
                            <div className="font-mono text-[8px] uppercase tracking-wider text-[#b4c4bd]">
                              {windLabel(game.seats[player.id])}
                            </div>
                          </div>
                        </div>
                        <div className={`font-mono text-[18px] font-bold ${game.balances[player.id] > 0 ? 'text-[#b8d5c5]' : game.balances[player.id] < 0 ? 'text-[#e6a48d]' : 'text-[#b4c4bd]'}`}>
                          {formatChange(game.balances[player.id])}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={() => printGame('summary')} className="rounded-md border border-[#b4c4bd] px-3 py-3 text-[11px] font-bold text-[#f8f4e9] hover:bg-[#355e54]">Print / Save summary</button>
                  <button type="button" onClick={() => printGame('full')} className="rounded-md bg-[#f3e8d4] px-3 py-3 text-[11px] font-bold text-[#284d45]">Print / Save full record</button>
                </div>
              </div>
            )}
          </section>}
          <section className="print-only game-print-standings">
            <div className="font-mono text-[10px] uppercase tracking-[.2em]">{game.isComplete ? 'Final standings' : 'Confirmed standings'}</div>
            <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-4">
              {printStandings(game).map((player, index) => (
                <div key={player.id}>
                  <b>{game.isComplete ? `${index + 1}. ` : ''}{player.name}</b><br />{formatChange(game.balances[player.id])}
                </div>
              ))}
            </div>
          </section>

        <details ref={gameLedgerRef} id="game-ledger" data-testid="details-game-ledger" className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6">
          <summary className="mb-4 flex cursor-pointer list-none items-center gap-2 font-serif text-[23px] text-[#284d45]">
            <History size={16} className="text-[#ae6249]" />
            Game ledger
          </summary>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[.14em] text-[#7a7769]">{handCountLabel(game.handHistory.length)}</p>
          {game.handHistory.length === 0 ? (
            <p className="text-[12px] text-[#8c8a7f]">
              Confirm the first hand to begin the ledger.
            </p>
          ) : (
            <div className="space-y-3">
              {[...game.handHistory].reverse().map((hand) => (
                <details
                  key={hand.handNumber}
                  ref={(element) => {
                    if (element) ledgerDetailsRefs.current.set(hand.handNumber, element);
                    else ledgerDetailsRefs.current.delete(hand.handNumber);
                  }}
                  className="rounded-lg border border-[#e2d9c7] bg-[#fdfbf5] p-4"
                >
                  <summary className="game-ledger-summary cursor-pointer list-none text-[#284d45]">
                    <div className="font-serif text-[17px] font-bold leading-tight">
                      Hand {hand.handNumber} · {hand.outcome.type === 'draw'
                        ? 'Draw'
                        : `${game.players.find((player) => player.id === (hand.outcome.type === 'win' ? hand.outcome.winnerId : ''))?.name} won`}
                    </div>
                    <div className="mt-1 text-[11px] font-normal text-[#7a7769]">
                      {game.players.find((player) => player.id === hand.eastPlayerId)?.name} was East · {windLabel(hand.prevailingWind)} prevailing · {hand.handMode === 'goulash' ? 'Goulash' : 'Normal'} → {hand.nextHandMode === 'goulash' ? 'Goulash' : 'Normal'}
                    </div>
                  </summary>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {game.players.map((player) => (
                      <div
                        key={player.id}
                        className="flex justify-between text-[11px] text-[#66746e]"
                      >
                        <span>{player.name}: score {hand.scores[player.id]} · total {formatChange(hand.runningTotals[player.id])}</span>
                        <b
                          className={
                            hand.settlement.changes[player.id] >= 0
                              ? 'text-[#477562]'
                              : 'text-[#ae6249]'
                          }
                        >
                          {formatChange(hand.settlement.changes[player.id])}
                        </b>
                      </div>
                    ))}
                  </div>
                  {hand.settlement.transactions.length > 0 && (
                    <div className="mt-3 border-t border-[#e2d9c7] pt-3 text-[10px] leading-5 text-[#7a7769]">
                      {hand.settlement.transactions.map(
                        (transaction, index) => (
                          <div key={`${transaction.fromPlayerId}-${transaction.toPlayerId}-${index}`}>
                            {settlementDescription(transaction, game.players, hand.eastPlayerId)}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                  {hand.incidents.length > 0 && (
                    <div className="mt-3 border-t border-[#e2d9c7] pt-3 text-[10px] leading-5 text-[#7a7769]">
                      {hand.incidents.map((incident, index) => <div key={index}>{incidentDescription(incident, game.players)}</div>)}
                    </div>
                  )}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {game.players.map((player) => {
                      const record = hand.scoreRecords[player.id];
                      return record?.source === 'detailed-scorer'
                        ? <HandRecord key={player.id} playerName={player.name} record={record} />
                        : <div key={player.id} className="manual-score-record rounded-lg border border-[#e2d9c7] bg-[#fbf8ed] p-3 text-[10px] text-[#66746e]"><b>{player.name} · Score entered manually</b><br />No detailed hand was recorded.</div>;
                    })}
                  </div>
                </details>
              ))}
            </div>
          )}
        </details>
        <footer className="game-record-footer"><span>mahjong.smooks.co.uk</span><span>Mahjong tile artwork from xhokir/riichi-mahjong-tiles, based on FluffyStuff/riichi-mahjong-tiles, used under CC BY 4.0.</span><a href="https://buymeacoffee.com/sharronmo">Buy me a coffee</a></footer>
      </main>
    </div>
  );
}
