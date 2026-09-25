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

test('摘要只顯示全市削減率與未達標行政區數，不顯示預估觸發案件', async ({ page }) => {
  await openDashboard(page);
  const kpis = page.locator('.kpis');
  await expect(kpis).toContainText('61.5%');
  await expect(kpis).toContainText('環境部 115 年目標 56%');
  await expect(kpis).toContainText('4 區');
  await expect(page.getByTestId('slide')).not.toContainText('觸發案件');
});

test('只有 TOP 10 表格，沒有新申報案件模擬', async ({ page }) => {
  await openDashboard(page);
  await expect(page.getByRole('tab')).toHaveCount(0);
  await expect(page.getByTestId('slide')).not.toContainText('新申報案件模擬');
});

test('滑鼠移入未達標區顯示 tooltip 七項資訊與申報前管制狀態', async ({ page }) => {
  await openDashboard(page);
  await district(page, '林口').hover({ force: true });
  const tip = page.getByTestId('map-tooltip');
  await expect(tip).toBeVisible();
  for (const text of ['林口區', '發展區', '申報前管制啟動中', '施工中工地', '總排放量', '總削減量', '56.5%', '60.0%']) {
    await expect(tip).toContainText(text);
  }
});

test('滑鼠移入達標區不顯示申報前管制狀態', async ({ page }) => {
  await openDashboard(page);
  await district(page, '坪林').hover({ force: true });
  const tip = page.getByTestId('map-tooltip');
  await expect(tip).toContainText('坪林區');
  await expect(tip).not.toContainText('申報前管制啟動中');
});

test('地圖標示申報前管制啟動中的行政區', async ({ page }) => {
  await openDashboard(page);
  const badge = page.getByTestId('control-badge');
  await expect(badge).toContainText('申報前管制啟動中');
  for (const name of ['新莊', '三重', '林口', '淡水']) await expect(badge).toContainText(name);
});

test('儀表板角落顯示「數據為模擬示意」', async ({ page }) => {
  await openDashboard(page);
  await expect(page.getByText('數據為模擬示意').first()).toBeVisible();
});

test('初始顯示全市 TOP 10（含行政區欄），不顯示「8 成」說明', async ({ page }) => {
  await openDashboard(page);
  const top10 = page.getByTestId('top10');
  await expect(top10).toContainText('全市 TOP 10 排放工地');
  await expect(top10.locator('th', { hasText: '行政區' })).toBeVisible();
  await expect(top10.locator('tbody tr')).toHaveCount(10);
  await expect(top10).not.toContainText('8 成');
  await expect(top10).not.toContainText('80%');
});

test('工程類型僅限指定的 10 類', async ({ page }) => {
  await openDashboard(page);
  const allowed = ['RC', 'SRC', '拆除', '道路', '隧道', '管線', '橋樑', '區域開發', '疏濬', '其他'];
  for (const name of [null, '新莊', '烏來']) {
    if (name) await district(page, name).click({ force: true });
    const types = await page.getByTestId('top10').locator('tbody tr td:nth-last-child(5)').allTextContents();
    for (const t of types) expect(allowed).toContain(t);
  }
});

test('點擊未達標區顯示該區 TOP 10 並標示優先輔導，可返回全市', async ({ page }) => {
  await openDashboard(page);
  await district(page, '新莊').click({ force: true });
  const top10 = page.getByTestId('top10');
  await expect(top10).toContainText('新莊區');
  await expect(top10).toContainText('申報前管制啟動中');
  await expect(top10.locator('tbody tr')).toHaveCount(10);
  expect(await top10.getByText('優先輔導').count()).toBeGreaterThanOrEqual(3);
  await expect(top10.locator('td').first()).toHaveText(/^工地 A-\d{3}$/);
  await page.getByRole('button', { name: '返回全市' }).click();
  await expect(top10).toContainText('全市 TOP 10 排放工地');
});
