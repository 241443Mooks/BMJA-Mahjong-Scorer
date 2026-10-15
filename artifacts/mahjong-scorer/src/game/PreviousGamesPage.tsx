import { useEffect, useState } from 'react';
import { ArrowRight, History } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { loadFinishedGameLedgers, type FinishedGameLedger } from './persistence';
import { descriptorForRulesProfile } from './rules-presentation';

const dateLabel = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? 'Date unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date);
};

export function PreviousGamesPage() {
  const [games, setGames] = useState<FinishedGameLedger[]>([]);
  useEffect(() => {
    try { setGames(loadFinishedGameLedgers(window.localStorage)); } catch { setGames([]); }
  }, []);

  return <div className="mahjong-shell min-h-screen"><SiteHeader /><main className="mx-auto max-w-[900px] px-5 py-8 sm:py-12">
    <p className="font-mono text-[11px] uppercase tracking-[.16em] text-[#ae6249]">Game history</p>
    <h1 className="mt-2 font-serif text-4xl text-[#284d45]">Previous games</h1>
    <p className="mt-3 max-w-[660px] text-[15px] leading-7 text-[#66746e]">Finished game records are kept in this browser on this device. Clearing site data, using private browsing, or switching browser or device can remove access. Browser storage is limited, so print or save a record to keep a separate copy.</p>
    {games.length ? <ul className="mt-7 grid gap-3">{games.map(({ id, finishedAt, game }) => {
      const standings = [...game.players].sort((a, b) => game.balances[b.id] - game.balances[a.id]);
      return <li key={id}><a href={`/previous-games/${encodeURIComponent(id)}`} className="block rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-4 text-[#284d45] shadow-[var(--shadow-sm)] hover:border-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.13em] text-[#ae6249]">Finished · {dateLabel(finishedAt)}</p><h2 className="mt-1 font-serif text-2xl">{game.players.map(({ name }) => name).join(' · ')}</h2><p className="mt-1 text-sm text-[#66746e]">{descriptorForRulesProfile(game.setup.rulesProfile).title} · {game.handHistory.length} {game.handHistory.length === 1 ? 'hand' : 'hands'}</p></div><ArrowRight className="mt-1 shrink-0 text-[#ae6249]" size={20} /></div>
        <p className="mt-3 border-t border-[#e1d8c7] pt-3 text-sm"><strong>Final totals:</strong> {standings.map(({ id: playerId, name }) => `${name} ${game.balances[playerId] > 0 ? '+' : ''}${game.balances[playerId]}`).join(' · ')}</p>
        <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline decoration-[#cfa58f] underline-offset-4"><History size={15} /> Open game ledger</span>
      </a></li>;
    })}</ul> : <div className="mt-7 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 text-[#66746e]">No finished games are saved in this browser yet.</div>}
  </main></div>;
}
