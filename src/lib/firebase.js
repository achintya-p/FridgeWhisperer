import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDyYOJPB1RARmLXcVrYc8xj7SN3T0_bDD4",
  authDomain: "fridgewhisper.firebaseapp.com",
  projectId: "fridgewhisper",
  storageBucket: "fridgewhisper.appspot.com",
  messagingSenderId: "702372787407",
  appId: "1:702372787407:web:f9d5c5d15c33d32d59f3ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

// Initialize Firestore
const db = getFirestore(app);

// Configure Google Provider with custom parameters
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider, db }; 