const LEVEL_THRESHOLDS = [
  0,      // Level 0 (unranked)
  40000,  // Level 1
  100000, // Level 2
  160000, // Level 3
  220000, // Level 4
  280000, // Level 5
  340000, // Level 6
  400000, // Level 7
  460000, // Level 8
  520000, // Level 9
  580000, // Level 10
];

export function calculateLevel(totalScore: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalScore >= LEVEL_THRESHOLDS[i]) {
      return i;
    }
  }
  return 0;
}