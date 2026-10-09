<template>
  <div class="default-layout">
    <header class="brand-header">
      <NuxtLink to="/" class="brand-link" aria-label="Susi Air Pilot home">
        <img src="/logo.png" alt="Susi Air" class="brand-logo" />
        <span class="brand-divider" aria-hidden="true"></span>
        <span class="brand-title">Pilot App</span>
      </NuxtLink>
    </header>
    <slot />
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
const { initAuth } = useAuth()

onMounted(() => {
  initAuth()
})
</script>

<style lang="scss" scoped>
.default-layout {
  min-height: 100vh;
  padding-bottom: 72px;
}

.brand-header {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 64px;
  display: flex;
  align-items: center;
  background: $card-surface;
  border-bottom: 1px solid $border-light;
  box-shadow: $shadow-xs;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: $space-3;
  width: 100%;
  max-width: $container-app;
  margin: 0 auto;
  padding: 0 $space-5;
}

.brand-logo {
  width: 104px;
  height: 38px;
  object-fit: contain;
}

.brand-divider {
  width: 1px;
  height: 24px;
  background: $border-default;
}

.brand-title {
  color: $primary-navy;
  font-size: $text-sm;
  font-weight: $font-bold;
  letter-spacing: $tracking-normal;
}

@media (min-width: $breakpoint-md) {
  .brand-link {
    max-width: $container-lg;
  }
}
</style>
