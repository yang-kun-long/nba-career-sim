# 新对话提示词

请继续处理 `D:\ykl\nba-career-sim` 项目，不要从头规划，直接基于仓库现状实施。

项目已经完成 Vue 3 + Vite + Pinia 迁移，并已部署：

- GitHub：https://github.com/yang-kun-long/nba-career-sim
- Cloudflare Pages：https://nba-career-sim.pages.dev/

当前架构重点：

- `src/stores/game.js`：Pinia 状态、存档和 UI 导航
- `src/stores/game-state.js`：存档兼容和初始状态
- `src/stores/game-draft.js`：选秀和 NCAA 逻辑
- `src/stores/game-flow.js`：年度推进、事件、选秀衔接和退役流程
- `tests/e2e/career-flow.spec.js`：已有基础 Playwright E2E
- `.github/workflows/ci-cd.yml`：GitHub Actions 验证和 Cloudflare Pages 部署

请完成下面两项，并直接修改代码：

1. 增加选秀流程 E2E 测试
   - 覆盖 18 岁选秀选择
   - 覆盖 NCAA 选择分支
   - 覆盖参加选秀和选秀结果页
   - 覆盖落选后的后续选择

2. 增加退役结局 E2E 测试
   - 覆盖退役确认
   - 覆盖结局摘要和结局图鉴解锁
   - 覆盖刷新后恢复结局页

要求：

- 使用现有 Playwright 配置，不引入不必要的框架
- 测试必须隔离并清理 `localStorage`
- 优先通过现有 UI 或受控存档构造测试状态，避免长时间随机推进
- 使用 Chrome MCP 做最终浏览器验收
- 修改后运行：`npm test`、`npm run test:e2e`、`npm run build`
- 保留 `legacy.html`、`js/`、`css/` 旧版归档
- 不输出或提交任何 GitHub/Cloudflare Secret
- 最终说明改动文件、测试结果和是否需要更新 Cloudflare 部署

开始前先阅读 `HANDOFF.md`、`playwright.config.js`、`tests/e2e/career-flow.spec.js`、`src/stores/game-flow.js` 和相关组件，然后直接实施。
