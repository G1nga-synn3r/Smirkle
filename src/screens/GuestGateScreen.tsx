import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';

interface GuestGateScreenProps {
  onConfirmAge: (birthdate: Date) => void;
  onBackToLogin: () => void;
}

export default function GuestGateScreen({ onConfirmAge, onBackToLogin }: GuestGateScreenProps) {
  const [birthdate, setBirthdate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 14)));
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [ageValid, setAgeValid] = useState(true);

  const handleBirthdateChange = (year: number, month: number, day: number) => {
    const newDate = new Date(year, month, day);
    setBirthdate(newDate);
    const today = new Date();
    const age14 = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());
    setAgeValid(newDate <= age14);
  };

  const handleContinue = () => {
    if (!ageValid) {
      Alert.alert('Age restriction', 'You must be at least 14 years old to play Smirkle.');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Terms required', 'Please agree to the Terms of Service to continue.');
      return;
    }
    onConfirmAge(birthdate);
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
                  handleBirthdateChange(year, month - 1, day);
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
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.brand}>SMIRKLE</Text>
        <Text style={styles.heading}>Guest Access</Text>
        <Text style={styles.subheading}>
          Guest mode is available for users 14 years and older.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Birthdate</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={showBirthdateSelector}
          >
            <Text style={styles.dateText}>{birthdate.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {!ageValid && (
            <Text style={styles.errorText}>You must be at least 14 years old.</Text>
          )}
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

        <TouchableOpacity
          style={[styles.primaryButton, (!ageValid || !agreedToTerms) && styles.primaryButtonDisabled]}
          onPress={handleContinue}
          disabled={!ageValid || !agreedToTerms}
        >
          <Text style={styles.primaryButtonText}>Continue as Guest</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
          <Text style={styles.backButtonText}>Back to sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  primaryButtonDisabled: {
    backgroundColor: '#334155',
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