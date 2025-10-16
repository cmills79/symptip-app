'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import BodyAreaSelector from '@/components/photos/BodyAreaSelector';
import CameraCapture from '@/components/photos/CameraCapture';
import PhotoEditor from '@/components/photos/PhotoEditor';
import { PoseLandmarks } from '@/types';

type Step = 'select-area' | 'capture' | 'edit';

export default function PhotoCapturePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('select-area');
  const [selectedBodyArea, setSelectedBodyArea] = useState('');
  const [customBodyArea, setCustomBodyArea] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [poseLandmarks, setPoseLandmarks] = useState<PoseLandmarks[] | undefined>();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleBodyAreaSelected = (area: string, customDesc?: string) => {
    setSelectedBodyArea(area);
    if (customDesc) {
      setCustomBodyArea(customDesc);
    }
    setStep('capture');
  };

  const handlePhotoCapture = (photoDataUrl: string, landmarks?: PoseLandmarks[]) => {
    setCapturedPhoto(photoDataUrl);
    setPoseLandmarks(landmarks);
    setStep('edit');
  };

  const handleCancel = () => {
    if (step === 'edit') {
      setStep('capture');
      setCapturedPhoto(null);
    } else if (step === 'capture') {
      setStep('select-area');
    } else {
      router.push('/photos');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-5xl mx-auto p-6">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <StepIndicator
              number={1}
              label="Select Area"
              active={step === 'select-area'}
              completed={step === 'capture' || step === 'edit'}
            />
            <div className={`h-0.5 w-16 ${step !== 'select-area' ? 'bg-primary' : 'bg-primary/30'}`} />
            <StepIndicator
              number={2}
              label="Capture"
              active={step === 'capture'}
              completed={step === 'edit'}
            />
            <div className={`h-0.5 w-16 ${step === 'edit' ? 'bg-primary' : 'bg-primary/30'}`} />
            <StepIndicator
              number={3}
              label="Edit & Save"
              active={step === 'edit'}
              completed={false}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-background-paper rounded-lg shadow-lg border border-primary/20 overflow-hidden">
          {step === 'select-area' && (
            <BodyAreaSelector
              onSelect={handleBodyAreaSelected}
              onCancel={handleCancel}
            />
          )}

          {step === 'capture' && user && (
            <CameraCapture
              bodyArea={selectedBodyArea}
              userId={user.uid}
              onCapture={handlePhotoCapture}
              onCancel={handleCancel}
              enablePoseDetection={true}
            />
          )}

          {step === 'edit' && capturedPhoto && (
            <PhotoEditor
              photoDataUrl={capturedPhoto}
              bodyArea={selectedBodyArea}
              customBodyArea={customBodyArea}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-1 transition-colors ${
          active
            ? 'bg-primary text-background-paper'
            : completed
            ? 'bg-accent text-background-paper'
            : 'bg-primary/20 text-text-secondary'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <span className={`text-xs ${active ? 'text-primary font-medium' : 'text-text-secondary'}`}>
        {label}
      </span>
    </div>
  );
}
