/** 申報前管制規則（簡報第 2、6 頁引用的文字與法規依據） */

export const DOC_POLLUTION_CONTROL = '污染防制設備清單';
export const DOC_BUILDING = '空氣污染、噪音及監測設備清單';
export const BASIS_BUILDING = '工務局函 北工施字第1121953044號';

const BASIS_AIR = '營建工程空氣污染防制設施管理辦法第 18 條';
const BASIS_PROCUREMENT = '投標廠商資格與特殊或巨額採購認定標準第 8 條';

/** 大規模工程：符合任一條件即成立，門檻一律含等於 */
export const LARGE_PROJECT_CRITERIA = [
  { label: '工地面積 ≥ 1 萬 m² 且工期 ≥ 1 年', basis: BASIS_AIR },
  { label: '外運土石（鬆方）≥ 1 萬 m³', basis: BASIS_AIR },
  { label: '合約經費 ≥ 2 億元', basis: BASIS_PROCUREMENT },
] as const;
