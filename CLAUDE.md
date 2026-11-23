# CLAUDE.md — MetroDuel

**Inherits:** `~/code/CLAUDE.md` (universal) → `~/code/apps/CLAUDE.md` (apps domain — Expo/RN stack, Definition of Done). This file records only what is specific to this repo.

MetroDuel is a standalone iOS rhythm-battle game (Expo / React Native) built from the instrumenttuner web Duel engine: solo-vs-AI + hot-seat modes, env-gated AdMob, light local meta.

## Stack

Expo SDK 57 (RN 0.86, React 19.2), TypeScript strict, Expo Router (file-based, `src/app/`), NativeWind v4, Zustand, `react-native-mmkv`, `react-native-audio-api`, `react-native-google-mobile-ads`. Jest + React Native Testing Library, Maestro, EAS. pnpm only.

## Deviations from the domain defaults

- **No TanStack Query.** The apps domain lists TanStack Query for client async state; MetroDuel has no backend and no remote data, so it is intentionally absent. All state is local (Zustand + MMKV).
- **Routing lives in `src/app/`, not `app/`.** The Expo SDK 57 `create-expo-app` default template nests the router under `src/`. Route files are `src/app/*.tsx`; the `@/*` path alias maps to `src/*`.
- **Engine files are byte-faithful ports.** Files copied from `instrumenttuner@7156e04` carry a `// ported from instrumenttuner@7156e04` provenance header and have `'use client'` directives removed (meaningless in RN). Any behavioral divergence from the web source is deliberate and documented here.

## Env-gating rule

Ads are fully env-gated. No configured ad unit IDs (`EXPO_PUBLIC_ADMOB_*` empty) → zero ad code paths run in dev, CI, Jest, and Maestro. No crash reporting: Sentry was dropped ahead of the GCP move, and crash reporting gets picked with that migration. See `.env.example`; real values live in `.env.local` (gitignored).

## Native-module note

`react-native-mmkv`, `react-native-audio-api`, and `react-native-google-mobile-ads` are native modules. **Expo Go cannot run them** — all device QA uses an EAS dev build (`eas build --profile development`) or a local prebuild. Unit tests mock these modules.

## Conventions

- Prettier: `semi: false`, `singleQuote: true`, trailing commas (prettier default), `endOfLine: auto`.
- TypeScript strict; no `any` (`@typescript-eslint/no-explicit-any` is an error); interfaces over type aliases; explicit return types on exported functions; named constants over magic numbers.
- Jest coverage is enforced at 100% (branches/functions/lines/statements) scoped to `src/lib/**` and `src/hooks/**`.
- Conventional Commits (commitlint + husky). Co-Authored-By trailer on every commit.

## Setup and CI

- `postinstall` runs `scripts/ensure-expo-env.js`, which writes the gitignored `expo-env.d.ts` when it is missing, so `pnpm typecheck` (and the pre-commit hook) pass in a fresh clone or worktree without first running Expo (#12).
- `pnpm-workspace.yaml` denies `unrs-resolver`'s install script explicitly (`ignoredBuiltDependencies` for pnpm 10, `allowBuilds` for pnpm 11), so installs stay clean under both majors.
- `.github/workflows/ci.yml` runs lint, `format:check`, typecheck, Jest (100% coverage) and `pnpm audit --audit-level=high`. The two ignored GHSAs in `pnpm-workspace.yaml` `auditConfig` carry their reason inline; drop them once expo-router moves off query-string 7.
