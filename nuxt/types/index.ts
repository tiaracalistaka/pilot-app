export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  statusCode: number
}

export interface PilotProfile {
  id: string
  name: string
  username: string
  avatar: string
  totalFlightHours: number
}

export interface SessionUser {
  id: string
  username: string
  name: string
  avatar: string
  loginAt: number
  lastActivity: number
}

export interface FlightHourRecord {
  date: string
  hours: number
}

export interface RollingSumResult {
  date: string
  rollingSum: number
}

export interface LimitSummary {
  daily: { current: number; limit: number }
  weekly: { current: number; limit: number }
  monthly: { current: number; limit: number }
  annual: { current: number; limit: number }
}

export interface ChartBounds {
  limit: number
  yMax: number
}

export interface ChartBoundsMap {
  [key: string]: ChartBounds
}

export interface FlightHoursSummary {
  series: RollingSumResult[]
  limits: {
    daily: number
    weekly: number
    monthly: number
    annual: number
  }
  chartBounds: ChartBoundsMap
  limitSummary: LimitSummary
}

export interface DocumentRecord {
  id: string
  name: string
  type: string
  expiryDate: string
  thresholdDays: number
  status: 'safe' | 'soon' | 'expired'
  daysUntilExpiry: number
}

export interface ScheduleEntry {
  id: string
  date: string
  dutyType: string
  baseColor: string
  countSchedules: number
  countLogbooks: number
  isComplete: boolean
  remainingDuties: number
}

export interface ScheduleLegend {
  type: string
  name: string
  color: string
}

export interface MonthSchedule {
  year: number
  month: number
  schedules: ScheduleEntry[]
  legend: ScheduleLegend[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: string
}
