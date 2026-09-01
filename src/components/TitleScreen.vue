<script setup>
import { useGameStore } from '../stores/game.js';
const game = useGameStore();
</script>

<template>
  <section id="screen-title" class="screen active">
    <div class="title-box">
      <div class="nba-logo">🏀</div>
      <h1>NBA 终身篮球生涯模拟器</h1>
      <p class="subtitle">纯文字 · 回合制 · 从少年到传奇</p>
      <div class="menu">
        <button @click="game.newGame">新游戏</button>
        <button v-if="game.hasSave" @click="game.loadGame">继续游戏</button>
        <button @click="game.showNbaData">NBA 数据中心</button>
        <button @click="game.showGallery">结局图鉴</button>
      </div>
      <p class="hint">每一个选择，决定你的一生</p>
    </div>
  </section>
</template>
