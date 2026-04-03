import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, doc, getDoc, updateDoc, arrayUnion, arrayRemove, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';

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
    <View className="flex-row items-center bg-midnight-surface p-4 rounded-xl mb-2.5 border-2 border-midnight-gray-dark">
      <View className="w-12.5 h-12.5 rounded-3xl bg-neon-magenta justify-center items-center mr-4">
        <Text className="text-xl font-bold text-midnight-bg">
          {item.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-neon-cyan">@{item.username}</Text>
        {item.fullName && (
          <Text className="text-sm text-neon-yellow mt-0.5">{item.fullName}</Text>
        )}
      </View>
      <TouchableOpacity
        className="w-7.5 h-7.5 rounded-2xl bg-error-red justify-center items-center"
        onPress={() => handleRemoveFriend(item.id)}
      >
        <Text className="font-bold text-white">✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRequestItem = ({ item }: { item: PendingRequest }) => (
    <View className="flex-row items-center bg-midnight-surface p-4 rounded-xl mb-2.5 border-2 border-neon-magenta">
      <View className="w-12.5 h-12.5 rounded-3xl bg-neon-magenta justify-center items-center mr-4">
        <Text className="text-xl font-bold text-midnight-bg">
          {item.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-neon-cyan">@{item.username}</Text>
        <Text className="text-sm text-neon-magenta mt-0.5">wants to be friends</Text>
      </View>
      <View className="flex-row gap-2.5">
        <TouchableOpacity
          className="w-8.75 h-8.75 rounded-4xl bg-neon-cyan justify-center items-center"
          onPress={() => handleAcceptRequest(item)}
        >
          <Text className="text-lg font-bold text-midnight-bg">✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-8.75 h-8.75 rounded-4xl bg-error-red justify-center items-center"
          onPress={() => handleDeclineRequest(item.id)}
        >
          <Text className="text-lg font-bold text-white">✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-midnight-bg p-5">
        <ActivityIndicator size="large" color="#00ffea" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-midnight-bg p-5">
      <Text className="text-2xl font-bold text-neon-yellow text-center mb-5"
        style={{ textShadowColor: '#ffff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}
      >
        👥 FRIENDS
      </Text>

      {/* Tab Selector */}
      <View className="flex-row mb-5 bg-midnight-surface rounded-2xl p-1.25">
        <TouchableOpacity
          className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'friends' ? 'bg-neon-cyan' : ''}`}
          onPress={() => setActiveTab('friends')}
        >
          <Text className={`text-sm font-bold ${activeTab === 'friends' ? 'text-midnight-bg' : 'text-midnight-gray'}`}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'requests' ? 'bg-neon-cyan' : ''}`}
          onPress={() => setActiveTab('requests')}
        >
          <Text className={`text-sm font-bold ${activeTab === 'requests' ? 'text-midnight-bg' : 'text-midnight-gray'}`}>
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
            <Text className="text-base text-neon-magenta text-center mt-7.5">
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
            <Text className="text-base text-neon-magenta text-center mt-7.5">No pending requests</Text>
          }
        />
      )}
    </View>
  );
};



export default FriendsScreen;