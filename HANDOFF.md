# 项目交接文档

更新时间：2026-09-01

## 项目概况

项目名称：NBA 终身篮球生涯模拟器

这是一个从 12 岁开始，通过年度事件、选秀和人生选择模拟 NBA 生涯的文字回合制游戏。

当前线上地址：

- Cloudflare Pages：https://nba-career-sim.pages.dev/
- 最近一次不可变部署：https://5416e469.nba-career-sim.pages.dev

GitHub 仓库：

- https://github.com/yang-kun-long/nba-career-sim
- 当前仓库为私有仓库
- 默认分支：`main`

## 当前架构

项目已从旧版静态 HTML/全局 JavaScript 迁移到 Vue 3 + Vite + Pinia。

```text
src/
  components/       各游戏屏幕和共享展示组件
  core/             游戏引擎、球队、事件和结局数据
  stores/
    game.js         Pinia 状态声明、存档和 UI 导航
    game-state.js   初始属性、存档版本和旧存档兼容
    game-draft.js   选秀估算、选秀分支和 NCAA 逻辑
    game-flow.js    年度推进、事件选择、选秀衔接和退役流程
tests/
  *.test.js         Vitest 单元测试
  e2e/              Playwright 浏览器测试
legacy.html         迁移前的静态版本
js/                 旧版 JavaScript 归档
css/                旧版 CSS 归档
```

## 已完成内容

- Vue 3 + Vite + Pinia 迁移完成
- 游戏引擎、球队、事件、结局拆成 ES Modules
- Pinia Store 已拆分为状态、选秀和年度流程模块
- 存档会记录当前事件解决状态，刷新不会重复应用事件效果
- 17 岁到 18 岁推进时年龄和选秀状态正确保存
- 选秀结果、退役结局和结局页数据可以恢复
- 统计、属性、历史、结局页使用共享展示组件
- “随机分配”和“重置”会保留已输入的球员姓名
- 属性输入框已有 `id/name`，入口已有 favicon
- 已加入 Playwright E2E 测试
- 已删除重复的 `index-vue.html`
- 旧版实现未删除，继续作为回退归档

## 测试状态

本地验证命令：

```bash
npm test
npm run test:e2e
npm run build
```

当前结果：

- Vitest：12/12 通过
- Playwright：2/2 通过
- Vite production build：通过
- Chrome MCP 线上验收：首页正常，控制台无运行时错误

已有 E2E：

- 创建球员、随机分配、姓名保留
- 确认开始、选择普通事件、存档、刷新和继续游戏
- 重置属性但保留姓名

## Git 和 GitHub Actions

最近提交：

```text
84040e9 ci: configure GitHub checks and Cloudflare Pages deployment
0581e4d chore: replace GitHub Pages workflow with Cloudflare deployment
b29594c feat: migrate NBA career simulator to Vue and add CI/CD
```

工作流文件：`.github/workflows/ci-cd.yml`

- Pull Request 触发 Verify
- 推送到 `main` 触发 Verify 和 Cloudflare Pages 部署
- `workflow_dispatch` 支持手动运行 Verify 和部署
- Verify 包含 `npm ci`、Playwright Chromium 安装、单元测试、E2E 测试和生产构建
- Deploy 使用 `cloudflare/wrangler-action@v3`
- 使用 `actions/checkout@v5` 和 `actions/setup-node@v5`

最近一次完整成功运行：

- https://github.com/yang-kun-long/nba-career-sim/actions/runs/33413069821
- Verify：成功
- Deploy Cloudflare Pages：成功

GitHub Secrets 已配置：

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

注意：当前 `CLOUDFLARE_API_TOKEN` 是从本机 Wrangler OAuth 登录态临时提取的访问令牌，有过期时间。长期使用前，应在 Cloudflare 创建长期 API Token，并替换同名 GitHub Secret。不要把任何 Token 写入代码、README 或提交记录。

## Cloudflare

配置文件：`wrangler.toml`

```toml
name = "nba-career-sim"
compatibility_date = "2026-08-31"
pages_build_output_dir = "./dist"
```

本地部署：

```bash
npm run build
npx wrangler pages deploy dist --project-name nba-career-sim --branch main
```

当前 Cloudflare Pages 项目已经创建，生产分支为 `main`。

## 下一步任务

优先补齐两条关键业务分支的 Playwright E2E：

1. 选秀流程
   - 构造或推进到 18 岁选秀选择页
   - 覆盖选择 NCAA
   - 覆盖参加选秀并进入选秀结果页
   - 覆盖落选后的欧洲联赛、发展联盟和放弃篮球分支

2. 退役结局
   - 构造可退役存档或推进到退役条件
   - 点击退役并确认
   - 验证结局页、结局摘要和结局图鉴解锁
   - 刷新页面后验证仍恢复到结局页

实现这些测试时：

- 优先使用现有 Playwright 配置和页面语义定位
- 测试之间清理 `localStorage`
- 不删除 `legacy.html`、`js/`、`css/`
- 每次修改后运行 `npm test`、`npm run test:e2e` 和 `npm run build`
- 需要浏览器验收时使用 Chrome MCP

## 重要约束

- 当前不是从远程重新初始化项目，工作目录就是 `D:\ykl\nba-career-sim`
- Git 工作区最近已干净，远程为 `origin=https://github.com/yang-kun-long/nba-career-sim.git`
- 不要执行 `git reset --hard` 或覆盖用户已有改动
- 不要输出或提交 Cloudflare/GitHub 凭据
- 这是前端静态项目，目前不需要引入后端或数据库
- 不要为了单页状态机引入 Vue Router
