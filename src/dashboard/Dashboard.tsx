import { useState } from 'react';
import { pct } from '../domain/format';
import { config, dataset } from '../domain/model';
import { DistrictMap } from './DistrictMap';
import { Top10Table } from './Top10Table';

export function Dashboard() {
  const [selected, setSelected] = useState<string | null>(null);
  const underperforming = dataset.districts.filter((d) => d.underperforming);

  return (
    <section className="slide dashboard" data-testid="slide">
      <div className="dash-head">
        <h1 className="slide-title">
          <span>執行成果</span>
          <span className="sub">儀表板 Demo</span>
        </h1>
        <div className="kpis">
          <Kpi
            label="全市削減率"
            value={pct(dataset.city.rate)}
            note={`環境部 ${config.year} 年目標 ${config.moenvTargets[config.year]}%`}
          />
          <Kpi label="未達標行政區" value={`${underperforming.length} 區`} alert />
        </div>
      </div>
      <div className="dash-body">
        <div className="dash-map">
          <DistrictMap width={490} height={460} selected={selected} onSelect={setSelected} />
          <div className="map-legend">
            <span>
              <i className="sw ok" />
              達標
            </span>
            <span>
              <i className="sw under" />
              未達標・申報前管制啟動中
            </span>
          </div>
          <div className="map-source" data-testid="map-source">
            界線：內政部國土測繪中心
          </div>
        </div>
        <div className="dash-panel" data-testid="dash-panel">
          <Top10Table district={selected} onBack={() => setSelected(null)} />
        </div>
      </div>
    </section>
  );
}

function Kpi({ label, value, note, alert }: { label: string; value: string; note?: string; alert?: boolean }) {
  return (
    <div className={`kpi${alert ? ' is-alert' : ''}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value-row">
        <span className="kpi-value">{value}</span>
        {note && <span className="kpi-note">{note}</span>}
      </div>
    </div>
  );
}
