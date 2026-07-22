// ported from instrumenttuner@7156e04
import { renderHook, act } from '@testing-library/react-native'
import { useTapTempo } from '@/hooks/useTapTempo'

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

describe('useTapTempo', () => {
  it('counts taps', async () => {
    const { result } = await renderHook(() =>
      useTapTempo({ requiredTaps: 4, onComplete: jest.fn() }),
    )
    expect(result.current.tapCount).toBe(0)
    await act(() => {
      jest.setSystemTime(0)
      result.current.tap()
    })
    expect(result.current.tapCount).toBe(1)
  })

  it('fires onComplete with averaged bpm on final tap', async () => {
    const onComplete = jest.fn()
    const { result } = await renderHook(() =>
      useTapTempo({ requiredTaps: 4, onComplete }),
    )
    await act(() => {
      jest.setSystemTime(0)
      result.current.tap()
      jest.setSystemTime(500)
      result.current.tap()
      jest.setSystemTime(1000)
      result.current.tap()
      jest.setSystemTime(1500)
      result.current.tap()
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(120) // 500ms intervals -> 120 bpm
  })

  it('does not call onComplete when single tap yields null bpm (requiredTaps: 1)', async () => {
    const onComplete = jest.fn()
    const { result } = await renderHook(() =>
      useTapTempo({ requiredTaps: 1, onComplete }),
    )
    await act(() => {
      jest.setSystemTime(0)
      result.current.tap()
    })
    expect(onComplete).not.toHaveBeenCalled()
    expect(result.current.tapCount).toBe(1)
  })

  it('reset clears tap count', async () => {
    const { result } = await renderHook(() =>
      useTapTempo({ requiredTaps: 4, onComplete: jest.fn() }),
    )
    await act(() => {
      jest.setSystemTime(0)
      result.current.tap()
    })
    await act(() => result.current.reset())
    expect(result.current.tapCount).toBe(0)
  })
})
