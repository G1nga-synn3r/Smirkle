import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { authService } from '../../services/firebase/auth';
import { auth } from '../../services/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginScreen from '../../screens/LoginScreen';
import SignupScreen from '../../screens/SignupScreen';
import TutorialOverlay from '../../screens/TutorialOverlay';

const TUTORIAL_STORAGE_KEY = '@smirkle_tutorial_complete';

export default function AuthEntry() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialComplete, setTutorialComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

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
    if (tutorialComplete === null) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setIsAuthenticated(true);
        if (tutorialComplete) {
          router.replace('/(tabs)');
          return;
        }
        setShowTutorial(true);
      } else {
        setIsAuthenticated(false);
        setShowTutorial(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [router, tutorialComplete]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      setIsAuthenticated(true);

      if (tutorialComplete) {
        router.replace('/(tabs)/game');
        return;
      }

      setShowTutorial(true);
    } catch (error: any) {
      Alert.alert('Login failed', error?.message || 'Unable to sign in.');
      throw error;
    }
  };

  const handleGuestLogin = async () => {
    try {
      await authService.guestLogin();
      setIsAuthenticated(true);

      if (tutorialComplete) {
        router.replace('/(tabs)/game');
        return;
      }

      setShowTutorial(true);
    } catch (error: any) {
      Alert.alert('Guest login failed', error?.message || 'Unable to sign in as guest.');
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      await authService.register(email, password);
      setIsAuthenticated(true);
      setShowSignup(false);

      if (tutorialComplete) {
        router.replace('/(tabs)/game');
        return;
      }

      setShowTutorial(true);
    } catch (error: any) {
      Alert.alert('Sign up failed', error?.message || 'Unable to create account.');
      throw error;
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

  return (
    <View style={styles.container}>
      {!isAuthenticated && !showSignup && (
        <LoginScreen
          onLogin={handleLogin}
          onGuestLogin={handleGuestLogin}
          onForgotPassword={handleForgotPassword}
          onSwitchToSignup={() => setShowSignup(true)}
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
