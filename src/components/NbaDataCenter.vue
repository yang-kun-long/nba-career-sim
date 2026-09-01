<script setup>
import { onMounted, ref } from 'vue';
import { useNbaDataStore } from '../stores/nba-data.js';
import { useGameStore } from '../stores/game.js';

const nba = useNbaDataStore();
const game = useGameStore();
const featuredTab = ref('regularSeason');
const featuredTabs = [['regularSeason', '常规赛'], ['playoffs', '季后赛'], ['allStar', '全明星']];
const tabs = [
  ['games', '今日比赛'],
  ['teams', '球队'],
  ['players', '球员'],
  ['leaders', '排行榜'],
  ['history', '历史赛季']
];
const pct = (value) => {
  if (value === null || value === undefined) return '-';
  const numeric = Number(value);
  return `${(numeric <= 1 ? numeric * 100 : numeric).toFixed(1)}%`;
};
const number = (value) => value === null || value === undefined ? '-' : Number(value).toFixed(1);
const dateLabel = (value) => value ? new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeZone: 'Asia/Shanghai' }).format(new Date(value)) : '-';

onMounted(() => nba.refresh());
</script>

<template>
  <section id="screen-nba-data" class="screen active">
    <div class="panel data-panel">
      <div class="data-heading">
        <div>
          <p class="data-eyebrow">NBA DATA CENTER</p>
          <h2>官方数据中心</h2>
          <p class="data-subtitle">浏览比赛、球队与球员赛季数据，和生涯模拟数据分开呈现。</p>
        </div>
        <button class="btn-sm data-refresh" :disabled="nba.loading" title="重新读取数据" @click="nba.refresh">{{ nba.loading ? '读取中…' : '刷新快照' }}</button>
      </div>
      <div class="data-meta"><span class="status-dot" :class="{ official: nba.dataStatus === '官方快照', partial: nba.dataStatus.includes('部分') }"></span>{{ nba.dataStatus }} · {{ nba.generatedAt }} · 数据源：NBA.com</div>
      <div v-if="nba.error" class="data-alert">{{ nba.error }}。当前页面会继续保留已加载内容。</div>
      <nav class="data-tabs" aria-label="NBA数据视图">
        <button v-for="tab in tabs" :key="tab[0]" class="data-tab" :class="{ active: nba.view === tab[0] }" @click="nba.showView(tab[0])">{{ tab[1] }}</button>
      </nav>

      <div v-if="nba.loading && !nba.snapshot" class="data-loading">正在读取官方快照…</div>
      <template v-else>
        <div v-if="nba.view === 'games'" class="data-view">
          <div class="view-title"><div><span class="view-kicker">LIVE BOARD</span><h3>今日比赛</h3></div><span class="view-count">{{ nba.currentGames.length }} 场</span></div>
          <div v-if="!nba.currentGames.length" class="data-empty"><strong>今日暂无比赛</strong><span>{{ nba.snapshot?.games?.message || '等待下一次官方快照更新' }}</span></div>
          <div v-else class="game-grid"><article v-for="game in nba.currentGames" :key="game.id" class="game-card"><span class="game-status">{{ game.status }}</span><div class="game-team"><span>{{ game.away.name }}</span><b>{{ game.away.score ?? '-' }}</b></div><div class="game-team"><span>{{ game.home.name }}</span><b>{{ game.home.score ?? '-' }}</b></div><small>{{ dateLabel(game.startTime) }}</small></article></div>
        </div>

        <div v-else-if="nba.view === 'teams'" class="data-view">
          <div class="view-title"><div><span class="view-kicker">TEAM INDEX</span><h3>球队概览</h3></div><span class="view-count">{{ nba.teams.length }} 支</span></div>
          <div class="team-grid"><article v-for="team in nba.teams" :key="team.id" class="team-card"><div class="team-mark" :style="{ background: team.color || '#687083' }">{{ team.abbreviation }}</div><div class="team-copy"><strong>{{ team.name }}</strong><span>{{ team.city }} · {{ team.conference || 'NBA' }}</span></div><div class="team-record"><b>{{ team.record?.wins ?? '-' }} - {{ team.record?.losses ?? '-' }}</b><small>胜负</small></div></article></div>
        </div>

        <div v-else-if="nba.view === 'players'" class="data-view">
          <div class="view-title"><div><span class="view-kicker">PLAYER INDEX</span><h3>球员数据</h3></div><span class="view-count">{{ nba.filteredPlayers.length }} 人</span></div>
          <article v-if="nba.featuredPlayer" class="featured-player">
            <div class="featured-topline"><div><span class="view-kicker">FEATURED ARCHIVE · #23</span><h3>{{ nba.featuredPlayer.profile.fullName }}</h3><p>{{ nba.featuredPlayer.profile.school }} · 2003 年第 1 顺位 · {{ nba.featuredPlayer.profile.from }}-{{ nba.featuredPlayer.profile.to }}</p></div><div class="featured-badge">全生涯</div></div>
            <div class="featured-metrics"><div><span>常规赛得分</span><strong>{{ number(nba.featuredPlayer.career.regularSeasonTotals[0]?.points) }}</strong><small>总计</small></div><div><span>常规赛篮板</span><strong>{{ number(nba.featuredPlayer.career.regularSeasonTotals[0]?.rebounds) }}</strong><small>总计</small></div><div><span>常规赛助攻</span><strong>{{ number(nba.featuredPlayer.career.regularSeasonTotals[0]?.assists) }}</strong><small>总计</small></div><div><span>季后赛场次</span><strong>{{ nba.featuredPlayer.career.playoffs.length }}</strong><small>赛季记录</small></div></div>
            <div class="featured-tabs"><button v-for="tab in featuredTabs" :key="tab[0]" class="data-tab" :class="{ active: featuredTab === tab[0] }" @click="featuredTab = tab[0]">{{ tab[1] }} <span>{{ nba.featuredPlayer.career[tab[0]].length }}</span></button></div>
            <div class="featured-table-wrap"><table class="featured-table"><thead><tr><th>赛季</th><th>球队</th><th>场次</th><th>首发</th><th>时间</th><th>得分</th><th>篮板</th><th>助攻</th><th>抢断</th><th>盖帽</th><th>命中率</th><th>三分</th></tr></thead><tbody><tr v-for="row in nba.featuredPlayer.career[featuredTab]" :key="`${featuredTab}-${row.season}`"><td><strong>{{ row.season || '生涯' }}</strong><small>{{ row.age ? `${Math.round(row.age)} 岁` : '' }}</small></td><td>{{ row.team || '-' }}</td><td>{{ row.gp ?? '-' }}</td><td>{{ row.gs ?? '-' }}</td><td>{{ row.minutes ?? '-' }}</td><td>{{ row.points ?? '-' }}</td><td>{{ row.rebounds ?? '-' }}</td><td>{{ row.assists ?? '-' }}</td><td>{{ row.steals ?? '-' }}</td><td>{{ row.blocks ?? '-' }}</td><td>{{ pct(row.fgPct) }}</td><td>{{ pct(row.threePct) }}</td></tr></tbody></table></div>
          </article>
          <div v-else-if="nba.featuredLoading" class="data-loading compact">正在读取詹姆斯全生涯档案…</div>
          <div v-else-if="nba.featuredError" class="data-alert">{{ nba.featuredError }}</div>
          <label class="data-search"><span>搜索球员</span><input v-model="nba.search" type="search" placeholder="姓名、球队或位置" /></label>
          <div class="player-table-wrap"><table class="player-table"><thead><tr><th>球员</th><th>球队</th><th>位置</th><th>场次</th><th>得分</th><th>篮板</th><th>助攻</th><th>命中率</th></tr></thead><tbody><tr v-for="player in nba.filteredPlayers.slice(0, 80)" :key="`${player.id}-${player.teamId}`"><td><strong>{{ player.fullName }}</strong><small>{{ player.age ? `${Math.round(player.age)} 岁` : '—' }}</small></td><td>{{ player.teamId?.toUpperCase() || '-' }}</td><td>{{ player.position || '-' }}</td><td>{{ player.stats?.gp ?? '-' }}</td><td>{{ number(player.stats?.points) }}</td><td>{{ number(player.stats?.rebounds) }}</td><td>{{ number(player.stats?.assists) }}</td><td>{{ pct(player.stats?.fgPct) }}</td></tr></tbody></table></div>
          <div v-if="!nba.filteredPlayers.length" class="data-empty">没有匹配的球员</div>
        </div>

        <div v-else-if="nba.view === 'leaders'" class="data-view">
          <div class="view-title"><div><span class="view-kicker">LEAGUE LEADERS</span><h3>赛季排行榜</h3></div><span class="view-count">Top 5</span></div>
          <div class="leader-grid"><article v-for="leader in nba.sortedLeaders" :key="leader.field" class="leader-card"><h4>{{ leader.label }}</h4><div v-for="(player, index) in leader.rows" :key="`${leader.field}-${player.id}`" class="leader-row"><span class="leader-rank">0{{ index + 1 }}</span><span class="leader-player"><strong>{{ player.fullName }}</strong><small>{{ player.teamId?.toUpperCase() }}</small></span><b>{{ number(player.stats?.[leader.field]) }}</b></div></article></div>
        </div>

        <div v-else class="data-view">
          <div class="view-title"><div><span class="view-kicker">SEASON ARCHIVE</span><h3>历史赛季</h3></div><span class="view-count">{{ nba.seasons.length }} 个赛季</span></div>
          <label class="season-picker"><span>选择赛季</span><select :value="nba.selectedSeason" @change="nba.selectSeason($event.target.value)"><option v-for="season in nba.seasons.slice().reverse()" :key="season" :value="season">{{ season }}</option></select></label>
          <div v-if="nba.historyLoading" class="data-loading compact">正在读取 {{ nba.selectedSeason }}…</div>
          <div v-else-if="nba.historyError" class="data-alert">{{ nba.historyError }}</div>
          <template v-else>
            <div class="history-summary"><span>赛季</span><strong>{{ nba.selectedSeason || '-' }}</strong><span>球员记录</span><strong>{{ nba.players.length }}</strong><span>球队记录</span><strong>{{ nba.teams.length }}</strong></div>
            <div class="leader-grid"><article v-for="leader in nba.sortedLeaders" :key="leader.field" class="leader-card"><h4>{{ leader.label }}</h4><div v-for="(player, index) in leader.rows" :key="`${leader.field}-${player.id}`" class="leader-row"><span class="leader-rank">0{{ index + 1 }}</span><span class="leader-player"><strong>{{ player.fullName }}</strong><small>{{ player.teamId?.toUpperCase() }}</small></span><b>{{ number(player.stats?.[leader.field]) }}</b></div></article></div>
          </template>
        </div>
      </template>
      <div class="data-footer"><span>官方接口数据仅作信息展示，具体字段随 NBA.com 更新。</span><button class="btn-sm" @click="game.backFromNbaData">返回</button></div>
    </div>
  </section>
</template>
