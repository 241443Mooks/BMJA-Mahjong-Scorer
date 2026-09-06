import { ArrowLeft, BookOpen, Info } from 'lucide-react';

export function ComingSoonPage({
  title,
  description,
  kind,
}: {
  title: string;
  description: string;
  kind: 'guide' | 'about';
}) {
  const Icon = kind === 'guide' ? BookOpen : Info;

  return (
    <div className="mahjong-shell min-h-screen">
      <header className="border-b border-[#d8ceb8] bg-[#f5f1e6]/95">
        <div className="mx-auto flex max-w-[900px] items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#284d45] text-[#f5f1e6]">
              <Icon size={19} />
            </div>
            <div className="font-serif text-[20px] font-bold text-[#284d45]">{title}</div>
          </div>
          <a
            href="/"
            className="flex items-center gap-2 rounded-md border border-[#cfc3aa] bg-[#fbf8ed] px-3 py-2 text-[11px] font-semibold text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
          >
            <ArrowLeft size={14} /> Home
          </a>
        </div>
      </header>

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
