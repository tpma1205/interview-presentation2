import { expect, test } from '@playwright/test';
import { openOffline } from './helpers';

const TITLES = [
  '專案目標',
  '執行規劃',
  '執行成果',
  '商業價值',
  '技術規格、技術架構',
  '規格文件、交互文件',
  '成果為何',
];

test('固定 7 頁依序呈現，沒有 GTM 策略頁', async ({ page }) => {
  await openOffline(page);
  for (const [i, title] of TITLES.entries()) {
    await expect(page.locator('.slide-title')).toContainText(title);
    await expect(page.getByTestId('pager')).toHaveText(`${i + 1} / 7`);
    await expect(page.getByTestId('slide')).not.toContainText('GTM');
    await page.keyboard.press('ArrowRight');
  }
  await expect(page.locator('.ruler')).not.toContainText('GTM');
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
    '確保符合環境部年度削減率目標',
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
  await expect(slide.locator('.route-stop').nth(1)).toHaveText('與團隊討論\n可行性');
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

test('第 5 頁：流程圖依負責單位分三道，節點位於各自泳道，判斷為菱形', async ({ page }) => {
  await openOffline(page);
  const slide = await goTo(page, 5);
  const sop = slide.getByTestId('sop');
  await expect(sop.locator('.sop-lane span')).toHaveText(['現場查核', '系統平台', '申報審查']);

  // 每個節點的垂直位置落在所屬泳道內
  const lanes = await sop.locator('.sop-lane').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
  const laneOf = async (id: string) => {
    const box = (await sop.locator(`[data-node="${id}"]`).boundingBox())!;
    const center = box.y + box.height / 2;
    return lanes.filter((top) => top <= center).length; // 1、2、3
  };
  const expected: Record<string, number> = {
    field: 1, coach: 1,
    db: 2, sql: 2, dash: 2, district: 2, status: 2,
    declare: 3, large: 3, docs: 3,
  };
  await expect(sop.locator('[data-node="compare"]')).toHaveCount(0);
  expect((await sop.locator('.sop-node').allTextContents()).some((t) => t.includes('現場比對'))).toBe(false);
  for (const [id, lane] of Object.entries(expected)) expect(await laneOf(id), id).toBe(lane);

  const decisions = slide.locator('.sop-node.is-decision');
  await expect(decisions).toHaveCount(2);
  expect(await decisions.first().evaluate((el) => getComputedStyle(el).clipPath)).toMatch(/^polygon\(50% 0(px|%)?, 100% 50%, 50% 100%, 0(px|%)? 50%\)$/);
  await expect(sop.locator('[data-node="sql"]')).toHaveText('SQL 即時運算');
  await expect(sop.locator('[data-node="status"]')).toContainText('申報前管制啟動中');
  await expect(sop).not.toContainText('①');
  await expect(sop).not.toContainText('②');

  // 全部實線：連線與框都沒有虛線
  const dashes = await sop.locator('path.sop-edge').evaluateAll((els) => els.map((e) => getComputedStyle(e).strokeDasharray));
  expect(dashes.every((d) => d === 'none')).toBe(true);
  const borders = await sop.locator('.sop-node').evaluateAll((els) => els.map((e) => getComputedStyle(e).borderStyle));
  expect(borders.every((b) => b !== 'dashed')).toBe(true);

  // 底色：新增申報審查文件、行政區管制狀態為紅色系，其餘白色（菱形看內層）
  const bg = (id: string) =>
    sop.locator(`[data-node="${id}"]`).evaluate((el) =>
      el.classList.contains('is-decision') ? getComputedStyle(el, '::before').backgroundColor : getComputedStyle(el).backgroundColor,
    );
  for (const id of ['field', 'coach', 'db', 'sql', 'dash', 'district', 'declare', 'large', 'lists']) {
    expect(await bg(id), id).toBe('rgb(255, 255, 255)');
  }
  for (const id of ['docs', 'status']) expect(await bg(id), id).not.toBe('rgb(255, 255, 255)');

  // 新增申報審查文件與優先輔導都導向現場查核：兩條連線終點落在現場查核節點右緣
  const field = (await sop.locator('[data-node="field"]').boundingBox())!;
  const sopBox = (await sop.boundingBox())!;
  const ends = await sop.locator('path.sop-edge').evaluateAll((els) =>
    els.map((e) => {
      const p = (e as SVGPathElement).getPointAtLength((e as SVGPathElement).getTotalLength());
      return { x: p.x, y: p.y };
    }),
  );
  const intoField = ends.filter(
    (p) => Math.abs(sopBox.x + p.x - (field.x + field.width)) < 2 && sopBox.y + p.y > field.y && sopBox.y + p.y < field.y + field.height,
  );
  expect(intoField).toHaveLength(2);

  // 已檢附分岔：一條到現場查核、一條由上方進入優良工地評選／IoT 前期名單；不再有新增申報審查文件直連名單的橫線
  const lists = (await sop.locator('[data-node="lists"]').boundingBox())!;
  const intoListsTop = ends.filter(
    (p) => Math.abs(sopBox.y + p.y - lists.y) < 2 && sopBox.x + p.x > lists.x && sopBox.x + p.x < lists.x + lists.width,
  );
  expect(intoListsTop).toHaveLength(1);
  const intoListsRight = ends.filter((p) => Math.abs(sopBox.x + p.x - (lists.x + lists.width)) < 2);
  expect(intoListsRight).toHaveLength(0);
  await expect(sop.getByTestId('attached-branch')).toHaveCount(1);

  const edgeLabels = await slide.locator('.sop-edge-label').allTextContents();
  expect(edgeLabels).not.toContain('已檢附：設備清單');
  for (const label of ['否：持續監測', '優先輔導名單', '讀取管制狀態', '否：一般申報', '未檢附：補件，無法完成申報', '已檢附', '設備清單（現場比對依據）']) {
    expect(edgeLabels).toContain(label);
  }
  await expect(sop.locator('[data-node="lists"]')).toContainText(/優良工地評選／\s*IoT 前期名單/);
});

test('第 6 頁：沒有跨專案交互', async ({ page }) => {
  await openOffline(page);
  await expect(await goTo(page, 6)).not.toContainText('跨專案交互');
});

test('第 7 頁：四項追蹤指標各有量化 KPI，一一對應第 1 頁的目標', async ({ page }) => {
  await openOffline(page);
  const slide = await goTo(page, 7);
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
