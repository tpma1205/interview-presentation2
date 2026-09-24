import type { ReactNode } from 'react';

export function SlideFrame({
  num,
  title,
  sub,
  children,
}: {
  num?: number;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section className="slide" data-testid="slide">
      <h1 className="slide-title">
        {num !== undefined && <span className="num">{String(num).padStart(2, '0')}</span>}
        <span>{title}</span>
        {sub && <span className="sub">{sub}</span>}
      </h1>
      {children}
    </section>
  );
}
