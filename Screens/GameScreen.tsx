import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

const GameScreen = ({ navigation }: any) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>SESSION: ACTIVE 💀</Text>
        </View>
        
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>⚠️ CAMERA ACCESS DENIED</Text>
          <Text style={styles.warningSubtext}>
            SYSTEM LOCKDOWN ACTIVE
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={requestPermission}
          >
            <Text style={styles.retryButtonText}>REQUEST ACCESS</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>ABORT MISSION 🚪</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>SESSION: ACTIVE 💀</Text>
        </View>
        
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.placeholderText}>📸 NO DEVICE FOUND</Text>
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>ABORT MISSION 🚪</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>SESSION: ACTIVE 💀</Text>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          onInitialized={() => setIsReady(true)}
        />
        
        <View style={styles.scanOverlay}>
          <View style={styles.scanBox}>
            <Text style={styles.scanText}>SCANNING</Text>
            <View style={styles.scanLine} />
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>ABORT MISSION 🚪</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContainer: {
    marginTop: 40,
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ff00ff',
  },
  title: {
    color: '#ff00ff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00ffea',
    shadowColor: '#00ffea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 200,
    height: 150,
    borderWidth: 3,
    borderColor: '#00ffea',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#00ffea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  scanText: {
    color: '#00ffea',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
    textShadowColor: '#00ffea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scanLine: {
    width: 150,
    height: 2,
    backgroundColor: '#00ffea',
    marginTop: 10,
    shadowColor: '#00ffea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  warningContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#ff3333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff3333',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  warningText: {
    color: '#ff3333',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: '#ff3333',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  warningSubtext: {
    color: '#ff3333',
    fontSize: 14,
    marginTop: 10,
    fontFamily: 'monospace',
    opacity: 0.8,
  },
  retryButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    backgroundColor: '#331111',
    borderWidth: 1,
    borderColor: '#ff3333',
  },
  retryButtonText: {
    color: '#ff3333',
    fontWeight: 'bold',
  },
  cameraPlaceholder: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#00ffea',
    borderStyle: 'dashed',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00ffea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  placeholderText: {
    color: '#00ffea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subText: {
    color: '#ffff00',
    fontSize: 12,
    marginTop: 10,
    fontFamily: 'monospace',
  },
  backButton: {
    marginBottom: 40,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#ff4d4d',
  },
  backButtonText: {
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
});

export default GameScreen;