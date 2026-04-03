import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

type SearchResult = {
  id: string;
  username: string;
  fullName: string;
};

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('username', '>=', searchQuery.toLowerCase()),
        where('username', '<=', searchQuery.toLowerCase() + '\uf8ff')
      );

      const snapshot = await getDocs(q);
      const userData: SearchResult[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          username: doc.data().username || 'Unknown',
          fullName: doc.data().fullName || '',
        }))
        .filter((user) => user.username !== 'guest');

      setResults(userData);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity className="flex-row items-center bg-midnight-surface p-4 rounded-xl mb-2.5 border-2 border-midnight-gray-dark">
      <View className="w-12.5 h-12.5 rounded-3xl bg-neon-magenta justify-center items-center mr-4">
        <Text className="text-xl font-bold text-midnight-bg">
          {item.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-neon-cyan"
          style={{ textShadowColor: '#00ffea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 }}
        >
          @{item.username}
        </Text>
        {item.fullName && (
          <Text className="text-sm text-neon-yellow mt-0.5">{item.fullName}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-midnight-bg p-5">
      <Text className="text-2xl font-bold text-neon-yellow text-center mb-5"
        style={{ textShadowColor: '#ffff00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}
      >
        🔍 SEARCH PLAYERS
      </Text>

      <View className="flex-row mb-5 gap-2.5">
        <TextInput
          className="flex-1 bg-midnight-surface border-2 border-neon-magenta rounded-xl p-3 text-neon-cyan text-base"
          placeholder="Enter username..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity className="bg-neon-cyan rounded-xl py-3 px-5 justify-center" onPress={handleSearch}>
          <Text className="text-midnight-bg font-bold text-sm">Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00ffea" />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            searched ? (
              <Text className="text-base text-neon-magenta text-center mt-7.5">No players found 😕</Text>
            ) : null
          }
        />
      )}
    </View>
  );
};



export default SearchScreen;