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
  await expect(page.locator('.radar-label').first()).toContainText('%');

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
  await expect(page.locator('.dashboard-metrics strong').first()).toHaveText('20.9');
});

test('loads a regular player career from one indexed archive file', async ({ page }) => {
  const historyRequests = [];
  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.includes('/data/history/')) historyRequests.push(pathname);
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'NBA 数据中心' }).click();
  await page.getByRole('button', { name: '球员', exact: true }).click();
  await page.locator('.player-row-clickable').filter({ hasText: 'A.J. Lawson' }).first().click();
  await expect(page.locator('.dashboard-identity h3')).toHaveText('A.J. Lawson');
  expect(historyRequests.filter((path) => path.endsWith('/player-careers/1630639.json'))).toHaveLength(1);
  expect(historyRequests.filter((path) => path.includes('/history/players/'))).toHaveLength(0);
});

test('restores a shared player dashboard from the URL', async ({ page }) => {
  await page.goto('/?nba=1&player=1630639');
  await expect(page.locator('.dashboard-identity h3')).toHaveText('A.J. Lawson');
  const sharedUrl = new URL(page.url());
  expect(sharedUrl.searchParams.get('nba')).toBe('1');
  expect(sharedUrl.searchParams.get('player')).toBe('1630639');
  await page.getByRole('button', { name: '返回球员列表' }).click();
  expect(new URL(page.url()).searchParams.get('view')).toBe('players');
  expect(new URL(page.url()).searchParams.get('player')).toBeNull();
});

test('provides a usable overview, filterable leaders, and season archive tables', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'NBA 数据中心' }).click();
  await expect(page.locator('.data-overview-grid')).toBeVisible();
  await expect(page.locator('.overview-card')).toHaveCount(4);
  await expect(page.locator('.data-health')).toBeVisible();
  await expect(page.locator('.health-ok')).toHaveCount(4);
  await expect(page.locator('.health-partial')).toHaveCount(1);

  await page.getByRole('button', { name: '排行榜', exact: true }).click();
  await expect(page.locator('.leader-toolbar')).toBeVisible();
  await expect(page.locator('.leader-row-clickable')).toHaveCount(10);
  await page.locator('#leader-metric').selectOption('tsPct');
  await expect(page.locator('.leader-card-heading')).toContainText('真实命中率');
  await expect(page.locator('.leader-row-clickable').first().locator('b')).toContainText('%');
  await page.locator('#leader-min-games').selectOption('40');
  await expect(page.locator('.leader-card-heading')).toContainText('人符合条件');
  await page.locator('.leader-row-clickable').first().click();
  await expect(page.locator('.player-dashboard')).toBeVisible();
  await page.getByRole('button', { name: '返回球员列表' }).click();
  await page.getByRole('button', { name: '历史赛季', exact: true }).click();

  await expect(page.locator('.archive-section-heading').first()).toContainText('赛季球员记录');
  await expect(page.locator('.archive-team-grid .team-card')).toHaveCount(30);
  await expect(page.locator('.archive-section-heading').nth(1)).toContainText('赛季球队记录');
  const widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: window.innerWidth }));
  expect(widths.body).toBe(widths.viewport);
});

test('opens a team dashboard with history and roster data', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const historyRequests = [];
  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.includes('/data/history/')) historyRequests.push(pathname);
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'NBA 数据中心' }).click();
  await page.getByRole('button', { name: '球队', exact: true }).click();
  const lakers = page.locator('.team-card-clickable').filter({ hasText: 'Los Angeles Lakers' }).first();
  await expect(lakers).toBeVisible();
  await lakers.click();
  await expect(page.locator('.team-dashboard')).toBeVisible();
  await expect(page.locator('.team-dashboard h3')).toHaveText('Los Angeles Lakers');
  await expect(page.locator('.team-line-chart')).toBeVisible();
  await expect(page.locator('.team-history-table tbody tr')).toHaveCount(16);
  await expect(page.locator('.team-roster-table tbody tr').first()).toBeVisible();
  expect(historyRequests.filter((path) => path.endsWith('/team-careers/lal.json'))).toHaveLength(1);
  expect(historyRequests.filter((path) => path.includes('/history/teams/'))).toHaveLength(0);
  const widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: window.innerWidth }));
  expect(widths.body).toBe(widths.viewport);
});
