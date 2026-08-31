<script setup>
import { computed } from 'vue';

const props = defineProps({
  events: { type: Array, default: () => [] },
  reverse: { type: Boolean, default: false }
});

const displayedEvents = computed(() => props.reverse ? [...props.events].reverse() : props.events);

function formatEffects(effects = []) {
  return effects.map((effect) => {
    if (typeof effect.change === 'string') return `${effect.attr}: ${effect.change}`;
    return `${effect.attr}${effect.change > 0 ? '+' : ''}${effect.change}`;
  }).join(' | ');
}
</script>

<template>
  <div class="history-panel">
    <p v-if="!displayedEvents.length" class="empty-state">暂无事件记录</p>
    <div v-for="(event, index) in displayedEvents" :key="`${event.age}-${event.title}-${index}`" class="history-item">
      <div class="hi-age">{{ event.age }}岁 | {{ event.team }} | 事件{{ event.eventNum }}/{{ event.totalEvents }}</div>
      <div class="hi-title">{{ event.title }}</div>
      <div v-if="event.choice" class="hi-choice">选择：{{ event.choice }}</div>
      <div v-if="event.effects?.length" class="hi-effects">{{ formatEffects(event.effects) }}</div>
    </div>
  </div>
</template>
