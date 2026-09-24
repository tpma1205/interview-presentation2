import type { SlideProps } from '.';
import { BASIS_BUILDING } from '../domain/declaration';
import { config } from '../domain/model';
import { Flow } from './Flow';
import { SlideFrame } from './SlideFrame';

export function Slide2Plan({ num }: SlideProps) {
  const { zones, moenvTargets } = config;
  return (
    <SlideFrame num={num} title="執行規劃">
      <div className="plan">
        <Flow
          direction="column"
          steps={[
            { title: '定義規則', highlight: true },
            { title: '確定架構' },
            { title: '與主管討論可行性' },
            { title: '與機關達成共識並取得支持' },
          ]}
        />
        <div className="rules card">
          <div className="rules-cap">規則摘要</div>
          <div className="rule">
            <div className="rule-title">污染削減率</div>
            <div className="formula">
              削減率 ={' '}
              <span className="frac">
                <span>污染削減量</span>
                <span>污染排放量</span>
              </span>
            </div>
          </div>
          <div className="rule">
            <div className="rule-title">目標對照</div>
            <table className="mini-table">
              <tbody>
                <tr>
                  <th>環境部</th>
                  <td>
                    115 年 <b>{moenvTargets['115']}%</b>　116 年 <b>{moenvTargets['116']}%</b>
                  </td>
                </tr>
                {(['metro', 'developing', 'rural'] as const).map((k) => (
                  <tr key={k}>
                    <th>{zones[k].label}</th>
                    <td>
                      <b>{zones[k].target}%</b>
                      <span className="muted">　{zones[k].densityRule}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rule">
            <div className="rule-title">大規模工程（符合任一）</div>
            <ol className="rule-list">
              <li>
                面積 ≥ 1 萬 m² 且工期 ≥ 1 年
                <div className="cite">營建工程空氣污染防制設施管理辦法第 18 條</div>
              </li>
              <li>
                外運土石（鬆方）≥ 1 萬 m³<div className="cite">同上</div>
              </li>
              <li>
                合約經費 ≥ 2 億元
                <div className="cite">投標廠商資格與特殊或巨額採購認定標準第 8 條</div>
              </li>
            </ol>
          </div>
          <div className="rule">
            <div className="rule-title">觸發條件</div>
            <div className="trigger">
              <span className="chip alert">行政區未達標</span>
              <b>且</b>
              <span className="chip">大規模工程</span>
            </div>
            <div className="trigger-out">→ 應檢附污染防制設備清單</div>
            <div className="trigger-out">
              → 房屋建築工程另附空污、噪音及監測設備清單
              <div className="cite">{BASIS_BUILDING}</div>
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
