# SmartCamera

מערכת צילום וידאו/סטילס חכמה לטלפון — AI בזמן אמת, חצובה ממונעת (PAN/TILT/HEIGHT), והנחיות קוליות/טקסטואליות.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.86 (bare) |
| Language | TypeScript |
| Navigation | React Navigation 7 |
| State | Zustand |
| Camera (planned) | react-native-vision-camera |
| ML (planned) | ML Kit / MediaPipe via native modules |
| Tripod (planned) | BLE/WiFi native module |

## Getting started

### Prerequisites

- Node.js ≥ 22.11
- Xcode (iOS) / Android Studio (Android)
- CocoaPods (iOS)

### Install

```bash
npm install
```

### iOS

```bash
cd ios && bundle install && bundle exec pod install && cd ..
npm run ios
```

### Android

```bash
npm run android
```

### Environment

Copy `.env.example` to `.env` and adjust as needed. Mock tripod is enabled by default.

## Project structure

```
src/
├── app/           App shell
├── navigation/    React Navigation
├── screens/       UI screens (Splash → Home → Scene → Tripod → Camera)
├── services/      Camera, AI, tripod
├── stores/        Zustand state
└── types/         TypeScript types

config/
├── ai-contract/   Fixed system prompt for AI
└── scene-profiles/ 18 scenes (9 video + 9 still)

schemas/           JSON Schema for AI request/response
docs/              Architecture & tripod protocol
native-modules/    Custom Swift/Kotlin modules (placeholder)
```

## Current status (Phase 0)

- [x] Bare React Native project
- [x] Folder structure & navigation shell
- [x] 18 scene profiles (JSON)
- [x] AI contract + JSON schemas
- [x] Tripod protocol draft + Mock controller
- [ ] CI/CD (EAS / Fastlane)
- [ ] Camera integration (Vision Camera)
- [ ] Native tripod module

## Screen flow

```
Splash → Home → Scene Select → Tripod Connect → Camera
```

## Roadmap

| Phase | Focus | Duration |
|-------|-------|----------|
| 0 | Infrastructure | 2–3 weeks |
| 1 | Camera MVP | 3–4 weeks |
| 2 | Scenes + Tripod | 2–3 weeks |
| 3 | AI Pipeline | 4–6 weeks |
| 4 | Autonomous filming | 3–4 weeks |
| 5 | Recording triggers | 2–3 weeks |
| 6 | Editing | 3–4 weeks |
| 7–8 | Share + QA | 3–5 weeks |

Full MVP estimate: **~6–9 months**.

## Key files

- AI response schema: `schemas/ai-response.schema.json`
- Scene profiles: `config/scene-profiles/profiles.json`
- Tripod protocol: `docs/tripod-protocol.md`
- Architecture: `docs/architecture.md`

## License

Private — all rights reserved.
