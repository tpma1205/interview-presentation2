import type { ReactNode } from 'react';

export function SlideFrame({
  title,
  sub,
  center,
  children,
}: {
  title: string;
  sub?: string;
  /** 內容垂直置中 */
  center?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`slide${center ? ' is-center' : ''}`} data-testid="slide">
      <h1 className="slide-title">
        <span>{title}</span>
        {sub && <span className="sub">{sub}</span>}
      </h1>
      {children}
    </section>
  );
}
