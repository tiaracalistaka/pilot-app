<template>
  <div class="document-item">
    <div class="document-info">
      <div class="document-icon" :class="statusClass">
        <FileText :size="20" />
      </div>
      <div class="document-details">
        <h3 class="document-name">{{ document.name }}</h3>
        <p class="document-type">{{ formattedType }}</p>
      </div>
    </div>
    <div class="document-status">
      <span :class="['badge', badgeClass]">
        <component :is="statusIcon" :size="12" />
        {{ statusText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-vue-next'
import type { DocumentRecord } from '~/types'

const props = defineProps<{
  document: DocumentRecord
}>()

const formattedType = computed(() => {
  return props.document.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
})

const statusClass = computed(() => {
  return props.document.status
})

const badgeClass = computed(() => {
  switch (props.document.status) {
    case 'safe':
      return 'badge--safe'
    case 'soon':
      return 'badge--soon'
    case 'expired':
      return 'badge--expired'
    default:
      return 'badge--default'
  }
})

const statusIcon = computed(() => {
  switch (props.document.status) {
    case 'safe':
      return CheckCircle
    case 'soon':
      return AlertTriangle
    case 'expired':
      return XCircle
    default:
      return CheckCircle
  }
})

const statusText = computed(() => {
  if (props.document.daysUntilExpiry < 0) {
    return 'Expired'
  }
  if (props.document.daysUntilExpiry === 0) {
    return 'Today'
  }
  return `${props.document.daysUntilExpiry}d`
})
</script>

<style lang="scss" scoped>
@use 'sass:color';

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $card-surface;
  border-radius: $radius-xl;
  padding: $space-4;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  transition: all $duration-fast;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-1px);
  }
}

.document-info {
  display: flex;
  align-items: center;
  gap: $space-3;
  flex: 1;
  min-width: 0;
}

.document-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-lg;
  background: $background-secondary;
  color: $text-secondary;
  flex-shrink: 0;

  &.safe {
    background: $success-light;
    color: $success;
  }

  &.soon {
    background: $warning-light;
    color: color.adjust($warning, $lightness: -5%);
  }

  &.expired {
    background: $danger-light;
    color: $danger;
  }
}

.document-details {
  flex: 1;
  min-width: 0;
}

.document-name {
  font-size: $text-sm;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-1;
  line-height: $leading-tight;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-type {
  font-size: $text-xs;
  color: $text-secondary;
}

.document-status {
  flex-shrink: 0;
  margin-left: $space-3;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
}
</style>
