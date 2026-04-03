import React, { useState } from 'react';
import { Modal, View, ScrollView, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function TutorialOverlay() {
  const [visible, setVisible] = useState(true);

  // Placeholder for front-camera detection logic (Face/Eyes)
  // Placeholder for score incrementing at 111 points per second
  // Placeholder for 'Fail' message logic if the user smiles or leaves the frame

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          horizontal={false} // Allow vertical scrolling primarily
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          zoomEnabled={true} // Enable pinch-to-zoom for panning
          maximumZoomScale={3}
          minimumZoomScale={0.5}
        >
          <Image
            source={require('../../assets/tutorial-flowchart.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </ScrollView>
        <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
          <Text style={styles.closeText}>Got it!</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent dark background
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#00ffea',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ffff00',
  },
  closeText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});