import React, { forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

interface YouTubePlayerProps {
  videoId: string;
  style?: ViewStyle;
  onStateChange?: (state: string) => void;
  onError?: (reason: string) => void;
}

export interface YouTubePlayerRef {
  stop: () => void;
  play: () => void;
}

const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  ({ videoId, style, onStateChange, onError }: YouTubePlayerProps, ref) => {
    useImperativeHandle(ref, () => ({
      stop: () => {},
      play: () => {},
    }));

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; background: #000; }
            iframe { width: 100%; height: 100%; border: none; }
          </style>
        </head>
        <body>
          <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0" 
            allow="autoplay; encrypted-media"
            allowfullscreen
          ></iframe>
        </body>
      </html>
    `;

    return (
      <View style={[styles.container, style]}>
        <WebView
          source={{ html }}
          style={styles.webview}
          javaScriptEnabled
          onLoadStart={() => onStateChange?.('loading')}
          onLoad={() => onStateChange?.('playing')}
          onError={() => onError?.('load_failed')}
        />
      </View>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
});

export default YouTubePlayer;