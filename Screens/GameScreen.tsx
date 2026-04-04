import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { auth, db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import EmojiParticles from '../components/EmojiParticles';
import YouTubePlayer from '../components/YouTubePlayer';

type FaceState = 'not_detected' | 'detected' | 'warning' | 'failed';

export default function GameScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [faceState, setFaceState] = useState<FaceState>('not_detected');

  const [faceVisible, setFaceVisible] = useState(false);
  const [eyesOpen, setEyesOpen] = useState(false);
  const [gameFaceReady, setGameFaceReady] = useState(false);

  const [isSmiling, setIsSmiling] = useState(false);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [isOutOfView, setIsOutOfView] = useState(false);

  const [hasFailed, setHasFailed] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState('dQw4w9WgXcQ');
  const [showParticles, setShowParticles] = useState(false);
  const [particleEmojis, setParticleEmojis] = useState<string[]>([]);
  const [lastLevel, setLastLevel] = useState(0);

  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningStartTime = useRef<number | null>(null);
  const eyesClosedStartTime = useRef<number | null>(null);
  const outOfViewStartTime = useRef<number | null>(null);

  const checklistComplete = faceVisible && eyesOpen && gameFaceReady;

  const funnyVideos = [
    'dQw4w9WgXcQ',
    'jNQXAC9IVRw',
    '3tmd-ClpJxA',
    '9bZkp7q19f0',
    'VjCotWK6CB4',
    'CSvFpBOe8eY',
    'K4TOrB7at0Y',
    'p87wZ-IIVFI',
  ];

  const resetToChecklist = () => {
    setHasFailed(false);
    setGameStarted(false);
    setScore(0);
    setIsVideoPlaying(false);
    setIsSmiling(false);
    setEyesClosed(false);
    setIsOutOfView(false);
    setFaceState('not_detected');
    setFaceVisible(false);
    setEyesOpen(false);
    setGameFaceReady(false);
    warningStartTime.current = null;
    eyesClosedStartTime.current = null;
    outOfViewStartTime.current = null;
  };

  useEffect(() => {
    if (!isReady || hasFailed) return;

    const checkInterval = setInterval(() => {
      if (!gameStarted) {
        const visible = Math.random() > 0.25;
        const open = Math.random() > 0.25;
        const gameFace = Math.random() > 0.35;

        setFaceVisible(visible);
        setEyesOpen(open);
        setGameFaceReady(gameFace);
        setFaceState(visible ? 'detected' : 'not_detected');
      } else {
        const smileCheck = Math.random();
        const eyesCheck = Math.random();
        const viewCheck = Math.random();

        const currentSmiling = smileCheck > 0.6;
        const currentEyesClosed = eyesCheck > 0.7;
        const currentOutOfView = viewCheck > 0.85;

        setIsSmiling(currentSmiling);
        setEyesClosed(currentEyesClosed);
        setIsOutOfView(currentOutOfView);

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

  useEffect(() => {
    if (!gameStarted || hasFailed) return;

    const warningDuration = warningStartTime.current ? Date.now() - warningStartTime.current : 0;
    if (faceState === 'warning' && warningDuration > 1000) {
      if (isSmiling || eyesClosed || isOutOfView) {
        triggerFail();
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

  const startGame = () => {
    const randomVideo = funnyVideos[Math.floor(Math.random() * funnyVideos.length)];
    setCurrentVideoId(randomVideo);
    setGameStarted(true);
    setScore(0);
    warningStartTime.current = null;
    eyesClosedStartTime.current = null;
    outOfViewStartTime.current = null;
    setFaceState('detected');
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
        resetToChecklist();
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

  const renderChecklistItem = (label: string, checked: boolean) => {
    return (
      <View className="flex-row items-center justify-between rounded-3xl p-4 bg-midnight-surface border-2" style={{ borderColor: checked ? '#00ffea' : '#334155' }}>
        <Text className="text-base font-bold text-neon-cyan">{label}</Text>
        <View className={`w-10 h-10 rounded-full justify-center items-center ${checked ? 'bg-neon-cyan' : 'bg-midnight-bg'}`}>
          <Text className="text-lg">{checked ? '✓' : '○'}</Text>
        </View>
      </View>
    );
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-midnight-bg p-5">
        <View className="mt-10 p-2.5 items-center">
          <Text className="text-4xl font-black text-neon-magenta tracking-widest"
                style={{ textShadowColor: '#ff00ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 }}>SMIRKLE</Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-xl font-bold text-error-red text-center">REQUESTING CAMERA ACCESS...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-midnight-bg p-5">
        <View className="mt-10 p-2.5 items-center">
          <Text className="text-4xl font-black text-neon-magenta tracking-widest"
                style={{ textShadowColor: '#ff00ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 }}>SMIRKLE</Text>
        </View>

        <View className="flex-1 justify-center items-center">
          <Text className="text-xl font-bold text-error-red text-center">CAMERA ACCESS REQUIRED</Text>
          <Text className="text-sm text-error-red mt-2.5 text-center">
            Face detection is required to play
          </Text>
          <TouchableOpacity
            className="mt-7.5 py-4 px-7.5 rounded-3xl bg-gray-800 border-2 border-error-red"
            onPress={requestCameraPermission}
          >
            <Text className="text-base font-bold text-error-red">GRANT ACCESS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!gameStarted && !hasFailed) {
    return (
      <View className="flex-1 bg-midnight-bg p-5">
        <View className="mt-10 p-2.5 items-center">
          <Text className="text-4xl font-black text-neon-magenta tracking-widest"
                style={{ textShadowColor: '#ff00ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 }}>READY CHECKLIST</Text>
          <Text className="text-base text-neon-yellow mt-2.5 text-center">Match all three requirements before the game starts.</Text>
        </View>

        <View className="flex-1 justify-center px-4">
          {checklistComplete && (
            <TouchableOpacity
              className="mb-8 bg-neon-cyan py-5 rounded-3xl border-3 border-neon-magenta"
              style={{ shadowColor: '#00ffea', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20 }}
              onPress={startGame}
            >
              <Text className="text-xl font-black text-midnight-bg tracking-wider text-center">START GAME</Text>
            </TouchableOpacity>
          )}

          {renderChecklistItem('Face visible', faceVisible)}
          {renderChecklistItem('Eyes open', eyesOpen)}
          {renderChecklistItem('Game face', gameFaceReady)}

          <View className="mt-10 rounded-3xl overflow-hidden border-3 border-neon-cyan h-[360px] bg-black">
            <CameraView
              className="absolute inset-0"
              facing="front"
              onCameraReady={() => setIsReady(true)}
            />
            {faceState === 'not_detected' && (
              <View className="absolute inset-0 bg-overlay-black justify-center items-center p-5">
                <Text className="text-lg font-bold text-error-red text-center">Keep your face inside the frame</Text>
              </View>
            )}
            {faceState === 'detected' && (
              <View className="absolute inset-0 bg-overlay-black/40 justify-center items-center p-5">
                <Text className="text-lg font-bold text-neon-cyan text-center">You're ready to play.</Text>
              </View>
            )}
          </View>

          <View className="mt-6 p-4 bg-midnight-surface rounded-3xl border-2 border-neon-cyan">
            <Text className="text-base font-bold text-neon-yellow">Game prep</Text>
            <Text className="text-sm text-neon-cyan mt-2">Once all checks are complete, tap START GAME. Keep your face visible, eyes open, and don't smile.</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <YouTubePlayer
        videoId={currentVideoId}
        className="absolute inset-0"
        onStateChange={onYouTubeChangeState}
      />

      <View className="absolute top-12 left-5 bg-overlay-black p-4 rounded-xl border-2 border-neon-yellow">
        <Text className="text-4xl font-black text-neon-yellow">{score.toLocaleString()}</Text>
        <Text className="text-xs font-bold text-neon-yellow">POINTS</Text>
        {lastLevel > 0 && <Text className="text-sm font-bold text-neon-cyan mt-1">LVL {lastLevel}</Text>}
      </View>

      <View className="absolute top-12 right-5 w-28 h-24 border-2 border-neon-cyan rounded-3xl overflow-hidden bg-black">
        <CameraView className="absolute inset-0" facing="front" />
        {faceState === 'warning' && (
          <View className="absolute inset-0 bg-overlay-warning justify-center items-center border-2 border-warning-red py-2 px-1">
            <Text className="text-xs font-bold text-midnight-white text-center">
              {isSmiling ? 'DON\'T SMILE!' :
               eyesClosed ? 'OPEN YOUR EYES!' :
               'STAY IN FRAME!'}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        className="absolute bottom-12 self-center bg-overlay-warning py-3 px-8 rounded-3xl border-2 border-warning-red"
        onPress={triggerFail}
      >
        <Text className="text-base font-bold text-midnight-white">STOP</Text>
      </TouchableOpacity>

      <EmojiParticles
        emojis={particleEmojis}
        visible={showParticles}
        onComplete={() => setShowParticles(false)}
      />
    </View>
  );
}
