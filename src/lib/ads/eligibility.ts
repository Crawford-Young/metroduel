/** Show an interstitial no more often than every Nth completed match. */
export const AD_MATCH_INTERVAL = 2

/** Minimum time (ms) that must have elapsed since the last ad was shown. */
export const AD_MIN_GAP_MS = 90_000

/**
 * The caller-owned counters an interstitial eligibility check reads.
 *
 * `matchesSinceAd` counts completed matches since the last ad was shown (or
 * since app start if none has been shown yet); the caller resets it to 0
 * after showing an ad. `lastAdAt` is the epoch ms timestamp of the last ad
 * shown, or `null` if no ad has ever been shown this session.
 */
export interface AdClock {
  readonly matchesSinceAd: number
  readonly lastAdAt: number | null
}

/**
 * Pure interstitial eligibility check: true every `AD_MATCH_INTERVAL`th
 * completed match, provided at least `AD_MIN_GAP_MS` has elapsed since the
 * last ad. The gap check is skipped when no ad has been shown yet
 * (`lastAdAt === null`) since there is nothing to measure the gap against.
 */
export function interstitialEligible(clock: AdClock, now: number): boolean {
  if (clock.matchesSinceAd < AD_MATCH_INTERVAL) {
    return false
  }

  if (clock.lastAdAt === null) {
    return true
  }

  return now - clock.lastAdAt >= AD_MIN_GAP_MS
}
