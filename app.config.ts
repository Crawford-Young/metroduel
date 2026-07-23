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
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
}

export default config
