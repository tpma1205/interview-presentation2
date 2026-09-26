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

interface SopEdge {
  d: string;
  label?: string;
  lx?: number;
  ly?: number;
  /** 標籤對齊：預設 start */
  anchor?: 'start' | 'middle' | 'end';
  /** 流程終點說明（無節點，只有箭頭與文字） */
  terminal?: boolean;
  /** 分岔前的主幹，不畫箭頭 */
  trunk?: boolean;
}

/**
 * 流程圖座標（設計畫布 px）。泳道依負責單位由上而下：現場查核、系統平台、申報審查；
 * 欄 A–E 由左至右。節點中心：第 1 道 y=70、第 2 道 y=225、第 3 道 y=405。
 */
const COL = { A: 110, B: 348, C: 586, D: 824, E: 1062 };
const W = 184;
const mid = (x: number) => x + W / 2;
const LANES = [
  { label: '現場查核', top: 0 },
  { label: '系統平台', top: 140 },
  { label: '申報審查', top: 320 },
];
/** 判斷菱形較欄寬寬，左右各外擴 8px */
const DW = 200;
const dx = (x: number) => x - (DW - W) / 2;

const NODES: SopNode[] = [
  // 現場查核
  { id: 'field', x: COL.A, y: 30, w: W, h: 80, title: '現場查核' },
  { id: 'coach', x: COL.E, y: 30, w: W, h: 80, title: '優先輔導' },
  // 系統平台
  { id: 'db', x: COL.A, y: 175, w: W, h: 100, title: '資料庫', sub: 'MS SQL Server' },
  { id: 'sql', x: COL.B, y: 175, w: W, h: 100, title: 'SQL 即時運算' },
  { id: 'dash', x: COL.C, y: 175, w: W, h: 100, title: '儀表板' },
  { id: 'district', x: dx(COL.D), y: 160, w: DW, h: 130, title: '行政區削減率\n< 分區目標？', kind: 'decision' },
  { id: 'status', x: COL.E, y: 175, w: W, h: 100, title: '行政區管制狀態', sub: '申報前管制啟動中', kind: 'alert' },
  // 申報審查
  { id: 'lists', x: COL.B, y: 365, w: W, h: 80, title: '優良工地評選／\nIoT 前期名單' },
  { id: 'docs', x: COL.C, y: 365, w: W, h: 80, title: '新增申報審查文件', kind: 'alert' },
  { id: 'large', x: dx(COL.D), y: 340, w: DW, h: 130, title: '未達標區且\n大規模工程？', kind: 'decision' },
  { id: 'declare', x: COL.E, y: 365, w: W, h: 80, title: '新申報案件' },
];

/** 菱形頂點 */
const D1 = { top: 160, mid: 225, bottom: 290, left: dx(COL.D), right: dx(COL.D) + DW };
const D2 = { top: 340, mid: 405, bottom: 470, left: dx(COL.D), right: dx(COL.D) + DW };
/** 「已檢附」往現場查核的折線走 B、C 欄之間的空隙 */
const GAP_BC = (COL.B + W + COL.C) / 2;
/** 「已檢附」主幹自新增申報審查文件頂端上行至此高度後，於 GAP_BC 分岔 */
const ATTACHED_Y = 335;
const BRANCH = { x: GAP_BC, y: ATTACHED_Y };
/** 兩條回到「現場查核」的連線分別接在節點右側上、下方，避免重疊 */
const FIELD_IN = { fromCoach: 50, fromDocs: 90 };

const EDGES: SopEdge[] = [
  { d: `M ${mid(COL.A)} 110 V 175`, label: '查核紀錄', lx: mid(COL.A) + 10, ly: 150 },
  { d: `M ${COL.A + W} 225 H ${COL.B}` },
  { d: `M ${COL.B + W} 225 H ${COL.C}` },
  { d: `M ${COL.C + W} 225 H ${D1.left}` },
  { d: `M ${D1.right} 225 H ${COL.E}`, label: '是', lx: D1.right + 8, ly: 214 },
  { d: `M ${mid(COL.D)} ${D1.top} V 115`, label: '否：持續監測', lx: mid(COL.D), ly: 100, anchor: 'middle', terminal: true },
  { d: `M ${mid(COL.E)} 175 V 110`, label: '優先輔導名單', lx: mid(COL.E) - 8, ly: 148, anchor: 'end' },
  {
    d: `M ${mid(COL.E)} 275 V 330 H ${mid(COL.D)} V ${D2.top}`,
    label: '讀取管制狀態',
    lx: D2.right + 8,
    ly: 352,
  },
  { d: `M ${COL.E} ${D2.mid} H ${D2.right}` },
  { d: `M ${D2.left} ${D2.mid} H ${COL.C + W}`, label: '是', lx: D2.left - 8, ly: 396, anchor: 'end' },
  { d: `M ${mid(COL.D)} ${D2.bottom} V 495`, label: '否：一般申報', lx: mid(COL.D), ly: 520, anchor: 'middle', terminal: true },
  {
    d: `M ${mid(COL.C)} 445 V 480`,
    label: '未檢附：補件，無法完成申報',
    lx: mid(COL.C),
    ly: 505,
    anchor: 'middle',
    terminal: true,
  },
  // 已檢附：主幹（無箭頭）後分成兩條
  { d: `M ${mid(COL.C)} 365 V ${ATTACHED_Y} H ${BRANCH.x}`, label: '已檢附', lx: mid(COL.C) + 8, ly: 358, trunk: true },
  {
    d: `M ${BRANCH.x} ${BRANCH.y} V ${FIELD_IN.fromDocs} H ${COL.A + W}`,
    label: '設備清單（現場比對依據）',
    lx: GAP_BC + 8,
    ly: 130,
  },
  { d: `M ${BRANCH.x} ${BRANCH.y} H ${mid(COL.B)} V 365` },
  { d: `M ${COL.E} ${FIELD_IN.fromCoach} H ${COL.A + W}` },
];

export function Slide6Tech() {
  return (
    <SlideFrame title="技術規格、技術架構">
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
          </defs>
          {EDGES.map((e) => (
            <path key={e.d} d={e.d} className="sop-edge" markerEnd={e.trunk ? undefined : 'url(#arrow)'} />
          ))}
          <circle cx={BRANCH.x} cy={BRANCH.y} r={4} className="sop-junction" data-testid="attached-branch" />          {EDGES.filter((e) => e.label).map((e) => (
            <text
              key={`${e.d}-label`}
              x={e.lx}
              y={e.ly}
              textAnchor={e.anchor ?? 'start'}
              className={`sop-edge-label${e.terminal ? ' is-terminal' : ''}`}
            >
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
            <b>{n.title}</b>
            {n.sub && <span className="text">{n.sub}</span>}
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
