import { SlideFrame } from './SlideFrame';

/** 不斷行空白：讓數字、英文與前後文字留在同一行 */
const NB = String.fromCharCode(160);

/** 想解決的問題；編號與第 8 頁追蹤指標一一對應 */
export const PROBLEMS = [
  {
    title: '即時掌握達標狀況',
    text: `即時掌握新北市${NB}29${NB}個行政區的污染削減率達標狀況，確保符合環境部年度目標`,
  },
  { title: '掌握重點污染工程', text: '掌握施工中工地最具代表性的重點污染工程' },
  { title: '源頭掌握污染防制設備', text: '提前掌握大規模工程的污染防制設備規劃，並提交現場查核專案人員作為查核依據' },
  { title: '資料蒐集', text: `蒐集優良工地評選名單，以及${NB}IoT${NB}數據服務的前期名單` },
];

export function Slide1Goals() {
  return (
    <SlideFrame title="專案目標" center>
      <p className="origin">
        <span className="label">起源</span>
        計畫當年度擴充功能項目
      </p>
      <h2 className="section-label">想解決的問題</h2>
      <div className="numbered-grid">
        {PROBLEMS.map((p, i) => (
          <div key={p.title} className="numbered-item">
            <span className="no">{i + 1}</span>
            <div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
