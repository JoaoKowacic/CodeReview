import axios from 'axios'

import { z } from 'zod'

const envSchema = z.object({
  API_URL: z.string(),
})

const env = envSchema.parse(import.meta.env)

export const api = axios.create({
  baseURL: env.API_URL,
})
