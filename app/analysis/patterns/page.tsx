'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  analyzePhotoTimeline,
  detectHealthPatterns,
  compareBodyAreas,
  generateProgressReport,
} from '@/lib/services/patternDetectionService';
import { getPhotosByDateRange } from '@/lib/services/photoService';
import { Photo } from '@/types';

type AnalysisMode = 'timeline' | 'patterns' | 'compare' | 'report';

export default function PatternsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<AnalysisMode>('patterns');
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [bodyAreas, setBodyAreas] = useState<string[]>([]);

  // Date range selection
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Timeline analysis
  const [selectedBodyArea, setSelectedBodyArea] = useState('');
  const [timelineResults, setTimelineResults] = useState<any>(null);

  // Pattern detection
  const [patternResults, setPatternResults] = useState<any>(null);

  // Body area comparison
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [comparisonResults, setComparisonResults] = useState<any>(null);

  // Progress report
  const [reportResults, setReportResults] = useState<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Load photos and extract unique body areas
  useEffect(() => {
    if (!user) return;

    async function loadPhotos() {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const userPhotos = await getPhotosByDateRange(user!.uid, start, end);
        setPhotos(userPhotos);

        // Extract unique body areas
        const areas = Array.from(
          new Set(userPhotos.map((p) => p.bodyArea.preset))
        );
        setBodyAreas(areas);

        if (areas.length > 0 && !selectedBodyArea) {
          setSelectedBodyArea(areas[0]);
        }
      } catch (error) {
        console.error('Error loading photos:', error);
      }
    }

    loadPhotos();
  }, [user, startDate, endDate, selectedBodyArea]);

  const runTimelineAnalysis = async () => {
    if (!user || !selectedBodyArea) return;

    setLoading(true);
    try {
      const results = await analyzePhotoTimeline(
        user.uid,
        selectedBodyArea,
        new Date(startDate),
        new Date(endDate)
      );
      setTimelineResults(results);
    } catch (error: any) {
      console.error('Error analyzing timeline:', error);
      alert(error.message || 'Failed to analyze timeline');
    } finally {
      setLoading(false);
    }
  };

  const runPatternDetection = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const results = await detectHealthPatterns(user.uid, {
        start: new Date(startDate),
        end: new Date(endDate),
      });
      setPatternResults(results);
    } catch (error) {
      console.error('Error detecting patterns:', error);
      alert('Failed to detect patterns');
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async () => {
    if (!user || selectedAreas.length < 2) {
      alert('Please select at least 2 body areas to compare');
      return;
    }

    setLoading(true);
    try {
      const results = await compareBodyAreas(user.uid, selectedAreas, {
        start: new Date(startDate),
        end: new Date(endDate),
      });
      setComparisonResults(results);
    } catch (error) {
      console.error('Error comparing areas:', error);
      alert('Failed to compare body areas');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const results = await generateProgressReport(user.uid, {
        start: new Date(startDate),
        end: new Date(endDate),
      });
      setReportResults(results);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const toggleAreaSelection = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Pattern Detection & Analysis
          </h1>
          <p className="text-text-secondary">
            AI-powered insights across your health tracking timeline
          </p>
        </div>

        {/* Date Range Selection */}
        <div className="bg-background-paper p-6 rounded-lg shadow-md border border-primary/20 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Select Date Range
          </h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="text-sm text-text-secondary">
              {photos.length} photos found
            </div>
          </div>
        </div>

        {/* Analysis Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setMode('timeline')}
            className={`p-6 rounded-lg border-2 transition-all ${
              mode === 'timeline'
                ? 'border-primary bg-primary/10'
                : 'border-primary/20 hover:border-primary/40'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-semibold text-text-primary mb-1">
                Timeline Analysis
              </h3>
              <p className="text-xs text-text-secondary">
                Track changes for one body area over time
              </p>
            </div>
          </button>

          <button
            onClick={() => setMode('patterns')}
            className={`p-6 rounded-lg border-2 transition-all ${
              mode === 'patterns'
                ? 'border-primary bg-primary/10'
                : 'border-primary/20 hover:border-primary/40'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold text-text-primary mb-1">
                Pattern Detection
              </h3>
              <p className="text-xs text-text-secondary">
                Identify trends across all tracked areas
              </p>
            </div>
          </button>

          <button
            onClick={() => setMode('compare')}
            className={`p-6 rounded-lg border-2 transition-all ${
              mode === 'compare'
                ? 'border-primary bg-primary/10'
                : 'border-primary/20 hover:border-primary/40'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">⚖️</div>
              <h3 className="font-semibold text-text-primary mb-1">
                Compare Areas
              </h3>
              <p className="text-xs text-text-secondary">
                Compare progress across multiple body areas
              </p>
            </div>
          </button>

          <button
            onClick={() => setMode('report')}
            className={`p-6 rounded-lg border-2 transition-all ${
              mode === 'report'
                ? 'border-primary bg-primary/10'
                : 'border-primary/20 hover:border-primary/40'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📄</div>
              <h3 className="font-semibold text-text-primary mb-1">
                Progress Report
              </h3>
              <p className="text-xs text-text-secondary">
                Generate comprehensive medical report
              </p>
            </div>
          </button>
        </div>

        {/* Content based on selected mode */}
        <div className="bg-background-paper p-6 rounded-lg shadow-md border border-primary/20">
          {mode === 'timeline' && (
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">
                Timeline Analysis
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Select Body Area
                </label>
                <select
                  value={selectedBodyArea}
                  onChange={(e) => setSelectedBodyArea(e.target.value)}
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {bodyAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={runTimelineAnalysis}
                disabled={loading || !selectedBodyArea}
                className="px-6 py-3 bg-primary text-background-paper rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Analyze Timeline'}
              </button>

              {timelineResults && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                    <h3 className="font-semibold text-text-primary mb-2">
                      Overall Trend: {timelineResults.overallTrend.toUpperCase()}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Confidence: {timelineResults.confidence}%
                    </p>
                  </div>

                  {timelineResults.keyMilestones.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-text-primary mb-3">
                        Key Milestones
                      </h3>
                      {timelineResults.keyMilestones.map((milestone: any, index: number) => (
                        <div
                          key={index}
                          className="mb-3 p-4 border border-primary/20 rounded-lg"
                        >
                          <div className="font-medium text-text-primary">
                            {new Date(milestone.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-text-primary mt-1">
                            {milestone.description}
                          </div>
                          <div className="text-xs text-text-secondary mt-1">
                            {milestone.significance}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-text-primary mb-3">
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {timelineResults.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-accent mt-1">✓</span>
                          <span className="text-text-primary">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'patterns' && (
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">
                Pattern Detection
              </h2>
              <p className="text-text-secondary mb-6">
                Analyze patterns across all tracked body areas
              </p>
              <button
                onClick={runPatternDetection}
                disabled={loading || photos.length === 0}
                className="px-6 py-3 bg-primary text-background-paper rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Detecting Patterns...' : 'Detect Patterns'}
              </button>

              {patternResults && (
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                      Detected Patterns
                    </h3>
                    {patternResults.patterns.map((pattern: any, index: number) => (
                      <div
                        key={index}
                        className="mb-4 p-4 border border-primary/20 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-text-primary">
                            {pattern.bodyArea}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              pattern.type === 'improvement'
                                ? 'bg-green-100 text-green-800'
                                : pattern.type === 'worsening'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {pattern.type}
                          </span>
                        </div>
                        <p className="text-sm text-text-primary mb-2">
                          {pattern.description}
                        </p>
                        <div className="text-xs text-text-secondary">
                          Strength: {pattern.strength}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {patternResults.insights.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-4">
                        Key Insights
                      </h3>
                      <ul className="space-y-2">
                        {patternResults.insights.map((insight: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm p-3 bg-accent/5 rounded-lg"
                          >
                            <span className="text-accent mt-1">💡</span>
                            <span className="text-text-primary">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === 'compare' && (
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">
                Compare Body Areas
              </h2>
              <div className="mb-6">
                <p className="text-sm text-text-secondary mb-3">
                  Select at least 2 body areas to compare
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {bodyAreas.map((area) => (
                    <button
                      key={area}
                      onClick={() => toggleAreaSelection(area)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        selectedAreas.includes(area)
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-primary/20 text-text-primary hover:border-primary/40'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={runComparison}
                disabled={loading || selectedAreas.length < 2}
                className="px-6 py-3 bg-primary text-background-paper rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Comparing...' : `Compare ${selectedAreas.length} Areas`}
              </button>

              {comparisonResults && (
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                      Comparison Results
                    </h3>
                    {comparisonResults.comparisons.map((comp: any, index: number) => (
                      <div
                        key={index}
                        className="mb-4 p-4 border border-primary/20 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-text-primary">
                            {comp.bodyArea}
                          </h4>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-sm font-medium ${
                                comp.trend === 'improving'
                                  ? 'text-green-600'
                                  : comp.trend === 'worsening'
                                  ? 'text-red-600'
                                  : 'text-blue-600'
                              }`}
                            >
                              {comp.trend}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {comp.changeRate > 0 ? '+' : ''}
                              {comp.changeRate}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-text-primary">{comp.summary}</p>
                      </div>
                    ))}
                  </div>

                  {comparisonResults.priorityRecommendations.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-4">
                        Priority Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {comparisonResults.priorityRecommendations.map(
                          (rec: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm p-3 bg-accent/5 rounded-lg"
                            >
                              <span className="text-accent mt-1">⭐</span>
                              <span className="text-text-primary">{rec}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === 'report' && (
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">
                Progress Report
              </h2>
              <p className="text-text-secondary mb-6">
                Generate a comprehensive medical report for healthcare providers
              </p>
              <button
                onClick={generateReport}
                disabled={loading || photos.length === 0}
                className="px-6 py-3 bg-primary text-background-paper rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating Report...' : 'Generate Report'}
              </button>

              {reportResults && (
                <div className="mt-6 space-y-6">
                  <div className="p-6 bg-accent/5 border border-accent rounded-lg">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                      Executive Summary
                    </h3>
                    <p className="text-text-primary whitespace-pre-wrap">
                      {reportResults.summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                      Key Findings
                    </h3>
                    <ul className="space-y-2">
                      {reportResults.keyFindings.map((finding: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm p-3 border border-primary/20 rounded-lg"
                        >
                          <span className="text-primary mt-1">•</span>
                          <span className="text-text-primary">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {reportResults.recommendations.map((rec: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm p-3 bg-accent/5 rounded-lg"
                        >
                          <span className="text-accent mt-1">✓</span>
                          <span className="text-text-primary">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-4">
                      Next Steps
                    </h3>
                    <ul className="space-y-2">
                      {reportResults.nextSteps.map((step: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm p-3 border border-primary/20 rounded-lg"
                        >
                          <span className="text-primary mt-1 font-bold">
                            {index + 1}.
                          </span>
                          <span className="text-text-primary">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      const reportText = `
HEALTH TRACKING PROGRESS REPORT
${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
${reportResults.summary}

KEY FINDINGS
${reportResults.keyFindings.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

RECOMMENDATIONS
${reportResults.recommendations.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

NEXT STEPS
${reportResults.nextSteps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}
`;
                      navigator.clipboard.writeText(reportText);
                      alert('Report copied to clipboard!');
                    }}
                    className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
                  >
                    Copy Report to Clipboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
