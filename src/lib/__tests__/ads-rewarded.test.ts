import type * as RewardedModule from '@/lib/ads/rewarded'

const mockLoad = jest.fn()
const mockShow = jest.fn(() => Promise.resolve())
const mockAddAdEventListener = jest.fn()
const mockCreateForAdRequest = jest.fn(() => ({
  load: mockLoad,
  show: mockShow,
  addAdEventListener: mockAddAdEventListener,
}))

jest.mock('react-native-google-mobile-ads', () => ({
  RewardedAd: { createForAdRequest: mockCreateForAdRequest },
  AdEventType: { ERROR: 'error', CLOSED: 'closed' },
  RewardedAdEventType: {
    LOADED: 'rewarded_loaded',
    EARNED_REWARD: 'rewarded_earned_reward',
  },
  TestIds: { REWARDED: 'test-rewarded-id' },
}))

describe('rewarded wrapper', () => {
  const originalInterstitial = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID
  const originalRewarded = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID
  let rewarded: typeof RewardedModule

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID = 'real-interstitial-id'
    process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID = 'real-rewarded-id'
    // Fresh module instance per test so the wrapper's cached-ad singleton
    // resets.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    rewarded = require('@/lib/ads/rewarded')
  })

  afterEach(() => {
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID = originalInterstitial
    process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID = originalRewarded
  })

  describe('preloadRewarded', () => {
    it('never creates an ad request when ads are disabled', () => {
      delete process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID
      rewarded.preloadRewarded()
      expect(mockCreateForAdRequest).not.toHaveBeenCalled()
    })

    it('creates a rewarded ad request and calls load', () => {
      rewarded.preloadRewarded()
      expect(mockCreateForAdRequest).toHaveBeenCalledWith('test-rewarded-id')
      expect(mockLoad).toHaveBeenCalledTimes(1)
    })

    it('uses the configured production unit id outside of a dev build', () => {
      const globalWithDevFlag = globalThis as unknown as { __DEV__: boolean }
      const originalDevFlag = globalWithDevFlag.__DEV__
      globalWithDevFlag.__DEV__ = false
      try {
        rewarded.preloadRewarded()
        expect(mockCreateForAdRequest).toHaveBeenCalledWith('real-rewarded-id')
      } finally {
        globalWithDevFlag.__DEV__ = originalDevFlag
      }
    })

    it('subscribes to LOADED, EARNED_REWARD, ERROR and CLOSED events', () => {
      rewarded.preloadRewarded()
      const types = mockAddAdEventListener.mock.calls.map(
        (call: unknown[]) => call[0],
      )
      expect(types).toEqual([
        'rewarded_loaded',
        'rewarded_earned_reward',
        'error',
        'closed',
      ])
    })

    it('invokes onLoaded when the LOADED event fires', () => {
      const onLoaded = jest.fn()
      rewarded.preloadRewarded({ onLoaded })
      const loadedListener = mockAddAdEventListener.mock
        .calls[0][1] as () => void
      loadedListener()
      expect(onLoaded).toHaveBeenCalledTimes(1)
    })

    it('invokes onEarnedReward with the reward payload when EARNED_REWARD fires', () => {
      const onEarnedReward = jest.fn()
      rewarded.preloadRewarded({ onEarnedReward })
      const earnedListener = mockAddAdEventListener.mock
        .calls[1][1] as (reward: { type: string; amount: number }) => void
      const reward = { type: 'coins', amount: 50 }
      earnedListener(reward)
      expect(onEarnedReward).toHaveBeenCalledWith(reward)
    })

    it('invokes onError with the error payload when the ERROR event fires', () => {
      const onError = jest.fn()
      rewarded.preloadRewarded({ onError })
      const errorListener = mockAddAdEventListener.mock.calls[2][1] as (
        error: Error,
      ) => void
      const error = new Error('load failed')
      errorListener(error)
      expect(onError).toHaveBeenCalledWith(error)
    })

    it('invokes onClosed when the CLOSED event fires', () => {
      const onClosed = jest.fn()
      rewarded.preloadRewarded({ onClosed })
      const closedListener = mockAddAdEventListener.mock
        .calls[3][1] as () => void
      closedListener()
      expect(onClosed).toHaveBeenCalledTimes(1)
    })
  })

  describe('showRewarded', () => {
    it('resolves without calling show when ads are disabled', async () => {
      delete process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID
      await expect(rewarded.showRewarded()).resolves.toBeUndefined()
      expect(mockShow).not.toHaveBeenCalled()
    })

    it('resolves without calling show when nothing has been preloaded', async () => {
      await expect(rewarded.showRewarded()).resolves.toBeUndefined()
      expect(mockShow).not.toHaveBeenCalled()
    })

    it('shows the preloaded rewarded ad', async () => {
      rewarded.preloadRewarded()
      await rewarded.showRewarded()
      expect(mockShow).toHaveBeenCalledTimes(1)
    })
  })
})
