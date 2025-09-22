/* eslint-disable camelcase */
import { api, env } from '@/api/axios'

export interface HealthCheckResponse {
  status: string
  timestamp: string
  database: string
  openai: string
}

export async function getHealthStatus(): Promise<HealthCheckResponse> {
  const response = await api.get<HealthCheckResponse>(`/api/health/`, {
    headers: {
      'x-token': env.VITE_TOKEN,
    },
  })

  return response.data
}
