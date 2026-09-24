import { scaleLog, scalePoint } from 'd3-scale';
import type { ZoneKey } from '../domain/config';
import { int } from '../domain/format';
import { config } from '../domain/model';
import { SlideFrame } from './SlideFrame';

const W = 1270;
const H = 520;
const M = { top: 16, right: 20, bottom: 70, left: 112 };

const ZONE_COLOR: Record<ZoneKey, string> = {
  metro: 'var(--primary)',
  developing: 'var(--primary-mid)',
  rural: '#b7c4c7',
};

const ZONE_ORDER: Record<ZoneKey, number> = { metro: 0, developing: 1, rural: 2 };

/** 依人口密度排序（同密度時分區較高者在前，如八里排在深坑前） */
const sorted = [...config.districts].sort(
  (a, b) => b.density - a.density || ZONE_ORDER[a.zone] - ZONE_ORDER[b.zone],
);

export function Appendix({ returnPage, onBack }: { returnPage: number; onBack: () => void }) {
  const x = scalePoint<string>()
    .domain(sorted.map((d) => d.name))
    .range([M.left, W - M.right])
    .padding(0.5);
  const y = scaleLog()
    .domain([10, 50000])
    .range([H - M.bottom, M.top]);
  const ticks = [10, 100, 1000, 10000];
  const thresholds = [
    { v: config.zones.metro.minDensity, label: `${int(config.zones.metro.minDensity)}：都會區門檻` },
    { v: config.zones.developing.minDensity, label: `${int(config.zones.developing.minDensity)}：發展區／偏鄉區門檻` },
  ];
  const adjusted = sorted.filter((d) => d.manualAdjusted);

  return (
    <SlideFrame title="附錄" sub="人口密度分區圖">
      <button className="back-btn appendix-back" onClick={onBack}>
        ← 返回第 {returnPage} 頁
      </button>
      <div className="chart-card card">
        <svg width={W} height={H} role="img" aria-label="行政區人口密度（對數刻度）與分區門檻" data-testid="density-chart">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className="grid-line" />
              <text x={M.left - 12} y={y(t)} className="axis-text" textAnchor="end" dy="0.35em">
                {int(t)}
              </text>
            </g>
          ))}
          <text className="axis-text" transform={`translate(18 ${(H - M.bottom + M.top) / 2}) rotate(-90)`} textAnchor="middle">
            人口密度（人/km²，對數刻度）
          </text>
          {thresholds.map((t) => (
            <g key={t.v} data-testid="threshold">
              <line x1={M.left} x2={W - M.right} y1={y(t.v)} y2={y(t.v)} className="threshold-line" />
              <text x={M.left + 8} y={y(t.v) - 8} className="threshold-text">
                {t.label}
              </text>
            </g>
          ))}
          {sorted.map((d) => {
            const cx = x(d.name)!;
            const cy = y(d.density);
            return (
              <g key={d.name} data-district={d.name} data-zone={d.zone}>
                <line x1={cx} x2={cx} y1={H - M.bottom} y2={cy} className="stem" />
                {d.manualAdjusted ? (
                  <rect
                    x={cx - 10}
                    y={cy - 10}
                    width={20}
                    height={20}
                    transform={`rotate(45 ${cx} ${cy})`}
                    fill={ZONE_COLOR[d.zone]}
                    className="dot adjusted"
                  />
                ) : (
                  <circle cx={cx} cy={cy} r={9} fill={ZONE_COLOR[d.zone]} className="dot" />
                )}
                <text x={cx} y={H - M.bottom + 24} className="axis-text" textAnchor="middle">
                  {[...d.name].map((ch, i) => (
                    <tspan key={i} x={cx} dy={i === 0 ? 0 : 22}>
                      {ch}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
          {adjusted.map((d, i) => {
            const cx = x(d.name)!;
            const cy = y(d.density);
            // 註記框放在圖右上方空白處，引線由點向上再水平接到框左緣
            const bx = 840;
            const by = 16 + i * 104;
            const ly = by + 48;
            const [line1, line2] = splitReason(d.adjustReason ?? '');
            return (
              <g key={d.name} className="callout" data-testid="callout">
                <path d={`M ${cx} ${cy - 14} L ${cx} ${ly} L ${bx} ${ly}`} className="leader" />
                <rect x={bx} y={by} width={410} height={96} rx={8} className="callout-box" />
                <text x={bx + 14} y={by + 28} className="callout-title">
                  {d.name}：偏鄉區 → 發展區
                </text>
                <text x={bx + 14} y={by + 56} className="callout-text">
                  {line1}
                </text>
                <text x={bx + 14} y={by + 82} className="callout-text">
                  {line2}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="chart-legend">
          {(['metro', 'developing', 'rural'] as const).map((z) => (
            <span key={z}>
              <i className="dot-sw" style={{ background: ZONE_COLOR[z] }} />
              {config.zones[z].label}（目標 {config.zones[z].target}%）
            </span>
          ))}
          <span>
            <i className="diamond-sw" />
            手動調整
          </span>
          <span className="sim-tag">數據為模擬示意</span>
        </div>
      </div>
    </SlideFrame>
  );
}

/** 調整理由於第一個「，」後換行 */
function splitReason(reason: string): [string, string] {
  const i = reason.indexOf('，');
  return i < 0 ? [reason, ''] : [reason.slice(0, i + 1), reason.slice(i + 1)];
}
