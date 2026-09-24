import { SlideFrame } from './SlideFrame';

interface SopNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  kind?: 'decision' | 'alert';
}

/** 流程圖座標（設計畫布 px）；欄 A–D 依資料流由左至右，泳道由上至下 */
const COL = { A: 100, B: 360, C: 620, D: 880 };
const W = 210;
const LANES = [
  { label: '資料來源', top: 0 },
  { label: '分析運用', top: 130 },
  { label: '判斷邏輯', top: 250 },
];

const NODES: SopNode[] = [
  { id: 'audit', x: COL.A, y: 18, w: W, h: 94, title: '現場查核專案', sub: '依環境部查核與計算\n方法產出查核紀錄' },
  { id: 'db', x: COL.B, y: 18, w: W, h: 94, title: '資料庫', sub: 'MS SQL Server\n查核紀錄入庫' },
  { id: 'declare', x: COL.D, y: 18, w: W, h: 94, title: '新申報案件', sub: '業者於申報系統\n提出工程申報' },
  { id: 'sql', x: COL.B, y: 146, w: W, h: 88, title: 'SQL 即時運算', sub: '工地彙總為\n行政區削減率' },
  { id: 'dash', x: COL.C, y: 146, w: W, h: 88, title: '儀錶板', sub: '地圖上色、\nTOP 10 工地' },
  { id: 'district', x: COL.C, y: 266, w: W, h: 70, title: '行政區削減率\n< 分區目標？', kind: 'decision' },
  { id: 'large', x: COL.D, y: 266, w: W, h: 70, title: '大規模工程？', kind: 'decision' },
  { id: 'control', x: COL.C, y: 382, w: W, h: 104, title: '申報前管制啟動中', sub: 'TOP 10 低於目標者\n列優先輔導', kind: 'alert' },
  { id: 'docs', x: COL.D, y: 382, w: W, h: 104, title: '須檢附設備清單', sub: '房屋建築另附空污、\n噪音、監測設備清單', kind: 'alert' },
  { id: 'compare', x: COL.A, y: 382, w: W, h: 104, title: '現場比對', sub: '清單回傳查核專案，\n比對實際布置' },
];

const mid = (a: number) => a + W / 2;

/** 連線：折線座標、標籤位置、是否為回饋虛線 */
const EDGES: { d: string; label?: string; lx?: number; ly?: number; loop?: boolean }[] = [
  { d: `M ${COL.A + W} 65 H ${COL.B}`, label: '入庫', lx: COL.A + W + 5, ly: 92 },
  { d: `M ${mid(COL.B)} 112 V 146` },
  { d: `M ${COL.B + W} 190 H ${COL.C}` },
  { d: `M ${mid(COL.C)} 234 V 266` },
  { d: `M ${mid(COL.C)} 336 V 382`, label: '是', lx: mid(COL.C) + 10, ly: 366 },
  { d: `M ${COL.C + W} 301 H ${COL.D}`, label: '是', lx: COL.C + W + 12, ly: 292 },
  { d: `M ${COL.C} 301 H ${COL.B + W - 60}`, label: '否：持續監測', lx: COL.B + 24, ly: 308 },
  { d: `M ${mid(COL.D)} 112 V 266`, label: '送出申報', lx: mid(COL.D) + 10, ly: 196 },
  { d: `M ${mid(COL.D)} 336 V 382`, label: '是', lx: mid(COL.D) + 10, ly: 366 },
  { d: `M ${COL.D + W} 301 H ${COL.D + W + 40}`, label: '否：一般申報', lx: COL.D + W + 46, ly: 308 },
  { d: `M ${mid(COL.D)} 486 V 520 H ${mid(COL.A)} V 486`, label: '清單回傳', lx: mid(COL.B) - 40, ly: 512 },
  { d: `M ${mid(COL.A)} 382 V 112`, label: '比對結果回饋', lx: mid(COL.A) + 12, ly: 250, loop: true },
];

export function Slide6Tech() {
  return (
    <SlideFrame title="技術規格、技術架構" sub="SOP 流程圖">
      <div className="sop" data-testid="sop">
        {LANES.map((l) => (
          <div key={l.label} className="sop-lane" style={{ top: l.top }}>
            <span>{l.label}</span>
          </div>
        ))}
        <svg width="1254" height="540" aria-hidden>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-2)" />
            </marker>
            <marker id="arrow-loop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary-2)" />
            </marker>
          </defs>
          {EDGES.map((e) => (
            <path
              key={e.d}
              d={e.d}
              className={`sop-edge${e.loop ? ' is-loop' : ''}`}
              markerEnd={`url(#${e.loop ? 'arrow-loop' : 'arrow'})`}
            />
          ))}
          {EDGES.filter((e) => e.label).map((e) => (
            <text key={`${e.d}-label`} x={e.lx} y={e.ly} className="sop-edge-label">
              {e.label}
            </text>
          ))}
        </svg>
        {NODES.map((n) => (
          <div
            key={n.id}
            className={`sop-node${n.kind ? ` is-${n.kind}` : ''}`}
            data-node={n.id}
            style={{ left: n.x, top: n.y, width: n.w, height: n.h }}
          >
            <b style={{ whiteSpace: 'pre-line' }}>{n.title}</b>
            {n.sub && <span className="text">{n.sub}</span>}
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
