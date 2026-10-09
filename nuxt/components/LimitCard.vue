<template>
  <div class="limit-card" :class="statusClass">
    <div class="card-header">
      <div class="card-icon" :class="statusClass">
        <component :is="icon" :size="18" />
      </div>
      <span class="card-period">{{ period }}</span>
    </div>

    <div class="card-body">
      <div class="hours-display">
        <span class="current-value">{{ current.toFixed(1) }}</span>
        <span class="separator">/</span>
        <span class="limit-value">{{ limit }}h</span>
      </div>

      <div class="progress-wrapper">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressWidth }"
          ></div>
        </div>
        <span class="progress-percentage">{{ percentageText }}</span>
      </div>
    </div>

    <div class="card-footer">
      <span class="remaining-text">{{ remainingText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

const props = defineProps<{
  title: string
  current: number
  limit: number
  period: string
  icon?: Component
}>()

const progressWidth = computed(() => {
  const percentage = (props.current / props.limit) * 100
  return `${Math.min(percentage, 100)}%`
})

const percentage = computed(() => {
  return Math.round((props.current / props.limit) * 100)
})

const percentageText = computed(() => {
  return `${percentage.value}%`
})

const remaining = computed(() => {
  return Math.max(props.limit - props.current, 0)
})

const remainingText = computed(() => {
  if (props.current >= props.limit) {
    return 'Limit reached'
  }
  return `${remaining.value.toFixed(1)}h remaining`
})

const statusClass = computed(() => {
  const pct = (props.current / props.limit) * 100
  if (pct >= 100) return 'danger'
  if (pct >= 80) return 'warning'
  if (pct >= 60) return 'caution'
  return 'normal'
})
</script>

<style lang="scss" scoped>
.limit-card {
  background: $card-surface;
  border-radius: $radius-xl;
  padding: $space-4;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  transition: all $duration-normal $transition-ease-out;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }

  &.warning {
    border-color: rgba($warning, 0.3);
    background: linear-gradient(135deg, $card-surface 0%, rgba($warning, 0.03) 100%);
  }

  &.danger {
    border-color: rgba($danger, 0.3);
    background: linear-gradient(135deg, $card-surface 0%, rgba($danger, 0.03) 100%);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-3;
}

.card-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-lg;
  background: $background-secondary;
  color: $text-secondary;
  transition: all $duration-fast;

  &.warning {
    background: $warning-light;
    color: $warning;
  }

  &.danger {
    background: $danger-light;
    color: $danger;
  }

  &.caution {
    background: rgba($info, 0.1);
    color: $info;
  }
}

.card-period {
  font-size: $text-xs;
  color: $text-tertiary;
  text-transform: uppercase;
  letter-spacing: $tracking-wide;
  font-weight: $font-medium;
}

.card-body {
  margin-bottom: $space-3;
}

.hours-display {
  display: flex;
  align-items: baseline;
  gap: $space-1;
  margin-bottom: $space-2;
}

.current-value {
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $text-primary;
  letter-spacing: $tracking-tight;
}

.separator {
  font-size: $text-sm;
  color: $text-tertiary;
}

.limit-value {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $text-secondary;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: $background-secondary;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $success;
  border-radius: 3px;
  transition: width $duration-slow $transition-ease-out;

  .warning & {
    background: $warning;
  }

  .danger & {
    background: $danger;
  }

  .caution & {
    background: $info;
  }
}

.progress-percentage {
  font-size: $text-xs;
  font-weight: $font-semibold;
  color: $text-secondary;
  min-width: 32px;
  text-align: right;
}

.card-footer {
  padding-top: $space-2;
  border-top: 1px solid $border-light;
}

.remaining-text {
  font-size: $text-xs;
  color: $text-tertiary;
}
</style>
