import type { ReactNode } from 'react';

export function SlideFrame({
  num,
  title,
  sub,
  center,
  children,
}: {
  num?: number;
  title: string;
  sub?: string;
  /** 內容垂直置中 */
  center?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`slide${center ? " is-center" : ""}`} data-testid="slide">
      <h1 className="slide-title">
        {num !== undefined && <span className="num">{String(num).padStart(2, '0')}</span>}
        <span>{title}</span>
        {sub && <span className="sub">{sub}</span>}
      </h1>
      {children}
    </section>
  );
}
