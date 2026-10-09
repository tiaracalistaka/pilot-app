<template>
  <NuxtLayout name="auth">
    <div class="login-page">
      <!-- Background Elements -->
      <div class="login-bg">
        <div class="bg-gradient"></div>
        <div class="bg-pattern"></div>
      </div>

      <!-- Logo & Header -->
      <div class="login-header">
        <div class="logo-wrapper">
          <img
            src="/logo.png"
            alt="Susi Air"
            class="logo"
          />
        </div>
        <div class="header-text">
          <h1 class="title">Pilot App</h1>
          <p class="subtitle">Sign in to your account</p>
        </div>
      </div>

      <!-- Login Form -->
      <div class="login-card">
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Username Field -->
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <div class="input-wrapper">
              <User class="input-icon" :size="20" />
              <input
                id="username"
                v-model="credentials.username"
                type="text"
                class="form-input"
                :class="{ 'has-error': errorMessage }"
                placeholder="Enter your username"
                autocomplete="username"
                required
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-wrapper">
              <Lock class="input-icon" :size="20" />
              <input
                id="password"
                v-model="credentials.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'has-error': errorMessage }"
                placeholder="Enter your password"
                autocomplete="current-password"
                required
                :disabled="isLoading"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <Eye v-if="!showPassword" :size="20" />
                <EyeOff v-else :size="20" />
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <Transition name="error">
            <div v-if="errorMessage" class="error-message">
              <AlertCircle :size="16" />
              <span>{{ errorMessage }}</span>
            </div>
          </Transition>

          <!-- Submit Button -->
          <button
            type="submit"
            class="submit-btn"
            :class="{ 'is-loading': isLoading }"
            :disabled="isLoading || !isFormValid"
          >
            <span v-if="isLoading" class="btn-spinner"></span>
            <span v-else class="btn-text">Sign In</span>
          </button>
        </form>

        <!-- Security Notice -->
        <div class="security-notice">
          <Shield :size="14" />
          <span>Secured with 256-bit encryption</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="login-footer">
        <p class="version">Susi Air Pilot App v1.0</p>
        <p class="timezone">Timezone: Asia/Jakarta (UTC+7)</p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { User, Lock, Eye, EyeOff, AlertCircle, Shield } from 'lucide-vue-next'

definePageMeta({
  layout: false,
})

const { login, isAuthenticated } = useAuth()
const router = useRouter()

const credentials = reactive({
  username: '',
  password: '',
})

const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const isFormValid = computed(() => {
  return credentials.username.length >= 3 && credentials.password.length >= 1
})

watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    router.push('/')
  }
}, { immediate: true })

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await login(credentials.username, credentials.password)
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.message || 'Invalid username or password'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color';

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $space-6;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, $primary-navy 0%, $primary-navy-light 50%, $primary-navy-dark 100%);
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.login-header {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: $space-8;
}

.logo-wrapper {
  margin-bottom: $space-6;
}

.logo {
  height: 48px;
  margin: 0 auto;
  filter: brightness(0) invert(1);
}

.header-text {
  .title {
    font-size: $text-2xl;
    font-weight: $font-extrabold;
    color: white;
    letter-spacing: $tracking-tight;
    margin-bottom: $space-2;
  }

  .subtitle {
    font-size: $text-base;
    color: rgba(white, 0.7);
  }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: $card-surface;
  border-radius: $radius-2xl;
  padding: $space-8;
  box-shadow: $shadow-2xl;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.form-label {
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $text-secondary;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: $space-4;
  color: $text-tertiary;
  pointer-events: none;
  transition: color $duration-fast;
}

.form-input {
  width: 100%;
  padding: $space-4 $space-4 $space-4 $space-12;
  border: 1.5px solid $border-default;
  border-radius: $radius-lg;
  font-size: $text-base;
  color: $text-primary;
  background: $card-surface;
  transition: all $duration-fast;

  &::placeholder {
    color: $text-tertiary;
  }

  &:hover:not(:disabled) {
    border-color: color.adjust($border-default, $lightness: -10%);
  }

  &:focus {
    border-color: $primary-navy;
    box-shadow: 0 0 0 3px rgba($primary-navy, 0.1);
    outline: none;

    & + .input-icon,
    ~ .input-icon {
      color: $primary-navy;
    }
  }

  &.has-error {
    border-color: $danger;

    &:focus {
      box-shadow: 0 0 0 3px rgba($danger, 0.1);
    }
  }

  &:disabled {
    background: $background-secondary;
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.password-toggle {
  position: absolute;
  right: $space-3;
  padding: $space-2;
  color: $text-tertiary;
  cursor: pointer;
  border-radius: $radius-sm;
  transition: color $duration-fast;

  &:hover {
    color: $text-secondary;
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-3 $space-4;
  background: $danger-light;
  color: $danger;
  border-radius: $radius-lg;
  font-size: $text-sm;
  font-weight: $font-medium;
}

.error-enter-active,
.error-leave-active {
  transition: all $duration-normal $transition-ease-out;
}

.error-enter-from,
.error-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.submit-btn {
  width: 100%;
  padding: $space-4;
  background: $brand-red;
  color: white;
  font-size: $text-base;
  font-weight: $font-semibold;
  border-radius: $radius-full;
  cursor: pointer;
  transition: all $duration-normal $transition-ease-out;
  box-shadow: 0 4px 14px rgba($brand-red, 0.4);
  margin-top: $space-2;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    background: $brand-red-dark;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba($brand-red, 0.45);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.is-loading {
    color: transparent;
  }
}

.btn-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(white, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  margin-top: $space-6;
  padding-top: $space-6;
  border-top: 1px solid $border-light;
  color: $text-tertiary;
  font-size: $text-xs;
}

.login-footer {
  position: relative;
  z-index: 1;
  margin-top: $space-8;
  text-align: center;
  color: rgba(white, 0.5);
  font-size: $text-xs;

  .version {
    margin-bottom: $space-1;
  }

  .timezone {
    font-family: $font-mono;
  }
}
</style>
