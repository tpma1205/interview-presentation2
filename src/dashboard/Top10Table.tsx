import { isPriority, topSites } from '../domain/dataset';
import { pct, tons } from '../domain/format';
import { dataset, districtByName } from '../domain/model';

interface Props {
  district: string | null;
  onBack: () => void;
}

/** 排放量最高的 10 處工地；未選行政區時為全市，並加列行政區欄 */
export function Top10Table({ district, onBack }: Props) {
  const d = district ? districtByName.get(district)! : null;
  const rows = topSites(d ? dataset.sites.filter((s) => s.district === d.name) : dataset.sites, 10);

  return (
    <div className="top10" data-testid="top10">
      <div className="panel-head">
        {d ? (
          <>
            <strong>{d.name}區</strong>
            <span className="muted">
              分區目標 {d.target}%・削減率{' '}
              <b className={d.underperforming ? 'alert' : 'primary'}>{pct(d.rate)}</b>
            </span>
            {d.underperforming && <span className="badge alert">申報前管制啟動中</span>}
            <button className="back-btn push-right" onClick={onBack}>
              ← 返回全市
            </button>
          </>
        ) : (
          <>
            <strong>全市 TOP 10 排放工地</strong>
            <span className="muted">點擊地圖行政區查看該區</span>
          </>
        )}
      </div>
      <table className="data-table">
        <thead>
          <tr>
            {!d && <th>行政區</th>}
            <th>工地代號</th>
            <th>工程類型</th>
            <th className="num">排放量</th>
            <th className="num">削減量</th>
            <th className="num">削減率</th>
            <th>輔導</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const priority = isPriority(s, districtByName.get(s.district)!);
            return (
              <tr key={s.id} className={priority ? 'is-priority' : ''}>
                {!d && <td>{s.district}</td>}
                <td className="mono">工地 {s.id}</td>
                <td>{s.type}</td>
                <td className="num">{tons(s.emission)}</td>
                <td className="num">{tons(s.reduction)}</td>
                <td className="num rate">{pct(s.rate)}</td>
                <td>{priority && <span className="badge alert">優先輔導</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="table-foot">
        <span>單位：公噸 TSP｜優先輔導＝削減率低於分區目標</span>
        <span className="sim-tag">數據為模擬示意</span>
      </div>
    </div>
  );
}
