import { Video, YouTubeResponse } from '../types/video';

const API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

const KEYWORDS = [
  'funny', 'hilarious', 'laugh', 'epic fails', 
  'memes 2026', 'try not to laugh', 'sketch comedy', 
  'internet gold', 'perfectly cut screams', 'chaotic energy'
];

const EXCLUSIONS = '-horror -scary -nursery -kids -toddler -news -politics';

/**
 * Fetches a list of funny videos based on random keywords and strict filters.
 */
export const fetchFunnyVideos = async (): Promise<Video[]> => {
  try {
    // 1. Pick a random keyword
    const randomKeyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
    
    // 2. Construct the query with exclusions
    const query = encodeURIComponent(`${randomKeyword} ${EXCLUSIONS}`);

    // 3. Build the URL with your specific 14+ parameters
    const url = `${BASE_URL}?part=snippet&maxResults=15&q=${query}&safeSearch=moderate&type=video&videoCategoryId=23&videoDuration=short&key=${API_KEY}`;

    const response = await fetch(url);
    const data: YouTubeResponse = await response.json();

    if (!data.items) return [];

    return data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      channelName: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error("Smirkle Video Error:", error);
    return [];
  }
};

/**
 * Specifically for Smirkle gameplay: Returns ONE random video ID to play immediately.
 */
export const getRandomGameVideo = async (): Promise<string | null> => {
  const videos = await fetchFunnyVideos();
  if (videos.length > 0) {
    // Pick a random video from the result set of 15
    const randomIndex = Math.floor(Math.random() * videos.length);
    return videos[randomIndex].videoId;
  }
  return null;
};
