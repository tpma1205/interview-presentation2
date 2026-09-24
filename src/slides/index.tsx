import type { ComponentType } from 'react';
import { SlideFrame } from './SlideFrame';

export interface SlideProps {
  num: number;
}

const placeholder =
  (title: string): ComponentType<SlideProps> =>
  ({ num }) => <SlideFrame num={num} title={title}>{null}</SlideFrame>;

export const SLIDES: ComponentType<SlideProps>[] = [
  placeholder('專案目標'),
  placeholder('執行規劃'),
  placeholder('執行成果（儀表板 Demo）'),
  placeholder('商業價值'),
  placeholder('GTM 策略'),
  placeholder('技術規格、技術架構'),
  placeholder('規格文件、交互文件'),
  placeholder('成果為何（成效指標設計）'),
];
