import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { PoseReference, PoseLandmarks } from '@/types';
import { generateId } from '@/lib/utils/helpers';

/**
 * Save a pose reference with landmarks and photo
 */
export async function savePoseReference(
  userId: string,
  bodyArea: string,
  landmarks: PoseLandmarks[],
  photoDataUrl: string
): Promise<string> {
  const referenceId = generateId();

  // Upload reference photo to Storage
  const photoBlob = await fetch(photoDataUrl).then((r) => r.blob());
  const photoRef = ref(
    storage,
    `pose-references/${userId}/${bodyArea}/${referenceId}.jpg`
  );
  await uploadBytes(photoRef, photoBlob);
  const photoUrl = await getDownloadURL(photoRef);

  // Save reference to Firestore
  const poseRefDoc = doc(db, 'pose-references', referenceId);
  const poseRefData: PoseReference = {
    id: referenceId,
    bodyArea,
    landmarks,
    photoUrl,
    createdAt: Timestamp.now(),
  };

  await setDoc(poseRefDoc, {
    ...poseRefData,
    userId,
  });

  return referenceId;
}

/**
 * Get pose reference by ID
 */
export async function getPoseReference(
  referenceId: string
): Promise<PoseReference | null> {
  const poseRefDoc = doc(db, 'pose-references', referenceId);
  const snapshot = await getDoc(poseRefDoc);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as PoseReference;
}

/**
 * Get pose reference for a specific body area
 */
export async function getPoseReferenceByBodyArea(
  userId: string,
  bodyArea: string
): Promise<PoseReference | null> {
  const q = query(
    collection(db, 'pose-references'),
    where('userId', '==', userId),
    where('bodyArea', '==', bodyArea)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  // Return the most recent reference
  const references = snapshot.docs.map((doc) => doc.data() as PoseReference);
  references.sort(
    (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
  );

  return references[0];
}

/**
 * Get all pose references for a user
 */
export async function getAllPoseReferences(
  userId: string
): Promise<PoseReference[]> {
  const q = query(
    collection(db, 'pose-references'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data() as PoseReference);
}

/**
 * Check if user has a pose reference for a body area
 */
export async function hasPoseReference(
  userId: string,
  bodyArea: string
): Promise<boolean> {
  const reference = await getPoseReferenceByBodyArea(userId, bodyArea);
  return reference !== null;
}
