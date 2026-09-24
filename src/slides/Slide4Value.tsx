import type { SlideProps } from '.';
import { SlideFrame } from './SlideFrame';

const VALUES = [
  { no: '①', title: '客戶留存', text: '提升機關信任與履約績效，有利續約與投標評選' },
  { no: '②', title: '效率', text: '有限查核人力集中於高污染源，協助機關達成環境部年度削減目標' },
  { no: '③', title: '資料資產', text: '蒐集的監測設備清單，是未來 IoT 數據服務的前期名單' },
];

export function Slide4Value({ num }: SlideProps) {
  return (
    <SlideFrame num={num} title="商業價值" sub="合約金額固定下的三層價值" center>
      <div className="value-cols">
        {VALUES.map((v) => (
          <div key={v.title} className="card value">
            <span className="value-no">{v.no}</span>
            <div className="value-title">{v.title}</div>
            <div className="card-text">{v.text}</div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
