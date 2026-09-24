export type ZoneKey = 'metro' | 'developing' | 'rural';

export const ZONE_KEYS: ZoneKey[] = ['metro', 'developing', 'rural'];

export const PROJECT_TYPES = [
  '建築（RC/SRC）',
  '道路／隧道',
  '捷運／軌道',
  '區段徵收／重劃',
  '管線',
  '橋梁／水利',
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

/** 需申請建築執照的工程類型（房屋建築工程） */
export const BUILDING_PROJECT_TYPE: ProjectType = '建築（RC/SRC）';

export interface Zone {
  label: string;
  code: string;
  /** 分區目標（%） */
  target: number;
  densityRule: string;
  minDensity: number;
  siteCountRange: [number, number];
}

export interface DistrictConfig {
  name: string;
  density: number;
  zone: ZoneKey;
  manualAdjusted: boolean;
  adjustReason: string | null;
}

export interface LargeProjectConfig {
  district: string;
  type: ProjectType;
  /** 相對排放權重（公噸），最終會縮放至占全市約 shareOfCityEmission% */
  emission: number;
}

export interface Config {
  year: number;
  seed: number;
  moenvTargets: Record<string, number>;
  zones: Record<ZoneKey, Zone>;
  districts: DistrictConfig[];
  /** 未達標行政區 → 指定削減率（%） */
  underperformingDistricts: Record<string, number>;
  /** 達標行政區削減率 = 分區目標 + [min, max]（%） */
  compliantMarginRange: [number, number];
  /** 全市削減率（%） */
  cityReductionRate: number;
  largeProjects: { shareOfCityEmission: number; sites: LargeProjectConfig[] };
  estimatedTriggerCases: number;
}

/** 驗證手動編輯的 config，錯誤時丟出可讀訊息 */
export function parseConfig(raw: unknown): Config {
  const c = raw as Config;
  const names = new Set(c.districts.map((d) => d.name));
  const fail = (msg: string) => {
    throw new Error(`config.json 設定錯誤：${msg}`);
  };
  if (names.size !== c.districts.length) fail('行政區名稱重複');
  for (const d of c.districts) {
    if (!ZONE_KEYS.includes(d.zone)) fail(`${d.name} 的 zone「${d.zone}」不存在`);
    if (d.manualAdjusted && !d.adjustReason) fail(`${d.name} 為手動調整但缺少 adjustReason`);
  }
  for (const [name, rate] of Object.entries(c.underperformingDistricts)) {
    const d = c.districts.find((x) => x.name === name);
    if (!d) fail(`underperformingDistricts 中的「${name}」不在 districts`);
    else if (rate >= c.zones[d.zone].target) fail(`${name} 削減率 ${rate}% 未低於分區目標`);
  }
  for (const s of c.largeProjects.sites) {
    if (!names.has(s.district)) fail(`largeProjects 中的「${s.district}」不在 districts`);
    if (!PROJECT_TYPES.includes(s.type)) fail(`工程類型「${s.type}」不存在`);
  }
  return c;
}
