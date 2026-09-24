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

test('第 1 頁不出現保留給口頭回答的內容', async ({ page }) => {
  await openOffline(page);
  const slide = page.getByTestId('slide');
  await expect(slide).toContainText('加值服務');
  for (const banned of ['開工後', '權責', '介入時點', '8 成', '80%', '前 10 大']) {
    await expect(slide).not.toContainText(banned);
  }
});

test('第 2 頁規則摘要卡含公式、目標、三項條件與觸發條件', async ({ page }) => {
  await openOffline(page);
  await page.keyboard.press('ArrowRight');
  const slide = page.getByTestId('slide');
  for (const text of ['污染削減量', '115 年 65%', '116 年 67%', '70%', '67%', '65%', '第 18 條', '第 8 條', '行政區未達標', '北工施字第1121953044號']) {
    await expect(slide).toContainText(text);
  }
});
