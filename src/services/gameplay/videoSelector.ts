import { getRandomGameVideo } from '../../utils/videoService';

/**
 * Video selection service for gameplay
 */
export const videoSelectorService = {
  /**
   * Get random video ID for gameplay, with fallback if API fails
   */
  getRandomGameVideoId: async (): Promise<string> => {
    const videoId = await getRandomGameVideo();
    if (videoId) {
      return videoId;
    }
    // Fallback keyword pools
    const fallbackVideos = ['dQw4w9WgXcQ', 'jNQXAC9IVRw', '3tmd-ClpJxA', '9bZkp7q19f0'];
    return fallbackVideos[Math.floor(Math.random() * fallbackVideos.length)];
  },
};