import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import { Engine, ATTR_KEYS } from '../core/engine.js';
import { NBA_TEAMS } from '../core/teams.js';
import { ENDINGS, calculateEnding, getGalleryData } from '../core/endings.js';
import { SAVE_VERSION, emptyAttrs, normalizeSave } from './game-state.js';
import { createGameFlow } from './game-flow.js';

export const useGameStore = defineStore('game', () => {
  const screen = ref('title');
  const state = ref(null);
  const attrs = reactive(emptyAttrs());
  const remainPoints = ref(50);
  const playerName = ref('');
  const currentEvent = ref(null);
  const eventResult = ref(null);
  const eventResolved = ref(false);
  const pendingDraft = ref(null);
  const draftResultVisible = ref(false);
  const galleryFilter = ref('all');
  const ending = ref(null);
  const retireMessage = ref('');
  const careerImage = ref(null);
  const notice = ref('');
  const saveRevision = ref(0);

  const hasSave = computed(() => {
    saveRevision.value;
    return !!Engine.load();
  });
  const teamName = computed(() => state.value?.team ? NBA_TEAMS[state.value.team]?.name : '自由球员');
  const eventProgress = computed(() => {
    if (!state.value || !state.value.multiEventQueue.length) return { current: 1, total: 1 };
    return { current: state.value.multiEventIndex + 1, total: state.value.multiEventQueue.length };
  });
  const nextLabel = computed(() => eventProgress.value.current < eventProgress.value.total ? '下一步' : '继续下一年');
  const gallery = computed(() => {
    const all = getGalleryData();
    return galleryFilter.value === 'all' ? all : all.filter((item) => item.category === galleryFilter.value);
  });

  function resetCreation() {
    Object.assign(attrs, emptyAttrs());
    remainPoints.value = 50;
    playerName.value = '';
  }

  function resetAllocation() {
    Object.assign(attrs, emptyAttrs());
    remainPoints.value = 50;
  }

  function newGame() {
    resetCreation();
    state.value = null;
    currentEvent.value = null;
    eventResult.value = null;
    eventResolved.value = false;
    pendingDraft.value = null;
    draftResultVisible.value = false;
    ending.value = null;
    careerImage.value = null;
    screen.value = 'create';
  }

  function loadGame() {
    const save = normalizeSave(Engine.load());
    if (!save) return false;
    state.value = save;
    saveRevision.value += 1;
    if (save.isRetired && save.ending) {
      ending.value = ENDINGS.find((item) => item.id === save.ending) || calculateEnding(save);
      screen.value = 'ending';
      return true;
    }
    processYear();
    return true;
  }

  function adjustAttr(key, delta) {
    const next = attrs[key] + delta;
    if (next < 0 || next > 10 || (delta > 0 && remainPoints.value <= 0)) return;
    attrs[key] = next;
    remainPoints.value -= delta;
  }

  function inputAttr(key, rawValue) {
    const value = Number.parseInt(rawValue, 10);
    if (Number.isNaN(value)) return;
    const next = Math.max(0, Math.min(10, value));
    const diff = next - attrs[key];
    if (diff > remainPoints.value) {
      attrs[key] += remainPoints.value;
      remainPoints.value = 0;
    } else {
      attrs[key] = next;
      remainPoints.value -= diff;
    }
  }

  function randomAlloc() {
    resetAllocation();
    let points = 50;
    while (points > 0) {
      const key = ATTR_KEYS[Math.floor(Math.random() * ATTR_KEYS.length)];
      if (attrs[key] < 10) { attrs[key] += 1; points -= 1; }
    }
    remainPoints.value = 0;
  }

  function confirmCreate() {
    if (remainPoints.value < 0 || remainPoints.value > 25) return false;
    const used = 50 - remainPoints.value;
    state.value = Engine.createState(playerName.value.trim() || '无名球员', { ...attrs });
    state.value.startPoints = used;
    processYear();
    return true;
  }

  function save() {
    if (!state.value) return false;
    state.value.saveVersion = SAVE_VERSION;
    const saved = Engine.save(state.value);
    if (saved) saveRevision.value += 1;
    return saved;
  }

  const {
    processYear,
    makeChoice,
    afterDraft,
    nextYear,
    triggerEnding
  } = createGameFlow({
    state,
    screen,
    currentEvent,
    eventResult,
    eventResolved,
    pendingDraft,
    draftResultVisible,
    ending,
    save
  });

  function confirmRetire() {
    const age = state.value?.age || 0;
    retireMessage.value = `你确定要在${age}岁退役吗？${age < 30 ? '\n\n你还很年轻，现在退役可能太早了。' : age < 35 ? '\n\n你的职业生涯还有几年可以打。' : '\n\n你已经在联盟征战多年，是时候做出决定了。'}`;
    screen.value = 'retire-confirm';
  }

  function doRetire() { triggerEnding(); }
  function showStats() { screen.value = 'stats'; }
  function showAttr() { screen.value = 'attr'; }
  function showHistory() { screen.value = 'history'; }
  function backToGame() { screen.value = 'game'; }
  function showGallery() { galleryFilter.value = 'all'; screen.value = 'gallery'; }
  function filterGallery(category) { galleryFilter.value = category; }
  function backToTitle() { screen.value = 'title'; }
  function saveGame() {
    const ok = save();
    notice.value = ok ? '存档成功！' : '存档失败！';
    window.setTimeout(() => { notice.value = ''; }, 1800);
  }
  function generateCareerImage() { careerImage.value = null; }

  return {
    screen, state, attrs, remainPoints, playerName, currentEvent, eventResult, eventResolved,
    pendingDraft, draftResultVisible, galleryFilter, ending, retireMessage, careerImage, notice,
    hasSave, teamName, eventProgress, nextLabel, gallery, newGame, loadGame, adjustAttr, inputAttr,
    randomAlloc, resetCreation, resetAllocation, confirmCreate, processYear, makeChoice, afterDraft, nextYear,
    confirmRetire, doRetire, showStats, showAttr, showHistory, backToGame, showGallery, filterGallery,
    backToTitle, saveGame, generateCareerImage
  };
});
