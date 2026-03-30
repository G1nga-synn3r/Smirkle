/**
 * Types for users collection per blueprint
 */
export interface User {
  uid: string;
  isGuest: boolean;
  username: string | null;
  email: string | null;
  realName: string | null;
  birthdate: Date | null;
  ageVerified14Plus: boolean;
  createdAt: Date;
  updatedAt: Date;
  profileImageUrl: string | null;
  location: string | null;
  motto: string | null;
  bio: string | null;
  socialLinks: string[];
  privacyProfilePublic: boolean;
  privacyStatsPublic: boolean;
  highestSessionScore: number;
  lifetimeScore: number;
  currentLevel: number;
  badgeIds: string[];
  friendsCount: number;
  lastActiveAt: Date;
  authProvider: string;
  status: string;
}

