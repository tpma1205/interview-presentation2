import { geoMercator, geoPath } from 'd3-geo';
import { useMemo, useRef, useState, type MouseEvent } from 'react';
import geo from '../data/new-taipei.geo.json';
import type { DistrictSummary } from '../domain/dataset';
import { pct, tons } from '../domain/format';
import { districtByName } from '../domain/model';

type Feature = (typeof geo.features)[number];

/** 標籤位移（px），避免三重、新莊等相鄰小區的名稱重疊 */
const LABEL_OFFSET: Record<string, [number, number]> = { 三重: [14, -16], 新莊: [-14, 12] };

interface Props {
  width: number;
  height: number;
  selected: string | null;
  onSelect: (name: string) => void;
}

export function DistrictMap({ width, height, selected, onSelect }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);

  const { paths, labels, taipei } = useMemo(() => {
    const collection = geo as unknown as GeoJSON.FeatureCollection;
    const projection = geoMercator().fitExtent(
      [
        [8, 8],
        [width - 8, height - 8],
      ],
      collection,
    );
    const path = geoPath(projection);
    const features = geo.features as Feature[];
    return {
      taipei: projection([121.585, 25.06])!,
      paths: features.map((f) => ({
        name: f.properties.name,
        d: path(f as unknown as GeoJSON.Feature) ?? '',
      })),
      labels: features
        .filter((f) => districtByName.get(f.properties.name)?.underperforming)
        .map((f) => {
          const [x, y] = path.centroid(f as unknown as GeoJSON.Feature);
          const [dx, dy] = LABEL_OFFSET[f.properties.name] ?? [0, 0];
          return { name: f.properties.name, x: x + dx, y: y + dy };
        }),
    };
  }, [width, height]);

  const track = (name: string) => (e: MouseEvent) => {
    const box = boxRef.current!.getBoundingClientRect();
    // 畫布經 transform 縮放，換算回設計座標
    const scale = box.width / boxRef.current!.offsetWidth;
    setHover({ name, x: (e.clientX - box.left) / scale, y: (e.clientY - box.top) / scale });
  };

  const hovered = hover ? districtByName.get(hover.name) : undefined;

  return (
    <div ref={boxRef} className="map-box" style={{ width, height }} onMouseLeave={() => setHover(null)}>
      <svg width={width} height={height} role="img" aria-label="新北市行政區削減率地圖">
        {paths.map((p) => {
          const d = districtByName.get(p.name)!;
          return (
            <path
              key={p.name}
              d={p.d}
              data-district={p.name}
              className={[
                'district',
                d.underperforming ? 'is-under' : 'is-ok',
                selected === p.name ? 'is-selected' : '',
                hover?.name === p.name ? 'is-hover' : '',
              ].join(' ')}
              onMouseMove={track(p.name)}
              onClick={() => onSelect(p.name)}
            />
          );
        })}
        {/* 選取中的行政區邊框畫在最上層 */}
        {selected && <path className="district-outline" d={paths.find((p) => p.name === selected)?.d} />}
        <text x={taipei[0]} y={taipei[1]} className="city-label" textAnchor="middle">
          臺北市
        </text>
        {labels.map((l) => (
          <text key={l.name} x={l.x} y={l.y} className="district-label" textAnchor="middle" dy="0.35em">
            {l.name}
          </text>
        ))}
      </svg>
      <div className="control-badge" data-testid="control-badge">
        <span className="badge alert">申報前管制啟動中</span>
        <span>{labels.map((l) => l.name).join('・')}</span>
      </div>
      {hovered && hover && <Tooltip d={hovered} x={hover.x} y={hover.y} boxH={height} />}
    </div>
  );
}

function Tooltip({ d, x, y, boxH }: { d: DistrictSummary; x: number; y: number; boxH: number }) {
  const W = 330;
  const H = 300;
  // 地圖在畫面左側，tooltip 一律放在游標右側（可越過地圖框覆蓋右側面板）
  const left = x + 18;
  const top = Math.min(Math.max(4, y - H / 2), boxH - H);
  return (
    <div className="map-tooltip" role="tooltip" data-testid="map-tooltip" style={{ left, top, width: W }}>
      <div className="tt-head">
        <strong>{d.name}區</strong>
        <span className="tt-zone">{d.zoneLabel}</span>
      </div>
      {d.underperforming && <div className="tt-alert">申報前管制啟動中</div>}
      <dl>
        <dt>施工中工地</dt>
        <dd>{d.siteCount} 處</dd>
        <dt>總排放量</dt>
        <dd>{tons(d.emission)} 公噸 TSP</dd>
        <dt>總削減量</dt>
        <dd>{tons(d.reduction)} 公噸 TSP</dd>
        <dt>削減率</dt>
        <dd className={d.underperforming ? 'alert' : ''}>{pct(d.rate)}</dd>
        <dt>分區目標</dt>
        <dd>{pct(d.target)}</dd>
      </dl>
    </div>
  );
}
