import type { SlideProps } from '.';
import { SlideFrame } from './SlideFrame';

const ROWS = [
  ['地圖上色', '載入頁面', '依行政區削減率是否達分區目標上色，未達標為警示色'],
  ['滑鼠移入 tooltip', '移入行政區', '顯示分區、工地數、排放量、削減量、削減率、目標'],
  ['點擊行政區', '點擊', '表格顯示該區排放量 TOP 10 工地'],
  ['優先輔導標示', '表格載入', '削減率低於分區目標之工地標示「優先輔導」'],
  ['申報觸發判定', '送出申報', '未達標區且大規模工程 → 須檢附清單，未檢附無法完成申報'],
];

export function Slide7Docs({ num }: SlideProps) {
  return (
    <SlideFrame num={num} title="規格文件、交互文件" center>
      <div className="docs-layout">
        <table className="data-table spec-table">
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
                <td>
                  <b>{c}</b>
                </td>
                <td>{a}</td>
                <td className="wrap">{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="roles">
          <div className="role card is-me">
            <div className="role-who">我</div>
            <ul>
              <li>需求定義</li>
              <li>UI 定義</li>
              <li>指標與計算邏輯</li>
              <li>
                SQL
                <div className="muted">AI 協助撰寫語法，我負責驗證結果</div>
              </li>
            </ul>
          </div>
          <div className="role card">
            <div className="role-who">資訊工程師</div>
            <ul>
              <li>前端開發</li>
              <li>資料串接</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="cross-flow">
        <span className="cross-label">跨專案交互</span>
        <span className="chip">申報檢附清單</span>
        <span className="arrow">→</span>
        <span className="chip">回傳現場查核專案</span>
        <span className="arrow">→</span>
        <span className="chip">比對現場實際布置</span>
      </div>
    </SlideFrame>
  );
}
