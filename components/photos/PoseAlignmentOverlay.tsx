'use client';

import { useEffect, useRef, useState } from 'react';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import {
  drawPoseLandmarks,
  calculatePoseAlignment,
} from '@/lib/utils/poseDetection';
import { PoseLandmarks } from '@/types';

interface PoseAlignmentOverlayProps {
  referencePose: PoseLandmarks[] | null;
  currentPoseResult: PoseLandmarkerResult | null;
  videoElement: HTMLVideoElement | null;
  showReference?: boolean;
}

export default function PoseAlignmentOverlay({
  referencePose,
  currentPoseResult,
  videoElement,
  showReference = true,
}: PoseAlignmentOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [alignmentScore, setAlignmentScore] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !videoElement) return;

    // Set canvas size to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw current pose in green
    if (currentPoseResult) {
      drawPoseLandmarks(canvas, currentPoseResult, '#00FF00', 3);
    }

    // Draw reference pose in semi-transparent yellow/orange
    if (showReference && referencePose && currentPoseResult) {
      // Calculate alignment score
      const currentLandmarks = currentPoseResult.landmarks?.[0];
      if (currentLandmarks) {
        const score = calculatePoseAlignment(referencePose, currentLandmarks);
        setAlignmentScore(score);

        // Draw reference pose landmarks
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)'; // Orange with transparency
        ctx.fillStyle = 'rgba(255, 165, 0, 0.6)';
        ctx.lineWidth = 2;

        referencePose.forEach((landmark) => {
          if (landmark.visibility > 0.5) {
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;

            // Draw landmark point
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
      }
    }
  }, [currentPoseResult, referencePose, videoElement, showReference]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {showReference && referencePose && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FFA500]"></div>
              <span className="text-sm">Reference Pose</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00FF00]"></div>
              <span className="text-sm">Your Pose</span>
            </div>
          </div>
        </div>
      )}

      {showReference && referencePose && alignmentScore > 0 && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-3 rounded-lg z-20">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">{alignmentScore}%</div>
            <div className="text-xs uppercase tracking-wide">
              {alignmentScore >= 85 ? (
                <span className="text-green-400">Great Alignment!</span>
              ) : alignmentScore >= 70 ? (
                <span className="text-yellow-400">Good - Adjust Slightly</span>
              ) : (
                <span className="text-orange-400">Keep Adjusting</span>
              )}
            </div>
          </div>
        </div>
      )}

      {!currentPoseResult && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white/90 px-6 py-4 rounded-lg text-center">
            <p className="text-gray-800 font-medium">
              Position yourself in frame
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Make sure your full body is visible
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
