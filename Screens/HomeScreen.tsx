import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const COLORS = {
  background: '#0a0a0a',
  neonCyan: '#00ffea',
  neonYellow: '#ffff00',
  neonMagenta: '#ff00ff',
};

interface UserData {
  username: string;
  level: number;
  lifetimeScore: number;
  badges: string[];
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handlePlay = () => {
    navigation.navigate('Game');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.neonCyan} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.username}>
          {userData?.username || 'Player'}
        </Text>
        <Text style={styles.stats}>
          Level {userData?.level || 0} • {userData?.lifetimeScore || 0} pts
        </Text>
        <Text style={styles.badges}>
          {userData?.badges && userData.badges.length > 0
            ? userData.badges[0]
            : 'No Badges Yet 💀'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePlay}
      >
        <Text style={styles.playButtonText}>😎 PLAY SMIRKLE</Text>
      </TouchableOpacity>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Text style={styles.actionButtonText}>Leaderboard 🏆</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.actionButtonText}>Find Players 🔍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    alignItems: 'center',
  },
  profileCard: {
    width: '100%',
    borderWidth: 3,
    borderColor: COLORS.neonMagenta,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
    marginTop: 20,
  },
  username: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.neonMagenta,
    textShadowColor: COLORS.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 2,
    marginBottom: 8,
  },
  stats: {
    fontSize: 14,
    color: COLORS.neonYellow,
    fontWeight: '600',
    textShadowColor: COLORS.neonYellow,
    textShadowRadius: 8,
    marginBottom: 4,
  },
  badges: {
    fontSize: 16,
    color: COLORS.neonCyan,
    fontWeight: '700',
    textShadowColor: COLORS.neonMagenta,
    textShadowRadius: 6,
  },
  playButton: {
    marginTop: 60,
    backgroundColor: COLORS.neonCyan,
    paddingVertical: 30,
    paddingHorizontal: 50,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: COLORS.neonMagenta,
    shadowColor: COLORS.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 20,
  },
  playButtonText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.background,
    letterSpacing: 3,
    textShadowColor: COLORS.neonMagenta,
    textShadowRadius: 10,
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 15,
  },
  actionButton: {
    backgroundColor: COLORS.background,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.neonYellow,
    shadowColor: COLORS.neonYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.neonYellow,
    textShadowColor: COLORS.neonYellow,
    textShadowRadius: 5,
  },
});
