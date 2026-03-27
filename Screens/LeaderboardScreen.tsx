import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

type UserRank = {
  id: string;
  nickname: string;
  lifetimeScore: number;
  sessionHighScore: number;
};

const LeaderboardScreen = () => {
  const [activeTab, setActiveTab] = useState<'lifetime' | 'session'>('lifetime');
  const [users, setUsers] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const field = activeTab === 'lifetime' ? 'lifetimeScore' : 'sessionHighScore';
      const q = query(
        collection(db, 'users'),
        orderBy(field, 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const userData: UserRank[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        nickname: doc.data().nickname || 'Anonymous',
        lifetimeScore: doc.data().lifetimeScore || 0,
        sessionHighScore: doc.data().sessionHighScore || 0,
      }));

      setUsers(userData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBorderColor = (index: number) => {
    if (index === 0) return '#ffff00'; // Gold
    if (index === 1) return '#c0c0c0'; // Silver
    if (index === 2) return '#cd7f32'; // Bronze
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
    
    return (
      <View
        style={[
          styles.rankItem,
          { borderColor: getRankBorderColor(index) },
          index < 3 && styles.topThreeBorder
        ]}
      >
        <View style={styles.rankLeft}>
          <Text style={styles.rankNumber}>{getRankEmoji(index)}</Text>
          <Text style={styles.nickname}>{item.nickname}</Text>
        </View>
        <View style={styles.rankRight}>
          <Text style={[
            styles.scoreText,
            index < 3 && { color: getRankBorderColor(index) }
          ]}>
            {score.toLocaleString()} pts
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 LEADERBOARD</Text>
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lifetime' && styles.activeTab]}
          onPress={() => setActiveTab('lifetime')}
        >
          <Text style={[styles.tabText, activeTab === 'lifetime' && styles.activeTabText]}>
            LIFETIME
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'session' && styles.activeTab]}
          onPress={() => setActiveTab('session')}
        >
          <Text style={[styles.tabText, activeTab === 'session' && styles.activeTabText]}>
            SESSION
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#00ffea" />
          <Text style={styles.loadingText}>Loading rankings...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
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
  title: {
    color: '#ffff00',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#ffff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#00ffea',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#0a0a0a',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ffea',
    marginTop: 10,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  rankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  topThreeBorder: {
    borderWidth: 3,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
    marginRight: 10,
  },
  nickname: {
    color: '#00ffea',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#00ffea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  rankRight: {
    alignItems: 'flex-end',
  },
  scoreText: {
    color: '#ffff00',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#ffff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default LeaderboardScreen;