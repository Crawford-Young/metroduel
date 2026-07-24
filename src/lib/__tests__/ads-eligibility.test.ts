import {
  AD_MATCH_INTERVAL,
  AD_MIN_GAP_MS,
  interstitialEligible,
  type AdClock,
} from '@/lib/ads/eligibility'

describe('interstitialEligible', () => {
  it('is false before the match interval is reached, even on the very first match ever (lastAdAt null)', () => {
    const clock: AdClock = { matchesSinceAd: 0, lastAdAt: null }
    expect(interstitialEligible(clock, 0)).toBe(false)
  })

  it('is false at one match short of the interval, lastAdAt null', () => {
    const clock: AdClock = {
      matchesSinceAd: AD_MATCH_INTERVAL - 1,
      lastAdAt: null,
    }
    expect(interstitialEligible(clock, 0)).toBe(false)
  })

  it('is true on the very first ad ever once the interval is reached (lastAdAt null skips the gap check)', () => {
    const clock: AdClock = {
      matchesSinceAd: AD_MATCH_INTERVAL,
      lastAdAt: null,
    }
    expect(interstitialEligible(clock, 0)).toBe(true)
  })

  it('is true when matchesSinceAd exceeds the interval, lastAdAt null', () => {
    const clock: AdClock = {
      matchesSinceAd: AD_MATCH_INTERVAL + 1,
      lastAdAt: null,
    }
    expect(interstitialEligible(clock, 0)).toBe(true)
  })

  it('is false just under the minimum gap (89_999ms)', () => {
    const clock: AdClock = {
      matchesSinceAd: AD_MATCH_INTERVAL,
      lastAdAt: 0,
    }
    expect(interstitialEligible(clock, AD_MIN_GAP_MS - 1)).toBe(false)
  })

  it('is true at exactly the minimum gap (90_000ms)', () => {
    const clock: AdClock = {
      matchesSinceAd: AD_MATCH_INTERVAL,
      lastAdAt: 0,
    }
    expect(interstitialEligible(clock, AD_MIN_GAP_MS)).toBe(true)
  })

  it('is true when the gap exceeds the minimum', () => {
    const clock: AdClock = {
      matchesSinceAd: AD_MATCH_INTERVAL,
      lastAdAt: 0,
    }
    expect(interstitialEligible(clock, AD_MIN_GAP_MS + 1)).toBe(true)
  })

  it('is false after an interval reset (matchesSinceAd back to 0) even with a huge gap since the last ad', () => {
    const clock: AdClock = { matchesSinceAd: 0, lastAdAt: 0 }
    expect(interstitialEligible(clock, AD_MIN_GAP_MS * 100)).toBe(false)
  })
})
