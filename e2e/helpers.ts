import { expect, type Page } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const DIST_URL = pathToFileURL(path.resolve('dist/index.html')).href;

/** 以 file:// 開啟建置結果，並阻擋所有非 file: 請求以模擬離線 */
export async function openOffline(page: Page) {
  const blocked: string[] = [];
  const errors: string[] = [];
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith('file:') || url.startsWith('data:')) return route.continue();
    blocked.push(url);
    return route.abort();
  });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(DIST_URL);
  await expect(page.getByTestId('stage')).toBeVisible();
  return { blocked, errors };
}
