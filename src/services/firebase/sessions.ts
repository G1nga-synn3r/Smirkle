import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  getDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { Session } from '../../types/session';

export const sessionService = {
  createSession: async (initialData: Partial<Session>): Promise<string> => {
    const sessionRef = await addDoc(collection(db, 'sessions'), {
      ...initialData,
      startedAt: serverTimestamp(),
    });
    return sessionRef.id;
  },

  updateSession: async (sessionId: string, data: Partial<Session>): Promise<void> => {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      ...data,
      endedAt: serverTimestamp(),
    });
  },

  endSession: async (
    sessionId: string,
    score: number,
    completedSuccessfully: boolean,
    failReason?: string
  ): Promise<void> => {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      endedAt: serverTimestamp(),
      score,
      completedSuccessfully,
      failReason: failReason || null,
    });
  },
};