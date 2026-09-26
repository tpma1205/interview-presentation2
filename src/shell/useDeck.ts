import { useCallback, useEffect, useState } from 'react';

export const PAGE_COUNT = 7;
export const DASHBOARD_PAGE = 3;

export interface DeckState {
  page: number;
  appendixOpen: boolean;
}

const clampPage = (page: number) => Math.min(PAGE_COUNT, Math.max(1, page));

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || target.isContentEditable;
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void document.documentElement.requestFullscreen?.();
  }
}

export function useDeck() {
  const [state, setState] = useState<DeckState>({ page: 1, appendixOpen: false });

  const goTo = useCallback((page: number) => {
    setState({ page: clampPage(page), appendixOpen: false });
  }, []);
  const openAppendix = useCallback(() => setState((s) => ({ ...s, appendixOpen: true })), []);
  const closeAppendix = useCallback(() => setState((s) => ({ ...s, appendixOpen: false })), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }
      if (key === 'a') {
        e.preventDefault();
        setState((s) => ({ ...s, appendixOpen: !s.appendixOpen }));
        return;
      }
      if (key === 'escape') {
        setState((s) => (s.appendixOpen ? { ...s, appendixOpen: false } : s));
        return;
      }
      if (key === 'arrowright' || key === 'arrowleft') {
        e.preventDefault();
        const delta = key === 'arrowright' ? 1 : -1;
        setState((s) =>
          s.appendixOpen ? s : { ...s, page: clampPage(s.page + delta) },
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return { ...state, goTo, openAppendix, closeAppendix };
}
