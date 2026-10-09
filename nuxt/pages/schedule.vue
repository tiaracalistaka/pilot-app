<template>
    <div class="schedule-page">
      <!-- Header -->
      <header class="schedule-header">
        <h1 class="page-title">Schedule</h1>
        <div class="month-navigation">
          <button class="nav-btn" @click="scheduleStore.prevMonth" :disabled="isLoading">
            <ChevronLeft :size="20" />
          </button>
          <div class="current-month">
            <span class="month-name">{{ monthName }}</span>
            <span class="year">{{ scheduleStore.currentYear }}</span>
          </div>
          <button class="nav-btn" @click="scheduleStore.nextMonth" :disabled="isLoading">
            <ChevronRight :size="20" />
          </button>
        </div>
      </header>

      <!-- Calendar -->
      <div class="calendar-wrapper">
        <div class="calendar">
          <!-- Weekday Headers -->
          <div class="calendar-weekdays">
            <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
          </div>

          <!-- Calendar Grid -->
          <div class="calendar-grid">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="calendar-cell"
              :class="{
                'is-empty': !day.date,
                'is-today': day.isToday,
                'has-schedule': day.schedules.length > 0,
              }"
              :style="day.schedules.length ? { backgroundColor: day.schedules[0].baseColor } : undefined"
              @click="day.schedules.length > 0 && openDetail(day.date)"
            >
              <span v-if="day.date" class="day-number">{{ day.date }}</span>

              <!-- Schedule Indicators -->
              <div v-if="day.schedules.length > 0" class="schedule-indicators">
                <div
                  v-for="(schedule, i) in day.schedules.slice(0, 2)"
                  :key="i"
                  class="schedule-dot"
                  :style="{ backgroundColor: schedule.baseColor }"
                >
                  <Check v-if="schedule.isComplete" :size="8" class="check-icon" />
                </div>
                <span v-if="day.schedules.length > 2" class="more-indicator">
                  +{{ day.schedules.length - 2 }}
                </span>
              </div>

              <!-- Remaining Count -->
              <div
                v-if="day.schedules.length > 0 && !allComplete(day.schedules)"
                class="remaining-badge"
              >
                {{ getRemainingCount(day.schedules) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="legend">
          <h3 class="legend-title">Legend</h3>
          <div class="legend-grid">
            <div
              v-for="item in scheduleStore.currentSchedule?.legend"
              :key="item.type"
              class="legend-item"
            >
              <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
              <span class="legend-name">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showDetailModal" class="modal-overlay" @click="closeDetail">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h2 class="modal-title">{{ selectedDateFormatted }}</h2>
                <button class="modal-close" @click="closeDetail">
                  <X :size="20" />
                </button>
              </div>
              <div class="modal-body">
                <div class="modal-placeholder">
                  <Calendar class="placeholder-icon" :size="48" />
                  <p class="placeholder-text">Detail page coming soon</p>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn--outline" @click="closeDetail">Close</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, Check, X, Calendar } from 'lucide-vue-next'
import type { ScheduleEntry } from '~/types'

definePageMeta({
  middleware: ['auth'],
})

const scheduleStore = useScheduleStore()

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const showDetailModal = ref(false)
const selectedDate = ref('')

const isLoading = computed(() => scheduleStore.isLoading)

const monthName = computed(() => monthNames[scheduleStore.currentMonth - 1])

const selectedDateFormatted = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const today = new Date('2026-05-15T00:00:00')

interface CalendarDay {
  date: number | null
  isToday: boolean
  schedules: ScheduleEntry[]
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = scheduleStore.currentYear
  const month = scheduleStore.currentMonth

  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const days: CalendarDay[] = []

  for (let i = 0; i < firstDay; i++) {
    days.push({ date: null, isToday: false, schedules: [] })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const isToday = year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate()
    const schedules = scheduleStore.schedulesByDate.get(dateStr) || []

    days.push({ date: day, isToday, schedules })
  }

  const remaining = 42 - days.length
  for (let i = 0; i < remaining; i++) {
    days.push({ date: null, isToday: false, schedules: [] })
  }

  return days
})

const allComplete = (schedules: ScheduleEntry[]) => {
  return schedules.every(s => s.isComplete)
}

const getRemainingCount = (schedules: ScheduleEntry[]) => {
  return schedules.reduce(
    (remaining, schedule) => remaining + Math.max(0, schedule.countSchedules - schedule.countLogbooks),
    0,
  )
}

const openDetail = (date: number | null) => {
  if (!date) return
  const year = scheduleStore.currentYear
  const month = scheduleStore.currentMonth
  selectedDate.value = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`
  showDetailModal.value = true
}

const closeDetail = () => {
  showDetailModal.value = false
}

onMounted(() => {
  scheduleStore.fetchSchedules()
})
</script>

<style lang="scss" scoped>
.schedule-page {
  min-height: 100vh;
  background: $background;
  padding-bottom: 100px;
}

.schedule-header {
  background: $primary-navy;
  color: white;
  padding: $space-6 $space-4;
  padding-top: calc($space-6 + env(safe-area-inset-top));
}

.page-title {
  font-size: $text-2xl;
  font-weight: $font-bold;
  text-align: center;
  margin-bottom: $space-4;
  letter-spacing: $tracking-tight;
}

.month-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $space-4;
}

.nav-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  background: rgba(white, 0.1);
  color: white;
  transition: all $duration-fast;

  &:hover:not(:disabled) {
    background: rgba(white, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.current-month {
  text-align: center;
  min-width: 140px;

  .month-name {
    display: block;
    font-size: $text-lg;
    font-weight: $font-semibold;
  }

  .year {
    font-size: $text-sm;
    opacity: 0.7;
  }
}

.calendar-wrapper {
  max-width: $container-app;
  margin: 0 auto;
  padding: $space-4;
}

.calendar {
  background: $card-surface;
  border-radius: $radius-xl;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  overflow: hidden;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: $background-secondary;
  padding: $space-3 0;
  border-bottom: 1px solid $border-light;
}

.weekday {
  text-align: center;
  font-size: $text-xs;
  font-weight: $font-semibold;
  color: $text-secondary;
  text-transform: uppercase;
  letter-spacing: $tracking-wide;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: $border-light;
  padding: 1px;
}

.calendar-cell {
  background: $card-surface;
  min-height: 72px;
  padding: $space-2;
  position: relative;
  transition: background $duration-fast;

  &.is-empty {
    background: $background-secondary;
  }

  &.is-today {
    background: rgba($brand-red, 0.03);

    .day-number {
      background: $brand-red;
      color: white;
    }
  }

  &.has-schedule {
    cursor: pointer;
    color: white;

    &:hover {
      filter: brightness(0.92);
    }

    .day-number {
      color: white;
      background: rgba(white, 0.18);
    }

    .schedule-dot {
      background: rgba(white, 0.28) !important;
      border: 1px solid rgba(white, 0.35);
    }

    .more-indicator,
    .remaining-badge {
      color: white;
      background: rgba(0, 0, 0, 0.22);
    }
  }
}

.day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $text-primary;
  border-radius: $radius-full;
  margin-bottom: $space-1;
}

.schedule-indicators {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.schedule-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  color: white;
}

.more-indicator {
  font-size: 8px;
  font-weight: $font-semibold;
  color: $text-tertiary;
}

.remaining-badge {
  position: absolute;
  top: $space-1;
  right: $space-1;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $warning;
  color: white;
  font-size: 8px;
  font-weight: $font-bold;
  border-radius: $radius-full;
}

.legend {
  margin-top: $space-4;
  background: $card-surface;
  border-radius: $radius-xl;
  padding: $space-4;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
}

.legend-title {
  font-size: $text-sm;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-3;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: $space-2;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  font-size: $text-xs;
  color: $text-secondary;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-4;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: $card-surface;
  border-radius: $radius-xl;
  width: 100%;
  max-width: 360px;
  overflow: hidden;
  box-shadow: $shadow-2xl;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-4;
  border-bottom: 1px solid $border-light;
}

.modal-title {
  font-size: $text-base;
  font-weight: $font-semibold;
  color: $text-primary;
}

.modal-close {
  padding: $space-2;
  color: $text-secondary;
  border-radius: $radius-md;
  transition: all $duration-fast;

  &:hover {
    background: $hover-overlay;
    color: $text-primary;
  }
}

.modal-body {
  padding: $space-6;
}

.modal-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.placeholder-icon {
  color: $text-tertiary;
  margin-bottom: $space-3;
  opacity: 0.5;
}

.placeholder-text {
  font-size: $text-sm;
  color: $text-secondary;
}

.modal-footer {
  padding: $space-4;
  border-top: 1px solid $border-light;
  display: flex;
  justify-content: flex-end;
}

.modal-enter-active,
.modal-leave-active {
  transition: all $duration-normal $transition-ease-out;

  .modal-content {
    transition: all $duration-normal $transition-ease-out;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-content {
    transform: scale(0.95) translateY(10px);
  }
}
</style>
