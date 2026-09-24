// 一次性前處理：內政部國土測繪中心「鄉鎮市區界線（TWD97 經緯度）」SHP → 新北市 29 區簡化 GeoJSON
// 資料來源：data.gov.tw 資料集 7441（版本 1140318）
// 用法：npm run prep:map -- <TOWN_MOI_xxxx.shp 路徑>
import fs from 'node:fs';
import { geoArea } from 'd3-geo';
import mapshaper from 'mapshaper';

const shp = process.argv[2];
if (!shp) {
  console.error('請提供 TOWN_MOI_*.shp 路徑');
  process.exit(1);
}

await mapshaper.runCommands(
  [
    `-i "${shp}" encoding=utf8`,
    `-filter "COUNTYNAME === '新北市'"`,
    `-each "name = TOWNNAME.replace(/區$/, '')"`,
    `-filter-fields name`,
    `-simplify 4% keep-shapes`,
    `-filter-islands min-area=500000`,
    `-o src/data/new-taipei.geo.json format=geojson precision=0.0001 force`,
  ].join(' '),
);

// d3-geo 以球面判斷多邊形內外：環方向相反時會被解讀為「全球減去此區」（面積 > 2π），此時反轉環方向
const file = 'src/data/new-taipei.geo.json';
const fc = JSON.parse(fs.readFileSync(file, 'utf8'));
const reverse = (rings) => rings.map((ring) => [...ring].reverse());
for (const f of fc.features) {
  if (geoArea(f) <= 2 * Math.PI) continue;
  const g = f.geometry;
  if (g.type === 'Polygon') g.coordinates = reverse(g.coordinates);
  if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map(reverse);
}
fs.writeFileSync(file, JSON.stringify(fc));
console.log(`已輸出 ${fc.features.length} 區 → ${file}`);
