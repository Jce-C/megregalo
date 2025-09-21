import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let db: admin.firestore.Firestore | null = null;

export function initializeFirestore() {
  if (admin.apps.length === 0) {
    // Check if we have Firebase credentials
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.log("Firebase credentials not found, falling back to in-memory storage");
      return null;
    }

    try {
      // Initialize with service account credentials
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      db = admin.firestore();
      console.log("Firebase Firestore initialized successfully");
      return db;
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      console.log("Falling back to in-memory storage");
      return null;
    }
  } else {
    db = admin.firestore();
    return db;
  }
}

export function getDB() {
  return db;
}