import { expect, type Page } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** 預設測試本機建置結果；設定 SITE_URL 可改測已部署的網站 */
export const TARGET_URL = process.env.SITE_URL ?? pathToFileURL(path.resolve('dist/index.html')).href;

/** 開啟網站，並阻擋所有非本站請求（外部 CDN、字型、圖磚等）以確認可離線運作 */
export async function openOffline(page: Page) {
  const blocked: string[] = [];
  const errors: string[] = [];
  const allowed = (url: string) =>
    url.startsWith('data:') || (process.env.SITE_URL ? url.startsWith(process.env.SITE_URL) : url.startsWith('file:'));
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (allowed(url)) return route.continue();
    blocked.push(url);
    return route.abort();
  });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(TARGET_URL);
  await expect(page.getByTestId('stage')).toBeVisible();
  return { blocked, errors };
}
