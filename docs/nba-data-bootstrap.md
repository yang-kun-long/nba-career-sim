# NBA 数据初始化与日常刷新

## 数据范围

仓库当前包含一次本地历史初始化：`2010-11` 至 `2025-26`，按赛季保存球员和球队的常规赛聚合数据。历史目录约 3.7 MB，按赛季拆分，适合 Cloudflare Pages 静态发布；构建时会额外生成按实体拆分的档案索引，避免看板为一个球员读取全部赛季文件。

当前快照目录保存每日会替换的数据：

```text
public/data/
  manifest.json
  games/today.json
  teams/index.json
  players/index.json
  leaders/index.json
  players/2544.json                 # 詹姆斯精选全生涯档案
  history/players/{season}.json
  history/teams/{season}.json
  history/player-careers/{playerId}.json
  history/team-careers/{teamId}.json
```

`history/player-careers/` 和 `history/team-careers/` 是由脚本生成的构建产物，不提交到 Git；本地 `predev` / `prebuild`、CI/CD 和每日刷新 Action 都会自动重建。生成后可单独校验：

```powershell
python scripts/build_nba_history_indexes.py --data-root public/data --check
```

## 首次或扩展历史基线

在本地稳定网络执行。这个任务不会写入 NBA 原始响应，只写入清洗后的 JSON：

```powershell
uv run --with "nba_api>=1.11.4,<2" --with "pandas>=2.2" `
  python scripts/bootstrap_nba_history.py `
  --output public/data `
  --from-season 2010-11 `
  --to-season 2025-26
```

建议先用单赛季验证接口：

```powershell
uv run --with "nba_api>=1.11.4,<2" --with "pandas>=2.2" `
  python scripts/bootstrap_nba_history.py `
  --from-season 2024-25 `
  --to-season 2024-25 `
  --retries 1
```

历史任务完成后运行 `npm run data:index` 和 `npm run build`，确认 JSON 被复制到 `dist/data`，再提交数据基线。

## 每日刷新

`.github/workflows/data-refresh.yml` 每天北京时间 `00:00`（UTC `16:00`）运行，也支持手动触发。手动输入赛季时使用输入值；留空则由 `refresh_nba_data.py` 根据日期自动推导当前 NBA 赛季。统计抓取失败会在 Action 内做 3 轮延迟重试；三轮仍失败时保留上一份已发布快照、不执行部署，并自动创建或更新一个 GitHub Issue。它替换 `manifest.json`、`games/today.json`、当前球队、球员和排行榜文件，并用 `--merge-current` 将当天的当前赛季快照写回 `history/players/{season}.json` 与 `history/teams/{season}.json`，随后重建两个实体档案目录。

`manifest.json` 的 `dataHealth` 记录每个数据模块的 `status`、更新时间和条目数。Action 会在部署前核对这些声明与实际 JSON 文件；比赛接口暂时不可用时状态为 `partial`，不会掩盖球队或球员统计是否正常。

NBA.com 接口偶尔会返回 `403`、超时或空响应。统计接口失败会让任务失败并阻止部署；实时比分失败会产生 `partial` 快照，当前统计仍可部署，页面会显示数据源状态。这样不会因为当天比分接口暂时不可用而让整个站点下线。

## 数据边界

首版只抓取赛季级聚合数据。逐场日志、Play-by-Play 和视频数据应作为后续按需数据集，不要直接混入主 Bundle。原始历史仍按赛季分片，实体档案按球员/球队分片，避免单个静态文件超过托管平台的文件大小限制。

詹姆斯是首个精选档案：`refresh_nba_data.py` 每日调用 `PlayerCareerStats(player_id=2544)`，保存完整常规赛、季后赛、全明星赛季及生涯总计。赛季记录统一存储为场均值，原始计数保存在每行的 `totals` 字段；后续增加其他精选球员时，沿用 `public/data/players/{id}.json` 文件契约，不要把详细档案塞进普通球员索引。
