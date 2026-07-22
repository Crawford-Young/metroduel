# MetroDuel

A standalone iOS rhythm-battle game built with Expo / React Native. Guess or tap the tempo to out-play a five-tier AI ladder, or pass the phone for local hot-seat duels. Ported from the instrumenttuner web Duel engine.

## Stack

Expo SDK 57 · TypeScript (strict) · Expo Router · NativeWind v4 · Zustand · react-native-mmkv · react-native-audio-api · env-gated AdMob · Sentry · Jest + React Native Testing Library · Maestro · EAS.

## Requirements

- Node 20+
- pnpm (this repo is pnpm-only — never npm or yarn)
- For device runs: an EAS dev build. The native modules (MMKV, audio-api, ads) do **not** run in Expo Go.

## Getting started

```sh
pnpm install
pnpm start        # Metro dev server (needs a dev build on device for native modules)
```

## Scripts

| Script                              | What it does                                                     |
| ----------------------------------- | ---------------------------------------------------------------- |
| `pnpm start`                        | Start the Metro dev server                                       |
| `pnpm ios` / `pnpm android`         | Start with the native platform target                            |
| `pnpm test`                         | Jest + RNTL with coverage (100% on `src/lib/**`, `src/hooks/**`) |
| `pnpm typecheck`                    | `tsc --noEmit`                                                   |
| `pnpm lint`                         | ESLint (expo flat config + strict TS)                            |
| `pnpm format` / `pnpm format:check` | Prettier write / check                                           |

## Environment

Copy `.env.example` to `.env.local` and fill in as needed. Every value is optional — an empty value disables the feature it gates (ads, crash reporting) with no active code paths. See `.env.example` for the full list.

## Notes

- CI workflow (`.github/`) is deferred to a housekeeping wave, matching the instrumenttuner convention.
