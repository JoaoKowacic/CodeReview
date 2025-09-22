import { api, env } from '../axios'

export interface StatsResponse {
  total_reviews: number
  by_status: Record<string, number>
  by_language: Record<string, number>
  average_quality_score: number
}

export async function getStats(): Promise<StatsResponse> {
  const response = await api.get('/api/stats', {
    headers: {
      'x-token': env.VITE_TOKEN,
    },
  })

  return response.data
}
