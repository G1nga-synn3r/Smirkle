import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

// Constants
const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;
const MIN_AGE = 14;

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

    // Password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = 'Password must contain at least one symbol';
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

  // Handlers
  const handleSignUp = async () => {
    if (!validateSignUp()) return;
    setLoading(true);
    try {
      const { username, fullName, email, password } = form;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update profile with displayName
      await updateProfile(user, {
        displayName: `${fullName} (@${username})`,
      });

      // Create user document in Firirestore
      const userDoc = doc(firestore, 'users', user.uid);
      await setDoc(userDoc, {
        username,
        fullName,
        email,
        createdAt: new Date().toISOString(),
        lifetimeScore: 0,
        level: 0,
        badges: [],
      });

      // Navigate to Home
      navigation.replace('Home');
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'This email is already registered.');
      } else {
        Alert.alert('Error', error.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    setLoading(true);
    try {
      const { email, password } = form;
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Home');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'No user found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Incorrect password.');
      } else {
        Alert.alert('Error', error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Create anonymous user document in Firestore
      const userDoc = doc(firestore, 'users', user.uid);
      await setDoc(userDoc, {
        isAnonymous: true,
        createdAt: new Date().toISOString(),
        lifetimeScore: 0,
        level: 0,
        badges: [],
      });

      navigation.replace('Home');
    } catch (error: any) {
      console.error('Guest login error:', error);
      Alert.alert('Error', error.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>😎 SMIRKLE 😎</Text>
        <Text style={styles.subtitle}>Don't Smile Challenge</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            tab === 'login' && styles.tabActive,
          ]}
          onPress={() => setTab('login')}
        >
          <Text style={styles.tabText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            tab === 'signup' && styles.tabActive,
          ]}
          onPress={() => setTab('signup')}
        >
          <Text style={styles.tabText}>Signup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            tab === 'guest' && styles.tabActive,
          ]}
          onPress={() => setTab('guest')}
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
            ]}
            onPress={handleGuest}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.buttonText}>Playing...</Text>
            ) : (
              <Text style={styles.buttonText}>👻 Play as Guest</Text>
            )}
          </TouchableOpacity>
        )}

        {tab === 'signup' && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonSignup,
            ]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.buttonText}>Creating...</Text>
            ) : (
              <Text style={styles.buttonText}>🚀 Create Account</Text>
            )}
          </TouchableOpacity>
        )}

        {tab === 'login' && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonLogin,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.buttonText}>Logging in...</Text>
            ) : (
              <Text style={styles.buttonText}>🔑 Login</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {tab === 'login' && (
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <TouchableOpacity onPress={() => setTab('signup')}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </Text>
        )}
        {tab === 'signup' && (
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <TouchableOpacity onPress={() => setTab('login')}>
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
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    color: '#00ffea', // neon cyan
    fontWeight: 'bold',
    textShadowColor: '#ff00ff', // magenta glow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    letterSpacing: 2,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffff00', // neon yellow
    textShadowColor: '#00ffea',
    textShadowRadius: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  tabActive: {
    backgroundColor: '#00ffea', // neon cyan
  },
  tabText: {
    color: '#0a0a0a',
    fontWeight: '600',
    fontSize: 16,
  },
  formContainer: {
    gap: 15,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff00ff', // magenta for error
  },
  errorText: {
    color: '#ff00ff',
    fontSize: 12,
    marginTop: -5,
  },
  button: {
    backgroundColor: '#00ffea', // neon cyan
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonGuest: {
    backgroundColor: '#ff00ff', // magenta for guest
  },
  buttonSignup: {
    backgroundColor: '#00ffea', // neon cyan
  },
  buttonLogin: {
    backgroundColor: '#ffff00', // neon yellow
  },
  buttonText: {
    color: '#0a0a0a',
    fontWeight: 'bold',
    fontSize: 16,
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
    color: '#00ffea',
    fontWeight: '600',
  },
});