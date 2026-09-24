import { Stage } from './shell/Stage';
import { DASHBOARD_PAGE, PAGE_COUNT, useDeck } from './shell/useDeck';
import { SLIDES } from './slides';
import { SlideFrame } from './slides/SlideFrame';

export function App() {
  const deck = useDeck();
  const Current = SLIDES[deck.page - 1];

  return (
    <Stage>
      <header className="topbar">
        <span className="project">營建工程污染削減監測儀表板與申報前管制機制</span>
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
            儀表板
          </button>
          <button aria-current={deck.appendixOpen} onClick={deck.openAppendix}>
            附錄
          </button>
        </nav>
      </header>
      {deck.appendixOpen ? (
        <SlideFrame title="附錄">
          <button className="back-btn" onClick={deck.closeAppendix}>
            ← 返回第 {deck.page} 頁
          </button>
        </SlideFrame>
      ) : (
        <Current num={deck.page} />
      )}
      <div className="pager" data-testid="pager">
        {deck.appendixOpen ? '附錄' : `${deck.page} / ${PAGE_COUNT}`}
      </div>
    </Stage>
  );
}
