import type { ComponentType } from 'react';
import { Dashboard } from '../dashboard/Dashboard';
import { Slide1Goals } from './Slide1Goals';
import { Slide2Plan } from './Slide2Plan';
import { Slide4Value } from './Slide4Value';
import { Slide5Gtm } from './Slide5Gtm';
import { Slide6Tech } from './Slide6Tech';
import { Slide7Docs } from './Slide7Docs';
import { Slide8Metrics } from './Slide8Metrics';

export interface SlideProps {
  num: number;
}

/** 固定 8 頁，依序 */
export const SLIDES: ComponentType<SlideProps>[] = [
  Slide1Goals,
  Slide2Plan,
  Dashboard,
  Slide4Value,
  Slide5Gtm,
  Slide6Tech,
  Slide7Docs,
  Slide8Metrics,
];
