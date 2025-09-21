import { api } from '../axios'

export interface getProgramingLanguageResponse {
  data: string[]
}

export async function getAllProgramingLanguages(): Promise<string[]> {
  const response = await api.get<getProgramingLanguageResponse>(
    '/programing-languages'
  )

  return response.data.data
}
