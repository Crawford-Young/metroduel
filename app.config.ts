import type { ExpoConfig } from 'expo/config'

// Converted from app.json (Task 14) so a later task can drive AdMob unit
// IDs from env vars — Expo only evaluates JS/TS config dynamically, not
// static JSON. Every field below is carried over verbatim from app.json;
// only `name` (display name) and `ios.bundleIdentifier` are new.
const config: ExpoConfig = {
  name: 'MetroDuel',
  slug: 'metroduel',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'metroduel',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.crawfordyoung.metroduel',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        // Crash guard (T13.2): react-native-google-mobile-ads' config
        // plugin no-ops on iOS when `iosAppId` is omitted (plugin/build/
        // index.js withIosAppId, ~line 54-61) rather than erroring at
        // prebuild time -- but the native SDK itself crashes at app launch
        // if Info.plist's GADApplicationIdentifier is missing (the plugin's
        // own console.warn, ~line 93-95, confirms this). A device dev build
        // happens before the real ad unit ids land in 13.3, so this uses
        // Google's published iOS TEST app id (public sample id, not a
        // secret) purely to keep that build from crashing at launch.
        // Replaced with the real iOS app id when ads are wired in 13.3.
        iosAppId: 'ca-app-pub-3940256099942544~1458002511',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
}

export default config
