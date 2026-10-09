import { defineStore } from 'pinia'
import type { PilotProfile, FlightHoursSummary, DocumentRecord, LimitSummary, ChartBoundsMap } from '~/types'

export const usePilotStore = defineStore('pilot', () => {
  const profile = ref<PilotProfile | null>(null)
  const flightHoursSummary = ref<FlightHoursSummary | null>(null)
  const documents = ref<DocumentRecord[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const api = useApi()

  const fetchProfile = async () => {
    isLoading.value = true
    error.value = null
    try {
      profile.value = await api.getPilotProfile()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch profile'
    } finally {
      isLoading.value = false
    }
  }

  const fetchFlightHoursSummary = async (range: string = '1w') => {
    isLoading.value = true
    error.value = null
    try {
      flightHoursSummary.value = await api.getFlightHoursSummary(range)
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch flight hours summary'
    } finally {
      isLoading.value = false
    }
  }

  const fetchDocuments = async () => {
    isLoading.value = true
    error.value = null
    try {
      documents.value = await api.getDocuments()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch documents'
    } finally {
      isLoading.value = false
    }
  }

  const limitSummary = computed<LimitSummary | null>(() => {
    return flightHoursSummary.value?.limitSummary || null
  })

  const chartBounds = computed<ChartBoundsMap | null>(() => {
    return flightHoursSummary.value?.chartBounds || null
  })

  const fetchAll = async () => {
    await Promise.all([fetchProfile(), fetchFlightHoursSummary(), fetchDocuments()])
  }

  return {
    profile,
    flightHoursSummary,
    documents,
    isLoading,
    error,
    limitSummary,
    chartBounds,
    fetchProfile,
    fetchFlightHoursSummary,
    fetchDocuments,
    fetchAll,
  }
})
