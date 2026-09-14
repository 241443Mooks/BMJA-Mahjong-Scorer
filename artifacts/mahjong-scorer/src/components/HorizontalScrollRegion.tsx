import { useEffect, useRef, useState, type ReactNode } from 'react';

export function isHorizontallyScrollable(scrollWidth: number, clientWidth: number) {
  return scrollWidth > clientWidth;
}

export function HorizontalScrollRegion({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      setIsScrollable(
        isHorizontallyScrollable(element.scrollWidth, element.clientWidth),
      );
    };

    update();
    window.addEventListener('resize', update);

    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(element);
    if (element.firstElementChild) observer?.observe(element.firstElementChild);

    return () => {
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2 ${className}`.trim()}
      tabIndex={isScrollable ? 0 : undefined}
      role={isScrollable ? 'group' : undefined}
      aria-label={isScrollable ? `${label}. Horizontally scrollable.` : undefined}
    >
      {children}
    </div>
  );
}
