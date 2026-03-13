<template>
  <component
    :is="icon"
    class="ghost-icon"
    :size="size"
    :style="{
      opacity: opacity,
      color: colorValue,
      top: top,
      right: right,
      bottom: bottom,
      left: left,
      transform: transform,
    }"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: { type: [Object, Function], required: true },
  size: { type: Number, default: 160 },
  opacity: { type: Number, default: 0.05 },
  color: { type: String, default: 'primary' }, // 'primary' | 'success' | 'warning' | 'accent' | 'white'
  top: { type: String, default: '50%' },
  right: { type: String, default: '-20px' },
  bottom: { type: String, default: 'auto' },
  left: { type: String, default: 'auto' },
  transform: { type: String, default: 'translateY(-50%)' },
})

const colorValue = computed(() => {
  const map = {
    primary: 'var(--primary-400, #818cf8)',
    success: 'var(--success-400, #4ade80)',
    warning: 'var(--warning-400, #fbbf24)',
    accent:  'var(--accent-400, #c084fc)',
    white:   '#ffffff',
  }
  return map[props.color] ?? props.color
})
</script>

<style scoped>
.ghost-icon {
  position: absolute;
  pointer-events: none;
  user-select: none;
  flex-shrink: 0;
}
</style>
