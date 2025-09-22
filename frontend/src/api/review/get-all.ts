/* eslint-disable camelcase */
import { api, env } from '@/api/axios'
import type { Review } from './get'

export async function getAllReviews(): Promise<Review[]> {
  const response = await api.get<Review[]>('/api/reviews/', {
    headers: {
      'x-token': env.VITE_TOKEN,
    },
  })

  return response.data
}
