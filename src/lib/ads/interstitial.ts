import { adsEnabled, admobInterstitialUnitId } from './config'

type SdkModule = typeof import('react-native-google-mobile-ads')
type InterstitialAdInstance = ReturnType<
  SdkModule['InterstitialAd']['createForAdRequest']
>

export interface InterstitialCallbacks {
  readonly onLoaded?: () => void
  readonly onError?: (error: Error) => void
  readonly onClosed?: () => void
}

let activeInterstitial: InterstitialAdInstance | null = null

/**
 * Preloads a fresh interstitial ad, ready for `showInterstitial()` once the
 * `onLoaded` callback (or the SDK's own LOADED event) fires.
 *
 * The native SDK module is required lazily, INSIDE this function body, and
 * only once `adsEnabled()` is confirmed true — never at module load time.
 * That keeps the SDK entirely out of the require graph (and out of dev/CI/
 * Jest/Maestro's active code paths) whenever ad unit ids are unconfigured.
 *
 * In dev builds (`__DEV__`), Google's published test unit id is used
 * instead of the configured production id, so local development never
 * risks serving/clicking a real ad (an AdMob policy violation risk).
 */
export function preloadInterstitial(
  callbacks: InterstitialCallbacks = {},
): void {
  if (!adsEnabled()) {
    return
  }

  // Must stay a lazy require (see the env-gating rationale above); a static
  // import would pull the native SDK into every bundle unconditionally.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sdk = require('react-native-google-mobile-ads') as SdkModule
  const { InterstitialAd, AdEventType, TestIds } = sdk

  const unitId = __DEV__ ? TestIds.INTERSTITIAL : admobInterstitialUnitId()
  const interstitial = InterstitialAd.createForAdRequest(unitId)
  activeInterstitial = interstitial

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    callbacks.onLoaded?.()
  })
  interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
    callbacks.onError?.(error)
  })
  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    callbacks.onClosed?.()
  })

  interstitial.load()
}

/**
 * Shows the currently preloaded interstitial. Resolves immediately without
 * showing anything when ads are disabled or nothing has been preloaded yet.
 */
export function showInterstitial(): Promise<void> {
  if (!adsEnabled() || activeInterstitial === null) {
    return Promise.resolve()
  }

  return activeInterstitial.show()
}
