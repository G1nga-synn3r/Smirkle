import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCameraPermission } from 'react-native-vision-camera';
import { authService } from '../../services/firebase/auth';
import { auth } from '../../services/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginScreen from '../../screens/LoginScreen';
import SignupScreen from '../../screens/SignupScreen';
import GuestGateScreen from '../../screens/GuestGateScreen';
import TutorialOverlay from '../../screens/TutorialOverlay';

const TUTORIAL_STORAGE_KEY = '@smirkle_tutorial_complete';

export default function AuthEntry() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialComplete, setTutorialComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [showGuestGate, setShowGuestGate] = useState(false);
  const [pendingPostSignup, setPendingPostSignup] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    const loadTutorialState = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
        setTutorialComplete(storedValue === 'true');
      } catch (error) {
        console.warn('Failed to load tutorial state', error);
        setTutorialComplete(false);
      }
    };

    loadTutorialState();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setIsAuthenticated(true);
        setPendingPostSignup(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!pendingPostSignup || !isAuthenticated) {
      return;
    }

    if (hasPermission) {
      setPendingPostSignup(false);
      if (tutorialComplete) {
        router.replace('/(tabs)');
        return;
      }
      setShowTutorial(true);
      return;
    }

    (async () => {
      const granted = await requestPermission();
      setPendingPostSignup(false);

      if (granted) {
        if (tutorialComplete) {
          router.replace('/(tabs)');
          return;
        }
        setShowTutorial(true);
      } else {
        if (tutorialComplete) {
          router.replace('/(tabs)');
          return;
        }
        setShowTutorial(true);
      }
    })();
  }, [pendingPostSignup, isAuthenticated, hasPermission, tutorialComplete, router, requestPermission]);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.login(email, password);
      setIsAuthenticated(true);
      setPendingPostSignup(true);
    } catch (error: any) {
      Alert.alert('Login failed', error?.message || 'Unable to sign in.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleGuestFromGate = async (birthdate: Date) => {
    setLoading(true);
    try {
      await authService.guestLogin(birthdate);
      setIsAuthenticated(true);
      setPendingPostSignup(true);
    } catch (error: any) {
      Alert.alert('Guest login failed', error?.message || 'Unable to sign in as guest.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, username: string, birthdate: Date) => {
    setLoading(true);
    try {
      await authService.register(email, password, username, birthdate);
      setIsAuthenticated(true);
      setShowSignup(false);
      setPendingPostSignup(true);
    } catch (error: any) {
      Alert.alert('Sign up failed', error?.message || 'Unable to create account.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    if (!email.trim()) {
      Alert.alert('Enter your email', 'Please add your email address before requesting a password reset.');
      return;
    }

    try {
      await authService.resetPassword(email.trim());
      Alert.alert('Email sent', 'Password reset instructions have been sent to your email.');
    } catch (error: any) {
      Alert.alert('Reset failed', error?.message || 'Unable to send password reset email.');
    }
  };

  const handleTutorialComplete = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
      setTutorialComplete(true);
    } catch (error) {
      console.warn('Failed to save tutorial completion', error);
    }

    router.replace('/(tabs)');
  };

  if (loading || tutorialComplete === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ffea" />
      </View>
    );
  }

  if (showGuestGate) {
    return (
      <GuestGateScreen
        onConfirmAge={handleGuestFromGate}
        onBackToLogin={() => setShowGuestGate(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {!isAuthenticated && !showSignup && (
        <LoginScreen
          onLogin={handleLogin}
          onForgotPassword={handleForgotPassword}
          onSwitchToSignup={() => setShowSignup(true)}
          onShowGuestGate={() => setShowGuestGate(true)}
        />
      )}
      {!isAuthenticated && showSignup && (
        <SignupScreen
          onSignup={handleSignUp}
          onBackToLogin={() => setShowSignup(false)}
        />
      )}
      {isAuthenticated && showTutorial && (
        <TutorialOverlay onComplete={handleTutorialComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050816',
  },
});