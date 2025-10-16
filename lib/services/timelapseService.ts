import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Photo } from '@/types';
import { getPhotosByBodyArea } from './photoService';

export interface TimelapseVideo {
  id: string;
  userId: string;
  bodyArea: string;
  title: string;
  date: Date;
  url: string;
  thumbnail: string;
  photoCount: number;
  duration: number; // seconds
  fps: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface TimelapseConfig {
  fps: number; // frames per second (1-30)
  transition?: 'none' | 'fade' | 'crossfade';
  quality?: 'low' | 'medium' | 'high';
  watermark?: boolean;
}

let ffmpegInstance: FFmpeg | null = null;

/**
 * Initialize FFmpeg.wasm
 */
async function initFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();

  // Load FFmpeg core
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

/**
 * Generate time-lapse video from photos
 */
export async function generateTimelapse(
  userId: string,
  bodyArea: string,
  config: TimelapseConfig = { fps: 2 },
  onProgress?: (progress: number) => void
): Promise<{ videoBlob: Blob; duration: number; photoCount: number }> {
  try {
    // Fetch photos for the body area
    const photos = await getPhotosByBodyArea(userId, bodyArea);

    if (photos.length < 2) {
      throw new Error('Need at least 2 photos to create a time-lapse');
    }

    // Sort by date ascending
    photos.sort((a, b) => a.date.toMillis() - b.date.toMillis());

    // Initialize FFmpeg
    onProgress?.(5);
    const ffmpeg = await initFFmpeg();

    // Download all photos
    onProgress?.(10);
    const photoFiles = await Promise.all(
      photos.map(async (photo, index) => {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const filename = `image${String(index).padStart(4, '0')}.jpg`;
        await ffmpeg.writeFile(filename, await fetchFile(blob));
        return filename;
      })
    );

    onProgress?.(50);

    // Set up quality settings
    const qualitySettings = {
      low: { crf: 28, preset: 'veryfast' },
      medium: { crf: 23, preset: 'medium' },
      high: { crf: 18, preset: 'slow' },
    };
    const quality = qualitySettings[config.quality || 'medium'];

    // Generate video with FFmpeg
    const outputFilename = 'output.mp4';
    await ffmpeg.exec([
      '-framerate', config.fps.toString(),
      '-pattern_type', 'glob',
      '-i', 'image*.jpg',
      '-c:v', 'libx264',
      '-preset', quality.preset,
      '-crf', quality.crf.toString(),
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
      outputFilename,
    ]);

    onProgress?.(90);

    // Read the output video
    const data = await ffmpeg.readFile(outputFilename);
    const videoBlob = new Blob([data], { type: 'video/mp4' });

    // Calculate duration
    const duration = photos.length / config.fps;

    // Clean up FFmpeg files
    for (const filename of photoFiles) {
      await ffmpeg.deleteFile(filename);
    }
    await ffmpeg.deleteFile(outputFilename);

    onProgress?.(100);

    return {
      videoBlob,
      duration,
      photoCount: photos.length,
    };
  } catch (error) {
    console.error('Error generating time-lapse:', error);
    throw new Error('Failed to generate time-lapse video');
  }
}

/**
 * Upload time-lapse video to Firebase Storage
 */
export async function uploadTimelapse(
  userId: string,
  bodyArea: string,
  title: string,
  videoBlob: Blob,
  photos: Photo[],
  config: TimelapseConfig
): Promise<TimelapseVideo> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${userId}/${bodyArea}/${timestamp}_timelapse`;

    // Upload video
    const videoRef = ref(storage, `timelapses/${filename}.mp4`);
    await uploadBytes(videoRef, videoBlob);
    const videoUrl = await getDownloadURL(videoRef);

    // Create thumbnail from first photo
    const thumbnailUrl = photos[0]?.thumbnail || photos[0]?.url;

    // Calculate date range
    const dates = photos.map(p => p.date.toMillis());
    const startDate = new Date(Math.min(...dates));
    const endDate = new Date(Math.max(...dates));

    // Save to Firestore
    const videoData = {
      userId,
      bodyArea,
      title,
      date: Timestamp.now(),
      url: videoUrl,
      thumbnail: thumbnailUrl,
      photoCount: photos.length,
      duration: photos.length / config.fps,
      fps: config.fps,
      dateRange: {
        start: Timestamp.fromDate(startDate),
        end: Timestamp.fromDate(endDate),
      },
    };

    const docRef = await addDoc(collection(db, 'timelapse-videos'), videoData);

    return {
      id: docRef.id,
      ...videoData,
      date: videoData.date.toDate(),
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  } catch (error) {
    console.error('Error uploading time-lapse:', error);
    throw new Error('Failed to upload time-lapse video');
  }
}

/**
 * Get user's time-lapse videos
 */
export async function getUserTimelapses(userId: string): Promise<TimelapseVideo[]> {
  try {
    const timelapsesQuery = query(
      collection(db, 'timelapse-videos'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(timelapsesQuery);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        dateRange: {
          start: data.dateRange.start.toDate(),
          end: data.dateRange.end.toDate(),
        },
      };
    }) as TimelapseVideo[];
  } catch (error) {
    console.error('Error fetching time-lapses:', error);
    throw new Error('Failed to fetch time-lapses');
  }
}

/**
 * Delete time-lapse video
 */
export async function deleteTimelapse(timelapseId: string, timelapse: TimelapseVideo): Promise<void> {
  try {
    // Extract file path from URL
    const videoPath = decodeURIComponent(timelapse.url.split('/o/')[1]?.split('?')[0]);

    // Delete from Storage
    if (videoPath) {
      const videoRef = ref(storage, videoPath);
      await deleteObject(videoRef);
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'timelapse-videos', timelapseId));
  } catch (error) {
    console.error('Error deleting time-lapse:', error);
    throw new Error('Failed to delete time-lapse');
  }
}
