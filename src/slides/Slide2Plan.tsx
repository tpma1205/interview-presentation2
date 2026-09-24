import { ZONE_KEYS } from '../domain/config';
import { config } from '../domain/model';
import { BASIS_BUILDING, DOC_BUILDING, DOC_POLLUTION_CONTROL, LARGE_PROJECT_CRITERIA } from '../domain/rules';
import { Route } from './Route';
import { SlideFrame } from './SlideFrame';

/** 以上標數字標註法規依據（使用字元而非 <sup>，字級與內文相同） */
const SUPERSCRIPT = ['¹', '²', '³'];

export function Slide2Plan() {
  const { zones, moenvTargets } = config;
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
      <section className="rules">
        <div className="trigger">
          <h2 className="section-label">定義規則</h2>
          <span className="chip alert">行政區削減率未達分區目標</span>
          <span>且</span>
          <span className="chip">新申報工程為大規模工程</span>
        </div>
        <ul className="trigger-out">
          <li>
            → 申報時須檢附<b>{DOC_POLLUTION_CONTROL}</b>，未檢附則無法完成申報
          </li>
          <li>
            → 房屋建築工程另附<b>{DOC_BUILDING}</b>
            <span className="cite">（{BASIS_BUILDING}）</span>
          </li>
        </ul>
        <div className="rule-details">
          <div>
            <h4>污染削減率</h4>
            削減率 =
            <span className="frac">
              <span>污染削減量</span>
              <span>污染排放量</span>
            </span>
          </div>
          <div>
            <h4>大規模工程（符合任一）</h4>
            <ul>
              {LARGE_PROJECT_CRITERIA.map((c) => (
                <li key={c.label}>
                  {c.label}
                  {SUPERSCRIPT[bases.indexOf(c.basis)]}
                </li>
              ))}
              {bases.map((b, i) => (
                <li key={b} className="cite">
                  {i + 1}. {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>削減率目標</h4>
            <ul>
              <li>
                環境部 115 年 {moenvTargets['115']}%、116 年 {moenvTargets['116']}%
              </li>
              {ZONE_KEYS.map((k) => (
                <li key={k}>
                  {zones[k].label} {zones[k].target}%
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SlideFrame>
  );
}
