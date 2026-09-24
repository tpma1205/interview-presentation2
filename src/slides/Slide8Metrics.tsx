import { PROBLEMS } from './Slide1Goals';
import { SlideFrame } from './SlideFrame';

/** 追蹤指標；順序與第 1 頁「想解決的問題」一一對應 */
const INDICATORS = [
  '全市污染削減率是否高於環境部年度目標',
  '被優先輔導的對象，後續是否有改善情形',
  '蒐集觸發條件的案件清單，追蹤後續是否依設備清單完成建置',
  '清單中工地的優良工地評選報名比例，是否因蒐集名單而明顯提升',
];

export function Slide8Metrics() {
  return (
    <SlideFrame title="成果為何" sub="追蹤指標" center>
      <div className="numbered-grid">
        {INDICATORS.map((text, i) => (
          <div key={text} className="numbered-item">
            <span className="no">{i + 1}</span>
            <div>
              <span className="ref">對應問題：{PROBLEMS[i].title}</span>
              <h3>{text}</h3>
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
