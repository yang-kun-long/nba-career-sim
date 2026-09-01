# NBA 终身篮球生涯模拟器

一个从 12 岁开始、通过年度事件和人生选择模拟 NBA 生涯的文字回合制游戏。

项目已经迁移到 Vue 3 + Vite + Pinia，旧版静态实现保留在 `legacy.html`、`js/` 和 `css/` 中，作为迁移期间的对照与回退版本。

## 项目来源与迁移

本仓库基于 [bushenghan22/nba-career-sim](https://github.com/bushenghan22/nba-career-sim) 的静态 HTML/CSS/JavaScript 项目进行 Vue 架构迁移。原始实现由 GitHub 用户 [bushenghan22](https://github.com/bushenghan22) 发布，迁移所依据的代码可追溯至原仓库提交 [`14b5af6`](https://github.com/bushenghan22/nba-career-sim/commit/14b5af609a58b799554e68016940e95ef8d09dfa)。

当前仓库是迁移时重新初始化的 Git 仓库，因此 GitHub 页面不会将其显示为 fork；这不改变原项目的作者归属。原始文件按原貌保存在：

- `legacy.html`：对应原项目的 `index.html`
- `js/`：原版游戏逻辑
- `css/`：原版页面样式

在此基础上，当前版本完成了 Vue 3 组件化、Pinia 状态管理、存档兼容、自动化测试、CI/CD 和 Cloudflare Pages 部署。

## 许可与版权

截至 2026-09-01，原项目仓库未包含 `LICENSE`、`COPYING` 或其他明确的开源许可。因此，本仓库不能代替原作者将继承代码声明为 MIT、Apache-2.0 等开源许可证，当前 npm 许可状态标记为 `UNLICENSED`。

原始静态实现的权利归原作者所有；Vue 迁移及后续修改由本仓库贡献者维护。复制、再分发、再许可或商业使用前，应先取得相应权利人的许可。完整说明见 [LICENSE](LICENSE)。

## 技术栈

- Vue 3：页面组件和响应式视图
- Pinia：游戏状态和流程编排
- Vite：开发服务器与生产构建
- Vitest：核心逻辑单元测试
- Playwright：浏览器端 E2E 测试
- Cloudflare Pages：静态站点部署

## NBA 官方数据

项目通过 GitHub Actions 定时任务使用 `nba_api` 读取 NBA.com 数据，并生成前端可直接消费的版本化静态 JSON。浏览器不会直接请求 NBA.com，游戏引擎也不依赖第三方接口的原始字段。

- 历史基线：`2010-11` 至 `2025-26` 的赛季级球员、球队聚合数据
- 历史档案：普通球员按 ID 生成 `history/player-careers/{playerId}.json`，球队按 ID 生成 `history/team-careers/{teamId}.json`；看板打开时只请求对应的单个档案
- 每日快照：当天比赛、当前球队、当前球员统计和排行榜；未指定赛季时按日期自动推导当前 NBA 赛季
- 统计口径：普通球员历史和詹姆斯赛季记录统一使用场均值；詹姆斯档案的每行同时保留原始总量
- 精选档案：詹姆斯（球员 ID `2544`）独立保存 `2003-04` 至今的完整生涯资料，包含逐赛季常规赛、季后赛、全明星与生涯总计
- 数据健康：manifest 会记录比赛、球队、球员、榜单和精选档案的独立状态与条目数，部署前会校验声明值和实际文件一致
- 失败策略：统计数据校验失败时不部署；实时比分失败时保留可用统计并标记 `partial`
- 数据中心：首页进入“NBA 数据中心”可查看当前和历史赛季数据

历史档案索引由 `npm run data:index` 生成，`npm run dev` 和 `npm run build` 会自动执行；生成目录被 `.gitignore` 忽略，CI/CD 和每日刷新 Action 会在构建前重建并运行 `--check` 校验。

历史初始化和日常刷新命令见 [NBA 数据初始化与日常刷新](docs/nba-data-bootstrap.md)。

## 快速开始

```bash
npm install
npm run dev
```

开发服务器默认地址为 `http://127.0.0.1:5173/`。

## 测试与构建

```bash
# 单元测试
npm test

# Chrome E2E 测试
npm run test:e2e

# 生产构建
npm run build

# 本地预览生产构建
npm run preview
```

E2E 测试默认使用本机 Chrome。Windows 默认路径为 `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`；其他路径可通过 `CHROME_PATH` 指定。CI 会自动安装 Playwright Chromium。

## 项目结构

```text
src/
  components/       游戏屏幕和共享展示组件
  core/             游戏引擎、球队、事件和结局数据
  stores/
    game.js         Pinia 状态声明、存档和 UI 导航
    game-state.js   初始属性、存档版本和兼容处理
    game-draft.js   选秀估算、选秀分支和 NCAA 逻辑
    game-flow.js    年度推进、事件选择和退役流程
tests/
  *.test.js         Vitest 单元测试
  e2e/              Playwright 浏览器测试
legacy.html         迁移前的静态版本
wrangler.toml       Cloudflare Pages 配置
```

## 存档

存档保存在浏览器 `localStorage`，键名为 `nba_career_save`；结局解锁记录使用 `nba_career_endings`。Vue 版本会兼容旧版存档，并通过 `saveVersion` 进行版本标记。

## GitHub Actions

工作流位于 `.github/workflows/ci-cd.yml`：

- Pull Request：安装 Python 环境、重建并校验 NBA 历史档案索引、安装 Node 依赖和浏览器，运行单元测试、E2E 测试和生产构建
- 推送到 `main`：先完成同样的校验，再部署到 Cloudflare Pages
- 每日刷新：每天北京时间 00:00 拉取当前赛季快照；数据接口失败会做 3 轮延迟重试，将当前赛季合并到历史分片，重建球员/球队档案索引，校验后部署
- 失败保护：统计接口三轮重试仍失败时保留上一份已发布快照、不执行部署，并自动创建或更新一个 GitHub Issue；仅实时比赛接口失败时仍可发布可用统计并标记 `partial`
- `workflow_dispatch`：支持手动触发

要启用主分支自动部署，需要在 GitHub 仓库的 Settings → Secrets and variables → Actions 中添加：

- `CLOUDFLARE_API_TOKEN`：仅授予 Pages 部署权限的 API Token
- `CLOUDFLARE_ACCOUNT_ID`：Cloudflare Account ID

## Cloudflare Pages

生产构建目录为 `dist/`，Pages 项目名为 `nba-career-sim`。本地部署命令：

```bash
npm run build
npx wrangler pages deploy dist --project-name nba-career-sim --branch main
```
