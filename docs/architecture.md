# SmartCamera Architecture

## Overview

SmartCamera is a bare React Native app (iOS + Android) combining:

- Live camera preview and recording
- Local ML tracking (ML Kit / MediaPipe — Phase 3)
- Cloud vision AI with smart gating (Phase 3)
- Motorized tripod control over BLE/WiFi (Phase 2)
- Voice and pose recording triggers (Phase 5)

## Layer diagram

```
┌─────────────────────────────────────────────────┐
│              React Native App (UI)               │
├──────────────┬──────────────┬───────────────────┤
│ Camera Layer │  AI Engine   │  Tripod Controller│
│ VisionCamera │  Local ML +  │  BLE / WiFi       │
│              │  Cloud API   │  PAN/TILT/HEIGHT  │
├──────────────┴──────────────┴───────────────────┤
│           Real-time Pipeline (300-700ms)         │
│  Frame → Local Track → Gate → AI → Apply        │
└─────────────────────────────────────────────────┘
```

## Repository layout

```
SmartCamera/
├── android/                 # Android native project
├── ios/                     # iOS native project
├── native-modules/          # Custom native modules (Swift/Kotlin)
│   └── tripod/              # Tripod BLE/WiFi bridge (placeholder)
├── src/
│   ├── app/                 # App shell, providers
│   ├── navigation/          # React Navigation
│   ├── screens/             # UI screens
│   ├── components/          # Shared UI
│   ├── services/            # Camera, AI, tripod, storage
│   ├── stores/              # Zustand state
│   └── types/               # TypeScript types
├── config/
│   ├── ai-contract/         # Fixed system prompt
│   └── scene-profiles/      # 18 scene definitions
├── schemas/                 # JSON Schema for AI I/O
└── docs/                    # Protocol & architecture notes
```

## Development phases

See `README.md` for the full phased roadmap (Phase 0–9).

## Key contracts

- **AI output:** `schemas/ai-response.schema.json`
- **AI input:** `schemas/ai-request-payload.schema.json`
- **Scenes:** `config/scene-profiles/profiles.json`
- **Tripod:** `docs/tripod-protocol.md`
