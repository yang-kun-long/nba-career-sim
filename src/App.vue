<script setup>
import { onMounted } from 'vue';
import { useGameStore } from './stores/game.js';
import TitleScreen from './components/TitleScreen.vue';
import CreatePlayer from './components/CreatePlayer.vue';
import GameScreen from './components/GameScreen.vue';
import DraftScreen from './components/DraftScreen.vue';
import StatsPanel from './components/StatsPanel.vue';
import AttrPanel from './components/AttrPanel.vue';
import EndingScreen from './components/EndingScreen.vue';
import GalleryScreen from './components/GalleryScreen.vue';
import RetireConfirm from './components/RetireConfirm.vue';
import HistoryScreen from './components/HistoryScreen.vue';
import NbaDataCenter from './components/NbaDataCenter.vue';
const game = useGameStore();

onMounted(() => {
  if (new URLSearchParams(window.location.search).get('nba') === '1') game.showNbaData();
});
</script>

<template>
  <main class="app-shell">
    <TitleScreen v-if="game.screen === 'title'" />
    <CreatePlayer v-else-if="game.screen === 'create'" />
    <GameScreen v-else-if="game.screen === 'game'" />
    <DraftScreen v-else-if="game.screen === 'draft'" />
    <StatsPanel v-else-if="game.screen === 'stats'" />
    <AttrPanel v-else-if="game.screen === 'attr'" />
    <EndingScreen v-else-if="game.screen === 'ending'" />
    <GalleryScreen v-else-if="game.screen === 'gallery'" />
    <RetireConfirm v-else-if="game.screen === 'retire-confirm'" />
    <HistoryScreen v-else-if="game.screen === 'history'" />
    <NbaDataCenter v-else-if="game.screen === 'nba-data'" />
    <Transition name="notice"><div v-if="game.notice" class="toast">{{ game.notice }}</div></Transition>
  </main>
</template>

<style scoped>
.accent-note { color: var(--accent2); }
.empty-state { color: var(--fg3); text-align: center; padding: 20px; }
.table-scroll { overflow-x: auto; }
.career-image-result { margin-top: 16px; text-align: center; }
.career-image-result img { max-width: 100%; border: 1px solid var(--border); }
.toast { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); padding: 10px 18px; border: 1px solid var(--border-glow); background: var(--glass-bg); color: var(--fg); z-index: 10; }
.notice-enter-active, .notice-leave-active { transition: opacity .2s ease; }
.notice-enter-from, .notice-leave-to { opacity: 0; }
</style>
