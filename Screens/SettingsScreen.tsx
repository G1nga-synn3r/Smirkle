import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from '../firebase';

type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
};

const SETTINGS_KEYS = {
  HAPTIC_FEEDBACK: 'settings_haptic',
  VIDEO_QUALITY: 'settings_video_quality',
  VOLUME: 'settings_volume',
  THEME: 'settings_theme',
};

const VIDEO_QUALITY_OPTIONS = ['Low', 'Med', 'High'];
const THEME_OPTIONS = ['Dark', 'Light'];

const SettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [videoQuality, setVideoQuality] = useState(1); // 0=Low, 1=Med, 2=High
  const [volume, setVolume] = useState(0.5);
  const [theme, setTheme] = useState(0); // 0=Dark, 1=Light
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const haptic = await AsyncStorage.getItem(SETTINGS_KEYS.HAPTIC_FEEDBACK);
      const video = await AsyncStorage.getItem(SETTINGS_KEYS.VIDEO_QUALITY);
      const vol = await AsyncStorage.getItem(SETTINGS_KEYS.VOLUME);
      const themeValue = await AsyncStorage.getItem(SETTINGS_KEYS.THEME);

      if (haptic !== null) setHapticEnabled(JSON.parse(haptic));
      if (video !== null) setVideoQuality(parseInt(video, 10));
      if (vol !== null) setVolume(parseFloat(vol));
      if (themeValue !== null) setTheme(parseInt(themeValue, 10));
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const triggerHaptic = async () => {
    if (hapticEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleHapticToggle = async (value: boolean) => {
    setHapticEnabled(value);
    saveSetting(SETTINGS_KEYS.HAPTIC_FEEDBACK, value);
    if (value) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleVideoQualityChange = async (index: number) => {
    setVideoQuality(index);
    saveSetting(SETTINGS_KEYS.VIDEO_QUALITY, index);
    await triggerHaptic();
  };

  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    saveSetting(SETTINGS_KEYS.VOLUME, value.toString());
  };

  const handleVolumeChangeComplete = async () => {
    await triggerHaptic();
  };

  const handleLogout = async () => {
    Alert.alert(
      'LOGOUT 💀',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
              // Reset navigation to Auth screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-midnight-bg p-5">
        <Text className="text-lg text-neon-cyan text-center mt-12.5">Loading settings...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-midnight-bg p-5">
      <Text className="text-2xl font-bold text-neon-yellow text-center mb-7.5"
        style={{ textShadowColor: '#ffff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}
      >
        ⚙️ SETTINGS
      </Text>

      {/* Haptic Feedback Toggle */}
      <View className="bg-midnight-surface rounded-2xl p-4 mb-4 border-2 border-midnight-gray-dark">
        <View className="mb-2.5">
          <Text className="text-lg font-bold text-neon-cyan"
            style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
          >
            Haptic Feedback
          </Text>
          <Text className="text-sm text-neon-magenta mt-1.25"
            style={{ textShadowColor: '#ff00ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 }}
          >
            Vibration feedback on interactions
          </Text>
        </View>
        <Switch
          value={hapticEnabled}
          onValueChange={handleHapticToggle}
          thumbColor={hapticEnabled ? '#00ffea' : '#555'}
          trackColor={{ false: '#333', true: '#00ffea' }}
        />
      </View>

      {/* Video Quality Toggle */}
      <View className="bg-midnight-surface rounded-2xl p-4 mb-4 border-2 border-midnight-gray-dark">
        <View className="mb-2.5">
          <Text className="text-lg font-bold text-neon-cyan"
            style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
          >
            Video Quality
          </Text>
          <Text className="text-sm text-neon-magenta mt-1.25"
            style={{ textShadowColor: '#ff00ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 }}
          >
            Higher quality uses more data
          </Text>
        </View>
        <View className="flex-row justify-around mt-2.5">
          {VIDEO_QUALITY_OPTIONS.map((quality, index) => (
            <TouchableOpacity
              key={quality}
              className={`py-2 px-5 rounded-xl border-2 bg-midnight-bg ${videoQuality === index ? 'border-neon-cyan bg-neon-cyan' : 'border-midnight-gray-dark'}`}
              onPress={() => handleVideoQualityChange(index)}
            >
              <Text className={`text-sm font-bold ${videoQuality === index ? 'text-midnight-bg' : 'text-midnight-gray'}`}>
                {quality}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Volume Slider */}
      <View className="bg-midnight-surface rounded-2xl p-4 mb-4 border-2 border-midnight-gray-dark">
        <View className="mb-2.5">
          <Text className="text-lg font-bold text-neon-cyan"
            style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
          >
            Volume
          </Text>
          <Text className="text-sm text-neon-magenta mt-1.25"
            style={{ textShadowColor: '#ff00ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 }}
          >
            Media volume level
          </Text>
        </View>
        <View className="flex-row items-center mt-2.5">
          <Text className="text-2xl mx-2.5">🔈</Text>
          <Slider
            className="flex-1 h-10"
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={handleVolumeChange}
            onSlidingComplete={handleVolumeChangeComplete}
            minimumTrackTintColor="#00ffea"
            maximumTrackTintColor="#333"
            thumbTintColor="#ffff00"
          />
          <Text className="text-2xl mx-2.5">🔊</Text>
        </View>
        <Text className="text-base font-bold text-neon-yellow text-center mt-1.25"
          style={{ textShadowColor: '#ffff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
        >
          {Math.round(volume * 100)}%
        </Text>
      </View>

      {/* Theme Toggle */}
      <View className="bg-midnight-surface rounded-2xl p-4 mb-4 border-2 border-midnight-gray-dark">
        <View className="mb-2.5">
          <Text className="text-lg font-bold text-neon-cyan"
            style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
          >
            Theme
          </Text>
          <Text className="text-sm text-neon-magenta mt-1.25"
            style={{ textShadowColor: '#ff00ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 }}
          >
            Light or dark mode
          </Text>
        </View>
        <View className="flex-row justify-around mt-2.5">
          {THEME_OPTIONS.map((themeOption, index) => (
            <TouchableOpacity
              key={themeOption}
              className={`py-2 px-5 rounded-xl border-2 bg-midnight-bg ${theme === index ? 'border-neon-cyan bg-neon-cyan' : 'border-midnight-gray-dark'}`}
              onPress={async () => {
                setTheme(index);
                await saveSetting(SETTINGS_KEYS.THEME, index);
                await triggerHaptic();
              }}
            >
              <Text className={`text-sm font-bold ${theme === index ? 'text-midnight-bg' : 'text-midnight-gray'}`}>
                {themeOption}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Spacer */}
      <View className="flex-1" />

      {/* Logout Button */}
      <TouchableOpacity
        className="bg-midnight-bg border-3 border-neon-magenta rounded-3xl py-4 items-center mb-5"
        style={{ shadowColor: '#ff00ff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }}
        onPress={handleLogout}
      >
        <Text className="text-neon-magenta text-xl font-bold tracking-wider"
          style={{ textShadowColor: '#ff00ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 }}
        >
          LOGOUT 💀
        </Text>
      </TouchableOpacity>
    </View>
  );
};



export default SettingsScreen;