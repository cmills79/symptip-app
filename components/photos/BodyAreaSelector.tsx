'use client';

import { useState } from 'react';
import { BODY_AREAS } from '@/lib/utils/constants';

interface BodyAreaSelectorProps {
  onSelect: (area: string, customDescription?: string, mediaType?: 'photo' | 'video') => void;
  onCancel: () => void;
}

export default function BodyAreaSelector({ onSelect, onCancel }: BodyAreaSelectorProps) {
  const [selectedArea, setSelectedArea] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

  const handleAreaChange = (value: string) => {
    setSelectedArea(value);
    setShowCustomInput(value === 'Custom');
  };

  const handleContinue = () => {
    if (!selectedArea) return;

    if (selectedArea === 'Custom' && !customDescription.trim()) {
      alert('Please enter a custom body area description');
      return;
    }

    onSelect(selectedArea, customDescription, mediaType);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-primary mb-2">
        Select Body Area
      </h2>
      <p className="text-text-secondary mb-6">
        Choose the area of your body you want to track
      </p>

      {/* Media Type Toggle */}
      <div className="mb-6 bg-background-paper p-4 rounded-lg border border-primary/20">
        <label className="block text-sm font-medium text-text-primary mb-3">
          Documentation Type
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMediaType('photo')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              mediaType === 'photo'
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-primary/20 text-text-secondary hover:border-primary/40'
            }`}
          >
            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">Photo</span>
              <span className="text-xs opacity-75">Static image</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMediaType('video')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              mediaType === 'video'
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-primary/20 text-text-secondary hover:border-primary/40'
            }`}
          >
            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Video</span>
              <span className="text-xs opacity-75">Movement tracking</span>
            </div>
          </button>
        </div>
        {mediaType === 'video' && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Video Documentation:</strong> Use for tracking movements, fiber-like structures, subcutaneous activity, or dynamic symptoms.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {BODY_AREAS.map((area) => (
          <button
            key={area.value}
            onClick={() => handleAreaChange(area.value)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedArea === area.value
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-primary/20 hover:border-primary/40 hover:bg-primary/5'
            }`}
          >
            <div className="font-medium text-text-primary">{area.label}</div>
          </button>
        ))}
      </div>

      {showCustomInput && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Custom Body Area Description
          </label>
          <input
            type="text"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="e.g., Rash on left forearm, 2 inches from wrist"
            className="w-full px-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-primary/20">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-primary/30 text-text-primary rounded-lg hover:bg-primary/5 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedArea || (selectedArea === 'Custom' && !customDescription.trim())}
          className="px-6 py-3 bg-primary text-background-paper rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to {mediaType === 'video' ? 'Video Recording' : 'Camera'}
        </button>
      </div>
    </div>
  );
}
