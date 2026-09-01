<script setup>
import { computed } from 'vue';
import { useGameStore } from '../stores/game.js';
const game = useGameStore();
const title = computed(() => {
  const event = game.currentEvent;
  if (!event) return '';
  return event._isDraftChoice || event._isTrade ? event.title : game.eventProgress.total > 1 ? `[${game.eventProgress.current}/${game.eventProgress.total}] ${event.title}` : event.title;
});
const salary = computed(() => game.state?.salary > 0 ? `$${(game.state.salary * 500 + 100).toFixed(0)}万` : '-');
const isChoice = computed(() => !!game.currentEvent?.choices && !game.eventResolved);
const effects = computed(() => game.eventResult || []);
</script>

<template>
  <section id="screen-game" class="screen active">
    <div class="game-header">
      <div class="hud">
        <span><b>{{ game.state?.playerName }}</b></span>
        <span>年龄：<span class="hud-val">{{ game.state?.age }}岁</span></span>
        <span>球队：<span class="hud-val">{{ game.teamName }}</span></span>
        <span v-if="game.state?.drafted">薪资：<span class="hud-val">{{ salary }}</span></span>
      </div>
      <div class="hud-btns">
        <button class="btn-sm" @click="game.showStats">数据</button>
        <button class="btn-sm" @click="game.showNbaData">官方</button>
        <button class="btn-sm" @click="game.showHistory">事件</button>
        <button class="btn-sm" @click="game.saveGame">存档</button>
        <button class="btn-sm" @click="game.showAttr">属性</button>
        <button v-if="game.state?.age >= 35" class="btn-sm btn-danger" @click="game.confirmRetire">退役</button>
      </div>
    </div>
    <div class="game-body">
      <div class="event-area">
        <div class="event-title">{{ title }}</div>
        <div class="event-text">{{ game.currentEvent?.text }}</div>
        <div v-if="isChoice" class="event-choices">
          <button v-for="(choice, index) in game.currentEvent.choices" :key="index" @click="game.makeChoice(index)">{{ choice.text }}</button>
        </div>
        <div v-if="game.eventResolved" class="event-result">
          <template v-if="effects.length">
            <span v-for="(effect, index) in effects" :key="index" :class="typeof effect.change === 'string' ? 'effect-neutral' : effect.change > 0 ? 'effect-pos' : effect.change < 0 ? 'effect-neg' : 'effect-neutral'">
              {{ effect.attr }}{{ typeof effect.change === 'string' ? `：${effect.change}` : ` ${effect.change > 0 ? '+' : ''}${effect.change}` }}<br>
            </span>
          </template>
          <span v-else class="effect-neutral">无明显变化</span>
        </div>
        <div v-if="game.eventResolved" class="event-next"><button @click="game.nextYear">{{ game.nextLabel }}</button></div>
      </div>
    </div>
  </section>
</template>
