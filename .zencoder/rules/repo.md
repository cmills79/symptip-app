---
description: Repository Information Overview
alwaysApply: true
---

# Symptiq Information

## Summary
Symptiq is a health tracking application built with Next.js and React that allows users to track mysterious illnesses through daily photography, symptom logging, and AI analysis. The app features photo capture with pose detection, timelapse video generation, and AI-powered symptom analysis.

## Structure
- **app**: Next.js application routes and pages (photos, symptoms, supplements, meals, analysis)
- **components**: React components organized by feature (photos, AI analysis)
- **lib**: Core services (photo, AI, timelapse) and Firebase integration
- **tests**: E2E, unit, and integration tests with Playwright and Vitest

## Language & Runtime
**Language**: TypeScript 5.x
**Framework**: Next.js 15.5.5
**Runtime**: React 19.0.0
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- Firebase 11.3.0 (Authentication, Firestore, Storage)
- @google/generative-ai 0.24.0 (AI analysis with Gemini)
- @mediapipe/tasks-vision 0.10.22-rc (Pose detection)
- @ffmpeg/ffmpeg 0.12.15 (Timelapse video generation)

**Development Dependencies**:
- Playwright 1.56.0 (E2E testing)
- Vitest 3.2.4 (Unit/Integration testing)
- TailwindCSS 3.4.1 (Styling)

## Build & Installation
```bash
npm install
npm run dev    # Development server on port 3001
npm run build  # Production build
npm run start  # Start production server
```

## Core Features
**Photo Capture Workflow**:
- Body area selection with 15+ preset options
- Camera capture with pose detection for consistent alignment
- Photo annotation tools with circles and arrows
- Symptom submission with AI-generated follow-up questions
- Timelapse preference selection (7 days to 1 year)

**AI Integration**:
- Single photo analysis with change detection
- Photo comparison for progression tracking
- Symptom-based question generation
- Pattern detection across symptoms, diet, and supplements
- Medical report generation for healthcare consultations

**Data Management**:
- Firebase Firestore for structured data
- Firebase Storage for photos and videos
- Image compression and thumbnail generation
- Annotation data persistence
- Time-lapse video generation with FFmpeg.wasm

## Testing
**Frameworks**: Vitest (Unit/Integration), Playwright (E2E)
**E2E Testing Agent**: Automated test generation and execution
**Run Commands**:
```bash
npm run test:e2e      # Run Playwright E2E tests
npm run test:agent    # Run E2E testing agent
npm run test:unit     # Run unit tests
```

## Firebase Integration
**Authentication**: Google account sign-in via Firebase Authentication
**Database**: Firestore for storing photos, symptoms, supplements, meals
**Storage**: Firebase Storage for photos, thumbnails, and timelapse videos