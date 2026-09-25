import { expect, test } from '@playwright/test';
import { openOffline } from './helpers';

const TITLES = [
  '專案目標',
  '執行規劃',
  '執行成果',
  '商業價值',
  'GTM 策略',
  '技術規格、技術架構',
  '規格文件、交互文件',
  '成果為何',
];

test('固定 8 頁依序呈現', async ({ page }) => {
  await openOffline(page);
  for (const [i, title] of TITLES.entries()) {
    await expect(page.locator('.slide-title')).toContainText(title);
    await expect(page.getByTestId('pager')).toHaveText(`${i + 1} / 8`);
    await page.keyboard.press('ArrowRight');
  }
});

const goTo = async (page: import('@playwright/test').Page, n: number) => {
  for (let i = 1; i < n; i++) await page.keyboard.press('ArrowRight');
  return page.getByTestId('slide');
};

test('第 1 頁：起源、四個目標與各自的解決方案', async ({ page }) => {
  await openOffline(page);
  const slide = await goTo(page, 1);
  for (const text of [
    '起源',
    '計畫執行年度精進亮點（非合約項目）',
    '即時掌握污染數據',
    '確保符合環境部年度削減量目標',
    '合理配置人力資源',
    '源頭掌握污染防制設備',
    '資料蒐集',
  ]) {
    await expect(slide).toContainText(text);
  }
  await expect(slide.locator('.section-label')).toHaveText('目標');
  await expect(slide.locator('.goal-list li')).toHaveText(['蒐集優良工地評選名單', 'IoT 數據聯網的前期名單']);
  const solutions = await slide.locator('.solution').allTextContents();
  expect(solutions.map((s) => s.replace('解決方案', ''))).toEqual([
    '建立污染量監測儀表板',
    '建立污染量監測儀表板',
    '新增申報審查文件',
    '新增申報審查文件',
  ]);
  for (const banned of ['起因', '想解決的問題', '開工後', '權責', '介入時點', '8 成', '80%', '前 10 大']) {
    await expect(slide).not.toContainText(banned);
  }
});

test('第 2 頁：六站路線，下方依序為儀表板內容、新增申報審查文件、定義說明', async ({ page }) => {
  await openOffline(page);
  const slide = await goTo(page, 2);
  await expect(slide.locator('.route-stop')).toHaveCount(6);
  await expect(slide.locator('.route-stop').last()).toContainText('上線');
  await expect(slide.locator('.plan-cols .section-label')).toHaveText(['儀表板內容', '新增申報審查文件', '定義說明']);
  for (const text of ['115 年 56%', '116 年 60%', '都會區 65%', '發展區 60%', '偏鄉區 56%', '第 18 條', '第 8 條', '北工施字第1121953044號']) {
    await expect(slide).toContainText(text);
  }
  await expect(slide).not.toContainText('規則摘要');
  await expect(slide).not.toContainText('人/km²');
});

test('第 4 頁：查核效率', async ({ page }) => {
  await openOffline(page);
  await expect(await goTo(page, 4)).toContainText('查核效率');
});

test('第 5 頁：精簡版 GTM 五步驟', async ({ page }) => {
  await openOffline(page);
  const slide = await goTo(page, 5);
  const steps = slide.locator('.route-stop h3');
  await expect(steps).toHaveText(['市場問題', '目標客群', '定位與價值', '推廣通路', '指標與迭代']);
});

test('第 6 頁：流程圖涵蓋資料來源、分析運用、判斷邏輯，判斷為菱形', async ({ page }) => {
  await openOffline(page);
  const slide = await goTo(page, 6);
  const sop = slide.getByTestId('sop');
  for (const lane of ['資料來源', '分析運用', '判斷邏輯']) await expect(sop).toContainText(lane);
  const decisions = slide.locator('.sop-node.is-decision');
  await expect(decisions).toHaveCount(2);
  expect(await decisions.first().evaluate((el) => getComputedStyle(el).clipPath)).toMatch(/^polygon\(50% 0(px|%)?, 100% 50%, 50% 100%, 0(px|%)? 50%\)$/);
  for (const text of ['現場查核紀錄', '新增申報審查文件', '蒐集名單']) await expect(sop).toContainText(text);
  for (const banned of ['SOP 流程圖', '依環境部查核與計算', '工地彙總為', '地圖上色', '房屋建築另附']) {
    await expect(slide).not.toContainText(banned);
  }
  // 連線標籤由「清單回傳」改為「蒐集名單」
  const edgeLabels = await slide.locator('.sop-edge-label').allTextContents();
  expect(edgeLabels).toContain('蒐集名單');
  expect(edgeLabels).not.toContain('清單回傳');
});

test('第 7 頁：沒有跨專案交互', async ({ page }) => {
  await openOffline(page);
  await expect(await goTo(page, 7)).not.toContainText('跨專案交互');
});

test('第 8 頁：四項追蹤指標各有量化 KPI，一一對應第 1 頁的目標', async ({ page }) => {
  await openOffline(page);
  const slide = await goTo(page, 8);
  await expect(slide.locator('.numbered-item')).toHaveCount(4);
  await expect(slide.locator('.kpi-name')).toHaveText(['KPI　污染削減率', 'KPI　改善率', 'KPI　建置完成率', 'KPI　報名率']);
  await expect(slide.locator('.kpi-formula')).toHaveCount(4);
  for (const text of ['追蹤指標', '61.5%（目標 56%）', '對應目標：資料蒐集']) {
    await expect(slide).toContainText(text);
  }
  for (const banned of ['過程指標', '結果指標', '延伸指標', '風險指標', '均值回歸']) {
    await expect(slide).not.toContainText(banned);
  }
});

test('附錄：門檻線畫在點之上，y 軸標題直書', async ({ page }) => {
  await openOffline(page);
  await page.keyboard.press('a');
  const chart = page.getByTestId('density-chart');
  const order = await chart.evaluate((svg) => {
    const children = [...svg.children];
    const lastDot = Math.max(...children.map((c, i) => (c.hasAttribute('data-district') ? i : -1)));
    const firstThreshold = children.findIndex((c) => c.getAttribute('data-testid') === 'threshold');
    return { lastDot, firstThreshold };
  });
  expect(order.firstThreshold).toBeGreaterThan(order.lastDot);
  const mode = await chart.locator('.axis-title').evaluate((el) => getComputedStyle(el).writingMode);
  expect(mode).toBe('vertical-rl');
});
