import { ZONE_KEYS } from '../domain/config';
import { config } from '../domain/model';
import { BASIS_BUILDING, DOC_BUILDING, DOC_POLLUTION_CONTROL, LARGE_PROJECT_CRITERIA } from '../domain/rules';
import { Route } from './Route';
import { SlideFrame } from './SlideFrame';

/** 儀表板預計呈現的內容；\n 為指定斷行處 */
const DASHBOARD_CONTENTS = [
  '全市污染削減率與環境部年度目標',
  '29 個行政區依是否達分區目標上色',
  '滑鼠移入：工地數、排放量、\n削減量、削減率',
  '點擊行政區：\n該區排放量 TOP 10 工地',
  '削減率低於分區目標的工地\n標示優先輔導',
];

export function Slide2Plan() {
  const { zones, moenvTargets } = config;
  // 依法規依據分組列出大規模工程條件
  const bases = [...new Set(LARGE_PROJECT_CRITERIA.map((c) => c.basis))];
  return (
    <SlideFrame title="執行規劃">
      <Route
        stops={[
          { title: '定義規則' },
          { title: '與主管討論\n可行性' },
          { title: '與機關達成共識\n並取得支持' },
          { title: '撰寫需求\n說明書' },
          { title: '資訊部門\n開發及測試' },
          { title: '上線' },
        ]}
      />
      <div className="plan-cols">
        <section>
          <h2 className="section-label">儀表板內容</h2>
          <ul className="plan-list">
            {DASHBOARD_CONTENTS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="section-label">新增申報審查文件</h2>
          <div className="trigger">
            <span className="chip alert">行政區削減率未達分區目標</span>
            <span>且</span>
            <span className="chip">新申報工程為大規模工程</span>
          </div>
          <ul className="plan-list trigger-out">
            <li>
              須檢附<b>{DOC_POLLUTION_CONTROL}</b>，未檢附則無法完成申報
            </li>
            <li>
              房屋建築工程另附<b>{DOC_BUILDING}</b>
              <span className="cite">（{BASIS_BUILDING}）</span>
            </li>
          </ul>
        </section>
        <section className="definitions">
          <h2 className="section-label">定義說明</h2>
          <h4>污染削減率</h4>
          <div>
            削減率 =
            <span className="frac">
              <span>污染削減量</span>
              <span>污染排放量</span>
            </span>
          </div>
          <h4>大規模工程（符合任一）</h4>
          <ul>
            {bases.map((b) => (
              <li key={b}>
                <span className="cite">{b}</span>
                <ul className="criteria">
                  {LARGE_PROJECT_CRITERIA.filter((c) => c.basis === b).map((c) => (
                    <li key={c.label}>{c.label}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <h4>削減率目標</h4>
          <ul>
            <li>
              環境部 115 年 {moenvTargets['115']}%、116 年 {moenvTargets['116']}%
            </li>
            <li>{ZONE_KEYS.map((k) => `${zones[k].label} ${zones[k].target}%`).join('、')}</li>
          </ul>
        </section>
      </div>
    </SlideFrame>
  );
}
