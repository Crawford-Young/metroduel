import { renderHook, act } from '@testing-library/react-native'
import { AudioContext } from 'react-native-audio-api'
import { useTempoPlayback } from '@/hooks/useTempoPlayback'

let mockCurrentTime = 0

type MockContextState = 'running' | 'suspended' | 'closed'

function makeMockCtx() {
  return {
    get currentTime() {
      return mockCurrentTime
    },
    state: 'running' as MockContextState,
    destination: {},
    resume: jest.fn().mockResolvedValue(undefined),
    createOscillator: jest.fn(() => ({
      frequency: { value: 0 },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    })),
    createGain: jest.fn(() => ({
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
    })),
  }
}

let mockCtx: ReturnType<typeof makeMockCtx>

jest.mock('react-native-audio-api', () => ({
  AudioContext: jest.fn().mockImplementation(() => mockCtx),
}))

beforeEach(() => {
  mockCurrentTime = 0
  mockCtx = makeMockCtx()
  ;(AudioContext as unknown as jest.Mock).mockClear()
})

describe('useTempoPlayback', () => {
  it('play schedules `beats` clicks at the given bpm', async () => {
    const { result } = await renderHook(() => useTempoPlayback())
    await act(() => result.current.play(120, 8))
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(8)
  })

  it('resumes a suspended context', async () => {
    mockCtx.state = 'suspended'
    const { result } = await renderHook(() => useTempoPlayback())
    await act(() => result.current.play(120, 4))
    expect(mockCtx.resume).toHaveBeenCalled()
  })

  it('reuses the AudioContext across plays', async () => {
    const { result } = await renderHook(() => useTempoPlayback())
    await act(() => result.current.play(120, 4))
    const calls = (AudioContext as unknown as jest.Mock).mock.calls.length
    await act(() => result.current.play(100, 4))
    expect((AudioContext as unknown as jest.Mock).mock.calls.length).toBe(calls)
  })
})
