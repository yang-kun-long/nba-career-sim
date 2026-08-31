import { test, expect } from '@playwright/test';

const SAVE_KEY = 'nba_career_save';
const ENDINGS_KEY = 'nba_career_endings';

function createCareer(overrides = {}) {
  const attrs = {
    body: 4,
    athletics: 4,
    offense: 4,
    defense: 4,
    basketball_iq: 4,
    stamina: 4,
    mindset: 4,
    discipline: 4
  };

  return {
    saveVersion: 2,
    playerName: '里程碑测试球员',
    age: 18,
    ...attrs,
    initAttrs: { ...attrs },
    injury: 0,
    reputation: 0,
    team_trust: 0,
    popularity: 0,
    honor: 0,
    salary: 0,
    team: null,
    drafted: false,
    draftPick: 0,
    draftAge: 0,
    nbaYears: 0,
    careerYears: 6,
    championships: 0,
    allStar: 0,
    mvp: 0,
    dpoy: 0,
    allDefensive: 0,
    allNBA: 0,
    traded: 0,
    usedEvents: [],
    log: [],
    yearlyHistory: [],
    eventHistory: [],
    multiEventQueue: [],
    multiEventIndex: 0,
    activeEventId: null,
    activeEventResolved: false,
    activeEventResult: null,
    isRetired: false,
    ending: null,
    draftDeclined: false,
    wentToNCAA: false,
    startPoints: 32,
    _cachedStatsYear: -1,
    _cachedStats: null,
    ...overrides
  };
}

async function loadCareer(page, overrides = {}) {
  const career = createCareer(overrides);
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: SAVE_KEY, value: career });
  await page.reload();
  await page.getByRole('button', { name: '继续游戏' }).click();
  return career;
}

async function readStorage(page, key) {
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), key);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
});

test('offers the NCAA route at age 18 and returns for the age-19 draft decision', async ({ page }) => {
  await loadCareer(page);

  await expect(page.locator('.event-title')).toHaveText('18岁 · 人生抉择');
  await expect(page.getByRole('button', { name: '直接参加今年的选秀' })).toBeVisible();
  await page.getByRole('button', { name: '去NCAA大学联赛征战一年' }).click();

  await expect(page.locator('.game-header')).toContainText('19岁');
  await expect(page.locator('.event-title')).toHaveText('19岁 · 选秀抉择');
  await expect(page.getByText('经过NCAA的磨练')).toBeVisible();

  const saved = await readStorage(page, SAVE_KEY);
  expect(saved.wentToNCAA).toBe(true);
  expect(saved.age).toBe(19);
  expect(saved.log.at(-1).text).toContain('NCAA');
});

test('enters the draft at age 18, shows the result, and starts an NBA career', async ({ page }) => {
  await loadCareer(page, {
    body: 10,
    athletics: 10,
    offense: 10,
    defense: 10,
    basketball_iq: 10,
    stamina: 10,
    mindset: 10,
    discipline: 10,
    startPoints: 80
  });

  await page.getByRole('button', { name: '直接参加今年的选秀' }).click();
  await expect(page.locator('#screen-draft')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'NBA 选秀之夜' })).toBeVisible();
  await expect(page.locator('.draft-result')).toBeVisible();
  await expect(page.locator('.draft-info')).toContainText('你今年18岁');
  await expect(page.locator('.team-pick').first()).toContainText(/第 \d+ 顺位/);
  await expect(page.getByText('你的NBA生涯正式开始！')).toBeVisible();

  await page.getByRole('button', { name: '开启 NBA 生涯' }).click();
  await expect(page.locator('#screen-game')).toBeVisible();
  await expect(page.locator('.game-header')).not.toContainText('自由球员');

  const saved = await readStorage(page, SAVE_KEY);
  expect(saved.drafted).toBe(true);
  expect(saved.draftAge).toBe(18);
  expect(saved.draftPick).toBeGreaterThanOrEqual(1);
  expect(saved.draftPick).toBeLessThanOrEqual(5);
});

const undraftedChoices = [
  {
    name: '去欧洲联赛打球，曲线救国',
    expectedEffect: '球商视野 +1',
    assertState: (saved) => expect(saved.basketball_iq).toBe(1)
  },
  {
    name: '留在美国打发展联盟，等待NBA机会',
    expectedEffect: '进攻技术 +1',
    assertState: (saved) => expect(saved.discipline).toBe(1)
  },
  {
    name: '接受现实，放弃篮球',
    expectedEffect: '心态抗压 -2',
    assertState: (saved) => expect(saved.mindset).toBe(3)
  }
];

for (const choice of undraftedChoices) {
  test(`offers the undrafted follow-up choice: ${choice.name}`, async ({ page }) => {
    await loadCareer(page, {
      age: 22,
      body: 0,
      athletics: 0,
      offense: 0,
      defense: 0,
      basketball_iq: 0,
      stamina: 0,
      mindset: 5,
      discipline: 0,
      careerYears: 10,
      startPoints: 5
    });

    await page.getByRole('button', { name: '参加今年的选秀' }).click();
    await expect(page.locator('#screen-draft')).toBeVisible();
    await expect(page.locator('.draft-result')).toBeVisible();
    await expect(page.locator('.draft-info')).toContainText('你今年22岁');
    await expect(page.locator('.draft-miss')).toHaveText('落选');

    await page.getByRole('button', { name: '继续寻找机会' }).click();
    await expect(page.locator('.event-title')).toHaveText('选秀落选 · 人生抉择');
    for (const option of undraftedChoices) {
      await expect(page.getByRole('button', { name: option.name })).toBeVisible();
    }

    await page.getByRole('button', { name: choice.name }).click();
    await expect(page.locator('.event-result')).toContainText(choice.expectedEffect);

    const saved = await readStorage(page, SAVE_KEY);
    expect(saved.draftDeclined).toBe(true);
    expect(saved.activeEventResolved).toBe(true);
    choice.assertState(saved);
  });
}

test('confirms retirement, unlocks its ending, and restores the ending after refresh', async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.99;
  });
  await loadCareer(page, {
    playerName: '退役验收球员',
    age: 35,
    body: 4,
    athletics: 4,
    offense: 5,
    defense: 4,
    basketball_iq: 4,
    stamina: 5,
    mindset: 5,
    discipline: 5,
    team_trust: 3,
    salary: 2,
    team: 'lakers',
    drafted: true,
    draftPick: 20,
    draftAge: 20,
    nbaYears: 5,
    careerYears: 5,
    startPoints: 36
  });

  await page.getByRole('button', { name: '退役', exact: true }).click();
  await expect(page.getByRole('heading', { name: '退役确认' })).toBeVisible();
  await expect(page.getByText('你确定要在35岁退役吗？')).toBeVisible();
  await page.getByRole('button', { name: '确认退役' }).click();

  await expect(page.locator('#screen-ending')).toBeVisible();
  await expect(page.getByRole('heading', { name: '业余球王' })).toBeVisible();
  await expect(page.locator('.ending-stats')).toContainText('退役验收球员');
  await expect(page.locator('.ending-stats')).toContainText('35岁');
  await expect(page.locator('.ending-stats')).toContainText('第20顺位');

  const retiredSave = await readStorage(page, SAVE_KEY);
  const unlockedEndings = await readStorage(page, ENDINGS_KEY);
  expect(retiredSave.isRetired).toBe(true);
  expect(retiredSave.ending).toBe('end_retire_05');
  expect(unlockedEndings).toContain('end_retire_05');

  await page.getByRole('button', { name: '查看图鉴' }).click();
  const unlockedCard = page.locator('.gallery-item').filter({ hasText: '业余球王' });
  await expect(unlockedCard).toBeVisible();
  await expect(unlockedCard).not.toHaveClass(/locked/);

  await page.reload();
  await page.getByRole('button', { name: '继续游戏' }).click();
  await expect(page.locator('#screen-ending')).toBeVisible();
  await expect(page.getByRole('heading', { name: '业余球王' })).toBeVisible();
  await expect(page.locator('.ending-stats')).toContainText('退役验收球员');
});
