import type { AudioContext } from 'react-native-audio-api'
import { scheduleClick } from '@/lib/audio/click'

function makeMockCtx() {
  const osc = {
    frequency: { value: 0 },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  }
  const gain = {
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
  }
  return {
    destination: {},
    createOscillator: jest.fn(() => osc),
    createGain: jest.fn(() => gain),
    _osc: osc,
    _gain: gain,
  }
}

describe('scheduleClick', () => {
  it('accent click uses 1200Hz and gain 1.0', () => {
    const ctx = makeMockCtx()
    scheduleClick(ctx as unknown as AudioContext, 2, true)
    expect(ctx._osc.frequency.value).toBe(1200)
    expect(ctx._gain.gain.setValueAtTime).toHaveBeenCalledWith(1.0, 2)
    expect(ctx._osc.start).toHaveBeenCalledWith(2)
    expect(ctx._osc.stop).toHaveBeenCalledWith(2.05)
  })

  it('non-accent click uses 800Hz and gain 0.5', () => {
    const ctx = makeMockCtx()
    scheduleClick(ctx as unknown as AudioContext, 0, false)
    expect(ctx._osc.frequency.value).toBe(800)
    expect(ctx._gain.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 0)
  })
})
