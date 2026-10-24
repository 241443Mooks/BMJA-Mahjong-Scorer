import { MAHJONG_FAMILIES } from './mahjong-family-presentation';
import { ExactProfileComparator } from './ExactProfileComparator';
import { SiteHeader } from '../components/SiteHeader';

export function MahjongRulesComparedPage() {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1180px] px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        <article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]">
          <header className="border-b border-[#ddd3bf] px-5 py-7 sm:px-8 lg:px-12 lg:py-9">
            <div className="mb-3 flex items-center gap-3">
              <div className="fine-rule w-10" />
              <span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Mahjong rules</span>
            </div>
            <h1 className="font-serif text-[clamp(34px,5vw,48px)] leading-tight text-[#284d45]">Compare Mahjong rules</h1>
            <p className="mt-3 max-w-[740px] text-sm leading-6 text-[#596b65]">Choose two supported rulesets to see how they differ at the table.</p>
            <p className="mt-5 max-w-[800px] rounded-lg bg-[#284d45] px-4 py-3 font-serif text-lg leading-7 text-[#f8f4e9] sm:px-5">Mahjong is a family of related rulesets, not one universal rulebook with a few house rules.</p>
          </header>

          <ExactProfileComparator />

          <section className="px-5 py-7 sm:px-8 lg:px-12" aria-labelledby="other-traditions-title">
            <details className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4 sm:p-5">
              <summary className="min-h-11 cursor-pointer font-serif text-xl text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]" id="other-traditions-title">Explore other Mahjong traditions</summary>
              <p className="mt-2 max-w-[760px] text-sm leading-6 text-[#596b65]">These wider traditions provide context. Only the exact profiles above have selectable comparisons here; a family name does not mean this site has a scorer for it.</p>
              <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm leading-6 text-[#405650] sm:grid-cols-2">
                {MAHJONG_FAMILIES.map((family) => <li key={family.id}>{family.name}</li>)}
              </ul>
              <a className="mt-4 inline-flex min-h-11 items-center font-semibold text-[#284d45] underline decoration-[#ae6249] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]" href="/rules">Explore supported rules profiles</a>
            </details>
          </section>
        </article>
      </main>
    </div>
  );
}
