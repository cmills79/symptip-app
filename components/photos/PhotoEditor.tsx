'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ANNOTATION_COLORS } from '@/lib/utils/constants';
import { Annotation } from '@/types';
import { generateId } from '@/lib/utils/helpers';
import { uploadPhoto } from '@/lib/services/photoService';
import { analyzeSinglePhoto } from '@/lib/services/aiAnalysisService';
import AIAnalysisResults from '@/components/ai/AIAnalysisResults';

interface PhotoEditorProps {
  photoDataUrl: string;
  bodyArea: string;
  customBodyArea?: string;
  onCancel: () => void;
  onContinue?: (data: {
    photoDataUrl: string;
    annotations: Annotation[];
    userGoals: string;
    aiAnalysis?: any;
  }) => void;
}

type Tool = 'none' | 'circle' | 'arrow';

export default function PhotoEditor({
  photoDataUrl,
  bodyArea,
  customBodyArea,
  onCancel,
  onContinue,
}: PhotoEditorProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>('none');
  const [selectedColor, setSelectedColor] = useState(ANNOTATION_COLORS[0]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [userGoals, setUserGoals] = useState('');
  const [saving, setSaving] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    detectedChanges: string[];
    questions: string[];
    confidence: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      redrawCanvas();
    };
    img.src = photoDataUrl;
  }, [photoDataUrl]);

  useEffect(() => {
    redrawCanvas();
  }, [annotations]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Draw all annotations
      annotations.forEach((annotation) => {
        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = 3;

        if (annotation.type === 'circle') {
          const { x, y, width, height } = annotation.coordinates;
          ctx.beginPath();
          ctx.ellipse(
            x + (width || 0) / 2,
            y + (height || 0) / 2,
            Math.abs((width || 0) / 2),
            Math.abs((height || 0) / 2),
            0,
            0,
            2 * Math.PI
          );
          ctx.stroke();
        } else if (annotation.type === 'arrow') {
          const { x, y, width, height } = annotation.coordinates;
          const endX = x + (width || 0);
          const endY = y + (height || 0);

          // Draw line
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Draw arrowhead
          const angle = Math.atan2(height || 0, width || 0);
          const headLength = 15;
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headLength * Math.cos(angle - Math.PI / 6),
            endY - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headLength * Math.cos(angle + Math.PI / 6),
            endY - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
      });
    };
    img.src = photoDataUrl;
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'none') return;

    const pos = getCanvasCoordinates(e);
    setStartPos(pos);
    setIsDrawing(true);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === 'none') return;

    const endPos = getCanvasCoordinates(e);
    const width = endPos.x - startPos.x;
    const height = endPos.y - startPos.y;

    const newAnnotation: Annotation = {
      id: generateId(),
      type: activeTool,
      coordinates: {
        x: startPos.x,
        y: startPos.y,
        width,
        height,
      },
      color: selectedColor,
    };

    setAnnotations([...annotations, newAnnotation]);
    setIsDrawing(false);
  };

  const undoAnnotation = () => {
    if (annotations.length > 0) {
      setAnnotations(annotations.slice(0, -1));
    }
  };

  const clearAnnotations = () => {
    setAnnotations([]);
  };

  const handleAnalyzeAI = async () => {
    setAnalyzingAI(true);
    try {
      const analysis = await analyzeSinglePhoto(
        photoDataUrl,
        bodyArea,
        userGoals
      );
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing photo with AI:', error);
      alert('Failed to analyze photo. Please try again.');
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleSave = async () => {
    // If onContinue is provided, pass data to parent instead of uploading
    if (onContinue) {
      onContinue({
        photoDataUrl,
        annotations,
        userGoals,
        aiAnalysis,
      });
      return;
    }

    // Otherwise, upload directly (legacy behavior for standalone use)
    setSaving(true);
    try {
      // Get authenticated user from auth module
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert('Please sign in to save photos');
        router.push('/login');
        return;
      }

      const bodyAreaData = {
        preset: bodyArea as any,
        customDescription: customBodyArea,
        isPoseReference: false,
      };

      await uploadPhoto({
        photoDataUrl,
        userId: currentUser.uid,
        bodyArea: bodyAreaData,
        annotations,
        userGoals,
      });

      router.push('/photos');
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Failed to save photo. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-primary mb-2">
        Edit & Annotate Photo
      </h2>
      <p className="text-text-secondary mb-6">
        Circle or highlight areas of concern on your photo
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="md:col-span-2">
          <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className="w-full h-auto cursor-crosshair"
            />
          </div>

          {/* Tools */}
          <div className="bg-background-paper p-4 rounded-lg border border-primary/20">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-text-primary">Tools:</span>
              <button
                onClick={() => setActiveTool('circle')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTool === 'circle'
                    ? 'bg-primary text-background-paper'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                Circle
              </button>
              <button
                onClick={() => setActiveTool('arrow')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTool === 'arrow'
                    ? 'bg-primary text-background-paper'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                Arrow
              </button>
              <button
                onClick={() => setActiveTool('none')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTool === 'none'
                    ? 'bg-primary text-background-paper'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                Select
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-text-primary">Color:</span>
              <div className="flex gap-2">
                {ANNOTATION_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-text-primary scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={undoAnnotation}
                  disabled={annotations.length === 0}
                  className="px-3 py-1 text-sm border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  Undo
                </button>
                <button
                  onClick={clearAnnotations}
                  disabled={annotations.length === 0}
                  className="px-3 py-1 text-sm border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="space-y-4">
          <div className="bg-background-paper p-4 rounded-lg border border-primary/20">
            <h3 className="font-medium text-text-primary mb-2">Body Area</h3>
            <p className="text-sm text-text-secondary">
              {bodyArea}
              {customBodyArea && `: ${customBodyArea}`}
            </p>
          </div>

          <div className="bg-background-paper p-4 rounded-lg border border-primary/20">
            <label className="block text-sm font-medium text-text-primary mb-2">
              What results are you hoping to see?
            </label>
            <textarea
              value={userGoals}
              onChange={(e) => setUserGoals(e.target.value)}
              placeholder="e.g., Hoping to see redness reduced, less swelling..."
              rows={3}
              className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div className="bg-background-paper p-4 rounded-lg border border-primary/20">
            <h3 className="font-medium text-text-primary mb-2">Annotations</h3>
            <p className="text-sm text-text-secondary">
              {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} added
            </p>
          </div>

          <div className="bg-background-paper p-4 rounded-lg border border-primary/20">
            <button
              onClick={handleAnalyzeAI}
              disabled={analyzingAI}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {analyzingAI ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Analyze with AI
                </>
              )}
            </button>
            <p className="text-xs text-text-secondary mt-2 text-center">
              Get AI-powered insights about visible changes
            </p>
          </div>
        </div>
      </div>

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <div className="mt-6 pt-6 border-t border-primary/20">
          <h3 className="text-xl font-bold text-primary mb-4">AI Analysis Results</h3>
          <AIAnalysisResults analysis={aiAnalysis} />
        </div>
      )}

      <div className="flex justify-between pt-6 mt-6 border-t border-primary/20">
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-accent text-background-paper rounded-lg hover:bg-accent-dark transition-colors font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : (onContinue ? 'Continue' : 'Save Photo')}
        </button>
      </div>
    </div>
  );
}
