import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../services/firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { colors } from '../theme/colors';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useFaceDetection } from '../hooks/useFaceDetection';
import YouTubePlayer from '../components/YouTubePlayer';
import EmojiParticles from '../components/EmojiParticles';
import { getRandomGameVideo } from '../utils/videoService';
import * as Haptics from 'expo-haptics';
import { useInternetConnectivity } from '../hooks/useInternetConnectivity';

interface UserData {
  username: string | null;
  currentLevel: number;
  lifetimeScore: number;
  badgeIds: string[];
  isGuest: boolean;
  highestSessionScore: number;
}

const { width } = { width: 390 };
const absoluteFill = { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 };

type FaceState = 'not_detected' | 'detected' | 'warning' | 'failed';

export default function HomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [faceState, setFaceState] = useState<FaceState>('not_detected');
  const [isSmiling, setIsSmiling] = useState(false);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [isOutOfView, setIsOutOfView] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState('dQw4w9WgXcQ');
  const [showParticles, setShowParticles] = useState(false);
  const [particleEmojis, setParticleEmojis] = useState<string[]>([]);
  const [lastLevel, setLastLevel] = useState(0);

  const { faceData, frameProcessor } = useFaceDetection(!gameStarted || hasFailed);
  const { isConnected } = useInternetConnectivity();
  const device = useCameraDevice('front') as any;
  const { hasPermission } = useCameraPermission();
  const scoreIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eyesClosedStartRef = useRef<number | null>(null);
  const outOfViewStartRef = useRef<number | null>(null);
  const internetLostStartRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (hasFailed) return;

    const { faceDetected, leftEyeOpenProbability, rightEyeOpenProbability, smilingProbability } = faceData;

    if (!gameStarted) {
      const eyesOpen = leftEyeOpenProbability > 0.5 && rightEyeOpenProbability > 0.5;
      const neutral = smilingProbability < 0.3;

      if (faceDetected && eyesOpen && neutral) {
        setFaceState('detected');
      } else {
        setFaceState('not_detected');
      }
    } else {
      const eyesOpen = leftEyeOpenProbability > 0.5 && rightEyeOpenProbability > 0.5;
      const neutral = smilingProbability < 0.4;

      setIsSmiling(!neutral);
      setEyesClosed(!eyesOpen);
      setIsOutOfView(!faceDetected);

      if (!faceDetected || !eyesOpen || !neutral) {
        setFaceState('warning');
      } else {
        setFaceState('detected');
      }
    }
  }, [faceData, gameStarted, hasFailed]);

  useEffect(() => {
    if (isVideoPlaying && !hasFailed && gameStarted) {
      scoreIntervalRef.current = setInterval(() => {
        setScore(prevScore => prevScore + 111);
      }, 1000);
    }
    return () => {
      if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
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
      const videoId = await getRandomGameVideo() || 'dQw4w9WgXcQ';
      setCurrentVideoId(videoId);
    } catch (error) {
      console.error('Video load error:', error);
      setCurrentVideoId('dQw4w9WgXcQ');
    }
    setGameStarted(true);
    setScore(0);
    setWarningCount(0);
    warningStartTime.current = null;
  };

  const warningStartTime = useRef<number | null>(null);
  const [warningCount, setWarningCount] = useState(0);

  useEffect(() => {
    if (!gameStarted || hasFailed) return;
    
    if (faceState === 'warning') {
      if (warningStartTime.current === null) {
        warningStartTime.current = Date.now();
      }
      setWarningCount(prev => prev + 1);
    } else {
      warningStartTime.current = null;
    }
  }, [faceState, gameStarted, hasFailed]);

  useEffect(() => {
    if (!gameStarted || hasFailed) return;
    
    const warningDuration = warningStartTime.current ? Date.now() - warningStartTime.current : 0;
    if (faceState === 'warning' && warningDuration > 1000) {
      triggerFail(isSmiling ? 'smile' : eyesClosed ? 'eyes_closed' : 'face_lost');
    }
  }, [faceState, gameStarted, hasFailed, isSmiling, eyesClosed]);

  useEffect(() => {
    if (!gameStarted || hasFailed) return;
    
    if (eyesClosed) {
      if (eyesClosedStartRef.current === null) {
        eyesClosedStartRef.current = Date.now();
      }
      if (Date.now() - eyesClosedStartRef.current > 2000) {
        triggerFail('eyes_closed');
      }
    } else {
      eyesClosedStartRef.current = null;
    }
  }, [eyesClosed, gameStarted, hasFailed]);

  useEffect(() => {
    if (!gameStarted || hasFailed) return;
    
    if (isOutOfView) {
      if (outOfViewStartRef.current === null) {
        outOfViewStartRef.current = Date.now();
      }
      if (Date.now() - outOfViewStartRef.current > 2000) {
        triggerFail('face_lost');
      }
    } else {
      outOfViewStartRef.current = null;
    }
  }, [isOutOfView, gameStarted, hasFailed]);

  useEffect(() => {
    if (!gameStarted || hasFailed) return;
    
    if (!isConnected) {
      if (internetLostStartRef.current === null) {
        internetLostStartRef.current = Date.now();
      }
      if (Date.now() - internetLostStartRef.current > 2000) {
        triggerFail('internet_lost');
      }
    } else {
      internetLostStartRef.current = null;
    }
  }, [isConnected, gameStarted, hasFailed]);

  const triggerFail = async (reason?: string) => {
    if (hasFailed) return;
    
    setHasFailed(true);
    setFaceState('failed');
    setIsVideoPlaying(false);

    const user = auth.currentUser;
    if (user && !userData?.isGuest) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const currentData = userDoc.data();
          const currentHighScore = currentData.highestSessionScore || 0;
          const currentLifetimeScore = currentData.lifetimeScore || 0;
          
          if (score > currentHighScore) {
            await updateDoc(doc(db, 'users', user.uid), {
              highestSessionScore: score,
              lifetimeScore: currentLifetimeScore + score,
            });
          } else {
            await updateDoc(doc(db, 'users', user.uid), {
              lifetimeScore: currentLifetimeScore + score,
            });
          }
        }
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }

    setTimeout(() => {
      setGameStarted(false);
      setHasFailed(false);
    }, 3000);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const onYouTubeChangeState = (state: string) => {
    if (state === 'playing') {
      setIsVideoPlaying(true);
    } else if (state === 'ended' || state === 'paused') {
      setIsVideoPlaying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.neonCyan} />
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
        <View style={styles.profileCard}>
          <Text style={styles.username}>
            {userData?.username || (userData?.isGuest ? 'Guest' : 'Player')}
          </Text>
          <Text style={styles.stats}>
            Level {userData?.currentLevel || 1} • {userData?.lifetimeScore || 0} pts
          </Text>
          <Text style={styles.badges}>
            {userData?.badgeIds && userData.badgeIds.length > 0
              ? `Badges: ${userData.badgeIds.length}` 
              : 'No Badges Yet 💀'}
          </Text>
        </View>

        <View style={styles.faceDetectionContainer}>
          {device && hasPermission ? (
            <View style={styles.cameraPreview}>
              <Camera
                style={absoluteFill}
                device={device}
                isActive={true}
                frameProcessor={frameProcessor}
              />
            </View>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraPlaceholderText}>Front Camera Required</Text>
            </View>
          )}

          {device && hasPermission && (
            <View style={styles.checklistCard}>
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
          )}

          {(!hasPermission) && (
            <TouchableOpacity style={styles.primaryButton} onPress={() => {}} disabled>
              <Text style={styles.primaryButtonText}>REQUESTING CAMERA ACCESS...</Text>
            </TouchableOpacity>
          )}
        </View>

        {allReady && hasPermission && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startGame}
          >
            <Text style={styles.startButtonText}>START GAME</Text>
          </TouchableOpacity>
        )}

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/leaderboard')}
          >
            <Text style={styles.actionButtonText}>Leaderboard 🏆</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Text style={styles.actionButtonText}>Find Players 🔍</Text>
          </TouchableOpacity>
        </View>
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
        </View>
      </View>
    );
  }

  return (
    <View style={styles.gameContainer}>
      <YouTubePlayer
        videoId={currentVideoId}
        style={absoluteFill}
        onStateChange={onYouTubeChangeState}
        onError={() => triggerFail('video_fail')}
      />
      
      <View style={styles.scoreOverlay}>
        <Text style={styles.scoreText}>{score.toLocaleString()}</Text>
        <Text style={styles.scoreLabel}>POINTS</Text>
        {lastLevel > 0 && <Text style={styles.levelText}>LVL {lastLevel}</Text>}
      </View>

      {device && hasPermission && (
        <View style={styles.pipContainer}>
          <Camera
            style={absoluteFill}
            device={device}
            isActive={!hasFailed}
            frameProcessor={frameProcessor}
          />

          {faceState === 'warning' && (
            <View style={styles.warningBorder}>
              <Text style={styles.warningBorderText}>
                {isSmiling ? "DON'T SMILE!" :
                 eyesClosed ? 'OPEN YOUR EYES!' :
                 'STAY IN FRAME!'}
              </Text>
            </View>
          )}
        </View>
      )}

      <EmojiParticles
        emojis={particleEmojis}
        visible={showParticles}
        onComplete={() => setShowParticles(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    alignItems: 'center',
  },
  profileCard: {
    width: '100%',
    borderWidth: 3,
    borderColor: colors.neonMagenta,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
    marginTop: 20,
  },
  username: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.neonMagenta,
    textShadowColor: colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 2,
    marginBottom: 8,
  },
  stats: {
    fontSize: 14,
    color: colors.neonYellow,
    fontWeight: '600',
    textShadowColor: colors.neonYellow,
    textShadowRadius: 8,
    marginBottom: 4,
  },
  badges: {
    fontSize: 16,
    color: colors.neonCyan,
    fontWeight: '700',
    textShadowColor: colors.neonMagenta,
    textShadowRadius: 6,
  },
  startButton: {
    marginTop: 20,
    backgroundColor: colors.neonCyan,
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: colors.neonMagenta,
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.background,
    letterSpacing: 3,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: colors.neonCyan,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.background,
  },
  faceDetectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  cameraPreview: {
    width: 250,
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.neonCyan,
  },
  cameraPlaceholder: {
    width: 250,
    height: 250,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.neonMagenta,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  cameraPlaceholderText: {
    color: colors.neonMagenta,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  checklistCard: {
    position: 'absolute',
    bottom: -120,
    backgroundColor: '#10142d',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.neonCyan,
    width: 280,
    alignItems: 'center',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checklistText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scoreOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    ...absoluteFill,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
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
  quickActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 15,
  },
  actionButton: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neonYellow,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.neonYellow,
  },
});