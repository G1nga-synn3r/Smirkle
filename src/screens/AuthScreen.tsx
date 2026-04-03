import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Font from 'expo-font';
import { LuckiestGuy_400Regular } from '@expo-google-fonts/luckiest-guy';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import OctagonInput from '../components/OctagonInput';
import EmojiParticles from '../components/EmojiParticles';

const sparkleEmojis = ['✨', '⭐', '🌟', '💫', '⚡️'];

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    await Font.loadAsync({
      LuckiestGuy_400Regular,
    });
    setFontLoaded(true);
  };

  const handleSparkle = useCallback((inputName: string) => {
    setFocusedInput(inputName);
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 2000);
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created! Please sign in.');
      setIsLogin(true);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality coming soon!');
  };

  if (!fontLoaded) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00ffea" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>SMIRKLE</Text>
          <Text style={styles.subtitle}>Login to unleash your smirk</Text>
        </View>

        <View style={styles.form}>
          <OctagonInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onSparkle={() => handleSparkle('email')}
            fontLoaded={fontLoaded}
          />

          <OctagonInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onSparkle={() => handleSparkle('password')}
            fontLoaded={fontLoaded}
          />

          <OctagonInput
            label="Confirm Password"
            value={password}
            editable={false}
            placeholder="Matches password"
            fontLoaded={fontLoaded}
          />

          {showSparkle && focusedInput && (
            <EmojiParticles
              emojis={sparkleEmojis}
              visible={true}
              onComplete={() => setShowSparkle(false)}
            />
          )}

          <View style={styles.buttonContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#00ffea" />
            ) : (
              <Text 
                style={styles.actionButton}
                onPress={isLogin ? handleSignIn : handleSignUp}
              >
                {isLogin ? 'SIGN IN' : 'SIGN UP'}
              </Text>
            )}
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account?" : 'Have an account?'}
            </Text>
            <Text style={styles.switchLink} onPress={toggleForm}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Text>
          </View>

          {isLogin && (
            <Text style={styles.forgotLink} onPress={handleForgotPassword}>
              Forgot Password?
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontFamily: 'LuckiestGuy_400Regular',
    fontSize: 48,
    color: '#00ffea',
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: '#ffff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: 'LuckiestGuy_400Regular',
    fontSize: 20,
    color: '#ffff00',
    marginTop: 10,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  actionButton: {
    fontFamily: 'LuckiestGuy_400Regular',
    fontSize: 24,
    color: '#ff00ff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderWidth: 3,
    borderColor: '#00ffea',
    backgroundColor: 'rgba(0, 255, 234, 0.1)',
    borderRadius: 25,
    letterSpacing: 3,
    textTransform: 'uppercase',
    shadowColor: '#00ffea',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchText: {
    color: '#555555',
    fontSize: 16,
  },
  switchLink: {
    color: '#00ffea',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  forgotLink: {
    color: '#ffff00',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

