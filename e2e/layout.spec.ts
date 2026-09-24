import { expect, test, type Page } from '@playwright/test';
import { openOffline } from './helpers';

/**
 * 版面檢查（於畫布設計座標 1366×768 下）：
 * 1. 所有元素都在畫布範圍內
 * 2. overflow 非 visible 的容器沒有被裁切的內容
 * 3. 含文字的元素字級 ≥ 20px（依畫布縮放換算為實際像素）
 * 4. 文字彼此不重疊
 */
async function layoutProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const stage = document.querySelector<HTMLElement>('[data-testid="stage"]')!;
    const sr = stage.getBoundingClientRect();
    const scale = sr.width / stage.offsetWidth;
    const problems: string[] = [];
    const label = (el: Element) =>
      `${el.tagName.toLowerCase()}.${(el.getAttribute('class') ?? '').split(' ')[0]}「${(el.textContent ?? '').trim().slice(0, 16)}」`;
    for (const el of stage.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.left < sr.left - 1 || r.top < sr.top - 1 || r.right > sr.right + 1 || r.bottom > sr.bottom + 1) {
        problems.push(`超出畫布：${label(el)}`);
      }
      const style = getComputedStyle(el);
      if (el instanceof HTMLElement && style.overflow !== 'visible') {
        if (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) {
          problems.push(`內容被裁切：${label(el)}`);
        }
      }
      const hasText = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim());
      if (hasText && parseFloat(style.fontSize) * scale < 20 * Math.min(1, scale) - 0.01) {
        problems.push(`字級 ${style.fontSize} < 20px：${label(el)}`);
      }
    }

    // 4. 不同文字片段彼此不重疊（以文字節點的實際排版框判定）
    const boxes: { text: string; r: DOMRect }[] = [];
    const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent!.trim();
      if (!text) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) if (r.width > 0 && r.height > 0) boxes.push({ text, r });
    }
    const TOLERANCE = 3 * scale;
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i].r;
        const b = boxes[j].r;
        const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (w > TOLERANCE && h > TOLERANCE) problems.push(`文字重疊：「${boxes[i].text.slice(0, 12)}」與「${boxes[j].text.slice(0, 12)}」`);
      }
    }
    return problems;
  });
}

const VIEWPORTS = [
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
];

for (const vp of VIEWPORTS) {
  test.describe(`${vp.width}×${vp.height}`, () => {
    test.use({ viewport: vp });

    test('8 頁與附錄皆無溢出、字級 ≥ 20px', async ({ page }) => {
      await openOffline(page);
      for (let p = 1; p <= 8; p++) {
        expect(await layoutProblems(page), `第 ${p} 頁`).toEqual([]);
        await page.keyboard.press('ArrowRight');
      }
      await page.keyboard.press('a');
      expect(await layoutProblems(page), '附錄').toEqual([]);
    });

    test('儀表板各狀態皆無溢出', async ({ page }) => {
      await openOffline(page);
      await page.getByRole('button', { name: '儀表板' }).click();
      for (const name of ['新莊', '三重', '林口', '淡水', '板橋', '烏來']) {
        await page.locator(`path[data-district="${name}"]`).click({ force: true });
        await page.mouse.move(1300, 740);
        expect(await layoutProblems(page), `${name} TOP 10`).toEqual([]);
      }
      await page.getByRole('tab', { name: '新申報案件模擬' }).click();
      for (const scenario of ['未達標區・大規模・房屋建築', '未達標區・非大規模', '達標區・大規模']) {
        await page.getByRole('button', { name: scenario, exact: true }).click();
        expect(await layoutProblems(page), scenario).toEqual([]);
      }
    });
  });
}
