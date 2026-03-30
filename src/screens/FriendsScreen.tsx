import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';

type Friend = {
  id: string;
  username: string;
  fullName: string;
};

type PendingRequest = {
  id: string;
  username: string;
  fromUserId: string;
};

const FriendsScreen = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);

  const loadFriends = async () => {
    try {
      if (!auth.currentUser) return;

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const friendIds = userDoc.data().friends || [];
        
        const friendsData: Friend[] = [];
        for (const friendId of friendIds) {
          const friendDoc = await getDoc(doc(db, 'users', friendId));
          if (friendDoc.exists()) {
            friendsData.push({
              id: friendId,
              username: friendDoc.data().username || 'Unknown',
              fullName: friendDoc.data().fullName || '',
            });
          }
        }
        setFriends(friendsData);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      if (!auth.currentUser) return;

      const requestsRef = collection(db, 'friendRequests');
      const q = query(
        requestsRef,
        where('toUserId', '==', auth.currentUser.uid),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      const requests: PendingRequest[] = [];

      for (const docSnap of snapshot.docs) {
        const fromUserDoc = await getDoc(doc(db, 'users', docSnap.data().fromUserId));
        if (fromUserDoc.exists()) {
          requests.push({
            id: docSnap.id,
            username: fromUserDoc.data().username || 'Unknown',
            fromUserId: docSnap.data().fromUserId,
          });
        }
      }

      setPendingRequests(requests);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!auth.currentUser) return;

              // Remove from current user's friends
              await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                friends: arrayRemove(friendId),
              });

              // Remove from friend's friends
              await updateDoc(doc(db, 'users', friendId), {
                friends: arrayRemove(auth.currentUser.uid),
              });

              // Reload friends list
              loadFriends();
            } catch (error) {
              console.error('Error removing friend:', error);
            }
          },
        },
      ]
    );
  };

  const handleAcceptRequest = async (request: PendingRequest) => {
    try {
      if (!auth.currentUser) return;

      // Add to current user's friends
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        friends: arrayUnion(request.fromUserId),
      });

      // Add to sender's friends
      await updateDoc(doc(db, 'users', request.fromUserId), {
        friends: arrayUnion(auth.currentUser.uid),
      });

      // Update request status (in a real app, you'd have a collection for this)
      // For now, just remove from local state
      setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
      loadFriends();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.username}>@{item.username}</Text>
        {item.fullName && (
          <Text style={styles.fullName}>{item.fullName}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFriend(item.id)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRequestItem = ({ item }: { item: PendingRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.requestInfo}>
        <Text style={styles.username}>@{item.username}</Text>
        <Text style={styles.requestText}>wants to be friends</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptRequest(item)}
        >
          <Text style={styles.acceptButtonText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleDeclineRequest(item.id)}
        >
          <Text style={styles.declineButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00ffea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 FRIENDS</Text>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests ({pendingRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'friends' ? (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No friends yet 😕 Search for players to add friends!
            </Text>
          }
        />
      ) : (
        <FlatList
          data={pendingRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No pending requests</Text>
          }
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#0a0a0a',
  },
  listContent: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#333',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff00ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#0a0a0a',
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendInfo: {
    flex: 1,
  },
  username: {
    color: '#00ffea',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullName: {
    color: '#ffff00',
    fontSize: 14,
    marginTop: 2,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff3333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ff00ff',
  },
  requestInfo: {
    flex: 1,
  },
  requestText: {
    color: '#ff00ff',
    fontSize: 14,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#00ffea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  declineButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#ff3333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#ff00ff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
});

export default FriendsScreen;