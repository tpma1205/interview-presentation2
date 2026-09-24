import { expect, test } from '@playwright/test';
import { openOffline } from './helpers';

test('按 A 進入附錄、再按 A 回到原頁', async ({ page }) => {
  await openOffline(page);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('a');
  await expect(page.getByTestId('pager')).toHaveText('附錄');
  await expect(page.getByTestId('density-chart')).toBeVisible();
  await page.keyboard.press('a');
  await expect(page.getByTestId('pager')).toHaveText('4 / 8');
});

test('附錄中 ←/→ 不作用，Esc 回到原頁', async ({ page }) => {
  await openOffline(page);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('a');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('pager')).toHaveText('附錄');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('pager')).toHaveText('2 / 8');
});

test('導覽列進入附錄，返回按鈕回到原頁', async ({ page }) => {
  await openOffline(page);
  await page.keyboard.press('ArrowRight');
  await page.getByRole('button', { name: '附錄' }).click();
  await page.getByRole('button', { name: '← 返回第 2 頁' }).click();
  await expect(page.getByTestId('pager')).toHaveText('2 / 8');
});

test('人口密度圖：29 區、兩條門檻線、八里與三峽手動調整註記', async ({ page }) => {
  await openOffline(page);
  await page.keyboard.press('a');
  const chart = page.getByTestId('density-chart');
  await expect(chart.locator('g[data-district]')).toHaveCount(29);
  await expect(chart.getByTestId('threshold')).toHaveCount(2);
  const callouts = chart.getByTestId('callout');
  await expect(callouts).toHaveCount(2);
  await expect(callouts.nth(0)).toContainText('八里');
  await expect(callouts.nth(0)).toContainText('臺北港與淡海周邊為市政發展重點');
  await expect(callouts.nth(1)).toContainText('三峽');
  await expect(callouts.nth(1)).toContainText('北大特區開發持續推進');
  await expect(chart.locator('rect.adjusted')).toHaveCount(2);
});
