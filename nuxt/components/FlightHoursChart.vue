<template>
  <div class="chart-wrapper">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  series: { date: string; rollingSum: number }[]
  limit: number
  yMax: number
}>()

const chartYMax = computed(() => {
  const seriesMax = Math.max(0, ...props.series.map((item) => item.rollingSum))
  const paddedSeriesMax = Math.ceil(seriesMax * 1.1)

  return Math.max(props.yMax, paddedSeriesMax)
})

const chartData = computed(() => {
  const labels = props.series.map((s) => {
    const date = new Date(s.date + 'T00:00:00')
    return `${date.getMonth() + 1}/${date.getDate()}`
  })

  return {
    labels,
    datasets: [
      {
        label: 'Rolling Sum',
        data: props.series.map((s) => s.rollingSum),
        borderColor: '#22C5E8',
        backgroundColor: 'rgba(34, 197, 232, 0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#22C5E8',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        pointHitRadius: 10,
      },
      {
        label: 'Limit',
        data: props.series.map(() => props.limit),
        borderColor: '#E63757',
        borderWidth: 2,
        borderDash: [6, 4],
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#0E2138',
      titleFont: {
        family: 'Plus Jakarta Sans',
        size: 12,
        weight: 600,
      },
      bodyFont: {
        family: 'Plus Jakarta Sans',
        size: 12,
      },
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      boxWidth: 8,
      boxHeight: 8,
      boxPadding: 4,
      callbacks: {
        title: (context: any) => {
          const date = new Date(props.series[context[0].dataIndex].date + 'T00:00:00')
          return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })
        },
        label: (context: any) => {
          const value = context.parsed.y.toFixed(1)
          if (context.datasetIndex === 0) {
            return `  Hours: ${value}h`
          }
          return `  Limit: ${props.limit}h`
        },
        labelTextColor: (context: any) => {
          return context.datasetIndex === 0 ? '#22C5E8' : '#E63757'
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        font: {
          family: 'Plus Jakarta Sans',
          size: 10,
        },
        color: '#94A3B8',
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 7,
        padding: 8,
      },
    },
    y: {
      min: 0,
      max: chartYMax.value,
      grid: {
        color: '#F1F5F9',
        drawTicks: false,
      },
      border: {
        display: false,
        dash: [4, 4],
      },
      ticks: {
        font: {
          family: 'Plus Jakarta Sans',
          size: 10,
        },
        color: '#94A3B8',
        stepSize: Math.ceil(chartYMax.value / 5),
        padding: 8,
      },
    },
  },
  elements: {
    line: {
      capBezierPoints: true,
    },
  },
}))
</script>

<style lang="scss" scoped>
.chart-wrapper {
  height: 200px;
  width: 100%;
}
</style>
