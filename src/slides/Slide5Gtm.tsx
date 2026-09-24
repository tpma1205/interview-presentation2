import type { SlideProps } from '.';
import { Flow } from './Flow';
import { SlideFrame } from './SlideFrame';

export function Slide5Gtm({ num }: SlideProps) {
  return (
    <SlideFrame num={num} title="GTM 策略" center>
      <Flow
        steps={[
          { title: '機關可行性討論', detail: '取得機關支持' },
          { title: '內部教育訓練', detail: '觸發機制與輔導方式' },
          { title: '對外宣導', detail: '申報首頁跑馬燈、業者說明簡報' },
          {
            title: '保守門檻試行',
            detail: (
              <>
                預估每年 <b className="alert">5–10 件</b>
                <br />
                依業者配合度與執行成本決定是否擴大
              </>
            ),
            highlight: true,
          },
        ]}
      />
    </SlideFrame>
  );
}
