import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { Video, BodyArea, VideoMetadata } from '@/types';
import { generateId } from '@/lib/utils/helpers';

interface UploadVideoParams {
  videoBlob: Blob;
  thumbnailDataUrl: string;
  userId: string;
  bodyArea: BodyArea;
  duration: number;
  userGoals?: string;
  symptomSubmission?: {
    description: string;
    aiQuestions: string[];
    aiResponses: string[];
    submittedAt: Timestamp;
  };
  keyFrames?: string[]; // Base64 data URLs of extracted frames
}

export async function uploadVideo({
  videoBlob,
  thumbnailDataUrl,
  userId,
  bodyArea,
  duration,
  userGoals,
  symptomSubmission,
  keyFrames,
}: UploadVideoParams): Promise<Video> {
  try {
    // Convert thumbnail data URL to Blob
    const thumbnailResponse = await fetch(thumbnailDataUrl);
    const thumbnailBlob = await thumbnailResponse.blob();

    // Generate unique filename
    const timestamp = Date.now();
    const videoId = generateId();
    const filename = `${userId}/${bodyArea.preset}/${timestamp}_${videoId}`;

    // Upload video
    const videoRef = ref(storage, `videos/${filename}.webm`);
    await uploadBytes(videoRef, videoBlob);
    const videoUrl = await getDownloadURL(videoRef);

    // Upload thumbnail
    const thumbnailRef = ref(storage, `video-thumbnails/${filename}.jpg`);
    await uploadBytes(thumbnailRef, thumbnailBlob);
    const thumbnailUrl = await getDownloadURL(thumbnailRef);

    // Upload key frames if provided
    let keyFrameUrls: string[] = [];
    if (keyFrames && keyFrames.length > 0) {
      keyFrameUrls = await Promise.all(
        keyFrames.map(async (frameDataUrl, index) => {
          const frameResponse = await fetch(frameDataUrl);
          const frameBlob = await frameResponse.blob();
          const frameRef = ref(storage, `video-frames/${filename}_frame${index}.jpg`);
          await uploadBytes(frameRef, frameBlob);
          return await getDownloadURL(frameRef);
        })
      );
    }

    // Create video metadata
    const metadata: VideoMetadata = {
      duration,
      fps: 30, // Assumed from recording
      resolution: '1920x1080', // Assumed, can be extracted from blob
      codec: 'vp9',
      fileSize: videoBlob.size,
    };

    // Create video document
    const videoData: any = {
      userId,
      date: Timestamp.now(),
      url: videoUrl,
      thumbnail: thumbnailUrl,
      bodyArea,
      duration,
      metadata,
      keyFrames: keyFrameUrls,
    };

    // Add optional fields
    if (userGoals !== undefined) {
      videoData.userGoals = userGoals;
    }
    if (symptomSubmission !== undefined) {
      videoData.symptomSubmission = symptomSubmission;
    }

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'videos'), videoData);

    return {
      id: docRef.id,
      ...videoData,
    };
  } catch (error) {
    console.error('Error uploading video:', error);
    throw new Error('Failed to upload video');
  }
}

export async function getUserVideos(userId: string): Promise<Video[]> {
  try {
    const videosQuery = query(
      collection(db, 'videos'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(videosQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Video[];
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw new Error('Failed to fetch videos');
  }
}

export async function getVideosByBodyArea(
  userId: string,
  bodyAreaPreset: string
): Promise<Video[]> {
  try {
    const videosQuery = query(
      collection(db, 'videos'),
      where('userId', '==', userId),
      where('bodyArea.preset', '==', bodyAreaPreset),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(videosQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Video[];
  } catch (error) {
    console.error('Error fetching videos by body area:', error);
    throw new Error('Failed to fetch videos');
  }
}

export async function getVideosByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Video[]> {
  try {
    const videosQuery = query(
      collection(db, 'videos'),
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(videosQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Video[];
  } catch (error) {
    console.error('Error fetching videos by date range:', error);
    throw new Error('Failed to fetch videos');
  }
}

export async function deleteVideo(videoId: string, video: Video): Promise<void> {
  try {
    // Extract file paths from URLs
    const videoPath = decodeURIComponent(video.url.split('/o/')[1]?.split('?')[0]);
    const thumbnailPath = decodeURIComponent(video.thumbnail.split('/o/')[1]?.split('?')[0]);

    // Delete video from Storage
    if (videoPath) {
      const videoRef = ref(storage, videoPath);
      await deleteObject(videoRef);
    }

    // Delete thumbnail from Storage
    if (thumbnailPath) {
      const thumbnailRef = ref(storage, thumbnailPath);
      await deleteObject(thumbnailRef);
    }

    // Delete key frames if they exist
    if (video.keyFrames && video.keyFrames.length > 0) {
      await Promise.all(
        video.keyFrames.map(async (frameUrl) => {
          const framePath = decodeURIComponent(frameUrl.split('/o/')[1]?.split('?')[0]);
          if (framePath) {
            const frameRef = ref(storage, framePath);
            await deleteObject(frameRef);
          }
        })
      );
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'videos', videoId));
  } catch (error) {
    console.error('Error deleting video:', error);
    throw new Error('Failed to delete video');
  }
}

/**
 * Get combined media (photos and videos) for a user
 */
export async function getUserMedia(userId: string): Promise<Array<{ type: 'photo' | 'video'; data: any }>> {
  try {
    const [photos, videos] = await Promise.all([
      getDocs(query(collection(db, 'photos'), where('userId', '==', userId), orderBy('date', 'desc'))),
      getDocs(query(collection(db, 'videos'), where('userId', '==', userId), orderBy('date', 'desc')))
    ]);

    const photoItems = photos.docs.map(doc => ({
      type: 'photo' as const,
      data: { id: doc.id, ...doc.data() }
    }));

    const videoItems = videos.docs.map(doc => ({
      type: 'video' as const,
      data: { id: doc.id, ...doc.data() }
    }));

    // Combine and sort by date
    const allMedia = [...photoItems, ...videoItems];
    allMedia.sort((a, b) => {
      const aTime = a.data.date?.toMillis() || 0;
      const bTime = b.data.date?.toMillis() || 0;
      return bTime - aTime;
    });

    return allMedia;
  } catch (error) {
    console.error('Error fetching user media:', error);
    throw new Error('Failed to fetch media');
  }
}
