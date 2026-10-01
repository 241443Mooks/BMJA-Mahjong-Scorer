import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  CheckCheck,
  CircleHelp,
  FileCheck2,
  GitBranch,
  Layers3,
  Scale,
  SearchCheck,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { ReturnToGame } from '../components/ReturnToGame';

const repository = 'https://github.com/241443Mooks/BMJA-Mahjong-Scorer/blob/main/';

const evidence = {
  stress: `${repository}docs/rules/EIGHT_RULESET_ARCHITECTURE_STRESS_TEST.md`,
  manifests: `${repository}docs/rules/EIGHT_RULESET_PAPER_MANIFESTS.md`,
  comparator: `${repository}docs/rules/CLASSICAL_COMPARATOR_AUDIT_V1.md`,
  coverage: `${repository}docs/rules/ISSUE_440A_COVERAGE_AUDIT.md`,
  provenance: `${repository}docs/rules/BUZZARD_2000_RULE_EVIDENCE.md`,
  knowledge: `${repository}docs/product/REFERENCE_KNOWLEDGE_ARCHITECTURE.md`,
  quality: `${repository}package.json`,
};

const stages = [
  { title: 'Identify the rules', text: 'Choose a named profile and version. Every result belongs to that rules context.', icon: BookOpen },
  { title: 'Translate the source', text: 'Source statements are reviewed into explicit requirements. Code alone does not prove a rule.', icon: FileCheck2 },
  { title: 'Keep provenance attached', text: 'Profile identity, version and evidence status travel with the saved game.', icon: GitBranch },
  { title: 'Record table evidence', text: 'Enter the hand and relevant table facts. Missing facts remain unknown.', icon: SearchCheck },
  { title: 'Score the hand', text: 'The selected scoring grammar evaluates only the accepted evidence.', icon: Boxes },
  { title: 'Settle separately', text: 'Payments are a profile-owned step that consumes the hand result.', icon: Scale },
  { title: 'Progress separately', text: 'Dealer, wind, round and game-end policy are resolved outside hand scoring.', icon: Layers3 },
  { title: 'Keep one record', text: 'The hand, settlement and progression form one saved game history.', icon: CheckCheck },
];

const families = [
  'European Classical',
  'Hong Kong',
  'Chinese Official (MCR)',
  'Taiwanese',
  'Riichi',
  'Sanma',
  'Zung Jung',
  'American',
];

const checks = [
  { title: 'Source review', text: 'Rule claims are tied to identified sources and precise locations. The evidence ledger also records when a source is provisional or unresolved.', href: evidence.provenance, label: 'View a source evidence ledger' },
  { title: 'Behaviour checks', text: 'Focused fixtures exercise concrete profile behaviour and edge cases. Passing tests show what the current code does; they do not establish what a source says.', href: evidence.coverage, label: 'View a coverage audit' },
  { title: 'Architecture checks', text: 'Paper manifests and stress tests ask whether materially different rule families can be represented without forcing them into one scoring model.', href: evidence.manifests, label: 'View the paper manifests' },
  { title: 'Comparator review', text: 'Comparisons distinguish source-established rules from runtime similarity, provisional reuse and unknowns.', href: evidence.comparator, label: 'View the comparator audit' },
  { title: 'Release gates', text: 'The repository defines automated test, TypeScript typecheck and production build commands.', href: evidence.quality, label: 'View the quality gates' },
];

function EvidenceLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 text-[11px] font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
      {children}<ArrowUpRight size={13} aria-hidden="true" />
    </a>
  );
}

export function UnderTheHoodPage() {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8 lg:py-14">
        <ReturnToGame />
        <article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]">
          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
            <div className="mb-4 flex items-center gap-3">
              <div className="fine-rule w-10" />
              <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Under the hood</span>
            </div>
            <h1 className="max-w-[860px] font-serif text-[clamp(38px,6vw,62px)] leading-[.98] text-[#284d45]">Built so you can check the answer.</h1>
            <p className="mt-5 max-w-[740px] text-[16px] leading-7 text-[#596b65]">You should not have to trust a score just because software produced it. Follow the rules context, evidence and decisions behind a result.</p>
            <ul aria-label="How the work is checked" className="mt-7 flex flex-wrap gap-2">
              {['Source-linked', 'Versioned', 'Tested', 'Type-checked', 'Build-verified', 'Explicit about uncertainty'].map((item) => (
                <li key={item} className="rounded-full border border-[#d8ceb8] bg-[#fdfbf5] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.08em] text-[#477562]">{item}</li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/rules" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#284d45] px-4 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#23443d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">Explore supported rules <ArrowUpRight size={14} aria-hidden="true" /></a>
              <a href="/how-it-works" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">See the product walkthrough <ArrowUpRight size={14} aria-hidden="true" /></a>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[780px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">The assurance chain</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">Rules → evidence → score → settlement → progression → record.</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">Trust depends on the whole chain. Each step has a defined job, and an unknown fact does not become a convenient assumption.</p>
            </div>
            <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stages.map(({ title, text, icon: Icon }, index) => (
                <li key={title} className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4 sm:p-5">
                  <div className="flex items-center gap-3"><span className="font-mono text-[9px] tracking-[.12em] text-[#ae6249]">0{index + 1}</span><Icon size={17} className="text-[#477562]" aria-hidden="true" /></div>
                  <h3 className="mt-3 font-serif text-[19px] leading-tight text-[#284d45]">{title}</h3>
                  <p className="mt-2 text-[11px] leading-5 text-[#66746e]">{text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-5 font-serif text-[23px] text-[#ae6249]">Unknown means unknown.</p>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-7 lg:grid-cols-[.85fr_1.15fr] lg:gap-10">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">Architecture under pressure</div>
                <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">Reuse what is common. Keep differences explicit.</h2>
                <p className="mt-3 text-[13px] leading-6 text-[#596b65]">Eight published ruleset families were used as an external architecture stress test. They point to several scoring grammars, not one universal rule switchboard.</p>
                <EvidenceLink href={evidence.stress}>Read the stress test and its limits</EvidenceLink>
                <p className="mt-4 rounded-lg border border-[#d8ceb8] bg-[#fdfbf5] p-4 text-[11px] leading-5 text-[#66746e]">This is pre-implementation architecture validation. It is not a claim that all eight families are implemented, source-certified or fully playable here. Production profiles still need their own appropriate source evidence.</p>
              </div>
              <div>
                <ul aria-label="Families in the architecture stress test" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  {families.map((family) => <li key={family} className="rounded-lg border border-[#d8ceb8] bg-[#fdfbf5] px-3 py-3 text-center text-[11px] font-medium text-[#284d45]">{family}</li>)}
                </ul>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {[
                    ['Classical points × doubles', 'Classical and Western family'],
                    ['Pattern accumulator', 'Hong Kong, MCR, Taiwanese and Zung Jung'],
                    ['Riichi han + fu', 'Riichi and Sanma'],
                    ['Versioned target catalogue', 'American / NMJL-style cards'],
                  ].map(([grammar, examples]) => <div key={grammar} className="rounded-lg bg-[#efe8da] p-3"><h3 className="font-mono text-[10px] font-semibold text-[#284d45]">{grammar}</h3><p className="mt-1 text-[10px] leading-4 text-[#66746e]">{examples}</p></div>)}
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="max-w-[780px]">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">Evidence and verification</div>
              <h2 className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">Show why something is known.</h2>
              <p className="mt-3 text-[13px] leading-6 text-[#596b65]">Different checks answer different questions. A passing build cannot verify a rulebook interpretation; a cited source does not show that the current code behaves as intended.</p>
            </div>
            <ol className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {checks.map(({ title, text, href, label }, index) => (
                <li key={title} className="flex flex-col rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5">
                  <span className="font-mono text-[9px] uppercase tracking-[.14em] text-[#ae6249]">0{index + 1}</span>
                  <h3 className="mt-2 font-serif text-[21px] text-[#284d45]">{title}</h3>
                  <p className="mt-2 flex-1 text-[11px] leading-5 text-[#66746e]">{text}</p>
                  <div className="mt-3"><EvidenceLink href={href}>{label}</EvidenceLink></div>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6">
                <h2 className="font-serif text-[27px] leading-tight text-[#284d45]">Three layers, with different authority</h2>
                <dl className="mt-4 space-y-4 text-[11px] leading-5 text-[#66746e]">
                  <div><dt className="font-semibold text-[#284d45]">Executable rules truth</dt><dd>What an exact profile and version currently instruct the scorer to do.</dd></div>
                  <div><dt className="font-semibold text-[#284d45]">Evidence-backed facts</dt><dd>What identified sources and reviewed records support, including limits and unresolved questions.</dd></div>
                  <div><dt className="font-semibold text-[#284d45]">Editorial explanation</dt><dd>Human-readable teaching that explains the facts but does not become a second rules database.</dd></div>
                </dl>
                <div className="mt-4"><EvidenceLink href={evidence.knowledge}>Read the reference architecture</EvidenceLink></div>
              </div>
              <div className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-5 sm:p-6">
                <CircleHelp size={19} className="text-[#477562]" aria-hidden="true" />
                <h2 className="mt-3 font-serif text-[27px] leading-tight text-[#284d45]">What this does not claim</h2>
                <ul className="mt-3 space-y-2 text-[11px] leading-5 text-[#66746e]">
                  <li>• No external certification or guarantee of perfect accuracy.</li>
                  <li>• Architecture coverage does not mean every family or variant is implemented.</li>
                  <li>• Matching runtime behaviour does not prove two sources say the same thing.</li>
                  <li>• Unknown or unresolved evidence stays visible as such.</li>
                </ul>
                <p className="mt-4 font-serif text-[20px] text-[#ae6249]">A rule does not become true merely because it appears in the code.</p>
              </div>
            </div>
          </section>

          <section className="px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
            <div className="rounded-xl bg-[#284d45] p-5 text-[#f8f4e9] sm:p-7">
              <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#d7a287]">Not “trust us”. Check us.</div>
              <h2 className="mt-2 max-w-[760px] font-serif text-[32px] leading-tight">One recorded state. One story.</h2>
              <p className="mt-3 max-w-[800px] text-[13px] leading-6 text-[#c8d5d0]">The reference layer is designed to be a view over structured, reviewed facts. Scores, settlements and game progress each keep their own rules while remaining connected in the saved record.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/help" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#f3e8d4] px-4 text-[11px] font-semibold text-[#284d45] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a287]">Open User Guide <ArrowUpRight size={14} aria-hidden="true" /></a>
                <a href="/features" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#55756c] px-4 text-[11px] font-semibold text-[#f8f4e9] transition hover:bg-[#355950] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a287]">See product features <ArrowUpRight size={14} aria-hidden="true" /></a>
              </div>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
