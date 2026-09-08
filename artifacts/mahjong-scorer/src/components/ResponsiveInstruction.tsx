import { useEffect, useState } from 'react';

type DeviceView = 'mobile' | 'tablet' | 'desktop';

type ScreenshotSet = Record<DeviceView, string>;

export type ResponsiveInstructionProps = {
  steps: string[];
  images: ScreenshotSet;
  alt: string;
  tip?: string;
};

const SESSION_KEY = 'bmja-mahjong-scorer/help-screenshot-view';
const VIEW_EVENT = 'bmja-help-screenshot-view';
const views: DeviceView[] = ['mobile', 'tablet', 'desktop'];

function isDeviceView(value: string | null): value is DeviceView {
  return value === 'mobile' || value === 'tablet' || value === 'desktop';
}

function viewportView(): DeviceView {
  if (typeof window === 'undefined') return 'mobile';
  if (window.matchMedia('(min-width: 1024px)').matches) return 'desktop';
  if (window.matchMedia('(min-width: 640px)').matches) return 'tablet';
  return 'mobile';
}

function storedOverride(): DeviceView | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY);
    return isDeviceView(value) ? value : null;
  } catch {
    return null;
  }
}

export function ResponsiveInstruction({
  steps,
  images,
  alt,
  tip,
}: ResponsiveInstructionProps) {
  const [override, setOverride] = useState<DeviceView | null>(() => storedOverride());
  const [automaticView, setAutomaticView] = useState<DeviceView>(() => viewportView());
  const activeView = override ?? automaticView;

  useEffect(() => {
    const updateForViewport = () => setAutomaticView(viewportView());
    const updateForOverride = (event: Event) => {
      const detail = (event as CustomEvent<DeviceView>).detail;
      if (isDeviceView(detail)) setOverride(detail);
    };

    window.addEventListener('resize', updateForViewport);
    window.addEventListener(VIEW_EVENT, updateForOverride);
    return () => {
      window.removeEventListener('resize', updateForViewport);
      window.removeEventListener(VIEW_EVENT, updateForOverride);
    };
  }, []);

  const chooseView = (view: DeviceView) => {
    setOverride(view);
    try {
      window.sessionStorage.setItem(SESSION_KEY, view);
    } catch {
      // The selector remains useful even when session storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent<DeviceView>(VIEW_EVENT, { detail: view }));
  };

  return (
    <div className="mt-5 border-t border-[#e2d9c7] pt-5">
      <ol className="space-y-2.5">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-[12px] leading-6 text-[#596b65]">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#efe8da] font-mono text-[9px] font-semibold text-[#ae6249]">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[.16em] text-[#7a7769]">
          Screenshot view
        </span>
        <div
          role="group"
          aria-label="Screenshot view"
          className="inline-flex rounded-lg border border-[#d8ceb8] bg-[#f5f1e6] p-1"
        >
          {views.map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={activeView === view}
              onClick={() => chooseView(view)}
              className={`rounded-md px-3 py-1.5 text-[10px] font-semibold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] ${
                activeView === view
                  ? 'bg-[#284d45] text-[#f8f4e9] shadow-sm'
                  : 'text-[#66746e] hover:bg-[#ebe3d4] hover:text-[#284d45]'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-[#d8ceb8] bg-[#eee8dc] p-2 sm:p-3">
        {override ? (
          <img
            src={images[override]}
            alt={alt}
            loading="lazy"
            className="mx-auto block max-h-[760px] max-w-full rounded-lg object-contain shadow-[var(--shadow-sm)]"
          />
        ) : (
          <picture>
            <source media="(min-width: 1024px)" srcSet={images.desktop} />
            <source media="(min-width: 640px)" srcSet={images.tablet} />
            <img
              src={images.mobile}
              alt={alt}
              loading="lazy"
              className="mx-auto block max-h-[760px] max-w-full rounded-lg object-contain shadow-[var(--shadow-sm)]"
            />
          </picture>
        )}
      </div>

      {tip && (
        <p className="mt-3 rounded-lg bg-[#f5eadb] px-4 py-3 text-[11px] leading-5 text-[#596b65]">
          <strong className="text-[#284d45]">Tip:</strong> {tip}
        </p>
      )}
    </div>
  );
}
