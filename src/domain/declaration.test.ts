import { describe, expect, it } from 'vitest';
import { evaluateDeclaration, type Declaration } from './declaration';

const UNDER = { name: '新莊', rate: 66.8, target: 70, underperforming: true };
const OK = { name: '板橋', rate: 71.4, target: 70, underperforming: false };
const large: Partial<Declaration> = { areaM2: 15000, durationMonths: 18 };

const small: Declaration = {
  areaM2: 3000,
  durationMonths: 8,
  spoilM3: 2000,
  contractWan: 5000,
  needsBuildingPermit: false,
};

describe('申報判定', () => {
  it('未達標區 × 大規模工程 × 房屋建築工程 → 觸發，應檢附兩份清單', () => {
    const r = evaluateDeclaration({ ...small, areaM2: 15000, durationMonths: 18, needsBuildingPermit: true }, UNDER);
    expect(r.isLarge).toBe(true);
    expect(r.triggered).toBe(true);
    expect(r.requiredDocs).toEqual(['污染防制設備清單', '空氣污染、噪音及監測設備清單']);
  });

  it.each([
    // [行政區, 大規模, 房屋建築, 觸發, 應檢附文件]
    ['未達標', true, true, true, ['污染防制設備清單', '空氣污染、噪音及監測設備清單']],
    ['未達標', true, false, true, ['污染防制設備清單']],
    ['未達標', false, true, false, []],
    ['未達標', false, false, false, []],
    ['達標', true, true, false, []],
    ['達標', true, false, false, []],
    ['達標', false, true, false, []],
    ['達標', false, false, false, []],
  ] as const)('%s區 × 大規模=%s × 房屋建築=%s → 觸發=%s', (zone, isLarge, building, triggered, docs) => {
    const input = { ...small, ...(isLarge ? large : {}), needsBuildingPermit: building };
    const r = evaluateDeclaration(input, zone === '未達標' ? UNDER : OK);
    expect(r.isLarge).toBe(isLarge);
    expect(r.districtUnderperforming).toBe(zone === '未達標');
    expect(r.triggered).toBe(triggered);
    expect(r.requiredDocs).toEqual(docs);
  });

  describe('大規模工程條件（符合任一即成立，門檻含等於）', () => {
    const judge = (patch: Partial<Declaration>) => evaluateDeclaration({ ...small, ...patch }, UNDER);

    it('面積 10,000 m² 且工期 12 個月恰好成立', () => {
      expect(judge({ areaM2: 10000, durationMonths: 12 }).isLarge).toBe(true);
    });
    it('面積 9,999 m² 或工期 11 個月不成立', () => {
      expect(judge({ areaM2: 9999, durationMonths: 24 }).isLarge).toBe(false);
      expect(judge({ areaM2: 50000, durationMonths: 11 }).isLarge).toBe(false);
    });
    it('外運土石 10,000 m³ 成立、9,999 m³ 不成立', () => {
      expect(judge({ spoilM3: 10000 }).isLarge).toBe(true);
      expect(judge({ spoilM3: 9999 }).isLarge).toBe(false);
    });
    it('合約經費 20,000 萬元（2 億）成立、19,999 萬元不成立', () => {
      expect(judge({ contractWan: 20000 }).isLarge).toBe(true);
      expect(judge({ contractWan: 19999 }).isLarge).toBe(false);
    });
    it('逐條列出三項條件與法規依據', () => {
      const r = judge({ spoilM3: 12000 });
      expect(r.criteria.map((c) => c.met)).toEqual([false, true, false]);
      expect(r.criteria[0].basis).toContain('營建工程空氣污染防制設施管理辦法第 18 條');
      expect(r.criteria[1].basis).toContain('營建工程空氣污染防制設施管理辦法第 18 條');
      expect(r.criteria[2].basis).toContain('投標廠商資格與特殊或巨額採購認定標準第 8 條');
    });
  });
});
