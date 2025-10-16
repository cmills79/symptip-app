import { GoogleGenerativeAI } from '@google/generative-ai';
import { Photo, Symptom, Supplement, Meal } from '@/types';
import { getPhotosByBodyArea, getPhotosByDateRange } from './photoService';

// Initialize Gemini API - use dedicated Gemini key if available, fallback to Firebase key
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''
);

/**
 * Analyze a timeline of photos for a specific body area
 */
export async function analyzePhotoTimeline(
  userId: string,
  bodyArea: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  timeline: Array<{
    photoId: string;
    date: Date;
    changes: string[];
    severity: 'improving' | 'stable' | 'worsening';
  }>;
  overallTrend: 'improving' | 'stable' | 'worsening' | 'unclear';
  keyMilestones: Array<{
    date: Date;
    description: string;
    significance: string;
  }>;
  recommendations: string[];
  confidence: number;
}> {
  try {
    // Fetch photos for the body area
    let photos: Photo[];
    if (startDate && endDate) {
      photos = await getPhotosByDateRange(userId, startDate, endDate);
      photos = photos.filter((p) => p.bodyArea.preset === bodyArea);
    } else {
      photos = await getPhotosByBodyArea(userId, bodyArea);
    }

    if (photos.length < 2) {
      throw new Error('Need at least 2 photos to analyze timeline');
    }

    // Sort by date ascending
    photos.sort((a, b) => a.date.toMillis() - b.date.toMillis());

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Prepare image parts for all photos
    const imageParts = await Promise.all(
      photos.slice(0, 10).map(async (photo) => {
        // Limit to 10 photos to avoid token limits
        const response = await fetch(photo.url);
        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');

        return {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
          },
        };
      })
    );

    const photoMetadata = photos.slice(0, 10).map((p, index) => ({
      index: index + 1,
      date: p.date.toDate().toLocaleDateString(),
      userGoals: p.userGoals || 'None',
      annotations: p.annotations.length,
    }));

    const prompt = `You are a medical assistant analyzing a timeline of ${photos.length} photos of ${bodyArea} taken over time.

Photo Timeline Metadata:
${JSON.stringify(photoMetadata, null, 2)}

Please analyze these images in chronological order and provide:

1. For each photo, identify:
   - What visible changes occurred since the previous photo
   - Whether the condition is improving, stable, or worsening
   - Severity assessment

2. Overall trend assessment:
   - Is the condition improving, worsening, stable, or unclear?
   - What are the key turning points or milestones?

3. Recommendations:
   - What should the user continue doing?
   - What should they consider changing?
   - When should they see a doctor?

Format your response as JSON:
{
  "timeline": [
    {
      "photoIndex": 1,
      "changes": ["change 1", "change 2"],
      "severity": "improving|stable|worsening"
    }
  ],
  "overallTrend": "improving|stable|worsening|unclear",
  "keyMilestones": [
    {
      "photoIndex": 3,
      "description": "Significant improvement noticed",
      "significance": "Marks turning point in recovery"
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "confidence": 85
}`;

    const content = [prompt, ...imageParts];
    const result = await model.generateContent(content);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Map photoIndex back to actual photo data
      const timeline = parsed.timeline.map((entry: any) => {
        const photo = photos[entry.photoIndex - 1];
        return {
          photoId: photo.id,
          date: photo.date.toDate(),
          changes: entry.changes,
          severity: entry.severity,
        };
      });

      const keyMilestones = parsed.keyMilestones.map((milestone: any) => {
        const photo = photos[milestone.photoIndex - 1];
        return {
          date: photo.date.toDate(),
          description: milestone.description,
          significance: milestone.significance,
        };
      });

      return {
        timeline,
        overallTrend: parsed.overallTrend,
        keyMilestones,
        recommendations: parsed.recommendations,
        confidence: parsed.confidence,
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error analyzing photo timeline:', error);
    throw error;
  }
}

/**
 * Detect patterns across all photos and health data
 */
export async function detectHealthPatterns(
  userId: string,
  dateRange: { start: Date; end: Date }
): Promise<{
  patterns: Array<{
    type: 'improvement' | 'worsening' | 'cyclical' | 'stable';
    bodyArea: string;
    description: string;
    strength: number; // 0-100
    timeline: Array<{ date: Date; observation: string }>;
  }>;
  correlations: Array<{
    trigger: string;
    effect: string;
    confidence: number;
    evidence: string[];
  }>;
  insights: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Get all photos in date range
    const photos = await getPhotosByDateRange(
      userId,
      dateRange.start,
      dateRange.end
    );

    // Group photos by body area
    const photosByArea: { [key: string]: Photo[] } = {};
    photos.forEach((photo) => {
      const area = photo.bodyArea.preset;
      if (!photosByArea[area]) {
        photosByArea[area] = [];
      }
      photosByArea[area].push(photo);
    });

    // Prepare summary for each body area
    const areasSummary = Object.entries(photosByArea).map(([area, areaPhotos]) => ({
      bodyArea: area,
      photoCount: areaPhotos.length,
      dateRange: {
        start: Math.min(...areaPhotos.map((p) => p.date.toMillis())),
        end: Math.max(...areaPhotos.map((p) => p.date.toMillis())),
      },
      userGoals: areaPhotos
        .map((p) => p.userGoals)
        .filter(Boolean)
        .slice(0, 3),
    }));

    const prompt = `You are a medical data analyst identifying health patterns from photo tracking data.

Analyze this summary of health tracking photos from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}:

${JSON.stringify(areasSummary, null, 2)}

Identify:
1. Patterns in each body area (improving, worsening, cyclical, stable)
2. Correlations between different symptoms or body areas
3. Key insights and observations

Format as JSON:
{
  "patterns": [
    {
      "type": "improvement|worsening|cyclical|stable",
      "bodyArea": "Face - Front",
      "description": "Description of pattern",
      "strength": 85,
      "observations": ["observation 1", "observation 2"]
    }
  ],
  "correlations": [
    {
      "trigger": "What triggers the pattern",
      "effect": "What effect is observed",
      "confidence": 75,
      "evidence": ["evidence 1", "evidence 2"]
    }
  ],
  "insights": ["insight 1", "insight 2"]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Convert observations to timeline format
      const patterns = parsed.patterns.map((pattern: any) => {
        const areaPhotos = photosByArea[pattern.bodyArea] || [];
        const timeline = pattern.observations.map((obs: string, index: number) => ({
          date: areaPhotos[Math.floor((index / pattern.observations.length) * areaPhotos.length)]?.date.toDate() || dateRange.start,
          observation: obs,
        }));

        return {
          ...pattern,
          timeline,
        };
      });

      return {
        patterns,
        correlations: parsed.correlations,
        insights: parsed.insights,
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error detecting health patterns:', error);
    throw error;
  }
}

/**
 * Compare progression across multiple body areas
 */
export async function compareBodyAreas(
  userId: string,
  bodyAreas: string[],
  dateRange: { start: Date; end: Date }
): Promise<{
  comparisons: Array<{
    bodyArea: string;
    trend: 'improving' | 'stable' | 'worsening';
    changeRate: number; // -100 to 100
    summary: string;
  }>;
  relatedAreas: Array<{
    areas: [string, string];
    relationship: string;
    confidence: number;
  }>;
  priorityRecommendations: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Get photos for each body area
    const areaData = await Promise.all(
      bodyAreas.map(async (area) => {
        const photos = await getPhotosByBodyArea(userId, area);
        const photosInRange = photos.filter(
          (p) =>
            p.date.toMillis() >= dateRange.start.getTime() &&
            p.date.toMillis() <= dateRange.end.getTime()
        );

        return {
          bodyArea: area,
          photoCount: photosInRange.length,
          firstPhoto: photosInRange[0]?.date.toDate(),
          lastPhoto: photosInRange[photosInRange.length - 1]?.date.toDate(),
          userGoals: photosInRange.map((p) => p.userGoals).filter(Boolean),
        };
      })
    );

    const prompt = `You are a medical analyst comparing health progression across different body areas.

Compare these body areas from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}:

${JSON.stringify(areaData, null, 2)}

Provide:
1. For each body area:
   - Trend assessment (improving/stable/worsening)
   - Change rate (-100 to 100, negative = worsening)
   - Brief summary

2. Relationships between areas:
   - Which areas might be related?
   - What connections do you see?

3. Priority recommendations:
   - Which area needs most attention?
   - What should be prioritized?

Format as JSON:
{
  "comparisons": [
    {
      "bodyArea": "Face - Front",
      "trend": "improving",
      "changeRate": 45,
      "summary": "Summary of changes"
    }
  ],
  "relatedAreas": [
    {
      "areas": ["Face - Front", "Face - Left"],
      "relationship": "Description of relationship",
      "confidence": 80
    }
  ],
  "priorityRecommendations": ["recommendation 1", "recommendation 2"]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error comparing body areas:', error);
    throw error;
  }
}

/**
 * Generate a comprehensive progress report
 */
export async function generateProgressReport(
  userId: string,
  dateRange: { start: Date; end: Date }
): Promise<{
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  nextSteps: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Get all data for the date range
    const photos = await getPhotosByDateRange(
      userId,
      dateRange.start,
      dateRange.end
    );

    const photosByArea: { [key: string]: number } = {};
    photos.forEach((photo) => {
      photosByArea[photo.bodyArea.preset] =
        (photosByArea[photo.bodyArea.preset] || 0) + 1;
    });

    const prompt = `You are a medical assistant creating a comprehensive progress report.

Patient has tracked their health from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}.

Data Summary:
- Total photos: ${photos.length}
- Body areas tracked: ${JSON.stringify(photosByArea)}
- Tracking duration: ${Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    )} days

Create a professional progress report including:
1. Executive summary (2-3 paragraphs)
2. Key findings (bullet points)
3. Recommendations for continued care
4. Next steps for the patient

Write in a professional medical tone suitable for sharing with a healthcare provider.

Format as JSON:
{
  "summary": "Executive summary text",
  "keyFindings": ["finding 1", "finding 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "nextSteps": ["step 1", "step 2"]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error generating progress report:', error);
    throw error;
  }
}
