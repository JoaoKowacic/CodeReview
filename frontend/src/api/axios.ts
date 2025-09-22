import axios from 'axios'

import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string(),
  VITE_TOKEN: z.string(),
})

export const env = envSchema.parse(import.meta.env)
export const api = axios.create({
  baseURL: env.VITE_API_URL,
})
