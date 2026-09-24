import type { ReactNode } from 'react';

export interface RouteStop {
  title: string;
  detail?: ReactNode;
}

/** 路線圖：以一條主線串接各站，表示依序推進的階段 */
export function Route({ stops, numbered }: { stops: RouteStop[]; numbered?: boolean }) {
  return (
    <ol className="route" style={{ ['--stops' as string]: stops.length }}>
      {stops.map((s, i) => (
        <li key={s.title} className="route-stop">
          <span className="dot" aria-hidden />
          {numbered && <span className="step">第 {i + 1} 步</span>}
          <h3>{s.title}</h3>
          {s.detail && <p>{s.detail}</p>}
        </li>
      ))}
    </ol>
  );
}
