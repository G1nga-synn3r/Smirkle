import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface TutorialOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>😎 Welcome to Smirkle! 🎮</Text>

            <Text style={styles.section}>
              <Text style={styles.bold}>Smirkle is the high-energy "try not to laugh" challenge!</Text>
              {'\n\n'}
              Watch random funny YouTube videos while the front camera monitors your face.
            </Text>

            <Text style={styles.section}>
              <Text style={styles.bold}>How to Play:</Text>
              {'\n'}
              • Get face lock: Eyes open, neutral face, front camera only.
              {'\n'}
              • Start - survive to score +111 points per second!
              {'\n'}
              • PiP camera overlay tracks you.
              {'\n\n'}
              <Text style={styles.bold}>Fail Conditions (instant end):</Text>
              {'\n'}
              • Smile detected
              {'\n'}
               • Eyes closed more than 2s
              {'\n'}
              • Face leaves frame/obscured
              {'\n'}
              • Internet lost/video fail
            </Text>

            <Text style={styles.section}>
              <Text style={styles.bold}>Controls:</Text>
              {'\n'}
              • No pause/skip/rewind - pure challenge!
              {'\n'}
              • Warnings flash if close to fail.
              {'\n'}
              • Save high scores, climb leaderboards.
            </Text>

            <Text style={styles.footer}>Scroll up for full rules. Good luck! 💀</Text>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>GOT IT! Let&apos;s Play 😎</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    padding: 25,
    maxHeight: '90%',
    width: '95%',
    borderWidth: 3,
    borderColor: '#00ffea',
    shadowColor: '#00ffea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ff00ff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#00ffea',
    textShadowRadius: 15,
  },
  section: {
    fontSize: 16,
    color: '#ffff00',
    lineHeight: 24,
    marginBottom: 15,
    textShadowColor: '#ffff00',
    textShadowRadius: 8,
  },
  bold: {
    fontWeight: '900',
    color: '#00ffea',
  },
  footer: {
    fontSize: 14,
    color: '#00ffea',
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 10,
    textShadowColor: '#00ffea',
    textShadowRadius: 5,
  },
  closeButton: {
    backgroundColor: '#00ffea',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    borderWidth: 3,
    borderColor: '#ff00ff',
    alignItems: 'center',
    shadowColor: '#00ffea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 15,
  },
  closeButtonText: {
    color: '#0a0a0a',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
});

export default TutorialOverlay;
