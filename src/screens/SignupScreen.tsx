import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

interface SignupScreenProps {
  onSignup: (email: string, password: string) => Promise<void>;
  onBackToLogin: () => void;
}

export default function SignupScreen({ onSignup, onBackToLogin }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make sure both passwords are identical.');
      return;
    }

    setLoading(true);
    try {
      await onSignup(email.trim(), password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>SMIRKLE</Text>
        <Text style={styles.heading}>Create an account</Text>
        <Text style={styles.subheading}>Sign up now and unlock the full SMIRKLE experience.</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#050816" />
          ) : (
            <Text style={styles.primaryButtonText}>Create account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={onBackToLogin} disabled={loading}>
          <Text style={styles.backButtonText}>Back to login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 32,
    padding: 26,
    backgroundColor: '#10142d',
    borderWidth: 2,
    borderColor: '#00ffea',
    shadowColor: '#00ffea',
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
  brand: {
    color: '#00ffea',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  heading: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subheading: {
    color: '#cbd5e1',
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    color: '#94a3b8',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#f8fafc',
    fontSize: 16,
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: '#00ffea',
    borderRadius: 20,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#050816',
    fontSize: 17,
    fontWeight: '800',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#00ffea',
    fontSize: 16,
    fontWeight: '700',
  },
});