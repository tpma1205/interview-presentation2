/** 新申報工程的申報資料 */
export interface Declaration {
  /** 工地面積（m²） */
  areaM2: number;
  /** 工期（月） */
  durationMonths: number;
  /** 外運土石體積（m³，鬆方） */
  spoilM3: number;
  /** 合約經費（萬元） */
  contractWan: number;
  /** 是否需申請建築執照（房屋建築工程） */
  needsBuildingPermit: boolean;
}

export interface DistrictStatus {
  name: string;
  rate: number;
  target: number;
  underperforming: boolean;
}

export interface Criterion {
  label: string;
  met: boolean;
  basis: string;
}

export interface Judgement {
  /** 大規模工程三項條件（符合任一即成立） */
  criteria: Criterion[];
  isLarge: boolean;
  districtUnderperforming: boolean;
  triggered: boolean;
  requiredDocs: string[];
}

export const THRESHOLDS = {
  areaM2: 10_000,
  durationMonths: 12,
  spoilM3: 10_000,
  /** 2 億元 */
  contractWan: 20_000,
} as const;

export const DOC_POLLUTION_CONTROL = '污染防制設備清單';
export const DOC_BUILDING = '空氣污染、噪音及監測設備清單';

const BASIS_AIR = '營建工程空氣污染防制設施管理辦法第 18 條';
const BASIS_PROCUREMENT = '投標廠商資格與特殊或巨額採購認定標準第 8 條';
export const BASIS_BUILDING = '工務局函 北工施字第1121953044號';

/**
 * 申報前管制判定：行政區未達標 且 為大規模工程 → 觸發，須檢附污染防制設備清單；
 * 房屋建築工程另加交空氣污染、噪音及監測設備清單。門檻一律以「≥」判定。
 */
export function evaluateDeclaration(input: Declaration, district: DistrictStatus): Judgement {
  const criteria: Criterion[] = [
    {
      label: '工地面積 ≥ 1 萬 m² 且工期 ≥ 1 年',
      met: input.areaM2 >= THRESHOLDS.areaM2 && input.durationMonths >= THRESHOLDS.durationMonths,
      basis: BASIS_AIR,
    },
    {
      label: '外運土石（鬆方）≥ 1 萬 m³',
      met: input.spoilM3 >= THRESHOLDS.spoilM3,
      basis: BASIS_AIR,
    },
    {
      label: '合約經費 ≥ 2 億元',
      met: input.contractWan >= THRESHOLDS.contractWan,
      basis: BASIS_PROCUREMENT,
    },
  ];
  const isLarge = criteria.some((c) => c.met);
  const triggered = isLarge && district.underperforming;
  const requiredDocs = triggered
    ? [DOC_POLLUTION_CONTROL, ...(input.needsBuildingPermit ? [DOC_BUILDING] : [])]
    : [];
  return { criteria, isLarge, districtUnderperforming: district.underperforming, triggered, requiredDocs };
}
