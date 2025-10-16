'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import BodyAreaSelector from '@/components/photos/BodyAreaSelector';
import CameraCapture from '@/components/photos/CameraCapture';
import PhotoEditor from '@/components/photos/PhotoEditor';
import TimelapsePreferenceSelector from '@/components/photos/TimelapsePreferenceSelector';
import SymptomSubmissionForm from '@/components/photos/SymptomSubmissionForm';
import AIFollowUpQuestions from '@/components/photos/AIFollowUpQuestions';
import { PoseLandmarks, TimelapsePreference, Annotation } from '@/types';
import { uploadPhoto } from '@/lib/services/photoService';
import { generateSymptomFollowUpQuestions } from '@/lib/services/aiAnalysisService';
import { Timestamp } from 'firebase/firestore';

type Step = 'select-area' | 'capture' | 'edit' | 'timelapse-preference' | 'symptom-submission' | 'ai-questions' | 'complete';

export default function PhotoCapturePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('select-area');
  const [selectedBodyArea, setSelectedBodyArea] = useState('');
  const [customBodyArea, setCustomBodyArea] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [poseLandmarks, setPoseLandmarks] = useState<PoseLandmarks[] | undefined>();

  // New state for multi-step workflow
  const [photoData, setPhotoData] = useState<{
    photoDataUrl: string;
    annotations: Annotation[];
    userGoals: string;
    aiAnalysis?: any;
  } | null>(null);
  const [timelapsePreference, setTimelapsePreference] = useState<TimelapsePreference | null>(null);
  const [symptomDescription, setSymptomDescription] = useState('');
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [aiResponses, setAiResponses] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handlePhotoEdited = (data: {
    photoDataUrl: string;
    annotations: Annotation[];
    userGoals: string;
    aiAnalysis?: any;
  }) => {
    setPhotoData(data);
    setStep('timelapse-preference');
  };

  const handleTimelapseSelected = (preference: TimelapsePreference | null) => {
    setTimelapsePreference(preference);
    setStep('symptom-submission');
  };

  const handleSymptomSubmitted = async (description: string) => {
    setSymptomDescription(description);
    setIsGeneratingQuestions(true);

    try {
      // Generate AI questions based on photo and symptom description
      const questions = await generateSymptomFollowUpQuestions(
        photoData?.photoDataUrl || capturedPhoto || '',
        selectedBodyArea,
        description
      );
      setAiQuestions(questions);
      setStep('ai-questions');
    } catch (error) {
      console.error('Error generating questions:', error);
      // Proceed without questions on error
      alert('Unable to generate AI questions. Proceeding without them.');
      await uploadPhotoWithAllData([]);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleRegenerateQuestions = async () => {
    setIsGeneratingQuestions(true);

    try {
      const questions = await generateSymptomFollowUpQuestions(
        photoData?.photoDataUrl || capturedPhoto || '',
        selectedBodyArea,
        symptomDescription
      );
      setAiQuestions(questions);
    } catch (error) {
      console.error('Error regenerating questions:', error);
      alert('Unable to regenerate questions. Please try again.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAIQuestionsCompleted = async (responses: string[]) => {
    setAiResponses(responses);
    await uploadPhotoWithAllData(responses);
  };

  const uploadPhotoWithAllData = async (responses: string[]) => {
    if (!user || !photoData) return;

    setIsUploading(true);

    try {
      const bodyAreaData = {
        preset: selectedBodyArea as any,
        customDescription: customBodyArea,
        isPoseReference: false,
      };

      await uploadPhoto({
        photoDataUrl: photoData.photoDataUrl,
        userId: user.uid,
        bodyArea: bodyAreaData,
        annotations: photoData.annotations,
        userGoals: photoData.userGoals,
        timelapsePreference: timelapsePreference || undefined,
        symptomSubmission: {
          description: symptomDescription,
          aiQuestions,
          aiResponses: responses,
          submittedAt: Timestamp.now(),
        },
      });

      setStep('complete');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to save photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (step === 'complete') {
      router.push('/photos');
    } else if (step === 'ai-questions') {
      setStep('symptom-submission');
    } else if (step === 'symptom-submission') {
      setStep('timelapse-preference');
    } else if (step === 'timelapse-preference') {
      setStep('edit');
    } else if (step === 'edit') {
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
          <div className="flex items-center justify-center space-x-2 overflow-x-auto">
            <StepIndicator
              number={1}
              label="Select Area"
              active={step === 'select-area'}
              completed={step !== 'select-area'}
            />
            <div className={`h-0.5 w-8 ${step !== 'select-area' ? 'bg-primary' : 'bg-primary/30'}`} />
            <StepIndicator
              number={2}
              label="Capture"
              active={step === 'capture'}
              completed={step !== 'select-area' && step !== 'capture'}
            />
            <div className={`h-0.5 w-8 ${step !== 'select-area' && step !== 'capture' ? 'bg-primary' : 'bg-primary/30'}`} />
            <StepIndicator
              number={3}
              label="Edit"
              active={step === 'edit'}
              completed={step === 'timelapse-preference' || step === 'symptom-submission' || step === 'ai-questions' || step === 'complete'}
            />
            <div className={`h-0.5 w-8 ${step === 'timelapse-preference' || step === 'symptom-submission' || step === 'ai-questions' || step === 'complete' ? 'bg-primary' : 'bg-primary/30'}`} />
            <StepIndicator
              number={4}
              label="Time-lapse"
              active={step === 'timelapse-preference'}
              completed={step === 'symptom-submission' || step === 'ai-questions' || step === 'complete'}
            />
            <div className={`h-0.5 w-8 ${step === 'symptom-submission' || step === 'ai-questions' || step === 'complete' ? 'bg-primary' : 'bg-primary/30'}`} />
            <StepIndicator
              number={5}
              label="Symptoms"
              active={step === 'symptom-submission'}
              completed={step === 'ai-questions' || step === 'complete'}
            />
            <div className={`h-0.5 w-8 ${step === 'ai-questions' || step === 'complete' ? 'bg-primary' : 'bg-primary/30'}`} />
            <StepIndicator
              number={6}
              label="AI Questions"
              active={step === 'ai-questions'}
              completed={step === 'complete'}
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
              onContinue={handlePhotoEdited}
            />
          )}

          {step === 'timelapse-preference' && (
            <TimelapsePreferenceSelector
              bodyArea={selectedBodyArea}
              onSelect={handleTimelapseSelected}
              onCancel={handleCancel}
            />
          )}

          {step === 'symptom-submission' && photoData && (
            <>
              {isGeneratingQuestions && (
                <div className="p-8 text-center">
                  <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-text-primary font-medium">Generating AI Questions...</p>
                </div>
              )}
              {!isGeneratingQuestions && (
                <SymptomSubmissionForm
                  photoUrl={photoData.photoDataUrl}
                  bodyArea={selectedBodyArea}
                  onSubmit={handleSymptomSubmitted}
                  onCancel={handleCancel}
                />
              )}
            </>
          )}

          {step === 'ai-questions' && (
            <>
              {isGeneratingQuestions && (
                <div className="p-8 text-center">
                  <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-text-primary font-medium">Regenerating Questions...</p>
                </div>
              )}
              {!isGeneratingQuestions && (
                <AIFollowUpQuestions
                  questions={aiQuestions}
                  onComplete={handleAIQuestionsCompleted}
                  onCancel={handleCancel}
                  onRegenerateQuestions={handleRegenerateQuestions}
                />
              )}
            </>
          )}

          {step === 'complete' && (
            <div className="p-8 text-center">
              <svg className="w-20 h-20 mx-auto mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-primary mb-2">
                Photo Captured Successfully!
              </h2>
              <p className="text-text-secondary mb-6">
                Your photo and symptom information have been saved. What would you like to do next?
              </p>

              <div className="space-y-3 max-w-md mx-auto">
                <button
                  onClick={() => router.push('/photos')}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  View Photo Gallery
                </button>
                <button
                  onClick={() => router.push('/supplements')}
                  className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
                >
                  Log Supplements
                </button>
                <button
                  onClick={() => router.push('/meals')}
                  className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
                >
                  Log Meals
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
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
