// Level calculation formula from requirements:
// levelX = 111 * (60 * 9 * x * x)
// For level 1: 111 * (60 * 1 * 1) = 111 * 60 = 6,660
// For level 5: 111 * (60 * 5 * 5) = 111 * 1500 = 166,500
// For level 10: 111 * (60 * 10 * 10) = 111 * 6000 = 666,000

export const calculateLevelFromScore = (totalScore: number): number => {
  let level = 0;
  while (true) {
    const threshold = 111 * 60 * 9 * level * level;
    if (totalScore >= threshold) {
      level++;
    } else {
      break;
    }
    // Safety check to prevent infinite loop
    if (level > 1000) break;
  }
  return level;
};

export const getLevelThreshold = (level: number): number => {
  return 111 * 60 * 9 * level * level;
};

// Badge levels: 5, 15, 45, 135, 405...
export const BADGE_LEVELS = [5, 15, 45, 135, 405];

export const BADGE_NAMES = [
  { level: 5, name: 'Poker Facers', emoji: '😏' },
  { level: 15, name: 'Why So Serious', emoji: '🗿' },
  { level: 45, name: 'Stone Face', emoji: '🪨' },
  { level: 135, name: 'Emotionless', emoji: '🎭' },
  { level: 405, name: 'The Unsmirkable', emoji: '👺' },
];

export const getBadgesForLevel = (level: number): { name: string; emoji: string }[] => {
  const badges: { name: string; emoji: string }[] = [];
  
  for (let i = 0; i < BADGE_LEVELS.length; i++) {
    if (level >= BADGE_LEVELS[i]) {
      badges.push(BADGE_NAMES[i]);
    }
  }
  
  return badges;
};