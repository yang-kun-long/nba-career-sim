<script setup>
import { computed, ref } from 'vue';
import { useGameStore } from '../stores/game.js';
import { Engine } from '../core/engine.js';
import MetricGrid from './MetricGrid.vue';
import EventHistoryList from './EventHistoryList.vue';

const game = useGameStore();
const image = ref(null);
const summary = computed(() => Engine.generateSummary(game.state));
const physical = computed(() => summary.value.physical);
const nbaStats = computed(() => summary.value.nbaStats);
const statsItems = computed(() => nbaStats.value ? [
  ['得分', nbaStats.value.points], ['篮板', nbaStats.value.rebounds], ['助攻', nbaStats.value.assists],
  ['抢断', nbaStats.value.steals], ['盖帽', nbaStats.value.blocks], ['命中率', `${nbaStats.value.fgPct}%`],
  ['三分', `${nbaStats.value.threePct}%`], ['罚球', `${nbaStats.value.ftPct}%`]
] : []);
const physicalItems = computed(() => [
  ['身高', `${physical.value.height}cm`], ['体重', `${physical.value.weight}kg`],
  ['臂展', `${physical.value.wingspan}cm`], ['弹跳', `${physical.value.vertical}cm`],
  ['冲刺', `${physical.value.sprint}s`], ['卧推', `${physical.value.bench}次`]
]);
const summaryItems = computed(() => [
  ['球员', summary.value.name], ['退役年龄', `${summary.value.age}岁`], ['NBA年数', `${summary.value.nbaYears}年`],
  ['总冠军', `${summary.value.championships}次`], ['全明星', `${summary.value.allStar}次`], ['MVP', `${summary.value.mvp}次`],
  ['DPOY', `${summary.value.dpoy}次`], ['最佳防守阵容', `${summary.value.allDefensive}次`], ['最佳阵容', `${summary.value.allNBA}次`],
  ['选秀顺位', summary.value.drafted ? `第${summary.value.draftPick}顺位` : '落选']
]);

function generateImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#d4a017';
  ctx.textAlign = 'center';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('NBA 终身篮球生涯模拟器', 400, 70);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(summary.value.name, 400, 145);
  ctx.fillStyle = '#ffb347';
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(game.ending.name, 400, 205);
  ctx.textAlign = 'left';
  ctx.font = '22px monospace';
  summaryItems.value.forEach(([label, value], index) => {
    ctx.fillStyle = '#8b93a7';
    ctx.fillText(label, 180, 285 + index * 48);
    ctx.fillStyle = '#fff';
    ctx.fillText(value, 420, 285 + index * 48);
  });
  image.value = canvas.toDataURL('image/png');
}

function download() {
  const link = document.createElement('a');
  link.download = `${summary.value.name}_NBA生涯.png`;
  link.href = image.value;
  link.click();
}
</script>

<template>
  <section id="screen-ending" class="screen active">
    <div class="panel ending-panel">
      <h2>{{ game.ending?.name }}</h2>
      <div class="ending-text"><span :class="`rarity-${game.ending?.rarity}`">[{{ game.ending?.rarity }}]</span><br><br>{{ game.ending?.text }}</div>
      <div class="ending-stats">
        <div v-for="item in summaryItems" :key="item[0]" class="es-line"><span class="es-label">{{ item[0] }}</span><span class="es-val">{{ item[1] }}</span></div>
      </div>
      <MetricGrid v-if="nbaStats" title="🏀 生涯场均数据" :items="statsItems" />
      <MetricGrid title="📊 最终体测数据" :items="physicalItems" />
      <div v-if="game.state?.yearlyHistory.length" class="stat-section">
        <h3>📅 年度数据记录</h3>
        <div class="table-scroll"><table class="yearly-table"><thead><tr><th>年龄</th><th>球队</th><th>得分</th><th>篮板</th><th>助攻</th><th>进攻</th><th>防守</th><th>球商</th></tr></thead><tbody><tr v-for="year in game.state.yearlyHistory" :key="year.age"><td>{{ year.age }}</td><td>{{ year.team === '无' ? '-' : year.team }}</td><td>{{ year.nbaStats?.points ?? '-' }}</td><td>{{ year.nbaStats?.rebounds ?? '-' }}</td><td>{{ year.nbaStats?.assists ?? '-' }}</td><td>{{ year.offense }}</td><td>{{ year.defense }}</td><td>{{ year.basketball_iq }}</td></tr></tbody></table></div>
      </div>
      <div v-if="game.state?.eventHistory.length" class="stat-section"><h3>📜 完整生涯事件记录</h3><EventHistoryList :events="game.state.eventHistory" /></div>
      <div class="ending-actions"><button @click="generateImage">生成生涯简图</button><button @click="game.showGallery">查看图鉴</button><button @click="game.backToTitle">返回主菜单</button></div>
      <div v-if="image" class="career-image-result"><img :src="image" alt="生涯简图"><br><button @click="download">保存图片</button></div>
    </div>
  </section>
</template>
