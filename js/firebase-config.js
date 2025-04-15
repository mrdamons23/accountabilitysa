/**
 * Firebase Configuration for Accountability SA
 * IMPORTANT: Replace these placeholder values with your actual Firebase project details
 * from the Firebase Console (https://console.firebase.google.com/)
 */

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzrITPCOkQFMbqqLzxDHF92dfNrbRxwRE",
  authDomain: "accountability-sa.firebaseapp.com",
  projectId: "accountability-sa",
  storageBucket: "accountability-sa.firebasestorage.app",
  messagingSenderId: "992633651470",
  appId: "1:992633651470:web:1fdf636fad40bed7ea175f",
  measurementId: "G-9CPEHDYNZS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase
function initializeFirebase() {
  // Check if Firebase is already initialized to prevent multiple initializations
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Enable persistence for Firestore to allow offline functionality
  firebase.firestore().enablePersistence({ synchronizeTabs: true })
    .catch(err => {
      console.warn('Firebase persistence couldn\'t be enabled:', err.code);
    });
    
  console.log('Firebase initialized successfully');
  
  // Initialize Firebase Auth UI if available
  if (typeof firebaseui !== 'undefined') {
    initializeFirebaseAuthUI();
  }
}

// Initialize Firebase Auth UI for a better sign-in experience
function initializeFirebaseAuthUI() {
  const uiConfig = {
    signInSuccessUrl: 'account.html',
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
    tosUrl: 'terms.html',
    privacyPolicyUrl: 'privacy.html'
  };

  // Initialize the FirebaseUI Widget using Firebase
  const ui = new firebaseui.auth.AuthUI(firebase.auth());
  
  // The start method will wait until the DOM is loaded
  const authContainer = document.getElementById('firebaseui-auth-container');
  if (authContainer) {
    ui.start('#firebaseui-auth-container', uiConfig);
  }
}

// Listen for auth state changes
function setupAuthStateListener() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log('User is signed in:', user.email);
      saveUserDataToFirestore(user);
    } else {
      console.log('User is signed out');
    }
    
    // Notify the auth service of state change
    if (typeof AuthService !== 'undefined') {
      AuthService.handleFirebaseAuthChange(user);
    }
  });
}

// Save user data to Firestore for persistence
function saveUserDataToFirestore(user) {
  const db = firebase.firestore();
  const userData = {
    email: user.email,
    displayName: user.displayName || 'Anonymous User',
    photoURL: user.photoURL || 'images/avatars/sa-flag-default.jpg',
    lastLogin: new Date().toISOString(),
    uid: user.uid
  };
  
  // Set the user document with merge option to preserve existing data
  db.collection('users').doc(user.uid).set(userData, { merge: true })
    .then(() => {
      console.log('User profile updated in Firestore');
    })
    .catch(error => {
      console.error('Error updating user profile:', error);
    });
}

// Wait for document to be ready then initialize Firebase
document.addEventListener('DOMContentLoaded', function() {
  // Check if Firebase SDK is loaded
  if (typeof firebase !== 'undefined') {
    initializeFirebase();
    setupAuthStateListener();
  } else {
    console.error('Firebase SDK not loaded. Make sure to include the Firebase SDK scripts.');
  }
}); 