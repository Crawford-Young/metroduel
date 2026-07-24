import {
  admobInterstitialUnitId,
  admobRewardedUnitId,
  adsEnabled,
} from '@/lib/ads/config'

describe('ads config', () => {
  const originalInterstitial = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID
  const originalRewarded = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID

  afterEach(() => {
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID = originalInterstitial
    process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID = originalRewarded
  })

  describe('admobInterstitialUnitId / admobRewardedUnitId', () => {
    it('returns an empty string when the env var is undefined', () => {
      delete process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID
      delete process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID
      expect(admobInterstitialUnitId()).toBe('')
      expect(admobRewardedUnitId()).toBe('')
    })

    it('returns the configured id when the env var is set', () => {
      process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID = 'ca-app-pub-interstitial'
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID = 'ca-app-pub-rewarded'
      expect(admobInterstitialUnitId()).toBe('ca-app-pub-interstitial')
      expect(admobRewardedUnitId()).toBe('ca-app-pub-rewarded')
    })
  })

  describe('adsEnabled', () => {
    it('is false when both env vars are unset', () => {
      delete process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID
      delete process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID
      expect(adsEnabled()).toBe(false)
    })

    it('is false when only the interstitial id is set', () => {
      process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID = 'ca-app-pub-interstitial'
      delete process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID
      expect(adsEnabled()).toBe(false)
    })

    it('is false when only the rewarded id is set', () => {
      delete process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID = 'ca-app-pub-rewarded'
      expect(adsEnabled()).toBe(false)
    })

    it('is false when either env var is an empty string', () => {
      process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID = ''
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID = 'ca-app-pub-rewarded'
      expect(adsEnabled()).toBe(false)
    })

    it('is true when both env vars are set and non-empty', () => {
      process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID = 'ca-app-pub-interstitial'
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID = 'ca-app-pub-rewarded'
      expect(adsEnabled()).toBe(true)
    })
  })
})
