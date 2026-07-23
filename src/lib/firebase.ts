import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import firebaseConfigFile from "../../firebase-applet-config.json";

// Default configuration with Firestore database ID for cloud sync across Vercel and AI Studio
const defaultConfig = {
  projectId: "cool-filament-7cf5x",
  appId: "1:547265312606:web:76f31525591523cd42c1cf",
  apiKey: "AIzaSyCQZ44TkgWOgsXO98GNlum5Iq3FwMxB7Vk",
  authDomain: "cool-filament-7cf5x.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-corrotechmanager-28546091-b06d-4038-ab21-961bb9ebb398",
  storageBucket: "cool-filament-7cf5x.firebasestorage.app",
  messagingSenderId: "547265312606",
};

const config = firebaseConfigFile && firebaseConfigFile.projectId ? firebaseConfigFile : defaultConfig;

// Initialize Firebase App
const app = initializeApp(config);

// Initialize Firestore with custom database ID
export const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Subscribe to a live synchronized data store key in Firestore.
 * Auto-creates document with defaultData if document doesn't exist yet.
 * Also keeps local storage cached and fallback ready.
 */
export function subscribeToStore<T>(
  key: string,
  defaultData: T[],
  callback: (data: T[]) => void
): () => void {
  const docRef = doc(db, "corrotech_store", key);

  // 1. Initial immediate local storage fallback load
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        callback(parsed);
      }
    } catch (e) {
      console.warn(`Local storage parse failed for ${key}`, e);
    }
  } else {
    callback(defaultData);
  }

  // 2. Real-time Cloud Sync Listener
  const unsubscribe = onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          localStorage.setItem(key, JSON.stringify(data.items));
          callback(data.items);
        }
      } else {
        // First initialization in Cloud Firestore
        try {
          const initData = cached ? JSON.parse(cached) : defaultData;
          await setDoc(docRef, { items: initData, updatedAt: Date.now() });
          localStorage.setItem(key, JSON.stringify(initData));
          callback(initData);
        } catch (err) {
          console.warn(`Failed to seed Firestore key ${key}`, err);
          callback(defaultData);
        }
      }
    },
    (error) => {
      console.warn(`Firestore real-time subscription notice for ${key}:`, error);
      // Fallback to local storage on connection issues
      const local = localStorage.getItem(key);
      if (local) {
        try {
          callback(JSON.parse(local));
        } catch (e) {}
      }
    }
  );

  return unsubscribe;
}

/**
 * Persist updated array data to both Local Storage and Cloud Firestore in real time.
 */
export async function saveToStore<T>(key: string, data: T[]): Promise<void> {
  // Save to LocalStorage immediately for zero latency feedback
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`LocalStorage write error for ${key}`, e);
  }

  // Sync to Cloud Firestore
  try {
    const docRef = doc(db, "corrotech_store", key);
    await setDoc(docRef, { items: data, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.error(`Cloud sync error for ${key}`, err);
  }
}
