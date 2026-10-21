import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';

const FALLBACK_VIEWPORT_HEIGHT = 800;
const OVERSCAN_ROWS = 12;

export type VirtualWindow = {
  readonly scrollerRef: RefObject<HTMLDivElement>;
  readonly start: number;
  readonly end: number;
  readonly totalHeight: number;
  readonly onScroll: () => void;
  readonly revealRow: (index: number) => void;
};

export const useVirtualWindow = (rowCount: number, rowHeight: number): VirtualWindow => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(FALLBACK_VIEWPORT_HEIGHT);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => setViewportHeight(scroller.clientHeight || FALLBACK_VIEWPORT_HEIGHT);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  const onScroll = useCallback(() => {
    setScrollTop(scrollerRef.current?.scrollTop ?? 0);
  }, []);

  const revealRow = useCallback(
    (index: number) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const height = scroller.clientHeight || FALLBACK_VIEWPORT_HEIGHT;
      const top = index * rowHeight;
      const bottom = top + rowHeight;
      let next = scroller.scrollTop;
      if (top < next) next = top;
      else if (bottom > next + height) next = bottom - height;
      if (next === scroller.scrollTop) return;
      scroller.scrollTop = next;
      setScrollTop(next);
    },
    [rowHeight],
  );

  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN_ROWS);
  const end = Math.min(rowCount, Math.ceil((scrollTop + viewportHeight) / rowHeight) + OVERSCAN_ROWS);

  return { scrollerRef, start, end, totalHeight: rowCount * rowHeight, onScroll, revealRow };
};
