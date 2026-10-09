import type { ApiResponse, PilotProfile, FlightHoursSummary, DocumentRecord, MonthSchedule } from '~/types'

export const useApi = () => {
  const config = useRuntimeConfig()
  const { isAuthenticated } = useAuth()

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
    }
  }

  const handleResponse = async <T>(response: ApiResponse<T>): Promise<T> => {
    if (!response.success) {
      throw new Error(response.message || 'An error occurred')
    }
    return response.data as T
  }

  const getPilotProfile = async (): Promise<PilotProfile> => {
    const response = await $fetch<ApiResponse<PilotProfile>>(`${config.public.apiBase}/pilot/me`, {
      headers: getHeaders(),
      credentials: 'include',
    })
    return handleResponse(response)
  }

  const getFlightHoursSummary = async (range: string): Promise<FlightHoursSummary> => {
    const response = await $fetch<ApiResponse<FlightHoursSummary>>(
      `${config.public.apiBase}/flight-hours/summary?range=${range}`,
      {
        headers: getHeaders(),
        credentials: 'include',
      }
    )
    return handleResponse(response)
  }

  const getDocuments = async (): Promise<DocumentRecord[]> => {
    const response = await $fetch<ApiResponse<DocumentRecord[]>>(
      `${config.public.apiBase}/documents`,
      {
        headers: getHeaders(),
        credentials: 'include',
      }
    )
    return handleResponse(response)
  }

  const getSchedules = async (year: number, month: number): Promise<MonthSchedule> => {
    const response = await $fetch<ApiResponse<MonthSchedule>>(
      `${config.public.apiBase}/schedules?year=${year}&month=${month}`,
      {
        headers: getHeaders(),
        credentials: 'include',
      }
    )
    return handleResponse(response)
  }

  return {
    getPilotProfile,
    getFlightHoursSummary,
    getDocuments,
    getSchedules,
  }
}
