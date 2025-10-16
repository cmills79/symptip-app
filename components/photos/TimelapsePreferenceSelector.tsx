'use client';

import { useState } from 'react';
import { TimelapsePreference } from '@/types';

interface TimelapsePreferenceSelectorProps {
  bodyArea: string;
  onSelect: (preference: TimelapsePreference | null) => void;
  onCancel: () => void;
}

const durationOptions = [
  { value: '7days', label: '7 Days', description: 'One week progression' },
  { value: '14days', label: '14 Days', description: 'Two week progression' },
  { value: '30days', label: '30 Days', description: 'One month progression' },
  { value: '90days', label: '90 Days', description: 'Three month progression' },
  { value: '180days', label: '180 Days', description: 'Six month progression' },
  { value: '1year', label: '1 Year', description: 'Full year progression' },
] as const;

export default function TimelapsePreferenceSelector({
  bodyArea,
  onSelect,
  onCancel,
}: TimelapsePreferenceSelectorProps) {
  const [selectedDuration, setSelectedDuration] = useState<TimelapsePreference['duration'] | null>(null);

  const handleSelect = (duration: TimelapsePreference['duration']) => {
    setSelectedDuration(duration);
  };

  const handleContinue = () => {
    if (selectedDuration) {
      onSelect({
        enabled: true,
        duration: selectedDuration,
        fps: 2, // Default FPS
      });
    }
  };

  const handleSkip = () => {
    onSelect(null);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-primary mb-2">
        Time-lapse Video Preference
      </h2>
      <p className="text-text-secondary mb-2">
        Select the duration for your time-lapse video of: <span className="font-medium text-primary">{bodyArea}</span>
      </p>
      <p className="text-sm text-text-secondary mb-6">
        This will help you visualize changes over time. You can create the time-lapse video later from your photo gallery.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {durationOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedDuration === option.value
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-primary/30 hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <svg
                className={`w-12 h-12 mb-3 ${
                  selectedDuration === option.value ? 'text-primary' : 'text-text-secondary'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <h3 className={`text-lg font-bold mb-1 ${
                selectedDuration === option.value ? 'text-primary' : 'text-text-primary'
              }`}>
                {option.label}
              </h3>
              <p className="text-sm text-text-secondary">{option.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-background-paper p-4 rounded-lg border border-primary/20 mb-6">
        <h3 className="font-medium text-text-primary mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About Time-lapse Videos
        </h3>
        <p className="text-sm text-text-secondary">
          Time-lapse videos help you see subtle changes that might be hard to notice day-to-day.
          Your selection will make it easy to create a video later showing your progress over the chosen time period.
        </p>
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
            onClick={handleSkip}
            className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedDuration}
            className="px-8 py-3 bg-accent text-background-paper rounded-lg hover:bg-accent-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
