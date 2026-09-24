import { SlideFrame } from './SlideFrame';

/** 不斷行空白：讓英文與前後文字留在同一行 */
const NB = String.fromCharCode(160);

const VALUES = [
  { layer: '第一層', title: '客戶留存', text: '提升機關信任與履約績效，有利續約與投標評選' },
  { layer: '第二層', title: '查核效率', text: '有限查核人力集中於高污染源，協助機關達成環境部年度目標' },
  { layer: '第三層', title: '資料資產', text: `蒐集的監測設備清單，是未來${NB}IoT${NB}數據服務的前期名單` },
];

export function Slide4Value() {
  return (
    <SlideFrame title="商業價值" sub="合約金額固定下的三層價值" center>
      <div className="value-cols">
        {VALUES.map((v) => (
          <div key={v.title} className="value">
            <span className="layer">{v.layer}</span>
            <h3>{v.title}</h3>
            <p>{v.text}</p>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
