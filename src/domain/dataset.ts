import {
  PROJECT_TYPES,
  type Config,
  type ProjectType,
  type ZoneKey,
} from './config';
import { createRng, type Rng } from './rng';

export interface Site {
  /** 例：A-0001（字母代表分區：A 都會、B 發展、C 偏鄉） */
  id: string;
  district: string;
  zone: ZoneKey;
  type: ProjectType;
  /** 污染排放量（公噸 TSP） */
  emission: number;
  /** 污染削減量（公噸 TSP） */
  reduction: number;
  /** 污染削減率（%） */
  rate: number;
}

export interface DistrictSummary {
  name: string;
  zone: ZoneKey;
  zoneLabel: string;
  /** 分區目標（%） */
  target: number;
  density: number;
  manualAdjusted: boolean;
  adjustReason: string | null;
  siteCount: number;
  emission: number;
  reduction: number;
  rate: number;
  underperforming: boolean;
}

export interface Dataset {
  districts: DistrictSummary[];
  sites: Site[];
  city: { emission: number; reduction: number; rate: number };
}

/** 一般工地的工程類型權重（依分區，順序同 PROJECT_TYPES：RC、SRC、拆除、道路、隧道、管線、橋樑、區域開發、疏濬、其他） */
const TYPE_WEIGHTS: Record<ZoneKey, number[]> = {
  metro: [30, 18, 10, 10, 3, 15, 3, 2, 1, 8],
  developing: [25, 10, 8, 15, 2, 14, 6, 8, 4, 8],
  rural: [15, 2, 6, 28, 1, 14, 14, 2, 10, 8],
};

/** 一般工地削減率相對行政區削減率的離散幅度（±%） */
const SITE_RATE_SPREAD = 12;

interface DraftSite {
  district: string;
  zone: ZoneKey;
  type: ProjectType;
  emission: number;
  rate: number;
  large: boolean;
}

/**
 * 依 config 與固定種子產生模擬資料集。
 * 保證：未達標行政區削減率等於設定值、達標區落在分區目標 + compliantMarginRange、
 * 全市削減率等於 cityReductionRate、大規模工程合計占全市排放 shareOfCityEmission%。
 */
export function buildDataset(config: Config): Dataset {
  const rng = createRng(config.seed);

  // 1. 工地與排放量：全市依 Zipf 長尾分布，第 r 名排放量 = topEmission / r^s。
  //    指數 s 由「前 N 大占全市比例」反推；前 N 名為設定的大規模工程（依設定順序），
  //    其餘名次以分層方式分配到各區，使各區內部也依名次平滑遞減、總量與工地數相當。
  const { sites: largeSites, topEmission, shareOfCityEmission } = config.largeProjects;
  const exponent = solveZipfExponent(config.totalSites, largeSites.length, shareOfCityEmission / 100);
  const emissionAt = (rank: number) => topEmission / rank ** exponent;

  const drafts: DraftSite[] = largeSites.map((p, i) => ({
    district: p.district,
    zone: config.districts.find((d) => d.name === p.district)!.zone,
    type: p.type,
    emission: emissionAt(i + 1),
    rate: 0,
    large: true,
  }));

  const siteCounts = allocateSiteCounts(config, rng);
  const slots: { key: number; district: string; zone: ZoneKey }[] = [];
  for (const d of config.districts) {
    const hostsLarge = largeSites.some((p) => p.district === d.name);
    const m = siteCounts.get(d.name)! - largeSites.filter((p) => p.district === d.name).length;
    // 第 k 處一般工地排在全市約 (k + u) / m 的位置；有大規模工程的區 u 較小，接續其大工程之後
    const u = hostsLarge ? rng.uniform(0.55, 0.65) : rng.uniform(0.9, 1.1);
    for (let k = 0; k < m; k++) slots.push({ key: (k + u) / m, district: d.name, zone: d.zone });
  }
  slots
    .sort((a, b) => a.key - b.key)
    .forEach((slot, i) =>
      drafts.push({
        district: slot.district,
        zone: slot.zone,
        type: rng.weighted(PROJECT_TYPES, TYPE_WEIGHTS[slot.zone]),
        emission: emissionAt(largeSites.length + i + 1),
        rate: 0,
        large: false,
      }),
    );

  const emissionOf = (name: string) =>
    drafts.filter((s) => s.district === name).reduce((sum, s) => sum + s.emission, 0);

  // 2. 行政區削減率：未達標區固定；達標區於 [目標+min, 目標+max] 內求解，使全市削減率精確
  const districtRate = solveDistrictRates(config, emissionOf, rng);

  // 3. 工地削減率：大規模工程貼近行政區削減率，一般工地離散；再平移使行政區彙總精確
  for (const d of config.districts) {
    const sites = drafts.filter((s) => s.district === d.name);
    const r = districtRate.get(d.name)!;
    const larges = sites.filter((s) => s.large);
    const smalls = sites.filter((s) => !s.large);
    for (const s of smalls) s.rate = clamp(r + rng.uniform(-SITE_RATE_SPREAD, SITE_RATE_SPREAD), 20, 95);
    for (const s of larges) s.rate = r + rng.uniform(-1.5, 1.5);
    // 有大規模工程的區由大規模工程吸收差額（其排放占比高），否則由一般工地吸收
    const adjust = larges.length > 0 ? larges : smalls;
    const target = r * emissionOf(d.name);
    const current = sites.reduce((sum, s) => sum + s.rate * s.emission, 0);
    const adjustEmission = adjust.reduce((sum, s) => sum + s.emission, 0);
    const delta = (target - current) / adjustEmission;
    for (const s of adjust) s.rate += delta;
  }

  // 4. 工地代號：各分區內隨機排序後編號
  const counters: Record<ZoneKey, number> = { metro: 0, developing: 0, rural: 0 };
  const sites: Site[] = rng.shuffle(drafts).map((s) => ({
    id: `${config.zones[s.zone].code}-${String(++counters[s.zone]).padStart(4, '0')}`,
    district: s.district,
    zone: s.zone,
    type: s.type,
    emission: s.emission,
    reduction: (s.emission * s.rate) / 100,
    rate: s.rate,
  }));

  const districts: DistrictSummary[] = config.districts.map((d) => {
    const own = sites.filter((s) => s.district === d.name);
    const emission = sum(own.map((s) => s.emission));
    const reduction = sum(own.map((s) => s.reduction));
    const rate = (reduction / emission) * 100;
    const zone = config.zones[d.zone];
    return {
      name: d.name,
      zone: d.zone,
      zoneLabel: zone.label,
      target: zone.target,
      density: d.density,
      manualAdjusted: d.manualAdjusted,
      adjustReason: d.adjustReason,
      siteCount: own.length,
      emission,
      reduction,
      rate,
      underperforming: rate < zone.target,
    };
  });

  const cityEmission = sum(sites.map((s) => s.emission));
  const cityReduction = sum(sites.map((s) => s.reduction));
  return {
    districts,
    sites,
    city: { emission: cityEmission, reduction: cityReduction, rate: (cityReduction / cityEmission) * 100 },
  };
}

/** 求 Zipf 指數 s，使 n 個名次中前 top 名的排放量合計占比等於 share（二分法） */
function solveZipfExponent(n: number, top: number, share: number): number {
  const harmonic = (s: number, upTo: number) => {
    let t = 0;
    for (let r = 1; r <= upTo; r++) t += r ** -s;
    return t;
  };
  let lo = 0.5;
  let hi = 4;
  for (let i = 0; i < 60; i++) {
    const s = (lo + hi) / 2;
    if (harmonic(s, top) / harmonic(s, n) < share) lo = s;
    else hi = s;
  }
  return (lo + hi) / 2;
}

/**
 * 各區施工中工地數：先依分區範圍抽樣，再等比調整使全市合計精確等於 totalSites
 *（最大餘數法分配捨入差額）。
 */
function allocateSiteCounts(config: Config, rng: Rng): Map<string, number> {
  const raw = config.districts.map((d) => {
    const [min, max] = config.zones[d.zone].siteCountRange;
    return { name: d.name, n: rng.int(min, max) };
  });
  const scale = config.totalSites / sum(raw.map((r) => r.n));
  const scaled = raw.map((r) => ({ name: r.name, exact: r.n * scale }));
  const counts = new Map(scaled.map((s) => [s.name, Math.floor(s.exact)]));
  const remainder = config.totalSites - sum([...counts.values()]);
  [...scaled]
    .sort((a, b) => (b.exact % 1) - (a.exact % 1))
    .slice(0, remainder)
    .forEach((s) => counts.set(s.name, counts.get(s.name)! + 1));
  return counts;
}

function solveDistrictRates(config: Config, emissionOf: (name: string) => number, rng: Rng) {
  const rates = new Map<string, number>();
  const [lo, hi] = config.compliantMarginRange;
  const compliant: { name: string; e: number; t: number; u: number }[] = [];
  let totalE = 0;
  let fixedReduction = 0;
  for (const d of config.districts) {
    const e = emissionOf(d.name);
    totalE += e;
    const fixed = config.underperformingDistricts[d.name];
    if (fixed !== undefined) {
      rates.set(d.name, fixed);
      fixedReduction += fixed * e;
    } else {
      compliant.push({ name: d.name, e, t: config.zones[d.zone].target, u: rng.uniform(0, 1) });
    }
  }
  // Σ e·(t + lo + λ·u·(hi−lo)) = city·E − fixed  →  解 λ
  const need = config.cityReductionRate * totalE - fixedReduction;
  const base = sum(compliant.map((c) => c.e * (c.t + lo)));
  const spread = sum(compliant.map((c) => c.e * c.u * (hi - lo)));
  const lambda = (need - base) / spread;
  const maxU = Math.max(...compliant.map((c) => c.u));
  if (lambda < 0 || lambda * maxU > 1) {
    throw new Error(
      `config.json 設定錯誤：在目前排放分布下，全市削減率 ${config.cityReductionRate}% 無法由達標區削減率（目標 +${lo}%～+${hi}%）達成，請調整 cityReductionRate 或 largeProjects。`,
    );
  }
  for (const c of compliant) rates.set(c.name, c.t + lo + lambda * c.u * (hi - lo));
  return rates;
}

const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));

/** 優先輔導：削減率低於所在行政區的分區目標 */
export function isPriority(site: Site, district: Pick<DistrictSummary, 'target'>): boolean {
  return site.rate < district.target;
}

/** 依排放量由高至低取前 n 處工地 */
export function topSites<T extends { emission: number }>(sites: T[], n: number): T[] {
  return [...sites].sort((a, b) => b.emission - a.emission).slice(0, n);
}
