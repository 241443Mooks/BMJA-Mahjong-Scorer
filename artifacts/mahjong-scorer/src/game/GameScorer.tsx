import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  History,
  RotateCcw,
  Sparkles,
  Undo2,
} from 'lucide-react';
import {
  confirmHand,
  createBmjaGame,
  CURRENT_RULESET,
  GAME_WINDS,
  undoLastHand,
} from '.';
import type {
  GamePlayer,
  GameState,
  HandOutcome,
  PlayerAmounts,
  SeatAssignments,
} from '.';
import type { Wind } from '../scoring';

type GameScorerProps = {
  onOpenHandScorer: () => void;
};

const windLabel = (wind: Wind) =>
  `${wind.charAt(0).toUpperCase()}${wind.slice(1)}`;

const formatChange = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}`;

const emptyScores = (players: GamePlayer[]): PlayerAmounts =>
  Object.fromEntries(players.map((player) => [player.id, 0]));

export function GameScorer({ onOpenHandScorer }: GameScorerProps) {
  const [names, setNames] = useState(['', '', '', '']);
  const [game, setGame] = useState<GameState | null>(null);
  const [outcomeType, setOutcomeType] = useState<'win' | 'draw'>('win');
  const [winnerId, setWinnerId] = useState('');
  const [scores, setScores] = useState<PlayerAmounts>({});
  const [error, setError] = useState('');

  const currentEastId = game
    ? Object.entries(game.seats).find(([, seat]) => seat === 'east')?.[0]
    : undefined;

  const outcome: HandOutcome | null = game
    ? outcomeType === 'draw'
      ? { type: 'draw' }
      : winnerId
        ? { type: 'win', winnerId }
        : null
    : null;

  const preview = useMemo(() => {
    if (!game || !outcome) return null;
    try {
      return CURRENT_RULESET.settleRound(game.players, game.seats, {
        outcome,
        scores,
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
    const started = createBmjaGame(players, seats);
    setGame(started);
    setScores(emptyScores(players));
    setWinnerId(players[0].id);
    setError('');
  };

  const resetRoundEntry = (nextGame: GameState) => {
    setScores(emptyScores(nextGame.players));
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
    const next = confirmHand(game, { outcome, scores });
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

  if (!game) {
    return (
      <div className="mahjong-shell">
        <header className="border-b border-[#d8ceb8] bg-[#f5f1e6]/90">
          <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-5 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#284d45] text-[#f5f1e6]">
                <span className="font-serif text-[22px] font-bold">麻</span>
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[.24em] text-[#ae6249]">
                  BMJA / GAME TABLE
                </div>
                <div className="font-serif text-[20px] font-bold leading-none text-[#284d45]">
                  The Scorer
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenHandScorer}
              className="rounded-md border border-[#cfc3aa] bg-[#fbf8ed] px-3 py-2 text-[11px] font-semibold text-[#284d45]"
            >
              Detailed hand scorer
            </button>
          </div>
        </header>

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
              Enter players in their starting seats. Scores and history stay in
              this browser until the page is refreshed.
            </p>
          </div>

          <section className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 shadow-[var(--shadow-sm)] sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
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
      <header className="border-b border-[#d8ceb8] bg-[#f5f1e6]/90">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[.24em] text-[#ae6249]">
              Hand {game.handHistory.length + 1} / {CURRENT_RULESET.name}
            </div>
            <div className="font-serif text-[21px] font-bold text-[#284d45]">
              {game.players.find((player) => player.id === currentEastId)?.name}{' '}
              is East · {windLabel(game.prevailingWind)} prevailing
            </div>
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
              onClick={onOpenHandScorer}
              className="flex items-center gap-2 rounded-md bg-[#284d45] px-3 py-2 text-[11px] font-semibold text-[#f8f4e9]"
            >
              <Sparkles size={14} /> Detailed hand scorer
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] gap-6 px-5 py-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-8">
        <section className="min-w-0 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {game.players.map((player) => (
              <div
                key={player.id}
                className={`rounded-xl border p-4 ${
                  game.seats[player.id] === 'east'
                    ? 'border-[#ae6249] bg-[#f5eadb]'
                    : 'border-[#d8ceb8] bg-[#fbf8ed]'
                }`}
              >
                <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#ae6249]">
                  {windLabel(game.seats[player.id])}
                  {game.seats[player.id] === 'east' ? ' · Dealer' : ''}
                </div>
                <div className="mt-1 font-serif text-[22px] text-[#284d45]">
                  {player.name}
                </div>
                <div className="mt-3 font-mono text-[17px] font-bold text-[#284d45]">
                  {formatChange(game.balances[player.id])}
                  <span className="ml-1 text-[9px] font-normal uppercase text-[#7a7769]">
                    total
                  </span>
                </div>
              </div>
            ))}
          </div>

          <section className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6">
            <div className="mb-5">
              <div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">
                Current hand
              </div>
              <h1 className="mt-1 font-serif text-[30px] text-[#284d45]">
                Enter the table scores
              </h1>
              <p className="mt-2 text-[12px] text-[#7a7769]">
                Enter each player’s hand score, not the payment amount.
              </p>
            </div>

            <div className="mb-5 flex gap-2">
              <button
                type="button"
                data-testid="button-outcome-win"
                onClick={() => setOutcomeType('win')}
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
                onClick={() => setOutcomeType('draw')}
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
                  onChange={(event) => setWinnerId(event.target.value)}
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

            <div className="grid gap-3 sm:grid-cols-2">
              {game.players.map((player) => (
                <label key={player.id} className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#284d45]">
                    {player.name}{' '}
                    <span className="font-normal text-[#7a7769]">
                      ({windLabel(game.seats[player.id])})
                    </span>
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    data-testid={`input-score-${player.id}`}
                    value={scores[player.id] ?? 0}
                    onChange={(event) =>
                      setScores((current) => ({
                        ...current,
                        [player.id]: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-3 font-mono text-[14px] text-[#284d45] outline-none focus:ring-2 focus:ring-[#ae6249]"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <History size={16} className="text-[#ae6249]" />
              <h2 className="font-serif text-[23px] text-[#284d45]">
                Game ledger
              </h2>
            </div>
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
                    <summary className="cursor-pointer list-none text-[12px] font-semibold text-[#284d45]">
                      Hand {hand.handNumber} ·{' '}
                      {hand.outcome.type === 'draw'
                        ? 'Draw'
                        : `${game.players.find((player) => player.id === (hand.outcome.type === 'win' ? hand.outcome.winnerId : ''))?.name} won`}
                      <span className="ml-2 font-normal text-[#7a7769]">
                        East:{' '}
                        {
                          game.players.find(
                            (player) => player.id === hand.eastPlayerId,
                          )?.name
                        }
                      </span>
                    </summary>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {game.players.map((player) => (
                        <div
                          key={player.id}
                          className="flex justify-between text-[11px] text-[#66746e]"
                        >
                          <span>
                            {player.name}: {hand.scores[player.id]}
                          </span>
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
                              {
                                game.players.find(
                                  (player) =>
                                    player.id === transaction.fromPlayerId,
                                )?.name
                              }{' '}
                              paid{' '}
                              {
                                game.players.find(
                                  (player) =>
                                    player.id === transaction.toPlayerId,
                                )?.name
                              }{' '}
                              {transaction.amount}
                              {transaction.eastMultiplier === 2
                                ? ' (East ×2)'
                                : ''}
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </details>
                ))}
              </div>
            )}
          </section>
        </section>

        <aside>
          <section className="sticky top-5 overflow-hidden rounded-xl bg-[#284d45] text-[#f8f4e9] shadow-[var(--shadow-lg)]">
            <div className="border-b border-[#55756c] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#d7a287]">
                Round settlement
              </div>
              <div className="mt-2 font-serif text-[27px]">
                {outcomeType === 'draw' ? 'No payments' : 'Preview changes'}
              </div>
            </div>
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
          </section>
        </aside>
      </main>
    </div>
  );
}