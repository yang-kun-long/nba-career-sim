<script setup>
defineProps({
  title: { type: String, required: true },
  items: { type: Array, required: true }
});
</script>

<template>
  <div class="physical-panel">
    <h3>{{ title }}</h3>
    <div class="physical-grid">
      <div v-for="item in items" :key="item[0]" class="physical-item">
        <div class="pi-value">{{ item[1] }}</div>
        <div class="pi-label">{{ item[0] }}</div>
      </div>
    </div>
  </div>
</template>
