import type { MonthSchedule, ScheduleEntry } from '~/types'

export const useScheduleStore = defineStore('schedule', () => {
  const currentSchedule = ref<MonthSchedule | null>(null)
  const currentYear = ref(2026)
  const currentMonth = ref(5)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const api = useApi()

  const fetchSchedules = async (year?: number, month?: number) => {
    if (year !== undefined) currentYear.value = year
    if (month !== undefined) currentMonth.value = month

    isLoading.value = true
    error.value = null
    try {
      currentSchedule.value = await api.getSchedules(currentYear.value, currentMonth.value)
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch schedules'
    } finally {
      isLoading.value = false
    }
  }

  const nextMonth = () => {
    if (currentMonth.value === 12) {
      currentMonth.value = 1
      currentYear.value++
    } else {
      currentMonth.value++
    }
    fetchSchedules()
  }

  const prevMonth = () => {
    if (currentMonth.value === 1) {
      currentMonth.value = 12
      currentYear.value--
    } else {
      currentMonth.value--
    }
    fetchSchedules()
  }

  const schedulesByDate = computed(() => {
    if (!currentSchedule.value?.schedules) return new Map<string, ScheduleEntry[]>()

    const map = new Map<string, ScheduleEntry[]>()
    currentSchedule.value.schedules.forEach((schedule) => {
      const existing = map.get(schedule.date) || []
      existing.push(schedule)
      map.set(schedule.date, existing)
    })
    return map
  })

  return {
    currentSchedule,
    currentYear,
    currentMonth,
    isLoading,
    error,
    schedulesByDate,
    fetchSchedules,
    nextMonth,
    prevMonth,
  }
})
