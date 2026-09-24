import { useEffect, useState, type ReactNode } from 'react';

export const STAGE_W = 1366;
export const STAGE_H = 768;

/** 1366×768 設計畫布，依視窗等比縮放以維持 16:9 */
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <div className="viewport">
      <div className="stage" data-testid="stage" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
