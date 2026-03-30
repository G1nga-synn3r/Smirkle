/**
 * Electric Midnight theme colors extracted from existing styles
 */
export const colors = {
  background: '#0a0a0a',
  surface: '#0d0d0d',
  neonCyan: '#00ffea',
  neonYellow: '#ffff00',
  neonMagenta: '#ff00ff',
  neonYellowGlow: '#ffff00',
  errorRed: '#ff3333',
  warningRed: '#ff0000',
  white: '#ffffff',
  gray: '#555555',
  grayDark: '#333333',
  overlayBlack: 'rgba(0, 0, 0, 0.7)',
  overlayWarning: 'rgba(255, 0, 0, 0.5)',
  cyanGlow: 'rgba(0, 255, 234, 0.3)',
} as const;

export type Colors = typeof colors;

