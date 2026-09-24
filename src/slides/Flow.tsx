import type { ReactNode } from 'react';

export interface FlowStep {
  title: string;
  detail?: ReactNode;
  highlight?: boolean;
}

/** 以箭頭串接的階段流程圖 */
export function Flow({ steps, direction = 'row' }: { steps: FlowStep[]; direction?: 'row' | 'column' }) {
  return (
    <ol className={`flow flow-${direction}`}>
      {steps.map((s, i) => (
        <li key={s.title} className={`flow-step${s.highlight ? ' is-highlight' : ''}`}>
          <span className="flow-no">{i + 1}</span>
          <div className="flow-body">
            <div className="flow-title">{s.title}</div>
            {s.detail && <div className="flow-detail">{s.detail}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
