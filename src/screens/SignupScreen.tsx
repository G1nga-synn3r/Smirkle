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
import { validatePassword } from '../services/firebase/auth';

interface SignupScreenProps {
  onSignup: (email: string, password: string, username: string, birthdate: Date) => Promise<void>;
  onBackToLogin: () => void;
}

export default function SignupScreen({ onSignup, onBackToLogin }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState<Date>(new Date(new Date().setFullYear(new Date().getFullYear() - 14)));
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!email.trim() || !password || !username.trim()) {
      Alert.alert('Missing fields', 'Please enter email, password, and username.');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make sure both passwords are identical.');
      return false;
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
      return false;
    }

    const today = new Date();
    const age14 = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());
    if (birthdate > age14) {
      Alert.alert('Age restriction', 'You must be at least 14 years old to play Smirkle.');
      return false;
    }

    if (!agreedToTerms) {
      Alert.alert('Terms required', 'Please agree to the Terms of Service.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSignup(email.trim(), password, username.trim(), birthdate);
    } finally {
      setLoading(false);
    }
  };

  const showBirthdateSelector = () => {
    Alert.prompt(
      'Birthdate',
      'Enter your birthdate (YYYY-MM-DD)',
      [
        {
          text: 'Confirm',
          onPress: (dateString?: string) => {
            if (dateString) {
              const parts = dateString.split('-');
              if (parts.length === 3) {
                const [year, month, day] = parts.map((p: string) => parseInt(p, 10));
                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                  setBirthdate(new Date(year, month - 1, day));
                }
              }
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      'plain-text',
      birthdate.toISOString().split('T')[0]
    );
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
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Choose a username"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(validatePassword(text));
            }}
            placeholder="Create a password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            style={styles.input}
          />
          {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Birthdate</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={showBirthdateSelector}
          >
            <Text style={styles.dateText}>{birthdate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>I agree to the Terms of Service</Text>
        </TouchableOpacity>

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
  datePickerButton: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  dateText: {
    color: '#f8fafc',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#00ffea',
    borderColor: '#00ffea',
  },
  checkmark: {
    color: '#050816',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  primaryButton: {
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