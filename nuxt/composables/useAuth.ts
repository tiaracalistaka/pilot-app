import type { ApiResponse, LoginResponse, PilotProfile, SessionUser } from '~/types'

export const useAuth = () => {
  const config = useRuntimeConfig()
  const isAuthenticated = useState<boolean>('is_authenticated', () => false)
  const currentUser = useState<SessionUser | null>('current_user', () => null)
  const isLoading = useState<boolean>('auth_loading', () => false)

  const initAuth = async () => {
    if (process.server) return

    try {
      const response = await $fetch<ApiResponse<{ user: SessionUser }>>(
        `${config.public.apiBase}/auth/session`,
        {
          credentials: 'include',
        }
      )

      if (response.success && response.data?.user) {
        currentUser.value = response.data.user
        isAuthenticated.value = true
      }
    } catch {
      currentUser.value = null
      isAuthenticated.value = false
    }
  }


  const login = async (username: string, password: string): Promise<void> => {
    isLoading.value = true

    try {
      const response = await $fetch<ApiResponse<{ user: SessionUser; expiresAt: number }>>(
        `${config.public.apiBase}/auth/login`,
        {
          method: 'POST',
          credentials: 'include',
          body: { username, password },
        }
      )

      if (response.success && response.data?.user) {
        currentUser.value = response.data.user
        isAuthenticated.value = true
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error: any) {
      const message = error.data?.message || error.message || 'Login failed'
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch(`${config.public.apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
    } finally {
      currentUser.value = null
      isAuthenticated.value = false
      navigateTo('/login')
    }
  }

  const getSession = async (): Promise<SessionUser | null> => {
    try {
      const response = await $fetch<ApiResponse<{ user: SessionUser }>>(
        `${config.public.apiBase}/auth/session`,
        {
          credentials: 'include',
        }
      )

      if (response.success && response.data?.user) {
        return response.data.user
      }
      return null
    } catch {
      return null
    }
  }

  const checkAuth = () => {
    return isAuthenticated.value
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    currentUser: readonly(currentUser),
    isLoading: readonly(isLoading),
    login,
    logout,
    initAuth,
    getSession,
    checkAuth,
  }
}
