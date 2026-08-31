# NBA 终身篮球生涯模拟器

一个从 12 岁开始、通过年度事件和人生选择模拟 NBA 生涯的文字回合制游戏。

项目已经迁移到 Vue 3 + Vite + Pinia，旧版静态实现保留在 `legacy.html`、`js/` 和 `css/` 中，作为迁移期间的对照与回退版本。

## 技术栈

- Vue 3：页面组件和响应式视图
- Pinia：游戏状态和流程编排
- Vite：开发服务器与生产构建
- Vitest：核心逻辑单元测试
- Playwright：浏览器端 E2E 测试
- Cloudflare Pages：静态站点部署

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

- Pull Request：安装依赖、安装浏览器、运行单元测试、E2E 测试和生产构建
- 推送到 `main`：先完成同样的校验，再部署到 Cloudflare Pages
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

