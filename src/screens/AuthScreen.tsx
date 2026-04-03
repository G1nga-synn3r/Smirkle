import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
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
import { auth } from '../../firebase';
import OctagonInput from '../../components/OctagonInput';
import EmojiParticles from '../../components/EmojiParticles';

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
      <View className="flex-1 justify-center items-center bg-midnight-bg">
        <ActivityIndicator size="large" color="#00ffea" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-midnight-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-grow justify-center p-10">
          <View className="items-center mb-15">
          <Text
            className="text-5xl text-neon-cyan text-center tracking-widest"
            style={{ fontFamily: 'LuckiestGuy_400Regular', textShadowColor: '#ffff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}
          >
            SMIRKLE
          </Text>
          <Text
            className="text-xl text-neon-yellow mt-2.5 text-center"
            style={{ fontFamily: 'LuckiestGuy_400Regular' }}
          >
            Login to unleash your smirk
          </Text>
        </View>

        <View className="flex-1 justify-center">
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

          <View className="items-center mt-10 mb-5">
            {loading ? (
              <ActivityIndicator size="large" color="#00ffea" />
            ) : (
              <Text
                className="text-2xl text-neon-magenta py-4 px-10 border-3 border-neon-cyan rounded-2xl tracking-widest uppercase"
                style={{
                  fontFamily: 'LuckiestGuy_400Regular',
                  backgroundColor: 'rgba(0, 255, 234, 0.1)',
                  shadowColor: '#00ffea',
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 10
                }}
                onPress={isLogin ? handleSignIn : handleSignUp}
              >
                {isLogin ? 'SIGN IN' : 'SIGN UP'}
              </Text>
            )}
          </View>

          <View className="flex-row justify-center items-center my-2.5">
            <Text className="text-base text-midnight-gray">
              {isLogin ? "Don't have an account?" : 'Have an account?'}
            </Text>
            <Text className="text-base text-neon-cyan font-bold ml-1.25" onPress={toggleForm}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Text>
          </View>

          {isLogin && (
            <Text className="text-sm text-neon-yellow text-center underline" onPress={handleForgotPassword}>
              Forgot Password?
            </Text>
          )}
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


