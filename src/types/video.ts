
/**
 * Types for videos collection per blueprint
 */
export interface Video {
  videoId: string;
  youtubeVideoId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  sourceUrl: string;
  keywordTags: string[];
  categoryTags: string[];
  isApproved: boolean;
  isBlocked: boolean;
  minAge: number;
  language: string | null;
  submittedByUid: string | null;
  submittedAt: Date | null;
  approvedAt: Date | null;
  playCount: number;
  failCount: number;
  averageWatchDuration: number | null;
  active: boolean;
}

