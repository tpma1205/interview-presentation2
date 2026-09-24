import type { ComponentType } from 'react';
import { Dashboard } from '../dashboard/Dashboard';
import { Slide1Goals } from './Slide1Goals';
import { Slide2Plan } from './Slide2Plan';
import { Slide4Value } from './Slide4Value';
import { Slide5Gtm } from './Slide5Gtm';
import { Slide6Tech } from './Slide6Tech';
import { Slide7Docs } from './Slide7Docs';
import { Slide8Metrics } from './Slide8Metrics';

/** 固定 8 頁，依序；short 為頁尾刻度尺上的短名 */
export const SLIDES: { short: string; Component: ComponentType }[] = [
  { short: '專案目標', Component: Slide1Goals },
  { short: '執行規劃', Component: Slide2Plan },
  { short: '執行成果', Component: Dashboard },
  { short: '商業價值', Component: Slide4Value },
  { short: 'GTM 策略', Component: Slide5Gtm },
  { short: '技術架構', Component: Slide6Tech },
  { short: '規格文件', Component: Slide7Docs },
  { short: '成果為何', Component: Slide8Metrics },
];
