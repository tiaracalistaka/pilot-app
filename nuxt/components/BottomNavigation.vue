<template>
  <nav class="bottom-nav">
    <NuxtLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
    >
      <component :is="item.icon" :size="22" class="nav-icon" />
      <span class="nav-label">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Home, Calendar, BookOpen, MoreHorizontal } from 'lucide-vue-next'

const route = useRoute()

interface NavItem {
  path: string
  label: string
  icon: Component
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
  { path: '/logbook', label: 'Logbook', icon: BookOpen },
  { path: '/more', label: 'More', icon: MoreHorizontal },
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style lang="scss" scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: $card-surface;
  border-top: 1px solid $border-light;
  padding: $space-2 0;
  padding-bottom: calc($space-2 + env(safe-area-inset-bottom));
  z-index: 50;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: $space-2 $space-4;
  color: $text-tertiary;
  transition: all $duration-fast;
  border-radius: $radius-lg;
  min-width: 64px;

  &:hover {
    color: $text-secondary;
    background: $hover-overlay;
  }

  &.active {
    color: $brand-red;

    .nav-icon {
      transform: scale(1.1);
    }

    .nav-label {
      font-weight: $font-semibold;
    }
  }
}

.nav-icon {
  transition: transform $duration-fast;
}

.nav-label {
  font-size: 10px;
  font-weight: $font-medium;
  letter-spacing: 0.02em;
}
</style>
