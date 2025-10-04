import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your Firebase config
// Get these values from Firebase Console > Project Settings > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1_LVYWOFNtGybnhcllFUCqlWkPoMQYGw",
  authDomain: "budgly-52da6.firebaseapp.com",
  projectId: "budgly-52da6",
  storageBucket: "budgly-52da6.firebasestorage.app",
  messagingSenderId: "83880397011",
  appId: "1:83880397011:web:4124048ccda1a0ac53ac26",
  measurementId: "G-ZTV7N9VL3V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
