import { GoogleGenerativeAI } from '@google/generative-ai';
import { Video } from '@/types';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''
);

/**
 * Convert video blob to base64 for Gemini API
 */
async function prepareVideoForGemini(videoBlob: Blob): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: videoBlob.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(videoBlob);
  });
}

/**
 * Analyze video for unconventional health patterns
 * Specifically designed for undiagnosed conditions like Morgellons disease
 */
export async function analyzeUndiagnosedVideo(
  videoBlob: Blob,
  bodyArea: string,
  symptomDescription: string
): Promise<{
  unconventionalFindings: string[];
  movementAnalysis: string[];
  textureAnomalies: string[];
  fiberLikeStructures?: string[];
  subcutaneousMovement?: string[];
  colorChanges?: string[];
  questions: string[];
  confidence: number;
  recommendedFocusAreas: Array<{ timestamp: number; description: string }>;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const videoPart = await prepareVideoForGemini(videoBlob);

    const prompt = `You are a medical AI assistant analyzing video documentation of an UNDIAGNOSED medical condition affecting ${bodyArea}.

CRITICAL CONTEXT: This patient has a mysterious illness that may not fit conventional medical patterns. You must think OUTSIDE standard diagnostic frameworks. Consider conditions like:
- Morgellons disease (fiber-like structures, crawling sensations, skin lesions, geometric patterns)
- Parasitic infections (visible movement, burrowing patterns, trails)
- Fungal manifestations (unusual textures, spreading patterns, mycelium-like growth)
- Mold-related skin reactions (discoloration, lesion patterns, black/white specks)
- Biofilm formations (protective coatings, resistance to treatment)
- Unconventional environmental reactions (chemical sensitivities, electromagnetic responses)

Patient's Description:
"${symptomDescription}"

ANALYZE THIS VIDEO FOR:

1. **Unconventional Findings**: Look for anything that defies standard dermatological explanations
   - Fiber-like structures of ANY color (black, blue, red, white, clear, multicolored)
   - Crystalline or geometric formations
   - Unusual extrusions from skin (threads, plugs, particles)
   - Moving or apparently "alive" material
   - Granular or sandy textures
   - White or black specks that may be emerging
   - Helical or spiral patterns

2. **Movement Analysis**: Document ANY movement that seems unusual - NO MATTER HOW SUBTLE
   - Subcutaneous movement (under-skin activity, waves, ripples)
   - Surface movement of particles/fibers (floating, retracting, emerging)
   - Pulsating or wriggling motions
   - Directional movement patterns (crawling sensation correlation)
   - Rhythmic or cyclical movements
   - Response to touch, light, or heat

3. **Texture Anomalies**: Note surface characteristics in EXTREME detail
   - Lesion patterns (geometric, clustered, spreading, linear arrangements)
   - Skin texture changes (rough, scaly, smooth patches, waxy appearance)
   - Color variations (red, black, white specks, blue-gray areas, hyperpigmentation)
   - Raised or depressed areas (nodules, papules, craters)
   - Biofilm-like coatings or sheens
   - Central plug or core structures in lesions

4. **Fiber Characteristics** (if present): Document in exhaustive detail
   - Color(s) observed
   - Length and thickness
   - Location (surface vs embedded)
   - Movement type (static, floating, retracting, emerging)
   - Texture (smooth, fuzzy, crystalline, organic)
   - Quantity and distribution pattern
   - Interaction with skin tissue

5. **Temporal Changes**: How symptoms evolve during the video
   - Growing/shrinking structures
   - Color changes over time
   - Appearance/disappearance of structures
   - Movement patterns over duration
   - Response to environmental changes

6. **Environmental Factors**: Note any visible environmental elements
   - Lighting changes affecting visibility
   - Moisture/dryness of area
   - Temperature indicators (condensation, skin color)
   - Air movement effects

CRITICAL INSTRUCTIONS:
- DO NOT dismiss findings as "lint," "dust," "artifacts," or "debris" - document EVERYTHING you observe
- DO NOT apply standard dermatology constraints - consider ALL possibilities including unconventional ones
- DO NOT assume conventional causes - this is an UNDIAGNOSED condition that may have no precedent
- DO include specific timestamps for ALL observations
- DO note patterns that may seem impossible by conventional understanding
- DO document even microscopic details that might be significant

Provide specific timestamps for key observations (e.g., "At 12 seconds, visible fiber-like structure").

Format as JSON:
{
  "unconventionalFindings": ["finding 1 with timestamp", "finding 2 with timestamp"],
  "movementAnalysis": ["movement observation 1", "movement observation 2"],
  "textureAnomalies": ["texture observation 1", "texture observation 2"],
  "fiberLikeStructures": ["description if present", "location and characteristics"],
  "subcutaneousMovement": ["description if observed", "pattern and frequency"],
  "colorChanges": ["color change observation 1", "color change observation 2"],
  "questions": [
    "Have you noticed this increases after certain activities?",
    "Do these symptoms worsen in specific environments?",
    "Have you tracked correlation with diet/supplements?"
  ],
  "confidence": 75,
  "recommendedFocusAreas": [
    {"timestamp": 12, "description": "Visible structure at this point"},
    {"timestamp": 34, "description": "Movement observed here"}
  ]
}`;

    const result = await model.generateContent([prompt, videoPart]);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return {
      unconventionalFindings: ['Video analysis completed - please review detailed findings'],
      movementAnalysis: [],
      textureAnomalies: [],
      questions: [
        'When did these symptoms first appear?',
        'Do they worsen in certain conditions?',
        'Have you noticed patterns in timing or triggers?'
      ],
      confidence: 50,
      recommendedFocusAreas: [],
    };
  } catch (error) {
    console.error('Error analyzing video:', error);
    throw new Error('Failed to analyze video');
  }
}

/**
 * Compare two videos to track progression of undiagnosed condition
 */
export async function compareVideos(
  olderVideoBlob: Blob,
  newerVideoBlob: Blob,
  bodyArea: string,
  timeBetween: string
): Promise<{
  progressionAnalysis: string[];
  improvement: boolean | null; // null if unclear
  newFindings: string[];
  consistentFindings: string[];
  questions: string[];
  confidence: number;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const olderVideoPart = await prepareVideoForGemini(olderVideoBlob);
    const newerVideoPart = await prepareVideoForGemini(newerVideoBlob);

    const prompt = `You are analyzing progression of an UNDIAGNOSED medical condition affecting ${bodyArea}.

Compare these two videos taken ${timeBetween} apart.
First video is OLDER, second video is MORE RECENT.

For undiagnosed conditions like Morgellons disease, focus on:

1. **Fiber-like Structures**: Are they more/less prominent?
   - Changes in quantity, color, size, or distribution
   - New fiber colors appearing or existing ones disappearing
   - Changes in fiber behavior (more/less mobile)

2. **Movement Patterns**: Has subcutaneous or surface movement changed?
   - Increased/decreased frequency of movement
   - Changes in movement type (crawling, pulsating, emerging)
   - New areas showing movement

3. **Lesion Progression**: Are lesions spreading, healing, or transforming?
   - Expansion or reduction in affected area
   - Changes in geometric patterns
   - Appearance of new lesion types
   - Central plug development or resolution

4. **Texture Changes**: Surface characteristics evolution
   - Biofilm formation or dissipation
   - Roughness or smoothness changes
   - Color uniformity or variation changes

5. **New Symptoms**: Completely new manifestations appearing
   - New fiber types or colors
   - New movement patterns
   - New lesion formations
   - New textural anomalies

6. **Environmental Factors**: (lighting/moisture) that might affect appearance
   - Account for differences in documentation conditions

7. **Treatment Response**: (if any treatments were attempted)
   - Signs of improvement or worsening
   - Unexpected reactions
   - Resistance patterns

Document BOTH positive and negative changes.
Do NOT assume conventional healing patterns - Morgellons and similar conditions may not follow typical dermatological progression.
Document patterns that suggest unconventional biology or behavior.

Format as JSON:
{
  "progressionAnalysis": ["change 1", "change 2"],
  "improvement": true/false/null,
  "newFindings": ["new symptom 1", "new symptom 2"],
  "consistentFindings": ["ongoing symptom 1", "ongoing symptom 2"],
  "questions": ["question 1", "question 2"],
  "confidence": 75
}`;

    const result = await model.generateContent([
      prompt,
      olderVideoPart,
      newerVideoPart,
    ]);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      progressionAnalysis: [],
      improvement: null,
      newFindings: [],
      consistentFindings: [],
      questions: [],
      confidence: 50,
    };
  } catch (error) {
    console.error('Error comparing videos:', error);
    throw new Error('Failed to compare videos');
  }
}

/**
 * Extract key frames from video for detailed analysis
 */
export async function extractKeyFrames(
  videoBlob: Blob,
  numFrames: number = 5
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const interval = duration / (numFrames + 1);
      const frames: string[] = [];
      let currentFrame = 0;

      const captureFrame = () => {
        if (currentFrame >= numFrames) {
          resolve(frames);
          return;
        }

        const time = interval * (currentFrame + 1);
        video.currentTime = time;

        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');

          if (context) {
            context.drawImage(video, 0, 0);
            frames.push(canvas.toDataURL('image/jpeg', 0.9));
            currentFrame++;
            captureFrame();
          }
        };
      };

      captureFrame();
    };

    video.onerror = reject;
    video.src = URL.createObjectURL(videoBlob);
  });
}

/**
 * Generate follow-up questions specific to video observations
 */
export async function generateVideoFollowUpQuestions(
  videoBlob: Blob,
  bodyArea: string,
  symptomDescription: string,
  initialAnalysis: any
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Based on video analysis of ${bodyArea} showing potential undiagnosed condition (possibly Morgellons disease or similar) with these findings:

Initial Analysis:
${JSON.stringify(initialAnalysis, null, 2)}

Patient Description:
"${symptomDescription}"

Generate 7 highly specific follow-up questions tailored to the observations in the video. Each question should help identify:

1. **Temporal Patterns**: When do these specific manifestations appear/worsen?
   - Example: "At what time of day do you notice the fiber emergence most?"

2. **Environmental Triggers**: What environmental factors correlate with observations?
   - Example: "Do the movements intensify in humid conditions or after showering?"

3. **Physical Sensations**: What exact sensations accompany the visual observations?
   - Example: "When you see the surface activity, do you feel crawling, burning, or stabbing sensations?"

4. **Behavioral Responses**: What makes the observed symptoms better or worse?
   - Example: "Have you noticed if the fiber-like structures retract when you apply pressure or heat?"

5. **Historical Context**: How have these specific patterns evolved?
   - Example: "Did the black fibers appear before or after the lesions formed?"

6. **Treatment Attempts**: What treatments have affected these specific observations?
   - Example: "Have you tried any topical treatments that affected the fiber emergence?"

7. **Associated Symptoms**: Are there systemic or psychological symptoms linked to observations?
   - Example: "Do you experience fatigue, brain fog, or joint pain when these movements are most active?"

CRITICAL:
- Reference SPECIFIC observations from the video analysis (fiber colors, movement types, lesion patterns)
- Do NOT ask generic dermatology questions
- Focus on unconventional aspects that might help identify the condition
- Ask about correlations between visual findings and sensations
- Include questions about patterns that defy conventional medical understanding

Format as JSON array:
["question 1", "question 2", ..., "question 7"]`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [
      'What time of day are these symptoms most noticeable?',
      'Have you identified any specific triggers?',
      'How do you describe the sensations you experience?',
      'What treatments have you attempted?',
      'When did these symptoms first begin?',
      'Are there other areas of your body affected?',
      'Have you noticed environmental factors that worsen symptoms?'
    ];
  } catch (error) {
    console.error('Error generating questions:', error);
    return [];
  }
}
