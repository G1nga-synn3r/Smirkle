import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [motto, setMotto] = useState('');
  const [location, setLocation] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [level, setLevel] = useState(1);
  const [lifetimeScore, setLifetimeScore] = useState(0);
  const [publicSettings, setPublicSettings] = useState<Record<string, boolean>>({
    username: true,
    motto: true,
    location: true,
    birthdate: true
  });
  const [loading, setLoading] = useState(false);

  // Helper function to get earned badges based on level and score
  const getEarnedBadges = (level: number, score: number) => {
    const badges = [];
    
    // Newbie (Default) - everyone gets this
    badges.push({ id: 'newbie', label: 'Newbie', emoji: '🌱' });
    
    // Smirk Master (Level 5)
    if (level >= 5) {
      badges.push({ id: 'smirk-master', label: 'Smirk Master', emoji: '😏' });
    }
    
    // Poker Face (Level 10)
    if (level >= 10) {
      badges.push({ id: 'poker-face', label: 'Poker Face', emoji: '🗿' });
    }
    
    // Unstoppable (Score > 50,000)
    if (score > 50000) {
      badges.push({ id: 'unstoppable', label: 'Unstoppable', emoji: '💥' });
    }
    
    return badges;
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUsername(data.username || '');
        setMotto(data.motto || '');
        setLocation(data.location || '');
        setBirthdate(data.birthdate || '');
        setLevel(data.level || 1);
        setLifetimeScore(data.lifetimeScore || 0);
        setPublicSettings(data.publicSettings || {
          username: true,
          motto: true,
          location: true,
          birthdate: true
        });
        
        if (data.profileImage) {
          setProfileImage(data.profileImage);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    // Check permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission denied', 'We need permission to access your photos');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const saveChanges = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setLoading(true);
      
      await updateDoc(doc(db, 'users', user.uid), {
        username,
        motto,
        location,
        birthdate,
        publicSettings,
        ...(profileImage ? { profileImage } : {})
      });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    } finally {
      setLoading(false);
    }
  };

  const renderField = ({ label, value, onChangeText, secureTextEntry = false }: { label: string; value: string; onChangeText: (text: string) => void; secureTextEntry?: boolean }) => {
    return (
      <View className="bg-midnight-surface rounded-2xl p-4 border-2"
        style={{ borderColor: isEditing ? '#00ffea' : '#333' }}
      >
        <Text className="text-base font-bold text-neon-yellow mb-2"
          style={{ textShadowColor: '#ffff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
        >
          {label}
        </Text>
        {isEditing ? (
          <TextInput
            className="text-neon-cyan text-base p-2 border border-neon-cyan rounded-lg bg-midnight-bg"
            style={{
              height: Platform.OS === 'ios' ? 40 : undefined,
              textShadowColor: '#00ffea',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 2
            }}
            placeholder={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
          />
        ) : (
          <Text className="text-base text-neon-cyan"
            style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
          >
            {value}
          </Text>
        )}
        <View className="flex-row justify-between items-center mt-2.5">
          <Text className="text-sm text-neon-magenta"
            style={{ textShadowColor: '#ff00ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 }}
          >
            Public
          </Text>
          <Switch
            value={publicSettings[label.toLowerCase()]}
            onValueChange={(value) => {
              setPublicSettings(prev => ({
                ...prev,
                [label.toLowerCase()]: value
              }));
            }}
            thumbColor={isEditing ? '#ffff00' : '#00ffea'}
            trackColor={{ false: '#555', true: '#00ffea' }}
          />
          <Text className="text-sm text-neon-magenta"
            style={{ textShadowColor: '#ff00ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 }}
          >
            Private
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-bold text-neon-cyan"
          style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-midnight-bg p-5">
      {/* Profile Image */}
      <View className="relative items-center mb-6">
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            className="w-30 h-30 rounded-3xl border-3 border-neon-magenta mb-2.5"
          />
        ) : (
          <View className="w-30 h-30 rounded-3xl bg-midnight-surface justify-center items-center border-3 border-neon-magenta">
            <MaterialCommunityIcons name="account-circle" size={80} color="#00ffea" />
          </View>
        )}
        <TouchableOpacity onPress={pickImage} className="absolute bottom-0 right-0 bg-midnight-bg border-2 border-neon-yellow rounded-2xl p-1.25">
          <MaterialCommunityIcons name="camera" size={24} color="#ffff00" />
        </TouchableOpacity>
      </View>

      {/* Profile Fields */}
      <View className="mb-6">
        {isEditing ? (
          <>
            <Text className="text-xl font-bold text-neon-yellow mb-2.5"
              style={{ textShadowColor: '#ffff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 }}
            >
              EDIT MODE 🔥
            </Text>
            <Text className="text-sm text-neon-magenta mb-4"
              style={{ textShadowColor: '#ff00ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
            >
              Tap fields to edit • Switches control privacy
            </Text>
          </>
        ) : (
          <Text className="text-xl font-bold text-neon-cyan mb-2.5"
            style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 }}
          >
            PROFILE VIEW
          </Text>
        )}

        <View className="gap-4">
          {renderField({
            label: 'Username',
            value: username,
            onChangeText: setUsername
          })}

          {renderField({
            label: 'Motto',
            value: motto,
            onChangeText: setMotto
          })}

          {renderField({
            label: 'Location',
            value: location,
            onChangeText: setLocation
          })}

          {renderField({
            label: 'Birthdate',
            value: birthdate,
            onChangeText: setBirthdate
          })}
        </View>
      </View>

      {/* Stats Section */}
      <View className="bg-midnight-surface rounded-3xl p-5 border-2 border-neon-cyan mb-6">
        <Text className="text-2xl font-bold text-neon-cyan text-center mb-4"
          style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 }}
        >
          STATS 💫
        </Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-base font-bold text-neon-yellow mb-1.25"
              style={{ textShadowColor: '#ffff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
            >
              LEVEL
            </Text>
            <Text className="text-lg font-bold text-neon-cyan"
              style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
            >
              LVL {level}
            </Text>
          </View>

          <View className="items-center">
            <Text className="text-base font-bold text-neon-yellow mb-1.25"
              style={{ textShadowColor: '#ffff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
            >
              SCORE
            </Text>
            <Text className="text-lg font-bold text-neon-cyan"
              style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
            >
              {lifetimeScore.toLocaleString()} pts
            </Text>
          </View>

          <View className="items-center">
            <Text className="text-base font-bold text-neon-yellow mb-1.25"
              style={{ textShadowColor: '#ffff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
            >
              BADGES
            </Text>
            <View className="mt-2.5">
              {getEarnedBadges(level, lifetimeScore).map((badge) => (
                <Text key={badge.id} className="text-base font-bold text-neon-yellow"
                  style={{ textShadowColor: '#ffff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
                >
                  {badge.emoji} {badge.label}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Save Button */}
      {isEditing ? (
        <TouchableOpacity
          onPress={saveChanges}
          className={`bg-midnight-bg border-2 border-neon-magenta rounded-3xl py-4 px-7.5 items-center justify-center ${!loading ? 'bg-neon-magenta' : ''}`}
          disabled={loading}
        >
          <Text className="text-midnight-bg text-lg font-bold tracking-wider">
            SAVE CHANGES 🔥
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => setIsEditing(true)}
          className="bg-midnight-bg border-2 border-neon-cyan rounded-3xl py-4 px-7.5 items-center justify-center"
        >
          <Text className="text-neon-cyan text-lg font-bold tracking-wider"
            style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
          >
            EDIT PROFILE ✏️
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};



export default ProfileScreen;