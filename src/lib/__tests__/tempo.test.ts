import { averageBpmFromTaps } from '@/lib/tempo'

describe('averageBpmFromTaps', () => {
  it('returns null for fewer than 2 taps', () => {
    expect(averageBpmFromTaps([])).toBeNull()
    expect(averageBpmFromTaps([1000])).toBeNull()
  })

  it('two taps 500ms apart -> 120 bpm', () => {
    expect(averageBpmFromTaps([0, 500])).toBe(120)
  })

  it('two taps 1000ms apart -> 60 bpm', () => {
    expect(averageBpmFromTaps([0, 1000])).toBe(60)
  })

  it('averages multiple intervals (0,600,1200 -> 100 bpm)', () => {
    expect(averageBpmFromTaps([0, 600, 1200])).toBe(100)
  })

  it('rounds to nearest integer bpm', () => {
    expect(averageBpmFromTaps([0, 700])).toBe(86)
  })
})
