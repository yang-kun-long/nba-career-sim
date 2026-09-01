# NBA 数据初始化与日常刷新

## 数据范围

仓库当前包含一次本地历史初始化：`2010-11` 至 `2025-26`，按赛季保存球员和球队的常规赛聚合数据。历史目录约 3.7 MB，按赛季拆分，适合 Cloudflare Pages 静态发布。

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

历史任务完成后运行 `npm run build`，确认 JSON 被复制到 `dist/data`，再提交数据基线。

## 每日刷新

`.github/workflows/data-refresh.yml` 每天 UTC `08:30` 运行，也支持手动触发。它只替换 `manifest.json`、`games/today.json`、当前球队、球员和排行榜文件，保留 `history/` 不动。

NBA.com 接口偶尔会返回 `403`、超时或空响应。统计接口失败会让任务失败并阻止部署；实时比分失败会产生 `partial` 快照，当前统计仍可部署，页面会显示数据源状态。这样不会因为当天比分接口暂时不可用而让整个站点下线。

## 数据边界

首版只抓取赛季级聚合数据。逐场日志、Play-by-Play 和视频数据应作为后续按需数据集，不要直接混入主 Bundle。每次历史数据写入都应按赛季分片，避免单个静态文件超过托管平台的文件大小限制。

詹姆斯是首个精选档案：`refresh_nba_data.py` 每日调用 `PlayerCareerStats(player_id=2544)`，保存 23 个常规赛赛季、19 个季后赛赛季、21 个全明星赛季及生涯总计。后续增加其他精选球员时，沿用 `public/data/players/{id}.json` 文件契约，不要把详细档案塞进普通球员索引。
