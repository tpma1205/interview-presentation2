import { expect, test } from '@playwright/test';
import { openOffline } from './helpers';

test('離線開啟且不發出任何網路請求', async ({ page }) => {
  const { blocked, errors } = await openOffline(page);
  expect(blocked).toEqual([]);
  expect(errors).toEqual([]);
});

test('←/→ 翻頁並顯示頁碼，不越界', async ({ page }) => {
  await openOffline(page);
  const pager = page.getByTestId('pager');
  await expect(pager).toHaveText('1 / 8');
  await page.keyboard.press('ArrowLeft');
  await expect(pager).toHaveText('1 / 8');
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
  await expect(pager).toHaveText('8 / 8');
  await page.keyboard.press('ArrowLeft');
  await expect(pager).toHaveText('7 / 8');
});

test('導覽列「儀錶板」跳到第 3 頁', async ({ page }) => {
  await openOffline(page);
  await page.getByRole('button', { name: '儀錶板' }).click();
  await expect(page.getByTestId('pager')).toHaveText('3 / 8');
});

test('頁首顯示專案名稱', async ({ page }) => {
  await openOffline(page);
  await expect(page.locator('.topbar')).toContainText('新北市營建工程污染削減監測儀錶板');
});
