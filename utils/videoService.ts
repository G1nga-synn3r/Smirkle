import { firebase, db } from '../firebase';
import { collection, query, where, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';

/**
 * Validates if the given string is a valid YouTube URL.
 * Supports:
 *   - http://youtube.com/watch?v=VIDEO_ID
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - http://youtu.be/VIDEO_ID
 *   - https://www.youtu.be/VIDEO_ID
 * @param url The string to validate
 * @returns true if it's a valid YouTube URL, false otherwise
 */
export const validateYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/;
  return youtubeRegex.test(url);
};

/**
 * Fetches a random video from the Firestore collection where approved == true.
 * @returns A promise that resolves to a video document data or null if none found.
 */
export const getRandomApprovedVideo = async () => {
  try {
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, where('approved', '==', true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const videos = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Pick a random video
    const randomIndex = Math.floor(Math.random() * videos.length);
    return videos[randomIndex];
  } catch (error) {
    console.error('Error fetching random approved video: ', error);
    return null;
  }
};