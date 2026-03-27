// firebase.ts
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore, collection, FieldValue, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyCPKyJrtHCpBdj7FlepJXLHZPId5gBqs78",
  authDomain: "smirkle-922e2.firebaseapp.com",
  projectId: "smirkle-922e2",
  storageBucket: "smirkle-922e2.firebasestorage.app",
  messagingSenderId: "260360951119",
  appId: "1:260360951119:web:90bfb86aae8db5752c613a",
  measurementId: "G-0GETYX9BL1"
};

const app = initializeApp(firebaseConfig);

// Initialize auth without react-native persistence shim
export const auth = initializeAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

export const firebase = {
  auth: () => auth,
  firestore: () => db,
  storage: () => storage,
  collection: (name: string) => collection(db, name),
  FieldValue: {
    serverTimestamp: () => serverTimestamp(),
  },
};

export { FieldValue, serverTimestamp };

export const analytics = getAnalytics(app);