import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For development/testing - replace with your real Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDemoApiKey-Replace-With-Your-Real-Key",
  authDomain: "serenresidential-app.firebaseapp.com",
  projectId: "serenresidential-app", 
  storageBucket: "serenresidential-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo-app-id"
};

// Initialize Firebase app
let app;
let db;
let storage;
let auth;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore
  db = getFirestore(app);
  
  // Initialize Storage
  storage = getStorage(app);
  
  // Initialize Auth with AsyncStorage persistence
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (authError) {
    console.warn('Firebase Auth initialization failed, using fallback:', authError);
    // Create a mock auth object for development
    auth = {
      currentUser: null,
      onAuthStateChanged: () => () => {},
      signInWithEmailAndPassword: () => Promise.reject(new Error('Auth not configured')),
      createUserWithEmailAndPassword: () => Promise.reject(new Error('Auth not configured')),
      signOut: () => Promise.reject(new Error('Auth not configured'))
    };
  }
  
} catch (error) {
  console.warn('Firebase initialization failed, using offline mode:', error);
  
  // Create mock objects for development/testing
  db = {
    collection: () => ({
      doc: () => ({
        set: () => Promise.resolve(),
        get: () => Promise.resolve({ exists: false, data: () => null }),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve(),
        onSnapshot: () => () => {}
      }),
      add: () => Promise.resolve({ id: 'mock-id' }),
      where: () => ({
        get: () => Promise.resolve({ docs: [], empty: true })
      }),
      orderBy: () => ({
        get: () => Promise.resolve({ docs: [], empty: true }),
        onSnapshot: () => () => {}
      }),
      onSnapshot: () => () => {}
    })
  };
  
  storage = {
    ref: () => ({
      child: () => ({
        put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } })
      })
    })
  };
  
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error('Auth not configured')),
    createUserWithEmailAndPassword: () => Promise.reject(new Error('Auth not configured')),
    signOut: () => Promise.reject(new Error('Auth not configured'))
  };
}

// Multi-tenant dashboard communication helper
export const dashboardConfig = {
  collections: {
    // Core multi-tenant collections
    estates: 'estates',
    estateAdmins: 'estate_admins',
    
    // Estate-specific collections (will be filtered by estateId)
    alerts: 'estate_alerts',
    complaints: 'complaints', 
    users: 'users',
    subscriptions: 'subscriptions',
    announcements: 'announcements',
    maintenance: 'maintenance_requests',
    visitors: 'visitors',
    incidents: 'security_incidents',
    
    // System-wide collections
    dashboardUsers: 'dashboard_users',
    systemLogs: 'system_logs'
  },
  realtime: {
    enablePersistence: true,
    enableNetwork: true,
    enableOfflineSupport: true
  },
  multiTenant: {
    enabled: true,
    estateFieldName: 'estateId',
    isolationLevel: 'strict' // 'strict' | 'loose'
  }
};

export { db, storage, auth };
export default app; 