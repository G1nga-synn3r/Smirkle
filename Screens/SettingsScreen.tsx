import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ SETTINGS</Text>

      {/* Haptic Feedback Toggle */}
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Haptic Feedback</Text>
          <Text style={styles.settingDescription}>Vibration feedback on interactions</Text>
        </View>
        <Switch
          value={hapticEnabled}
          onValueChange={handleHapticToggle}
          thumbColor={hapticEnabled ? '#00ffea' : '#555'}
          trackColor={{ false: '#333', true: '#00ffea' }}
        />
      </View>

      {/* Video Quality Toggle */}
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Video Quality</Text>
          <Text style={styles.settingDescription}>Higher quality uses more data</Text>
        </View>
        <View style={styles.qualityButtons}>
          {VIDEO_QUALITY_OPTIONS.map((quality, index) => (
            <TouchableOpacity
              key={quality}
              style={[
                styles.qualityButton,
                videoQuality === index && styles.qualityButtonActive
              ]}
              onPress={() => handleVideoQualityChange(index)}
            >
              <Text style={[
                styles.qualityButtonText,
                videoQuality === index && styles.qualityButtonTextActive
              ]}>
                {quality}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Volume Slider */}
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Volume</Text>
          <Text style={styles.settingDescription}>Media volume level</Text>
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.volumeIcon}>🔈</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={handleVolumeChange}
            onSlidingComplete={handleVolumeChangeComplete}
            minimumTrackTintColor="#00ffea"
            maximumTrackTintColor="#333"
            thumbTintColor="#ffff00"
          />
          <Text style={styles.volumeIcon}>🔊</Text>
        </View>
        <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
      </View>

      {/* Theme Toggle */}
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Theme</Text>
          <Text style={styles.settingDescription}>Light or dark mode</Text>
        </View>
        <View style={styles.themeButtons}>
          {THEME_OPTIONS.map((themeOption, index) => (
            <TouchableOpacity
              key={themeOption}
              style={[
                styles.themeButton,
                theme === index && styles.themeButtonActive
              ]}
              onPress={async () => {
                setTheme(index);
                await saveSetting(SETTINGS_KEYS.THEME, index);
                await triggerHaptic();
              }}
            >
              <Text style={[
                styles.themeButtonText,
                theme === index && styles.themeButtonTextActive
              ]}>
                {themeOption}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>LOGOUT 💀</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  loadingText: {
    color: '#00ffea',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  title: {
    color: '#ffff00',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: '#ffff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  settingItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#333',
  },
  settingInfo: {
    marginBottom: 10,
  },
  settingLabel: {
    color: '#00ffea',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#00ffea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  settingDescription: {
    color: '#ff00ff',
    fontSize: 14,
    marginTop: 5,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  qualityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  qualityButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#0a0a0a',
  },
  qualityButtonActive: {
    borderColor: '#00ffea',
    backgroundColor: '#00ffea',
  },
  qualityButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  qualityButtonTextActive: {
    color: '#0a0a0a',
  },
  themeButtonTextActive: {
    color: '#0a0a0a',
  },
  themeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  themeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#0a0a0a',
  },
  themeButtonActive: {
    borderColor: '#00ffea',
    backgroundColor: '#00ffea',
  },
  themeButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  volumeIcon: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  volumeValue: {
    color: '#ffff00',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: '#ffff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#0a0a0a',
    borderWidth: 3,
    borderColor: '#ff00ff',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#ff00ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  logoutButtonText: {
    color: '#ff00ff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});

export default SettingsScreen;