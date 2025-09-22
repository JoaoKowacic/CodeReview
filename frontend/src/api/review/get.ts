/* eslint-disable camelcase */
import { api, env } from '@/api/axios'

export type ReviewStatus = 'pending' | 'in-progress' | 'completed' | 'failed'

export interface Review {
  id: string
  title: string
  code: string
  language: string
  status: ReviewStatus
  submitted_at: string
  started_at: null | string
  completed_at: null | string
  result: null | {
    feedback: [
      {
        issue: string
        severity: string
        suggestion: string
      },
    ]
    quality_score: number
    performance_recommendations: []
  }
  error_message: null | string
  ip_address: string
}

export async function getReview(id: string): Promise<Review> {
  const response = await api.get<Review>(`/api/reviews/${id}`, {
    headers: {
      'x-token': env.VITE_TOKEN,
    },
  })
  console.log(response)
  return response.data
}
