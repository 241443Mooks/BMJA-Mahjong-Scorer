import { ArrowRight, CheckCircle2, CircleHelp, Compass, Flower2, Gamepad2, ShieldCheck, Sparkles } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';

const variants = [
  {
    name: 'British / BMJA-style',
    clue: 'Flowers and Seasons score, losing hands can still matter, and ordinary hands are limited to one Chow.',
    points: [
      'Ordinary hands use familiar Pungs, Kongs, Chows and a pair, but with at most one Chow.',
      'Pungs, Kongs, some pairs, Flowers and Seasons contribute base points before doubles are applied.',
      'Named special hands and special fishing values are an important part of the ruleset.',
      'Non-winners can still have meaningful scores because settlement compares losing hands as well as paying the winner.',
    ],
  },
  {
    name: 'Hong Kong Mahjong',
    clue: 'Faan/fan scoring, normal multiple-Chow play, and traditional Cantonese-style table conventions.',
    points: [
      'Four sets and a pair is the familiar ordinary goal, with multiple Chows allowed.',
      'Scoring is usually expressed in faan/fan rather than British base-points-and-doubles.',
      'Flowers and minimum-hand conventions vary between published rules and individual tables.',
      'Settlement is usually winner-centred rather than calculating every losing hand in detail.',
    ],
  },
  {
    name: 'Japanese Riichi',
    clue: 'Players talk about yaku, han, fu, dora, furiten and declaring Riichi.',
    points: [
      'A structurally complete hand still needs at least one yaku to be a legal win.',
      'Riichi is a declaration available to a concealed player in tenpai and is itself a yaku.',
      'Dora increases value but does not make a yaku-less hand legal.',
      'Furiten and discard-reading give Riichi a strong defensive dimension.',
    ],
  },
  {
    name: 'Chinese Official / MCR',
    clue: 'A formal competition ruleset using a large standard catalogue of scoring combinations and an 8-point minimum.',
    points: [
      'MCR is a standardised competition system rather than a generic name for regional Chinese Mahjong.',
      'The ordinary hand structure is familiar, with recognised exceptions and no British one-Chow restriction.',
      'Scoring comes from combining recognised fan patterns under a shared tournament framework.',
      'The breadth of the scoring catalogue makes it feel more formal and pattern-dense than British play.',
    ],
  },
  {
    name: 'American / NMJL-style',
    clue: 'Jokers, the Charleston and an annually changing card of legal hands.',
    points: [
      'The current annual card defines the legal target hands rather than one universal four-sets-and-a-pair structure.',
      'Jokers are central to many hands.',
      'The Charleston is a structured tile-passing phase before ordinary play begins.',
      'A hand must match a valid pattern on the current card, so knowing another Mahjong ruleset does not tell you what is legal this year.',
    ],
  },
] as const;

const comparisonRows = [
  ['Core ordinary hand', 'Usually four sets + pair', 'Four sets + pair', 'Four sets + pair, with exceptions', 'Four sets + pair, with exceptions', 'Current card defines legal hands'],
  ['Chows', 'At most one in an ordinary hand', 'Normal', 'Normal', 'Normal', 'Only where the card pattern requires'],
  ['Flowers / Seasons', 'Yes; scoring bonus tiles', 'Common, treatment varies', 'Normally not used in standard 4-player play', 'Used', 'Not British-style bonus scoring'],
  ['Jokers', 'No ordinary wild Jokers', 'Normally no', 'No', 'No', 'Yes'],
  ['Annual card', 'No', 'No', 'No', 'No', 'Yes'],
  ['Charleston', 'No', 'No', 'No', 'No', 'Yes'],
  ['Riichi declaration', 'No', 'No', 'Yes', 'No', 'No'],
  ['Main scoring model', 'Base points + doubles + limits/special values', 'Faan/fan-style scoring', 'Yaku + han + fu', 'Standardised fan combinations', 'Value printed for the card hand'],
  ['Winning threshold', 'Legal complete hand; scoring then determines value', 'Often a table minimum; varies', 'At least one yaku', '8-point minimum', 'Must match a current-card hand'],
  ['Do losing hands matter?', 'Yes', 'Usually winner-centred', 'Winner-centred', 'Winner-centred', 'Winner/card-value centred'],
] as const;

const quickClues = [
  ['Jokers + annual card + Charleston', 'American / NMJL-style'],
  ['Riichi, yaku, han, fu, dora or furiten', 'Japanese Riichi'],
  ['Formal competition catalogue + 8-point minimum', 'Chinese Official / MCR'],
  ['Faan/fan + ordinary multiple-Chow play', 'Hong Kong Mahjong'],
  ['Flowers/Seasons score + one-Chow cap + losing hands matter', 'British / BMJA-style'],
] as const;

export function MahjongRulesComparedPage() {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1180px] px-5 py-9 lg:px-8 lg:py-14">
        <article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]">
          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
            <div className="mb-4 flex items-center gap-3">
              <div className="fine-rule w-10" />
              <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Mahjong rules compared</span>
            </div>
            <h1 className="max-w-[980px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">
              British vs Hong Kong vs Riichi vs Chinese Official vs American Mahjong
            </h1>
            <p className="mt-5 max-w-[820px] text-[15px] leading-7 text-[#596b65]">
              Same family of tiles. Five very different ways to play. This guide compares the structural differences that actually change what counts as a legal hand, how scoring works and what a player needs to know at the table.
            </p>
            <div className="mt-7 rounded-xl bg-[#284d45] p-5 text-[#f8f4e9] sm:p-6">
              <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#d7a287]">Useful mental model</div>
              <p className="mt-2 font-serif text-[26px] leading-snug">Mahjong is a family of related rulesets, not one universal rulebook with a few house rules.</p>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[760px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">Which Mahjong am I playing?</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">The quickest clues</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">You usually do not need a whole rulebook to identify the family. A few distinctive features narrow it down very quickly.</p>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-2">
              {quickClues.map(([clue, answer]) => (
                <div key={clue} className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5">
                  <div className="flex gap-3">
                    <Compass size={18} className="mt-1 shrink-0 text-[#477562]" />
                    <div>
                      <p className="text-[12px] font-semibold leading-6 text-[#284d45]">{clue}</p>
                      <p className="mt-1 font-serif text-[21px] text-[#ae6249]">{answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[760px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">At a glance</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">The big structural differences</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">This table deliberately compares the rules that change the experience of play, rather than trying to compress five complete rulebooks into one page.</p>
            </div>
            <div className="mt-7 overflow-x-auto rounded-xl border border-[#d8ceb8] bg-[#fdfbf5]">
              <table className="min-w-[1050px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#efe8da] text-[#284d45]">
                    {['Feature', 'British', 'Hong Kong', 'Riichi', 'MCR', 'American'].map((heading) => (
                      <th key={heading} className="border-b border-[#d8ceb8] px-4 py-3 font-serif text-[15px]">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row[0]} className="align-top even:bg-[#fbf8ed]">
                      {row.map((cell, index) => (
                        <td key={`${row[0]}-${index}`} className={`border-b border-[#e5dccb] px-4 py-3 text-[11px] leading-5 ${index === 0 ? 'font-semibold text-[#284d45]' : 'text-[#596b65]'}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11px] leading-5 text-[#7a7769]">
              Hong Kong conventions can vary by table, especially minimum faan, Flowers and payment tables. American play here means NMJL-style American Mah Jongg rather than every American local variant.
            </p>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[760px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">Five rulesets</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">What will actually feel different?</h2>
            </div>
            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              {variants.map((variant, index) => (
                <section key={variant.name} className={`rounded-xl border p-5 sm:p-6 ${index === 0 ? 'border-[#9fb8ad] bg-[#f2f6f3]' : 'border-[#d8ceb8] bg-[#fdfbf5]'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#ae6249]">{String(index + 1).padStart(2, '0')}</div>
                      <h3 className="mt-2 font-serif text-[26px] leading-tight text-[#284d45]">{variant.name}</h3>
                    </div>
                    {index === 0 ? <ShieldCheck size={20} className="text-[#477562]" /> : <Sparkles size={20} className="text-[#ae6249]" />}
                  </div>
                  <p className="mt-3 text-[12px] font-semibold leading-6 text-[#596b65]">Quick clue: {variant.clue}</p>
                  <ul className="mt-4 space-y-3">
                    {variant.points.map((point) => (
                      <li key={point} className="flex gap-3 text-[12px] leading-6 text-[#596b65]">
                        <CheckCircle2 size={15} className="mt-1 shrink-0 text-[#477562]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  {index === 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      <a href="/game" className="inline-flex items-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d]">Score a British game <ArrowRight size={14} /></a>
                      <a href="/guide" className="inline-flex items-center gap-2 rounded-md border border-[#b8c8c1] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#284d45]">British scoring guide <ArrowRight size={14} /></a>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#efe8da] text-[#477562]"><Flower2 size={18} /></div>
                <h2 className="mt-5 font-serif text-[30px] leading-tight text-[#284d45]">Same tiles, different assumptions</h2>
                <p className="mt-3 text-[13px] leading-6 text-[#596b65]">A tutorial or scorer can look familiar while still teaching the wrong game. The biggest traps are assuming that every complete four-sets-and-a-pair hand can win, that multiple Chows are always legal, that Flowers always work the same way, or that every Mahjong table scores only the winner.</p>
              </div>
              <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6">
                <div className="flex items-center gap-3"><CircleHelp size={18} className="text-[#ae6249]" /><h3 className="font-serif text-[22px] text-[#284d45]">Why this scorer is British-specific</h3></div>
                <p className="mt-3 text-[12px] leading-6 text-[#596b65]">The differences are too structural to hide behind a single “rules dropdown”. British settlement, losing-hand scoring, one-Chow ordinary hands, Flowers/Seasons and the named special-hand catalogue all shape the scoring engine itself.</p>
              </div>
            </div>
          </section>

          <section className="px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="rounded-xl border border-[#cfbfa4] bg-[#f5eadb] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6">
              <div className="max-w-[700px]">
                <div className="font-mono text-[9px] uppercase tracking-[.18em] text-[#ae6249]">Using British rules?</div>
                <h2 className="mt-2 font-serif text-[28px] text-[#284d45]">This site is built specifically for them.</h2>
                <p className="mt-2 text-[12px] leading-6 text-[#596b65]">Score one hand, run a complete four-player game, or learn the British scoring rules without translating from another Mahjong tradition.</p>
              </div>
              <a href="/hand" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-md bg-[#284d45] px-4 py-2.5 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] sm:mt-0">Score a hand <ArrowRight size={14} /></a>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
