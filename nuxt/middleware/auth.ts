export default defineNuxtRouteMiddleware(async (to) => {

  if (to.path === '/login') {
    return
  }

  if (process.client) {
    const { isAuthenticated, initAuth } = useAuth()

    await initAuth()

    if (!isAuthenticated.value) {
      return navigateTo('/login')
    }
  }
})
