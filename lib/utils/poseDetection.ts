import {
  PoseLandmarker,
  FilesetResolver,
  PoseLandmarkerResult,
  DrawingUtils,
} from '@mediapipe/tasks-vision';

let poseLandmarker: PoseLandmarker | null = null;

/**
 * Initialize the MediaPipe Pose Landmarker
 */
export async function initializePoseLandmarker(): Promise<PoseLandmarker> {
  if (poseLandmarker) {
    return poseLandmarker;
  }

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  return poseLandmarker;
}

/**
 * Detect pose from video element
 */
export async function detectPose(
  videoElement: HTMLVideoElement,
  timestamp: number
): Promise<PoseLandmarkerResult | null> {
  if (!poseLandmarker) {
    await initializePoseLandmarker();
  }

  if (!poseLandmarker) {
    throw new Error('Failed to initialize pose landmarker');
  }

  return poseLandmarker.detectForVideo(videoElement, timestamp);
}

/**
 * Draw pose landmarks on canvas
 */
export function drawPoseLandmarks(
  canvas: HTMLCanvasElement,
  result: PoseLandmarkerResult,
  color: string = '#00FF00',
  lineWidth: number = 2
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || !result.landmarks || result.landmarks.length === 0) {
    return;
  }

  const landmarks = result.landmarks[0];
  const drawingUtils = new DrawingUtils(ctx);

  // Draw connections between landmarks
  drawingUtils.drawConnectors(
    landmarks,
    PoseLandmarker.POSE_CONNECTIONS,
    { color, lineWidth }
  );

  // Draw individual landmarks
  drawingUtils.drawLandmarks(landmarks, {
    color,
    lineWidth,
    radius: 4,
  });
}

/**
 * Calculate alignment score between two pose landmark sets
 * Returns a score from 0-100, where 100 is perfect alignment
 */
export function calculatePoseAlignment(
  referenceLandmarks: any[],
  currentLandmarks: any[]
): number {
  if (!referenceLandmarks || !currentLandmarks) {
    return 0;
  }

  // Key landmarks for body alignment (shoulders, hips, knees, ankles)
  const keyLandmarkIndices = [11, 12, 23, 24, 25, 26, 27, 28];

  let totalDistance = 0;
  let validComparisons = 0;

  keyLandmarkIndices.forEach((index) => {
    if (
      referenceLandmarks[index] &&
      currentLandmarks[index] &&
      referenceLandmarks[index].visibility > 0.5 &&
      currentLandmarks[index].visibility > 0.5
    ) {
      const dx = referenceLandmarks[index].x - currentLandmarks[index].x;
      const dy = referenceLandmarks[index].y - currentLandmarks[index].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
      validComparisons++;
    }
  });

  if (validComparisons === 0) {
    return 0;
  }

  const avgDistance = totalDistance / validComparisons;

  // Convert distance to score (0.1 distance = 90 score, 0.2 distance = 80 score, etc.)
  const score = Math.max(0, Math.min(100, 100 - avgDistance * 500));

  return Math.round(score);
}

/**
 * Check if pose is detected in the result
 */
export function isPoseDetected(result: PoseLandmarkerResult): boolean {
  return !!(result.landmarks && result.landmarks.length > 0);
}

/**
 * Get pose landmark by index
 * Index reference:
 * 0: nose
 * 11-12: shoulders
 * 13-14: elbows
 * 15-16: wrists
 * 23-24: hips
 * 25-26: knees
 * 27-28: ankles
 */
export function getLandmark(
  result: PoseLandmarkerResult,
  index: number
): { x: number; y: number; z: number; visibility: number } | null {
  if (!result.landmarks || result.landmarks.length === 0) {
    return null;
  }

  const landmark = result.landmarks[0][index];
  return landmark || null;
}

/**
 * Cleanup pose landmarker resources
 */
export function cleanupPoseLandmarker(): void {
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
  }
}
