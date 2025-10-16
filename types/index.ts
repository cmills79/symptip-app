import { Timestamp } from 'firebase/firestore';

export interface PoseLandmarks {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseReference {
  id: string;
  bodyArea: string;
  landmarks: PoseLandmarks[];
  photoUrl: string;
  createdAt: Timestamp;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
}

export interface BodyArea {
  preset: 'Face - Front' | 'Face - Left' | 'Face - Right' |
          'Left Hand' | 'Right Hand' | 'Both Hands' |
          'Left Arm' | 'Right Arm' | 'Both Arms' |
          'Left Leg' | 'Right Leg' | 'Both Legs' |
          'Torso - Front' | 'Torso - Back' |
          'Left Foot' | 'Right Foot' | 'Both Feet' |
          'Custom';
  customDescription?: string;
  isPoseReference: boolean;
  poseReferenceId?: string;
  poseAlignmentScore?: number;
}

export interface Annotation {
  id: string;
  type: 'circle' | 'freehand' | 'arrow' | 'text';
  coordinates: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: { x: number; y: number }[];
  };
  color: string;
  label?: string;
  severity?: number;
  concernType?: 'rash' | 'discoloration' | 'swelling' | 'lesion' | 'other';
}

export interface PhotoMetadata {
  lightingScore: number;
  blurScore: number;
  distanceFromCamera?: number;
}

export interface AIAnalysis {
  detectedChanges: string[];
  questions: string[];
  responses: string[];
  patterns?: string[];
  confidence?: number;
}

export interface TimelapsePreference {
  enabled: boolean;
  duration: '7days' | '14days' | '30days' | '90days' | '180days' | '1year';
  fps?: number;
}

export interface SymptomSubmission {
  description: string;
  aiQuestions: string[];
  aiResponses: string[];
  submittedAt: Timestamp;
}

export interface Photo {
  id: string;
  userId: string;
  date: Timestamp;
  url: string;
  thumbnail: string;
  bodyArea: BodyArea;
  annotations: Annotation[];
  userGoals?: string;
  aiAnalysis?: AIAnalysis;
  metadata: PhotoMetadata;
  diaryEntry?: string;
  timelapsePreference?: TimelapsePreference;
  symptomSubmission?: SymptomSubmission;
}

export interface Symptom {
  id: string;
  userId: string;
  date: Timestamp;
  description: string;
  severity: number; // 1-10
  triggers?: string[];
  aiQuestions?: string[];
  aiResponses?: string[];
  relatedPhotoId?: string;
}

export interface Supplement {
  id: string;
  userId: string;
  date: Timestamp;
  name: string;
  dosage: string;
  timing: string;
  purpose: 'mold' | 'fungus' | 'parasite' | 'general' | 'other';
  notes?: string;
}

export interface Meal {
  id: string;
  userId: string;
  date: Timestamp;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: string[];
  photos: string[];
  notes?: string;
}

export interface Pattern {
  id: string;
  userId: string;
  type: 'dietary' | 'supplement' | 'symptom' | 'environmental';
  correlation: string;
  confidence: number; // 0-100
  dateRange: {
    start: Timestamp;
    end: Timestamp;
  };
  description: string;
  supportingData: string[];
}

export interface Report {
  id: string;
  userId: string;
  dateRange: {
    start: Timestamp;
    end: Timestamp;
  };
  sections: {
    photoTimeline: boolean;
    symptomLog: boolean;
    supplementLog: boolean;
    dietaryLog: boolean;
    patterns: boolean;
    aiAnalysis: boolean;
  };
  generatedAt: Timestamp;
  pdfUrl?: string;
}

export interface TimeLapseVideo {
  id: string;
  userId: string;
  bodyArea: string;
  dateRange: {
    start: Timestamp;
    end: Timestamp;
  };
  photoCount: number;
  frameDuration: number; // seconds per photo
  transitionStyle: 'fade' | 'slide' | 'none';
  resolution: '720p' | '1080p';
  includeAnnotations: boolean;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: Timestamp;
}
