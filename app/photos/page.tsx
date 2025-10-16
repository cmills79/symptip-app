'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getUserPhotos, deletePhoto } from '@/lib/services/photoService';
import { Photo } from '@/types';
import { formatDate } from '@/lib/utils/helpers';

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function loadPhotos() {
      try {
        const { auth } = await import('@/lib/firebase');
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userPhotos = await getUserPhotos(currentUser.uid);
          setPhotos(userPhotos);
        }
      } catch (error) {
        console.error('Error loading photos:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPhotos();
  }, []);

  const handleDelete = async (photo: Photo) => {
    if (!confirm(`Are you sure you want to delete this photo from ${photo.bodyArea.preset}?`)) {
      return;
    }

    setDeleting(photo.id);
    try {
      await deletePhoto(photo.id, photo);
      setPhotos(photos.filter((p) => p.id !== photo.id));
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              Photo Tracking
            </h1>
            <p className="text-text-secondary">
              Capture and track visual changes over time
            </p>
          </div>
          <Link
            href="/photos/capture"
            className="px-6 py-3 bg-accent text-background-paper rounded-lg hover:bg-accent-dark transition-colors font-medium"
          >
            Take Photo
          </Link>
        </div>

        {loading ? (
          <div className="bg-background-paper p-12 rounded-lg shadow-md border border-primary/20 text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading photos...</p>
            </div>
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-background-paper p-12 rounded-lg shadow-md border border-primary/20 text-center">
            <div className="max-w-md mx-auto">
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
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                No photos yet
              </h2>
              <p className="text-text-secondary mb-6">
                Start your health tracking journey by taking your first photo
              </p>
              <Link
                href="/photos/capture"
                className="inline-block px-6 py-3 bg-primary text-background-paper rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Take Your First Photo
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-background-paper rounded-lg shadow-md border border-primary/20 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  <Image
                    src={photo.thumbnail}
                    alt={`Photo of ${photo.bodyArea.preset}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => handleDelete(photo)}
                    disabled={deleting === photo.id}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 shadow-lg"
                    title="Delete photo"
                  >
                    {deleting === photo.id ? (
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
                    {photo.bodyArea.preset}
                  </h3>
                  <p className="text-sm text-text-secondary mb-2">
                    {formatDate(photo.date)}
                  </p>
                  {photo.annotations.length > 0 && (
                    <p className="text-xs text-primary">
                      {photo.annotations.length} annotation{photo.annotations.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
