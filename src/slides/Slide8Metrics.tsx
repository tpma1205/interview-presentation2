import type { SlideProps } from '.';
import { SlideFrame } from './SlideFrame';

const METRICS = [
  { title: '過程指標', items: ['依清單建置比例', '文件完整提交率', '補件次數'] },
  {
    title: '結果指標',
    items: ['觸發工地削減率 vs 對照組', '對照組：同規模、同類型、位於達標區且未觸發的大規模工程'],
    note: '需留意均值回歸',
  },
  { title: '延伸指標', items: ['優良工地評選轉換件數', '可聯網監測設備數'] },
  { title: '風險指標', items: ['業者陳情與爭議件數'], risk: true },
];

export function Slide8Metrics({ num }: SlideProps) {
  return (
    <SlideFrame num={num} title="成果為何" sub="成效指標設計" center>
      <div className="metric-cols">
        {METRICS.map((m) => (
          <div key={m.title} className={`card metric${m.risk ? ' is-risk' : ''}`}>
            <div className="metric-title">{m.title}</div>
            <ul>
              {m.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
            {m.note && <div className="metric-note">⚠ {m.note}</div>}
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
