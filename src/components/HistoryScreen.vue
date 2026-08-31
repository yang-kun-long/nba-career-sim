<script setup>
import { useGameStore } from '../stores/game.js';
import EventHistoryList from './EventHistoryList.vue';

const game = useGameStore();
</script>

<template>
  <section id="screen-history" class="screen active">
    <div class="panel">
      <h2>📜 生涯事件记录</h2>
      <EventHistoryList :events="game.state?.eventHistory" :reverse="true" />
      <button @click="game.backToGame">返回</button>
    </div>
  </section>
</template>
