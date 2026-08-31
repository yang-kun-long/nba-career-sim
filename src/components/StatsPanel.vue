<script setup>
import { computed } from 'vue';
import { useGameStore } from '../stores/game.js';
import { Engine } from '../core/engine.js';
import MetricGrid from './MetricGrid.vue';
import EventHistoryList from './EventHistoryList.vue';

const game = useGameStore();
const state = computed(() => game.state);
const physical = computed(() => Engine.calcPhysical(state.value));
const nbaStats = computed(() => Engine.calcNBAStats(state.value));
const basic = computed(() => [
  ['球员姓名', state.value.playerName], ['当前年龄', `${state.value.age}岁`], ['当前球队', game.teamName],
  ['选秀结果', state.value.drafted ? `第${state.value.draftPick}顺位` : '未被选中'], ['NBA年数', `${state.value.nbaYears}年`],
  ['总生涯年数', `${state.value.careerYears}年`], ['总冠军', `${state.value.championships}次`], ['全明星', `${state.value.allStar}次`],
  ['MVP', `${state.value.mvp}次`], ['DPOY', `${state.value.dpoy}次`], ['最佳防守阵容', `${state.value.allDefensive}次`],
  ['最佳阵容', `${state.value.allNBA}次`]
]);
const statItems = computed(() => nbaStats.value ? [
  ['得分', nbaStats.value.points], ['篮板', nbaStats.value.rebounds], ['助攻', nbaStats.value.assists],
  ['抢断', nbaStats.value.steals], ['盖帽', nbaStats.value.blocks], ['命中率', `${nbaStats.value.fgPct}%`],
  ['三分', `${nbaStats.value.threePct}%`], ['罚球', `${nbaStats.value.ftPct}%`], ['上场时间', `${nbaStats.value.minutes}分钟`]
] : []);
const physicalItems = computed(() => [
  ['身高', `${physical.value.height}cm`], ['体重', `${physical.value.weight}kg`],
  ['臂展', `${physical.value.wingspan}cm`], ['弹跳', `${physical.value.vertical}cm`],
  ['冲刺', `${physical.value.sprint}s`], ['卧推', `${physical.value.bench}次`]
]);
</script>

<template>
  <section id="screen-stats" class="screen active">
    <div class="panel">
      <h2>生涯数据</h2>
      <div class="stats-content">
        <div class="stat-section"><h3>📋 基础信息</h3><div v-for="item in basic" :key="item[0]" class="stat-line"><span class="stat-label">{{ item[0] }}</span><span class="stat-value">{{ item[1] }}</span></div></div>
        <MetricGrid v-if="nbaStats" title="🏀 当前赛季场均数据" :items="statItems" />
        <MetricGrid title="📊 体测数据" :items="physicalItems" />
        <div v-if="state.yearlyHistory.length" class="stat-section">
          <h3>📅 年度数据记录</h3>
          <div class="table-scroll"><table class="yearly-table"><thead><tr><th>年龄</th><th>球队</th><th>得分</th><th>篮板</th><th>助攻</th><th>进攻</th><th>防守</th><th>球商</th></tr></thead><tbody><tr v-for="year in state.yearlyHistory" :key="year.age"><td>{{ year.age }}</td><td>{{ year.team === '无' ? '-' : year.team }}</td><td>{{ year.nbaStats?.points ?? '-' }}</td><td>{{ year.nbaStats?.rebounds ?? '-' }}</td><td>{{ year.nbaStats?.assists ?? '-' }}</td><td>{{ year.offense }}</td><td>{{ year.defense }}</td><td>{{ year.basketball_iq }}</td></tr></tbody></table></div>
        </div>
        <div v-if="state.eventHistory.length" class="stat-section"><h3>📜 事件记录</h3><EventHistoryList :events="state.eventHistory" :reverse="true" /></div>
      </div>
      <button @click="game.backToGame">返回</button>
    </div>
  </section>
</template>
