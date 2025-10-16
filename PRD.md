# One-pager: HealthTrack Pro - Mystery Illness Documentation System

## 1. TL;DR
This web application named Symptiq is a comprehensive health documentation application designed for tracking and analyzing mysterious illnesses suspected to be caused by mold, fungus, or parasite exposure. Built specifically for personal use by a married couple, the app combines daily photo documentation, symptom logging, supplement tracking, and AI-powered analysis to create detailed health reports for medical consultations.

## 2. Goals
### Business Goals
* Create a comprehensive personal health tracking solution for undiagnosed conditions
* Develop an AI-powered analysis system that identifies potential patterns and correlations
* Build a user-friendly interface that encourages consistent daily logging
* Generate professional medical reports to facilitate healthcare provider consultations

### User Goals
* Document visual progression of symptoms through daily photography
* Track correlations between diet, supplements, and symptom severity
* Receive AI-guided insights about potential causes and treatment approaches
* Generate comprehensive reports for medical appointments
* Maintain organized health records with minimal effort

### Non-Goals
* Commercial distribution or multi-user authorization systems
* Medical diagnosis or treatment recommendations
* HIPAA compliance for healthcare providers
* Integration with external medical systems

## 3. User stories
**Primary Persona: Health-Conscious Individual with Undiagnosed Condition**
* As a person with mysterious symptoms, I want to capture daily photos so I can visually track changes over time
* As someone seeking answers, I want AI analysis of my data so I can identify potential patterns I might miss
* As a patient preparing for medical consultations, I want comprehensive reports so I can effectively communicate with healthcare providers
* As a health tracker, I want automated reminders so I maintain consistent logging habits

**Secondary Persona: Supportive Partner**
* As a concerned partner, I want to access shared health data so I can provide informed support
* As a caregiver, I want to help with data entry so we maintain complete records even on difficult days

## 4. Functional requirements

### Core Features (Phase 1)
* Daily photo capture with Firebase storage and basic editing tools (circle/highlight areas)
* Symptom journal with AI-powered follow-up questions for clarity
* Supplement logging with pre-populated treatment options for mold/fungus/parasite conditions
* Basic food and dairy logging with photo support
* Daily reminder notifications for logging activities

### Enhanced Features (Phase 2)
* AI symptom analyzer identifying patterns across all logged data
* Time-lapse video generation (7 days to 1 year selections)
* Comprehensive report generation for medical consultations
* Public gallery sharing option with privacy controls
* Advanced dietary analysis and correlation tracking

### Advanced Features (Phase 3)
* Deep AI analysis providing non-medical opinions on potential causes
* Personalized treatment suggestions based on logged data patterns
* Data export functionality for external analysis
* Enhanced photo editing and annotation tools

## 5. User experience
### Primary User Journey
* User opens app and receives daily logging reminder
* Captures photo of affected area with guided editing tools
* Completes symptom journal with AI assistance for clarity
* Logs supplements and meals throughout the day
* Reviews AI-generated insights and pattern analysis
* Generates reports when preparing for medical appointments

### Edge Cases and UI Notes
* Offline photo capture with sync when connection restored
* Voice-to-text support for logging during difficult symptom days
* Calendar integration for appointment scheduling and report preparation
* Simple authentication using Google accounts (husband/wife only)
* Intuitive navigation with minimal taps to complete daily tasks

## 6. Narrative
Sarah wakes up and immediately notices her skin condition has changed overnight. She opens HealthTrack Pro and uses the camera feature to capture detailed photos, circling the areas of concern with the built-in editing tool. The AI assistant prompts her with relevant questions about pain levels, timing, and potential triggers she might have overlooked.

Throughout the day, she logs her supplement intake from the pre-populated list of anti-fungal treatments, noting the exact timing and dosages. When she eats, she quickly photographs her meals and selects items from the smart food database, which learns her preferences over time.

By evening, Sarah reviews the AI's daily analysis, which highlights a potential correlation between her symptoms and a specific dietary trigger she hadn't noticed. She shares this insight with her husband through the app, and together they plan to discuss these patterns with their doctor next week using the comprehensive report the app will generate, complete with time-lapse visuals and detailed correlation analysis.

## 7. Success metrics
* Daily logging completion rate (target: 80%+ adherence)
* Photo upload consistency and quality scores
* AI analysis accuracy feedback from users
* Report generation frequency and medical consultation outcomes
* Pattern identification success rate through user validation
* User engagement with AI recommendations and insights

## 8. Milestones & sequencing

### Phase 1: Foundation (Months 1-2)
* Firebase setup with authentication and storage
* Basic photo capture and editing functionality
* Simple symptom and supplement logging
* Daily reminder system implementation

### Phase 2: Intelligence (Months 3-4)
* AI integration for symptom analysis and pattern recognition
* Enhanced food logging with photo support
* Report generation system with exportable formats
* Time-lapse video creation functionality

### Phase 3: Optimization (Months 5-6)
* Advanced AI analysis with treatment suggestions
* Public gallery with privacy controls
* Data export and backup systems
* Performance optimization and user experience refinements

Each phase includes user testing with the primary couple to ensure functionality meets real-world needs before proceeding to the next development stage. 
