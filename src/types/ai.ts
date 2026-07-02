import type {SpeedProfile} from './scene';

export type FocusMode = 'auto' | 'face' | 'center' | 'hold';
export type ExposureHint = 'auto' | 'brighter' | 'darker' | 'hold';

export type StatusFlag =
  | 'no_face'
  | 'multiple_faces'
  | 'subject_out_of_frame'
  | 'low_light'
  | 'high_motion'
  | 'ready'
  | 'hold_position';

export interface AIResponse {
  apply: boolean;
  pan_delta: number;
  tilt_delta: number;
  height_delta: number;
  zoom_target: number;
  speed_profile: SpeedProfile;
  guidance_text: string;
  confidence: number;
  reason: string;
  focus_mode?: FocusMode;
  exposure_hint?: ExposureHint;
  status_flags?: StatusFlag[];
}

export interface TripodState {
  pan: number;
  tilt: number;
  height: number;
  last_command_ms: number;
  connected: boolean;
}

export interface CameraState {
  zoom: number;
  exposure?: number;
  focus_distance?: number;
}

export interface SystemState {
  tripod: TripodState;
  camera: CameraState;
  timestamp_ms: number;
}
