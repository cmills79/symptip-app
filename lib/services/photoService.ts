import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { Photo, BodyArea, Annotation } from '@/types';
import { compressImage, createThumbnail, generateId } from '@/lib/utils/helpers';

interface UploadPhotoParams {
  photoDataUrl: string;
  userId: string;
  bodyArea: BodyArea;
  annotations: Annotation[];
  userGoals?: string;
  diaryEntry?: string;
}

export async function uploadPhoto({
  photoDataUrl,
  userId,
  bodyArea,
  annotations,
  userGoals,
  diaryEntry,
}: UploadPhotoParams): Promise<Photo> {
  try {
    // Convert data URL to Blob
    const response = await fetch(photoDataUrl);
    const blob = await response.blob();

    // Create compressed versions
    const compressedBlob = await compressImage(
      new File([blob], 'photo.jpg', { type: 'image/jpeg' }),
      1920,
      0.8
    );
    const thumbnailBlob = await createThumbnail(
      new File([blob], 'photo.jpg', { type: 'image/jpeg' }),
      400
    );

    // Generate unique filename
    const timestamp = Date.now();
    const photoId = generateId();
    const filename = `${userId}/${bodyArea.preset}/${timestamp}_${photoId}`;

    // Upload full-size photo
    const photoRef = ref(storage, `photos/${filename}.jpg`);
    await uploadBytes(photoRef, compressedBlob);
    const photoUrl = await getDownloadURL(photoRef);

    // Upload thumbnail
    const thumbnailRef = ref(storage, `thumbnails/${filename}.jpg`);
    await uploadBytes(thumbnailRef, thumbnailBlob);
    const thumbnailUrl = await getDownloadURL(thumbnailRef);

    // Create photo document - only include defined optional fields
    const photoData: any = {
      userId,
      date: Timestamp.now(),
      url: photoUrl,
      thumbnail: thumbnailUrl,
      bodyArea,
      annotations,
      metadata: {
        lightingScore: 0, // TODO: Implement quality scoring
        blurScore: 0,
      },
    };

    // Add optional fields only if they are defined
    if (userGoals !== undefined) {
      photoData.userGoals = userGoals;
    }
    if (diaryEntry !== undefined) {
      photoData.diaryEntry = diaryEntry;
    }

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'photos'), photoData);

    return {
      id: docRef.id,
      ...photoData,
    };
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error('Failed to upload photo');
  }
}

export async function getUserPhotos(userId: string): Promise<Photo[]> {
  try {
    const photosQuery = query(
      collection(db, 'photos'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(photosQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Photo[];
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw new Error('Failed to fetch photos');
  }
}

export async function getPhotosByBodyArea(
  userId: string,
  bodyAreaPreset: string
): Promise<Photo[]> {
  try {
    const photosQuery = query(
      collection(db, 'photos'),
      where('userId', '==', userId),
      where('bodyArea.preset', '==', bodyAreaPreset),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(photosQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Photo[];
  } catch (error) {
    console.error('Error fetching photos by body area:', error);
    throw new Error('Failed to fetch photos');
  }
}

export async function getPhotosByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Photo[]> {
  try {
    const photosQuery = query(
      collection(db, 'photos'),
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(photosQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Photo[];
  } catch (error) {
    console.error('Error fetching photos by date range:', error);
    throw new Error('Failed to fetch photos');
  }
}

export async function deletePhoto(photoId: string, photo: Photo): Promise<void> {
  try {
    // Extract file paths from URLs
    const photoPath = decodeURIComponent(photo.url.split('/o/')[1]?.split('?')[0]);
    const thumbnailPath = decodeURIComponent(photo.thumbnail.split('/o/')[1]?.split('?')[0]);

    // Delete from Storage
    if (photoPath) {
      const photoRef = ref(storage, photoPath);
      await deleteObject(photoRef);
    }
    if (thumbnailPath) {
      const thumbnailRef = ref(storage, thumbnailPath);
      await deleteObject(thumbnailRef);
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'photos', photoId));
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw new Error('Failed to delete photo');
  }
}
