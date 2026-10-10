import * as React from 'react';

type FooterLink = readonly [label: string, href: string];

type FooterGroup = {
  label: string;
  links: readonly FooterLink[];
};

export const footerGroups: readonly FooterGroup[] = [
  {
    label: 'Play',
    links: [
      ['Track a game', '/game'],
      ['Score a hand', '/hand'],
    ],
  },
  {
    label: 'Learn',
    links: [
      ['Rules', '/rules'],
      ['How it works', '/how-it-works'],
      ['User Guide', '/help'],
      ['Scoring examples', '/scoring-examples'],
    ],
  },
  {
    label: 'Project',
    links: [
      ['About', '/about'],
      ['Privacy & analytics', '/privacy'],
    ],
  },
] as const;

export const compactFooterLinks: readonly FooterLink[] = [
  ['User Guide', '/help'],
  ['About', '/about'],
  ['Privacy', '/privacy'],
] as const;

const isExternal = (href: string) => href.startsWith('http://') || href.startsWith('https://');

function FooterAnchor({ label, href }: { label: string; href: string }) {
  const external = isExternal(href);
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="inline-flex min-h-11 items-center rounded-md py-2 text-[14px] font-semibold text-[#596b65] underline decoration-[#cdbfa7] underline-offset-4 transition hover:text-[#284d45] hover:decoration-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2"
    >
      {label}
    </a>
  );
}

function TileArtworkCredit() {
  return (
    <p className="border-t border-[#ddd3bf] pt-4 text-[11px] leading-5 text-[#7a7769]">
      Mahjong tile artwork from xhokir/riichi-mahjong-tiles, based on FluffyStuff/riichi-mahjong-tiles, used under CC BY 4.0.
    </p>
  );
}

function FooterBaseline() {
  return (
    <div className="border-t border-[#ddd3bf] pt-5">
      <p className="font-serif text-[18px] font-semibold text-[#284d45]">Mahjong Reference</p>
      <div className="mt-1 flex items-center justify-between gap-4">
        <p className="text-[13px] leading-5 text-[#7a7769]">© 2026 SMooks</p>
        <a
          href="https://buymeacoffee.com/sharronmo"
          target="_blank"
          rel="noreferrer"
          className="text-right text-[13px] font-semibold leading-5 text-[#596b65] underline decoration-[#cdbfa7] underline-offset-4 transition hover:text-[#284d45] hover:decoration-[#ae6249] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2"
        >
          Support the project
        </a>
      </div>
    </div>
  );
}

export function SiteFooter({ variant = 'full', showTileCredit = false }: { variant?: 'full' | 'compact'; showTileCredit?: boolean }) {
  if (variant === 'compact') {
    return (
      <footer className="border-t border-[#d8ceb8] bg-[#f5f1e6] print:hidden">
        <div className="mx-auto max-w-[1100px] px-5 py-5 lg:px-8">
          <details>
            <summary className="cursor-pointer list-none text-[13px] font-semibold text-[#596b65] underline decoration-[#cdbfa7] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
              Site links
            </summary>
            <nav aria-label="Footer navigation" className="mt-4 grid gap-5 border-t border-[#ddd3bf] pt-4 sm:grid-cols-3">
              {footerGroups.map((group) => (
                <section key={group.label} aria-labelledby={`compact-footer-${group.label.toLowerCase()}`}>
                  <h2 id={`compact-footer-${group.label.toLowerCase()}`} className="font-mono text-[10px] uppercase tracking-[.15em] text-[#ae6249]">
                    {group.label}
                  </h2>
                  <div className="mt-1 flex flex-col items-start">
                    {group.links.map(([label, href]) => <FooterAnchor key={href} label={label} href={href} />)}
                  </div>
                </section>
              ))}
            </nav>
          </details>
          {showTileCredit && <div className="mt-5"><TileArtworkCredit /></div>}
          <div className="mt-5"><FooterBaseline /></div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-[#d8ceb8] bg-[#f5f1e6] print:hidden">
      <div className="mx-auto max-w-[1100px] px-5 py-8 lg:px-8 lg:py-10">
        <nav aria-label="Footer navigation" className="grid gap-7 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <section key={group.label} aria-labelledby={`footer-${group.label.toLowerCase()}`}>
              <h2 id={`footer-${group.label.toLowerCase()}`} className="font-mono text-[11px] uppercase tracking-[.16em] text-[#ae6249]">
                {group.label}
              </h2>
              <div className="mt-2 flex flex-col items-start">
                {group.links.map(([label, href]) => <FooterAnchor key={href} label={label} href={href} />)}
              </div>
            </section>
          ))}
        </nav>

        {showTileCredit && <div className="mt-7"><TileArtworkCredit /></div>}
        <div className="mt-7"><FooterBaseline /></div>
      </div>
    </footer>
  );
}
