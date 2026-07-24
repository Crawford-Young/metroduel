import type * as InterstitialModule from '@/lib/ads/interstitial'
import type * as RewardedModule from '@/lib/ads/rewarded'

// A factory that throws proves the module registry: if any code path under
// test actually `require`s 'react-native-google-mobile-ads', this factory
// runs and the test fails with its error — rather than silently succeeding
// against a benign mock, as a plain `jest.fn()`-based mock would.
jest.mock('react-native-google-mobile-ads', () => {
  throw new Error(
    'react-native-google-mobile-ads must never be required when ads are disabled',
  )
})

describe('ads SDK env gating', () => {
  const originalInterstitial = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID
  const originalRewarded = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID
  let interstitial: typeof InterstitialModule
  let rewarded: typeof RewardedModule

  beforeEach(() => {
    jest.resetModules()
    delete process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID
    delete process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID
    // Fresh module instances per test, isolated from other test files' state.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    interstitial = require('@/lib/ads/interstitial')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    rewarded = require('@/lib/ads/rewarded')
  })

  afterEach(() => {
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID = originalInterstitial
    process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID = originalRewarded
  })

  it('never requires the SDK from preloadInterstitial when ads are disabled', () => {
    expect(() => interstitial.preloadInterstitial()).not.toThrow()
  })

  it('never requires the SDK from showInterstitial when ads are disabled', async () => {
    await expect(interstitial.showInterstitial()).resolves.toBeUndefined()
  })

  it('never requires the SDK from preloadRewarded when ads are disabled', () => {
    expect(() => rewarded.preloadRewarded()).not.toThrow()
  })

  it('never requires the SDK from showRewarded when ads are disabled', async () => {
    await expect(rewarded.showRewarded()).resolves.toBeUndefined()
  })

  it('never requires the SDK when only the interstitial id is configured (rewarded still unset)', () => {
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID = 'ca-app-pub-interstitial'
    expect(() => interstitial.preloadInterstitial()).not.toThrow()
    expect(() => rewarded.preloadRewarded()).not.toThrow()
  })

  it('never requires the SDK when only the rewarded id is configured (interstitial still unset)', () => {
    process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID = 'ca-app-pub-rewarded'
    expect(() => interstitial.preloadInterstitial()).not.toThrow()
    expect(() => rewarded.preloadRewarded()).not.toThrow()
  })
})
