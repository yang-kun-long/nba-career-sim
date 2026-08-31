<script setup>
import { computed } from 'vue';
import { useGameStore } from '../stores/game.js';
import { Engine, ATTR_KEYS, ATTR_NAMES, ATTR_ICONS } from '../core/engine.js';
import MetricGrid from './MetricGrid.vue';

const game = useGameStore();
const physical = computed(() => Engine.calcPhysical(game.state));
const physicalItems = computed(() => [
  ['身高', `${physical.value.height}cm`], ['体重', `${physical.value.weight}kg`],
  ['臂展', `${physical.value.wingspan}cm`], ['弹跳', `${physical.value.vertical}cm`],
  ['冲刺', `${physical.value.sprint}s`], ['卧推', `${physical.value.bench}次`]
]);
const hiddenItems = computed(() => [
  ['伤病累计', 'injury'], ['球队信任', 'team_trust'], ['人气', 'popularity'],
  ['荣誉值', 'honor'], ['薪资等级', 'salary']
]);
</script>

<template>
  <section id="screen-attr" class="screen active">
    <div class="panel">
      <h2>当前属性</h2>
      <div class="attr-display">
        <h3>能力属性</h3>
        <div v-for="key in ATTR_KEYS" :key="key" class="attr-bar-wrap">
          <span class="attr-name">{{ ATTR_ICONS[key] }} {{ ATTR_NAMES[key] }}</span>
          <div class="bar"><div class="bar-fill" :style="{ width: `${game.state[key] * 10}%` }"></div></div>
          <span class="attr-val">{{ Math.round(game.state[key] * 10) / 10 }}</span>
        </div>
      </div>
      <MetricGrid title="📊 体测数据" :items="physicalItems" />
      <div class="hidden-display">
        <h3>隐藏数值</h3>
        <div v-for="item in hiddenItems" :key="item[1]" class="hidden-row"><span>{{ item[0] }}</span><span>{{ game.state[item[1]] }}</span></div>
      </div>
      <button @click="game.backToGame">返回</button>
    </div>
  </section>
</template>
