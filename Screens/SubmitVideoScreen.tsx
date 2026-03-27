import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { firebase, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { validateYouTubeUrl } from '../utils/videoService';

const SubmitVideoScreen = () => {
  const [youtubeLink, setYoutubeLink] = useState('');
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');

  const handleSubmit = async () => {
    // Basic validation
    if (!youtubeLink || !title || !keywords) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate YouTube URL
    if (!validateYouTubeUrl(youtubeLink)) {
      Alert.alert('Error', 'Please enter a valid YouTube URL');
      return;
    }

    try {
      // Get current user UID (assuming firebase auth is set up)
      const uid = firebase.auth().currentUser?.uid;
      if (!uid) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      // Save to Firestore
      await addDoc(collection(db, 'videos'), {
        youtubeLink,
        title,
        keywords: keywords.split(',').map((k: string) => k.trim()),
        approved: false,
        submittedBy: uid,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Video submitted for approval');
      // Reset form
      setYoutubeLink('');
      setTitle('');
      setKeywords('');
    } catch (error) {
      console.error('Error submitting video: ', error);
      Alert.alert('Error', 'Failed to submit video');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit a Video</Text>
      
      {/* Neon Guidelines Warning */}
      <Text style={styles.guidelinesWarning}>
        14+ Content Only. No NSFW. No gore. 😎
      </Text>

      <TextInput
        style={styles.input}
        placeholder="YouTube Link"
        value={youtubeLink}
        onChangeText={setYoutubeLink}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Keywords (comma separated)"
        value={keywords}
        onChangeText={setKeywords}
      />
      <Button title="Submit Video" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  guidelinesWarning: {
    color: '#ff00ff', // Neon pink/magenta
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});

export default SubmitVideoScreen;