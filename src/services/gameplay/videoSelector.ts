import { getRandomApprovedVideo } from '../utils/videoService';
import type { Video } from '../types/video';

/**
 * Video selection service for gameplay
 */
export const videoSelectorService = {
  /**
   * Get random video for gameplay, with keyword pool fallback if needed
   */
  getRandomGameVideo: async (): Promise<string> => {
    const video = await getRandomApprovedVideo();
    if (video) {
      return video.youtubeVideoId || video.id;
    }
    // Fallback keyword pools (future API fetch stub)
    const fallbackVideos = ['dQw4w9WgXcQ', 'jNQXAC9IVRw'];
    return fallbackVideos[Math.floor(Math.random() * fallbackVideos.length)];
  },
};

