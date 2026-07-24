/**
 * AdMob env-gating configuration.
 *
 * Reads `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID` / `EXPO_PUBLIC_ADMOB_REWARDED_ID`
 * rather than unprefixed vars: only `EXPO_PUBLIC_`-prefixed vars are inlined
 * by babel-preset-expo's inline-env-vars plugin into the on-device RN
 * bundle at build time (see `sentry.ts` for the same rationale). Every
 * getter re-reads `process.env` on each call rather than caching at module
 * load, matching `initSentry`'s pattern and keeping this testable without
 * module-registry resets.
 */

export function admobInterstitialUnitId(): string {
  return process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? ''
}

export function admobRewardedUnitId(): string {
  return process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID ?? ''
}

/**
 * Ads are enabled only when BOTH ad unit ids are configured. Empty/missing
 * either one disables ads fully: no interstitial, no rewarded, and (per the
 * wrapper modules) no `require` of the native SDK at all.
 */
export function adsEnabled(): boolean {
  return admobInterstitialUnitId() !== '' && admobRewardedUnitId() !== ''
}
