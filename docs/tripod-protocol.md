# Tripod Protocol Specification (Draft v0.1)

> **Status:** Draft — update when hardware firmware is finalized.  
> Use `MockTripodController` in development until real device is available.

## Transport

| Layer | Primary | Fallback |
|-------|---------|----------|
| Discovery | BLE scan (service UUID TBD) | WiFi mDNS `_smartcamera-tripod._tcp` |
| Commands | BLE GATT write | WiFi TCP/UDP binary or JSON |
| Status | BLE notify / WiFi push | Poll every 500ms |

## Command envelope

```json
{
  "cmd": "MOVE",
  "seq": 42,
  "payload": {
    "pan_delta": 5.0,
    "tilt_delta": -2.0,
    "height_delta": 0.0,
    "speed_profile": "slow"
  }
}
```

### Commands

| cmd | Description |
|-----|-------------|
| `PING` | Health check, expects `ACK` |
| `MOVE` | Relative delta move (degrees / cm) |
| `GOTO` | Absolute pan/tilt/height target |
| `STOP` | Emergency stop all motors |
| `GET_STATE` | Request current position |
| `SET_LIMITS` | Configure min/max (factory/setup only) |

### Response envelope

```json
{
  "type": "ACK",
  "seq": 42,
  "state": {
    "pan": 12.5,
    "tilt": -3.0,
    "height": 145.0,
    "moving": false
  },
  "error": null
}
```

## Safety limits (defaults)

| Axis | Min | Max | Max delta/tick | Min change |
|------|-----|-----|----------------|------------|
| Pan | -180° | 180° | 15° | 0.5° |
| Tilt | -45° | 45° | 10° | 0.5° |
| Height | 80 cm | 180 cm | 5 cm | 0.5 cm |

## Speed profiles

| Profile | Pan °/s | Tilt °/s | Height cm/s |
|---------|---------|----------|-------------|
| slow | 5 | 3 | 2 |
| medium | 15 | 10 | 5 |
| fast | 30 | 20 | 10 |
| documentary | 8 | 5 | 3 |

## Movement smoothing

- Apply exponential smoothing on consecutive AI deltas.
- Reject command if `hold_ms` since last move < scene minimum (default 300ms).
- Coalesce pending deltas within the same tick window.

## Mock mode

Set `TRIPOD_MODE=mock` in `.env` to use the in-app simulator (no hardware required).
