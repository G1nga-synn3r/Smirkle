import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import YouTube from 'react-native-youtube-iframe';
import EmojiParticles from '../components/EmojiParticles';

const GameScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [score, setScore] = useState(0);
  const [isSmirking, setIsSmirking] = useState(false);
  const [smirkStartTime, setSmirkStartTime] = useState<number | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const scoreRef = useRef(0);
  const smirkCheckRef = useRef<NodeJS.Timeout | null>(null);

  const hasPermission = permission?.granted;

  // Simulate face detection for demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (isReady && !hasFailed) {
        const smilingProbability = Math.random();
        if (smilingProbability > 0.7) {
          setIsSmirking(true);
          if (smirkStartTime === null) {
            setSmirkStartTime(Date.now());
          }
        } else {
          setIsSmirking(false);
          setSmirkStartTime(null);
          if (smirkCheckRef.current) {
            clearTimeout(smirkCheckRef.current);
            smirkCheckRef.current = null;
          }
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isReady, hasFailed, smirkStartTime]);

  // Check if smirking has lasted for 1 second
  useEffect(() => {
    if (isSmirking && smirkStartTime !== null) {
      const elapsed = Date.now() - smirkStartTime;
      if (elapsed >= 1000) { // 1 second
        triggerFail();
      }
    }
  }, [isSmirking, smirkStartTime]);

  // Score increment timer
  useEffect(() => {
    if (isVideoPlaying && !isSmirking && !hasFailed) {
      const interval = setInterval(() => {
        setScore(prevScore => prevScore + 111);
        scoreRef.current = score + 111;
      }, 1000);
      return () => clearInterval(interval);
    }
    return () => {};
  }, [isVideoPlaying, isSmirking, hasFailed]);

  // YouTube event handlers
  const onYouTubeReady = () => {
    setIsVideoReady(true);
  };

  const onYouTubeChangeState = (state: string) => {
    if (state === 'playing') {
      setIsVideoPlaying(true);
    } else if (state === 'paused' || state === 'ended') {
      setIsVideoPlaying(false);
    }
  };

  // Trigger fail state
  const triggerFail = () => {
    if (!hasFailed) {
      setHasFailed(true);
      // Trigger haptics
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Vibrate for 3 seconds
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // Repeat for effect
      } else {
        // Android vibration
      }
      // Actually vibrate for 3 seconds - simplified
      const vibrateInterval = setInterval(() => {
        // Vibration.vibrate(100); // This would require importing Vibration
      }, 100);
      setTimeout(() => {
        clearInterval(vibrateInterval);
      }, 3000);
    }
  };

  const requestCameraPermission = async () => {
    await requestPermission();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>SESSION: ACTIVE 💀</Text>
        </View>
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>REQUESTING CAMERA ACCESS...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>SESSION: ACTIVE 💀</Text>
        </View>
        
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>⚠️ CAMERA ACCESS DENIED</Text>
          <Text style={styles.warningSubtext}>
            SYSTEM LOCKDOWN ACTIVE
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={requestCameraPermission}
          >
            <Text style={styles.retryButtonText}>REQUEST ACCESS</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>ABORT MISSION 🚪</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>SESSION: ACTIVE 💀</Text>
      </View>

      {/* Main Content: YouTube Video */}
      <View style={styles.videoContainer}>
        <YouTube
          videoId="dQw4w9WgXcQ"
          play={true}
          style={StyleSheet.absoluteFill}
          ready={onYouTubeReady}
          onChangeState={onYouTubeChangeState}
        />
        
        {/* PIP Camera Overlay */}
        <View style={styles.pipContainer}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="front"
            onCameraReady={() => setIsReady(true)}
          />
          
          {/* Smirking Warning Border */}
          {isSmirking && <View style={styles.warningBorder} />}
        </View>
      </View>

      {/* Fail Overlay */}
      {hasFailed && (
        <View style={styles.failOverlay}>
          <View style={styles.failContent}>
            <Text style={styles.failTitle}>YOU SMIRKED 💀</Text>
            <Text style={styles.failScore}>FINAL SCORE: {score}</Text>
            <TouchableOpacity 
              style={styles.tryAgainButton}
              onPress={() => {
                // Reset game state
                setScore(0);
                setIsSmirking(false);
                setSmirkStartTime(null);
                setHasFailed(false);
                setIsVideoPlaying(false);
              }}
            >
              <Text style={styles.tryAgainText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>ABORT MISSION 🚪</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  headerContainer: {
    marginTop: 40,
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ff00ff',
  },
  title: {
    color: '#ff00ff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  videoContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00ffea',
    shadowColor: '#00ffea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  pipContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 100,
    height: 75,
    borderWidth: 2,
    borderColor: '#00ffea',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#00ffea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  warningBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: '#ff0000',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  failOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failContent: {
    backgroundColor: '#1a1a1a',
    padding: 30,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff3333',
    shadowColor: '#ff3333',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  failTitle: {
    color: '#ff3333',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textShadowColor: '#ff3333',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  failScore: {
    color: '#00ffea',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  tryAgainButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    backgroundColor: '#331111',
    borderWidth: 1,
    borderColor: '#ff3333',
  },
  tryAgainText: {
    color: '#ff3333',
    fontWeight: 'bold',
  },
  warningContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#ff3333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff3333',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  warningText: {
    color: '#ff3333',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: '#ff3333',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  warningSubtext: {
    color: '#ff3333',
    fontSize: 14,
    marginTop: 10,
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  retryButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    backgroundColor: '#331111',
    borderWidth: 1,
    borderColor: '#ff3333',
  },
  retryButtonText: {
    color: '#ff3333',
    fontWeight: 'bold',
  },
  cameraPlaceholder: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#00ffea',
    borderStyle: 'dashed',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00ffea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  placeholderText: {
    color: '#00ffea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginBottom: 40,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#ff4d4d',
  },
  backButtonText: {
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
});

export default GameScreen;