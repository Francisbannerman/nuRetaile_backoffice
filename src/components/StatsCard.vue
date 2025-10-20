<template>
  <div class="stats-card">
    <div class="stats-content">
      <p class="stats-label">{{ label }}</p>
      <p class="stats-value">{{ value }}</p>
      <p v-if="change" :class="['stats-change', changeClass]">
        {{ change }}
      </p>
    </div>
    <div :class="['stats-icon', iconClass]">
      <component :is="icon" :size="24" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: [String, Number],
  change: String,
  icon: Function,
  color: {
    type: String,
    default: 'blue'
  }
})

const iconClass = computed(() => `icon-${props.color}`)
const changeClass = computed(() => {
  if (!props.change) return ''
  return props.change.startsWith('+') ? 'positive' : 'negative'
})
</script>

<style scoped>
.stats-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-content {
  flex: 1;
}

.stats-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stats-value {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0.25rem 0;
}

.stats-change {
  font-size: 0.875rem;
  font-weight: 500;
}

.stats-change.positive {
  color: #10b981;
}

.stats-change.negative {
  color: #ef4444;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.icon-blue { background: #2563eb; }
.icon-green { background: #10b981; }
.icon-purple { background: #8b5cf6; }
.icon-orange { background: #f59e0b; }
.icon-red { background: #ef4444; }
</style>