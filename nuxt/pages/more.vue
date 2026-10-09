<template>
    <div class="placeholder-page container">
      <div class="placeholder-content">
        <MoreHorizontal :size="64" class="placeholder-icon" />
        <h1 class="placeholder-title">More</h1>
        <p class="placeholder-text">Coming soon</p>
      </div>
    </div>
</template>

<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth'],
})
</script>

<style lang="scss" scoped>
.placeholder-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
}

.placeholder-content {
  text-align: center;
}

.placeholder-icon {
  color: $text-secondary;
  margin-bottom: $spacing-lg;
  opacity: 0.5;
}

.placeholder-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.placeholder-text {
  color: $text-secondary;
}
</style>
