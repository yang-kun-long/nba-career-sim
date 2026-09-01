<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  team: { type: Object, required: true },
  roster: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' }
});
const emit = defineEmits(['back', 'open-player']);

const historyRows = computed(() => props.team.history || []);
const latestSeason = computed(() => historyRows.value.at(-1)?.season || '当前赛季');
const roster = computed(() => [...props.roster].sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0)));
const record = computed(() => props.team.record || {});
const rank = computed(() => props.team.rank ?? record.value.rank);
const activeTeamTrend = ref(null);
const teamLineX = (index) => historyRows.value.length <= 1 ? 380 : 50 + (index * 660) / (historyRows.value.length - 1);
const teamLineY = (value) => 200 - Math.max(0, Math.min(1, Number(value) || 0)) * 170;
const teamTrendPoints = computed(() => historyRows.value.map((row, index) => `${teamLineX(index).toFixed(1)},${teamLineY(row.winPct).toFixed(1)}`).join(' '));
const teamTrendLabels = computed(() => historyRows.value.filter((_, index) => historyRows.value.length <= 8 || index === 0 || index === historyRows.value.length - 1 || index % 4 === 0).map((row) => ({ label: row.season, index: historyRows.value.indexOf(row) })));
const teamTrendDetail = (row, index) => {
  activeTeamTrend.value = { season: row.season, index, wins: row.wins, losses: row.losses, winPct: row.winPct };
};
const pct = (value) => {
  if (value === null || value === undefined) return '-';
  const numeric = Number(value);
  return `${(numeric <= 1 ? numeric * 100 : numeric).toFixed(1)}%`;
};
const number = (value) => value === null || value === undefined ? '-' : Number(value).toFixed(1);
</script>

<template>
  <div class="team-dashboard">
    <div class="dashboard-toolbar"><button class="btn-sm" @click="emit('back')">返回球队列表</button><span class="dashboard-source">NBA.com 当前赛季 + 历史赛季</span></div>
    <div v-if="loading" class="data-loading compact dashboard-loading">正在读取 {{ team.name }} 的历史战绩…</div>
    <div v-if="error" class="data-alert dashboard-alert">{{ error }}</div>

    <header class="dashboard-hero team-dashboard-hero"><div class="dashboard-identity"><div class="team-mark-large">{{ team.abbreviation || team.id?.toUpperCase() }}</div><div><p class="view-kicker">TEAM PROFILE</p><h3>{{ team.name }}</h3><p>{{ team.city || 'NBA' }} · {{ team.conference || 'NBA' }} · {{ latestSeason }}</p></div></div><div class="dashboard-facts"><span v-if="team.division">{{ team.division }} 分区</span><span v-if="rank">联盟排名 {{ rank }}</span><span>数据来自 NBA.com</span></div></header>

    <section class="dashboard-metrics team-metrics"><div><span>胜场</span><strong>{{ record.wins ?? '-' }}</strong><small>{{ latestSeason }}</small></div><div><span>负场</span><strong>{{ record.losses ?? '-' }}</strong><small>{{ latestSeason }}</small></div><div><span>胜率</span><strong>{{ pct(record.winPct) }}</strong><small>常规赛</small></div><div><span>阵容人数</span><strong>{{ roster.length }}</strong><small>当前快照</small></div></section>

    <section class="dashboard-card team-trend-card"><div class="dashboard-card-heading"><div><span class="view-kicker">WIN PERCENTAGE</span><h4>胜率走势</h4></div><span class="dashboard-caption">{{ historyRows.length }} 个赛季</span></div><div v-if="historyRows.length" class="line-chart-wrap"><svg class="line-chart team-line-chart" viewBox="0 0 760 230" preserveAspectRatio="none" role="img" aria-label="球队历史胜率折线图"><line v-for="tick in [0, 0.5, 1]" :key="tick" x1="45" :y1="teamLineY(tick)" x2="710" :y2="teamLineY(tick)" class="chart-grid-line" /><text v-for="tick in [0, 0.5, 1]" :key="`team-label-${tick}`" x="38" :y="teamLineY(tick) + 4" class="chart-y-label">{{ Math.round(tick * 100) }}%</text><polyline :points="teamTrendPoints" class="chart-line points-line" /><circle v-for="(row, index) in historyRows" :key="`team-point-${index}`" :cx="teamLineX(index)" :cy="teamLineY(row.winPct)" r="3.5" class="chart-dot points-dot" tabindex="0" role="button" @mouseenter="teamTrendDetail(row, index)" @focus="teamTrendDetail(row, index)" @click="teamTrendDetail(row, index)" @mouseleave="activeTeamTrend = null" @blur="activeTeamTrend = null"><title>{{ row.season }} · {{ row.wins ?? '-' }} 胜 {{ row.losses ?? '-' }} 负 · 胜率 {{ pct(row.winPct) }}</title></circle><text v-for="label in teamTrendLabels" :key="label.label" :x="teamLineX(label.index)" y="222" class="chart-x-label">{{ label.label }}</text></svg><div v-if="activeTeamTrend" class="chart-detail"><strong>{{ activeTeamTrend.season }}</strong><span>{{ activeTeamTrend.wins ?? '-' }} 胜 {{ activeTeamTrend.losses ?? '-' }} 负</span><span>胜率 {{ pct(activeTeamTrend.winPct) }}</span></div></div><div v-else class="dashboard-empty">暂无历史战绩</div></section>

    <section class="dashboard-card team-history-card"><div class="dashboard-card-heading"><div><span class="view-kicker">TEAM LOG</span><h4>球队历史战绩</h4></div><span class="dashboard-caption">{{ historyRows.length }} 个赛季</span></div><div v-if="historyRows.length" class="dashboard-table-wrap"><table class="dashboard-table team-history-table"><thead><tr><th>赛季</th><th>胜</th><th>负</th><th>胜率</th><th>排名</th></tr></thead><tbody><tr v-for="row in historyRows" :key="row.season"><td><strong>{{ row.season }}</strong></td><td>{{ row.wins ?? '-' }}</td><td>{{ row.losses ?? '-' }}</td><td>{{ pct(row.winPct) }}</td><td>{{ row.rank ?? '-' }}</td></tr></tbody></table></div><div v-else class="dashboard-empty">暂无历史战绩</div></section>

    <section class="dashboard-card team-roster-card"><div class="dashboard-card-heading"><div><span class="view-kicker">CURRENT ROSTER</span><h4>当前阵容</h4></div><span class="dashboard-caption">{{ roster.length }} 名球员</span></div><div v-if="roster.length" class="dashboard-table-wrap"><table class="dashboard-table team-roster-table"><thead><tr><th>球员</th><th>位置</th><th>场次</th><th>得分</th><th>篮板</th><th>助攻</th><th>命中率</th><th aria-label="操作"></th></tr></thead><tbody><tr v-for="player in roster" :key="player.id" class="player-row-clickable" tabindex="0" role="button" @click="emit('open-player', player.id)" @keydown.enter="emit('open-player', player.id)"><td><strong>{{ player.fullName }}</strong><small>{{ player.age ? `${Math.round(player.age)} 岁` : '—' }}</small></td><td>{{ player.position || '-' }}</td><td>{{ player.stats?.gp ?? '-' }}</td><td>{{ number(player.stats?.points) }}</td><td>{{ number(player.stats?.rebounds) }}</td><td>{{ number(player.stats?.assists) }}</td><td>{{ pct(player.stats?.fgPct) }}</td><td class="player-open">查看</td></tr></tbody></table></div><div v-else class="dashboard-empty">暂无当前阵容数据</div></section>
  </div>
</template>
