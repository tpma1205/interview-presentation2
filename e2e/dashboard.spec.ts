import { expect, test, type Page } from '@playwright/test';
import { openOffline } from './helpers';

async function openDashboard(page: Page) {
  const ctx = await openOffline(page);
  await page.getByRole('button', { name: '儀表板' }).click();
  return ctx;
}

const district = (page: Page, name: string) => page.locator(`path[data-district="${name}"]`);

test('地圖繪出 29 區，未達標 4 區以警示色標示', async ({ page }) => {
  await openDashboard(page);
  await expect(page.locator('path.district')).toHaveCount(29);
  const under = await page.locator('path.district.is-under').evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-district')).sort(),
  );
  expect(under).toEqual(['三重', '新莊', '林口', '淡水'].sort());
});

test('摘要卡顯示全市削減率、未達標行政區數、預估觸發案件數', async ({ page }) => {
  await openDashboard(page);
  const kpis = page.locator('.kpis');
  await expect(kpis).toContainText('68.5%');
  await expect(kpis).toContainText('4 區');
  await expect(kpis).toContainText('7 件');
});

test('滑鼠移入未達標區顯示 tooltip 七項資訊與管制狀態', async ({ page }) => {
  await openDashboard(page);
  await district(page, '林口').hover({ force: true });
  const tip = page.getByTestId('map-tooltip');
  await expect(tip).toBeVisible();
  for (const text of ['林口區', '發展區', '申報前管制啟動中', '施工中工地', '總排放量', '總削減量', '63.5%', '67.0%']) {
    await expect(tip).toContainText(text);
  }
});

test('滑鼠移入達標區不顯示管制狀態', async ({ page }) => {
  await openDashboard(page);
  await district(page, '坪林').hover({ force: true });
  const tip = page.getByTestId('map-tooltip');
  await expect(tip).toContainText('坪林區');
  await expect(tip).not.toContainText('申報前管制啟動中');
});

test('儀表板角落顯示「數據為模擬示意」', async ({ page }) => {
  await openDashboard(page);
  await expect(page.getByText('數據為模擬示意').first()).toBeVisible();
});
