export interface Video {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
}

export interface YouTubeResponse {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      thumbnails: { medium: { url: string } };
      channelTitle: string;
    };
  }>;
}
