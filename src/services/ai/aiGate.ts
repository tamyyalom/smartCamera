import {AI_GATE_CONFIG} from '../../config/ai';

export interface AIGateInput {
  lastCallMs: number;
  motionScore: number;
  nowMs?: number;
  force?: boolean;
}

export function shouldCallAI({
  lastCallMs,
  motionScore,
  nowMs = Date.now(),
  force = false,
}: AIGateInput): boolean {
  if (force) {
    return true;
  }

  const elapsed = nowMs - lastCallMs;
  if (elapsed < AI_GATE_CONFIG.minIntervalMs) {
    return false;
  }

  return motionScore >= AI_GATE_CONFIG.motionThreshold;
}

export function estimateMotionScore(
  previousFaceBox: {x: number; y: number} | undefined,
  currentFaceBox: {x: number; y: number} | undefined,
): number {
  if (!previousFaceBox || !currentFaceBox) {
    return 1;
  }

  const dx = currentFaceBox.x - previousFaceBox.x;
  const dy = currentFaceBox.y - previousFaceBox.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return Math.min(1, distance * 4);
}
