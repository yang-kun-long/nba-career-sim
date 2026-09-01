<script setup>
import { computed, ref } from 'vue';

const props = defineProps({ player: { type: Object, required: true } });
const emit = defineEmits(['back']);
const activeTable = ref('regularSeason');
const tableTabs = [['regularSeason', '常规赛'], ['playoffs', '季后赛'], ['allStar', '全明星']];

const profile = computed(() => props.player.profile || props.player);
const isFeatured = computed(() => Boolean(props.player.career?.regularSeason?.length));
const currentStats = computed(() => {
  const rows = props.player.career?.regularSeason || [];
  const current = rows.at(-1);
  return current || props.player.stats || {};
});
const regularRows = computed(() => props.player.career?.regularSeason || (props.player.stats ? [{ season: props.player.season || '当前赛季', team: props.player.teamId?.toUpperCase(), ...props.player.stats }] : []));
const activeRows = computed(() => props.player.career?.[activeTable.value] || regularRows.value);
const totalRow = computed(() => props.player.career?.regularSeasonTotals?.[0] || {});
const metric = (key) => currentStats.value?.[key] === null || currentStats.value?.[key] === undefined ? '-' : Number(currentStats.value[key]).toFixed(1);
const total = (key) => totalRow.value?.[key] === null || totalRow.value?.[key] === undefined ? metric(key) : Math.round(Number(totalRow.value[key])).toLocaleString('zh-CN');
const pct = (value) => {
  if (value === null || value === undefined) return '-';
  const numeric = Number(value);
  return `${(numeric <= 1 ? numeric * 100 : numeric).toFixed(1)}%`;
};

const radarAxes = [
  { key: 'scoring', label: '得分', angle: -90 },
  { key: 'playmaking', label: '组织', angle: -30 },
  { key: 'rebounding', label: '篮板', angle: 30 },
  { key: 'defense', label: '防守', angle: 90 },
  { key: 'durability', label: '耐久', angle: 150 },
  { key: 'efficiency', label: '效率', angle: 210 }
];
const ratio = (value, max) => Math.max(0, Math.min(1, (Number(value) || 0) / max));
const radarValues = computed(() => {
  const stats = currentStats.value || {};
  return {
    scoring: ratio(stats.points, 35),
    playmaking: ratio(stats.assists, 12),
    rebounding: ratio(stats.rebounds, 15),
    defense: Math.min(1, ((Number(stats.steals) || 0) * 0.4 + (Number(stats.blocks) || 0) * 0.6) / 2.7),
    durability: ratio(stats.gp, 82),
    efficiency: ratio((Number(stats.fgPct) || 0) <= 1 ? Number(stats.fgPct) * 100 : Number(stats.fgPct), 65)
  };
});
const polar = (radius, angle, center = 140) => {
  const radians = (angle * Math.PI) / 180;
  return `${(center + Math.cos(radians) * radius).toFixed(1)},${(center + Math.sin(radians) * radius).toFixed(1)}`;
};
const radarGrid = (level) => radarAxes.map((axis) => polar(94 * level, axis.angle)).join(' ');
const radarPolygon = computed(() => radarAxes.map((axis) => polar(94 * (radarValues.value[axis.key] || 0.05), axis.angle)).join(' '));
const radarLabelPosition = (axis) => {
  const radians = (axis.angle * Math.PI) / 180;
  return { x: 140 + Math.cos(radians) * 116, y: 140 + Math.sin(radians) * 116 + 4 };
};

const lineRows = computed(() => regularRows.value.filter((row) => row.season));
const chartMax = computed(() => Math.max(10, ...lineRows.value.flatMap((row) => [Number(row.points) || 0, Number(row.rebounds) || 0, Number(row.assists) || 0])) * 1.12);
const lineX = (index) => lineRows.value.length <= 1 ? 380 : 50 + (index * 660) / (lineRows.value.length - 1);
const lineY = (value) => 220 - ((Number(value) || 0) / chartMax.value) * 185;
const linePoints = (key) => lineRows.value.map((row, index) => `${lineX(index).toFixed(1)},${lineY(row[key]).toFixed(1)}`).join(' ');
const chartLabels = computed(() => lineRows.value.filter((_, index) => lineRows.value.length <= 8 || index === 0 || index === lineRows.value.length - 1 || index % 4 === 0).map((row) => ({ label: row.season, index: lineRows.value.indexOf(row) })));
const chartTicks = computed(() => [0, 0.25, 0.5, 0.75, 1].map((step) => ({ y: 220 - step * 185, label: Math.round(chartMax.value * step) })));
</script>

<template>
  <div class="player-dashboard">
    <div class="dashboard-toolbar"><button class="btn-sm" @click="emit('back')">返回球员列表</button><span class="dashboard-source">{{ isFeatured ? 'NBA.com 生涯档案' : 'NBA.com 当前快照' }}</span></div>
    <header class="dashboard-hero"><div class="dashboard-identity"><div class="player-monogram">{{ profile.fullName?.slice(0, 1) || '?' }}</div><div><p class="view-kicker">PLAYER PROFILE</p><h3>{{ profile.fullName }}</h3><p>{{ profile.teamName || profile.teamId?.toUpperCase() || '自由球员' }} · {{ profile.position || '—' }} · {{ profile.birthDate ? profile.birthDate.slice(0, 10) : (profile.age ? `${Math.round(profile.age)} 岁` : '年龄未知') }}</p></div></div><div class="dashboard-facts"><span v-if="profile.draftYear">选秀 {{ profile.draftYear }} · 第 {{ profile.draftNumber || '—' }} 顺位</span><span v-if="profile.from">生涯 {{ profile.from }}–{{ profile.to || '至今' }}</span><span v-if="profile.height">{{ profile.height }} · {{ profile.weight }} lb</span></div></header>

    <section class="dashboard-metrics"><div><span>场均得分</span><strong>{{ metric('points') }}</strong><small>当前赛季</small></div><div><span>场均篮板</span><strong>{{ metric('rebounds') }}</strong><small>当前赛季</small></div><div><span>场均助攻</span><strong>{{ metric('assists') }}</strong><small>当前赛季</small></div><div><span>投篮命中率</span><strong>{{ pct(currentStats.fgPct) }}</strong><small>{{ currentStats.gp || '—' }} 场</small></div></section>

    <section class="dashboard-grid">
      <article class="dashboard-card radar-card"><div class="dashboard-card-heading"><div><span class="view-kicker">PLAYER PROFILE</span><h4>能力雷达</h4></div><span class="dashboard-caption">当前赛季</span></div><svg class="radar-chart" viewBox="0 0 280 280" role="img" aria-label="球员能力雷达图"><polygon v-for="level in [0.25, 0.5, 0.75, 1]" :key="level" :points="radarGrid(level)" class="radar-grid" /><line v-for="axis in radarAxes" :key="axis.key" x1="140" y1="140" :x2="radarLabelPosition(axis).x" :y2="radarLabelPosition(axis).y - 4" class="radar-axis" /><polygon :points="radarPolygon" class="radar-value" /><circle cx="140" cy="140" r="3" class="radar-center" /><text v-for="axis in radarAxes" :key="`${axis.key}-label`" :x="radarLabelPosition(axis).x" :y="radarLabelPosition(axis).y" class="radar-label">{{ axis.label }}</text></svg></article>
      <article class="dashboard-card trend-card"><div class="dashboard-card-heading"><div><span class="view-kicker">CAREER TREND</span><h4>生涯走势</h4></div><div class="chart-legend"><span class="legend-points">得分</span><span class="legend-rebounds">篮板</span><span class="legend-assists">助攻</span></div></div><div v-if="lineRows.length" class="line-chart-wrap"><svg class="line-chart" viewBox="0 0 760 260" preserveAspectRatio="none" role="img" aria-label="得分篮板助攻生涯折线图"><line v-for="tick in chartTicks" :key="tick.y" x1="45" :y1="tick.y" x2="710" :y2="tick.y" class="chart-grid-line" /><text v-for="tick in chartTicks" :key="`label-${tick.y}`" x="38" :y="tick.y + 4" class="chart-y-label">{{ tick.label }}</text><polyline :points="linePoints('points')" class="chart-line points-line" /><polyline :points="linePoints('rebounds')" class="chart-line rebounds-line" /><polyline :points="linePoints('assists')" class="chart-line assists-line" /><circle v-for="(row, index) in lineRows" :key="`point-${index}`" :cx="lineX(index)" :cy="lineY(row.points)" r="2.8" class="chart-dot points-dot" /><text v-for="label in chartLabels" :key="label.label" :x="lineX(label.index)" y="246" class="chart-x-label">{{ label.label }}</text></svg></div><div v-else class="dashboard-empty">暂无跨赛季数据</div></article>
    </section>

    <section class="dashboard-card history-card"><div class="dashboard-card-heading"><div><span class="view-kicker">SEASON LOG</span><h4>历史数据</h4></div><span class="dashboard-caption">{{ activeRows.length }} 个赛季</span></div><div class="dashboard-tabs"><button v-for="tab in tableTabs" :key="tab[0]" class="data-tab" :class="{ active: activeTable === tab[0] }" @click="activeTable = tab[0]">{{ tab[1] }} <span>{{ props.player.career?.[tab[0]]?.length || (tab[0] === 'regularSeason' ? regularRows.length : 0) }}</span></button></div><div class="dashboard-table-wrap"><table class="dashboard-table"><thead><tr><th>赛季</th><th>球队</th><th>场次</th><th>首发</th><th>时间</th><th>得分</th><th>篮板</th><th>助攻</th><th>抢断</th><th>盖帽</th><th>命中率</th><th>三分</th></tr></thead><tbody><tr v-for="row in activeRows" :key="`${activeTable}-${row.season || 'total'}`"><td><strong>{{ row.season || '生涯总计' }}</strong><small v-if="row.age">{{ Math.round(row.age) }} 岁</small></td><td>{{ row.team || '-' }}</td><td>{{ row.gp ?? '-' }}</td><td>{{ row.gs ?? '-' }}</td><td>{{ row.minutes ?? '-' }}</td><td>{{ row.points ?? '-' }}</td><td>{{ row.rebounds ?? '-' }}</td><td>{{ row.assists ?? '-' }}</td><td>{{ row.steals ?? '-' }}</td><td>{{ row.blocks ?? '-' }}</td><td>{{ pct(row.fgPct) }}</td><td>{{ pct(row.threePct) }}</td></tr></tbody></table></div></section>
  </div>
</template>
