import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Linking, Platform } from 'react-native';
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

        <TouchableOpacity
          className="my-5 py-3 px-7.5 rounded-3xl bg-midnight-gray-dark border border-red-400 self-center"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-sm font-bold text-red-400">GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pre-game: Face detection setup
  if (!gameStarted && !hasFailed) {
    return (
      <View className="flex-1 bg-midnight-bg p-5">
        <View className="mt-10 p-2.5 items-center">
          <Text className="text-4xl font-black text-neon-magenta tracking-widest"
                style={{ textShadowColor: '#ff00ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 }}>GET READY</Text>
          <Text className="text-base text-neon-yellow mt-2.5 text-center">Maintain your poker face!</Text>
        </View>

        <View className="flex-1 justify-center items-center mt-5">
          {/* Camera Preview */}
          <View className={`w-[70vw] h-[70vw] rounded-2xl overflow-hidden border-3 border-neon-cyan`}>
            <CameraView
              className="absolute inset-0"
              facing="front"
              onCameraReady={() => setIsReady(true)}
            />
            
            {/* Face detection overlay */}
            {faceState === 'not_detected' && (
              <View className="absolute inset-0 bg-overlay-black justify-center items-center p-5">
                <Text className="text-lg font-bold text-error-red text-center">Position your face in the frame</Text>
                <Text className="text-sm text-error-red mt-2.5 text-center">Keep eyes open and don't smile</Text>
              </View>
            )}
            
            {faceState === 'detected' && (
              <View className="absolute inset-0 bg-cyan-glow justify-center items-center p-5">
                <Text className="text-lg font-bold text-neon-cyan text-center">FACE DETECTED ✓</Text>
                <Text className="text-sm text-neon-cyan mt-2.5 text-center">You're ready to play!</Text>
              </View>
            )}
          </View>

          {/* Score display */}
          <View className="mt-5 p-4 bg-midnight-surface rounded-xl">
            <Text className="text-base font-bold text-neon-yellow">+111 points per second</Text>
          </View>

          {/* Start Button - only visible when face detected */}
          {faceDetected && (
            <TouchableOpacity
              className="mt-7.5 bg-neon-cyan py-5 px-12.5 rounded-3xl border-3 border-neon-magenta"
              style={{ shadowColor: '#00ffea', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20 }}
              onPress={startGame}
            >
              <Text className="text-xl font-black text-midnight-bg tracking-wider">START GAME</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          className="my-5 py-3 px-7.5 rounded-3xl bg-midnight-gray-dark border border-red-400 self-center"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-sm font-bold text-red-400">GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fail screen
  if (hasFailed) {
    return (
      <View className="flex-1 bg-warning-red justify-center items-center">
        <View className="bg-midnight-surface p-10 rounded-3xl w-[85%] items-center border-4 border-warning-red">
          <Text className="text-4xl font-black text-warning-red tracking-widest"
                style={{ textShadowColor: '#ff0000', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 }}>GAME OVER</Text>
          <Text className="text-xl font-bold text-neon-yellow mt-4">
            {isSmiling ? '😏 You smiled!' :
             eyesClosed ? '😑 Eyes closed too long!' :
             '📷 You went out of frame!'}
          </Text>
          <Text className="text-2xl font-black text-neon-cyan mt-5">FINAL SCORE: {score.toLocaleString()}</Text>
          <Text className="text-sm text-midnight-white mt-5 opacity-70">Returning to home...</Text>
        </View>
      </View>
    );
  }

  // Active game screen
  return (
    <View className="flex-1 bg-black">
      {/* YouTube Video Fullscreen */}
      <YouTubePlayer
        videoId={currentVideoId}
        className="absolute inset-0"
        onStateChange={onYouTubeChangeState}
      />
      
      {/* Score Display */}
      <View className="absolute top-12 left-5 bg-overlay-black p-4 rounded-xl border-2 border-neon-yellow">
        <Text className="text-4xl font-black text-neon-yellow">{score.toLocaleString()}</Text>
        <Text className="text-xs font-bold text-neon-yellow">POINTS</Text>
        {lastLevel > 0 && <Text className="text-sm font-bold text-neon-cyan mt-1">LVL {lastLevel}</Text>}
      </View>

      {/* Camera PiP Overlay */}
      <View className="absolute top-12 right-5 w-25 h-18.75 border-2 border-neon-cyan rounded-xl overflow-hidden">
        <CameraView
          className="absolute inset-0"
          facing="front"
        />
        
        {/* Warning Border */}
        {faceState === 'warning' && (
          <View className="absolute inset-0 bg-overlay-warning justify-center items-center border-3 border-warning-red">
            <Text className="text-xs font-bold text-midnight-white text-center">
              {isSmiling ? 'DON\'T SMILE!' :
               eyesClosed ? 'OPEN YOUR EYES!' :
               'STAY IN FRAME!'}
            </Text>
          </View>
        )}
      </View>

      {/* Stop Button */}
      <TouchableOpacity
        className="absolute bottom-12 self-center bg-overlay-warning py-2.5 px-7.5 rounded-2xl border-2 border-warning-red"
        onPress={() => {
          setHasFailed(true);
          setIsVideoPlaying(false);
        }}
      >
        <Text className="text-base font-bold text-midnight-white">STOP</Text>
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



export default GameScreen;