'use client';

import { useState } from 'react';
import { BODY_AREAS } from '@/lib/utils/constants';

interface BodyAreaSelectorProps {
  onSelect: (area: string, customDescription?: string) => void;
  onCancel: () => void;
}

export default function BodyAreaSelector({ onSelect, onCancel }: BodyAreaSelectorProps) {
  const [selectedArea, setSelectedArea] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

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

    onSelect(selectedArea, customDescription);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-primary mb-2">
        Select Body Area
      </h2>
      <p className="text-text-secondary mb-6">
        Choose the area of your body you want to track
      </p>

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
          Continue to Camera
        </button>
      </div>
    </div>
  );
}
