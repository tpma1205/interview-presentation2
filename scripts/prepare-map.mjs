// 一次性前處理：內政部國土測繪中心「鄉鎮市區界線（TWD97 經緯度）」SHP → 新北市 29 區簡化 GeoJSON
// 資料來源：data.gov.tw 資料集 7441（版本 1140318）
// 用法：npm run prep:map -- <TOWN_MOI_xxxx.shp 路徑>
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
