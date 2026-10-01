import { ArrowLeft, BookOpenCheck } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
import { ReturnToGame } from '../components/ReturnToGame';
import type { PublicEvidenceDocument } from './public-evidence';
import { renderEvidenceMarkdown } from './render-markdown';

export function EvidenceDocumentPage({ document }: { document: PublicEvidenceDocument }) {
  const html = renderEvidenceMarkdown(document.markdown, document);

  return (
    <div className="mahjong-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-5 py-9 lg:px-8 lg:py-14">
        <ReturnToGame />
        <article className="overflow-hidden rounded-2xl border border-[#d8ceb8] bg-[#fbf8ed] shadow-[var(--shadow-sm)]">
          <header className="border-b border-[#ddd3bf] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
            <a href="/under-the-hood" className="inline-flex min-h-9 items-center gap-2 text-[11px] font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 hover:text-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
              <ArrowLeft size={14} aria-hidden="true" /> Under the Hood
            </a>
            <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[.13em] text-[#477562]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#efe8da] px-3 py-1.5"><BookOpenCheck size={12} aria-hidden="true" /> Evidence &amp; methods</span>
              <span className="rounded-full border border-[#d8ceb8] px-3 py-1.5">{document.category}</span>
            </div>
            <h1 className="mt-5 max-w-[850px] font-serif text-[clamp(34px,5vw,52px)] leading-[1.04] text-[#284d45]">{document.title}</h1>
            <p className="mt-4 max-w-[760px] text-[14px] leading-6 text-[#596b65]">{document.description}</p>
            <dl className="mt-6 grid gap-3 text-[11px] sm:grid-cols-2">
              <div className="rounded-lg border border-[#d8ceb8] bg-[#fdfbf5] p-3">
                <dt className="font-mono text-[9px] uppercase tracking-[.13em] text-[#ae6249]">Document status</dt>
                <dd className="mt-1 font-medium leading-5 text-[#284d45]">{document.status}</dd>
              </div>
              <div className="rounded-lg border border-[#d8ceb8] bg-[#fdfbf5] p-3">
                <dt className="font-mono text-[9px] uppercase tracking-[.13em] text-[#ae6249]">Document date</dt>
                <dd className="mt-1 font-medium leading-5 text-[#284d45]"><time dateTime={document.date}>{document.date}</time></dd>
              </div>
            </dl>
            <p className="mt-4 text-[10px] leading-5 text-[#66746e]">Rendered from the repository’s selected Markdown source. The source document remains canonical.</p>
          </header>
          <div className="overflow-x-auto px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
            <div className="prose prose-sm max-w-none break-words prose-headings:font-serif prose-headings:text-[#284d45] prose-p:text-[#596b65] prose-p:leading-7 prose-a:text-[#284d45] prose-a:decoration-[#cfa58f] prose-a:underline-offset-4 prose-blockquote:border-[#ae6249] prose-blockquote:text-[#596b65] prose-code:rounded prose-code:bg-[#efe8da] prose-code:px-1 prose-code:py-0.5 prose-code:text-[#284d45] prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-[#203f39] prose-pre:text-[#f8f4e9] prose-table:w-full prose-th:bg-[#efe8da] prose-th:text-[#284d45] prose-td:text-[#596b65]" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          <footer className="border-t border-[#ddd3bf] px-5 py-6 sm:px-8 lg:px-12">
            <a href="/under-the-hood" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-4 text-[11px] font-semibold text-[#284d45] hover:bg-[#fffaf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
              <ArrowLeft size={14} aria-hidden="true" /> Return to Under the Hood
            </a>
          </footer>
        </article>
      </main>
    </div>
  );
}
