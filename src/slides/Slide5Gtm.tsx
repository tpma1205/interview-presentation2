import { Route } from './Route';
import { SlideFrame } from './SlideFrame';

/** 精簡版 GTM：保留適用於合約內加值功能的步驟，略過定價與銷售部門 */
export function Slide5Gtm() {
  return (
    <SlideFrame title="GTM 策略" center>
      <Route
        numbered
        stops={[
          { title: '市場問題', detail: '部分行政區\n未達分區目標；\n申報階段缺少\n防制設備資訊' },
          { title: '目標客群', detail: '環保機關、\n大規模工程業者、\n現場查核專案' },
          { title: '定位與價值', detail: '協助機關將查核資源\n集中於高污染源，\n達成環境部年度目標' },
          { title: '推廣通路', detail: '內部教育訓練、\n申報首頁跑馬燈、\n業者說明簡報' },
          { title: '指標與迭代', detail: '保守門檻試行，\n預估每年 5–10 件，\n依業者配合度與\n執行成本調整' },
        ]}
      />
    </SlideFrame>
  );
}
