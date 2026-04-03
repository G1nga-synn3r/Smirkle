import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import * as Haptics from 'expo-haptics';
import { auth, db } from '../services/firebase/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getRandomApprovedVideo } from '../utils/videoService';
import EmojiParticles from '../../components/EmojiParticles';
import YouTubePlayer from '../../components/YouTubePlayer';
import { colors } from '../theme/colors';
import { useFaceDetection } from '../hooks/useFaceDetection';

const { width, height } = Dimensions.get('window');

type FaceState = 'not_detected' | 'detected' | 'warning' | 'failed';

const GameScreen = ({ navigation }: any) => {
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isReady, setIsReady] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [faceState, setFaceState] = useState<FaceState>('not_detected');

  const [isSmiling, setIsSmiling] = useState(false);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [isOutOfView, setIsOutOfView] = useState(false);

  const smileStartTime = useRef<number | null>(null);
  const eyesClosedStartTime = useRef<number | null>(null);
  const outOfViewStartTime = useRef<number | null>(null);
  const warningStartTime = useRef<number | null>(null);
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [hasFailed, setHasFailed] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState('dQw4w9WgXcQ');
  const [showParticles, setShowParticles] = useState(false);
  const [particleEmojis, setParticleEmojis] = useState<string[]>([]);
  const [lastLevel, setLastLevel] = useState(0);

  const { faceData, frameProcessor } = useFaceDetection(!gameStarted || !hasFailed);

  // Real face detection logic
  useEffect(() => {
    if (hasFailed) return;

    const { faceDetected, leftEyeOpenProbability, rightEyeOpenProbability, smilingProbability } = faceData;

    if (!gameStarted) {
      // Before game: check for face detected, eyes open, neutral
      const eyesOpen = leftEyeOpenProbability > 0.5 && rightEyeOpenProbability > 0.5;
      const neutral = smilingProbability < 0.3;

      if (faceDetected && eyesOpen && neutral) {
        setFaceState('detected');
      } else {
        setFaceState('not_detected');
      }
    } else {
      // During game: monitor for failures
      const eyesOpen = leftEyeOpenProbability > 0.5 && rightEyeOpenProbability > 0.5;
      const neutral = smilingProbability < 0.3;

      setIsSmiling(!neutral);
      setEyesClosed(!eyesOpen);
      setIsOutOfView(!faceDetected);

      const isWarning = !faceDetected || !eyesOpen || !neutral;

      if (isWarning) {
        if (warningStartTime.current === null) {
          warningStartTime.current = Date.now();
        }
        setFaceState('warning');
      } else {
        warningStartTime.current = null;
        setFaceState('detected');
      }
    }
  }, [faceData, gameStarted, hasFailed]);

  useEffect(() => {
    if (!gameStarted || hasFailed) return;

    const isWarning = isSmiling || (eyesClosed && !eyesClosedStartTime.current) || 
                      (isOutOfView && !outOfViewStartTime.current);

    if (isWarning && faceState === 'warning') {
      if (warningStartTime.current) {
        const warningDuration = Date.now() - warningStartTime.current;
        
        if (warningDuration > 2000 || (isSmiling && warningDuration > 500)) {
          triggerFail();
        }
      }
    }
  }, [faceState, isSmiling, eyesClosed, isOutOfView, gameStarted, hasFailed]);

  useEffect(() => {
    if (!gameStarted || hasFailed) return;

    if (eyesClosed) {
      if (eyesClosedStartTime.current === null) {
        eyesClosedStartTime.current = Date.now();
      }
      
      const closedDuration = Date.now() - eyesClosedStartTime.current;
      if (closedDuration > 2000) {
        triggerFail();
      }
    } else {
      eyesClosedStartTime.current = null;
    }
  }, [eyesClosed, gameStarted, hasFailed]);

  useEffect(() => {
    if (!gameStarted || hasFailed) return;

    if (isOutOfView) {
      if (outOfViewStartTime.current === null) {
        outOfViewStartTime.current = Date.now();
      }
      
      const outDuration = Date.now() - outOfViewStartTime.current;
      if (outDuration > 2000) {
        triggerFail();
      }
    } else {
      outOfViewStartTime.current = null;
    }
  }, [isOutOfView, gameStarted, hasFailed]);

  useEffect(() => {
    if (isVideoPlaying && !hasFailed && gameStarted) {
      scoreIntervalRef.current = setInterval(() => {
        setScore(prevScore => prevScore + 111);
      }, 1000);
    }

    return () => {
      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current);
      }
    };
  }, [isVideoPlaying, hasFailed, gameStarted]);

  useEffect(() => {
    const levelThreshold = 111 * 60 * 9 * (lastLevel + 1) * (lastLevel + 1);
    if (score >= levelThreshold && score > 0) {
      setLastLevel(prev => prev + 1);
      const celebrationEmojis = ['🎉', '⭐', '🔥', '💥', '✨', '🌟', '🎊', '🏆'];
      setParticleEmojis(celebrationEmojis);
      setShowParticles(true);
    }
  }, [score, lastLevel]);

  const startGame = async () => {
    try {
      const video = await getRandomApprovedVideo();
      const videoId = video ? ((video as any).youtubeVideoId || video.id) : 'dQw4w9WgXcQ';
      setCurrentVideoId(videoId);
      setGameStarted(true);
      setScore(0);
      warningStartTime.current = null;
    } catch (error) {
      console.error('Video load error:', error);
      setCurrentVideoId('dQw4w9WgXcQ');
      setGameStarted(true);
      setScore(0);
      warningStartTime.current = null;
    }
  };

  const triggerFail = async () => {
    if (!hasFailed) {
      setHasFailed(true);
      setFaceState('failed');
      setIsVideoPlaying(false);
      
      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current);
      }

      const hapticInterval = setInterval(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }, 300);

      setTimeout(() => {
        clearInterval(hapticInterval);
      }, 3000);

      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const currentHighScore = userData.sessionHighScore || 0;
            const currentLifetimeScore = userData.lifetimeScore || 0;
            
            if (score > currentHighScore) {
              await updateDoc(doc(db, 'users', user.uid), {
                sessionHighScore: score,
                lifetimeScore: currentLifetimeScore + score,
              });
            } else {
              await updateDoc(doc(db, 'users', user.uid), {
                lifetimeScore: currentLifetimeScore + score,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error saving score:', error);
      }

      setTimeout(() => {
        navigation.navigate('Home');
      }, 3000);
    }
  };

  const requestCameraPermission = async () => {
    await requestPermission();
  };

  const onYouTubeChangeState = (state: string) => {
    if (state === 'playing') {
      setIsVideoPlaying(true);
    } else if (state === 'paused' || state === 'ended') {
      setIsVideoPlaying(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>SMIRKLE</Text>
        </View>
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>REQUESTING CAMERA ACCESS...</Text>
        </View>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>SMIRKLE</Text>
        </View>
        
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>CAMERA ACCESS REQUIRED</Text>
          <Text style={styles.warningSubtext}>
            Face detection is required to play
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={requestCameraPermission}
          >
            <Text style={styles.retryButtonText}>GRANT ACCESS</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!gameStarted && !hasFailed) {
    const { faceDetected, leftEyeOpenProbability, rightEyeOpenProbability, smilingProbability } = faceData;
    const eyesOpen = leftEyeOpenProbability > 0.5 && rightEyeOpenProbability > 0.5;
    const neutral = smilingProbability < 0.3;
    const allReady = faceDetected && eyesOpen && neutral;

    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>GET READY</Text>
          <Text style={styles.subtitle}>Maintain your poker face!</Text>
        </View>

        <View style={styles.faceDetectionContainer}>
          <View style={styles.cameraPreview}>
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={!hasFailed}
              frameProcessor={frameProcessor}
              onInitialized={() => setIsReady(true)}
            />
          </View>

          <View style={[styles.checklistCard, allReady && { opacity: 0.3 }]}>
            <View style={styles.checklistItem}>
              <View style={[styles.checkbox, faceDetected && { backgroundColor: colors.neonCyan }]}>
                {faceDetected && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checklistText}>Face Detected</Text>
            </View>
            <View style={styles.checklistItem}>
              <View style={[styles.checkbox, eyesOpen && { backgroundColor: colors.neonCyan }]}>
                {eyesOpen && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checklistText}>Eyes Open</Text>
            </View>
            <View style={styles.checklistItem}>
              <View style={[styles.checkbox, neutral && { backgroundColor: colors.neonCyan }]}>
                {neutral && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checklistText}>Neutral Expression</Text>
            </View>
          </View>

          {allReady && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startGame}
            >
              <Text style={styles.startButtonText}>START GAME</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasFailed) {
    return (
      <View style={styles.failContainer}>
        <View style={styles.failContent}>
          <Text style={styles.failTitle}>GAME OVER</Text>
          <Text style={styles.failReason}>
            {isSmiling ? '😏 You smiled!' : 
             eyesClosed ? '😑 Eyes closed too long!' : 
             '📷 You went out of frame!'}
          </Text>
          <Text style={styles.failScore}>FINAL SCORE: {score.toLocaleString()}</Text>
          <Text style={styles.failSubtext}>Returning to home...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      <YouTubePlayer
        videoId={currentVideoId}
        style={StyleSheet.absoluteFill}
        onStateChange={onYouTubeChangeState}
      />
      
      <View style={styles.scoreOverlay}>
        <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
        <Text style={styles.scoreLabel}>POINTS</Text>
        {lastLevel > 0 && <Text style={styles.levelText}>LVL {lastLevel}</Text>}
      </View>

      <View style={styles.pipContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!hasFailed}
          frameProcessor={frameProcessor}
        />

        {faceState === 'warning' && (
          <View style={styles.warningBorder}>
            <Text style={styles.warningBorderText}>
              {isSmiling ? 'DON\'T SMILE!' :
               eyesClosed ? 'OPEN YOUR EYES!' :
               'STAY IN FRAME!'}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.stopButton}
        onPress={() => {
          setHasFailed(true);
          setIsVideoPlaying(false);
        }}
      >
        <Text style={styles.stopButtonText}>STOP</Text>
      </TouchableOpacity>

      <EmojiParticles
        emojis={particleEmojis}
        visible={showParticles}
        onComplete={() => setShowParticles(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    marginTop: 40,
    padding: 10,
    alignItems: 'center',
  },
  title: {
    color: colors.neonMagenta,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: colors.neonMagenta,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    color: colors.neonYellow,
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  faceDetectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  cameraPreview: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.neonCyan,
  },
  detectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detectionText: {
    color: colors.errorRed,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detectionSubtext: {
    color: colors.errorRed,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  previewScoreContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  previewScoreLabel: {
    color: colors.neonYellow,
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    marginTop: 30,
    backgroundColor: colors.neonCyan,
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.neonMagenta,
    shadowColor: colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  startButtonText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scoreOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: colors.overlayBlack,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.neonYellow,
  },
  scoreText: {
    color: colors.neonYellow,
    fontSize: 36,
    fontWeight: '900',
  },
  scoreLabel: {
    color: colors.neonYellow,
    fontSize: 12,
    fontWeight: 'bold',
  },
  levelText: {
    color: colors.neonCyan,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  pipContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 100,
    height: 75,
    borderWidth: 2,
    borderColor: colors.neonCyan,
    borderRadius: 10,
    overflow: 'hidden',
  },
  warningBorder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayWarning,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.warningRed,
  },
  warningBorderText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stopButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: colors.overlayWarning,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.warningRed,
  },
  stopButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  failContainer: {
    flex: 1,
    backgroundColor: colors.warningRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  failContent: {
    backgroundColor: colors.surface,
    padding: 40,
    borderRadius: 30,
    width: '85%',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.warningRed,
  },
  failTitle: {
    color: colors.warningRed,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: colors.warningRed,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  failReason: {
    color: colors.neonYellow,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
  },
  failScore: {
    color: colors.neonCyan,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 20,
  },
  failSubtext: {
    color: colors.white,
    fontSize: 14,
    marginTop: 20,
    opacity: 0.7,
  },
  warningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningText: {
    color: colors.errorRed,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  warningSubtext: {
    color: colors.errorRed,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: '#331111',
    borderWidth: 2,
    borderColor: colors.errorRed,
  },
  retryButtonText: {
    color: colors.errorRed,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginVertical: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    backgroundColor: colors.grayDark,
    borderWidth: 1,
    borderColor: colors.errorRed,
    alignSelf: 'center',
  },
  backButtonText: {
    color: colors.errorRed,
    fontWeight: 'bold',
    fontSize: 14,
  },
  checklistCard: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -width * 0.4 }, { translateY: -height * 0.2 }],
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.neonCyan,
    width: width * 0.8,
    alignItems: 'center',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 5,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.background,
    fontSize: 20,
    fontWeight: 'bold',
  },
  checklistText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GameScreen;

