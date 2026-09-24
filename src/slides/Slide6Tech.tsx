import type { SlideProps } from '.';
import { SlideFrame } from './SlideFrame';

const NODES = [
  { title: '現場查核專案', sub: '依環境部查核與計算方法' },
  { title: '資料庫', sub: 'MS SQL Server' },
  { title: 'SQL 即時運算', sub: '削減率・達標・TOP 10' },
  { title: '前端地圖與表格', sub: '儀表板' },
];

const SPECS = [
  { k: '即時運算', v: '頁面重新整理即重新運算' },
  { k: '資料新鮮度', v: '依查核紀錄入庫頻率' },
  { k: '嵌入申報流程', v: '觸發判定嵌入申報流程，未檢附應備文件則無法完成申報' },
  { k: '資料回流', v: '應檢附清單回傳現場查核專案' },
];

export function Slide6Tech({ num }: SlideProps) {
  return (
    <SlideFrame num={num} title="技術規格、技術架構" center>
      <h2 className="section-label">資料流架構</h2>
      <div className="arch">
        {NODES.map((n, i) => (
          <div key={n.title} className="arch-item">
            <div className="arch-node card">
              <div className="arch-title">{n.title}</div>
              <div className="arch-sub">{n.sub}</div>
            </div>
            {i < NODES.length - 1 && (
              <span className="arch-arrow" aria-hidden>
                →
              </span>
            )}
          </div>
        ))}
      </div>
      <h2 className="section-label">技術規格重點</h2>
      <div className="spec-grid">
        {SPECS.map((s) => (
          <div key={s.k} className="spec card">
            <div className="spec-k">{s.k}</div>
            <div className="spec-v">{s.v}</div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
