import { SlideFrame } from './SlideFrame';

/** 不斷行空白：讓數字、英文與前後文字留在同一行 */
const NB = String.fromCharCode(160);

const SOLUTION_DASHBOARD = '建立污染量監測儀表板';
const SOLUTION_DOCS = '新增申報審查文件';

/** 目標；編號與第 8 頁追蹤指標一一對應 */
export const GOALS: { title: string; text: string | string[]; solution: string }[] = [
  {
    title: '即時掌握污染數據',
    text: `即時掌握新北市${NB}29${NB}個行政區的營建工程污染情形，確保符合環境部年度削減率目標`,
    solution: SOLUTION_DASHBOARD,
  },
  {
    title: '掌握重點污染工程',
    text: '掌握施工中工地最具代表性的重點污染工程，合理配置人力資源',
    solution: SOLUTION_DASHBOARD,
  },
  {
    title: '源頭掌握污染防制設備',
    text: '提前掌握大規模工程的污染防制設備規劃，並提交現場查核專案人員作為查核依據',
    solution: SOLUTION_DOCS,
  },
  {
    title: '資料蒐集',
    text: ['蒐集優良工地評選名單', `IoT${NB}數據聯網的前期名單`],
    solution: SOLUTION_DOCS,
  },
];

export function Slide1Goals() {
  return (
    <SlideFrame title="專案目標" center>
      <p className="origin">
        <span className="label">起源</span>
        計畫執行年度精進亮點（非合約項目）
      </p>
      <h2 className="section-label">目標</h2>
      <div className="numbered-grid">
        {GOALS.map((g, i) => (
          <div key={g.title} className="numbered-item">
            <span className="no">{i + 1}</span>
            <div>
              <h3>{g.title}</h3>
              {Array.isArray(g.text) ? (
                <ul className="goal-list">
                  {g.text.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : (
                <p>{g.text}</p>
              )}
              <p className="solution">
                <span>解決方案</span>
                {g.solution}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
