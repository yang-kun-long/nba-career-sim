import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
});

test('creates a player, preserves the name during allocation, and restores a saved event', async ({ page }) => {
  await page.getByRole('button', { name: '新游戏' }).click();
  await expect(page.getByRole('heading', { name: '创建你的球员' })).toBeVisible();

  const name = page.locator('#player-name');
  await name.fill('E2E测试球员');
  await page.getByRole('button', { name: '随机分配' }).click();
  await expect(name).toHaveValue('E2E测试球员');
  await expect(page.locator('.point-bar')).toContainText('0');

  await page.getByRole('button', { name: '确认开始' }).click();
  await expect(page.locator('#screen-game')).toBeVisible();
  await expect(page.locator('.event-title')).not.toBeEmpty();

  const choices = page.locator('.event-choices button');
  if (await choices.count()) {
    await choices.first().click();
  }
  await expect(page.locator('.event-result')).toBeVisible();
  await page.getByRole('button', { name: '存档' }).click();
  await expect(page.getByText('存档成功！')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: '继续游戏' })).toBeVisible();
  await page.getByRole('button', { name: '继续游戏' }).click();
  await expect(page.locator('#screen-game')).toBeVisible();
  await expect(page.locator('.game-header')).toContainText('E2E测试球员');
  await expect(page.locator('.event-result')).toBeVisible();
});

test('reset clears allocation without clearing the player name', async ({ page }) => {
  await page.getByRole('button', { name: '新游戏' }).click();
  const name = page.locator('#player-name');
  await name.fill('保留姓名');
  await page.getByRole('button', { name: '随机分配' }).click();
  await page.getByRole('button', { name: '重置' }).click();

  await expect(name).toHaveValue('保留姓名');
  await expect(page.locator('.point-bar')).toContainText('50');
  expect(await page.locator('input[type="number"]').evaluateAll((inputs) => inputs.every((input) => input.value === '0'))).toBe(true);
});
