<script setup>
import { useGameStore } from '../stores/game.js';

const game = useGameStore();
</script>

<template>
  <section id="screen-retire-confirm" class="screen active">
    <div class="panel">
      <h2>退役确认</h2>
      <p class="retire-msg">{{ game.retireMessage }}</p>
      <div class="retire-actions"><button @click="game.doRetire">确认退役</button><button @click="game.backToGame">继续打球</button></div>
    </div>
  </section>
</template>

<style scoped>
.retire-msg { white-space: pre-line; }
</style>
