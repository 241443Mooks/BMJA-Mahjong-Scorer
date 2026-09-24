import type { GamePlayer, McrAcceptedScoreRecord, McrSettlementTransaction } from './types';
import { presentMcrScore } from './mcr-score-presentation';
import { RecordedMahjongHand } from './HandRecord';

const playerName = (players: GamePlayer[], id: string) => players.find((player) => player.id === id)?.name ?? 'Unknown player';

export function mcrSettlementDescription(transaction: McrSettlementTransaction, players: GamePlayer[]) {
  const payer = playerName(players, transaction.fromPlayerId);
  const winner = playerName(players, transaction.toPlayerId);
  const source = transaction.reasonId === 'settlement.mcr-2006.discarder-payment'
    ? 'discarder payment'
    : transaction.reasonId === 'settlement.mcr-2006.other-player-base-payment'
      ? 'fixed payment'
      : transaction.reasonId === 'settlement.mcr-2006.self-draw-payment'
        ? 'self-draw'
        : `MCR payment (${transaction.reasonId})`;
  if (transaction.payerRole === 'other-player') return `${payer} paid ${winner} ${transaction.amount} — ${source === 'fixed payment' ? `fixed ${transaction.amount}-point payment` : source}`;
  const paymentSource = transaction.winSource === 'self-draw' ? source : transaction.payerRole === 'discarder' ? source : 'discard payment';
  return `${payer} paid ${winner} ${transaction.amount} — ${paymentSource} · winner ${transaction.basicPoints} Basic Points · fixed component ${transaction.fixedComponent}`;
}

/** Read-only rendering of the canonical accepted MCR record. */
export function McrHandRecord({ playerName: winner, record }: { playerName: string; record: McrAcceptedScoreRecord }) {
  const view = presentMcrScore(record.result);
  if (view.kind !== 'scored') return <section className="mt-3 rounded-lg border border-[#ae6249] bg-[#fbf1e9] p-3 text-sm" role="alert" aria-label="MCR record integrity warning">MCR hand record unavailable: accepted score evidence did not present as scored.</section>;
  return <section className="recorded-hand mt-3 rounded-lg border border-[#e2d9c7] bg-[#fbf8ed] p-3" aria-label={`${winner} · MCR recorded hand`} data-testid="mcr-hand-record">
    <div className="font-mono text-[9px] uppercase tracking-[.14em] text-[#ae6249]">{winner} · MCR recorded hand</div>
    <RecordedMahjongHand hand={record.hand} />
    <div className="mt-3 border-t border-[#e2d9c7] pt-3 text-[11px] leading-5 text-[#66746e]">
      <div className="flex flex-wrap gap-x-4"><span>Basic Points: <b>{view.basicPoints}</b></span><span>Qualifying subtotal: <b>{view.qualifyingSubtotal}</b></span><span>Flowers: <b>{view.flowers}</b></span></div>
      {view.counted.length > 0 && <p>Counted fan: {view.counted.map((fan) => `${fan.name} (${fan.value})`).join(' · ')}</p>}
      {view.suppressed.length > 0 && <div>Suppressed fan: {view.suppressed.map((fan) => <p key={`${fan.name}-${fan.reasonId}`}>{fan.name} ({fan.value}) — {fan.reason}</p>)}</div>}
      {view.interpretation && <p>Interpretation: {view.interpretation}</p>}
      <p>Win source: {record.input.context.winSource === 'self-draw' ? 'Self-draw' : 'Discard'}{record.input.context.resolvedWinEvent ? ` · Resolved win event: ${record.input.context.resolvedWinEvent.replaceAll('-', ' ')}` : ''}{record.input.context.lastVisibleCopy !== undefined ? ` · Last-visible-copy: ${record.input.context.lastVisibleCopy ? 'Yes' : 'No'}` : ''}</p>
      {(record.input.context.seatWind || record.input.context.prevailingWind) && <p>{record.input.context.seatWind ? `Seat wind: ${record.input.context.seatWind}` : ''}{record.input.context.seatWind && record.input.context.prevailingWind ? ' · ' : ''}{record.input.context.prevailingWind ? `Prevailing wind: ${record.input.context.prevailingWind}` : ''}</p>}
      <p>Profile: {record.rulesProfile.id} · Version {record.rulesProfile.version} · Runtime fingerprint: <code className="break-all">{record.rulesFingerprint}</code></p>
    </div>
  </section>;
}
