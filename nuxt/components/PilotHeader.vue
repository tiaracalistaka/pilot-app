<template>
  <header class="pilot-header">
    <div class="header-content container">
      <div class="greeting-section">
        <p class="time-label">{{ timeLabel }}</p>
        <h1 class="pilot-name">{{ profile?.name || 'Pilot' }}</h1>
      </div>
      <div class="stats-section">
        <div class="flight-stats">
          <span class="stat-value">{{ profile?.totalFlightHours?.toFixed(0) || '0' }}</span>
          <span class="stat-label">Hours</span>
        </div>
        <div class="avatar-wrapper">
          <img
            :src="profile?.avatar || defaultAvatar"
            :alt="profile?.name"
            class="avatar"
          />
        </div>
      </div>
    </div>
    <div class="header-bg">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const pilotStore = usePilotStore()

const profile = computed(() => pilotStore.profile)
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

const timeLabel = computed(() => {
  const hour = 7
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})
</script>

<style lang="scss" scoped>
.pilot-header {
  position: relative;
  background: linear-gradient(135deg, $primary-navy 0%, $primary-navy-light 100%);
  padding: $space-4 $space-4;
  padding-top: calc($space-2 + env(safe-area-inset-top));
  overflow: hidden;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.greeting-section {
  .time-label {
    font-size: $text-sm;
    color: rgba(white, 0.7);
    margin-bottom: $space-1;
  }

  .pilot-name {
    font-size: $text-xl;
    font-weight: $font-bold;
    color: white;
    letter-spacing: $tracking-tight;
  }
}

.stats-section {
  display: flex;
  align-items: center;
  gap: $space-4;
}

.flight-stats {
  text-align: right;
  margin-right: $space-2;

  .stat-value {
    display: block;
    font-size: $text-2xl;
    font-weight: $font-bold;
    color: white;
    line-height: 1;
    letter-spacing: $tracking-tight;
  }

  .stat-label {
    font-size: $text-xs;
    color: rgba(white, 0.6);
  }
}

.avatar-wrapper {
  width: 52px;
  height: 52px;
  border-radius: $radius-full;
  overflow: hidden;
  border: 3px solid rgba(white, 0.25);
  box-shadow: $shadow-md;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(white, 0.1) 0%, transparent 70%);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -80px;
  right: -60px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -80px;
  left: -40px;
  opacity: 0.5;
}
</style>
