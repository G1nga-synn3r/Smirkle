import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import TutorialOverlay from '../../src/components/common/TutorialOverlay';

interface UserData {
  username: string;
  level: number;
  lifetimeScore: number;
  badges: string[];
  hasSeenTutorial?: boolean;
}



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
  const [showTutorial, setShowTutorial] = useState(false);

  const fetchUserData = async () => {
    if (!auth.currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
        if (!data.hasSeenTutorial) {
          setShowTutorial(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleTutorialClose = useCallback(async () => {
    if (auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        hasSeenTutorial: true
      });
      setShowTutorial(false);
    }
  }, []);

  const handlePlay = () => {
    navigation.navigate('Game');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-midnight-bg p-5 items-center">
        <ActivityIndicator size="large" color="#00ffea" />
      </View>
    );
  }

  return (
    <>
      <TutorialOverlay visible={showTutorial} onClose={handleTutorialClose} />
      <View className="flex-1 bg-midnight-bg p-5 items-center">
        <View className="w-full border-3 border-neon-magenta rounded-2xl p-5 items-center bg-midnight-surface mt-5">
          <Text className="text-4xl font-black text-neon-magenta text-center tracking-wider mb-2"
                style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 }}>
            {userData?.username || 'Player'}
          </Text>
          <Text className="text-sm text-neon-yellow font-semibold mb-1"
                style={{ textShadowColor: '#ffff00', textShadowRadius: 8 }}>
            Level {userData?.level || 0} • {userData?.lifetimeScore || 0} pts
          </Text>
          <Text className="text-base text-neon-cyan font-bold"
                style={{ textShadowColor: '#ff00ff', textShadowRadius: 6 }}>
            {userData?.badges && userData.badges.length > 0
              ? userData.badges[0]
              : 'No Badges Yet 💀'}
          </Text>
        </View>

        <TouchableOpacity
          className="mt-15 bg-neon-cyan py-8 px-12 rounded-2xl border-4 border-neon-magenta"
          style={{ shadowColor: '#00ffea', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 30, elevation: 20 }}
          onPress={handlePlay}
        >
          <Text className="text-2xl font-black text-midnight-bg tracking-widest"
                style={{ textShadowColor: '#ff00ff', textShadowRadius: 10 }}>😎 PLAY SMIRKLE</Text>
        </TouchableOpacity>

        <View className="flex-row mt-10 gap-4">
          <TouchableOpacity
            className="bg-midnight-bg py-4 px-5 rounded-xl border-3 border-neon-yellow"
            style={{ shadowColor: '#ffff00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8 }}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Text className="text-sm font-extrabold text-neon-yellow"
                  style={{ textShadowColor: '#ffff00', textShadowRadius: 5 }}>Leaderboard 🏆</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-midnight-bg py-4 px-5 rounded-xl border-3 border-neon-yellow"
            style={{ shadowColor: '#ffff00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8 }}
            onPress={() => navigation.navigate('Search')}
          >
            <Text className="text-sm font-extrabold text-neon-yellow"
                  style={{ textShadowColor: '#ffff00', textShadowRadius: 5 }}>Find Players 🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

        <StyledTouchableOpacity
          className="mt-15 bg-neon-cyan py-8 px-12 rounded-2xl border-4 border-neon-magenta"
          style={{ shadowColor: '#00ffea', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 30, elevation: 20 }}
          onPress={handlePlay}
        >
          <StyledText className="text-2xl font-black text-midnight-bg tracking-widest"
                style={{ textShadowColor: '#ff00ff', textShadowRadius: 10 }}>😎 PLAY SMIRKLE</StyledText>
        </TouchableOpacity>

        <StyledView className="flex-row mt-10 gap-4">
          <StyledTouchableOpacity
            className="bg-midnight-bg py-4 px-5 rounded-xl border-3 border-neon-yellow"
            style={{ shadowColor: '#ffff00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8 }}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <StyledText className="text-sm font-extrabold text-neon-yellow"
                  style={{ textShadowColor: '#ffff00', textShadowRadius: 5 }}>Leaderboard 🏆</StyledText>
          </TouchableOpacity>
          <StyledTouchableOpacity
            className="bg-midnight-bg py-4 px-5 rounded-xl border-3 border-neon-yellow"
            style={{ shadowColor: '#ffff00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8 }}
            onPress={() => navigation.navigate('Search')}
          >
            <StyledText className="text-sm font-extrabold text-neon-yellow"
                  style={{ textShadowColor: '#ffff00', textShadowRadius: 5 }}>Find Players 🔍</StyledText>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

}


