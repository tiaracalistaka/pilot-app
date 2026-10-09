<template>
    <div class="home-page">
      <!-- Header -->
      <header class="home-header">
        <div class="header-content">
          <div class="greeting">
            <p class="greeting-time">{{ greeting }}</p>
            <h1 class="greeting-name">{{ pilotStore.profile?.name || 'Pilot' }}</h1>
          </div>
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-value">{{ pilotStore.profile?.totalFlightHours?.toFixed(0) || '0' }}</span>
              <span class="stat-label">Total Hours</span>
            </div>
            <button class="avatar-btn" @click="handleLogout">
              <img
                :src="pilotStore.profile?.avatar || defaultAvatar"
                :alt="pilotStore.profile?.name"
                class="avatar-img"
              />
            </button>
          </div>
        </div>
        <div class="header-decoration"></div>
      </header>

      <main class="home-content">
        <!-- Hours to Limit Section -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Hours to Limit</h2>
            <span class="section-badge">Live</span>
          </div>

          <!-- Limit Cards Grid -->
          <div class="limit-cards-grid">
            <LimitCard
              v-for="card in limitCards"
              :key="card.id"
              :title="card.title"
              :current="card.current"
              :limit="card.limit"
              :period="card.period"
              :icon="card.icon"
            />
          </div>

          <!-- Chart Container -->
          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title-section">
                <h3 class="chart-title">Flight Hours Trend</h3>
                <p class="chart-subtitle">Rolling sum over selected period</p>
              </div>
              <div class="range-toggle">
                <button
                  v-for="range in ranges"
                  :key="range.value"
                  class="range-btn"
                  :class="{ active: selectedRange === range.value }"
                  @click="changeRange(range.value)"
                >
                  {{ range.label }}
                </button>
              </div>
            </div>
            <div class="chart-body">
              <FlightHoursChart
                :series="chartSeries"
                :limit="currentLimit"
                :y-max="currentYMax"
              />
            </div>
          </div>
        </section>

        <!-- Documents Section -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">My Documents</h2>
            <span class="section-count">{{ pilotStore.documents.length }} documents</span>
          </div>

          <div v-if="pilotStore.documents.length > 0" class="documents-list">
            <DocumentItem
              v-for="doc in pilotStore.documents"
              :key="doc.id"
              :document="doc"
            />
          </div>
          <div v-else class="empty-state">
            <FileX class="empty-icon" :size="48" />
            <p class="empty-text">No documents found</p>
          </div>
        </section>
      </main>
    </div>
</template>

<script setup lang="ts">
import { Plane, TrendingUp, Calendar, Award, FileX, LogOut } from 'lucide-vue-next'

definePageMeta({
  middleware: ['auth'],
})

const pilotStore = usePilotStore()
const { logout } = useAuth()

const selectedRange = ref('1w')
const chartSeries = ref<{ date: string; rollingSum: number }[]>([])

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

const ranges = [
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
]

const greeting = computed(() => {
  const hour = 7
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const chartBounds = computed(() => pilotStore.chartBounds)
const limitSummary = computed(() => pilotStore.limitSummary)

const currentLimit = computed(() => {
  return chartBounds.value?.[selectedRange.value]?.limit || 40
})

const currentYMax = computed(() => {
  return chartBounds.value?.[selectedRange.value]?.yMax || 45
})

const iconMap: Record<string, any> = {
  daily: Calendar,
  weekly: TrendingUp,
  monthly: Plane,
  annual: Award,
}

const limitCards = computed(() => {
  if (!limitSummary.value) return []

  return [
    {
      id: 'daily',
      title: 'Daily',
      current: limitSummary.value.daily.current,
      limit: limitSummary.value.daily.limit,
      period: 'Today',
      icon: iconMap.daily,
    },
    {
      id: 'weekly',
      title: 'Weekly',
      current: limitSummary.value.weekly.current,
      limit: limitSummary.value.weekly.limit,
      period: 'Last 7 days',
      icon: iconMap.weekly,
    },
    {
      id: 'monthly',
      title: 'Monthly',
      current: limitSummary.value.monthly.current,
      limit: limitSummary.value.monthly.limit,
      period: 'Last 30 days',
      icon: iconMap.monthly,
    },
    {
      id: 'annual',
      title: 'Annual',
      current: limitSummary.value.annual.current,
      limit: limitSummary.value.annual.limit,
      period: 'Last 365 days',
      icon: iconMap.annual,
    },
  ]
})

const changeRange = async (range: string) => {
  selectedRange.value = range
  await pilotStore.fetchFlightHoursSummary(range)
  updateChartSeries()
}

const updateChartSeries = () => {
  if (pilotStore.flightHoursSummary?.series) {
    chartSeries.value = pilotStore.flightHoursSummary.series
  }
}

const handleLogout = () => {
  logout()
}

onMounted(async () => {
  await pilotStore.fetchAll()
  updateChartSeries()
})

watch(() => pilotStore.flightHoursSummary, updateChartSeries)
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: $background;
}

.home-header {
  position: relative;
  background: linear-gradient(135deg, $primary-navy 0%, $primary-navy-light 100%);
  padding: $space-6 $space-4;
  padding-top: calc($space-6 + env(safe-area-inset-top));
  overflow: hidden;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: $container-app;
  margin: 0 auto;
}

.greeting-time {
  font-size: $text-sm;
  color: rgba(white, 0.7);
  margin-bottom: $space-1;
}

.greeting-name {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: white;
  letter-spacing: $tracking-tight;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: $space-4;
}

.stat-item {
  text-align: right;
  margin-right: $space-4;

  .stat-value {
    display: block;
    font-size: $text-xl;
    font-weight: $font-bold;
    color: white;
  }

  .stat-label {
    font-size: $text-xs;
    color: rgba(white, 0.6);
  }
}

.avatar-btn {
  width: 48px;
  height: 48px;
  border-radius: $radius-full;
  overflow: hidden;
  border: 2px solid rgba(white, 0.3);
  cursor: pointer;
  transition: all $duration-fast;
  flex-shrink: 0;

  &:hover {
    border-color: rgba(white, 0.6);
    transform: scale(1.05);
  }
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-decoration {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(white, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.home-content {
  max-width: $container-app;
  margin: 0 auto;
  padding: $space-6 $space-4;
  padding-bottom: 100px;
}

.section {
  margin-bottom: $space-8;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-4;
}

.section-title {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $text-primary;
  letter-spacing: $tracking-tight;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  padding: $space-1 $space-2;
  background: $success-light;
  color: $success;
  font-size: $text-xs;
  font-weight: $font-semibold;
  border-radius: $radius-full;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: $success;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.section-count {
  font-size: $text-sm;
  color: $text-secondary;
}

.limit-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-3;
  margin-bottom: $space-4;
}

.chart-card {
  background: $card-surface;
  border-radius: $radius-xl;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: $space-4;
  border-bottom: 1px solid $border-light;
  flex-wrap: wrap;
  gap: $space-3;
}

.chart-title-section {
  .chart-title {
    font-size: $text-base;
    font-weight: $font-semibold;
    color: $text-primary;
    margin-bottom: $space-1;
  }

  .chart-subtitle {
    font-size: $text-xs;
    color: $text-secondary;
  }
}

.range-toggle {
  display: flex;
  gap: $space-1;
  background: $background-secondary;
  padding: $space-1;
  border-radius: $radius-full;
}

.range-btn {
  padding: $space-2 $space-3;
  border-radius: $radius-full;
  font-size: $text-xs;
  font-weight: $font-semibold;
  color: $text-secondary;
  transition: all $duration-fast;

  &:hover {
    color: $text-primary;
    background: rgba(white, 0.5);
  }

  &.active {
    background: $primary-navy;
    color: white;
  }
}

.chart-body {
  padding: $space-4;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $space-12 $space-6;
  background: $card-surface;
  border-radius: $radius-xl;
  border: 1px dashed $border-default;
}

.empty-icon {
  color: $text-tertiary;
  margin-bottom: $space-3;
  opacity: 0.5;
}

.empty-text {
  font-size: $text-sm;
  color: $text-secondary;
}
</style>
