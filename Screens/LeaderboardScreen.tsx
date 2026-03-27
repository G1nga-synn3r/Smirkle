import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
        style={[
          styles.rankItem,
          { borderColor: getRankBorderColor(index) },
          index < 3 && styles.topThreeBorder
        ]}
      >
        <View style={styles.rankLeft}>
          <Text style={styles.rankNumber}>{getRankEmoji(index)}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
        <View style={styles.rankRight}>
          <Text style={[
            styles.scoreText,
            index < 3 && { color: getRankBorderColor(index) }
          ]}>
            {score.toLocaleString()} pts
          </Text>
          {activeTab === 'lifetime' && highScore > 0 && (
            <Text style={styles.highScoreText}>Best: {highScore.toLocaleString()}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 LEADERBOARD</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'session' && styles.activeTab]}
          onPress={() => { setActiveTab('session'); setShowTop1000(false); }}
        >
          <Text style={[styles.tabText, activeTab === 'session' && styles.activeTabText]}>
            HIGH SCORE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lifetime' && styles.activeTab]}
          onPress={() => { setActiveTab('lifetime'); setShowTop1000(false); }}
        >
          <Text style={[styles.tabText, activeTab === 'lifetime' && styles.activeTabText]}>
            LIFETIME
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#00ffea" />
          <Text style={styles.loadingText}>Loading rankings...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
          
          {!showTop1000 && users.length >= 20 && (
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={() => setShowTop1000(true)}
            >
              <Text style={styles.expandButtonText}>View Top 1000</Text>
            </TouchableOpacity>
          )}
          
          {showTop1000 && (
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={() => setShowTop1000(false)}
            >
              <Text style={styles.expandButtonText}>Show Less</Text>
            </TouchableOpacity>
          )}
        </>
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
    fontSize: 14,
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
  expandButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#00ffea',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  expandButtonText: {
    color: '#00ffea',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: '#00ffea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
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
    flex: 1,
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
    marginRight: 10,
  },
  username: {
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
  highScoreText: {
    color: '#ff00ff',
    fontSize: 12,
    marginTop: 2,
  },
});

export default LeaderboardScreen;