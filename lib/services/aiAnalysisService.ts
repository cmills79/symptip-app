import { GoogleGenerativeAI } from '@google/generative-ai';
import { Photo, Symptom, Supplement, Meal } from '@/types';

// Initialize Gemini API - use dedicated Gemini key if available, fallback to Firebase key
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''
);

/**
 * Convert base64 or URL image to format Gemini expects
 */
async function prepareImageForGemini(imageUrl: string): Promise<any> {
  // If it's a data URL, extract the base64 part
  if (imageUrl.startsWith('data:')) {
    const base64Data = imageUrl.split(',')[1];
    const mimeType = imageUrl.split(';')[0].split(':')[1];
    return {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    };
  }

  // If it's a URL, fetch and convert to base64
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');

  return {
    inlineData: {
      data: base64Data,
      mimeType: 'image/jpeg',
    },
  };
}

/**
 * Analyze a single photo for health concerns
 */
export async function analyzeSinglePhoto(
  photoUrl: string,
  bodyArea: string,
  userGoals?: string
): Promise<{
  detectedChanges: string[];
  questions: string[];
  confidence: number;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const imagePart = await prepareImageForGemini(photoUrl);

    const prompt = `You are a medical assistant helping track health changes over time.
Analyze this photo of ${bodyArea} for any visible health concerns.

${userGoals ? `User's goals: ${userGoals}` : ''}

Please provide:
1. A list of any visible changes, marks, discoloration, swelling, or other health concerns
2. Follow-up questions to ask the user about their symptoms or lifestyle
3. Your confidence level (0-100) in the observations

Format your response as JSON:
{
  "detectedChanges": ["change 1", "change 2"],
  "questions": ["question 1", "question 2"],
  "confidence": 85
}`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if JSON parsing fails
    return {
      detectedChanges: [text],
      questions: [],
      confidence: 50,
    };
  } catch (error) {
    console.error('Error analyzing photo:', error);
    throw new Error('Failed to analyze photo');
  }
}

/**
 * Compare two photos to detect changes over time
 */
export async function comparePhotos(
  olderPhotoUrl: string,
  newerPhotoUrl: string,
  bodyArea: string,
  timeBetween: string
): Promise<{
  detectedChanges: string[];
  improvement: boolean;
  questions: string[];
  confidence: number;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const olderImagePart = await prepareImageForGemini(olderPhotoUrl);
    const newerImagePart = await prepareImageForGemini(newerPhotoUrl);

    const prompt = `You are a medical assistant helping track health changes over time.

Compare these two photos of ${bodyArea} taken ${timeBetween} apart.
The first image is older, the second is more recent.

Please analyze:
1. What visible changes occurred between the photos?
2. Do the changes indicate improvement, worsening, or no significant change?
3. What follow-up questions should we ask the user?
4. Your confidence level in this assessment (0-100)

Focus on:
- Skin discoloration or texture changes
- Swelling or inflammation
- Redness or irritation
- Size/shape changes of marks or lesions
- Any new concerns that appeared

Format your response as JSON:
{
  "detectedChanges": ["change 1", "change 2"],
  "improvement": true/false,
  "questions": ["question 1", "question 2"],
  "confidence": 85
}`;

    const result = await model.generateContent([
      prompt,
      olderImagePart,
      newerImagePart,
    ]);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return {
      detectedChanges: [text],
      improvement: false,
      questions: [],
      confidence: 50,
    };
  } catch (error) {
    console.error('Error comparing photos:', error);
    throw new Error('Failed to compare photos');
  }
}

/**
 * Analyze correlations between symptoms, diet, and supplements
 */
export async function analyzeCorrelations(
  photos: Photo[],
  symptoms: Symptom[],
  supplements: Supplement[],
  meals: Meal[],
  dateRange: { start: Date; end: Date }
): Promise<{
  patterns: string[];
  correlations: Array<{
    type: 'dietary' | 'supplement' | 'symptom' | 'environmental';
    correlation: string;
    confidence: number;
    supportingData: string[];
  }>;
  recommendations: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Prepare data summary
    const dataSummary = {
      photoCount: photos.length,
      symptomCount: symptoms.length,
      supplementCount: supplements.length,
      mealCount: meals.length,
      symptoms: symptoms.map((s) => ({
        date: s.date.toDate().toISOString(),
        description: s.description,
        severity: s.severity,
      })),
      supplements: supplements.map((s) => ({
        date: s.date.toDate().toISOString(),
        name: s.name,
        dosage: s.dosage,
        purpose: s.purpose,
      })),
      meals: meals.map((m) => ({
        date: m.date.toDate().toISOString(),
        type: m.type,
        items: m.items,
      })),
    };

    const prompt = `You are a medical data analyst helping identify patterns in health tracking data.

Analyze the following health data from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}:

${JSON.stringify(dataSummary, null, 2)}

Please identify:
1. Any patterns or trends in symptoms over time
2. Correlations between diet/supplements and symptom changes
3. Potential triggers or helpful interventions
4. Recommendations for further tracking or lifestyle adjustments

Format your response as JSON:
{
  "patterns": ["pattern 1", "pattern 2"],
  "correlations": [
    {
      "type": "dietary|supplement|symptom|environmental",
      "correlation": "description of correlation",
      "confidence": 75,
      "supportingData": ["data point 1", "data point 2"]
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return {
      patterns: [],
      correlations: [],
      recommendations: [],
    };
  } catch (error) {
    console.error('Error analyzing correlations:', error);
    throw new Error('Failed to analyze correlations');
  }
}

/**
 * Generate a medical report summary
 */
export async function generateMedicalReportSummary(
  photos: Photo[],
  symptoms: Symptom[],
  supplements: Supplement[],
  meals: Meal[],
  dateRange: { start: Date; end: Date }
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const dataSummary = {
      photoCount: photos.length,
      symptomLogs: symptoms.map((s) => ({
        date: s.date.toDate().toLocaleDateString(),
        description: s.description,
        severity: s.severity,
      })),
      supplementsUsed: [
        ...new Set(supplements.map((s) => `${s.name} (${s.dosage})`)),
      ],
      dietaryNotes: meals.length > 0 ? 'Multiple meals logged' : 'No meals logged',
    };

    const prompt = `You are a medical assistant helping create a summary report for a healthcare provider.

Create a professional medical report summary based on this health tracking data from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}:

${JSON.stringify(dataSummary, null, 2)}

The patient is tracking mysterious health issues suspected to be related to mold, fungus, or parasite exposure.

Please create a concise summary including:
1. Overview of the tracking period and data collected
2. Key symptoms and their progression
3. Interventions attempted (supplements, dietary changes)
4. Notable patterns or observations
5. Recommendations for healthcare provider discussion

Write in a professional, clinical tone suitable for sharing with a doctor.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error('Failed to generate report');
  }
}

/**
 * Ask follow-up questions based on a photo
 */
export async function generateFollowUpQuestions(
  photoUrl: string,
  bodyArea: string,
  previousSymptoms?: string[]
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const imagePart = await prepareImageForGemini(photoUrl);

    const prompt = `You are a medical assistant helping track health symptoms.

Looking at this photo of ${bodyArea}, generate 3-5 relevant follow-up questions to ask the user about their symptoms, lifestyle, or recent changes.

${previousSymptoms ? `Previous symptoms reported: ${previousSymptoms.join(', ')}` : ''}

Focus on questions that would help identify:
- Timing and triggers
- Symptom severity and changes
- Potential environmental factors
- Diet or lifestyle correlations
- Treatment effectiveness

Format your response as a JSON array of strings:
["question 1", "question 2", "question 3"]`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return ['How long have you noticed these changes?', 'Have you tried any treatments?'];
  } catch (error) {
    console.error('Error generating questions:', error);
    return [];
  }
}
