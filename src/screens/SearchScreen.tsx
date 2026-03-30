import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const COLORS = {
  background: '#0a0a0a',
  neonCyan: '#00ffea',
  neonYellow: '#ffff00',
  neonMagenta: '#ff00ff',
};

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const q = query(
        collection(db, 'users'),
        where('username', '>=', searchTerm),
        where('username', '<=', searchTerm + '\uf8ff'),
        where('isGuest', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      const foundUsers = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        foundUsers.push({
          uid: doc.id,
          username: data.username,
          profileImageUrl: data.profileImageUrl || null,
          level: data.level || 0,
        });
      });
      
      setUsers(foundUsers);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userUid) => {
    navigation.navigate('Profile', { userId: userUid });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search for players..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={searchUsers}
          autoCapitalize="none"
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchUsers}>
          <Text style={styles.searchButtonText}>SEARCH</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && !searchTerm ? (
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color={COLORS.neonCyan} />
        </View>
      ) : loading && searchTerm ? (
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color={COLORS.neonCyan} />
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {users.length > 0 ? (
            <FlatList
              data={users}
              keyExtractor={(item) => item.uid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userCard}
                  onPress={() => handleSelectUser(item.uid)}
                >
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
                      <Text style={styles.levelText}>
                        Level {item.level}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              }
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Enter a username to search</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: COLORS.neonCyan,
    borderRadius: 12,
    padding: 15,
    color: COLORS.neonCyan,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: COLORS.neonCyan,
    borderWidth: 2,
    borderColor: COLORS.neonMagenta,
    borderRadius: 12,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  searchButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    padding: 15,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#ff0000',
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff0000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    marginTop: 10,
  },
  userCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: COLORS.neonYellow,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 18,
  },
  levelText: {
    color: COLORS.neonYellow,
    fontSize: 14,
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