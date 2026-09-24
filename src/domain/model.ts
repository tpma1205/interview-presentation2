import rawConfig from '../data/config.json';
import { parseConfig } from './config';
import { buildDataset } from './dataset';

/** 全站共用的設定與模擬資料集（固定種子，每次開啟一致） */
export const config = parseConfig(rawConfig);
export const dataset = buildDataset(config);
export const districtByName = new Map(dataset.districts.map((d) => [d.name, d]));
