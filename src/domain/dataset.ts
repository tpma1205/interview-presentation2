import {
  PROJECT_TYPES,
  type Config,
  type ProjectType,
  type ZoneKey,
} from './config';
import { createRng, type Rng } from './rng';

export interface Site {
  /** 例：A-001（字母代表分區：A 都會、B 發展、C 偏鄉） */
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

/** 一般工地的工程類型權重（依分區） */
const TYPE_WEIGHTS: Record<ZoneKey, number[]> = {
  metro: [50, 15, 5, 3, 20, 7],
  developing: [40, 20, 3, 7, 18, 12],
  rural: [20, 30, 0, 0, 20, 30],
};

/** 一般工地的排放規模係數（依分區） */
const ZONE_SCALE: Record<ZoneKey, number> = { metro: 1, developing: 0.8, rural: 0.35 };

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

  // 1. 工地與排放量
  const drafts: DraftSite[] = [];
  const largeTotal = config.largeProjects.sites.reduce((s, p) => s + p.emission, 0);
  const share = config.largeProjects.shareOfCityEmission / 100;
  const smallTotal = (largeTotal * (1 - share)) / share;

  const smallWeights: number[] = [];
  for (const d of config.districts) {
    const zone = config.zones[d.zone];
    const larges = config.largeProjects.sites.filter((p) => p.district === d.name);
    const count = rng.int(zone.siteCountRange[0], zone.siteCountRange[1]);
    for (const p of larges) {
      drafts.push({ district: d.name, zone: d.zone, type: p.type, emission: p.emission, rate: 0, large: true });
    }
    for (let i = larges.length; i < count; i++) {
      drafts.push({
        district: d.name,
        zone: d.zone,
        type: rng.weighted(PROJECT_TYPES, TYPE_WEIGHTS[d.zone]),
        emission: 0,
        rate: 0,
        large: false,
      });
      smallWeights.push(ZONE_SCALE[d.zone] * Math.exp(rng.normal() * 0.9));
    }
  }
  const weightSum = smallWeights.reduce((s, w) => s + w, 0);
  let wi = 0;
  for (const s of drafts) {
    if (!s.large) s.emission = (smallWeights[wi++] / weightSum) * smallTotal;
  }

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
    id: `${config.zones[s.zone].code}-${String(++counters[s.zone]).padStart(3, '0')}`,
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

/** 依排放量由高至低取前 n 處工地 */
export function topSites<T extends { emission: number }>(sites: T[], n: number): T[] {
  return [...sites].sort((a, b) => b.emission - a.emission).slice(0, n);
}
