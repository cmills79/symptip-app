'use client';

import { useState, useEffect } from 'react';

interface SymptomSubmissionFormProps {
  photoUrl: string;
  bodyArea: string;
  onSubmit: (description: string) => void;
  onCancel: () => void;
}

const MINIMUM_CHARS = 50;
const DRAFT_KEY = 'symptom_submission_draft';

export default function SymptomSubmissionForm({
  photoUrl,
  bodyArea,
  onSubmit,
  onCancel,
}: SymptomSubmissionFormProps) {
  const [description, setDescription] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      setDescription(draft);
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (description.length > 0) {
      const timer = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, description);
        setLastSaved(new Date());
      }, 2000); // Save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [description]);

  const handleSubmit = () => {
    if (description.trim().length < MINIMUM_CHARS) {
      setShowValidation(true);
      return;
    }

    // Clear draft
    localStorage.removeItem(DRAFT_KEY);
    onSubmit(description.trim());
  };

  const isValid = description.trim().length >= MINIMUM_CHARS;
  const charCount = description.length;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-primary mb-2">
        Describe Your Symptoms
      </h2>
      <p className="text-text-secondary mb-6">
        Please describe in detail your medical issues and symptoms related to: <span className="font-medium text-primary">{bodyArea}</span>
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Photo preview */}
        <div className="bg-background-paper p-4 rounded-lg border border-primary/20">
          <h3 className="font-medium text-text-primary mb-3">Your Photo</h3>
          <img
            src={photoUrl}
            alt="Captured photo"
            className="w-full rounded-lg"
          />
        </div>

        {/* Symptom form */}
        <div className="space-y-4">
          <div className="bg-background-paper p-4 rounded-lg border border-primary/20">
            <h3 className="font-medium text-text-primary mb-3">Helpful Prompts</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>What symptoms are you experiencing?</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>When did they start?</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>What makes them better or worse?</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Any pain, itching, burning, or other sensations?</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Have you noticed any patterns or triggers?</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>What have you tried to treat it?</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">Be as detailed as possible</p>
                <p className="text-xs text-yellow-700">
                  The more detail you provide, the better our AI can understand your condition and ask relevant follow-up questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setShowValidation(false);
          }}
          placeholder="Describe your symptoms in detail... The more information you provide, the better AI can help identify patterns and ask relevant questions."
          rows={8}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
            showValidation && !isValid
              ? 'border-red-500'
              : 'border-primary/30'
          }`}
        />

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-4">
            <span className={`text-sm ${
              charCount < MINIMUM_CHARS ? 'text-red-500' : 'text-green-600'
            }`}>
              {charCount} / {MINIMUM_CHARS} characters minimum
            </span>
            {lastSaved && (
              <span className="text-xs text-text-secondary">
                Draft saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {showValidation && !isValid && (
          <p className="text-sm text-red-500 mt-2">
            Please provide at least {MINIMUM_CHARS} characters to ensure AI can properly analyze your symptoms.
          </p>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-primary/20">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className={`px-8 py-3 bg-accent text-background-paper rounded-lg hover:bg-accent-dark transition-colors font-medium ${
            !isValid ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Continue to AI Questions
        </button>
      </div>
    </div>
  );
}
