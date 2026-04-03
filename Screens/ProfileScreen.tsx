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
      <View style={[styles.fieldContainer, { borderColor: isEditing ? '#00ffea' : '#333' }]}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={[
              styles.textInput,
              Platform.OS === 'ios' && styles.iosInput
            ]}
            placeholder={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
          />
        ) : (
          <Text style={styles.fieldValue}>{value}</Text>
        )}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Public</Text>
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
          <Text style={styles.toggleLabel}>Private</Text>
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
      <View style={styles.fieldsContainer}>
        {isEditing ? (
          <>
            <Text style={styles.editModeLabel}>EDIT MODE 🔥</Text>
            <Text style={styles.hintText}>Tap fields to edit • Switches control privacy</Text>
          </>
        ) : (
          <Text style={styles.viewModeLabel}>PROFILE VIEW</Text>
        )}
        
        <View style={styles.formContainer}>
          <View style={styles.fieldRow}>
            {renderField({ 
              label: 'Username', 
              value: username, 
              onChangeText: setUsername 
            })}
          </View>
          
          <View style={styles.fieldRow}>
            {renderField({ 
              label: 'Motto', 
              value: motto, 
              onChangeText: setMotto 
            })}
          </View>
          
          <View style={styles.fieldRow}>
            {renderField({ 
              label: 'Location', 
              value: location, 
              onChangeText: setLocation 
            })}
          </View>
          
          <View style={styles.fieldRow}>
            {renderField({ 
              label: 'Birthdate', 
              value: birthdate, 
              onChangeText: setBirthdate 
            })}
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>STATS 💫</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>LEVEL</Text>
            <Text style={styles.statValue}>LVL {level}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>SCORE</Text>
            <Text style={styles.statValue}>{lifetimeScore.toLocaleString()} pts</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>BADGES</Text>
            <View style={styles.badgesRow}>
              {getEarnedBadges(level, lifetimeScore).map((badge) => (
                <Text key={badge.id} style={styles.badgeText}>
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
          style={[
            styles.saveButton,
            !loading && styles.saveButtonEnabled
          ]}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            SAVE CHANGES 🔥
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          onPress={() => setIsEditing(true)} 
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>EDIT PROFILE ✏️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ffea',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#00ffea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  profileImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#ff00ff',
    marginBottom: 10,
  },
  defaultProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ff00ff',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: '#ffff00',
    borderRadius: 20,
    padding: 5,
  },
  fieldsContainer: {
    marginBottom: 25,
  },
  editModeLabel: {
    color: '#ffff00',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: '#ffff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  viewModeLabel: {
    color: '#00ffea',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: '#00ffea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  hintText: {
    color: '#ff00ff',
    fontSize: 14,
    marginBottom: 15,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  formContainer: {
    gap: 15,
  },
  fieldRow: {
    marginVertical: 5,
  },
  fieldContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: '#333',
  },
  fieldLabel: {
    color: '#ffff00',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: '#ffff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  fieldValue: {
    color: '#00ffea',
    fontSize: 16,
    textShadowColor: '#00ffea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  textInput: {
    color: '#00ffea',
    fontSize: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#00ffea',
    borderRadius: 8,
    backgroundColor: '#0a0a0a',
    textShadowColor: '#00ffea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  iosInput: {
    height: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  toggleLabel: {
    color: '#ff00ff',
    fontSize: 14,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  statsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#00ffea',
    marginBottom: 25,
  },
  statsTitle: {
    color: '#00ffea',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: '#00ffea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#ffff00',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: '#ffff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  statValue: {
    color: '#00ffea',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#00ffea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  badgesRow: {
    marginTop: 10,
  },
  badgeText: {
    color: '#ffff00',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#ffff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  saveButton: {
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: '#ff00ff',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonEnabled: {
    backgroundColor: '#ff00ff',
  },
  saveButtonText: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  editButton: {
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: '#00ffea',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#00ffea',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#00ffea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default ProfileScreen;