import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';

type Destination = readonly [label: string, href: string];
type NavigationGroup = { label: 'Learn' | 'Rules'; destinations: readonly Destination[] };

export const navigationGroups: readonly NavigationGroup[] = [
  {
    label: 'Learn',
    destinations: [
      ['British gameplay basics', '/gameplay-basics'],
      ['British scoring guide', '/guide'],
      ['Special Hands', '/special-hands'],
      ['Scoring examples', '/scoring-examples'],
    ],
  },
  {
    label: 'Rules',
    destinations: [
      ['Choose your rules', '/rules'],
      ['Compare Mahjong rules', '/mahjong-rules-compared'],
    ],
  },
];

export const directDestinations: readonly Destination[] = [
  ['Score a hand', '/hand'],
  ['Track a game', '/game'],
  ['Help', '/help'],
];

type SiteHeaderProps = {
  onNavigate?: (href: string) => boolean | void;
};

const linkClass = 'flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]';
const triggerClass = 'flex min-h-11 items-center gap-1 rounded-md px-3 text-[15px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]';

export function SiteHeader({ onNavigate }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const menuId = useId();
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const groupTriggerRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const activeElement = document.activeElement;

      if (openGroup) {
        const trigger = groupTriggerRefs.current.get(openGroup);
        const wrapper = trigger?.parentElement;
        const restoreGroupFocus = !!activeElement && !!wrapper?.contains(activeElement) && activeElement !== trigger;
        setOpenGroup(null);
        if (restoreGroupFocus) window.requestAnimationFrame(() => trigger?.focus());
        event.stopPropagation();
        return;
      }

      if (mobileOpen) {
        const menu = document.getElementById(menuId);
        const restoreMobileFocus = !!activeElement && !!menu?.contains(activeElement);
        setMobileOpen(false);
        if (restoreMobileFocus) window.requestAnimationFrame(() => mobileTriggerRef.current?.focus());
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuId, mobileOpen, openGroup]);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate?.(href) === false) {
      event.preventDefault();
      return;
    }
    setMobileOpen(false);
    setOpenGroup(null);
  };

  const renderDirectLinks = () => directDestinations.map(([label, href]) => (
    <a key={href} href={href} onClick={(event) => navigate(event, href)} className={linkClass}>{label}</a>
  ));

  const renderGroup = (group: NavigationGroup, placement: 'desktop' | 'mobile') => {
    const key = `${placement}:${group.label}`;
    const panelId = `${menuId}-${key}`;
    const expanded = openGroup === key;
    return (
      <div key={key} className={placement === 'desktop' ? 'relative' : 'border-t border-[#e2d9c7] pt-2'}>
        <button
          ref={(element) => { if (element) groupTriggerRefs.current.set(key, element); else groupTriggerRefs.current.delete(key); }}
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setOpenGroup((current) => current === key ? null : key)}
          className={placement === 'desktop' ? triggerClass : `${triggerClass} w-full justify-between`}
        >
          {group.label} <ChevronDown size={15} aria-hidden="true" />
        </button>
        <div id={panelId} hidden={!expanded} className={placement === 'desktop'
            ? 'absolute left-0 top-[calc(100%+0.4rem)] min-w-56 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-2 shadow-lg'
            : 'mt-1 pl-2'}>
          {group.destinations.map(([label, href]) => (
            <a key={href} href={href} onClick={(event) => navigate(event, href)} className={linkClass}>{label}</a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <header className="relative z-20 border-b border-[#d8ceb8] bg-[#f5f1e6]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <a href="/" onClick={(event) => navigate(event, '/')} className="flex min-h-11 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#284d45] font-serif text-[22px] font-bold text-[#f5f1e6]">麻</span>
          <span className="font-serif text-[20px] font-bold leading-none text-[#284d45]">Mahjong Reference</span>
        </a>
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
          {renderDirectLinks().slice(0, 2)}
          {navigationGroups.map((group) => renderGroup(group, 'desktop'))}
          {renderDirectLinks().slice(2)}
        </nav>
        <div className="relative md:hidden">
          <button ref={mobileTriggerRef} type="button" aria-label={mobileOpen ? 'Close site navigation' : 'Open site navigation'} aria-expanded={mobileOpen} aria-controls={menuId} onClick={() => {
            if (mobileOpen) setOpenGroup(null);
            setMobileOpen((current) => !current);
          }} className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[#cfc3aa] bg-[#fbf8ed] text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
          {mobileOpen && (
            <nav id={menuId} aria-label="Site navigation" className="absolute right-0 top-[calc(100%+0.5rem)] w-[min(20rem,calc(100vw-2.5rem))] rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-2 shadow-lg">
              {renderDirectLinks().slice(0, 2)}
              {navigationGroups.map((group) => renderGroup(group, 'mobile'))}
              <div className="border-t border-[#e2d9c7] pt-2">{renderDirectLinks().slice(2)}</div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
