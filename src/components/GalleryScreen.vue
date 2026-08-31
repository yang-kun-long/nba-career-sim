<script setup>
import { computed } from 'vue';
import { useGameStore } from '../stores/game.js';
import { Engine } from '../core/engine.js';

const game = useGameStore();
const unlocked = computed(() => Engine.getUnlockedEndings());
const labels = { legend: '传奇', quality: '优质', normal: '普通', tragedy: '遗憾', retire: '转型' };
const categories = [['all', '全部'], ['legend', '传奇'], ['quality', '优质'], ['normal', '普通'], ['tragedy', '遗憾'], ['retire', '转型']];
</script>

<template>
  <section id="screen-gallery" class="screen active">
    <div class="panel">
      <h2>结局图鉴</h2>
      <div class="gallery-tabs"><button v-for="category in categories" :key="category[0]" class="tab" :class="{ active: game.galleryFilter === category[0] }" @click="game.filterGallery(category[0])">{{ category[1] }}</button></div>
      <div class="gallery-list"><div v-for="item in game.gallery" :key="item.id" class="gallery-item" :class="{ locked: !unlocked.includes(item.id) }"><div class="gi-name">{{ unlocked.includes(item.id) ? item.name : '???' }}</div><div class="gi-cat"><span :class="`rarity-${item.rarity}`">[{{ item.rarity }}]</span> {{ labels[item.category] }}</div><div class="gi-desc">{{ unlocked.includes(item.id) ? item.desc : '未解锁' }}</div></div></div>
      <button @click="game.backToTitle">返回主菜单</button>
    </div>
  </section>
</template>
