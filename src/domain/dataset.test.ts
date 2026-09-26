import { describe, expect, it } from 'vitest';
import rawConfig from '../data/config.json';
import geo from '../data/new-taipei.geo.json';
import { buildDataset, isPriority, topSites } from './dataset';
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
    expect(district('新莊').rate).toBeCloseTo(61.8, 2);
    expect(district('三重').rate).toBeCloseTo(63.1, 2);
    expect(district('林口').rate).toBeCloseTo(56.5, 2);
    expect(district('淡水').rate).toBeCloseTo(57.2, 2);
  });

  it('其餘 25 區削減率落在分區目標 +1% 至 +10%', () => {
    const others = data.districts.filter((d) => !FAILING.includes(d.name));
    expect(others).toHaveLength(25);
    for (const d of others) {
      expect(d.rate, d.name).toBeGreaterThanOrEqual(d.target + 1 - 1e-9);
      expect(d.rate, d.name).toBeLessThanOrEqual(d.target + 10 + 1e-9);
    }
  });

  it('分區目標：都會 65%、發展 60%、偏鄉 56%；八里、三峽手動調整為發展區', () => {
    expect(district('永和').target).toBe(65);
    expect(district('土城').target).toBe(60);
    expect(district('烏來').target).toBe(56);
    expect(district('八里')).toMatchObject({ zone: 'developing', target: 60, manualAdjusted: true });
    expect(district('三峽')).toMatchObject({ zone: 'developing', target: 60, manualAdjusted: true });
    expect(district('深坑')).toMatchObject({ zone: 'rural', manualAdjusted: false });
  });

  it('全市削減率為 61.5%，高於環境部 115 年目標 56%', () => {
    expect(data.city.rate).toBeCloseTo(61.5, 2);
    expect(data.city.rate).toBeGreaterThan(56);
  });

  it('工程類型僅限 RC、SRC、拆除、道路、隧道、管線、橋樑、區域開發、疏濬、其他', () => {
    const allowed = ['RC', 'SRC', '拆除', '道路', '隧道', '管線', '橋樑', '區域開發', '疏濬', '其他'];
    for (const s of data.sites) expect(allowed).toContain(s.type);
  });

  it('全市前 10 大工程合計約占總排放 80%，且位於指定行政區', () => {
    const top = topSites(data.sites, 10);
    const share = top.reduce((s, x) => s + x.emission, 0) / data.city.emission;
    expect(share).toBeGreaterThan(0.78);
    expect(share).toBeLessThan(0.82);
    const byDistrict = top.map((s) => s.district).sort();
    expect(byDistrict).toEqual(['三重', '中和', '土城', '新店', '新莊', '林口', '林口', '板橋', '淡水', '淡水'].sort());
  });

  it('全市排放量為平滑長尾：第 10 名之後逐名遞減，沒有斷層', () => {
    const sorted = data.sites.map((s) => s.emission).sort((a, b) => b - a);
    // 第 10→11 名與之後任兩名之間的落差都不大於 Zipf（指數約 1.5）本身的遞減幅度
    for (let r = 10; r < sorted.length; r++) {
      expect(sorted[r] / sorted[r - 1], `第 ${r} → ${r + 1} 名`).toBeGreaterThan(0.8);
    }
    // 前 3 名符合 Zipf：第 1 名約為第 2 名的 2.9 倍（2^1.5 ≈ 2.8）
    expect(sorted[0] / sorted[1]).toBeGreaterThan(2.5);
    expect(sorted[0] / sorted[1]).toBeLessThan(3.2);
  });

  it('各行政區內的工地排放量平滑遞減（大規模工程之後不出現斷層）', () => {
    const largeCount = new Map<string, number>();
    for (const p of config.largeProjects.sites) largeCount.set(p.district, (largeCount.get(p.district) ?? 0) + 1);
    for (const d of data.districts) {
      const own = data.sites
        .filter((s) => s.district === d.name)
        .map((s) => s.emission)
        .sort((a, b) => b - a);
      // 一般工地（排在該區大規模工程之後）的前 10 名，相鄰比值接近 Zipf 第 1→2 名的比值（約 0.34），
      // 允許分層抽樣誤差；原本的斷層比值約 0.02–0.09
      const small = own.slice(largeCount.get(d.name) ?? 0, (largeCount.get(d.name) ?? 0) + 10);
      for (let k = 1; k < small.length; k++) {
        expect(small[k] / small[k - 1], `${d.name} 第 ${k} → ${k + 1} 名`).toBeGreaterThan(0.25);
      }
    }
  });

  it('各區總排放量與工地數量級相符：都會區 > 發展區 > 偏鄉區（不含前 10 大工程）', () => {
    const top10 = new Set(topSites(data.sites, 10).map((s) => s.id));
    const smallTotal = (name: string) =>
      data.sites.filter((s) => s.district === name && !top10.has(s.id)).reduce((t, s) => t + s.emission, 0);
    const avg = (zone: string) => {
      const ds = data.districts.filter((d) => d.zone === zone);
      return ds.reduce((t, d) => t + smallTotal(d.name), 0) / ds.length;
    };
    expect(avg('metro')).toBeGreaterThan(avg('developing'));
    expect(avg('developing')).toBeGreaterThan(avg('rural'));
    // 同分區內，每處工地平均排放量與分區平均同量級（0.4–2.5 倍），總量隨工地數增減
    for (const zone of ['metro', 'developing', 'rural']) {
      const ds = data.districts.filter((d) => d.zone === zone);
      const perSite = ds.map((d) => smallTotal(d.name) / d.siteCount);
      const mean = perSite.reduce((t, x) => t + x, 0) / perSite.length;
      ds.forEach((d, i) => {
        expect(perSite[i] / mean, `${d.name} 每處平均排放`).toBeGreaterThan(0.4);
        expect(perSite[i] / mean, `${d.name} 每處平均排放`).toBeLessThan(2.5);
      });
    }
  });

  it('全市施工中工地共 4,200 處', () => {
    expect(data.sites).toHaveLength(4200);
    expect(data.districts.reduce((s, d) => s + d.siteCount, 0)).toBe(4200);
  });

  it('各區工地數依分區合理分布：都會約 240–360、發展約 140–220、偏鄉約 15–45 處', () => {
    // 抽樣後等比調整為全市總數，容許 5% 偏差
    const range = { metro: [240, 360], developing: [140, 220], rural: [15, 45] } as const;
    for (const d of data.districts) {
      const [min, max] = range[d.zone];
      expect(d.siteCount, d.name).toBeGreaterThanOrEqual(Math.floor(min * 0.95));
      expect(d.siteCount, d.name).toBeLessThanOrEqual(Math.ceil(max * 1.05));
    }
  });

  it('未達標 4 區的 TOP 10 工地中，至少 3 處削減率低於分區目標（優先輔導）', () => {
    for (const name of FAILING) {
      const d = district(name);
      const top = topSites(data.sites.filter((s) => s.district === name), 10);
      expect(top).toHaveLength(10);
      expect(top.filter((s) => isPriority(s, d)).length, name).toBeGreaterThanOrEqual(3);
    }
  });

  it('工地代號為分區字母 + 四位流水號，且不重複', () => {
    const letter = { metro: 'A', developing: 'B', rural: 'C' } as const;
    for (const s of data.sites) {
      expect(s.id.startsWith(`${letter[s.zone]}-`)).toBe(true);
      expect(s.id).toMatch(/^[ABC]-\d{4}$/);
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
    expect(() => buildDataset({ ...config, cityReductionRate: 80 })).toThrow(/config\.json 設定錯誤/);
  });
});
