import { db } from '../services/firebase/firebase';
import { collection, getDocs, query, where, limit, DocumentData } from 'firebase/firestore';

const VIDEO_KEYWORDS = [
  'funny',
  'laugh',
  'hilarious',
  'fail',
  'comedy',
  'prank',
  'meme',
  'bloopers',
  'try+not+to+laugh',
];

export const getRandomGameVideo = async (): Promise<string | null> => {
  try {
    const videosRef = collection(db, 'videos');
    const q = query(
      videosRef,
      where('isApproved', '==', true),
      where('active', '==', true),
      limit(50)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const videos = snapshot.docs.map(doc => doc.data() as DocumentData);
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    return randomVideo.youtubeVideoId || randomVideo.videoId || null;
  } catch (error) {
    console.error('Error fetching random video:', error);
    return null;
  }
};