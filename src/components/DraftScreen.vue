<script setup>
import { computed } from 'vue';
import { useGameStore } from '../stores/game.js';
import { NBA_TEAMS } from '../core/teams.js';
const game = useGameStore();
const result = computed(() => game.pendingDraft);
const team = computed(() => result.value?.team ? NBA_TEAMS[result.value.team] : null);
</script>

<template>
  <section id="screen-draft" class="screen active"><div class="panel draft-panel">
    <h2>NBA 选秀之夜</h2>
    <div class="draft-info"><p>你今年{{ result?.drafted ? game.state?.draftAge : game.state?.age }}岁，站在了NBA选秀大会的现场。</p><p>你的心跳加速，等待着命运的宣判...</p></div>
    <div v-if="game.draftResultVisible" class="draft-result">
      <template v-if="result?.drafted"><p class="team-pick">第 {{ result.pick }} 顺位</p><p class="team-pick">{{ team?.name }}</p><p class="draft-detail">{{ result.pick <= 3 ? '乐透秀' : result.pick <= 10 ? '前十顺位' : result.pick <= 30 ? '首轮秀' : '二轮秀' }}｜{{ team?.conference }}｜{{ team?.style }}</p><p class="draft-detail">教练：{{ team?.coach }}</p><p class="draft-detail">核心球员：{{ team?.stars?.join('、') }}</p><p class="draft-detail">你的NBA生涯正式开始！</p></template>
      <template v-else><p class="team-pick draft-miss">落选</p><p class="draft-detail">你没有在选秀中被任何球队选中。</p><p class="draft-detail">但篮球之路不止一条，你可以选择继续追梦...</p></template>
    </div>
    <div v-if="game.draftResultVisible" class="draft-next"><button @click="game.afterDraft">{{ result?.drafted ? '开启 NBA 生涯' : '继续寻找机会' }}</button></div>
  </div></section>
</template>
