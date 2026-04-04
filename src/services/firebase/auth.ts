
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential,
  User
} from 'firebase/auth';

/**
 * Auth service layer
 */
export const authService = {
  /**
   * Register new user
   */
  register: async (email: string, password: string): Promise<UserCredential> => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
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
   * Guest login
   */
  guestLogin: async (): Promise<UserCredential> => {
    const credential = await signInAnonymously(auth);
    return credential;
  },

  /**
   * Reset password via email
   */
  resetPassword: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Update profile display name
   */
  updateDisplayName: async (user: User, displayName: string): Promise<void> => {
    await updateProfile(user, { displayName });
  },
};

