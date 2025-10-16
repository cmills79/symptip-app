'use client';

import { useState } from 'react';

interface AIAnalysisResultsProps {
  analysis: {
    detectedChanges: string[];
    questions: string[];
    confidence: number;
    improvement?: boolean;
  };
  onAnswerQuestion?: (question: string, answer: string) => void;
}

export default function AIAnalysisResults({
  analysis,
  onAnswerQuestion,
}: AIAnalysisResultsProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleAnswerSubmit = (index: number, question: string) => {
    const answer = answers.get(index);
    if (answer && onAnswerQuestion) {
      onAnswerQuestion(question, answer);
      // Clear the answer after submitting
      const newAnswers = new Map(answers);
      newAnswers.delete(index);
      setAnswers(newAnswers);
      toggleQuestion(index);
    }
  };

  const confidenceColor =
    analysis.confidence >= 80
      ? 'text-green-600'
      : analysis.confidence >= 60
      ? 'text-yellow-600'
      : 'text-orange-600';

  return (
    <div className="space-y-4">
      {/* Confidence Score */}
      <div className="bg-background-paper p-4 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">
            AI Confidence
          </span>
          <span className={`text-2xl font-bold ${confidenceColor}`}>
            {analysis.confidence}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              analysis.confidence >= 80
                ? 'bg-green-500'
                : analysis.confidence >= 60
                ? 'bg-yellow-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${analysis.confidence}%` }}
          />
        </div>
      </div>

      {/* Improvement Indicator */}
      {analysis.improvement !== undefined && (
        <div
          className={`p-4 rounded-lg border ${
            analysis.improvement
              ? 'bg-green-50 border-green-200'
              : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {analysis.improvement ? (
              <>
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium text-green-800">
                  Improvement Detected
                </span>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="font-medium text-orange-800">
                  Changes Detected - Monitor Closely
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Detected Changes */}
      <div className="bg-background-paper p-4 rounded-lg border border-primary/20">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          AI Observations
        </h3>
        {analysis.detectedChanges.length === 0 ? (
          <p className="text-sm text-text-secondary italic">
            No significant changes detected
          </p>
        ) : (
          <ul className="space-y-2">
            {analysis.detectedChanges.map((change, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-text-primary"
              >
                <span className="text-primary mt-1">•</span>
                <span>{change}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Follow-up Questions */}
      {analysis.questions.length > 0 && (
        <div className="bg-background-paper p-4 rounded-lg border border-primary/20">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Follow-up Questions
          </h3>
          <div className="space-y-3">
            {analysis.questions.map((question, index) => (
              <div
                key={index}
                className="border border-accent/30 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-accent/5 transition-colors"
                >
                  <span className="text-sm font-medium text-text-primary">
                    {question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-accent transition-transform ${
                      expandedQuestions.has(index) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {expandedQuestions.has(index) && (
                  <div className="px-4 pb-4 pt-2">
                    <textarea
                      value={answers.get(index) || ''}
                      onChange={(e) => {
                        const newAnswers = new Map(answers);
                        newAnswers.set(index, e.target.value);
                        setAnswers(newAnswers);
                      }}
                      placeholder="Type your answer here..."
                      rows={3}
                      className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                    />
                    <button
                      onClick={() => handleAnswerSubmit(index, question)}
                      disabled={!answers.get(index)}
                      className="mt-2 px-4 py-2 bg-accent text-background-paper rounded-lg hover:bg-accent-dark transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Answer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
