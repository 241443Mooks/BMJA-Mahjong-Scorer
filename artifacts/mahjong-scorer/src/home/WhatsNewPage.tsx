import { SiteHeader } from '../components/SiteHeader';
import { publicUpdates, type PublicUpdate } from './whatsNewEntries';

const monthLabel = (date: string) => {
  const [year, month] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, 1)));
};

function groupByMonth(updates: readonly PublicUpdate[]) {
  const groups = new Map<string, PublicUpdate[]>();
  for (const update of updates) groups.set(update.date, [...(groups.get(update.date) ?? []), update]);
  return [...groups.entries()].sort(([left], [right]) => right.localeCompare(left));
}

export function WhatsNewPage({ updates = publicUpdates }: { updates?: readonly PublicUpdate[] }) {
  const groups = groupByMonth(updates);

  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-5 py-8 sm:py-12 lg:px-8 lg:py-16">
        <article className="mx-auto max-w-[860px]">
          <header className="max-w-[680px] pb-10 sm:pb-14">
            <h1 className="font-serif text-[clamp(39px,7vw,66px)] leading-[1.04] text-[#284d45]">What’s new</h1>
            <p className="mt-5 text-[16px] leading-7 text-[#596b65] sm:text-[17px] sm:leading-8">
              A few of the things that have changed as Mahjong Reference has grown.
            </p>
          </header>

          {groups.length === 0 ? (
            <p className="max-w-[680px] border-t border-[#ddd3bf] py-6 text-[16px] leading-7 text-[#596b65]">
              There are no updates to share just yet.
            </p>
          ) : (
            <div className="max-w-[760px]">
              {groups.map(([date, entries]) => (
                <section key={date} aria-labelledby={`updates-${date}`} className="pb-10 sm:pb-12">
                  <h2 id={`updates-${date}`} className="border-b border-[#d8ceb8] pb-3 font-serif text-[25px] text-[#284d45] sm:text-[28px]">
                    {monthLabel(date)}
                  </h2>
                  <ol className="m-0 list-none p-0">
                    {entries.map((entry) => (
                      <li key={`${entry.date}-${entry.title}`} className="border-b border-[#e4dccb] py-5 sm:py-6">
                        <p className="font-mono text-[11px] font-semibold uppercase tracking-[.13em] text-[#8b624f]">{entry.category}</p>
                        <h3 className="mt-2 font-serif text-[22px] leading-snug text-[#284d45] sm:text-[24px]">{entry.title}</h3>
                        <p className="mt-2 text-[15px] leading-7 text-[#596b65] sm:text-[16px]">{entry.summary}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
