import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY_COLLAPSED = "sharek_sidebar_collapsed";
const STORAGE_KEY_WIDTH = "sharek_sidebar_width";

export const SIDEBAR_EXPANDED_DEFAULT = 240;
export const SIDEBAR_MIN_WIDTH = 180;
export const SIDEBAR_MAX_WIDTH = 360;
export const SIDEBAR_COLLAPSED_WIDTH = 64;

function readBool(key: string, fallback: boolean): boolean {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    return val === "true";
  } catch {
    return fallback;
  }
}

function readNumber(key: string, fallback: number): number {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export function useSidebarState() {
  const [collapsed, setCollapsedState] = useState<boolean>(() =>
    readBool(STORAGE_KEY_COLLAPSED, false),
  );
  const [width, setWidthState] = useState<number>(() => {
    const w = readNumber(STORAGE_KEY_WIDTH, SIDEBAR_EXPANDED_DEFAULT);
    return Math.min(Math.max(w, SIDEBAR_MIN_WIDTH), SIDEBAR_MAX_WIDTH);
  });

  // Write to localStorage on change
  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(STORAGE_KEY_COLLAPSED, String(value));
    } catch {
      // localStorage unavailable — graceful degradation
    }
  }, []);

  const setWidth = useCallback((value: number) => {
    const clamped = Math.min(Math.max(value, SIDEBAR_MIN_WIDTH), SIDEBAR_MAX_WIDTH);
    setWidthState(clamped);
    try {
      localStorage.setItem(STORAGE_KEY_WIDTH, String(clamped));
    } catch {
      // localStorage unavailable — graceful degradation
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  // Resize drag handling
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const startResize = useCallback(
    (e: React.PointerEvent) => {
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      e.currentTarget.setPointerCapture(e.pointerId);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    },
    [width],
  );

  const handleResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing.current) return;
      // RTL: sidebar is on the right side, so drag left = wider, drag right = narrower
      // But in RTL layout with dir="rtl", the sidebar is actually on the right visually,
      // but in DOM flow it's the "start" which is right. We handle both directions here.
      // The drag handle is on the logical end of the sidebar (left in RTL, right in LTR).
      // In RTL, clientX increases to the right; sidebar is on the right side.
      // Moving the handle to the left (smaller clientX) → increase width.
      const isRTL = document.documentElement.dir === "rtl";
      const delta = isRTL
        ? startX.current - e.clientX
        : e.clientX - startX.current;
      setWidth(startWidth.current + delta);
    },
    [setWidth],
  );

  const stopResize = useCallback((e: React.PointerEvent) => {
    if (!isResizing.current) return;
    isResizing.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  // If window is narrow, auto-collapse
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    if (mq.matches) {
      // Don't persist — just hide on mobile; the mobile nav bar takes over
    }
  }, []);

  return {
    collapsed,
    width,
    toggleCollapsed,
    setCollapsed,
    setWidth,
    startResize,
    handleResizeMove,
    stopResize,
  };
}
