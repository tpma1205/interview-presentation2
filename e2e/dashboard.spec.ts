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

test('滑鼠移入未達標區顯示 tooltip 七項資訊與申報前管制狀態', async ({ page }) => {
  await openDashboard(page);
  await district(page, '林口').hover({ force: true });
  const tip = page.getByTestId('map-tooltip');
  await expect(tip).toBeVisible();
  for (const text of ['林口區', '發展區', '申報前管制啟動中', '施工中工地', '總排放量', '總削減量', '63.5%', '67.0%']) {
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

test('點擊未達標區顯示該區 TOP 10 並標示優先輔導，可返回全市', async ({ page }) => {
  await openDashboard(page);
  await page.getByRole('tab', { name: '新申報案件模擬' }).click();
  await district(page, '新莊').click({ force: true });
  await expect(page.getByRole('tab', { name: 'TOP 10 工地' })).toHaveAttribute('aria-selected', 'true');
  const top10 = page.getByTestId('top10');
  await expect(top10).toContainText('新莊區');
  await expect(top10).toContainText('申報前管制啟動中');
  await expect(top10.locator('tbody tr')).toHaveCount(10);
  expect(await top10.getByText('優先輔導').count()).toBeGreaterThanOrEqual(3);
  await expect(top10.locator('td').first()).toHaveText(/^工地 A-\d{3}$/);
  await page.getByRole('button', { name: '返回全市' }).click();
  await expect(top10).toContainText('全市 TOP 10 排放工地');
});

test.describe('新申報案件模擬', () => {
  test.beforeEach(async ({ page }) => {
    await openDashboard(page);
    await page.getByRole('tab', { name: '新申報案件模擬' }).click();
  });

  test('情境：未達標區・大規模・房屋建築 → 觸發，應檢附兩份清單', async ({ page }) => {
    await page.getByRole('button', { name: '未達標區・大規模・房屋建築' }).click();
    await expect(page.getByTestId('verdict-large')).toHaveText('大規模工程：是');
    await expect(page.getByTestId('verdict-trigger')).toHaveText('申報前管制：觸發');
    const docs = page.getByTestId('required-docs');
    await expect(docs).toContainText('污染防制設備清單');
    await expect(docs).toContainText('空氣污染、噪音及監測設備清單');
    await expect(docs).toContainText('未檢附則無法完成申報');
  });

  test('情境：未達標區・非大規模 → 不觸發', async ({ page }) => {
    await page.getByRole('button', { name: '未達標區・非大規模' }).click();
    await expect(page.getByTestId('verdict-large')).toHaveText('大規模工程：否');
    await expect(page.getByTestId('verdict-trigger')).toHaveText('申報前管制：未觸發');
  });

  test('情境：達標區・大規模 → 不觸發', async ({ page }) => {
    await page.getByRole('button', { name: '達標區・大規模', exact: true }).click();
    await expect(page.getByTestId('verdict-large')).toHaveText('大規模工程：是');
    await expect(page.getByTestId('verdict-trigger')).toHaveText('申報前管制：未觸發');
  });

  test('手動修改欄位即時重新判定（取消建照 → 只需一份清單）', async ({ page }) => {
    await page.getByRole('button', { name: '未達標區・大規模・房屋建築' }).click();
    await page.getByLabel('需申請建築執照（房屋建築工程）').uncheck();
    const docs = page.getByTestId('required-docs');
    await expect(docs).toContainText('污染防制設備清單');
    await expect(docs).not.toContainText('空氣污染、噪音及監測設備清單');
    await page.getByLabel('工地面積').fill('9999');
    await page.getByLabel('合約經費').fill('19999');
    await expect(page.getByTestId('verdict-large')).toHaveText('大規模工程：否');
  });

  test('點擊地圖行政區後，模擬面板自動帶入該區', async ({ page }) => {
    await district(page, '三重').click({ force: true });
    await page.getByRole('tab', { name: '新申報案件模擬' }).click();
    await expect(page.getByRole('combobox')).toHaveValue('三重');
    await expect(page.getByTestId('sim-result')).toContainText('三重區削減率 68.1%');
  });

  test('輸入框聚焦時 ←/→/A 不觸發簡報快捷鍵', async ({ page }) => {
    const input = page.getByLabel('工期');
    await input.click();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('a');
    await expect(page.getByTestId('pager')).toHaveText('3 / 8');
  });
});
