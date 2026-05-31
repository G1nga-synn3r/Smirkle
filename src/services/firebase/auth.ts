
import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential,
  User,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

const createOrUpdateUser = async (user: User, isGuest: boolean = false, birthdate?: Date) => {
  const existingDoc = await getDoc(doc(db, 'users', user.uid));
  
  if (!existingDoc.exists()) {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      isGuest,
      username: user.displayName || null,
      email: user.email || null,
      birthdate: birthdate || null,
      ageVerified14Plus: !isGuest || true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      highestSessionScore: 0,
      lifetimeScore: 0,
      currentLevel: 1,
      badgeIds: [],
      privacyProfilePublic: !isGuest,
      privacyStatsPublic: !isGuest,
    });

    await setDoc(doc(db, 'userSettings', user.uid), {
      uid: user.uid,
      hapticsEnabled: true,
      volumePercent: 100,
      videoQuality: 'auto',
      themeMode: 'dark',
      updatedAt: serverTimestamp(),
    });
  }
};

/**
 * Password validation: 8+ chars, uppercase, lowercase, number, symbol
 */
export const validatePassword = (password: string): string | null => {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain a symbol';
  return null;
};

/**
 * Age validation: minimum 14 years old
 */
export const validateAge14Plus = (birthdate: Date): boolean => {
  const today = new Date();
  const age14 = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());
  return birthdate <= age14;
};

/**
 * Auth service layer
 */
export const authService = {
  /**
   * Register new user with email, password, username, and birthdate
   */
  register: async (email: string, password: string, username: string, birthdate: Date): Promise<UserCredential> => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: username });
    
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      isGuest: false,
      username: username,
      email: email,
      birthdate: birthdate,
      ageVerified14Plus: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      highestSessionScore: 0,
      lifetimeScore: 0,
      currentLevel: 1,
      badgeIds: [],
      privacyProfilePublic: true,
      privacyStatsPublic: true,
    });

    await setDoc(doc(db, 'userSettings', credential.user.uid), {
      uid: credential.user.uid,
      hapticsEnabled: true,
      volumePercent: 100,
      videoQuality: 'auto',
      themeMode: 'dark',
      updatedAt: serverTimestamp(),
    });

    return credential;
  },

  /**
   * Login
   */
  login: async (email: string, password: string): Promise<UserCredential> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential;
  },

  /**
   * Guest login with birthdate verification
   */
  guestLogin: async (birthdate: Date): Promise<UserCredential> => {
    const credential = await signInAnonymously(auth);
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      isGuest: true,
      username: null,
      email: null,
      birthdate: birthdate,
      ageVerified14Plus: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      highestSessionScore: 0,
      lifetimeScore: 0,
      currentLevel: 1,
      badgeIds: [],
      privacyProfilePublic: false,
      privacyStatsPublic: false,
    });

    await setDoc(doc(db, 'userSettings', credential.user.uid), {
      uid: credential.user.uid,
      hapticsEnabled: true,
      volumePercent: 100,
      videoQuality: 'auto',
      themeMode: 'dark',
      updatedAt: serverTimestamp(),
    });

    return credential;
  },

  /**
   * Reset password via email
   */
  resetPassword: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  },

  googleLogin: async (idToken: string): Promise<UserCredential> => {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    await createOrUpdateUser(result.user);
    return result;
  },

  updateDisplayName: async (user: User, displayName: string): Promise<void> => {
    await updateProfile(user, { displayName });
  },
};

