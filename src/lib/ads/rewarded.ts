import { adsEnabled, admobRewardedUnitId } from './config'

type SdkModule = typeof import('react-native-google-mobile-ads')
type RewardedAdInstance = ReturnType<
  SdkModule['RewardedAd']['createForAdRequest']
>

/** The reward payload surfaced on `EARNED_REWARD`, for `revive`-style consumers. */
export interface AdReward {
  readonly type: string
  readonly amount: number
}

export interface RewardedCallbacks {
  readonly onLoaded?: () => void
  readonly onEarnedReward?: (reward: AdReward) => void
  readonly onError?: (error: Error) => void
  readonly onClosed?: () => void
}

let activeRewarded: RewardedAdInstance | null = null

/**
 * Preloads a fresh rewarded ad, ready for `showRewarded()` once the
 * `onLoaded` callback (or the SDK's own LOADED event) fires.
 *
 * Same lazy-require/env-gating contract as `interstitial.ts`: the native
 * SDK is only required, inside this function, once `adsEnabled()` is true.
 * In dev builds (`__DEV__`), Google's published test unit id replaces the
 * configured production id so local development never risks serving a real
 * rewarded ad.
 */
export function preloadRewarded(callbacks: RewardedCallbacks = {}): void {
  if (!adsEnabled()) {
    return
  }

  // Must stay a lazy require (see the env-gating rationale above); a static
  // import would pull the native SDK into every bundle unconditionally.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sdk = require('react-native-google-mobile-ads') as SdkModule
  const { RewardedAd, AdEventType, RewardedAdEventType, TestIds } = sdk

  const unitId = __DEV__ ? TestIds.REWARDED : admobRewardedUnitId()
  const rewarded = RewardedAd.createForAdRequest(unitId)
  activeRewarded = rewarded

  rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
    callbacks.onLoaded?.()
  })
  rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
    callbacks.onEarnedReward?.(reward)
  })
  rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
    callbacks.onError?.(error)
  })
  rewarded.addAdEventListener(AdEventType.CLOSED, () => {
    callbacks.onClosed?.()
  })

  rewarded.load()
}

/**
 * Shows the currently preloaded rewarded ad. Resolves immediately without
 * showing anything when ads are disabled or nothing has been preloaded yet.
 */
export function showRewarded(): Promise<void> {
  if (!adsEnabled() || activeRewarded === null) {
    return Promise.resolve()
  }

  return activeRewarded.show()
}
