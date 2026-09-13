import { ArrowRight, Check } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { settlementDescription } from '../game/HandRecord';
import { canonicalSettlementExample } from '../game/settlement-teaching-example';

const players = [
  { id: 'east', name: 'East' }, { id: 'south', name: 'South' },
  { id: 'west', name: 'West' }, { id: 'north', name: 'North' },
];
const formatChange = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}`;

export function MahjongSettlementPage() {
  const example = canonicalSettlementExample();
  return <div className="mahjong-shell">
    <SiteHeader />
    <main className="mx-auto max-w-[980px] px-5 py-10 lg:px-8 lg:py-14">
      <div className="mb-8"><div className="font-mono text-[11px] uppercase tracking-[.18em] text-[#ae6249]">Mahjong settlement</div>
        <h1 className="mt-2 font-serif text-[clamp(38px,6vw,62px)] leading-none text-[#284d45]">Who pays whom<br />after a hand?</h1>
        <p className="mt-5 max-w-[720px] text-[17px] leading-7 text-[#66746e]">Settlement turns the four hand scores into the player-to-player changes for that hand, then adds each change to the running game totals.</p>
      </div>
      <section className="rounded-xl border border-[#b8cdbf] bg-[#edf3ed] p-5 text-[16px] leading-7 text-[#284d45]">
        <strong>Rules matter.</strong> This detailed explanation is for stable British / BMJA-style settlement. A configured Club game can add rules-specific incidents or liabilities. Western — Thompson &amp; Maloney scoring is available, but its ordinary play and settlement remain provisional while source review continues. <a className="font-semibold underline decoration-[#ae6249] underline-offset-4" href="/rules/british">British rules</a> · <a className="font-semibold underline decoration-[#ae6249] underline-offset-4" href="/rules/western">Western support status</a>
      </section>
      <section className="mt-7 grid gap-4 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:grid-cols-4 sm:p-6">
        {['Hand scores', 'Rules-aware transactions', 'Net change', 'Running totals'].map((item, index) => <div key={item} className="flex items-center gap-3 text-[16px] font-semibold text-[#284d45]"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#284d45] font-mono text-[13px] text-[#f8f4e9]">{index + 1}</span>{item}</div>)}
      </section>
      <section className="mt-8 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-7">
        <div className="font-mono text-[11px] uppercase tracking-[.16em] text-[#ae6249]">Engine-backed British example</div>
        <h2 className="mt-2 font-serif text-[30px] text-[#284d45]">A hand score is not a payment.</h2>
        <p className="mt-3 max-w-[720px] text-[16px] leading-7 text-[#66746e]">East scores 56; South wins with 60; West scores 40; North scores 44. The production settlement engine, not a page-only calculation, produces the transfers below.</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg bg-[#f5f1e6] p-4"><h3 className="text-[17px] font-semibold text-[#284d45]">Who pays whom</h3><div className="mt-3 space-y-2 text-[15px] leading-6 text-[#66746e]">{example.transactions.map((transaction, index) => <p key={index}>{settlementDescription(transaction, players, 'east')}</p>)}</div></div>
          <div className="rounded-lg bg-[#284d45] p-4 text-[#f8f4e9]"><h3 className="text-[17px] font-semibold">Net change</h3><div className="mt-3 space-y-2">{players.map((player) => <div key={player.id} className="flex justify-between border-b border-[#45665d] pb-2 text-[16px]"><span>{player.name}</span><strong>{formatChange(example.changes[player.id])}</strong></div>)}</div><p className="mt-4 flex items-center gap-2 text-[14px] text-[#c8d8d1]"><Check size={16}/>Changes total zero.</p></div>
        </div>
        <p className="mt-5 text-[16px] leading-7 text-[#66746e]">In British / BMJA-style settlement, each loser pays the winner the winner’s score. Payments involving East are doubled where the rules require it, and non-winners also settle score differences with one another. Those separate transfers combine into one net change per player.</p>
      </section>
      <section className="mt-8 grid gap-5 md:grid-cols-2"><div><h2 className="font-serif text-[28px] text-[#284d45]">One hand versus the whole game</h2><p className="mt-3 text-[16px] leading-7 text-[#66746e]">Settlement explains this hand. The tracker records it, updates running totals, then advances East, Wind and the next-hand state under the active rules. Final standings are the result of all confirmed hands, not a different payment calculation.</p></div><div><h2 className="font-serif text-[28px] text-[#284d45]">Use the right tool</h2><div className="mt-3 flex flex-col items-start gap-2 text-[16px] font-semibold"><a href="/game" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#284d45] px-4 text-[#f8f4e9]">Track a full game <ArrowRight size={16}/></a><a href="/hand" className="underline decoration-[#ae6249] underline-offset-4 text-[#284d45]">Score one hand</a></div></div></section>
    </main>
  </div>;
}
