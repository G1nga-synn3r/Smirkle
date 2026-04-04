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

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onGuestLogin: () => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  onSwitchToSignup: () => void;
}

export default function LoginScreen({ onLogin, onGuestLogin, onForgotPassword, onSwitchToSignup }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onLogin(email.trim(), password);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    Alert.alert(
      'Guest access age confirmation',
      'Guest login is available for users 14 years or older. Continue as a guest?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I am 14+',
          onPress: async () => {
            setLoading(true);
            try {
              await onGuestLogin();
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>SMIRKLE</Text>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subheading}>Sign in to continue your smile-powered adventure.</Text>

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
            placeholder="Enter your password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#050816" />
          ) : (
            <Text style={styles.primaryButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>or continue with</Text>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleGuest} disabled={loading}>
          <Text style={styles.secondaryButtonText}>Continue as guest</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => onForgotPassword(email)} disabled={loading}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={onSwitchToSignup} disabled={loading}>
          <Text style={styles.linkButtonText}>Create a new account</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Use your Firebase credentials to sign in, or continue as a guest if you are 14+.
        </Text>
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
  orText: {
    marginTop: 20,
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 0.8,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  socialButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  socialButtonText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '700',
  },
  forgotPasswordButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#7dd3fc',
    fontSize: 14,
    fontWeight: '700',
  },
  footerText: {
    marginTop: 22,
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});