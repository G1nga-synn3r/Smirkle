/**
 * Electric Midnight theme colors extracted from existing styles
 */
export const colors = {
  background: '#050816',
  surface: '#0d0d0d',
  midnightBg: '#050816',
  neonCyan: '#00ffea',
  neonYellow: '#ffff00',
  neonMagenta: '#ff00ff',
  errorRed: '#ff3333',
  warningRed: '#ff0000',
  white: '#ffffff',
  gray: '#555555',
  grayDark: '#333333',
  overlayBlack: 'rgba(0, 0, 0, 0.7)',
  overlayWarning: 'rgba(255, 0, 0, 0.5)',
} as const;

export type Colors = typeof colors;

