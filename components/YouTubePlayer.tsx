import React, { useRef, useEffect } from 'react';
import { WebView, WebViewProps } from 'react-native-webview';
import { View, StyleSheet, Dimensions } from 'react-native';

interface YouTubePlayerProps {
  videoId: string;
  onStateChange?: (state: string) => void;
  onError?: (reason: string) => void;
  style?: object;
}

type PlayerMessage =
  | { type: 'state'; state: string }
  | { type: 'error'; reason: string }
  | { type: 'ready' };

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoId, 
  onStateChange,
  onError,
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
        #ytplayer { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div class="video-container">
        <div id="ytplayer"></div>
      </div>
      <script>
        (function() {
          var tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          var player;
          var videoId = "${videoId}";

          function postMessage(payload) {
            try {
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(payload));
            } catch (e) {}
          }

          window.onYouTubeIframeAPIReady = function() {
            try {
              player = new YT.Player('ytplayer', {
                videoId: videoId,
                playerVars: {
                  autoplay: 1,
                  playsinline: 1,
                  enablejsapi: 1,
                  modestbranding: 1,
                  rel: 0,
                },
                events: {
                  onReady: function() { postMessage({ type: 'ready' }); },
                  onStateChange: function(event) {
                    var stateMap = {
                      0: 'ended',
                      1: 'playing',
                      2: 'paused',
                      3: 'buffering',
                      5: 'cued'
                    };
                    var mapped = stateMap[event.data] || String(event.data);
                    postMessage({ type: 'state', state: mapped });
                  },
                  onError: function(event) {
                    var errorReasons = {
                      2: 'invalid_param',
                      5: 'html5_error',
                      100: 'not_found',
                      101: 'embed_not_allowed',
                      150: 'playback_error'
                    };
                    var reason = errorReasons[event.data] || ('yt_error_' + event.data);
                    postMessage({ type: 'error', reason: reason });
                  }
                }
              });
            } catch (e) {
              postMessage({ type: 'error', reason: 'player_init_error' });
            }
          };
        })();
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data: PlayerMessage = JSON.parse(event.nativeEvent.data);
      if (data.type === 'state' && onStateChange) {
        onStateChange(data.state);
      }
      if (data.type === 'error' && onError) {
        onError(data.reason);
      }
    } catch (e) {}
  };

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
        onMessage={handleMessage}
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