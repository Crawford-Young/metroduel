import { z } from 'zod'
import { getJSON, setJSON, storage } from '@/lib/storage'

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => {
    const map = new Map<string, string>()
    return {
      getString: (key: string) => map.get(key),
      set: (key: string, value: string) => {
        map.set(key, value)
      },
      clearAll: () => {
        map.clear()
      },
    }
  }),
}))

const testSchema = z.object({ n: z.number(), label: z.string() })
type TestShape = z.infer<typeof testSchema>

const fallback: TestShape = { n: 0, label: 'fallback' }

beforeEach(() => {
  storage.clearAll()
})

describe('getJSON', () => {
  it('returns the fallback when the key is missing', () => {
    expect(getJSON('missing-key', testSchema, fallback)).toEqual(fallback)
  })

  it('returns the fallback when the stored value is not valid JSON', () => {
    storage.set('corrupt-key', 'not-json{{{')
    expect(getJSON('corrupt-key', testSchema, fallback)).toEqual(fallback)
  })

  it('returns the fallback when the stored JSON does not match the schema', () => {
    storage.set('wrong-shape-key', JSON.stringify({ n: 'not-a-number' }))
    expect(getJSON('wrong-shape-key', testSchema, fallback)).toEqual(fallback)
  })

  it('returns the parsed value when the stored JSON matches the schema', () => {
    storage.set('good-key', JSON.stringify({ n: 5, label: 'hello' }))
    expect(getJSON('good-key', testSchema, fallback)).toEqual({
      n: 5,
      label: 'hello',
    })
  })
})

describe('setJSON + getJSON round-trip', () => {
  it('persists a value written with setJSON and reads it back identically', () => {
    const value: TestShape = { n: 42, label: 'round-trip' }
    setJSON('round-trip-key', value)
    expect(getJSON('round-trip-key', testSchema, fallback)).toEqual(value)
  })
})
