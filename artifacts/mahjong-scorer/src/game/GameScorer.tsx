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
  Printer,
} from 'lucide-react';
import { HandRecord, settlementDescription } from './HandRecord';
import { SiteHeader } from '../components/SiteHeader';
import {
  applyManualScore,
  applyHandScorerSession,
  confirmHand,
  createBmjaGame,
  createHandScorerContext,
  CURRENT_RULESET,
  GAME_WINDS,
  reconcileDetailedHandsForOutcome,
  returnAppliedScoreToTable,
  undoLastHand,
  clearGameRecovery,
  loadInProgressGameRecovery,
  saveGameRecovery,
} from '.';
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
  SeatAssignments,
} from '.';
import type { Wind } from '../scoring';

type GameScorerProps = {
  onOpenHandScorer: (context?: HandScorerContext) => void;
  returnedScore?: HandScorerResult | null;
  onClearReturnedScore: () => void;
};

const windLabel = (wind: Wind) =>
  `${wind.charAt(0).toUpperCase()}${wind.slice(1)}`;

const formatChange = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}`;

export const handCountLabel = (count: number) =>
  `${count} ${count === 1 ? 'hand' : 'hands'} played`;

export function GameScorer({ onOpenHandScorer, returnedScore, onClearReturnedScore }: GameScorerProps) {
  const [recovered, setRecovered] = useState(() =>
    typeof window === 'undefined'
      ? null
      : loadInProgressGameRecovery(window.localStorage),
  );
  const [names, setNames] = useState(['', '', '', '']);
  const [gameLength, setGameLength] = useState<GameLength>(recovered?.game.setup.gameLength ?? 'one-round');
  const [game, setGame] = useState<GameState | null>(recovered?.game ?? null);
  const [outcomeType, setOutcomeType] = useState<'win' | 'draw'>(recovered?.outcomeType ?? 'win');
  const [winnerId, setWinnerId] = useState(recovered?.winnerId ?? '');
  const [scores, setScores] = useState<RoundScoreDraft>(recovered?.draft.scores ?? {});
  const [scoreRecords, setScoreRecords] = useState<PlayerScoreRecords>(recovered?.draft.scoreRecords ?? {});
  const [error, setError] = useState('');
  const tableScoresRef = useRef<HTMLElement>(null);

  const currentEastId = game
    ? Object.entries(game.seats).find(([, seat]) => seat === 'east')?.[0]
    : undefined;

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
      { scores, scoreRecords },
    );
  }, [game, outcomeType, scoreRecords, scores, winnerId]);

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
    if (!game || !outcome) return null;
    const fullScores = Object.fromEntries(game.players.map(p => [p.id, scores[p.id] ?? 0])) as PlayerAmounts;
    try {
      return CURRENT_RULESET.settleRound(game.players, game.seats, {
        outcome,
        scores: fullScores,
      });
    } catch {
      return null;
    }
  }, [game, outcome, scores]);

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
    const started = createBmjaGame(players, seats, undefined, gameLength);
    setGame(started);
    setScores({});
    setScoreRecords({});
    setWinnerId(players[0].id);
    setError('');
  };

  const startOver = () => {
    if (typeof window !== 'undefined') clearGameRecovery(window.localStorage);
    setRecovered(null);
    setGame(null);
    setScores({});
    setScoreRecords({});
    setWinnerId('');
    setOutcomeType('win');
    setError('');
  };

  const resetRoundEntry = (nextGame: GameState) => {
    setScores({});
    setScoreRecords({});
    const east = Object.entries(nextGame.seats).find(
      ([, seat]) => seat === 'east',
    )?.[0];
    setWinnerId(east ?? nextGame.players[0].id);
    setOutcomeType('win');
  };

  const confirmRound = () => {
    if (!game || !outcome || !preview) {
      setError('Choose a winner and enter a score for every player.');
      return;
    }
    const isScoresComplete = game.players.every(p => scores[p.id] !== undefined);
    if (!isScoresComplete) {
      setError('Enter a score for every player (use 0 if none).');
      return;
    }
    const fullScores = Object.fromEntries(game.players.map(p => [p.id, scores[p.id] ?? 0])) as PlayerAmounts;
    const next = confirmHand(game, {
      outcome,
      scores: fullScores,
      scoreRecords,
    });
    setGame(next);
    resetRoundEntry(next);
    setError('');
  };

  const undo = () => {
    if (!game || game.handHistory.length === 0) return;
    const next = undoLastHand(game);
    setGame(next);
    resetRoundEntry(next);
  };

  const printGame = () => window.print();

  if (!game) {
    return (
      <div className="mahjong-shell">
        <SiteHeader />

        <main className="mx-auto max-w-[900px] px-5 py-10 lg:px-8 lg:py-14">
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              <div className="fine-rule w-10" />
              <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">
                New BMJA game
              </span>
            </div>
            <h1 className="font-serif text-[clamp(38px,6vw,62px)] leading-none text-[#284d45]">
              Seat the table.
            </h1>
            <p className="mt-4 max-w-[620px] text-[14px] leading-6 text-[#66746e]">
              Enter players in their starting seats. Your game stays in this
              browser so you can continue after a refresh.
            </p>
          </div>

          <section className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 shadow-[var(--shadow-sm)] sm:p-7">
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.15em] text-[#7a7769]">
                  Game Length
                </span>
                <select
                  data-testid="select-game-length"
                  value={gameLength}
                  onChange={(e) => setGameLength(e.target.value as GameLength)}
                  className="w-full rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-3 text-[13px] font-semibold text-[#284d45] focus:ring-2 focus:ring-[#ae6249]"
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
                    className="w-full rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-3 text-[13px] text-[#284d45] outline-none focus:ring-2 focus:ring-[#ae6249]"
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
              Start game <ArrowRight size={15} />
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="mahjong-shell">
      <div className="screen-only"><SiteHeader /></div>
      <div className="screen-only border-b border-[#d8ceb8] bg-[#f5f1e6]/70">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[.24em] text-[#ae6249]">
              Hand {game.handHistory.length + 1} / {CURRENT_RULESET.name}
            </div>
            <div className="font-serif text-[21px] font-bold text-[#284d45]">
              {game.players.find((player) => player.id === currentEastId)?.name}{' '}
              is East · {windLabel(game.prevailingWind)} prevailing
            </div>
            {recovered && (
              <p className="mt-1 text-[11px] font-semibold text-[#477562]">
                Your saved game has been recovered.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              data-testid="button-undo-hand"
              disabled={game.handHistory.length === 0}
              onClick={undo}
              className="flex items-center gap-2 rounded-md border border-[#cfc3aa] bg-[#fbf8ed] px-3 py-2 text-[11px] font-semibold text-[#66746e] disabled:opacity-40"
            >
              <Undo2 size={14} /> Undo last hand
            </button>
            <button
              type="button"
              data-testid="button-start-over"
              onClick={startOver}
              className="flex items-center gap-2 rounded-md border border-[#cfc3aa] bg-[#fbf8ed] px-3 py-2 text-[11px] font-semibold text-[#66746e]"
            >
              <RotateCcw size={14} /> Start over
            </button>
            <button
              type="button"
              onClick={() => onOpenHandScorer()}
              className="flex items-center gap-2 rounded-md bg-[#284d45] px-3 py-2 text-[11px] font-semibold text-[#f8f4e9]"
            >
              <Sparkles size={14} /> Detailed hand scorer
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1440px] gap-6 px-5 py-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-8">
        <div className="print-only game-print-heading">
          <h1>British Mahjong Scorer — Game record</h1>
          <p>{game.isComplete ? 'Game complete' : 'Game in progress'} · {handCountLabel(game.handHistory.length)}</p>
        </div>
        <section className="min-w-0 space-y-5">
          <div>
            <div className="mb-2 font-mono text-[9px] font-medium uppercase tracking-[.18em] text-[#7a7769]">
              Running game totals
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
              {game.players.map((player) => (
                <div
                  key={player.id}
                  className={`rounded-lg border p-3 sm:rounded-xl sm:p-4 ${
                    game.seats[player.id] === 'east'
                      ? 'border-[#ae6249] bg-[#f5eadb]'
                      : 'border-[#d8ceb8] bg-[#fbf8ed]'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-[8px] uppercase tracking-[.12em] text-[#ae6249] sm:text-[9px] sm:tracking-[.16em]">
                        {windLabel(game.seats[player.id])}
                        {game.seats[player.id] === 'east' ? ' · Dealer' : ''}
                      </div>
                      <div className="mt-0.5 truncate font-serif text-[16px] leading-tight text-[#284d45] sm:mt-1 sm:text-[20px]">
                        {player.name}
                      </div>
                    </div>
                    <div className="shrink-0 text-right font-mono text-[15px] font-bold leading-tight text-[#284d45] sm:text-[18px]">
                      {formatChange(game.balances[player.id])}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section ref={tableScoresRef} data-testid="section-table-scores" className="screen-only scroll-mt-4 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6">
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
                <p className="mt-2 text-[12px] text-[#7a7769]">
                  Enter each player’s hand score, not the payment amount.
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

                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
              </>
            )}
          </section>

        </section>

        <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <section className="screen-only sticky top-5 overflow-hidden rounded-xl bg-[#284d45] text-[#f8f4e9] shadow-[var(--shadow-lg)]">
            <div className="border-b border-[#55756c] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#d7a287]">
                {game.isComplete ? 'Final Standings' : 'Round settlement'}
              </div>
              <div className="mt-2 font-serif text-[27px]">
                {game.isComplete ? 'Game Complete' : outcomeType === 'draw' ? 'No payments' : 'Preview changes'}
              </div>
            </div>

            {!game.isComplete ? (
              <div className="p-5">
                <div className="space-y-3">
                  {game.players.map((player) => {
                    const change = preview?.changes[player.id] ?? 0;
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
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-md bg-[#355e54] px-3 py-2 text-[10px] text-[#c8d8d1]">
                  <Check size={13} />
                  Changes total {preview?.zeroSum ? 'zero' : '—'}
                </div>
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
                  Confirm and advance <ArrowRight size={15} />
                </button>
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
              </div>
            )}
          </section>
          <section className="print-only game-print-standings">
            <div className="font-mono text-[10px] uppercase tracking-[.2em]">Confirmed standings</div>
            <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-4">
              {game.players.map((player) => (
                <div key={player.id}>
                  <b>{player.name}</b><br />{formatChange(game.balances[player.id])}
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6 lg:col-start-1">
          <div className="mb-4 flex items-center gap-2">
            <History size={16} className="text-[#ae6249]" />
            <h2 className="font-serif text-[23px] text-[#284d45]">
              Game ledger
            </h2>
            <button type="button" data-testid="button-print-game" onClick={printGame} className="screen-only ml-auto flex items-center gap-2 rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-2 text-[11px] font-semibold text-[#284d45]">
              <Printer size={14} /> Print / Save game
            </button>
          </div>
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
                  className="rounded-lg border border-[#e2d9c7] bg-[#fdfbf5] p-4"
                >
                  <summary className="game-ledger-summary cursor-pointer list-none text-[#284d45]">
                    <div className="font-serif text-[17px] font-bold leading-tight">
                      Hand {hand.handNumber} · {hand.outcome.type === 'draw'
                        ? 'Draw'
                        : `${game.players.find((player) => player.id === (hand.outcome.type === 'win' ? hand.outcome.winnerId : ''))?.name} won`}
                    </div>
                    <div className="mt-1 text-[11px] font-normal text-[#7a7769]">
                      {game.players.find((player) => player.id === hand.eastPlayerId)?.name} was East · {windLabel(hand.prevailingWind)} prevailing
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
        </section>
        <footer className="game-record-footer lg:col-span-2"><span>mahjong.smooks.co.uk</span><span>Mahjong tile artwork from xhokir/riichi-mahjong-tiles, based on FluffyStuff/riichi-mahjong-tiles, used under CC BY 4.0.</span><a href="https://buymeacoffee.com/sharronmo">Buy me a coffee</a></footer>
      </main>
    </div>
  );
}
