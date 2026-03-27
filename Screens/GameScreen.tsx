import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Linking, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { auth, db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import EmojiParticles from '../components/EmojiParticles';
import YouTubePlayer from '../components/YouTubePlayer';

const { width, height } = Dimensions.get('window');

// Face detection states
type FaceState = 'not_detected' | 'detected' | 'warning' | 'failed';

const GameScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceState, setFaceState] = useState<FaceState>('not_detected');
  
  // Face detection tracking
  const [isSmiling, setIsSmiling] = useState(false);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [isOutOfView, setIsOutOfView] = useState(false);
  
  // Timing refs
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

  const hasPermission = permission?.granted;

  // Sample funny YouTube video IDs for the game
  const funnyVideos = [
    'dQw4w9WgXcQ', // Rick Roll (classic)
    'jNQXAC9IVRw', // Me at the zoo
    '3tmd-ClpJxA', // Funny animals
    '9bZkp7q19f0', // Gangnam Style
    'VjCotWK6CB4', // Funny kids
    'CSvFpBOe8eY', // Awesome remix
    'K4TOrB7at0Y', // Ninja Hattori
    'p87wZ-IIVFI', // Tom and Jerry
  ];

  // Simulate face detection (in production, use VisionCamera with face detection)
  useEffect(() => {
    if (!isReady || hasFailed) return;

    const checkInterval = setInterval(() => {
      if (!gameStarted) {
        // Pre-game: Check if face is properly detected with eyes open and not smiling
        // Simulate detection for demo - in production this would come from actual face detection
        const randomCheck = Math.random();
        if (randomCheck > 0.3) {
          setFaceDetected(true);
          setFaceState('detected');
        } else {
          setFaceDetected(false);
          setFaceState('not_detected');
        }
      } else {
        // During game: Simulate face state changes
        const smileCheck = Math.random();
        const eyesCheck = Math.random();
        const viewCheck = Math.random();

        let currentSmiling = smileCheck > 0.6;
        let currentEyesClosed = eyesCheck > 0.7;
        let currentOutOfView = viewCheck > 0.85;

        setIsSmiling(currentSmiling);
        setEyesClosed(currentEyesClosed);
        setIsOutOfView(currentOutOfView);

        // Determine warning vs fail state
        const isWarning = currentSmiling || currentEyesClosed || currentOutOfView;
        
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
    }, 500);

    return () => clearInterval(checkInterval);
  }, [isReady, hasFailed, gameStarted]);

  // Handle warning state timing
  useEffect(() => {
    if (!gameStarted || hasFailed) return;

    // Warning conditions: smiling, eyes closed briefly, or out of view briefly
    const isWarning = isSmiling || (eyesClosed && !eyesClosedStartTime.current) || 
                      (isOutOfView && !outOfViewStartTime.current);

    if (isWarning && faceState === 'warning') {
      // Track how long in warning state
      if (warningStartTime.current) {
        const warningDuration = Date.now() - warningStartTime.current;
        
        // If in warning state for more than 2 seconds (for fail conditions)
        // OR immediately for smirking (more than brief smile)
        if (warningDuration > 2000 || (isSmiling && warningDuration > 500)) {
          triggerFail();
        }
      }
    }
  }, [faceState, isSmiling, eyesClosed, isOutOfView, gameStarted, hasFailed]);

  // Track eyes closed duration specifically (fail after 2 seconds)
  useEffect(() => {
    if (!gameStarted || hasFailed) return;

    if (eyesClosed) {
      if (eyesClosedStartTime.current === null) {
        eyesClosedStartTime.current = Date.now();
      }
      
      const closedDuration = Date.now() - eyesClosedStartTime.current;
      if (closedDuration > 2000) {
        // Eyes closed for more than 2 seconds - FAIL
        triggerFail();
      }
    } else {
      eyesClosedStartTime.current = null;
    }
  }, [eyesClosed, gameStarted, hasFailed]);

  // Track out of view duration (fail after 2 seconds)
  useEffect(() => {
    if (!gameStarted || hasFailed) return;

    if (isOutOfView) {
      if (outOfViewStartTime.current === null) {
        outOfViewStartTime.current = Date.now();
      }
      
      const outDuration = Date.now() - outOfViewStartTime.current;
      if (outDuration > 2000) {
        // Out of view for more than 2 seconds - FAIL
        triggerFail();
      }
    } else {
      outOfViewStartTime.current = null;
    }
  }, [isOutOfView, gameStarted, hasFailed]);

  // Score increment - 111 points per second
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

  // Level up detection and particle trigger
  useEffect(() => {
    const levelThreshold = 111 * 60 * 9 * (lastLevel + 1) * (lastLevel + 1);
    if (score >= levelThreshold && score > 0) {
      setLastLevel(prev => prev + 1);
      const celebrationEmojis = ['🎉', '⭐', '🔥', '💥', '✨', '🌟', '🎊', '🏆'];
      setParticleEmojis(celebrationEmojis);
      setShowParticles(true);
    }
  }, [score, lastLevel]);

  // Start game
  const startGame = () => {
    // Select random video
    const randomVideo = funnyVideos[Math.floor(Math.random() * funnyVideos.length)];
    setCurrentVideoId(randomVideo);
    setGameStarted(true);
    setScore(0);
    warningStartTime.current = null;
  };

  // Trigger fail state
  const triggerFail = async () => {
    if (!hasFailed) {
      setHasFailed(true);
      setFaceState('failed');
      setIsVideoPlaying(false);
      
      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current);
      }

      // Haptic feedback for 3 seconds
      const hapticInterval = setInterval(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }, 300);

      setTimeout(() => {
        clearInterval(hapticInterval);
      }, 3000);

      // Save score to user profile
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const currentHighScore = userData.sessionHighScore || 0;
            const currentLifetimeScore = userData.lifetimeScore || 0;
            
            // Update high score if current score is higher
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

      // Return to home after 3 seconds
      setTimeout(() => {
        navigation.navigate('Home');
      }, 3000);
    }
  };

  const requestCameraPermission = async () => {
    await requestPermission();
  };

  // YouTube event handlers
  const onYouTubeChangeState = (state: string) => {
    if (state === 'playing') {
      setIsVideoPlaying(true);
    } else if (state === 'paused' || state === 'ended') {
      setIsVideoPlaying(false);
    }
  };

  if (!permission) {
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

  if (!permission.granted) {
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

  // Pre-game: Face detection setup
  if (!gameStarted && !hasFailed) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>GET READY</Text>
          <Text style={styles.subtitle}>Maintain your poker face!</Text>
        </View>

        <View style={styles.faceDetectionContainer}>
          {/* Camera Preview */}
          <View style={styles.cameraPreview}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="front"
              onCameraReady={() => setIsReady(true)}
            />
            
            {/* Face detection overlay */}
            {faceState === 'not_detected' && (
              <View style={styles.detectionOverlay}>
                <Text style={styles.detectionText}>Position your face in the frame</Text>
                <Text style={styles.detectionSubtext}>Keep eyes open and don't smile</Text>
              </View>
            )}
            
            {faceState === 'detected' && (
              <View style={[styles.detectionOverlay, { backgroundColor: 'rgba(0, 255, 234, 0.3)' }]}>
                <Text style={[styles.detectionText, { color: '#00ffea' }]}>FACE DETECTED ✓</Text>
                <Text style={[styles.detectionSubtext, { color: '#00ffea' }]}>You're ready to play!</Text>
              </View>
            )}
          </View>

          {/* Score display */}
          <View style={styles.previewScoreContainer}>
            <Text style={styles.previewScoreLabel}>+111 points per second</Text>
          </View>

          {/* Start Button - only visible when face detected */}
          {faceDetected && (
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

  // Fail screen
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

  // Active game screen
  return (
    <View style={styles.gameContainer}>
      {/* YouTube Video Fullscreen */}
      <YouTubePlayer
        videoId={currentVideoId}
        style={StyleSheet.absoluteFill}
        onStateChange={onYouTubeChangeState}
      />
      
      {/* Score Display */}
      <View style={styles.scoreOverlay}>
        <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
        <Text style={styles.scoreLabel}>POINTS</Text>
        {lastLevel > 0 && <Text style={styles.levelText}>LVL {lastLevel}</Text>}
      </View>

      {/* Camera PiP Overlay */}
      <View style={styles.pipContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="front"
        />
        
        {/* Warning Border */}
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

      {/* Stop Button */}
      <TouchableOpacity 
        style={styles.stopButton}
        onPress={() => {
          setHasFailed(true);
          setIsVideoPlaying(false);
        }}
      >
        <Text style={styles.stopButtonText}>STOP</Text>
      </TouchableOpacity>

      {/* Level Up Particles */}
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
    backgroundColor: '#0a0a0a',
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
    color: '#ff00ff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    color: '#ffff00',
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
    borderColor: '#00ffea',
  },
  detectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detectionText: {
    color: '#ff3333',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detectionSubtext: {
    color: '#ff3333',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  previewScoreContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
  },
  previewScoreLabel: {
    color: '#ffff00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    marginTop: 30,
    backgroundColor: '#00ffea',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#ff00ff',
    shadowColor: '#00ffea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  startButtonText: {
    color: '#0a0a0a',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scoreOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffff00',
  },
  scoreText: {
    color: '#ffff00',
    fontSize: 36,
    fontWeight: '900',
  },
  scoreLabel: {
    color: '#ffff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  levelText: {
    color: '#00ffea',
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
    borderColor: '#00ffea',
    borderRadius: 10,
    overflow: 'hidden',
  },
  warningBorder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ff0000',
  },
  warningBorderText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stopButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ff0000',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  failContainer: {
    flex: 1,
    backgroundColor: '#ff0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failContent: {
    backgroundColor: '#1a1a1a',
    padding: 40,
    borderRadius: 30,
    width: '85%',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ff0000',
  },
  failTitle: {
    color: '#ff0000',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: '#ff0000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  failReason: {
    color: '#ffff00',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
  },
  failScore: {
    color: '#00ffea',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 20,
  },
  failSubtext: {
    color: '#fff',
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
    color: '#ff3333',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  warningSubtext: {
    color: '#ff3333',
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
    borderColor: '#ff3333',
  },
  retryButtonText: {
    color: '#ff3333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginVertical: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#ff4d4d',
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#ff4d4d',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default GameScreen;