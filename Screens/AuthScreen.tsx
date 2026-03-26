import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

const MIN_USERNAME_LENGTH = 3;
const MIN_AGE = 14;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

// Theme Constants
const COLORS = {
  background: '#0a0a0a',
  neonCyan: '#00ffea',
  neonYellow: '#ffff00',
  neonMagenta: '#ff00ff',
  errorRed: '#ff4d4d',
};

// Helper to calculate age from birthdate string (YYYY-MM-DD)
const calculateAge = (birthDateString: string): number => {
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export default function AuthScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<'login' | 'signup' | 'guest'>('login');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firebaseError, setFirebaseError] = useState<string>('');

  // Form state
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    birthdate: '',
    email: '',
    password: '',
  });

  // Validation
  const validateSignUp = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { username, fullName, birthdate, email, password } = form;

    // Username
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < MIN_USERNAME_LENGTH) {
      newErrors.username = `Username must be at least ${MIN_USERNAME_LENGTH} characters`;
    } else if (/\s/.test(username)) {
      newErrors.username = 'Username cannot contain spaces';
    }

    // Full name
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Birthdate
    if (!birthdate) {
      newErrors.birthdate = 'Birthdate is required';
    } else {
      const age = calculateAge(birthdate);
      if (age < MIN_AGE) {
        newErrors.birthdate = `You must be at least ${MIN_AGE} years old`;
      }
    }

    // Email
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password - Regex: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!PASSWORD_REGEX.test(password)) {
      newErrors.password = 'Password must be 8+ characters with uppercase, lowercase, number, and symbol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { email, password } = form;

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear Firebase error when switching tabs
  const handleTabChange = (newTab: 'login' | 'signup' | 'guest') => {
    setTab(newTab);
    setFirebaseError('');
    setErrors({});
  };

  const handleSignUp = async () => {
    if (!validateSignUp()) return;
    setLoading(true);
    setFirebaseError('');
    try {
      const { username, fullName, email, password } = form;
      
      // Normalize username: lowercase and no spaces
      const normalizedUsername = username.toLowerCase().replace(/\s/g, '');
      
      // Check if username already exists
      const usersRef = collection(db, 'users');
      const usernameQuery = query(usersRef, where('username', '==', normalizedUsername));
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        setFirebaseError('💀 This handle is already taken.');
        setLoading(false);
        return;
      }
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update profile with displayName
      await updateProfile(user, {
        displayName: `${fullName} (@${normalizedUsername})`,
      });

      // Create user document in Firestore
      const userDoc = doc(db, 'users', user.uid);
      await setDoc(userDoc, {
        username: normalizedUsername,
        fullName,
        birthdate: form.birthdate,
        createdAt: serverTimestamp(),
        lifetimeScore: 0,
        level: 0,
        badges: [],
      });

      // Navigate to MainTabs
      (navigation as any).navigate('MainTabs');
    } catch (error: any) {
      console.error('Signup error:', error);
      setFirebaseError(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    setLoading(true);
    setFirebaseError('');
    try {
      const { email, password } = form;
      await signInWithEmailAndPassword(auth, email, password);
      (navigation as any).navigate('Home');   
    } catch (error: any) {
      console.error('Login error:', error);
      setFirebaseError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    setFirebaseError('');
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      const guestUsername = `Guest_${user.uid.slice(0, 8)}`;

      // Create anonymous user document in Firestore
      const userDoc = doc(db, 'users', user.uid);
      await setDoc(userDoc, {
        username: guestUsername,
        isAnonymous: true,
        createdAt: serverTimestamp(),
        lifetimeScore: 0,
        level: 0,
        badges: [],
      });

      (navigation as any).navigate('Home');
    } catch (error: any) {
      console.error('Guest login error:', error);
      setFirebaseError(error.message || 'Guest login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>😎 SMIRKLE 😎</Text>
        <Text style={styles.subtitle}>Don't Smile Challenge 😁</Text>
      </View>

      {/* Tabs as big neon buttons */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            tab === 'login' && styles.tabActive,
          ]}
          onPress={() => handleTabChange('login')}
        >
          <Text style={styles.tabText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            tab === 'signup' && styles.tabActive,
          ]}
          onPress={() => handleTabChange('signup')}
        >
          <Text style={styles.tabText}>Signup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            tab === 'guest' && styles.tabActive,
          ]}
          onPress={() => handleTabChange('guest')}
        >
          <Text style={styles.tabText}>Guest</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {tab === 'signup' && (
          <>
            <TextInput
              style={[
                styles.input,
                errors.username && styles.inputError,
              ]}
              placeholder="Username"
              value={form.username}
              onChangeText={(text) => setForm({ ...form, username: text })}
              autoCapitalize="none"
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}

            <TextInput
              style={[
                styles.input,
                errors.fullName && styles.inputError,
              ]}
              placeholder="Full Name"
              value={form.fullName}
              onChangeText={(text) => setForm({ ...form, fullName: text })}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}

            <TextInput
              style={[
                styles.input,
                errors.birthdate && styles.inputError,
              ]}
              placeholder="Birthdate (YYYY-MM-DD)"
              value={form.birthdate}
              onChangeText={(text) => setForm({ ...form, birthdate: text })}
              keyboardType="default"
            />
            {errors.birthdate && (
              <Text style={styles.errorText}>{errors.birthdate}</Text>
            )}

            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError,
              ]}
              placeholder="Email"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              style={[
                styles.input,
                errors.password && styles.inputError,
              ]}
              placeholder="Password"
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </>
        )}

        {tab === 'login' && (
          <>
            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError,
              ]}
              placeholder="Email"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              style={[
                styles.input,
                errors.password && styles.inputError,
              ]}
              placeholder="Password"
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </>
        )}

        {/* Buttons */}
        {tab === 'guest' && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonGuest,
              styles.buttonShadow,
            ]}
            onPress={handleGuest}
            disabled={loading}
          >
              {loading ? (
              <>
                <ActivityIndicator size="small" color={COLORS.neonCyan} />
                <Text style={styles.buttonText}> Playing...</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>😎 Play as Guest 😎</Text>
            )}
          </TouchableOpacity>
        )}

        {tab === 'signup' && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonSignup,
              styles.buttonShadow,
            ]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color={COLORS.neonCyan} />
                <Text style={styles.buttonText}> Creating...</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>🔥 Create Account 🔥</Text>
            )}
          </TouchableOpacity>
        )}

        {tab === 'login' && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonLogin,
              styles.buttonShadow,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color={COLORS.neonCyan} />
                <Text style={styles.buttonText}> Logging in...</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>💀 Login 💀</Text>
            )}
          </TouchableOpacity>
        )}

        {firebaseError && (
          <Text style={styles.firebaseErrorText}>{firebaseError}</Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {tab === 'login' && (
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <TouchableOpacity onPress={() => handleTabChange('signup')}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </Text>
        )}
        {tab === 'signup' && (
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <TouchableOpacity onPress={() => handleTabChange('login')}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 60,
  },
  title: {
    fontSize: 38,
    color: COLORS.neonCyan,
    fontWeight: '900',
    textShadowColor: COLORS.neonMagenta,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.neonYellow,
    textShadowColor: COLORS.neonCyan,
    textShadowRadius: 8,
    fontWeight: '600',
    letterSpacing: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    borderWidth: 2,
    borderColor: COLORS.neonMagenta,
    borderRadius: 10,
    padding: 5,
  },
  tabButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    flex: 1,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.neonCyan,
    borderColor: COLORS.neonMagenta,
  },
  tabText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
    textShadowColor: COLORS.neonCyan,
    textShadowRadius: 5,
  },
  formContainer: {
    gap: 12,
    borderWidth: 2,
    borderColor: COLORS.neonCyan,
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#0d0d0d',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: COLORS.neonMagenta,
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    borderColor: COLORS.errorRed,
  },
  errorText: {
    color: COLORS.errorRed,
    fontSize: 12,
    marginTop: -5,
    fontWeight: '600',
    textShadowColor: COLORS.errorRed,
    textShadowRadius: 3,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 3,
  },
  buttonGuest: {
    backgroundColor: COLORS.neonMagenta,
    borderColor: COLORS.neonYellow,
  },
  buttonSignup: {
    backgroundColor: COLORS.neonCyan,
    borderColor: COLORS.neonMagenta,
  },
  buttonLogin: {
    backgroundColor: COLORS.neonYellow,
    borderColor: COLORS.neonCyan,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 2,
  },
  buttonShadow: {
    shadowColor: COLORS.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.neonCyan,
    fontWeight: '800',
    textShadowColor: COLORS.neonMagenta,
    textShadowRadius: 5,
  },
  firebaseErrorText: {
    color: COLORS.errorRed,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 15,
    textShadowColor: COLORS.errorRed,
    textShadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.errorRed,
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
  },
});