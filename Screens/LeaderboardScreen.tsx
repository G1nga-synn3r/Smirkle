import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

type UserRank = {
  id: string;
  username: string;
  lifetimeScore: number;
  sessionHighScore: number;
};

const LeaderboardScreen = () => {
  const [activeTab, setActiveTab] = useState<'session' | 'lifetime'>('session');
  const [users, setUsers] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTop1000, setShowTop1000] = useState(false);
  const DISPLAY_LIMIT = 20;
  const MAX_LIMIT = 1000;

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, showTop1000]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const field = activeTab === 'lifetime' ? 'lifetimeScore' : 'sessionHighScore';
      const limitCount = showTop1000 ? MAX_LIMIT : DISPLAY_LIMIT;
      const q = query(
        collection(db, 'users'),
        orderBy(field, 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const userData: UserRank[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          username: doc.data().username || 'Anonymous',
          lifetimeScore: doc.data().lifetimeScore || 0,
          sessionHighScore: doc.data().sessionHighScore || 0,
        }))
        .filter((user) => user.username && !user.username.toLowerCase().startsWith('guest_'));

      setUsers(userData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBorderColor = (index: number) => {
    if (index === 0) return '#ffff00';
    if (index === 1) return '#c0c0c0';
    if (index === 2) return '#cd7f32';
    return '#333';
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return '👑';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const renderItem = ({ item, index }: { item: UserRank; index: number }) => {
    const score = activeTab === 'lifetime' ? item.lifetimeScore : item.sessionHighScore;
    const highScore = item.sessionHighScore;

    return (
      <View
        className="flex-row justify-between items-center bg-midnight-surface p-4 mb-2.5 rounded-xl border-2"
        style={{
          borderColor: getRankBorderColor(index),
          borderWidth: index < 3 ? 3 : 2,
          shadowColor: index < 3 ? '#fff' : undefined,
          shadowOffset: index < 3 ? { width: 0, height: 0 } : undefined,
          shadowOpacity: index < 3 ? 0.5 : undefined,
          shadowRadius: index < 3 ? 10 : undefined,
        }}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-xl font-bold w-10 text-center mr-2.5">{getRankEmoji(index)}</Text>
          <Text className="text-base font-bold text-neon-cyan"
            style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
          >
            @{item.username}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-base font-bold text-neon-yellow"
            style={{
              textShadowColor: '#ffff00',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 3,
              color: index < 3 ? getRankBorderColor(index) : '#ffff00'
            }}
          >
            {score.toLocaleString()} pts
          </Text>
          {activeTab === 'lifetime' && highScore > 0 && (
            <Text className="text-xs text-neon-magenta mt-0.5">Best: {highScore.toLocaleString()}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-midnight-bg p-5">
      <Text className="text-2xl font-bold text-neon-yellow text-center mb-5"
        style={{ textShadowColor: '#ffff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}
      >
        🏆 LEADERBOARD
      </Text>
      
      <View className="flex-row mb-5 bg-midnight-surface rounded-2xl p-1.25">
        <TouchableOpacity
          className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'session' ? 'bg-neon-cyan' : ''}`}
          onPress={() => { setActiveTab('session'); setShowTop1000(false); }}
        >
          <Text className={`text-sm font-bold ${activeTab === 'session' ? 'text-midnight-bg' : 'text-midnight-gray'}`}>
            HIGH SCORE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'lifetime' ? 'bg-neon-cyan' : ''}`}
          onPress={() => { setActiveTab('lifetime'); setShowTop1000(false); }}
        >
          <Text className={`text-sm font-bold ${activeTab === 'lifetime' ? 'text-midnight-bg' : 'text-midnight-gray'}`}>
            LIFETIME
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00ffea" />
          <Text className="text-base text-neon-cyan mt-2.5">Loading rankings...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          
          {!showTop1000 && users.length >= 20 && (
            <TouchableOpacity
              className="bg-midnight-surface border-2 border-neon-cyan rounded-3xl py-4 px-7.5 items-center mt-2.5 mb-5"
              onPress={() => setShowTop1000(true)}
            >
              <Text className="text-base font-bold text-neon-cyan"
                style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 }}
              >
                View Top 1000
              </Text>
            </TouchableOpacity>
          )}

          {showTop1000 && (
            <TouchableOpacity
              className="bg-midnight-surface border-2 border-neon-cyan rounded-3xl py-4 px-7.5 items-center mt-2.5 mb-5"
              onPress={() => setShowTop1000(false)}
            >
              <Text className="text-base font-bold text-neon-cyan"
                style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 }}
              >
                Show Less
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};



export default LeaderboardScreen;