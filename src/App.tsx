import { Stage } from './shell/Stage';
import { DASHBOARD_PAGE, PAGE_COUNT, useDeck } from './shell/useDeck';
import { SLIDES } from './slides';
import { Appendix } from './slides/Appendix';

export const PROJECT_TITLE = '新北市營建工程污染削減監測儀錶板';

export function App() {
  const deck = useDeck();
  const { Component } = SLIDES[deck.page - 1];

  return (
    <Stage>
      <header className="topbar">
        <span className="project">{PROJECT_TITLE}</span>
        <nav>
          <button
            aria-current={!deck.appendixOpen && deck.page !== DASHBOARD_PAGE}
            onClick={() => deck.goTo(deck.page === DASHBOARD_PAGE ? 1 : deck.page)}
          >
            簡報
          </button>
          <button
            aria-current={!deck.appendixOpen && deck.page === DASHBOARD_PAGE}
            onClick={() => deck.goTo(DASHBOARD_PAGE)}
          >
            儀錶板
          </button>
          <button aria-current={deck.appendixOpen} onClick={deck.openAppendix}>
            附錄
          </button>
        </nav>
      </header>
      {deck.appendixOpen ? <Appendix returnPage={deck.page} onBack={deck.closeAppendix} /> : <Component />}
      <footer className="ruler" aria-label="簡報進度">
        {SLIDES.map((s, i) => {
          const page = i + 1;
          const current = !deck.appendixOpen && page === deck.page;
          return (
            <button
              key={s.short}
              className={page < deck.page && !deck.appendixOpen ? 'is-past' : ''}
              aria-current={current ? 'step' : undefined}
              onClick={() => deck.goTo(page)}
            >
              {s.short}
            </button>
          );
        })}
        <span className="pager" data-testid="pager">
          {deck.appendixOpen ? '附錄' : `${deck.page} / ${PAGE_COUNT}`}
        </span>
      </footer>
    </Stage>
  );
}
