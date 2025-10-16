'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoCaptureProps {
  bodyArea: string;
  userId: string;
  onCapture: (videoBlob: Blob, duration: number, thumbnailDataUrl: string) => void;
  onCancel: () => void;
  maxDuration?: number; // seconds
}

export default function VideoCapture({
  bodyArea,
  userId,
  onCapture,
  onCancel,
  maxDuration = 60,
}: VideoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isPaused, setIsPaused] = useState(false);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused, maxDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true, // Include audio for narration
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access camera/microphone. Please check permissions.');
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

  const startRecording = () => {
    if (!stream) return;

    try {
      chunksRef.current = [];

      // Use high-quality video codec
      const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
      };

      // Fallback to vp8 if vp9 not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8';
      }

      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const thumbnailDataUrl = await generateThumbnail();
        onCapture(blob, recordingTime, thumbnailDataUrl);
        stopCamera();
      };

      mediaRecorder.start(1000); // Capture in 1-second chunks
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      setError('Failed to start recording. Please try again.');
      console.error('Recording error:', err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const generateThumbnail = async (): Promise<string> => {
    if (!videoRef.current) return '';

    const canvas = document.createElement('canvas');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.8);
    }

    return '';
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(() => startCamera(), 100);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('Video file too large. Please select a video under 100MB.');
      return;
    }

    // Generate thumbnail from video file
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      video.currentTime = 1; // Get frame at 1 second
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(file, Math.floor(video.duration), thumbnailDataUrl);
      }
    };

    video.src = URL.createObjectURL(file);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-primary mb-2">
        Record Video
      </h2>
      <p className="text-text-secondary mb-2">
        Recording area: <span className="font-medium text-primary">{bodyArea}</span>
      </p>
      <p className="text-sm text-text-secondary mb-6">
        Maximum duration: {maxDuration} seconds. Use video to document movements, anomalies, or dynamic symptoms.
      </p>

      <div className="mb-6">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
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
            muted
            className="w-full h-full object-cover"
          />

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg z-20 font-medium">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span>REC {formatTime(recordingTime)} / {formatTime(maxDuration)}</span>
            </div>
          )}

          {isPaused && (
            <div className="absolute top-4 left-4 bg-yellow-500 text-black px-4 py-2 rounded-lg z-20 font-medium">
              PAUSED
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Recording tips */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-blue-900 mb-2">Recording Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Hold camera steady or use a tripod for clearest results</li>
            <li>• Get as close as possible to document fine details</li>
            <li>• Narrate what you're observing - audio is recorded</li>
            <li>• Good lighting is essential - avoid shadows</li>
            <li>• Pause recording to reposition without stopping</li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 justify-center flex-wrap">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-primary text-background-paper rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Start Camera
              </button>
            ) : !isRecording ? (
              <>
                <button
                  onClick={startRecording}
                  className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-white rounded-full" />
                  Start Recording
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
                  Stop Camera
                </button>
              </>
            ) : (
              <>
                {!isPaused ? (
                  <button
                    onClick={pauseRecording}
                    className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Resume
                  </button>
                )}
                <button
                  onClick={stopRecording}
                  className="px-8 py-3 bg-accent text-background-paper rounded-lg hover:bg-accent-dark transition-colors font-medium"
                >
                  Stop & Save
                </button>
              </>
            )}
          </div>

          <div className="text-center">
            <div className="relative inline-block">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors"
                disabled={isRecording}
              >
                Upload Video from Device
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-primary/20">
        <button
          onClick={onCancel}
          disabled={isRecording}
          className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
