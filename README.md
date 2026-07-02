# SmartCamera

מערכת צילום וידאו/סטילס חכמה לטלפון — AI בזמן אמת, חצובה ממונעת (PAN/TILT/HEIGHT), והנחיות קוליות/טקסטואליות.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.86 (bare) |
| Language | TypeScript |
| Navigation | React Navigation 7 |
| State | Zustand |
| Camera | react-native-vision-camera 5 |
| Media | react-native-fs, @react-native-camera-roll/camera-roll, react-native-video |
| ML (planned) | ML Kit / MediaPipe via native modules |
| Tripod (Phase 2) | BLE/WiFi native module (Mock in Phase 1) |

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

## Current status

### Phase 0 — Infrastructure (~70%)

- [x] Bare React Native project
- [x] Folder structure & navigation shell
- [x] 18 scene profiles (JSON)
- [x] AI contract + JSON schemas
- [x] Tripod protocol draft + Mock controller
- [ ] CI/CD (EAS / Fastlane)
- [ ] Native tripod module (BLE/WiFi)

### Phase 1 — Camera MVP ✅

- [x] **מסך פתיחה** (Splash)
- [x] **מסך בית** — "התחל צילום" / "התחל הקלטה" + רשימת קבצים (הצגה/שיתוף/מחיקה)
- [x] **אינטגרציית מצלמה** — preview חי, zoom, focus, exposure
- [x] **הקלטת וידאו** — start/stop/pause/resume, שמירה לאפליקציה ולגלריה
- [x] **צילום סטילס** — שמירה לאפליקציה ולגלריה
- [x] **Navigation flow** — מסכים 1→2→3→4 (בית → סצנה → חצובה → מצלמה)
- [x] **File manager** — רשימת הקלטות/תמונות מקומיות, סינון, נגן וידאו

> **הערה:** כפתור **עריכה** קיים בניווט, אך מסך העריכה הוא placeholder — עריכה אמיתית מתוכננת לשלב 6.  
> **בדיקה:** יש להריץ על מכשיר פיזי (אין מצלמה בסימולטור).

## Screen flow

```
Splash → Home → Scene Select → Tripod Connect → Camera
```

## Roadmap

| Phase | Focus | Duration |
|-------|-------|----------|
| 0 | Infrastructure | 2–3 weeks | In progress |
| 1 | Camera MVP | 3–4 weeks | **Done** |
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
