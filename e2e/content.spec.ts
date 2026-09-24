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

test('第 1 頁：起源與四個想解決的問題', async ({ page }) => {
  await openOffline(page);
  const slide = await goTo(page, 1);
  for (const text of ['起源', '計畫當年度擴充功能項目', '掌握重點污染工程', '源頭掌握污染防制設備', '資料蒐集']) {
    await expect(slide).toContainText(text);
  }
  for (const banned of ['起因', '加值服務', '開工後', '權責', '介入時點', '8 成', '80%', '前 10 大']) {
    await expect(slide).not.toContainText(banned);
  }
});

test('第 2 頁：六站路線與定義規則（觸發條件在最上方）', async ({ page }) => {
  await openOffline(page);
  const slide = await goTo(page, 2);
  await expect(slide.locator('.route-stop')).toHaveCount(6);
  await expect(slide.locator('.route-stop').last()).toContainText('上線');
  for (const text of ['定義規則', '115 年 56%', '116 年 60%', '都會區 65%', '發展區 60%', '偏鄉區 56%', '第 18 條', '第 8 條', '北工施字第1121953044號']) {
    await expect(slide).toContainText(text);
  }
  await expect(slide).not.toContainText('規則摘要');
  await expect(slide).not.toContainText('人/km²');
  const triggerTop = await slide.locator('.trigger').boundingBox();
  const detailsTop = await slide.locator('.rule-details').boundingBox();
  expect(triggerTop!.y).toBeLessThan(detailsTop!.y);
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

test('第 6 頁：SOP 流程圖涵蓋資料來源、分析運用、判斷邏輯', async ({ page }) => {
  await openOffline(page);
  const slide = await goTo(page, 6);
  for (const lane of ['資料來源', '分析運用', '判斷邏輯']) await expect(slide.getByTestId('sop')).toContainText(lane);
  await expect(slide.locator('.sop-node.is-decision')).toHaveCount(2);
});

test('第 7 頁：沒有跨專案交互', async ({ page }) => {
  await openOffline(page);
  await expect(await goTo(page, 7)).not.toContainText('跨專案交互');
});

test('第 8 頁：四項追蹤指標，一一對應第 1 頁的問題', async ({ page }) => {
  await openOffline(page);
  const slide = await goTo(page, 8);
  await expect(slide.locator('.numbered-item')).toHaveCount(4);
  for (const text of ['追蹤指標', '全市污染削減率是否高於環境部年度目標', '對應問題：資料蒐集']) {
    await expect(slide).toContainText(text);
  }
  for (const banned of ['過程指標', '結果指標', '延伸指標', '風險指標', '均值回歸']) {
    await expect(slide).not.toContainText(banned);
  }
});
