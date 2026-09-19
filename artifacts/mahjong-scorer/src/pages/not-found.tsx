import { ArrowRight, Home } from 'lucide-react';
import { SiteHeader } from '@/components/SiteHeader';

export const notFoundEyebrow = '404 · Page not found';
export const notFoundHeading = "We couldn't find that page.";
export const notFoundDescription =
  'The link may be old, mistyped or no longer available. You can head home or continue with one of the main Mahjong Reference tools.';

export const notFoundRecoveryLinks = [
  ['Home', '/'],
  ['Score a hand', '/hand'],
  ['Track a game', '/game'],
  ['Browse rules', '/rules'],
] as const;

export default function NotFound() {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />

      <main className="mx-auto flex max-w-[1100px] items-center px-5 py-12 sm:py-16 lg:px-8 lg:py-20">
        <section className="w-full max-w-[760px] rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] p-6 shadow-[var(--shadow-sm)] sm:p-9">
          <p className="font-mono text-[12px] uppercase tracking-[.14em] text-[#ae6249]">{notFoundEyebrow}</p>
          <h1 className="mt-3 font-serif text-[clamp(34px,6vw,52px)] leading-[1.05] text-[#284d45]">
            {notFoundHeading}
          </h1>
          <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-[#66746e]">
            {notFoundDescription}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2" aria-label="Page recovery options">
            {notFoundRecoveryLinks.map(([label, href], index) => (
              <a
                key={href}
                href={href}
                className={`group flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-[15px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2 ${
                  index === 0
                    ? 'border-[#284d45] bg-[#284d45] text-[#f8f4e9] hover:bg-[#23443d]'
                    : 'border-[#d8ceb8] bg-[#fffaf0] text-[#284d45] hover:border-[#ae6249]'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {index === 0 && <Home size={17} aria-hidden="true" />}
                  {label}
                </span>
                <ArrowRight size={16} aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
