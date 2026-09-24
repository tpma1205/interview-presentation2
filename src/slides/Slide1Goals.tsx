import type { SlideProps } from '.';
import { SlideFrame } from './SlideFrame';

const PROBLEMS = [
  { title: '即時掌握達標狀況', text: '即時掌握新北市 29 個行政區的污染削減率達標狀況，確保符合環境部年度削減目標' },
  { title: '找出優先輔導對象', text: '從行政區到工地，找出應優先輔導的對象' },
  { title: '申報階段掌握設備規劃', text: '在申報階段掌握大規模工程的污染防制設備規劃' },
  { title: '串接現場查核', text: '將申報資料提供給現場查核專案，作為現場比對依據' },
];

export function Slide1Goals({ num }: SlideProps) {
  return (
    <SlideFrame num={num} title="專案目標" center>
      <div className="origin card">
        <span className="origin-label">起因</span>
        <span>
          計畫每年度需提出<b>加值服務</b>（非合約項目）
        </span>
      </div>
      <h2 className="section-label">想解決的問題</h2>
      <div className="grid-2x2">
        {PROBLEMS.map((p, i) => (
          <div key={p.title} className="card problem">
            <span className="big-no">{i + 1}</span>
            <div>
              <div className="card-title">{p.title}</div>
              <div className="card-text">{p.text}</div>
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
