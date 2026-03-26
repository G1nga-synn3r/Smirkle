// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPKyJrtHCpBdj7FlepJXLHZPId5gBqs78",
  authDomain: "smirkle-922e2.firebaseapp.com",
  projectId: "smirkle-922e2",
  storageBucket: "smirkle-922e2.firebasestorage.app",
  messagingSenderId: "260360951119",
  appId: "1:260360951119:web:90bfb86aae8db5752c613a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;