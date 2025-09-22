/* eslint-disable camelcase */
import { api } from '@/api/axios'
import { env } from '@/api/axios'

export interface CreateReviewProps {
  title: string
  code: string
  language: string
}

export function createReview({ code, language, title }: CreateReviewProps) {
  const data = {
    code,
    language,
    title,
  }

  return api.post('/api/reviews', data, {
    headers: {
      'x-token': env.VITE_TOKEN,
    },
  })
}
