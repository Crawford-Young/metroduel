import {
  MIN_TARGET_BPM,
  MAX_TARGET_BPM,
  BPM_RANGE,
  STARTING_HP,
  MAX_DISTANCE,
} from '@/lib/duel/types'

describe('duel constants', () => {
  it('range width derives HP and max distance', () => {
    expect(MIN_TARGET_BPM).toBe(40)
    expect(MAX_TARGET_BPM).toBe(200)
    expect(BPM_RANGE).toBe(160)
    expect(STARTING_HP).toBe(160)
    expect(MAX_DISTANCE).toBe(160)
  })
})
