import { pct } from '../domain/format';
import { config, dataset } from '../domain/model';
import { GOALS } from './Slide1Goals';
import { SlideFrame } from './SlideFrame';

interface Indicator {
  text: string;
  kpi: string;
  /** 分子 ÷ 分母 */
  formula: [string, string];
  /** 目前值（僅有模擬數據可佐證者） */
  current?: string;
}

/** 追蹤指標；順序與第 1 頁「目標」一一對應 */
const INDICATORS: Indicator[] = [
  {
    text: '全市污染削減率是否高於環境部年度目標',
    kpi: '污染削減率',
    formula: ['全市污染削減量', '全市污染排放量'],
    current: `${pct(dataset.city.rate)}（目標 ${config.moenvTargets[config.year]}%）`,
  },
  {
    text: '被優先輔導的對象，後續是否有改善情形',
    kpi: '改善率',
    formula: ['輔導後達分區目標的工地數', '優先輔導工地數'],
  },
  {
    text: '蒐集觸發條件的案件清單，追蹤後續是否依設備清單完成建置',
    kpi: '建置完成率',
    formula: ['現場查核確認完成建置的案件數', '觸發案件數'],
  },
  {
    text: '清單中工地的優良工地評選報名比例，是否因蒐集名單而明顯提升',
    kpi: '報名率',
    formula: ['報名優良工地評選的清單工地數', '清單工地數'],
  },
];

export function Slide8Metrics() {
  return (
    <SlideFrame title="成果為何" sub="追蹤指標" center>
      <div className="numbered-grid">
        {INDICATORS.map((m, i) => (
          <div key={m.kpi} className="numbered-item">
            <span className="no">{i + 1}</span>
            <div>
              <span className="ref">對應目標：{GOALS[i].title}</span>
              <h3>{m.text}</h3>
              <div className="kpi-line">
                <span className="kpi-name">KPI　{m.kpi}</span>
                {m.current && <span className="kpi-current">{m.current}</span>}
              </div>
              <div className="kpi-formula">
                <span className="frac">
                  <span>{m.formula[0]}</span>
                  <span>{m.formula[1]}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
