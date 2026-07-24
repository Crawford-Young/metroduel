import type * as InterstitialModule from '@/lib/ads/interstitial'

const mockLoad = jest.fn()
const mockShow = jest.fn(() => Promise.resolve())
const mockAddAdEventListener = jest.fn()
const mockCreateForAdRequest = jest.fn(() => ({
  load: mockLoad,
  show: mockShow,
  addAdEventListener: mockAddAdEventListener,
}))

jest.mock('react-native-google-mobile-ads', () => ({
  InterstitialAd: { createForAdRequest: mockCreateForAdRequest },
  AdEventType: { LOADED: 'loaded', ERROR: 'error', CLOSED: 'closed' },
  TestIds: { INTERSTITIAL: 'test-interstitial-id' },
}))

describe('interstitial wrapper', () => {
  const originalInterstitial = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID
  const originalRewarded = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID
  let interstitial: typeof InterstitialModule

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID = 'real-interstitial-id'
    process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID = 'real-rewarded-id'
    // Fresh module instance per test so the wrapper's cached-ad singleton
    // resets.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    interstitial = require('@/lib/ads/interstitial')
  })

  afterEach(() => {
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID = originalInterstitial
    process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID = originalRewarded
  })

  describe('preloadInterstitial', () => {
    it('never creates an ad request when ads are disabled', () => {
      delete process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID
      interstitial.preloadInterstitial()
      expect(mockCreateForAdRequest).not.toHaveBeenCalled()
    })

    it('creates an interstitial ad request and calls load', () => {
      interstitial.preloadInterstitial()
      expect(mockCreateForAdRequest).toHaveBeenCalledWith(
        'test-interstitial-id',
      )
      expect(mockLoad).toHaveBeenCalledTimes(1)
    })

    it('uses the configured production unit id outside of a dev build', () => {
      const globalWithDevFlag = globalThis as unknown as { __DEV__: boolean }
      const originalDevFlag = globalWithDevFlag.__DEV__
      globalWithDevFlag.__DEV__ = false
      try {
        interstitial.preloadInterstitial()
        expect(mockCreateForAdRequest).toHaveBeenCalledWith(
          'real-interstitial-id',
        )
      } finally {
        globalWithDevFlag.__DEV__ = originalDevFlag
      }
    })

    it('subscribes to LOADED, ERROR and CLOSED events', () => {
      interstitial.preloadInterstitial()
      const types = mockAddAdEventListener.mock.calls.map(
        (call: unknown[]) => call[0],
      )
      expect(types).toEqual(['loaded', 'error', 'closed'])
    })

    it('invokes onLoaded when the LOADED event fires', () => {
      const onLoaded = jest.fn()
      interstitial.preloadInterstitial({ onLoaded })
      const loadedListener = mockAddAdEventListener.mock
        .calls[0][1] as () => void
      loadedListener()
      expect(onLoaded).toHaveBeenCalledTimes(1)
    })

    it('invokes onError with the error payload when the ERROR event fires', () => {
      const onError = jest.fn()
      interstitial.preloadInterstitial({ onError })
      const errorListener = mockAddAdEventListener.mock.calls[1][1] as (
        error: Error,
      ) => void
      const error = new Error('load failed')
      errorListener(error)
      expect(onError).toHaveBeenCalledWith(error)
    })

    it('invokes onClosed when the CLOSED event fires', () => {
      const onClosed = jest.fn()
      interstitial.preloadInterstitial({ onClosed })
      const closedListener = mockAddAdEventListener.mock
        .calls[2][1] as () => void
      closedListener()
      expect(onClosed).toHaveBeenCalledTimes(1)
    })
  })

  describe('showInterstitial', () => {
    it('resolves without calling show when ads are disabled', async () => {
      delete process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID
      await expect(interstitial.showInterstitial()).resolves.toBeUndefined()
      expect(mockShow).not.toHaveBeenCalled()
    })

    it('resolves without calling show when nothing has been preloaded', async () => {
      await expect(interstitial.showInterstitial()).resolves.toBeUndefined()
      expect(mockShow).not.toHaveBeenCalled()
    })

    it('shows the preloaded interstitial', async () => {
      interstitial.preloadInterstitial()
      await interstitial.showInterstitial()
      expect(mockShow).toHaveBeenCalledTimes(1)
    })
  })
})
