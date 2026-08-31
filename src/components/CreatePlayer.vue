<script setup>
import { useGameStore } from '../stores/game.js';
import { ATTR_KEYS, ATTR_NAMES, ATTR_ICONS } from '../core/engine.js';
const game = useGameStore();
</script>

<template>
  <section id="screen-create" class="screen active">
    <div class="panel">
      <h2>创建你的球员</h2>
      <p class="create-desc">你今年 12 岁，怀揣篮球梦想。分配 50 点属性，开启你的篮球人生。<br><span class="accent-note">最少使用 25 点即可开始，用的越少难度越大，但也更容易解锁特殊结局！</span></p>
      <div class="attr-alloc">
        <div v-for="key in ATTR_KEYS" :key="key" class="attr-row">
          <span class="attr-icon">{{ ATTR_ICONS[key] }}</span>
          <span class="attr-name">{{ ATTR_NAMES[key] }}</span>
          <div class="attr-bar">
            <button aria-label="减少属性" @click="game.adjustAttr(key, -1)">-</button>
            <input :id="`attr-${key}`" :name="`attr-${key}`" class="attr-input" type="number" min="0" max="10" :value="game.attrs[key]" @change="game.inputAttr(key, $event.target.value)" @keyup="game.inputAttr(key, $event.target.value)">
            <button aria-label="增加属性" @click="game.adjustAttr(key, 1)">+</button>
          </div>
        </div>
      </div>
      <div class="point-bar"><span>剩余点数：<strong>{{ game.remainPoints }}</strong> / 50（最少用25点）</span></div>
      <div class="create-name"><label for="player-name">球员姓名：</label><input id="player-name" v-model="game.playerName" placeholder="输入你的名字" maxlength="12"></div>
      <div class="create-actions">
        <button :disabled="game.remainPoints > 25" @click="game.confirmCreate">确认开始</button>
        <button @click="game.randomAlloc">随机分配</button>
        <button @click="game.resetAllocation">重置</button>
      </div>
    </div>
  </section>
</template>
