'use client';

import { useState } from 'react';

interface AIFollowUpQuestionsProps {
  questions: string[];
  onComplete: (responses: string[]) => void;
  onCancel: () => void;
  onRegenerateQuestions: () => void;
}

export default function AIFollowUpQuestions({
  questions,
  onComplete,
  onCancel,
  onRegenerateQuestions,
}: AIFollowUpQuestionsProps) {
  const [responses, setResponses] = useState<string[]>(new Array(questions.length).fill(''));
  const [showValidation, setShowValidation] = useState(false);

  const handleResponseChange = (index: number, value: string) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);
    setShowValidation(false);
  };

  const handleSubmit = () => {
    // Check if at least some questions are answered
    const answeredCount = responses.filter(r => r.trim().length > 0).length;

    if (answeredCount === 0) {
      setShowValidation(true);
      return;
    }

    onComplete(responses);
  };

  const handleSkip = () => {
    // Allow skipping with confirmation
    if (window.confirm('Are you sure you want to skip the AI questions? This information helps improve analysis accuracy.')) {
      onComplete(new Array(questions.length).fill(''));
    }
  };

  const answeredCount = responses.filter(r => r.trim().length > 0).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">
          AI Follow-up Questions
        </h2>
        <p className="text-text-secondary mb-4">
          Our AI has analyzed your photo and symptom description. Please answer these follow-up questions to help us better understand your condition.
        </p>

        <div className="bg-background-paper p-4 rounded-lg border border-primary/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-text-primary">
              Progress: {answeredCount} of {questions.length} answered
            </span>
            <span className="text-sm text-text-secondary">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-6">
        {questions.map((question, index) => (
          <div
            key={index}
            className="bg-background-paper p-6 rounded-lg border border-primary/20"
          >
            <div className="flex items-start mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mr-3">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-text-primary mb-3">
                  {question}
                </h3>
                <textarea
                  value={responses[index]}
                  onChange={(e) => handleResponseChange(index, e.target.value)}
                  placeholder="Enter your answer... (optional)"
                  rows={3}
                  className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
                {responses[index].trim().length > 0 && (
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Answered
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showValidation && answeredCount === 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Please answer at least one question</p>
              <p className="text-sm">Your answers help improve the accuracy of our analysis. If you prefer, you can skip this step.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 mr-2 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Questions don't seem relevant?</span>
              {' '}You can regenerate them or skip to the next step.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-primary/20">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={onRegenerateQuestions}
            className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
          </button>
          <button
            onClick={handleSkip}
            className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-accent text-background-paper rounded-lg hover:bg-accent-dark transition-colors font-medium"
          >
            {answeredCount > 0 ? 'Complete & Save' : 'Save Without Answers'}
          </button>
        </div>
      </div>
    </div>
  );
}
