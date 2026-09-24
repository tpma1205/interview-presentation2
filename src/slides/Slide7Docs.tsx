import { SlideFrame } from './SlideFrame';

const ROWS = [
  ['地圖上色', '載入頁面', '依行政區削減率是否達分區目標上色，未達標為警示色'],
  ['滑鼠移入 tooltip', '移入行政區', '顯示分區、工地數、排放量、削減量、削減率、分區目標'],
  ['點擊行政區', '點擊', '表格顯示該區排放量 TOP 10 工地'],
  ['優先輔導標示', '表格載入', '削減率低於分區目標的工地標示「優先輔導」'],
  ['申報觸發判定', '送出申報', '未達標區的大規模工程須檢附清單，未檢附無法完成申報'],
];

export function Slide7Docs() {
  return (
    <SlideFrame title="規格文件、交互文件" center>
      <div className="docs-layout">
        <table className="spec-table">
          <thead>
            <tr>
              <th>元件</th>
              <th>操作</th>
              <th>系統回應</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([c, a, r]) => (
              <tr key={c}>
                <td>{c}</td>
                <td>{a}</td>
                <td>{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="roles">
          <div className="role">
            <h3>我</h3>
            <ul>
              <li>需求定義</li>
              <li>UI 定義</li>
              <li>指標與計算邏輯</li>
              <li>
                SQL
                <span className="note">AI 協助撰寫語法，我負責驗證結果</span>
              </li>
            </ul>
          </div>
          <div className="role">
            <h3>資訊工程師</h3>
            <ul>
              <li>前端開發</li>
              <li>資料串接</li>
            </ul>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
