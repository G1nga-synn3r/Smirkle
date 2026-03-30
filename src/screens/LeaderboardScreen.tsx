import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const COLORS = {
  background: '#0a0a0a',
  neonCyan: '#00ffea',
  neonYellow: '#ffff00',
  neonMagenta: '#ff00ff',
};

export default function LeaderboardScreen() {
  const navigation = useNavigation();
  const [sessionLeaderboard, setSessionLeaderboard] = useState([]);
  const [lifetimeLeaderboard, setLifetimeLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('session'); // 'session' or 'lifetime'

  const fetchLeaderboard = async (type) => {
    setLoading(true);
    try {
      let q;
      if (type === 'session') {
        q = query(
          collection(db, 'users'),
          orderBy('highestSessionScore', 'desc'),
          limit(100)
        );
      } else {
        q = query(
          collection(db, 'users'),
          orderBy('lifetimeScore', 'desc'),
          limit(100)
        );
      }

      const querySnapshot = await getDocs(q);
      const leaderboard = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leaderboard.push({
          uid: doc.id,
          username: data.username || 'Anonymous',
          profileImageUrl: data.profileImageUrl || null,
          score: type === 'session' ? data.highestSessionScore : data.lifetimeScore,
          level: data.level || 1,
        });
      });

      if (type === 'session') {
        setSessionLeaderboard(leaderboard);
      } else {
        setLifetimeLeaderboard(leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard(activeTab);
  };

  const renderItem = ({ item }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#{item.index}</Text>
      </View>
      <View style={styles.userInfo}>
        {item.profileImageUrl ? (
          <View style={styles.profileImage}>
            {/* Image would go here */}
          </View>
        ) : (
          <View style={styles.defaultProfileImage}>
            <Text style={styles.initialsText}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.userDetails}>
          <Text style={styles.usernameText}>{item.username}</Text>
          <Text style={styles.levelText}>Level {item.level}</Text>
        </View>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{item.score.toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'session' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('session')}
        >
          <Text style={styles.tabButtonText}>Session High Scores</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'lifetime' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('lifetime')}
        >
          <Text style={styles.tabButtonText}>Lifetime Scores</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color={COLORS.neonCyan} />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'session' ? sessionLeaderboard : lifetimeLeaderboard}
          keyExtractor={(item, index) => `${item.uid}-${index}`}
          renderItem={({ item, index }) => renderItem({ item, index: index + 1 })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No data available</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  tabButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: COLORS.neonCyan,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  activeTab: {
    backgroundColor: COLORS.neonCyan,
  },
  tabButtonText: {
    color: activeTab === 'session' ? COLORS.background : COLORS.neonCyan,
    fontWeight: 'bold',
    fontSize: 16,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    color: COLORS.neonYellow,
    fontWeight: 'bold',
    fontSize: 18,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.neonCyan,
    marginRight: 15,
  },
  defaultProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.neonCyan,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  initialsText: {
    color: COLORS.neonCyan,
    fontWeight: 'bold',
    fontSize: 24,
  },
  userDetails: {
    flex: 1,
  },
  usernameText: {
    color: COLORS.neonCyan,
    fontWeight: 'bold',
    fontSize: 16,
  },
  levelText: {
    color: COLORS.neonYellow,
    fontSize: 14,
  },
  scoreContainer: {
    width: 100,
    alignItems: 'flex-end',
  },
  scoreText: {
    color: COLORS.neonYellow,
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});