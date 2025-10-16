'use client';

import { useState, useRef, useEffect } from 'react';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import {
  initializePoseLandmarker,
  detectPose,
  cleanupPoseLandmarker,
} from '@/lib/utils/poseDetection';
import {
  getPoseReferenceByBodyArea,
  savePoseReference,
} from '@/lib/services/poseReferenceService';
import { PoseLandmarks } from '@/types';
import PoseAlignmentOverlay from './PoseAlignmentOverlay';

interface CameraCaptureProps {
  bodyArea: string;
  userId: string;
  onCapture: (photoDataUrl: string, poseLandmarks?: PoseLandmarks[]) => void;
  onCancel: () => void;
  enablePoseDetection?: boolean;
}

export default function CameraCapture({
  bodyArea,
  userId,
  onCapture,
  onCancel,
  enablePoseDetection = false,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number>();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Pose detection state
  const [poseDetectionReady, setPoseDetectionReady] = useState(false);
  const [referencePose, setReferencePose] = useState<PoseLandmarks[] | null>(null);
  const [currentPoseResult, setCurrentPoseResult] = useState<PoseLandmarkerResult | null>(null);
  const [isCreatingReference, setIsCreatingReference] = useState(false);

  // Initialize pose detection
  useEffect(() => {
    if (enablePoseDetection) {
      initializePoseLandmarker()
        .then(() => setPoseDetectionReady(true))
        .catch((err) => {
          console.error('Failed to initialize pose detection:', err);
          setError('Pose detection unavailable. You can still take photos.');
        });

      // Load reference pose if it exists
      getPoseReferenceByBodyArea(userId, bodyArea)
        .then((reference) => {
          if (reference) {
            setReferencePose(reference.landmarks);
          } else {
            setIsCreatingReference(true);
          }
        })
        .catch((err) => {
          console.error('Failed to load reference pose:', err);
        });
    }
  }, [enablePoseDetection, userId, bodyArea]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (enablePoseDetection) {
        cleanupPoseLandmarker();
      }
    };
  }, [stream, enablePoseDetection]);

  // Pose detection loop
  useEffect(() => {
    if (!enablePoseDetection || !poseDetectionReady || !cameraActive || !videoRef.current) {
      return;
    }

    let lastVideoTime = -1;

    const detectPoseFrame = async () => {
      const video = videoRef.current;
      if (!video) return;

      const startTimeMs = performance.now();

      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;

        try {
          const result = await detectPose(video, startTimeMs);
          if (result) {
            setCurrentPoseResult(result);
          }
        } catch (err) {
          console.error('Pose detection error:', err);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectPoseFrame);
    };

    detectPoseFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enablePoseDetection, poseDetectionReady, cameraActive]);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions or use file upload.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // If this is the first photo for this body area, save it as reference
    if (enablePoseDetection && isCreatingReference && currentPoseResult?.landmarks?.[0]) {
      try {
        await savePoseReference(
          userId,
          bodyArea,
          currentPoseResult.landmarks[0],
          photoDataUrl
        );
        setReferencePose(currentPoseResult.landmarks[0]);
        setIsCreatingReference(false);
      } catch (err) {
        console.error('Failed to save reference pose:', err);
      }
    }

    // Get pose landmarks for the captured photo
    const poseLandmarks = currentPoseResult?.landmarks?.[0] || undefined;

    stopCamera();
    onCapture(photoDataUrl, poseLandmarks);
  };

  const createNewReferencePose = async () => {
    if (!videoRef.current || !canvasRef.current || !currentPoseResult?.landmarks?.[0]) {
      setError('Please position yourself so your pose is detected');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    try {
      await savePoseReference(
        userId,
        bodyArea,
        currentPoseResult.landmarks[0],
        photoDataUrl
      );
      setReferencePose(currentPoseResult.landmarks[0]);
      setIsCreatingReference(false);
      setError('');
      alert('Reference pose saved successfully!');
    } catch (err) {
      console.error('Failed to save reference pose:', err);
      setError('Failed to save reference pose. Please try again.');
    }
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(() => startCamera(), 100);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onCapture(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-primary mb-2">
        Capture Photo
      </h2>
      <p className="text-text-secondary mb-6">
        Taking photo of: <span className="font-medium text-primary">{bodyArea}</span>
      </p>

      <div className="mb-6">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-[4/3] mb-4">
          {!cameraActive ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-20 h-20 mx-auto mb-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-gray-400 mb-4">Camera is not active</p>
              </div>
            </div>
          ) : null}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {enablePoseDetection && cameraActive && poseDetectionReady && (
            <PoseAlignmentOverlay
              referencePose={referencePose}
              currentPoseResult={currentPoseResult}
              videoElement={videoRef.current}
              showReference={!isCreatingReference}
            />
          )}

          {enablePoseDetection && isCreatingReference && cameraActive && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg z-20 font-medium">
              Creating Reference Pose - Position Yourself
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex gap-3 justify-center">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-primary text-background-paper rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={capturePhoto}
                  className="px-8 py-3 bg-accent text-background-paper rounded-lg hover:bg-accent-dark transition-colors font-medium"
                >
                  Capture Photo
                </button>
                <button
                  onClick={switchCamera}
                  className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Switch Camera
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Stop
                </button>
              </>
            )}
          </div>

          {enablePoseDetection && cameraActive && !isCreatingReference && (
            <div className="flex justify-center">
              <button
                onClick={createNewReferencePose}
                className="px-4 py-2 text-sm border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors"
              >
                Create New Reference Pose
              </button>
            </div>
          )}
        </div>

        <div className="text-center">
          <div className="relative inline-block">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors"
            >
              Upload from Device
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-primary/20">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
