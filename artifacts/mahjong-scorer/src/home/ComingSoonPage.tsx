import { SiteHeader } from '../components/SiteHeader';

export function ComingSoonPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-[760px] px-5 py-16 lg:px-8 lg:py-24">
        <div className="rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] p-7 shadow-[var(--shadow-sm)] sm:p-10">
          <h1 className="font-serif text-[clamp(34px,6vw,52px)] leading-tight text-[#284d45]">{title}</h1>
          <p className="mt-4 max-w-[600px] text-[14px] leading-7 text-[#66746e]">{description}</p>
          <p className="mt-6 text-[11px] leading-5 text-[#8c8a7f]">
            This route is in place now so the homepage structure can be tested before the full page is written.
          </p>
        </div>
      </main>
    </div>
  );
}
