import {
  BASIS_BUILDING,
  DOC_BUILDING,
  evaluateDeclaration,
  type Declaration,
} from '../domain/declaration';
import { pct } from '../domain/format';
import { config, districtByName } from '../domain/model';

export interface SimulatorState extends Declaration {
  district: string;
}

export const SCENARIOS: { label: string; value: SimulatorState }[] = [
  {
    label: '未達標區・大規模・房屋建築',
    value: { district: '林口', areaM2: 25000, durationMonths: 30, spoilM3: 8000, contractWan: 35000, needsBuildingPermit: true },
  },
  {
    label: '未達標區・非大規模',
    value: { district: '淡水', areaM2: 4000, durationMonths: 10, spoilM3: 3000, contractWan: 6000, needsBuildingPermit: true },
  },
  {
    label: '達標區・大規模',
    value: { district: '板橋', areaM2: 18000, durationMonths: 24, spoilM3: 15000, contractWan: 60000, needsBuildingPermit: false },
  },
];

const FIELDS: { key: keyof Declaration & ('areaM2' | 'durationMonths' | 'spoilM3' | 'contractWan'); label: string; unit: string; step: number }[] = [
  { key: 'areaM2', label: '工地面積', unit: 'm²', step: 1000 },
  { key: 'durationMonths', label: '工期', unit: '月', step: 1 },
  { key: 'spoilM3', label: '外運土石', unit: 'm³', step: 1000 },
  { key: 'contractWan', label: '合約經費', unit: '萬元', step: 1000 },
];

interface Props {
  state: SimulatorState;
  onChange: (next: SimulatorState) => void;
}

export function Simulator({ state, onChange }: Props) {
  const district = districtByName.get(state.district)!;
  const r = evaluateDeclaration(state, district);
  const set = (patch: Partial<SimulatorState>) => onChange({ ...state, ...patch });
  const [c1, c2, c3] = r.criteria;

  return (
    <div className="sim" data-testid="simulator">
      <div className="scenarios">
        {SCENARIOS.map((s) => (
          <button key={s.label} className="chip-btn" onClick={() => onChange(s.value)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="sim-top">
        <label className="inline-field">
          <span>行政區</span>
          <select value={state.district} onChange={(e) => set({ district: e.target.value })}>
            {config.districts.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-field check">
          <input
            type="checkbox"
            checked={state.needsBuildingPermit}
            onChange={(e) => set({ needsBuildingPermit: e.target.checked })}
          />
          <span>需申請建築執照（房屋建築工程）</span>
        </label>
      </div>
      <div className="sim-form">
        {FIELDS.map((f) => (
          <label className="field" key={f.key}>
            <span>
              {f.label}
              <em>（{f.unit}）</em>
            </span>
            <input
              type="number"
              min={0}
              step={f.step}
              value={state[f.key]}
              aria-label={f.label}
              onChange={(e) => set({ [f.key]: Math.max(0, Number(e.target.value) || 0) })}
            />
          </label>
        ))}
      </div>

      <div className="sim-result" data-testid="sim-result">
        <div className="res-row">
          <span className="res-head">① 行政區未達標</span>
          <Mark ok={district.underperforming} />
          <span>
            {district.name}區削減率 {pct(district.rate)}
            {district.underperforming ? ' < ' : ' ≥ '}
            分區目標 {district.target}%
          </span>
          <span className={`tag ${district.underperforming ? 'alert' : ''}`}>
            {district.underperforming ? '未達標' : '達標'}
          </span>
        </div>
        <div className="res-head">② 大規模工程（符合任一）</div>
        <div className="res-basis">營建工程空氣污染防制設施管理辦法第 18 條</div>
        <div className="res-row sub">
          <Mark ok={c1.met} />
          {c1.label}
        </div>
        <div className="res-row sub">
          <Mark ok={c2.met} />
          {c2.label}
        </div>
        <div className="res-basis">投標廠商資格與特殊或巨額採購認定標準第 8 條</div>
        <div className="res-row sub">
          <Mark ok={c3.met} />
          {c3.label}
        </div>
        <div className="verdict">
          <span className={`pill ${r.isLarge ? 'on' : ''}`} data-testid="verdict-large">
            大規模工程：{r.isLarge ? '是' : '否'}
          </span>
          <span className={`pill ${r.triggered ? 'alert' : ''}`} data-testid="verdict-trigger">
            申報前管制：{r.triggered ? '觸發' : '未觸發'}
          </span>
        </div>
        <div className="docs" data-testid="required-docs">
          {r.triggered ? (
            <>
              <b>應檢附文件</b>
              <ul className="doc-list">
                {r.requiredDocs.map((d) => (
                  <li key={d}>
                    {d}
                    {d === DOC_BUILDING && <span className="muted">（{BASIS_BUILDING.replace('工務局函 ', '')}）</span>}
                  </li>
                ))}
              </ul>
              <div className="muted">未檢附則無法完成申報；清單回傳現場查核專案比對現場布置</div>
            </>
          ) : (
            <div className="muted">
              {r.isLarge ? '行政區已達標，' : '非大規模工程，'}免附應檢附文件，依一般流程申報
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Mark({ ok }: { ok: boolean }) {
  return <span className={`mark ${ok ? 'yes' : 'no'}`}>{ok ? '✓' : '✗'}</span>;
}
