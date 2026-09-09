import { ArrowRight, History } from 'lucide-react';
import { useState } from 'react';
import { gameProgressSummary, recoverableGameForReturn } from '../game';

/** Reads the same replay-validated snapshot used by the homepage and game. */
export function useInProgressGameRecovery() {
  return useState(() => typeof window === 'undefined' ? null : recoverableGameForReturn(window.localStorage))[0];
}

/** Read-only recovery affordance for pages outside the active game. */
export function ReturnToGame() {
  const recovered = useInProgressGameRecovery();
  if (!recovered) return null;
  return <aside className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#b8cdbf] bg-[#edf3ed] px-4 py-3 text-[#284d45]" aria-label="Saved game">
    <div className="flex min-w-0 items-center gap-2"><History size={16} className="shrink-0 text-[#477562]" aria-hidden="true" /><span className="text-[11px] leading-5"><strong>Game in progress</strong><span className="hidden sm:inline"> · {gameProgressSummary(recovered.game)}</span></span></div>
    <a href="/game" className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-[#284d45] px-3 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">Return to game <ArrowRight size={14} aria-hidden="true" /></a>
  </aside>;
}
