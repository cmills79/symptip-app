'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserPhotos } from '@/lib/services/photoService';
import {
  generateTimelapse,
  uploadTimelapse,
  getUserTimelapses,
  deleteTimelapse,
  TimelapseVideo,
  TimelapseConfig
} from '@/lib/services/timelapseService';
import { Photo } from '@/types';

export default function TimelapsePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [timelapses, setTimelapses] = useState<TimelapseVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Configuration state
  const [selectedBodyArea, setSelectedBodyArea] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [fps, setFps] = useState(2);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');

  // Video player state
  const [selectedVideo, setSelectedVideo] = useState<TimelapseVideo | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;

      if (currentUser) {
        const [userPhotos, userTimelapses] = await Promise.all([
          getUserPhotos(currentUser.uid),
          getUserTimelapses(currentUser.uid),
        ]);
        setPhotos(userPhotos);
        setTimelapses(userTimelapses);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Get unique body areas from photos
  const bodyAreas = Array.from(new Set(photos.map(p => p.bodyArea.preset)));

  // Get photo count for selected body area
  const selectedAreaPhotoCount = photos.filter(
    p => p.bodyArea.preset === selectedBodyArea
  ).length;

  const handleGenerateTimelapse = async () => {
    if (!selectedBodyArea) {
      alert('Please select a body area');
      return;
    }

    if (selectedAreaPhotoCount < 2) {
      alert('Need at least 2 photos to create a time-lapse');
      return;
    }

    if (!videoTitle.trim()) {
      alert('Please enter a title for your time-lapse');
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const config: TimelapseConfig = { fps, quality };

      // Generate video
      const { videoBlob, duration, photoCount } = await generateTimelapse(
        currentUser.uid,
        selectedBodyArea,
        config,
        setProgress
      );

      // Upload to Firebase
      const areaPhotos = photos.filter(p => p.bodyArea.preset === selectedBodyArea);
      const timelapse = await uploadTimelapse(
        currentUser.uid,
        selectedBodyArea,
        videoTitle,
        videoBlob,
        areaPhotos,
        config
      );

      // Add to list
      setTimelapses([timelapse, ...timelapses]);

      // Reset form
      setVideoTitle('');
      setSelectedBodyArea('');
      setFps(2);
      setQuality('medium');

      alert('Time-lapse created successfully!');
    } catch (error) {
      console.error('Error generating time-lapse:', error);
      alert('Failed to generate time-lapse. Please try again.');
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  const handleDelete = async (timelapse: TimelapseVideo) => {
    if (!confirm(`Are you sure you want to delete "${timelapse.title}"?`)) {
      return;
    }

    setDeleting(timelapse.id);
    try {
      await deleteTimelapse(timelapse.id, timelapse);
      setTimelapses(timelapses.filter(t => t.id !== timelapse.id));
      if (selectedVideo?.id === timelapse.id) {
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error('Error deleting time-lapse:', error);
      alert('Failed to delete time-lapse. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-background-paper p-12 rounded-lg shadow-md border border-primary/20 text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Time-Lapse Videos
          </h1>
          <p className="text-text-secondary">
            Create videos from your photo timeline to visualize changes over time
          </p>
        </div>

        {/* Create Time-Lapse Section */}
        <div className="bg-background-paper p-6 rounded-lg shadow-md border border-primary/20 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Create Time-Lapse
          </h2>

          {photos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary mb-4">
                You need photos to create a time-lapse
              </p>
              <Link
                href="/photos/capture"
                className="inline-block px-6 py-3 bg-primary text-background-paper rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Take Your First Photo
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Title */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g., Face Progress - January 2024"
                  className="w-full px-4 py-2 bg-background-default border border-primary/30 rounded-lg focus:outline-none focus:border-primary text-text-primary"
                  disabled={generating}
                />
              </div>

              {/* Body Area Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Body Area
                </label>
                <select
                  value={selectedBodyArea}
                  onChange={(e) => setSelectedBodyArea(e.target.value)}
                  className="w-full px-4 py-2 bg-background-default border border-primary/30 rounded-lg focus:outline-none focus:border-primary text-text-primary"
                  disabled={generating}
                >
                  <option value="">Select a body area</option>
                  {bodyAreas.map((area) => {
                    const count = photos.filter(p => p.bodyArea.preset === area).length;
                    return (
                      <option key={area} value={area}>
                        {area} ({count} photos)
                      </option>
                    );
                  })}
                </select>
                {selectedBodyArea && selectedAreaPhotoCount < 2 && (
                  <p className="text-sm text-red-500 mt-1">
                    Need at least 2 photos to create a time-lapse
                  </p>
                )}
              </div>

              {/* FPS Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Speed (FPS): {fps}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="w-full"
                  disabled={generating}
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                  <span>Slower (1 FPS)</span>
                  <span>Faster (10 FPS)</span>
                </div>
                {selectedBodyArea && (
                  <p className="text-sm text-text-secondary mt-2">
                    Estimated duration: {formatDuration(selectedAreaPhotoCount / fps)}
                  </p>
                )}
              </div>

              {/* Quality Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Quality
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      disabled={generating}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        quality === q
                          ? 'bg-primary text-background-paper border-primary'
                          : 'bg-background-default text-text-primary border-primary/30 hover:border-primary'
                      } disabled:opacity-50`}
                    >
                      {q.charAt(0).toUpperCase() + q.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateTimelapse}
                disabled={generating || !selectedBodyArea || selectedAreaPhotoCount < 2 || !videoTitle.trim()}
                className="w-full px-6 py-3 bg-accent text-background-paper rounded-lg hover:bg-accent-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating... {progress}%
                  </span>
                ) : (
                  'Generate Time-Lapse'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Existing Time-Lapses */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Your Time-Lapses
          </h2>

          {timelapses.length === 0 ? (
            <div className="bg-background-paper p-12 rounded-lg shadow-md border border-primary/20 text-center">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-primary/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                No time-lapses yet
              </h3>
              <p className="text-text-secondary">
                Create your first time-lapse video from your photos above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {timelapses.map((timelapse) => (
                <div
                  key={timelapse.id}
                  className="bg-background-paper rounded-lg shadow-md border border-primary/20 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video bg-gray-100 cursor-pointer" onClick={() => setSelectedVideo(timelapse)}>
                    <img
                      src={timelapse.thumbnail}
                      alt={timelapse.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(timelapse);
                      }}
                      disabled={deleting === timelapse.id}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 shadow-lg"
                      title="Delete video"
                    >
                      {deleting === timelapse.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-text-primary mb-1">
                      {timelapse.title}
                    </h3>
                    <p className="text-sm text-text-secondary mb-2">
                      {timelapse.bodyArea}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span>{timelapse.photoCount} photos</span>
                      <span>{formatDuration(timelapse.duration)}</span>
                      <span>{timelapse.fps} FPS</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-2">
                      {formatDate(timelapse.dateRange.start)} - {formatDate(timelapse.dateRange.end)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedVideo(null)}
          >
            <div
              className="bg-background-paper rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-primary/20 flex justify-between items-center">
                <h3 className="text-xl font-bold text-text-primary">
                  {selectedVideo.title}
                </h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 hover:bg-background-default rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <video
                  src={selectedVideo.url}
                  controls
                  autoPlay
                  className="w-full rounded-lg"
                />
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary">Body Area</p>
                    <p className="text-text-primary font-medium">{selectedVideo.bodyArea}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Duration</p>
                    <p className="text-text-primary font-medium">{formatDuration(selectedVideo.duration)}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Photos</p>
                    <p className="text-text-primary font-medium">{selectedVideo.photoCount}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Speed</p>
                    <p className="text-text-primary font-medium">{selectedVideo.fps} FPS</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-text-secondary">Date Range</p>
                    <p className="text-text-primary font-medium">
                      {formatDate(selectedVideo.dateRange.start)} - {formatDate(selectedVideo.dateRange.end)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
