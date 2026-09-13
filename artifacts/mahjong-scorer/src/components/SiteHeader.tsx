import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useId, useState, type MouseEvent } from 'react';

export const navigationGroups = [
  {
    label: 'Play',
    destinations: [
      ['Track a game', '/game'],
      ['Score a hand', '/hand'],
    ],
  },
  {
    label: 'Rules',
    destinations: [
      ['Compare Mahjong rules', '/mahjong-rules-compared'],
    ],
  },
  {
    label: 'Learn',
    destinations: [
      ['Gameplay basics', '/gameplay-basics'],
      ['British scoring guide', '/guide#ordinary-scoring'],
      ['Special hands', '/special-hands'],
      ['Scoring examples', '/scoring-examples'],
    ],
  },
] as const;

const secondaryDestinations = [
  ['Help', '/help'],
  ['How it works', '/how-it-works'],
  ['About', '/about'],
] as const;

type SiteHeaderProps = {
  onNavigate?: (href: string) => boolean | void;
};

export function SiteHeader({ onNavigate }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const menuId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setOpenGroup(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate?.(href) === false) {
      event.preventDefault();
      return;
    }
    setOpen(false);
    setOpenGroup(null);
  };

  return (
    <header className="relative z-20 border-b border-[#d8ceb8] bg-[#f5f1e6]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <a href="/" onClick={(event) => navigate(event, '/')} className="flex min-h-11 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#284d45] font-serif text-[22px] font-bold text-[#f5f1e6]">麻</span>
          <span className="font-serif text-[20px] font-bold leading-none text-[#284d45]">Mahjong Reference</span>
        </a>
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 sm:flex">
          {navigationGroups.map((group) => (
            <div key={group.label} className="relative">
              <button type="button" aria-expanded={openGroup === group.label} onClick={() => setOpenGroup((current) => current === group.label ? null : group.label)} className="flex min-h-11 items-center gap-1 rounded-md px-3 text-[15px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                {group.label} <ChevronDown size={15} aria-hidden="true" />
              </button>
              {openGroup === group.label && (
                <div className="absolute left-0 top-[calc(100%+0.4rem)] min-w-56 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-2 shadow-lg">
                  {group.destinations.map(([label, href]) => (
                    <a key={href} href={href} onClick={(event) => navigate(event, href)} className="flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{label}</a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="relative">
            <button type="button" aria-expanded={openGroup === 'More'} onClick={() => setOpenGroup((current) => current === 'More' ? null : 'More')} className="flex min-h-11 items-center gap-1 rounded-md px-3 text-[14px] font-semibold text-[#66746e] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
              More <ChevronDown size={15} aria-hidden="true" />
            </button>
            {openGroup === 'More' && (
              <div className="absolute right-0 top-[calc(100%+0.4rem)] min-w-48 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-2 shadow-lg">
                {secondaryDestinations.map(([label, href]) => (
                  <a key={href} href={href} onClick={(event) => navigate(event, href)} className="flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{label}</a>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="relative sm:hidden">
          <button type="button" aria-label={open ? 'Close site navigation' : 'Open site navigation'} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((current) => !current)} className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[#cfc3aa] bg-[#fbf8ed] text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]" >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
          {open && (
            <nav id={menuId} aria-label="Site navigation" className="absolute right-0 top-[calc(100%+0.5rem)] w-[min(20rem,calc(100vw-2.5rem))] rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-2 shadow-lg">
              <a href="/" onClick={(event) => navigate(event, '/')} className="flex min-h-11 items-center rounded-lg px-3 text-[14px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                Home
              </a>
              {navigationGroups.map((group, index) => (
                <div key={group.label} className={index === 0 ? 'border-t border-[#e2d9c7] pt-2' : 'mt-1 border-t border-[#e2d9c7] pt-2'}>
                  <div className="px-3 pb-1 pt-1 font-mono text-[12px] uppercase tracking-[.14em] text-[#ae6249]">{group.label}</div>
                  {group.destinations.map(([label, href]) => (
                    <a key={href} href={href} onClick={(event) => navigate(event, href)} className="flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                      {label}
                    </a>
                  ))}
                </div>
              ))}
              <div className="mt-1 border-t border-[#e2d9c7] pt-2">
                <div className="px-3 pb-1 pt-1 font-mono text-[12px] uppercase tracking-[.14em] text-[#ae6249]">More</div>
                {secondaryDestinations.map(([label, href]) => (
                  <a key={href} href={href} onClick={(event) => navigate(event, href)} className="flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{label}</a>
                ))}
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
