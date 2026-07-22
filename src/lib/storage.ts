import { createMMKV } from 'react-native-mmkv'
import type { ZodType } from 'zod'

export const storage = createMMKV({ id: 'metroduel-storage' })

export function getJSON<T>(key: string, schema: ZodType<T>, fallback: T): T {
  const raw = storage.getString(key)
  if (raw === undefined) {
    return fallback
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return fallback
  }

  const result = schema.safeParse(parsed)
  return result.success ? result.data : fallback
}

export function setJSON<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value))
}
