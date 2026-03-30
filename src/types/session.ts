/**
 * Types for sessions collection per blueprint
 */
export interface Session {
  sessionId: string;
  uid: string | null;
  isGuest: boolean;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  score: number;
  videoId: string;
  videoTitle: string;
  videoSourceType: string;
  failReason: string;
  warningCount: number;
  smileTriggered: boolean;
  eyesClosedTriggered: boolean;
  faceLostTriggered: boolean;
  internetLostTriggered: boolean;
  videoLoadFailureTriggered: boolean;
  completedSuccessfully: boolean;
  deviceModel: string | null;
  appVersion: string | null;
}

