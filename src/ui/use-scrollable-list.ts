import { useInput } from "ink";
import { useCallback, useState } from "react";

interface ScrollableListOptions {
  /** Total number of items in the list. */
  itemCount: number;
  /** Number of rows available for rendering list items. */
  viewportHeight: number;
  /** Whether this component is currently receiving input. */
  isActive: boolean;
  /**
   * When true (default), Up/Down move a highlighted cursor through items.
   * When false, Up/Down scroll the viewport without any cursor highlight.
   */
  interactive?: boolean;
}

interface ScrollableListResult {
  /** Currently highlighted item index (0-based). */
  cursor: number;
  /** First visible item index. */
  scrollOffset: number;
  /** Inclusive start, exclusive end of the visible window. */
  visibleRange: { start: number; end: number };
  /** Programmatically set the cursor (e.g. to restore position). */
  setCursor: (index: number) => void;
  /** True when there are items above the visible window. */
  hasMoreAbove: boolean;
  /** True when there are items below the visible window. */
  hasMoreBelow: boolean;
  /** Human-readable position label, e.g. "[5-20 of 42]". */
  positionLabel: string;
}

/**
 * Reusable hook for scrollable lists in Ink.
 *
 * When `interactive` is true (default):
 * - Up / Down arrow: move cursor by 1, viewport follows
 * - Page Up / Page Down: jump cursor by (viewportHeight - 1)
 *
 * When `interactive` is false:
 * - Up / Down arrow: scroll viewport by 1 line (no cursor)
 * - Page Up / Page Down: scroll viewport by (viewportHeight - 1)
 *
 * Does NOT handle Enter / Esc -- those are left to the consumer component.
 */
export function useScrollableList(
  options: ScrollableListOptions
): ScrollableListResult {
  const { itemCount, viewportHeight, isActive, interactive = true } = options;

  const [cursor, setCursorRaw] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const maxVisible = Math.max(1, viewportHeight);
  const maxCursor = Math.max(0, itemCount - 1);
  const maxOffset = Math.max(0, itemCount - maxVisible);

  /**
   * Move the cursor to `nextCursor`, clamped to [0, maxCursor],
   * and adjust scrollOffset so the cursor stays within the viewport.
   */
  const moveTo = useCallback(
    (nextCursor: number) => {
      const clamped = Math.max(0, Math.min(nextCursor, maxCursor));
      setCursorRaw(clamped);

      setScrollOffset((prev) => {
        if (clamped < prev) return clamped;
        if (clamped >= prev + maxVisible) return clamped - maxVisible + 1;
        return prev;
      });
    },
    [maxCursor, maxVisible]
  );

  const scrollBy = useCallback(
    (delta: number) => {
      setScrollOffset((prev) => Math.max(0, Math.min(prev + delta, maxOffset)));
    },
    [maxOffset]
  );

  const setCursor = useCallback(
    (index: number) => {
      moveTo(index);
    },
    [moveTo]
  );

  useInput(
    (_input, key) => {
      if (itemCount === 0) return;

      if (interactive) {
        if (key.upArrow) {
          moveTo(cursor - 1);
        } else if (key.downArrow) {
          moveTo(cursor + 1);
        } else if (key.pageUp) {
          moveTo(cursor - (maxVisible - 1));
        } else if (key.pageDown) {
          moveTo(cursor + (maxVisible - 1));
        }
      } else {
        if (key.pageUp) {
          scrollBy(-(maxVisible - 1));
        } else if (key.pageDown) {
          scrollBy(maxVisible - 1);
        }
      }
    },
    { isActive }
  );

  const clampedOffset = Math.max(0, Math.min(scrollOffset, maxOffset));
  const visibleEnd = Math.min(clampedOffset + maxVisible, itemCount);

  const hasMoreAbove = clampedOffset > 0;
  const hasMoreBelow = visibleEnd < itemCount;

  const positionLabel =
    itemCount === 0
      ? "[0 of 0]"
      : `[${clampedOffset + 1}-${visibleEnd} of ${itemCount}]`;

  return {
    cursor: interactive ? cursor : -1,
    scrollOffset: clampedOffset,
    visibleRange: { start: clampedOffset, end: visibleEnd },
    setCursor,
    hasMoreAbove,
    hasMoreBelow,
    positionLabel,
  };
}
