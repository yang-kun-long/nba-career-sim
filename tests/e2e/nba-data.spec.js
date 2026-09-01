import { test, expect } from '@playwright/test';

test('opens a regular player history dashboard without mobile page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'NBA 数据中心' }).click();
  await page.getByRole('button', { name: '球员', exact: true }).click();
  await expect(page.locator('.player-table')).toBeVisible();

  const lawson = page.locator('.player-row-clickable').filter({ hasText: 'A.J. Lawson' }).first();
  await expect(lawson).toBeVisible();
  await lawson.click();
  await expect(page.locator('.dashboard-identity h3')).toHaveText('A.J. Lawson');
  await expect(page.locator('.dashboard-source')).toContainText('2010-11 至今');
  await expect(page.locator('.dashboard-table tbody tr')).toHaveCount(4);
  await expect(page.locator('.dashboard-tabs .data-tab').nth(1)).toBeDisabled();
  await expect(page.locator('.dashboard-tabs .data-tab').nth(2)).toBeDisabled();

  const widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: window.innerWidth }));
  expect(widths.body).toBe(widths.viewport);
});

test('keeps the featured LeBron archive separate from season snapshots', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'NBA 数据中心' }).click();
  await page.getByRole('button', { name: '球员', exact: true }).click();
  await expect(page.locator('.featured-player')).toBeVisible();
  await page.getByRole('button', { name: '打开完整球员看板' }).click();
  await expect(page.locator('.dashboard-identity h3')).toHaveText('LeBron James');
  await expect(page.locator('.dashboard-source')).toContainText('生涯档案');
  await expect(page.locator('.dashboard-table tbody tr')).toHaveCount(23);
});

test('provides a usable overview, official leaders, and season archive tables', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'NBA 数据中心' }).click();
  await expect(page.locator('.data-overview-grid')).toBeVisible();
  await expect(page.locator('.overview-card')).toHaveCount(4);

  await page.getByRole('button', { name: '排行榜', exact: true }).click();
  await expect(page.locator('.leader-card').first()).toContainText('Luka');

  await page.getByRole('button', { name: '历史赛季', exact: true }).click();
  await expect(page.locator('.archive-section-heading').first()).toContainText('赛季球员记录');
  await expect(page.locator('.archive-team-grid .team-card')).toHaveCount(30);
  await expect(page.locator('.archive-section-heading').nth(1)).toContainText('赛季球队记录');
  const widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: window.innerWidth }));
  expect(widths.body).toBe(widths.viewport);
});

test('opens a team dashboard with history and roster data', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'NBA 数据中心' }).click();
  await page.getByRole('button', { name: '球队', exact: true }).click();
  const lakers = page.locator('.team-card-clickable').filter({ hasText: 'Los Angeles Lakers' }).first();
  await expect(lakers).toBeVisible();
  await lakers.click();
  await expect(page.locator('.team-dashboard')).toBeVisible();
  await expect(page.locator('.team-dashboard h3')).toHaveText('Los Angeles Lakers');
  await expect(page.locator('.team-history-table tbody tr')).toHaveCount(16);
  await expect(page.locator('.team-roster-table tbody tr').first()).toBeVisible();
  const widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: window.innerWidth }));
  expect(widths.body).toBe(widths.viewport);
});
