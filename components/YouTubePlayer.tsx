import React, { useRef, useEffect } from 'react';
import { WebView, WebViewProps } from 'react-native-webview';
import { View, StyleSheet, Dimensions } from 'react-native';

interface YouTubePlayerProps {
  videoId: string;
  onStateChange?: (state: string) => void;
  style?: object;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoId, 
  onStateChange,
  style 
}) => {
  const webViewRef = useRef<WebView>(null);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
        .video-container { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
        iframe { width: 100%; height: 100%; border: none; }
      </style>
    </head>
    <body>
      <div class="video-container">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
      <script>
        // Simple postMessage to notify state changes would require YouTube IFrame API
        // For basic functionality, this embeds and autoplays the video
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        style={styles.webview}
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default YouTubePlayer;