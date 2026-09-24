import { useState } from 'react';
import { pct } from '../domain/format';
import { config, dataset } from '../domain/model';
import { DistrictMap } from './DistrictMap';
import { SCENARIOS, Simulator, type SimulatorState } from './Simulator';
import { Top10Table } from './Top10Table';

type Tab = 'top10' | 'simulator';

export function Dashboard({ num }: { num: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('top10');
  const [sim, setSim] = useState<SimulatorState>(SCENARIOS[0].value);
  // 點擊地圖：切到 TOP 10，並將行政區帶入申報模擬
  const select = (name: string) => {
    setSelected(name);
    setTab('top10');
    setSim((s) => ({ ...s, district: name }));
  };
  const underperforming = dataset.districts.filter((d) => d.underperforming);

  return (
    <section className="slide dashboard" data-testid="slide">
      <div className="dash-head">
        <h1 className="slide-title">
          <span className="num">{String(num).padStart(2, '0')}</span>
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
          <Kpi label="本年度預估觸發案件" value={`${config.estimatedTriggerCases} 件`} />
        </div>
      </div>
      <div className="dash-body">
        <div className="dash-map card">
          <DistrictMap width={510} height={488} selected={selected} onSelect={select} />
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
          <span className="sim-note" style={{ right: 8, bottom: 6 }}>
            數據為模擬示意
          </span>
        </div>
        <div className="dash-panel card" data-testid="dash-panel">
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'top10'} onClick={() => setTab('top10')}>
              TOP 10 工地
            </button>
            <button role="tab" aria-selected={tab === 'simulator'} onClick={() => setTab('simulator')}>
              新申報案件模擬
            </button>
          </div>
          {tab === 'top10' ? (
            <Top10Table district={selected} onBack={() => setSelected(null)} />
          ) : (
            <Simulator state={sim} onChange={setSim} />
          )}
        </div>
      </div>
      <div className="map-source">行政區界線：內政部國土測繪中心</div>
    </section>
  );
}

function Kpi({ label, value, note, alert }: { label: string; value: string; note?: string; alert?: boolean }) {
  return (
    <div className={`kpi card${alert ? ' is-alert' : ''}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value-row">
        <span className="kpi-value">{value}</span>
        {note && <span className="kpi-note">{note}</span>}
      </div>
    </div>
  );
}
