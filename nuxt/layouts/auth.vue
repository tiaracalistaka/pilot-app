<template>
  <div class="auth-layout">
    <slot />
  </div>
</template>

<script setup lang="ts">
const { initAuth } = useAuth()

onMounted(() => {
  initAuth()
})
</script>

<style lang="scss" scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
