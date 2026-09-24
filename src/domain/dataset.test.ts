import { describe, expect, it } from 'vitest';
import rawConfig from '../data/config.json';
import geo from '../data/new-taipei.geo.json';
import { buildDataset, topSites } from './dataset';
import { parseConfig } from './config';

const config = parseConfig(rawConfig);
const data = buildDataset(config);
const district = (name: string) => data.districts.find((d) => d.name === name)!;
const FAILING = ['新莊', '三重', '林口', '淡水'];

describe('模擬資料集', () => {
  it('包含新北市 29 區，且名稱與地圖邊界一一對應', () => {
    const names = data.districts.map((d) => d.name).sort();
    const geoNames = geo.features.map((f) => f.properties.name).sort();
    expect(names).toHaveLength(29);
    expect(names).toEqual(geoNames);
  });

  it('未達標行政區恰為新莊、三重、林口、淡水，削減率等於設定值', () => {
    const failing = data.districts.filter((d) => d.underperforming).map((d) => d.name);
    expect(failing.sort()).toEqual([...FAILING].sort());
    expect(district('新莊').rate).toBeCloseTo(66.8, 2);
    expect(district('三重').rate).toBeCloseTo(68.1, 2);
    expect(district('林口').rate).toBeCloseTo(63.5, 2);
    expect(district('淡水').rate).toBeCloseTo(64.2, 2);
  });

  it('其餘 25 區削減率落在分區目標 +1% 至 +10%', () => {
    const others = data.districts.filter((d) => !FAILING.includes(d.name));
    expect(others).toHaveLength(25);
    for (const d of others) {
      expect(d.rate, d.name).toBeGreaterThanOrEqual(d.target + 1 - 1e-9);
      expect(d.rate, d.name).toBeLessThanOrEqual(d.target + 10 + 1e-9);
    }
  });

  it('分區目標：都會 70%、發展 67%、偏鄉 65%；八里、三峽手動調整為發展區', () => {
    expect(district('永和').target).toBe(70);
    expect(district('土城').target).toBe(67);
    expect(district('烏來').target).toBe(65);
    expect(district('八里')).toMatchObject({ zone: 'developing', target: 67, manualAdjusted: true });
    expect(district('三峽')).toMatchObject({ zone: 'developing', target: 67, manualAdjusted: true });
    expect(district('深坑')).toMatchObject({ zone: 'rural', manualAdjusted: false });
  });

  it('全市削減率為 68.5%', () => {
    expect(data.city.rate).toBeCloseTo(68.5, 2);
  });

  it('全市前 10 大工程合計約占總排放 80%，且位於指定行政區', () => {
    const top = topSites(data.sites, 10);
    const share = top.reduce((s, x) => s + x.emission, 0) / data.city.emission;
    expect(share).toBeGreaterThan(0.78);
    expect(share).toBeLessThan(0.82);
    const byDistrict = top.map((s) => s.district).sort();
    expect(byDistrict).toEqual(['三重', '中和', '土城', '新店', '新莊', '林口', '林口', '板橋', '淡水', '淡水'].sort());
  });

  it('施工中工地數：都會 40–90、發展 20–60、偏鄉 3–15', () => {
    const range = { metro: [40, 90], developing: [20, 60], rural: [3, 15] } as const;
    for (const d of data.districts) {
      const [min, max] = range[d.zone];
      expect(d.siteCount, d.name).toBeGreaterThanOrEqual(min);
      expect(d.siteCount, d.name).toBeLessThanOrEqual(max);
    }
  });

  it('未達標 4 區的 TOP 10 工地中，至少 3 處削減率低於分區目標（優先輔導）', () => {
    for (const name of FAILING) {
      const d = district(name);
      const top = topSites(data.sites.filter((s) => s.district === name), 10);
      expect(top).toHaveLength(10);
      expect(top.filter((s) => s.rate < d.target).length, name).toBeGreaterThanOrEqual(3);
    }
  });

  it('工地代號為分區字母 + 三位流水號，且不重複', () => {
    const letter = { metro: 'A', developing: 'B', rural: 'C' } as const;
    for (const s of data.sites) {
      expect(s.id.startsWith(`${letter[s.zone]}-`)).toBe(true);
      expect(s.id).toMatch(/^[ABC]-\d{3}$/);
    }
    expect(new Set(data.sites.map((s) => s.id)).size).toBe(data.sites.length);
  });

  it('工地削減率合理（0–100%），削減量 = 排放量 × 削減率', () => {
    for (const s of data.sites) {
      expect(s.rate).toBeGreaterThan(0);
      expect(s.rate).toBeLessThan(100);
      expect(s.reduction).toBeCloseTo((s.emission * s.rate) / 100, 9);
    }
  });

  it('同一種子兩次產生的資料完全相同', () => {
    expect(buildDataset(config)).toEqual(data);
  });

  it('config 設定無法達成全市削減率時，丟出可讀錯誤', () => {
    expect(() => buildDataset({ ...config, cityReductionRate: 90 })).toThrow(/config\.json 設定錯誤/);
  });
});
