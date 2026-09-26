# 新北市營建工程污染量監測儀表板——面試簡報

單一 HTML、可完全離線開啟的簡報網站：7 頁簡報 + 可操作的儀表板 Demo + 附錄。**所有數值皆為模擬示意。**

## 使用

```bash
npm ci
npm run build        # 產出 dist/index.html（單一檔案，可複製到任何電腦離線開啟）
npm run dev          # 開發模式
npm test             # 領域邏輯單元測試（Vitest）
npm run test:e2e     # 對建置結果做離線 E2E 與版面檢查（Playwright，需先 build）
```

### 操作

| 按鍵 | 動作 |
|---|---|
| → / ← | 下一頁 / 上一頁 |
| F | 進入 / 離開全螢幕 |
| A | 進入附錄；在附錄再按 A 回到原頁（全螢幕時 Esc 會被瀏覽器攔截，請用 A） |
| Esc | 非全螢幕時從附錄回到原頁 |

游標在輸入框時，以上快捷鍵不作用。導覽列「儀表板」直接跳到第 3 頁；頁尾刻度尺可直接點選任一頁。

## 調整模擬數值：`src/data/config.json`

百分比欄位一律以「%」為單位（`65` 代表 65%）。修改後先執行 `npm test`，再重新 `npm run build`；地圖、摘要、TOP 10、第 2 頁規則與附錄都會同步更新。

`npm test` 會驗證 config 是否仍符合敘事約束。若設定彼此矛盾（例如全市削減率無法達成），資料產生器會拋出「config.json 設定錯誤：…」並說明原因。注意：測試中寫死了目前的預期值（4 個未達標區、61.5% 等），刻意修改這些值後，對應的測試也要一起更新。

| 欄位 | 說明 |
|---|---|
| `year` | 年度（115） |
| `seed` | 亂數種子。改變它會重新洗牌工地數、工程類型、一般工地排放與削減率，但下列所有約束仍成立 |
| `moenvTargets` | 環境部年度目標，如 `{ "115": 56, "116": 60 }` |
| `zones.<metro/developing/rural>` | 分區設定：`label` 名稱、`code` 工地代號字母、`target` 分區目標（都會 65、發展 60、偏鄉 56）、`minDensity` 門檻下限（附錄門檻線）、`siteCountRange` 每區工地數抽樣範圍（都會 240–360、發展 140–220、偏鄉 15–45，抽樣後等比調整至 `totalSites`） |
| `districts[]` | 29 區：`name`、`density` 人口密度、`zone` 所屬分區、`manualAdjusted` 是否手動調整、`adjustReason` 調整原因（手動調整時必填，附錄會顯示） |
| `underperformingDistricts` | **未達標行政區與其削減率**，如 `{ "新莊": 61.8, ... }`。必須低於該區分區目標 |
| `compliantMarginRange` | 其餘達標區的削減率範圍 = 分區目標 + `[min, max]`（預設 `[1, 10]`） |
| `cityReductionRate` | **全市削減率**（排放量加權，預設 61.5；目前排放分布下可行範圍約 61–62） |
| `totalSites` | **全市施工中工地總數**（預設 4200）；各區依 `siteCountRange` 抽樣後等比分配，合計精確等於此值 |
| `largeProjects.shareOfCityEmission` | 前 10 大工程占全市排放比例（預設 80）。全市排放量採 Zipf 長尾分布（第 r 名 = `topEmission` ÷ r^s），指數 s 由此比例反推（目前約 1.55） |
| `largeProjects.topEmission` | 全市第 1 名工地排放量（公噸 TSP，預設 618.4），決定整體量級 |
| `largeProjects.sites[]` | 前 10 大工程：`district` 所在行政區、`type` 工程類型；**陣列順序即排放名次**。順序會影響全市削減率的可行範圍，目前順序下約 60.5–61.75% |

### 常見調整

- **換掉未達標行政區或改削減率**：修改 `underperformingDistricts`。建議同步檢查 `largeProjects.sites`，讓未達標區內有大規模工程（故事線：未達標源自大規模工程削減不足）。
- **調整全市削減率**：修改 `cityReductionRate`。可行範圍取決於未達標區的排放占比；超出範圍時建置會提示。
- **分區目標**：修改 `zones.*.target`。
- **某區改分區**：修改該區 `zone`，並設 `manualAdjusted: true` 與 `adjustReason`。

工程類型可用值：`RC`、`SRC`、`拆除`、`道路`、`隧道`、`管線`、`橋樑`、`區域開發`、`疏濬`、`其他`。

## 資料來源

- 行政區界線：內政部國土測繪中心「鄉鎮市區界線（TWD97 經緯度）」（data.gov.tw 資料集 7441，版本 1140318），經 `scripts/prepare-map.mjs` 篩選新北市 29 區並簡化後內嵌。重新產生：`npm run prep:map -- <TOWN_MOI_xxxx.shp 路徑>`。
- 其餘數值皆為模擬示意，工地一律以代號呈現。

## 部署

push 到 `main` 會由 GitHub Actions 測試、建置並發布至 GitHub Pages（repo Settings → Pages → Source 需設為「GitHub Actions」）。推送 `v*` tag 會將 `dist/index.html` 附到 GitHub Release，供離線備份下載。
